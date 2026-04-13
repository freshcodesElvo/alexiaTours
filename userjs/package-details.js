(() => {
    const API_BASE = "https://alexia-tours-backend-production.up.railway.app/packages";
    const IMAGE_BASE = "https://alexia-tours-backend-production.up.railway.app/uploads/";

    async function loadFullPackageDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const pkgId = urlParams.get('id');

        // 1. Prevent loop: If no ID, show a message instead of an immediate redirect
        if (!pkgId) {
            console.error("No package ID found in URL.");
            const mainContainer = document.querySelector('.container.py-5');
            if (mainContainer) {
                mainContainer.innerHTML = `
                    <div class="text-center mt-5">
                        <h2 class="fw-bold">No Tour Selected</h2>
                        <p class="text-muted">Please select a tour from our homepage to view details.</p>
                        <a href="index.html" class="btn btn-warning px-4 rounded-pill">View All Tours</a>
                    </div>`;
            }
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/${pkgId}`);
            if (!res.ok) throw new Error("Package not found");

            const pkg = await res.json();

            // 2. UI Updates
            const titleEl = document.getElementById("tour-title");
            const priceEls = document.querySelectorAll("#tour-price"); 
            const durationEls = document.querySelectorAll("#tour-duration");
            const categoryBadge = document.getElementById("tour-category");

            if (titleEl) titleEl.innerText = pkg.title;
            if (categoryBadge) categoryBadge.innerText = pkg.category || "Tour";
            
            priceEls.forEach(el => {
                el.innerText = `KSH ${Number(pkg.price).toLocaleString()}`;
            });

            durationEls.forEach(el => {
                el.innerText = `${pkg.duration_days} Days / ${pkg.duration_nights} Nights`;
            });

            // 3. Description formatting
            const descContainer = document.getElementById("tour-description");
            if (descContainer && pkg.description) {
                descContainer.innerHTML = pkg.description
                    .split('\n')
                    .filter(p => p.trim() !== "")
                    .map(p => `<p class="mb-4">${p.trim()}</p>`)
                    .join('');
            }

            // 4. Hero Background
            const heroBg = document.getElementById("tour-hero-bg");
            if (heroBg) {
                const imgSrc = pkg.image ? `${IMAGE_BASE}${pkg.image}` : 'pictures/placeholder.jpg';
                heroBg.style.backgroundImage = `url('${imgSrc}')`;
            }

        } catch (error) {
            console.error("Fetch Error:", error);
            const mainContainer = document.querySelector('.container.py-5');
            if (mainContainer) {
                mainContainer.innerHTML = `
                    <div class="text-center mt-5">
                        <h2 class="fw-bold text-danger">Package Not Found</h2>
                        <p class="text-muted">Sorry, we couldn't find the tour you're looking for.</p>
                        <a href="index.html" class="btn btn-warning px-4 rounded-pill">Go Back</a>
                    </div>`;
            }
        }
    }

    // 5. Simplified initialization (prevents double-triggering)
    if (document.readyState === "complete" || document.readyState === "interactive") {
        loadFullPackageDetails();
    } else {
        document.addEventListener("DOMContentLoaded", loadFullPackageDetails);
    }
})();