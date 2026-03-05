const BASE_URL = "https://alexia-tours-backend-production.up.railway.app"; 
const API_URL = `${BASE_URL}/api/hotel-bookings/admin/all`; // Ensure this matches your route

async function loadAdminBookings() {
    const tableBody = document.getElementById("admin-bookings-table");
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center">Loading bookings...</td></tr>`;

    try {
        const res = await fetch(API_URL);
        const bookings = await res.json();

        tableBody.innerHTML = ""; // Clear loader

        bookings.forEach(b => {
            const dateReceived = new Date(b.created_at).toLocaleDateString();
            const checkIn = new Date(b.check_in).toLocaleDateString();
            const checkOut = new Date(b.check_out).toLocaleDateString();

            tableBody.innerHTML += `
                <tr>
                    <td><small class="text-muted">${dateReceived}</small></td>
                    <td>
                        <div class="fw-bold">${b.customer_name}</div>
                        <small>${b.customer_email}</small>
                    </td>
                    <td><span class="badge bg-info text-dark">${b.hotel_name}</span></td>
                    <td>${checkIn} <i class="ri-arrow-right-line"></i> ${checkOut}</td>
                    <td>
                        <div>${b.room_type}</div>
                        <small>${b.guests} Guest(s)</small>
                    </td>
                    <td>
                        <a href="mailto:${b.customer_email}?subject=Booking Inquiry: ${b.hotel_name}" 
                           class="btn btn-sm btn-primary">
                           <i class="ri-mail-send-line"></i> Reply
                        </a>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading data.</td></tr>`;
    }
}
function exportToCSV() {
    // Check for the TBODY ID specifically
    const tableBody = document.getElementById("admin-bookings-table");
    
    if (!tableBody) {
        console.error("Error: Could not find the table element with ID 'bookingsTable'");
        alert("System error: Table not found. Please refresh the page.");
        return;
    }

    let csvContent = "ID,Customer Name,Email,Hotel,Check-In,Status\n";
    const rows = tableBody.querySelectorAll("tr");
    
    // Check if there are actual data rows (not just the loading message)
    if (rows.length === 0 || rows[0].innerText.includes("Loading") || rows[0].innerText.includes("No data")) {
        alert("There is no booking data available to export yet.");
        return;
    }

    rows.forEach(row => {
        const cols = row.querySelectorAll("td");
        if (cols.length > 0) {
            const rowData = Array.from(cols)
                .slice(0, 6) // Grabs the first 6 columns
                .map(col => {
                    // Clean the text: remove extra spaces and escape quotes
                    let content = col.innerText.replace(/\s+/g, ' ').trim();
                    return `"${content.replace(/"/g, '""')}"`;
                })
                .join(",");
            csvContent += rowData + "\n";
        }
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Alexia_Hotels_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
document.addEventListener("DOMContentLoaded", loadAdminBookings);

