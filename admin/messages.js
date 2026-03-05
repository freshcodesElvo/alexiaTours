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
    try {
        const res = await fetch(`${API}/${id}`);
        if (!res.ok) throw new Error("Could not fetch message details");
        const m = await res.json();

        // 1. Fill modal text
        document.getElementById("viewName").innerText = m.name;
        document.getElementById("viewEmail").innerText = m.email;
        document.getElementById("viewSubject").innerText = m.subject || "No Subject";
        document.getElementById("viewMessage").innerText = m.message;

        // 2. CONFIGURE REPLY BUTTON
        const replyBtn = document.getElementById("replyBtn");
        if (replyBtn) {
            const emailTo = m.email;
            const emailSubject = `Re: ${m.subject || 'Inquiry from Alexia Tours'}`;
            const emailBody = `Hi ${m.name},\n\n---\nRegarding your message:\n"${m.message}"\n\n`;

            replyBtn.onclick = () => {
                window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            };
        }

        // 3. FIX: Use 'messageModal' (not 'modal')
        if (messageModal) {
            messageModal.show();
        } else {
            console.error("Modal instance is not initialized.");
        }

        // 4. Mark as read logic
        if (m.status === "unread") {
            await fetch(`${API}/${id}/read`, { method: "PUT" });
            // Optional: Don't reload the whole table immediately to avoid "flicker" 
            // while the modal is open, but it's okay to keep for now.
            loadMessages(); 
        }
    } catch (err) {
        console.error("Error opening message:", err);
        alert("Could not load message details.");
    }
}

// Fixed Delete Function (Ensure name matches the HTML/Logic)
async function deleteMessage(id) {
    if (!confirm("Delete this message?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadMessages();
}