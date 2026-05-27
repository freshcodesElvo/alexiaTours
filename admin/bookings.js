let allBookings = [];      // Master list
let filteredBookings = []; // Filtered list currently displayed
let currentPage = 1;
const rowsPerPage = 5;
const API = "https://alexia-tours-backend-production.up.railway.app/api/bookings";

document.addEventListener("DOMContentLoaded", () => {
    loadBookings();
    document.getElementById("searchInput").addEventListener("input", filterBookings);
});

async function loadBookings() {
    try {
        const response = await fetch(API);
        if (!response.ok) throw new Error("Failed to pull reservation records.");
        allBookings = await response.json();
        filteredBookings = [...allBookings]; 
        displayBookings();
    } catch (error) {
        console.error("Error loading reservation records:", error);
    }
}

function displayBookings() {
    const table = document.getElementById("bookingsTable");
    table.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const paginated = filteredBookings.slice(start, start + rowsPerPage);

    if (paginated.length === 0) {
        table.innerHTML = "<tr><td colspan='7' class='text-center'>No bookings found</td></tr>";
        setupPagination();
        return;
    }

    paginated.forEach(booking => {
        table.innerHTML += `
        <tr>
            <td>${booking.id}</td>
            <td><strong>${booking.full_name}</strong></td>
            <td>${booking.email}</td>
            <td>${booking.tour_name}</td> 
            <td>${new Date(booking.start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
            <td>
                <span class="status ${booking.status}">
                    ${booking.status}
                </span>
            </td>
            <td>
                <button class="btn-icon" onclick="viewDetails(${booking.id})" title="View Details">
                    <ion-icon name="eye-outline"></ion-icon>
                </button>
                <button class="btn-icon" onclick="updateStatus(${booking.id}, 'confirmed')" title="Confirm">
                    <ion-icon name="checkmark-circle-outline" style="color: green;"></ion-icon>
                </button>
                <button class="btn-icon" onclick="updateStatus(${booking.id}, 'completed')" title="Mark as Completed">
                    <ion-icon name="ribbon-outline" style="color: blue;"></ion-icon>
                </button>
                <button class="btn-icon" onclick="updateStatus(${booking.id}, 'cancelled')" title="Cancel">
                    <ion-icon name="close-circle-outline" style="color: orange;"></ion-icon>
                </button>
                <button class="btn-icon" onclick="deleteBooking(${booking.id})" title="Delete">
                    <ion-icon name="trash-outline" style="color: red;"></ion-icon>
                </button>
            </td>
        </tr>`;
    });

    setupPagination();
}

function filterBookings() {
    const search = document.getElementById("searchInput").value.toLowerCase();

    // Secure search mapping across destination fields safely avoiding structural mutations
    filteredBookings = allBookings.filter(b =>
        (b.full_name && b.full_name.toLowerCase().includes(search)) ||
        (b.email && b.email.toLowerCase().includes(search)) ||
        (b.tour_name && b.tour_name.toLowerCase().includes(search))
    );

    currentPage = 1;
    displayBookings();
}

function setupPagination() {
    const pageCount = Math.ceil(filteredBookings.length / rowsPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    if (pageCount <= 1) return;

    for (let i = 1; i <= pageCount; i++) {
        const activeClass = i === currentPage ? 'btn btn-sm btn-primary mx-1' : 'btn btn-sm btn-outline-secondary mx-1';
        pagination.innerHTML += `
            <button class="${activeClass}" onclick="changePage(${i})">${i}</button>
        `;
    }
}

function changePage(page) {
    currentPage = page;
    displayBookings();
}

async function updateStatus(id, status) {
    if (status === 'completed') {
        const confirmComplete = confirm("Marking this as 'Completed' will automatically send a review request email to the customer. Proceed?");
        if (!confirmComplete) return;
    }

    try {
        const response = await fetch(`${API}/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            loadBookings(); 
        } else {
            const errorData = await response.json();
            alert("Error: " + errorData.error);
        }
    } catch (error) {
        console.error("Failed to update status:", error);
    }
}

async function deleteBooking(id) {
    if (!confirm("Are you sure you want to permanently delete this booking?")) return;

    try {
        const response = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (response.ok) {
            loadBookings();
        } else {
            alert("Failed to delete booking.");
        }
    } catch (error) {
        console.error("Delete call failure:", error);
    }
}

// Optimized: Looks up row directly from memory instead of requiring separate GET calls per ID
function viewDetails(id) {
    const booking = allBookings.find(b => b.id === id);
    
    if (!booking) {
        alert("Booking details trace missing locally.");
        return;
    }

    document.getElementById("modallContent").innerHTML = `
        <div class="booking-details-modal-wrapper p-2">
            <h4 class="mb-3 text-primary border-bottom pb-2">${booking.tour_name}</h4>
            <div class="row g-3">
                <div class="col-md-6">
                    <p class="mb-1 text-muted small">Customer Name</p>
                    <p class="fw-bold">${booking.full_name}</p>
                </div>
                <div class="col-md-6">
                    <p class="mb-1 text-muted small">Nationality</p>
                    <p class="fw-bold">${booking.nationality || 'Not specified'}</p>
                </div>
                <div class="col-md-6">
                    <p class="mb-1 text-muted small">Email Address</p>
                    <p class="fw-semibold">${booking.email}</p>
                </div>
                <div class="col-md-6">
                    <p class="mb-1 text-muted small">Phone Number</p>
                    <p class="fw-semibold">${booking.phone || 'N/A'}</p>
                </div>
                <hr class="my-2 text-muted opacity-25">
                <div class="col-md-4">
                    <p class="mb-1 text-muted small">Travel Date</p>
                    <p class="fw-bold text-success">${new Date(booking.start_date).toLocaleDateString()}</p>
                </div>
                <div class="col-md-4">
                    <p class="mb-1 text-muted small">Adults</p>
                    <p class="fw-bold">${booking.adults}</p>
                </div>
                <div class="col-md-4">
                    <p class="mb-1 text-muted small">Children</p>
                    <p class="fw-bold">${booking.children}</p>
                </div>
                <div class="col-12">
                    <p class="mb-1 text-muted small">Special Requests / Notes</p>
                    <div class="p-2 bg-light border rounded text-secondary small" style="min-height: 45px;">
                        ${booking.special_requests || 'No custom requirements indicated.'}
                    </div>
                </div>
                <hr class="my-2 text-muted opacity-25">
                <div class="col-md-6">
                    <p class="mb-1 text-muted small">Payment Gateway Method</p>
                    <span class="badge bg-secondary p-2 uppercase">${booking.payment_method}</span>
                </div>
                <div class="col-md-6">
                    <p class="mb-1 text-muted small">IntaSend Transaction ID</p>
                    <code class="text-dark fw-bold d-block p-1 bg-light border rounded text-center">${booking.transaction_id || 'No transaction attached'}</code>
                </div>
            </div>
        </div>
    `;

    // Fire global bootstrap trigger attached inside your HTML
    window.openModal();
}