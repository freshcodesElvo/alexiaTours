const API_BASE = "https://alexia-tours-backend-production.up.railway.app/packages"; // Must be 'packages'
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

        // Update the UI with your DB column names
        document.getElementById("tour-title").innerText = pkg.title;
        document.getElementById("tour-price").innerText = `KSH ${Number(pkg.price).toLocaleString()}`;
        document.getElementById("tour-duration").innerText = `${pkg.duration_days} Days / ${pkg.duration_nights} Nights`;
        
        const descContainer = document.getElementById("tour-description");
        if (pkg.description) {
            descContainer.innerHTML = pkg.description
                .split('\n')
                .filter(p => p.trim() !== "")
                .map(p => `<p class="mb-4">${p.trim()}</p>`)
                .join('');
        }

        const heroBg = document.getElementById("tour-hero-bg");
        if (heroBg) {
            const imgSrc = pkg.image ? `${IMAGE_BASE}${pkg.image}` : 'pictures/placeholder.jpg';
            heroBg.style.backgroundImage = `url('${imgSrc}')`;
        }

    } catch (error) {
        console.error("Error:", error);
        document.body.innerHTML = `<h2 class="text-center mt-5">Package not found. <a href="index.html">Go Back</a></h2>`;
    }
}

document.addEventListener("DOMContentLoaded", loadFullPackageDetails);