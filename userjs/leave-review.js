document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const customerName = urlParams.get('name');
    const bookingId = urlParams.get('booking');

    // 1. Personalize the welcome message
    if (customerName) {
        document.getElementById("welcome-msg").innerText = `Welcome Back, ${customerName}!`;
    }

    const form = document.getElementById("verifiedReviewForm");
    const statusDiv = document.getElementById("statusMessage");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const reviewData = {
            customer_name: customerName || "Verified Guest",
            rating: document.getElementById("rating").value,
            review_text: document.getElementById("reviewText").value,
            booking_id: bookingId // Optional: helps you track which booking this is for
        };

        try {
            const response = await fetch("https://alexia-tours-backend-production.up.railway.app/api/reviews/submit", {
             

                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reviewData)
            });

            if (response.ok) {
                statusDiv.innerHTML = `<h4 class="text-success mt-3">Asante Sana!</h4><p>Your review has been shared with our team.</p>`;
                form.style.display = "none"; // Hide form after success
            } else {
                throw new Error("Failed to submit");
            }
        } catch (error) {
            statusDiv.innerHTML = `<p class="text-danger">Oops! Something went wrong. Please try again.</p>`;
        }
    });
});