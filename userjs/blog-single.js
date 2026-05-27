document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("article-loader");
    const container = document.getElementById("article-content");
    
    const categoryEl = document.getElementById("article-category");
    const dateEl = document.getElementById("article-date");
    const titleEl = document.getElementById("article-title");
    const bannerEl = document.getElementById("article-banner");
    const bodyEl = document.getElementById("article-body");

    // 1. Extract parameters from the search query path gracefully
    const urlParams = new URLSearchParams(window.location.search);
    const articleSlug = urlParams.get("article");
    const articleId = urlParams.get("id"); // Dynamic backup hook

    if (!articleSlug && !articleId) {
        showErrorState("No article reference identifier was found in the URL parameter path.");
        return;
    }

    // 2. Fetch specific article record matching backend specifications cleanly
    async function loadFullNarrative() {
        try {
            // Safe fallback reference to core environment context endpoints
            const baseHost = typeof BASE_URL !== 'undefined' ? BASE_URL : "https://alexia-tours-backend-production.up.railway.app";
            
            // Dynamic path routing: if your route handler expects IDs, prioritize articleId
            const fetchPath = articleId 
                ? `${baseHost}/api/blogs/${articleId}`
                : `${baseHost}/api/blogs/${articleSlug}`;

            const response = await fetch(fetchPath);
            
            if (response.status === 404) {
                showErrorState("The travel narrative you are looking for does not exist or has been archived.");
                return;
            }
            if (!response.ok) throw new Error(`Server communication fault. Status code: ${response.status}`);

            const blog = await response.json();
            renderArticleDetails(blog);

        } catch (error) {
            console.error("Narrative fetch trace error:", error);
            showErrorState("Could not safely download this article record from the remote server cloud database.");
        }
    }

    function renderArticleDetails(blog) {
        // Human-friendly date formatting transformation
        const formattedDate = new Date(blog.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Set text items
        if (titleEl) titleEl.innerText = blog.title;
        if (categoryEl) categoryEl.innerText = blog.category || 'Travel Insights';
        if (dateEl) dateEl.innerHTML = `<i class="ri-calendar-todo-line me-1"></i> Published on ${formattedDate}`;
        
        // ─── ACCURATE ASSET RESOLUTION LAYER ───
        if (bannerEl) {
            let imageSrc = 'assets/images/placeholder-safari.jpg';
            
            if (blog.image_path) {
                if (blog.image_path.startsWith("http://") || blog.image_path.startsWith("https://")) {
                    imageSrc = blog.image_path;
                } else {
                    // Extract relative filenames without duplication blocks
                    const pureFilename = blog.image_path.replace("./", "").replace(/^uploads\//, "");
                    
                    const baseImg = typeof IMAGE_BASE !== 'undefined' ? IMAGE_BASE : "https://alexia-tours-backend-production.up.railway.app/uploads/";
                    
                    imageSrc = baseImg.endsWith("/uploads/") 
                        ? `${baseImg}${pureFilename}` 
                        : `${baseImg}/${pureFilename}`;
                }
            }
            bannerEl.src = imageSrc;
            bannerEl.alt = blog.title;
            bannerEl.onerror = function() { this.src = 'https://placehold.co/1200x600'; };
        }

        /* Crucial Fix: Use innerText instead of innerHTML for content layout. 
           Coupled with CSS `white-space: pre-line`, this naturally parses your backend's 
           double-line break spacings without needing a complex rich-text parser layout engine!
        */
        if (bodyEl) bodyEl.innerText = blog.content || blog.description || "";

        // Toggle elements visibility states smoothly
        if (loader) loader.classList.add("d-none");
        if (container) container.classList.remove("d-none");
        document.title = `${blog.title} | Alexia's Tours`;
    }

    function showErrorState(message) {
        if (!loader) return;
        loader.classList.remove("d-none");
        if (container) container.classList.add("d-none");
        
        loader.innerHTML = `
            <div class="py-5 text-center">
                <i class="ri-compass-3-line ri-2x text-danger mb-3 d-inline-block"></i>
                <h4 class="fw-bold text-dark">Narrative Lost in Transit</h4>
                <p class="text-muted small mx-auto" style="max-width: 400px;">${message}</p>
                <a href="blog.html" class="btn btn-sm btn-dark px-4 mt-2" style="border-radius:4px;">Return to Articles</a>
            </div>
        `;
    }

    loadFullNarrative();
});