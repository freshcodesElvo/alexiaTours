const API = "https://alexia-tours-backend-production.up.railway.app/api/stats"
async function loadDashboard() {
    try {
        const res = await fetch(API);
        const data = await res.json();

        // 1. Update your Stats Counts
        document.getElementById("count-messages").innerText = data.unreadMessages;
        document.getElementById("count-hotels").innerText = data.totalHotels;
        document.getElementById("count-visas").innerText = data.totalVisas;
        // document.getElementById("count-packages").innerText = data.totalPackages; // Add if you have this query

        // 2. Load the recent messages list
        const list = document.getElementById("recent-messages-list");
        list.innerHTML = data.recentMessages.map(m => `
            <tr>
                <td><strong>${m.name}</strong></td>
                <td class="text-muted">${m.subject || 'No Subject'}</td>
                <td class="text-end small">${new Date(m.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');

        // 3. RIGHT HERE: Update System Health
        const storageStatus = document.getElementById("storage-status");
        if (data) {
            storageStatus.innerText = "ONLINE";
            storageStatus.className = "text-success fw-bold";
        }

    } catch (err) {
        console.error("Error loading dashboard stats:", err);
        
        // Handle the "Offline" state if the fetch fails
        const storageStatus = document.getElementById("storage-status");
        if (storageStatus) {
            storageStatus.innerText = "OFFLINE";
            storageStatus.className = "text-danger fw-bold";
        }
    }
}
async function markAllRead(event) {
    // Prevent the card from flipping back immediately if desired
    event.stopPropagation();

    if (!confirm("Mark all messages as read?")) return;

    try {
        const res = await fetch("https://cc4c-102-215-77-202.ngrok-free.app/api/messages/read-all", {
            method: "PUT"
        });

        if (res.ok) {
            // Refresh the dashboard stats to see the count drop to 0
            loadDashboard(); 
            
            // Optional: Small toast or alert
            console.log("Messages updated!");
        }
    } catch (err) {
        console.error("Bulk update failed:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadDashboard);