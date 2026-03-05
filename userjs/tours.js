const BASE_URL = "https://alexia-tours-backend-production.up.railway.app"; 
const API_TOURS = `${BASE_URL}/api/tours`;
const API_DESTINATIONS = `${BASE_URL}/api/destinations`;
const IMAGE_BASE = `${BASE_URL}/uploads/`;

// LOAD TRENDING TOURS (Carousel) ---
async function displayTrendingTours() {
    try {
        const res = await fetch(API_TOURS);
        const tours = await res.json();
        const container = document.getElementById("tour-container");
        if (!container) return;

        container.innerHTML = "";
        const trending = tours.filter(t => t.is_trending == 1);

        trending.forEach(tour => {
            const imgPath = tour.image_path ? tour.image_path.replace('./uploads/', '').replace('uploads/', '') : '';
            const imageSrc = imgPath ? `${IMAGE_BASE}${imgPath}` : 'https://placehold.co/400x300';

            container.innerHTML += `
                <div class="tour-card-wrapper me-4" style="min-width: 300px;">
                    <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                        <img src="${imageSrc}" class="card-img-top" style="height: 200px; object-fit: cover;">
                        <div class="card-body">
                            <h5 class="fw-bold">${tour.title}</h5>
                            <p class="text-muted small">${tour.duration}</p>
                            <h6 class="text-warning fw-bold">KSH ${Number(tour.price).toLocaleString()}</h6>
                            <a href="tour-details.html?id=${tour.id}" class="btn btn-sm btn-outline-warning rounded-pill mt-2">Details</a>
                        </div>
                    </div>
                </div>`;
        });
    } catch (err) { console.error("Tours Error:", err); }
}

// --- LOAD TOP DESTINATIONS (Grid) ---
async function displayDestinations() {
    try {
        const res = await fetch(API_DESTINATIONS);
        const destinations = await res.json();
        const destGrid = document.getElementById("destinations-grid");
        if (!destGrid) return;

        destGrid.innerHTML = "";

        destinations.forEach(dest => {
            // Note: Destinations table uses "image" column, not "image_path"
            const imageSrc = dest.image ? `${IMAGE_BASE}${dest.image}` : 'https://placehold.co/600x400';

            destGrid.innerHTML += `
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="destination-card position-relative overflow-hidden rounded-4 shadow-sm" style="height: 250px;">
                        <img src="${imageSrc}" class="w-100 h-100" style="object-fit: cover; transition: 0.5s;">
                        <div class="position-absolute bottom-0 start-0 w-100 p-3 text-white" 
                             style="background: linear-gradient(transparent, rgba(0,0,0,0.8));">
                            <h5 class="fw-bold mb-0">${dest.name}</h5>
                            <p class="small mb-0 opacity-75">${dest.description.substring(0, 40)}...</p>
                            <a href="destination-details.html?id=${dest.id}" class="..."><ion-icon style="font-size: 1.5em" name="arrow-forward-outline"></ion-icon></a>
                        </div>
                    </div>
                </div>`;
        });
    } catch (err) { console.error("Destinations Error:", err); }
}

// --- INITIALIZE ---
document.addEventListener("DOMContentLoaded", () => {
    displayTrendingTours();
    displayDestinations();
});