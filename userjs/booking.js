const BOOKING_API = "https://alexia-tours-backend-production.up.railway.app/api/bookings";

// --- 1. LIVE SUMMARY LOGIC ---
const updateSummary = () => {
    const tourName = document.getElementById('tourOfInterest').value;
    const adults = document.getElementById('numAdults').value || 0;
    const children = document.getElementById('numChildren').value || 0;
    const startDate = document.getElementById('preferredDates').value;

    // Update the Summary Card text
    document.getElementById('sumTourName').innerText = tourName || "Select a Tour";
    document.getElementById('sumTravelers').innerText = `${adults} Adult(s), ${children} Child(ren)`;
    document.getElementById('sumStartDate').innerText = startDate || "Not selected";

    // Simple pricing: 5000 per adult, 2500 per child
    const total = (adults * 5000) + (children * 2500);
    document.getElementById('sumTotal').innerText = `KSH ${total.toLocaleString()}`;
};

// Attach listeners to update summary on any input change
['numAdults', 'numChildren', 'preferredDates', 'tourOfInterest'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', updateSummary);
    document.getElementById(id)?.addEventListener('input', updateSummary);
});

// --- 2. FORM SUBMISSION LOGIC ---
// Look for the form. Note: In your HTML it has no ID, so we use querySelector
document.querySelector('form').addEventListener('submit', async function (e) {
    // CRITICAL: Stop the 405 error
    e.preventDefault();

    // Bootstrap validation check
    if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add("was-validated");
        return;
    }

    const bookingData = {
        full_name: document.getElementById('bookingFullName').value,
        email: document.getElementById('bookingEmail').value,
        phone: document.getElementById('bookingPhone').value,
        nationality: document.getElementById('bookingNationality').value,
        adults: parseInt(document.getElementById('numAdults').value),
        children: parseInt(document.getElementById('numChildren').value),
        start_date: document.getElementById('preferredDates').value,
        tour_name: document.getElementById('tourOfInterest').value,
        special_requests: document.getElementById('specialRequests').value
    };

    try {
        const res = await fetch(BOOKING_API, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData)
        });

        if (res.ok) {
            alert("Success! Your booking request has been sent.");
            this.reset();
            this.classList.remove('was-validated');
            updateSummary(); // Reset summary display
        } else {
            const errorData = await res.json();
            alert("Submission failed: " + (errorData.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Connection Error:", error);
        alert("Cannot connect to the server. Please check if your backend is running on port 5000.");
    }
});