const API = "http://localhost:5000/api/messages";
let messageModal; // Rename to avoid confusion with the 'modal' keyword

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Modal safely
    const modalEl = document.getElementById("messageModal");
    if (modalEl) {
        messageModal = new bootstrap.Modal(modalEl);
    } else {
        console.error("Modal element not found!");
    }

    // 2. Load the data
    loadMessages();
});

async function loadMessages() {
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("Network response was not ok");
        
        const data = await res.json();
        const table = document.getElementById("messagesTable");
        
        if (!table) return; // Stop if table isn't in HTML yet
        table.innerHTML = "";

        data.forEach(m => {
            const isUnread = m.status === "unread";
            const badge = isUnread 
                ? `<span class="badge bg-danger">Unread</span>` 
                : `<span class="badge bg-light text-dark border">Read</span>`;

            table.innerHTML += `
            <tr>
                <td>${m.id}</td>
                <td>${m.name}</td>
                <td>${m.email}</td>
                <td>${m.subject || "-"}</td>
                <td>${badge}</td>
                <td>${new Date(m.created_at).toLocaleDateString()}</td>
                <td>
                    <button onclick="viewMessage(${m.id})" class="btn btn-sm btn-link text-primary">
                        <ion-icon name="eye-outline" style="font-size: 1.5rem;"></ion-icon>
                    </button>
                    <button onclick="deleteMessage(${m.id})" class="btn btn-sm btn-link text-danger">
                        <ion-icon name="trash-outline" style="font-size: 1.5rem;"></ion-icon>
                    </button>
                </td>
            </tr>`;
        });
    } catch (error) {
        console.error("Error loading messages:", error);
    }
}

// Fixed View Function
async function viewMessage(id) {
    const res = await fetch(`${API}/${id}`);
    const m = await res.json();

    document.getElementById("viewName").innerText = m.name;
    document.getElementById("viewEmail").innerText = m.email;
    document.getElementById("viewSubject").innerText = m.subject || "-";
    document.getElementById("viewMessage").innerText = m.message;

    if (messageModal) {
        messageModal.show();
    }

    if (m.status === "unread") {
        await fetch(`${API}/${id}/read`, { method: "PUT" });
        loadMessages();
    }
}

// Fixed Delete Function (Ensure name matches the HTML/Logic)
async function deleteMessage(id) {
    if (!confirm("Delete this message?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadMessages();
}