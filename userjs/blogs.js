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

    // Public element hook (for destinations.html / blog.html)
    const blogGrid = document.getElementById("blog-grid");

    let loadedBlogs = [];

    // Character Counter (Only runs if element exists)
    if (summaryInput && charCounter) {
        summaryInput.addEventListener("input", (e) => {
            charCounter.innerText = `${e.target.value.length} / 450 characters`;
        });
    }

    // 1. FETCH & RENDER ENTRIES
    async function fetchJournalEntries() {
        try {
            const res = await fetch(`${BASE_URL}/api/blogs`);
            if (!res.ok) throw new Error("Could not download list.");
            
            loadedBlogs = await res.json();
            
            // Route data to the correct renderer depending on which page we are on
            if (tableBody) {
                renderTable(loadedBlogs);
            }
            if (blogGrid) {
                renderPublicGrid(loadedBlogs);
            }
        } catch (err) {
            console.error(err);
            // Defensive guard for admin error message
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4 fw-semibold"><i class="bi bi-exclamation-triangle-fill me-2"></i> Failed to sync dashboard data feed.</td></tr>`;
            }
            // Defensive guard for public error message
            if (blogGrid) {
                blogGrid.innerHTML = `<div class="col-12 text-center text-muted py-4"><p class="small text-uppercase tracking-wider mb-0">Failed to load dynamic updates.</p></div>`;
            }
        }
    }

    // Admin Panel Table Renderer
    function renderTable(blogs) {
        if (!tableBody) return; // Safety exit

        if (blogs.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">No journal entries found. Click "Write Article" to post your first one!</td></tr>`;
            return;
        }

        tableBody.innerHTML = blogs.map(blog => {
            const date = new Date(blog.created_at).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
            const imageSrc = blog.image_path ? `${BASE_URL}/${blog.image_path}` : '../pictures/placeholder.jpg';
            
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

        // Attach Delete Listeners
        document.querySelectorAll(".remove-blog-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteArticle(btn.getAttribute("data-id")));
        });
    }

    // Public Website Grid Renderer (for destinations.html / blog.html)
    function renderPublicGrid(blogs) {
        if (!blogGrid) return; // Safety exit

        if (blogs.length === 0) {
            blogGrid.innerHTML = `<div class="col-12 text-center text-muted py-4"><p class="small text-uppercase tracking-wider mb-0">No articles published yet.</p></div>`;
            return;
        }

        // Limit to top 3 articles for the destinations preview widget row
        const displayBlogs = blogs.slice(0, 3);

        blogGrid.innerHTML = displayBlogs.map(blog => {
            const date = new Date(blog.created_at).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
            const imageSrc = blog.image_path ? `${BASE_URL}/${blog.image_path}` : 'assets/images/placeholder.jpg';

            return `
                <div class="col-md-4">
                    <div class="card h-100 border-0 shadow-sm" style="border-radius: 5px; overflow: hidden;">
                        <div style="height: 200px; overflow: hidden; position: relative;">
                            <img src="${imageSrc}" class="w-100 h-100" style="object-fit: cover;" alt="Cover">
                            <span class="position-absolute top-0 start-0 badge text-white m-3 px-3 py-2" style="background-color: #F99E1C; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
                                ${blog.category}
                            </span>
                        </div>
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="text-muted small mb-2"><i class="fa-regular fa-calendar me-1"></i> ${date}</div>
                            <h4 class="fw-bold h5 text-dark mb-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${blog.title}</h4>
                            <p class="text-muted small flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${blog.summary}</p>
                            <a href="blog-single.html?article=${blog.slug}" class="text-decoration-none fw-bold small mt-3" style="color: #F99E1C;">
                                Read Full Narrative <i class="fa-solid fa-arrow-right ms-1"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 2. SEARCH FILTER LOGIC
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

    // 3. REMOVE ARTICLE INTERACTION
    async function deleteArticle(id) {
        if (!confirm("Are you absolutely sure you want to completely remove this article entry? This action cannot be undone.")) return;

        try {
            const res = await fetch(`${BASE_URL}/api/blogs/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed deletion.");

            fetchJournalEntries();
        } catch (err) {
            alert(`Error removing article: ${err.message}`);
        }
    }

    // 4. MODAL CREATION SUBMIT ENGINE
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            if(alertBox) alertBox.className = "alert d-none";
            if(submitBtn) submitBtn.disabled = true;
            if(btnText) btnText.innerText = "Processing Assets...";
            if(btnSpinner) btnSpinner.classList.remove("d-none");

            const formData = new FormData(form);

            try {
                const res = await fetch(`${BASE_URL}/api/blogs/create`, {
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

    // Initial Execution Context Call
    fetchJournalEntries();
});