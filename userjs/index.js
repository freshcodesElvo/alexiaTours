const BASE_URL = "https://alexia-tours-backend-production.up.railway.app"; 
const API_DESTINATIONS = `${BASE_URL}/api/destinations`;
const IMAGE_BASE = `${BASE_URL}/uploads/`;
const API_PACKAGES = "http://localhost:5000/api/packages";

async function loadIndexDestinations() {
    try {
        const res = await fetch(API_DESTINATIONS);
        const destinations = await res.json();
        const container = document.getElementById("index-destinations-container");
        
        if (!container) return;
        container.innerHTML = ""; // Clear the "Elvis" messages

        destinations.forEach(dest => {
            // Use 'image' column from your destinations table
            const imageSrc = dest.image ? `${IMAGE_BASE}${dest.image}` : 'pictures/placeholder.jpg';
            const shortDescription = dest.description.length > 80 
        ? dest.description.substring(0, 80) + "..." 
        : dest.description;

            container.innerHTML += `
                <div class="card tour-card me-3" style="min-width: 300px;">
                    <img src="${imageSrc}" class="card-img-top" alt="${dest.name}" style="height: 250px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${dest.name}</h5>
                        <p class="card-text text-muted">${shortDescription}</p>
                        <a href="destination-details.html?id=${dest.id}" class="btn btn-sm btn-warning rounded-circle shadow-sm">
                            <ion-icon name="arrow-forward-outline"></ion-icon>
                        </a>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error loading destinations for index:", error);
    }
}
async function loadHomePackages() {
    try {
        const res = await fetch(API_PACKAGES);
        const packages = await res.json();
        const container = document.getElementById("index-packages-container");

        if (!container) return;
        container.innerHTML = ""; // Clear existing static cards

        // We only want to show, for example, the latest 8 packages on the home page
        const topPackages = packages.slice(0, 8);

        // Inside loadHomePackages function
topPackages.forEach(pkg => {
    const imgSrc = pkg.image ? `${IMAGE_BASE}${pkg.image}` : './pictures/placeholder.jpg';
    const formattedPrice = Number(pkg.price).toLocaleString();

    container.innerHTML += `
        <div class="col-md-3">
            <div class="package-card">
                <img src="${imgSrc}" alt="${pkg.title}" style="height: 200px; object-fit: cover; width: 100%;">
                <div class="packages-card-body">
                    <h5 class="fw-bold text-truncate">${pkg.title}</h5>
                    <p class="price text-warning">From Ksh ${formattedPrice} <span>Per Person</span></p>

                    <div class="tour-meta">
                        <a href="package-details.html?id=${pkg.id}" class="btn explore-btn">Explore</a>                        
                        <div class="text-white-50 small">
                            <span><ion-icon name="sunny-outline"></ion-icon> ${pkg.duration_days} Days</span>
                            <span><ion-icon name="moon-outline"></ion-icon> ${pkg.duration_nights} Nights</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
});
    } catch (error) {
        console.error("Error loading home packages:", error);
    }
}
// Call the function when the page loads
document.addEventListener("DOMContentLoaded", loadIndexDestinations);
document.addEventListener("DOMContentLoaded", loadHomePackages);