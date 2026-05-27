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

    // Edit Modal Elements
    const editForm = document.getElementById("edit-blog-form");

    let loadedBlogs = [];
    let editModalInstance = null;

    // Character Counter for Creation Summary
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
            
            // Fallback unique structural identifier string validation mapping
            const blogId = blog.id || blog._id;

            return `
                <tr>
                    <td><img src="${imageSrc}" class="blog-thumb" alt="Cover"></td>
                    <td><div class="fw-bold text-dark">${blog.title}</div><small class="text-muted text-monospace">${blog.slug || ''}</small></td>
                    <td><span class="badge bg-secondary opacity-75 px-2.5 py-1.5" style="border-radius:4px;">${blog.category}</span></td>
                    <td><div class="text-muted small text-truncate" style="max-width: 280px;">${blog.summary || ''}</div></td>
                    <td class="small text-secondary fw-semibold">${date}</td>
                    <td class="text-center">
                        <div class="d-inline-flex gap-1">
                            <button class="btn btn-sm btn-outline-secondary px-2.5 edit-blog-trigger-btn" data-id="${blogId}" style="border-radius:4px;" title="Edit Entry">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger px-2.5 remove-blog-btn" data-id="${blogId}" style="border-radius:4px;" title="Delete Entry">
                                <i class="bi bi-trash3-fill"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Attach Action Button Click Listeners Dynamically
        document.querySelectorAll(".edit-blog-trigger-btn").forEach(btn => {
            btn.addEventListener("click", () => openEditBlogModal(btn.getAttribute("data-id")));
        });

        document.querySelectorAll(".remove-blog-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteArticle(btn.getAttribute("data-id")));
        });
    }

    // 2. SEARCH FILTER LOGIC
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = loadedBlogs.filter(b => 
                (b.title && b.title.toLowerCase().includes(term)) || 
                (b.slug && b.slug.toLowerCase().includes(term)) ||
                (b.category && b.category.toLowerCase().includes(term))
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
                    const modalEl = document.getElementById('addBlogModal');
                    const modalInstance = bootstrap.Modal.getInstance(modalEl);
                    if (modalInstance) modalInstance.hide();
                    
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

    // 5. FETCH ACTIVE DATA RECORD FOR REVISION MODAL
    async function openEditBlogModal(postId) {
        if (!postId) return;

        try {
            const response = await fetch(`${BASE_URL}/api/blogs/${postId}`);
            if (!response.ok) throw new Error("Target document record processing dropped.");
            
            const data = await response.json();
            const post = data.data || data; 

            // Assign base text fields
            document.getElementById('edit-blog-id').value = post.id || post._id || '';
            document.getElementById('edit-blog-title').value = post.title || '';
            document.getElementById('edit-blog-category').value = post.category || 'Safari Tips';
            document.getElementById('edit-blog-summary').value = post.summary || '';
            document.getElementById('edit-blog-content').value = post.content || '';

            // Note: For security reasons, browser file inputs cannot be pre-assigned an arbitrary text path string.
            // Reset the file input picker element so it's fresh for an optional new upload selection
            document.getElementById('edit-blog-image').value = '';

            if (!editModalInstance) {
                editModalInstance = new bootstrap.Modal(document.getElementById('editBlogModal'));
            }
            editModalInstance.show();
        } catch (err) {
            console.error("Failed fetching data payload details:", err);
            alert("Error trying to pull down records for revision context processing.");
        }
    }

    // 6. PROCESS COMMITTED EDIT REVISIONS SUBMISSION
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const postId = document.getElementById('edit-blog-id').value;
            if (!postId) return alert("System state error: Target structural identifier is missing.");
            
            // Re-encapsulate into a FormData container to safely transport files across the wire
            const editFormData = new FormData();
            editFormData.append('title', document.getElementById('edit-blog-title').value.trim());
            editFormData.append('category', document.getElementById('edit-blog-category').value);
            editFormData.append('summary', document.getElementById('edit-blog-summary').value.trim());
            editFormData.append('content', document.getElementById('edit-blog-content').value.trim());

            // Grab file asset if the user selected one
            const imageFileInput = document.getElementById('edit-blog-image');
            if (imageFileInput.files.length > 0) {
                editFormData.append('blog_image', imageFileInput.files[0]);
            }

            const saveButton = this.querySelector('button[type="submit"]');
            const originalText = saveButton.innerHTML;

            try {
                saveButton.disabled = true;
                saveButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Saving...`;

                const response = await fetch(`${BASE_URL}/api/blogs/${postId}`, {
                    method: 'PUT',
                    // CRITICAL: Do NOT explicitly declare a Content-Type header when sending FormData!
                    // Leaving it out allows the browser to automatically compute the correct boundary parameters.
                    body: editFormData 
                });
                
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || "Backend compilation verification failure.");

                alert("Blog publication data successfully compiled and saved!");
                
                if (editModalInstance) editModalInstance.hide();
                fetchJournalEntries();
            } catch (err) {
                console.error("Operational update transfer loop crashed:", err);
                alert(`Update rejected: ${err.message}`);
            } finally {
                saveButton.disabled = false;
                saveButton.innerHTML = originalText;
            }
        });
    }

    // Initial Execution Context Call
    fetchJournalEntries();
});