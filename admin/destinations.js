const API = "https://alexia-tours-backend-production.up.railway.app/api/destinations";

let modal = new bootstrap.Modal(
    document.getElementById("destinationModal")
);

// --- 1. PREVIEW IMAGE LOGIC ---
// Updated to a safer selector that handles dynamic image state changes gracefully
const destinationImageInput = document.getElementById("destinationImage");
if (destinationImageInput) {
    destinationImageInput.addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
            const preview = document.getElementById("destinationPreview");
            preview.src = URL.createObjectURL(file);
            preview.style.display = "block";
        }
    });
}

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
                ? d.image
                : "https://placehold.co/70x50?text=No+Image";

            const descriptionSnippet = d.description && d.description.length > 50 
                ? d.description.substring(0, 50) + "..." 
                : (d.description || "-");

            // Safeguard row IDs whether database engine references via .id or ._id attributes
            const currentId = d.id || d._id;

            table.innerHTML += `
            <tr>
                <td>${currentId}</td>
                <td><img src="${imageSrc}" class="destination-img" style="width:70px; height:50px; object-fit:cover; border-radius:4px;" alt="Cover"></td>
                <td><strong>${d.name}</strong></td>
                <td>${descriptionSnippet}</td>
                <td>
                    <button onclick="editDestination(${currentId})" class="btn btn-icon" style="font-size: 1.5rem; color: blue" title="Edit">
                        <ion-icon name="create-outline"></ion-icon>
                    </button>
                    <button onclick="deleteDestination(${currentId})" class="btn btn-icon" style="font-size: 1.5rem; color: red" title="Delete">
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
    document.getElementById("destinationName").value = "";
    document.getElementById("destinationDescription").value = "";
    document.getElementById("destinationImage").value = "";
    const preview = document.getElementById("destinationPreview");
    preview.src = "";
    preview.style.display = "none";
}

// --- 4. SAVE DESTINATION ---
async function saveDestination() {
    const id = document.getElementById("destinationId").value;
    const name = document.getElementById("destinationName").value.trim();
    const description = document.getElementById("destinationDescription").value.trim();
    const imageFile = document.getElementById("destinationImage").files[0];

    if (!name) {
        alert("Name field parameters are required.");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    
    if (imageFile) {
        formData.append("image", imageFile);
    }

    try {
        const url = id ? `${API}/${id}` : API;
        const method = id ? "PUT" : "POST";

        const res = await fetch(url, {
            method: method,
            body: formData
            // Note: Keep Content-Type omitted so browser sets boundary properties automatically
        });

        if (!res.ok) throw new Error("Save operational update pipeline failed.");

        modal.hide();
        clearForm();
        loadDestinations();
        alert("Destination metrics saved successfully!");
    } catch (error) {
        console.error(error);
        alert("Error saving destination data to railway remote host.");
    }
}

// --- 5. EDIT DESTINATION ---
async function editDestination(id) {
    try {
        const res = await fetch(`${API}/${id}`);
        if (!res.ok) throw new Error("Destination document path dropped.");
        const d = await res.json();

        // Populate fields using uniquely namespaced element IDs
        document.getElementById("destinationId").value = d.id || d._id;
        document.getElementById("destinationName").value = d.name || "";
        document.getElementById("destinationDescription").value = d.description || "";
        
        const preview = document.getElementById("destinationPreview");
        if (d.image) {
            preview.src = d.image;
            preview.style.display = "block";
        } else {
            preview.style.display = "none";
        }

        document.getElementById("destinationImage").value = "";

        modal.show();
    } catch (error) {
        console.error(error);
        alert("Failed to load target destination data details.");
    }
}

// --- 6. DELETE DESTINATION ---
async function deleteDestination(id) {
    if (!confirm("Are you certain you want to remove this destination entry permanently?")) return;

    try {
        const res = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete execution context rejected.");
        loadDestinations();
    } catch (error) {
        console.error(error);
        alert("Error deleting destination from data cluster.");
    }
}

// INITIAL LOAD
loadDestinations();