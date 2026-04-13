(() => {
    // These are now private to this block and won't clash with other files
    const API_BASE = "https://alexia-tours-backend-production.up.railway.app/packages";
    const IMAGE_BASE = "https://alexia-tours-backend-production.up.railway.app/uploads/";

    async function loadFullPackageDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const pkgId = urlParams.get('id');

        if (!pkgId) {
            window.location.href = "index.html";
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/${pkgId}`);
            if (!res.ok) throw new Error("Package not found");

            const pkg = await res.json();

            // Update UI elements
            const titleEl = document.getElementById("tour-title");
            const priceEls = document.querySelectorAll("#tour-price"); // Matches both summary and header
            const durationEls = document.querySelectorAll("#tour-duration");

            if (titleEl) titleEl.innerText = pkg.title;
            
            priceEls.forEach(el => {
                el.innerText = `KSH ${Number(pkg.price).toLocaleString()}`;
            });

            durationEls.forEach(el => {
                el.innerText = `${pkg.duration_days} Days / ${pkg.duration_nights} Nights`;
            });

            // Description formatting
            const descContainer = document.getElementById("tour-description");
            if (descContainer && pkg.description) {
                descContainer.innerHTML = pkg.description
                    .split('\n')
                    .filter(p => p.trim() !== "")
                    .map(p => `<p class="mb-4">${p.trim()}</p>`)
                    .join('');
            }

            // Hero Background
            const heroBg = document.getElementById("tour-hero-bg");
            if (heroBg) {
                const imgSrc = pkg.image ? `${IMAGE_BASE}${pkg.image}` : 'pictures/placeholder.jpg';
                heroBg.style.backgroundImage = `url('${imgSrc}')`;
            }

            // Category Badge
            const categoryBadge = document.getElementById("tour-category");
            if (categoryBadge && pkg.category) {
                categoryBadge.innerText = pkg.category;
            }

        } catch (error) {
            console.error("Error:", error);
            const mainContainer = document.querySelector('.container.py-5');
            if (mainContainer) {
                mainContainer.innerHTML = `<h2 class="text-center mt-5">Package not found. <a href="index.html">Go Back</a></h2>`;
            }
        }
    }

    // Initialize
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadFullPackageDetails);
    } else {
        loadFullPackageDetails();
    }
})();