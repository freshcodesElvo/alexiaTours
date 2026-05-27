document.addEventListener("DOMContentLoaded", () => {
    const blogGrid = document.getElementById("blog-grid");
    const searchInput = document.getElementById("publicSearchInput");
    const filterButtons = document.querySelectorAll(".filter-chip");

    if (!blogGrid) return;

    let allBlogs = [];
    let currentCategory = "all";
    let currentSearchTerm = "";

    // 1. Fetch complete data array from Railway
    async function loadJournalCatalog() {
        try {
            const response = await fetch(`${BASE_URL}/api/blogs`);
            if (!response.ok) throw new Error("Could not download comprehensive log listing.");

            allBlogs = await response.json();
            applyFilters(); // Trigger layout composition

        } catch (error) {
            console.error("Catalog Loader Fault Error Log:", error);
            blogGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="ri-alert-line ri-2x text-danger mb-2"></i>
                    <h5 class="fw-bold">Unable to Stream Journals</h5>
                    <p class="text-muted small">Please ensure the backend sync is live or check connection parameters.</p>
                </div>
            `;
        }
    }

    // 2. Client-Side Search and Filter Match Handler
    function applyFilters() {
        let filtered = allBlogs;

        // Process Category Constraints
        if (currentCategory !== "all") {
            filtered = filtered.filter(blog => blog.category === currentCategory);
        }

        // Process Search Keyword Matches
        if (currentSearchTerm) {
            filtered = filtered.filter(blog => 
                blog.title.toLowerCase().includes(currentSearchTerm) ||
                blog.summary.toLowerCase().includes(currentSearchTerm)
            );
        }

        renderGridCards(filtered);
    }

    // 3. Grid Assembly Engine
    function renderGridCards(blogs) {
        if (blogs.length === 0) {
            blogGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="ri-compass-line ri-2x text-muted mb-2 d-inline-block"></i>
                    <h5 class="text-secondary fw-bold">No Matching Articles</h5>
                    <p class="text-muted small mb-0">Try clearing your filters or refining your search keywords.</p>
                </div>
            `;
            return;
        }

        blogGrid.innerHTML = blogs.map(blog => {
            const date = new Date(blog.created_at).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
            const imageSrc = blog.image_path ? `${BASE_URL}/${blog.image_path}` : 'assets/images/placeholder.jpg';

            return `
                <div class="col-md-6 col-lg-4 d-flex align-items-stretch">
                    <div class="card w-100 border-0 shadow-sm" style="border-radius: 5px; overflow: hidden; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div style="height: 210px; overflow: hidden; position: relative;">
                            <img src="${imageSrc}" class="w-100 h-100" style="object-fit: cover;" alt="Cover Banner" onerror="this.src='assets/images/placeholder.jpg'">
                            <span class="position-absolute top-0 start-0 badge text-white m-3 px-3 py-2" style="background-color: #F99E1C; border-radius: 4px; font-size: 0.72rem; font-weight: 600;">
                                ${blog.category}
                            </span>
                        </div>
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="text-muted small mb-2"><i class="fa-regular fa-calendar me-1"></i> ${date}</div>
                            <h4 class="fw-bold h5 text-dark mb-2 lh-sm" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${blog.title}</h4>
                            <p class="text-muted small flex-grow-1 mb-4" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5;">${blog.summary}</p>
                            <a href="blog-single.html?id=${blog.id}" class="text-decoration-none fw-bold small mt-auto d-inline-flex align-items-center gap-1" style="color: #F99E1C;">
                                Read Full Narrative <i class="ri-arrow-right-line"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 4. Attach Navigation UI Interaction Events
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            currentSearchTerm = e.target.value.toLowerCase().trim();
            applyFilters();
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            
            currentCategory = button.getAttribute("data-category");
            applyFilters();
        });
    });

    // Run catalog loader initialization sequences
    loadJournalCatalog();
});