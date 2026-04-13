const API_URL = "https://alexia-tours-backend-production.up.railway.app/api/reviews";

async function loadReviews() {
    try {
        const response = await fetch(`${API_URL}/admin/all`);
        const data = await response.json();

        // Check if data is actually an array before trying to render
        if (Array.isArray(data)) {
            renderTable(data);
        } else {
            console.error("Expected array but got:", data);
            document.getElementById("reviewsTableBody").innerHTML = 
                `<tr><td colspan="6" class="text-center text-danger">Error: ${data.error || 'Unknown error'}</td></tr>`;
        }
    } catch (error) {
        console.error("Error loading reviews:", error);
    }
}
function renderTable(reviews) {
    const tableBody = document.getElementById("reviewsTableBody");
    tableBody.innerHTML = reviews.map(review => `
        <tr>
            <td><div class="fw-bold">${review.customer_name}</div></td>
            <td><span class="text-muted">${review.destination || 'General'}</span></td>
            <td>
                <span class="text-warning">
                    ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                </span>
            </td>
            <td><div class="text-truncate" style="max-width: 250px;">${review.review_text}</div></td>
            <td>
                <span class="badge ${getStatusClass(review.status)}">
                    ${review.status.toUpperCase()}
                </span>
            </td>
            <td class="text-center">
                <div class="btn-group">
                    ${review.status !== 'approved' ? 
                        `<button class="btn btn-sm btn-outline-success" onclick="updateReviewStatus(${review.id}, 'approved')">
                            <i class="bi bi-check-lg"></i> Approve
                        </button>` : ''
                    }
                    ${review.status !== 'hidden' ? 
                        `<button class="btn btn-sm btn-outline-danger" onclick="updateReviewStatus(${review.id}, 'hidden')">
                            <i class="bi bi-eye-slash"></i> Hide
                        </button>` : ''
                    }
                </div>
            </td>
        </tr>
    `).join('');
}

function getStatusClass(status) {
    switch(status) {
        case 'approved': return 'bg-success-subtle text-success border border-success';
        case 'hidden': return 'bg-danger-subtle text-danger border border-danger';
        default: return 'bg-warning-subtle text-warning-emphasis border border-warning';
    }
}

async function updateReviewStatus(id, status) {
    if(!confirm(`Are you sure you want to set this review to ${status}?`)) return;

    try {
        const response = await fetch(`${API_URL}/admin/status/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            loadReviews(); // Refresh the list
        }
    } catch (error) {
        alert("Error updating status");
    }
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#reviewsTableBody tr');
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
});

loadReviews();