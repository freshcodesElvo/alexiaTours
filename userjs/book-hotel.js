const API_HOTELS = "http://localhost:5000/api/hotels";
const API_BOOKINGS = "http://localhost:5000/api/hotel-bookings"; // You'll need this endpoint

async function initBooking() {
    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = urlParams.get('hotel_id');

    if (!hotelId) {
        alert("Please select a hotel first!");
        window.location.href = "hotels.html";
        return;
    }

    // Load Summary Info
    try {
        const res = await fetch(`${API_HOTELS}/${hotelId}`);
        const hotel = await res.json();
        
        document.getElementById('hotel-id').value = hotel.id;
        document.getElementById('summary-hotel-name').innerText = hotel.name;
        document.getElementById('summary-location').innerText = hotel.location;
        document.getElementById('summary-price').innerText = `Ksh ${Number(hotel.price_per_night).toLocaleString()}`;
    } catch (e) {
        console.error("Error loading summary", e);
    }
}

// Handle Form Submission
document.getElementById('hotel-booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const res = await fetch(API_BOOKINGS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert("Booking request sent successfully! We will contact you shortly.");
            window.location.href = "index.html";
        }
    } catch (error) {
        alert("Error sending booking. Please try again.");
    }
});

document.addEventListener('DOMContentLoaded', initBooking);