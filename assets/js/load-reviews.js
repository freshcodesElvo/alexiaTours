async function fetchApprovedReviews() {
    const container = document.getElementById('reviews-container');
    
    try {
        const response = await fetch('https://alexia-tours-backend-production.up.railway.app/api/reviews/approved');
        const reviews = await response.json();

        if (reviews.length === 0) {
            container.innerHTML = `<p class="text-center">No reviews yet. Be the first to share your experience!</p>`;
            return;
        }

        container.innerHTML = reviews.map(review => `
            <div class="review-card">
                ${review.booking_id ? `<span class="verified-badge"><i class="bi bi-patch-check-fill"></i> Verified Traveler</span>` : ''}
                <div class="text-warning mb-2">
                    ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                </div>
                <p class="review-text">"${review.review_text}"</p>
                <hr>
                <div class="reviewer-info">
                    <strong>${review.customer_name}</strong>
                    <p class="text-muted" style="font-size: 0.8rem;">
                        ${new Date(review.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Error fetching reviews:", error);
        container.innerHTML = `<p class="text-center text-danger">Couldn't load reviews right now.</p>`;
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', fetchApprovedReviews);