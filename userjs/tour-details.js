// Replace with your local IP
const BASE_URL = "http://localhost:5000"; 
const API_TOURS = `${BASE_URL}/api/tours`;
const IMAGE_BASE = `${BASE_URL}/uploads/`;

async function loadTourDetails() {
    const params = new URLSearchParams(window.location.search);
    const tourId = params.get('id');

    if (!tourId) {
        window.location.href = 'destinations.html';
        return;
    }

    try {
        const res = await fetch(`${API_TOURS}/${tourId}`);
        if (!res.ok) throw new Error("Tour not found");
        
        const tour = await res.json();

        // Update Text Fields
        document.getElementById('tour-title').innerText = tour.title;
        document.getElementById('tour-category').innerText = tour.category;
        document.getElementById('tour-duration').innerText = tour.duration || "Contact for info";
        document.getElementById('tour-price').innerText = `KSH ${Number(tour.price).toLocaleString()}`;
        
        // Handle Description Paragraphs
        const descContainer = document.getElementById('tour-description');
        if (tour.description) {
            descContainer.innerHTML = tour.description
                .split('\n')
                .filter(p => p.trim() !== "")
                .map(p => `<p class="mb-4">${p.trim()}</p>`)
                .join('');
        }

        // Update Background Image
        const imgPath = tour.image_path ? tour.image_path.replace('./uploads/', '').replace('uploads/', '') : '';
        const imageSrc = imgPath ? `${IMAGE_BASE}${imgPath}` : 'assets/img/placeholder.jpg';
        document.getElementById('tour-hero-bg').style.backgroundImage = `url('${imageSrc}')`;

    } catch (error) {
        console.error("Error:", error);
        document.body.innerHTML = `<h2 class="text-center mt-5">Tour not found. <a href="index.html">Go Back</a></h2>`;
    }
}

document.addEventListener('DOMContentLoaded', loadTourDetails);