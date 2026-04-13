// Ensure this matches your Railway production URL
const API_URL = "https://alexia-tours-backend-production.up.railway.app/api/reviews";

async function loadReviews() {
    try {
        const response = await fetch(`${API_URL}/admin/all`);
        const reviews = await response.json();
        renderTable(reviews);
    } catch (error) {
        console.error("Error loading reviews:", error);
    }
}

function renderTable(reviews) {
    const tableBody = document.getElementById("reviewsTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = reviews.map(review => `
        <tr>
            <td>
                <div class="fw-bold">${review.customer_name}</div>
                <small class="text-muted">ID: #${review.id}</small>
            </td>
            <td><span class="text-muted">${review.destination || 'General Inquiry'}</span></td>
            <td>
                <span class="text-warning">
                    ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                </span>
            </td>
            <td>
                <div class="text-wrap" style="max-width: 300px; font-size: 0.9rem;">
                    "${review.review_text}"
                </div>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(review.status)}">
                    ${review.status.toUpperCase()}
                </span>
            </td>
            <td class="text-center">
                <div class="btn-group">
                    ${review.status !== 'approved' ? 
                        `<button class="btn btn-sm btn-outline-success" onclick="updateReviewStatus(${review.id}, 'approved')">
                            <i class="bi bi-check-circle"></i> Approve
                        </button>` : 
                        `<button class="btn btn-sm btn-outline-secondary" onclick="updateReviewStatus(${review.id}, 'hidden')">
                            <i class="bi bi-eye-slash"></i> Hide
                        </button>`
                    }
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteReview(${review.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'approved': return 'bg-success text-white';
        case 'hidden': return 'bg-secondary text-white';
        default: return 'bg-warning text-dark'; // For 'pending'
    }
}

async function updateReviewStatus(id, newStatus) {
    try {
        const response = await fetch(`${API_URL}/admin/status/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            loadReviews(); // Refresh the table automatically
        } else {
            const err = await response.json();
            alert("Update failed: " + err.error);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

async function deleteReview(id) {
    if (!confirm("Are you sure you want to permanently delete this review? This cannot be undone.")) return;

    try {
        const response = await fetch(`${API_URL}/admin/delete/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            loadReviews();
        }
    } catch (error) {
        console.error("Delete error:", error);
    }
}

// Search filter logic
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#reviewsTableBody tr');
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    });
}

// Initial fetch
loadReviews();