const API_HOTELS = "http://localhost:5000/api/hotels";
const IMAGE_BASE = "http://localhost:5000/uploads/";

async function loadHotelDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = urlParams.get('id');

    if (!hotelId) {
        window.location.href = "hotels.html";
        return;
    }

    try {
        const res = await fetch(`${API_HOTELS}/${hotelId}`);
        if (!res.ok) throw new Error("Hotel not found");
        
        const hotel = await res.json();

        // 1. Title and Background
        document.title = `${hotel.name} | Alexia's Tours`;
        document.getElementById("hotel-name").innerText = hotel.name;
        document.getElementById("hotel-location").innerText = hotel.location || "Location not specified";
        
        const hero = document.getElementById("hotel-hero-bg");
        if (hotel.image) {
            hero.style.backgroundImage = `url('${IMAGE_BASE}${hotel.image}')`;
        }

        // 2. Price and Booking Link
        document.getElementById("hotel-price").innerText = `KSH ${Number(hotel.price).toLocaleString()}`;
        document.getElementById("book-link").href = `book.html?hotel_id=${hotel.id}`;

        // 3. Description (Paragraphs)
        const descContainer = document.getElementById("hotel-description");
        if (hotel.description) {
            descContainer.innerHTML = hotel.description
                .split('\n')
                .filter(p => p.trim() !== "")
                .map(p => `<p class="mb-3 text-muted" style="line-height:1.8;">${p.trim()}</p>`)
                .join('');
        }
        // Inside the try block after setting the hotel name/location
        const mapElement = document.getElementById("google-map");
        if (mapElement && hotel.location) {
            // We combine the hotel name and location for better accuracy
            const searchQuery = encodeURIComponent(`${hotel.name}, ${hotel.location}`);
            
            // Using Google's Embed API (No API Key required for basic view)
            mapElement.src = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY_HERE&q=${searchQuery}`;
            
            // ALTERNATIVE: If you don't have an API Key yet, use this simpler version:
            mapElement.src = `https://maps.google.com/maps?q=${searchQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
        }

            // Find the button
const bookBtn = document.getElementById("book-link");

if (bookBtn) {
    // Only set the href if the button actually exists on the page
    bookBtn.href = `book-hotel.html?hotel_id=${hotel.id}`;
} else {
    console.warn("Warning: Element with id 'book-link' not found in HTML.");
}

    } catch (error) {
        console.error("Error loading hotel details:", error);
    }
}

function contactWhatsApp() {
    const hotelName = document.getElementById("hotel-name").innerText;
    const phoneNumber = "+254 728 085 007"; // Your WhatsApp Number
    const message = encodeURIComponent(`Hi Alexia, I'm interested in booking ${hotelName}. Please send me more details.`);
    
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
}
document.addEventListener("DOMContentLoaded", loadHotelDetails);