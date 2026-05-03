// --- CONFIGURATION ---
const token = sessionStorage.getItem('adminToken');

/**
 * DYNAMIC API ROUTING
 * This automatically detects if you are running locally or in production.
 * Replace 'alexia-tours-backend-production.up.railway.app' with your actual Railway domain.
 */
const LIVE_URL = "https://alexia-tours-backend-production.up.railway.app";
const LOCAL_URL = "http://localhost:5000";

const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? LOCAL_URL
    : LIVE_URL;

const API = `${BASE_URL}/api/tours`; 
const IMAGE_BASE = `${BASE_URL}/uploads/`;

// Update modal ID to match the one in your HTML
let modal = new bootstrap.Modal(document.getElementById("tourModal"));

// --- 1. PREVIEW IMAGE LOGIC ---
document.getElementById("imageInput").addEventListener("change", function() {
    const file = this.files[0];
    if (file) {
        const preview = document.getElementById("preview");
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
    }
});

// --- 2. LOAD TOURS (Public) ---
async function loadTours() {
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("Failed to fetch Tours");
        
        const data = await res.json();
        const table = document.getElementById("toursTable");
        table.innerHTML = "";

        data.forEach(t => {
            // Clean up image path formatting
            const imageSrc = t.image_path 
                ? `${IMAGE_BASE}${t.image_path.replace('./uploads/', '').replace('uploads/', '')}` 
                : "https://placehold.co/70x50?text=No+Image";

            table.innerHTML += `
            <tr>
                <td>${t.id}</td>
                <td><img src="${imageSrc}" class="tour-img-preview" style="width:70px; height:50px; object-fit:cover; border-radius:5px;"></td>
                <td><strong>${t.title}</strong></td>
                <td><span class="badge bg-info text-dark">${t.category}</span></td>
                <td>USD ${Number(t.price).toLocaleString()}</td>
                <td>${t.duration || "-"}</td>
                <td>
                    <button onclick="editTour(${t.id})" class="btn btn-icon" style="color: blue; border:none; background:none;">
                        <ion-icon name="create-outline" style="font-size: 1.5rem;"></ion-icon>
                    </button>
                    <button onclick="deleteTour(${t.id})" class="btn btn-icon" style="color: red; border:none; background:none;">
                        <ion-icon name="trash-outline" style="font-size: 1.5rem;"></ion-icon>
                    </button>
                </td>
            </tr>`;
        });
    } catch (error) {
        console.error("Load Error:", error);
        // Silently fail if the table isn't on the current page, otherwise alert
        if (document.getElementById("toursTable")) {
            alert("Connection error: Could not reach the server.");
        }
    }
}

// --- 3. FORM ACTIONS ---
function openModal() {
    clearForm();
    document.getElementById("modalTitle").innerText = "Add New Tour";
    modal.show();
}

function clearForm() {
    document.getElementById("tourId").value = "";
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("price").value = "";
    document.getElementById("duration").value = "";
    document.getElementById("category").value = "Safari";
    document.getElementById("is_trending").checked = false;
    document.getElementById("imageInput").value = "";
    const preview = document.getElementById("preview");
    preview.src = "";
    preview.style.display = "none";
}

// --- 4. SAVE TOUR (Protected) ---
async function saveTour() {
    const id = document.getElementById("tourId").value;
    
    const formData = new FormData();
    formData.append("title", document.getElementById("title").value.trim());
    formData.append("description", document.getElementById("description").value.trim());
    formData.append("category", document.getElementById("category").value);
    formData.append("price", document.getElementById("price").value);
    formData.append("duration", document.getElementById("duration").value.trim());
    formData.append("is_trending", document.getElementById("is_trending").checked);
    
    const imageFile = document.getElementById("imageInput").files[0];
    if (imageFile) {
        formData.append("image", imageFile);
    }

    if (!document.getElementById("title").value) return alert("Title is required");

    try {
        const url = id ? `${API}/${id}` : API;
        const method = id ? "PUT" : "POST";

        const res = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}` 
            },
            body: formData 
        });

        if (res.status === 401 || res.status === 403) {
            alert("Session expired. Please login again.");
            window.location.href = 'login.html';
            return;
        }

        if (!res.ok) throw new Error("Save failed");

        modal.hide();
        loadTours();
        alert(id ? "Tour Updated!" : "Tour Added!");
    } catch (error) {
        console.error("Save Error:", error);
        alert("Error saving tour. Check your internet connection or server logs.");
    }
}

// --- 5. EDIT TOUR ---
async function editTour(id) {
    try {
        const res = await fetch(`${API}/${id}`);
        if (!res.ok) throw new Error("Tour not found");
        const t = await res.json();

        document.getElementById("tourId").value = t.id;
        document.getElementById("title").value = t.title || "";
        document.getElementById("description").value = t.description || "";
        document.getElementById("price").value = t.price || "";
        document.getElementById("duration").value = t.duration || "";
        document.getElementById("category").value = t.category || "Safari";
        document.getElementById("is_trending").checked = t.is_trending == 1;

        const preview = document.getElementById("preview");
        if (t.image_path) {
            const fileName = t.image_path.replace('./uploads/', '').replace('uploads/', '');
            preview.src = `${IMAGE_BASE}${fileName}`;
            preview.style.display = "block";
        }

        document.getElementById("modalTitle").innerText = "Edit Tour";
        modal.show();
    } catch (error) {
        console.error("Edit Error:", error);
        alert("Failed to load tour details");
    }
}

// --- 6. DELETE TOUR ---
async function deleteTour(id) {
    if (!confirm("Are you sure you want to delete this tour?")) return;

    try {
        const res = await fetch(`${API}/${id}`, { 
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.status === 401 || res.status === 403) {
            alert("Session expired. Please login again.");
            window.location.href = 'login.html';
            return;
        }

        if (!res.ok) throw new Error("Delete failed");
        
        loadTours();
        alert("Tour Deleted!");
    } catch (error) {
        console.error("Delete Error:", error);
        alert("Error deleting tour");
    }
}

// INITIAL LOAD
loadTours();