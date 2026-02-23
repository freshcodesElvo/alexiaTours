async function loadDashboard() {
    try {
        const res = await fetch("http://localhost:5000/api/stats");
        const data = await res.json();

        // Update counts
        document.getElementById("count-messages").innerText = data.unreadMessages;
        document.getElementById("count-hotels").innerText = data.totalHotels;
        document.getElementById("count-visas").innerText = data.totalVisas;

        // Load recent messages list
        const list = document.getElementById("recent-messages-list");
        list.innerHTML = data.recentMessages.map(m => `
            <tr>
                <td><strong>${m.name}</strong></td>
                <td class="text-muted">${m.subject || 'No Subject'}</td>
                <td class="text-end small">${new Date(m.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');

    } catch (err) {
        console.error("Error loading dashboard stats:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadDashboard);