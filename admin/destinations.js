const API = "https://alexia-tours-backend-production.up.railway.app/api/destinations";
const IMAGE_BASE = "https://alexia-tours-backend-production.up.railway.app/uploads/";

let modal = new bootstrap.Modal(
    document.getElementById("destinationModal")
);

// --- 1. PREVIEW IMAGE LOGIC ---
document.getElementById("image").addEventListener("change", function() {
    const file = this.files[0];
    if (file) {
        const preview = document.getElementById("preview");
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
    }
});

// --- 2. LOAD DESTINATIONS ---
async function loadDestinations() {
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("Failed to fetch destinations");
        
        const data = await res.json();
        const table = document.getElementById("destinationsTable");
        table.innerHTML = "";

        data.forEach(d => {
            const imageSrc = d.image 
                ? `${IMAGE_BASE}${d.image}`
                : "https://placehold.co/70x50?text=No+Image";

                // Create a short snippet for the table view
    const descriptionSnippet = d.description && d.description.length > 50 
        ? d.description.substring(0, 50) + "..." 
        : (d.description || "-");

            table.innerHTML += `
            <tr>
                <td>${d.id}</td>
                <td><img src="${imageSrc}" class="destination-img" style="width:70px; height:50px; object-fit:cover; border-radius:4px;"></td>
                <td><strong>${d.name}</strong></td>
                <td>${descriptionSnippet || "-"}</td>
                <td>
                    <button onclick="editDestination(${d.id})" class="btn btn-icon" style="font-size: 1.5rem; color: blue">
                        <ion-icon name="create-outline"></ion-icon>
                    </button>
                    <button onclick="deleteDestination(${d.id})" class="btn btn-icon" style="font-size: 1.5rem; color: red">
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </td>
            </tr>`;
        });
    } catch (error) {
        console.error(error);
        alert("Failed to load destinations");
    }
}

// --- 3. FORM ACTIONS ---
function openModal() {
    clearForm();
    modal.show();
}

function clearForm() {
    document.getElementById("destinationId").value = "";
    document.getElementById("name").value = "";
    document.getElementById("description").value = "";
    document.getElementById("image").value = "";
    const preview = document.getElementById("preview");
    preview.src = "";
    preview.style.display = "none";
}

// --- 4. SAVE DESTINATION (FIXED: Uses FormData) ---
async function saveDestination() {
    const id = document.getElementById("destinationId").value;
    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const imageFile = document.getElementById("image").files[0];

    if (!name) {
        alert("Name is required");
        return;
    }

    // Prepare Multipart Data
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    
    // Only add image if a new file was actually picked
    if (imageFile) {
        formData.append("image", imageFile);
    }

    try {
        const url = id ? `${API}/${id}` : API;
        const method = id ? "PUT" : "POST";

        const res = await fetch(url, {
            method: method,
            body: formData 
            // IMPORTANT: Do NOT set 'Content-Type' header here. 
            // The browser sets it automatically with the boundary for FormData.
        });

        if (!res.ok) throw new Error("Save failed");

        modal.hide();
        clearForm();
        loadDestinations();
        alert("Success!");
    } catch (error) {
        console.error(error);
        alert("Error saving destination");
    }
}

// --- 5. EDIT DESTINATION (FIXED: Previews Image instead of setting input value) ---
async function editDestination(id) {
    try {
        const res = await fetch(`${API}/${id}`);
        if (!res.ok) throw new Error("Destination not found");
        const d = await res.json();

        // Fill text fields
        document.getElementById("destinationId").value = d.id;
        document.getElementById("name").value = d.name || "";
        document.getElementById("description").value = d.description || "";
        
        // Handle image preview
        const preview = document.getElementById("preview");
        if (d.image) {
            preview.src = `${IMAGE_BASE}${d.image}`;
            preview.style.display = "block";
        } else {
            preview.style.display = "none";
        }

        // Reset the file input so it stays empty (Fixes the InvalidStateError)
        document.getElementById("image").value = "";

        modal.show();
    } catch (error) {
        console.error(error);
        alert("Failed to load destination");
    }
}

// --- 6. DELETE DESTINATION ---
async function deleteDestination(id) {
    if (!confirm("Delete destination?")) return;

    try {
        const res = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
        loadDestinations();
    } catch (error) {
        console.error(error);
        alert("Error deleting destination");
    }
}

// INITIAL LOAD
loadDestinations();