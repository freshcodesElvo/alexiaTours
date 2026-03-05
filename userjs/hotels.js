const API_HOTELS = "https://alexia-tours-backend-production.up.railway.app/api/hotels";
const IMAGE_BASE = "https://alexia-tours-backend-production.up.railway.app/uploads/";

async function loadHotels() {
    try {
        const res = await fetch(API_HOTELS);
        if (!res.ok) throw new Error("Could not fetch hotels");
        
        const hotels = await res.json();
        const container = document.getElementById("hotels-container");

        if (!container) return;
        container.innerHTML = ""; 

        hotels.forEach(hotel => {
            const imgSrc = hotel.image ? `${IMAGE_BASE}${hotel.image}` : 'pictures/placeholder-hotel.jpg';
            
            container.innerHTML += `
                <div class="col-md-4">
                    <div class="card h-100 border-0 shadow-sm overflow-hidden">
                        <img src="${imgSrc}" class="card-img-top" alt="${hotel.name}" style="height: 230px; object-fit: cover;">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h5 class="fw-bold mb-0">${hotel.name}</h5>
                                <span class="badge bg-success">Ksh ${Number(hotel.price).toLocaleString()}</span>
                            </div>
                            <p class="text-muted small mb-3">
                                <ion-icon name="location-outline"></ion-icon> ${hotel.location || 'Global'}
                            </p>
                            <p class="card-text text-truncate-2">${hotel.description}</p>
                            <hr>
                            <div class="d-flex justify-content-between">
                                <a href="hotel-details.html?id=${hotel.id}" class="btn btn-outline-primary btn-sm " style="border-radius: 2em">View Details</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Hotel Load Error:", error);
        document.getElementById("hotels-container").innerHTML = "<p class='text-center'>Unable to load hotels at this time.</p>";
    }
}

document.addEventListener("DOMContentLoaded", loadHotels);