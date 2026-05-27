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

    let loadedBlogs = [];

    // Character Counter
    if (summaryInput) {
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
            renderTable(loadedBlogs);
        } catch (err) {
            console.error(err);
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
            alertBox.className = "alert d-none";
            submitBtn.disabled = true;
            btnText.innerText = "Processing Assets...";
            btnSpinner.classList.remove("d-none");

            const formData = new FormData(form);

            try {
                const res = await fetch(`${BASE_URL}/api/blogs/create`, {
                    method: "POST",
                    body: formData
                });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Submission failed.");

                alertBox.className = "alert alert-success d-block fw-semibold";
                alertBox.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i> ${data.message}`;
                form.reset();
                if (charCounter) charCounter.innerText = "0 / 450 characters";

                setTimeout(() => {
                    // Hide modal gracefully using Bootstrap context methods
                    const modalEl = document.getElementById('addBlogModal');
                    const modalInstance = bootstrap.Modal.getInstance(modalEl);
                    if (modalInstance) modalInstance.hide();
                    
                    // Reset buttons and reload tables layout views
                    submitBtn.disabled = false;
                    btnText.innerText = "Publish Post Live";
                    btnSpinner.classList.add("d-none");
                    alertBox.className = "alert d-none";
                    
                    fetchJournalEntries();
                }, 1500);

            } catch (err) {
                console.error(err);
                alertBox.className = "alert alert-danger d-block fw-semibold";
                alertBox.innerHTML = `<i class="bi bi-exclamation-octagon-fill me-2"></i> ${err.message}`;
                submitBtn.disabled = false;
                btnText.innerText = "Publish Post Live";
                btnSpinner.classList.add("d-none");
            }
        });
    }

    // Initial Execution Context Call
    fetchJournalEntries();
});
// Initialize Bootstrap Modal instantiation handlers globally
let editModalInstance = null;

// 1. Fetch current details from backend and reveal pre-populated modal
function openEditBlogModal(postId) {
    // Dynamically retrieve target entry metadata from your backend route
    fetch(`/api/blog/${postId}`)
        .then(response => response.json())
        .then(post => {
            // Populate form nodes with active database record fields
            document.getElementById('edit-blog-id').value = post._id;
            document.getElementById('edit-blog-title').value = post.title;
            document.getElementById('edit-blog-category').value = post.category || 'Safari Guide';
            document.getElementById('edit-blog-image').value = post.imageUrl || '';
            document.getElementById('edit-blog-content').value = post.content;

            // Trigger Modal UI visibility toggle safely 
            if(!editModalInstance) {
                editModalInstance = new bootstrap.Modal(document.getElementById('editBlogModal'));
            }
            editModalInstance.show();
        })
        .catch(err => {
            console.error("Failed fetching data payload details:", err);
            alert("Error trying to pull down records for revision context processing.");
        });
}

// 2. Intercept submission event context to fire PUT/PATCH update pipeline request
document.getElementById('edit-blog-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const postId = document.getElementById('edit-blog-id').value;
    
    const updatedPayload = {
        title: document.getElementById('edit-blog-title').value,
        category: document.getElementById('edit-blog-category').value,
        imageUrl: document.getElementById('edit-blog-image').value,
        content: document.getElementById('edit-blog-content').value
    };

    // Execute standard operational network payload update transfer
    fetch(`/api/blog/${postId}`, {
        method: 'PUT', // or 'PATCH' depending on how your backend controller routes updates
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPayload)
    })
    .then(response => {
        if(response.ok) {
            alert("Blog publication data successfully compiled and saved!");
            editModalInstance.hide();
            location.reload(); // Refresh viewport layout grid list items seamlessly
        } else {
            alert("Backend verification flag failure. Update rejected.");
        }
    })
    .catch(err => {
        console.error("Operational update transfer loop crashed:", err);
    });
});