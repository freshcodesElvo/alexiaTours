// const BOOKING_API = "https://alexia-tours-backend-production.up.railway.app/api/bookings";

// // --- 1. LIVE SUMMARY LOGIC ---
// const updateSummary = () => {
//     const tourName = document.getElementById('tourOfInterest').value;
//     const adults = document.getElementById('numAdults').value || 0;
//     const children = document.getElementById('numChildren').value || 0;
//     const startDate = document.getElementById('preferredDates').value;

//     // Update the Summary Card text
//     document.getElementById('sumTourName').innerText = tourName || "Select a Tour";
//     document.getElementById('sumTravelers').innerText = `${adults} Adult(s), ${children} Child(ren)`;
//     document.getElementById('sumStartDate').innerText = startDate || "Not selected";

//     // Simple pricing: 5000 per adult, 2500 per child
//     const total = (adults * 5000) + (children * 2500);
//     document.getElementById('sumTotal').innerText = `KSH ${total.toLocaleString()}`;
// };

// // Attach listeners to update summary on any input change
// ['numAdults', 'numChildren', 'preferredDates', 'tourOfInterest'].forEach(id => {
//     document.getElementById(id)?.addEventListener('change', updateSummary);
//     document.getElementById(id)?.addEventListener('input', updateSummary);
// });

// // --- 2. FORM SUBMISSION LOGIC ---
// // Look for the form. Note: In your HTML it has no ID, so we use querySelector
// document.querySelector('form').addEventListener('submit', async function (e) {
//     // CRITICAL: Stop the 405 error
//     e.preventDefault();

//     // Bootstrap validation check
//     if (!this.checkValidity()) {
//         e.stopPropagation();
//         this.classList.add("was-validated");
//         return;
//     }

//     const bookingData = {
//         full_name: document.getElementById('bookingFullName').value,
//         email: document.getElementById('bookingEmail').value,
//         phone: document.getElementById('bookingPhone').value,
//         nationality: document.getElementById('bookingNationality').value,
//         adults: parseInt(document.getElementById('numAdults').value),
//         children: parseInt(document.getElementById('numChildren').value),
//         start_date: document.getElementById('preferredDates').value,
//         tour_name: document.getElementById('tourOfInterest').value,
//         special_requests: document.getElementById('specialRequests').value
//     };

//     try {
//         const res = await fetch(BOOKING_API, {
//             method: 'POST',
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(bookingData)
//         });

//         if (res.ok) {
//             alert("Success! Your booking request has been sent.");
//             this.reset();
//             this.classList.remove('was-validated');
//             updateSummary(); // Reset summary display
//         } else {
//             const errorData = await res.json();
//             alert("Submission failed: " + (errorData.error || "Unknown error"));
//         }
//     } catch (error) {
//         console.error("Connection Error:", error);
//         alert("Cannot connect to the server. Please check if your backend is running on port 5000.");
//     }
// });


const BOOKING_API = "https://alexia-tours-backend-production.up.railway.app/api/bookings";

// --- 1. LIVE SUMMARY LOGIC (Keep this as is) ---
const updateSummary = () => {
    // ... your existing code ...
    const adults = document.getElementById('numAdults').value || 0;
    const children = document.getElementById('numChildren').value || 0;
    const total = (adults * 5000) + (children * 2500);
    document.getElementById('sumTotal').innerText = `KSH ${total.toLocaleString()}`;
    return total; // Return total for the payment logic
};

// --- 2. FORM SUBMISSION & PAYMENT LOGIC ---
document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();

    if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add("was-validated");
        return;
    }

    const totalAmount = updateSummary();
    const customerEmail = document.getElementById('bookingEmail').value;
    const customerName = document.getElementById('bookingFullName').value;

    // Initialize IntaSend
    const intasend = new window.IntaSend({
        publicAPIKey: "ISPubKey_test_90aca16d-6b14-45f0-bf30-ab6084a7f082", // REPLACE WITH YOUR SANDBOX KEY
        live: false // Set to true when ready for real money
    });

    // Launch the payment modal
    intasend.run({
        amount: totalAmount,
        currency: "KES",
        email: customerEmail,
        first_name: customerName.split(' ')[0],
        last_name: customerName.split(' ')[1] || ""
    });

    // Handle Payment Completion
    intasend.on("COMPLETE", async (results) => {
        const bookingData = {
            full_name: customerName,
            email: customerEmail,
            phone: document.getElementById('bookingPhone').value,
            nationality: document.getElementById('bookingNationality').value,
            adults: parseInt(document.getElementById('numAdults').value),
            children: parseInt(document.getElementById('numChildren').value),
            start_date: document.getElementById('preferredDates').value,
            tour_name: document.getElementById('tourOfInterest').value,
            special_requests: document.getElementById('specialRequests').value,
            // New payment tracking fields
            transaction_id: results.invoice_id, 
            payment_method: results.provider
        };

        try {
            const res = await fetch(BOOKING_API, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData)
            });

            if (res.ok) {
                alert(`Asante! Payment of KSH ${totalAmount} confirmed. Your booking is secured.`);
                this.reset();
                updateSummary();
            }
        } catch (error) {
            console.error("Database Save Error:", error);
            alert("Payment was successful, but we had trouble saving your booking. Please contact booking@alexiastours.co.ke with your transaction ID: " + results.invoice_id);
        }
    });
});