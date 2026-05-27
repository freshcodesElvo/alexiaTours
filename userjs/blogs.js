// Expose the function globally to the orchestration engine
window.displayBlogs = async function() {
    const blogGrid = document.getElementById("blog-grid");
    if (!blogGrid) return; 

    // Dynamically look for API_BLOGS from your updated config.js
    const fetchTarget = typeof API_BLOGS !== 'undefined' ? API_BLOGS : "https://alexia-tours-backend-production.up.railway.app/api/blogs";

    try {
        const res = await fetch(fetchTarget);
        if (!res.ok) throw new Error("Could not download article data list.");
        
        const blogs = await res.json();
        blogGrid.innerHTML = "";
        
        if (blogs.length === 0) {
            blogGrid.innerHTML = `<div class="col-12 text-center text-muted py-4"><p class="small text-uppercase tracking-wider mb-0">No articles published yet.</p></div>`;
            return;
        }

        // Limit to top 3 articles for the home row preview
        const displayBlogs = blogs.slice(0, 3);

        blogGrid.innerHTML = displayBlogs.map(blog => {
            const date = new Date(blog.created_at).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            });

            // ─── ACCURATE ASSET RESOLUTION LAYER ───
            let imageSrc = 'assets/images/placeholder.jpg';
            
            if (blog.image_path) {
                if (blog.image_path.startsWith("http://") || blog.image_path.startsWith("https://")) {
                    imageSrc = blog.image_path;
                } else {
                    // Strip down leading paths so we have a raw filename reference
                    const purePath = blog.image_path.replace("./", "").replace(/^uploads\//, "");
                    
                    // Look safely at your global config setup
                    const baseImg = typeof IMAGE_BASE !== 'undefined' ? IMAGE_BASE : "https://alexia-tours-backend-production.up.railway.app/uploads/";
                    
                    if (baseImg.endsWith("/uploads/")) {
                        imageSrc = `${baseImg}${purePath}`;
                    } else {
                        imageSrc = `${baseImg}/${purePath}`;
                    }
                }
            }

            return `
                <div class="col-md-4">
                    <div class="card h-100 border-0 shadow-sm" style="border-radius: 5px; overflow: hidden;">
                        <div style="height: 200px; overflow: hidden; position: relative;">
                            <img src="${imageSrc}" class="w-100 h-100" style="object-fit: cover;" alt="${blog.title}" onerror="this.src='https://placehold.co/600x400'">
                            <span class="position-absolute top-0 start-0 badge text-white m-3 px-3 py-2" style="background-color: #F99E1C; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
                                ${blog.category || 'Travel'}
                            </span>
                        </div>
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="text-muted small mb-2"><i class="fa-regular fa-calendar me-1"></i> ${date}</div>
                            <h4 class="fw-bold h5 text-dark mb-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${blog.title}</h4>
                            <p class="text-muted small flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${blog.summary || ''}</p>
                            <a href="blog-single.html?id=${blog.id}" class="text-decoration-none fw-bold small mt-3" style="color: #F99E1C;">
                                Read Full Narrative <i class="fa-solid fa-arrow-right ms-1"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error("Public Blog Rendering Engine Fault:", err);
        blogGrid.innerHTML = `
            <div class="col-12 text-center text-danger py-4">
                <i class="ri-error-warning-line ri-2x mb-2"></i>
                <p class="fw-bold mb-1">Narrative Lost in Transit</p>
                <p class="small text-muted">Could not safely download this article record from the remote server cloud database.</p>
            </div>
        `;
    }
};

// ─── ADMIN DASHBOARD HOOK LAYER ───
// Keeps admin dashboard execution isolated so it won't break your landing metrics page
document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("blogsTableBody");
    const searchInput = document.getElementById("searchInput");
    const form = document.getElementById("blog-creation-form");
    const summaryInput = document.getElementById("blog-summary");
    const charCounter = document.getElementById("char-counter");
    const alertBox = document.getElementById("form-alert");
    const submitBtn = document.getElementById("submit-btn");
    const btnText = document.getElementById("btn-text");
    const btnSpinner = document.getElementById("btn-spinner");

    if (!tableBody) return; // Exit silently if we are on the public home page instead of admin portal

    const baseEndpoint = typeof BASE_URL !== 'undefined' ? BASE_URL : "https://alexia-tours-backend-production.up.railway.app";
    let loadedBlogs = [];

    if (summaryInput && charCounter) {
        summaryInput.addEventListener("input", (e) => {
            charCounter.innerText = `${e.target.value.length} / 450 characters`;
        });
    }

    async function fetchJournalEntries() {
        try {
            const res = await fetch(`${baseEndpoint}/api/blogs`);
            if (!res.ok) throw new Error("Could not download list.");
            loadedBlogs = await res.json();
            renderTable(loadedBlogs);
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4 fw-semibold"><i class="bi bi-exclamation-triangle-fill me-2"></i> Failed to sync dashboard data feed.</td></tr>`;
        }
    }

    function renderTable(blogs) {
        if (blogs.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">No journal entries found. Click "Write Article" to post your first one!</td></tr>`;
            return;
        }

        tableBody.innerHTML = blogs.map(blog => {
            const date = new Date(blog.created_at).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
            const imageSrc = blog.image_path ? `${baseEndpoint}/${blog.image_path}` : '../pictures/placeholder.jpg';
            
            return `
                <tr>
                    <td><img src="${imageSrc}" class="blog-thumb" alt="Cover"></td>
                    <td><div class="fw-bold text-dark">${blog.title}</div><small class="text-muted text-monospace">${blog.slug}</small></td>
                    <td><span class="badge bg-secondary opacity-75 px-2.5 py-1.5" style="border-radius:4px;">${blog.category}</span></td>
                    <td><div class="text-muted small text-truncate" style="max-width: 280px;">${blog.summary}</div></td>
                    <td class="small text-secondary fw-semibold">${date}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger px-2.5 remove-blog-btn" data-id="${blog.id}" style="border-radius:4px;">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        document.querySelectorAll(".remove-blog-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteArticle(btn.getAttribute("data-id")));
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = loadedBlogs.filter(b => 
                b.title.toLowerCase().includes(term) || 
                b.slug.toLowerCase().includes(term) ||
                b.category.toLowerCase().includes(term)
            );
            renderTable(filtered);
        });
    }

    async function deleteArticle(id) {
        if (!confirm("Are you absolutely sure you want to completely remove this article entry? This action cannot be undone.")) return;
        try {
            const res = await fetch(`${baseEndpoint}/api/blogs/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed deletion.");
            fetchJournalEntries();
        } catch (err) {
            alert(`Error removing article: ${err.message}`);
        }
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            if(alertBox) alertBox.className = "alert d-none";
            if(submitBtn) submitBtn.disabled = true;
            if(btnText) btnText.innerText = "Processing Assets...";
            if(btnSpinner) btnSpinner.classList.remove("d-none");

            const formData = new FormData(form);

            try {
                const res = await fetch(`${baseEndpoint}/api/blogs/create`, {
                    method: "POST",
                    body: formData
                });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Submission failed.");

                if (alertBox) {
                    alertBox.className = "alert alert-success d-block fw-semibold";
                    alertBox.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i> ${data.message}`;
                }
                form.reset();
                if (charCounter) charCounter.innerText = "0 / 450 characters";

                setTimeout(() => {
                    const modalEl = document.getElementById('addBlogModal');
                    if (modalEl) {
                        const modalInstance = bootstrap.Modal.getInstance(modalEl);
                        if (modalInstance) modalInstance.hide();
                    }
                    if(submitBtn) submitBtn.disabled = false;
                    if(btnText) btnText.innerText = "Publish Post Live";
                    if(btnSpinner) btnSpinner.classList.add("d-none");
                    if(alertBox) alertBox.className = "alert d-none";
                    fetchJournalEntries();
                }, 1500);

            } catch (err) {
                console.error(err);
                if (alertBox) {
                    alertBox.className = "alert alert-danger d-block fw-semibold";
                    alertBox.innerHTML = `<i class="bi bi-exclamation-octagon-fill me-2"></i> ${err.message}`;
                }
                if(submitBtn) submitBtn.disabled = false;
                if(btnText) btnText.innerText = "Publish Post Live";
                if(btnSpinner) btnSpinner.classList.add("d-none");
            }
        });
    }

    fetchJournalEntries();
});