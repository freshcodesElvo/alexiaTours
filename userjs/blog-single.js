document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("article-loader");
    const container = document.getElementById("article-content");
    
    const categoryEl = document.getElementById("article-category");
    const dateEl = document.getElementById("article-date");
    const titleEl = document.getElementById("article-title");
    const bannerEl = document.getElementById("article-banner");
    const bodyEl = document.getElementById("article-body");

    // 1. Extract ?article=slug parameter from location path
    const urlParams = new URLSearchParams(window.location.search);
    const articleSlug = urlParams.get("article");

    if (!articleSlug) {
        showErrorState("No article reference was found in the URL parameter path.");
        return;
    }

    // 2. Fetch specific article record by its unique slug string identifier
    async function loadFullNarrative() {
        try {
            const response = await fetch(`${BASE_URL}/api/blogs/${articleSlug}`);
            
            if (response.status === 404) {
                showErrorState("The travel narrative you are looking for does not exist or has been archived.");
                return;
            }
            if (!response.ok) throw new Error("Server communication fault.");

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
        titleEl.innerText = blog.title;
        categoryEl.innerText = blog.category;
        dateEl.innerHTML = `<i class="ri-calendar-todo-line me-1"></i> Published on ${formattedDate}`;
        
        // Handle image resolution fallback mapping safely
        bannerEl.src = blog.image_path ? `${BASE_URL}/${blog.image_path}` : 'assets/images/placeholder-safari.jpg';
        bannerEl.alt = blog.title;

        /* Crucial Fix: Use innerText instead of innerHTML for content layout. 
           Coupled with CSS `white-space: pre-line`, this naturally parses your backend's 
           double-line break spacings without needing a complex rich-text parser layout engine!
        */
        bodyEl.innerText = blog.content;

        // Toggle elements visibility states smooth
        loader.classList.add("d-none");
        container.classList.remove("d-none");
        document.title = `${blog.title} | Alexia's Tours`;
    }

    function showErrorState(message) {
        if (!loader) return;
        loader.innerHTML = `
            <div class="py-5 text-center">
                <i class="ri-compass-3-line ri-2x text-danger mb-3 d-inline-block"></i>
                <h4 class="fw-bold text-dark">Narrative Lost in Transit</h4>
                <p class="text-muted small mx-auto" style="max-width: 400px;">${message}</p>
                <a href="destinations.html" class="btn btn-sm btn-dark px-4 mt-2" style="border-radius:4px;">Return to Destinations</a>
            </div>
         Leyers`;
    }

    loadFullNarrative();
});