const API = "http://localhost:5000/api/bookings";

function formatDate(dateString){
    if(!dateString){
        return "-";
    }
    const date = new Date(dateString)

    return date.toLocaleDateString("en-KE", {
        day: "numeric",
        month: "long",
        year: "numeric"
    })

}

function getStatusClass(status){
    if(status === "confirmed") return "bg-success";
    if(status === "cancelled") return "bg-danger";

    return "bg-warning text-dark"

}
// async function loadBookings() {
//     const res = await fetch(API);
//     const bookings = await res.json();

//     const table = document.getElementById("bookingsTable");
//     table.innerHTML = "";

//     let total = bookings.length;
//     let pending  = 0;
//     let confirmed = 0;
//     let cancelled = 0;
//     //document.getElementById("bookingCount").innerText = bookings.length;


//     bookings.forEach(booking => {

//         if (booking.status === pending) pending++;
//         if(booking.status === confirmed) confirmed++;
//         if(booking.status === cancelled)  cancelled++;
//         const tr = document.createElement("tr");

//         tr.innerHTML = `
//         <td>${booking.id}</td>
//         <td>${booking.full_name}</td>
//         <td>${booking.email}</td>
//         <td>${booking.destination || "-"}</td>
//         <td>${formatDate(booking.travel_date)}</td>
//         <td>
//         <span class ="badge ${getStatusClass(booking.status)}">
//         ${booking.status}
//         </span>
//         </td>
//         <td>

//         ${
//             booking.status !== "confirmed"
//             ? `<button onclick="updateStatus(${booking.id}, 'confirmed')" class="btn btn-success btn-sm me-1">Confirm</button>`
//             : ""
//         }

//         ${
//             booking.status !== "cancelled"
//             ? `<button onclick="updateStatus(${booking.id}, 'cancelled')" class="btn btn-danger btn-sm">Cancel</button>`
//             : ""
//         }

//         </td>

//         `;

//         table.appendChild(tr);
        
//     });
//     document.getElementById("totalBookings").innerHTML = total;
//     document.getElementById("pendingBookings").innerHTML = pending;
//     document.getElementById("confirmedBookings").innerHTML = confirmed;
//     document.getElementById("cancelledBookings").innerHTML = cancelled;

// }


async function loadBookings() {

    const res = await fetch(API);
    const bookings = await res.json();

    const table = document.getElementById("bookingsTable");
    table.innerHTML = "";

    // Stats counters
    let total = bookings.length;
    let pending = 0;
    let confirmed = 0;
    let cancelled = 0;

    bookings.forEach(booking => {

        if(booking.status === "pending") pending++;
        if(booking.status === "confirmed") confirmed++;
        if(booking.status === "cancelled") cancelled++;

        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td>${booking.id}</td>
        <td>${booking.full_name}</td>
        <td>${booking.email}</td>
        <td>${booking.destination || "-"}</td>
        <td>${formatDate(booking.travel_date)}</td>

        <td>
        <span class="badge ${getStatusClass(booking.status)}">
        ${booking.status}
        </span>
        </td>

        <td>

        ${
        booking.status !== "confirmed"
        ? `<button onclick="updateStatus(${booking.id}, 'confirmed')" class="btn btn-success btn-sm me-1">Confirm</button>`
        : ""
        }

        ${
        booking.status !== "cancelled"
        ? `<button onclick="updateStatus(${booking.id}, 'cancelled')" class="btn btn-danger btn-sm">Cancel</button>`
        : ""
        }

        </td>
        `;

        table.appendChild(tr);

    });

    // Update stats UI
    document.getElementById("totalBookings").innerText = total;
    document.getElementById("pendingBookings").innerText = pending;
    document.getElementById("confirmedBookings").innerText = confirmed;
    document.getElementById("cancelledBookings").innerText = cancelled;

}


async function updateStatus(id, status) {
    await fetch(`${API}/${id}/status`,{
        method: "PUT",
        headers:{
            "Content-Type": "application/json"
        },
        body:JSON.stringify({status})

    })

    loadBookings();
}
loadBookings()