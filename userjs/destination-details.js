const BASE_URL = "http://localhost:5000"; // Use your IP for phone testing
const API_DESTINATIONS = `${BASE_URL}/api/destinations`;
const IMAGE_BASE = `${BASE_URL}/uploads/`;

async function fetchDestinationDetails() {
    // 1. Get ID from URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const destId = urlParams.get('id');

    if (!destId) {
        window.location.href = 'index.html'; // Redirect if no ID found
        return;
    }

    try {
        const res = await fetch(`${API_DESTINATIONS}/${destId}`);
        if (!res.ok) throw new Error("Destination not found");
        
        const dest = await res.json();

        // 2. Update the DOM
        document.title = `${dest.name} | Alexia's Tours`;
        document.getElementById('dest-name').innerText = dest.name;
        const descriptionContainer = document.getElementById('dest-description');
        if (dest.description) {
            // Split text by new lines and filter out empty strings
            const paragraphs = dest.description.split('\n').filter(p => p.trim() !== "");
            
            // Map each string to a <p> tag with a nice bottom margin
            descriptionContainer.innerHTML = paragraphs
                .map(p => `<p class="mb-4">${p.trim()}</p>`)
                .join('');
        }
        
        const heroBg = document.getElementById('hero-bg');
        const imageSrc = dest.image ? `${IMAGE_BASE}${dest.image}` : 'pictures/placeholder.jpg';
        heroBg.style.backgroundImage = `url('${imageSrc}')`;
        document.getElementById("why-vist").innerHTML = `Why Visit ${dest.name}`

    } catch (error) {
        console.error(error);
        document.querySelector('.container').innerHTML = `<h2 class="text-center py-5">Destination Details not found.</h2>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchDestinationDetails);