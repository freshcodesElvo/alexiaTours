let allBookings = []; // Master list (stays unchanged by filters)
let filteredBookings = []; // The list currently being shown
let currentPage = 1;
const rowsPerPage = 5;

document.addEventListener("DOMContentLoaded", () => {
    loadBookings();
    document.getElementById("searchInput").addEventListener("input", filterBookings);
});

async function loadBookings() {
    const response = await fetch("http://localhost:5000/api/bookings");
    allBookings = await response.json();
    filteredBookings = [...allBookings]; // Initialize filtered list with all data
    displayBookings();
}

function displayBookings() {
    const table = document.getElementById("bookingsTable");
    table.innerHTML = "";

    // Use filteredBookings instead of allBookings
    const start = (currentPage - 1) * rowsPerPage;
    const paginated = filteredBookings.slice(start, start + rowsPerPage);

    if (paginated.length === 0) {
        table.innerHTML = "<tr><td colspan='7' class='text-center'>No bookings found</td></tr>";
    }

    paginated.forEach(booking => {
        table.innerHTML += `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.full_name}</td>
                <td>${booking.email}</td>
                <td>${booking.destination}</td>
                <td>${new Date(booking.travel_date).toLocaleDateString()}</td>
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
                    <button class="btn-icon" onclick="updateStatus(${booking.id}, 'cancelled')" title="Cancel">
                        <ion-icon name="close-circle-outline" style="color: orange;"></ion-icon>
                    </button>
                    <button class="btn-icon" onclick="deleteBooking(${booking.id})" title="Delete">
                        <ion-icon name="trash-outline" style="color: red;"></ion-icon>
                    </button>
                </td>
            </tr>
        `;
    });

    setupPagination();
}

function filterBookings() {
    const search = document.getElementById("searchInput").value.toLowerCase();

    // Filter from the MASTER list, save into the FILTERED list
    filteredBookings = allBookings.filter(b =>
        (b.full_name && b.full_name.toLowerCase().includes(search)) ||
        (b.email && b.email.toLowerCase().includes(search)) ||
        (b.destination && b.destination.toLowerCase().includes(search))
    );

    currentPage = 1;
    displayBookings();
}

function setupPagination() {
    const pageCount = Math.ceil(filteredBookings.length / rowsPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    if (pageCount <= 1) return; // Don't show pagination if only 1 page

    for (let i = 1; i <= pageCount; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        pagination.innerHTML += `
            <button class="${activeClass}" onclick="changePage(${i})">${i}</button>
        `;
    }
}
// ... keep the rest of your functions (updateStatus, deleteBooking, etc.)
async function fetchDestinationsForDropdown() {
    try {
        const response = await fetch("http://localhost:5000/api/destinations");
        const destinations = await response.json();
        const dropdown = document.getElementById("destination");

        // Clear existing options except the first one
        dropdown.innerHTML = '<option value="">Select a destination</option>';

        destinations.forEach(dest => {
            const option = document.createElement("option");
            option.value = dest.id; // This is the ID the database needs
            option.textContent = dest.name; // This is what the user sees
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading destinations for dropdown:", error);
    }
}

// Call this when the page loads or when the modal opens
document.addEventListener("DOMContentLoaded", fetchDestinationsForDropdown);
function setupPagination() {
    const pageCount = Math.ceil(allBookings.length / rowsPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    for (let i = 1; i <= pageCount; i++) {
        pagination.innerHTML += `
            <button onclick="changePage(${i})">${i}</button>
        `;
    }
}

function changePage(page) {
    currentPage = page;
    displayBookings();
}

function filterBookings() {
    const search = document.getElementById("searchInput").value.toLowerCase();

    allBookings = allBookings.filter(b =>
        b.full_name.toLowerCase().includes(search) ||
        b.email.toLowerCase().includes(search) ||
        b.destination.toLowerCase().includes(search)
    );

    currentPage = 1;
    displayBookings();
}

async function updateStatus(id, status) {
    await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    });

    loadBookings();
}

async function deleteBooking(id) {
    if (!confirm("Delete this booking?")) return;

    await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: "DELETE"
    });

    loadBookings();
}

async function viewDetails(id) {
    const response = await fetch(`http://localhost:5000/api/bookings/${id}`);
    const booking = await response.json();

    document.getElementById("modallContent").innerHTML = `
        <h3>Booking Details</h3>
        <p><strong>Name:</strong> ${booking.full_name}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Service:</strong> ${booking.service_type}</p>
        <p><strong>Destination:</strong> ${booking.destination}</p>
        <p><strong>Travel Date:</strong> ${booking.travel_date}</p>
        <p><strong>Group Size:</strong> ${booking.group_size}</p>
        <p><strong>Message:</strong> ${booking.message}</p>
    `;

    document.getElementById("bookingModal").style.display = "block";
}

function closeModal() {
    document.getElementById("bookingModal").style.display = "none";
}