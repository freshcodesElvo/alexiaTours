// const { document } = require("postcss")

const API = "https://alexia-tours-backend-production.up.railway.app/api/packages"
const IMAGE_BASE = "https://alexia-tours-backend-production.up.railway.app/uploads/";


async function loadPackages() {
    try {
        const res = await fetch(API);
        const packages = await res.json();
        const table = document.getElementById("packagesTable");

        if (!table) return;
        table.innerHTML = ""; // Clear existing rows

        packages.forEach(pkg => {
            const tr = document.createElement("tr");

            // Handle the image path correctly
            // If pkg.image exists, it should just be the filename (e.g., "1710293.jpg")
            const imgSrc = pkg.image 
                ? `${IMAGE_BASE}${pkg.image}` 
                : 'https://placehold.co/50x40?text=No+Img';

            tr.innerHTML = `
                <td class="align-middle">${pkg.id}</td>
                <td class="align-middle">
                    <div class="d-flex align-items-center">
                        <img src="${imgSrc}" 
                             alt="${pkg.title}"
                             style="width:60px; height:45px; object-fit:cover; border-radius:6px; margin-right:12px; border: 1px solid #ddd;">
                        <span class="fw-bold">${pkg.title}</span>
                    </div>
                </td>
                <td class="align-middle">${pkg.destination_name || '<span class="text-muted small">Not Set</span>'}</td>
                <td class="align-middle text-success fw-bold">KSH ${Number(pkg.price).toLocaleString()}</td>
                <td class="align-middle">${pkg.duration_days}D / ${pkg.duration_nights}N</td>
                <td class="align-middle text-nowrap">
                    <button onclick="editPackage(${pkg.id})" 
                            class="btn btn-icon p-0 me-2" style="font-size: 1.4rem; color: #0d6efd" title="Edit package">
                        <ion-icon name="create-outline"></ion-icon>
                    </button>

                    <button onclick="deletePackage(${pkg.id})" 
                            class="btn btn-icon p-0" style="font-size: 1.4rem; color: #dc3545" title="Delete package">
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </td>
            `;

            table.appendChild(tr);
        });
    } catch (error) {
        console.error("Failed to load packages:", error);
    }
}

async function savePackage() {
    const id = document.getElementById("packageId").value;
    const imageFile = document.getElementById("imageInput").files[0];

    // Use FormData instead of a plain object
    const formData = new FormData();
    formData.append("title", document.getElementById("title").value.trim());
    formData.append("price", document.getElementById("price").value);
    formData.append("duration_days", document.getElementById("days").value);
    formData.append("duration_nights", document.getElementById("nights").value);
    formData.append("destination_id", document.getElementById("destination").value);
    formData.append("description", document.getElementById("description").value);
    
    // Append the file if selected
    if (imageFile) {
        formData.append("image", imageFile);
    }

    if (!document.getElementById("title").value || !document.getElementById("price").value) {
        alert("Please fill in required fields");
        return;
    }

    try {
        let response;
        if (id) {
            // UPDATE
            response = await fetch(`${API}/${id}`, {
                method: "PUT",
                // IMPORTANT: Do NOT set Content-Type header when using FormData
                body: formData 
            });
        } else {
            // CREATE
            response = await fetch(API, {
                method: "POST",
                body: formData
            });
        }

        if (response.ok) {
            alert(id ? "Updated!" : "Created!");
            bootstrap.Modal.getInstance(document.getElementById("packageModal")).hide();
            // Reset form and preview
            document.getElementById("packageForm").reset();
            document.getElementById("imagePreview").style.display = 'none';
            loadPackages();
        } else {
            alert("Upload failed. Check backend console.");
        }
    } catch (error) {
        console.error("Save Error:", error);
    }
}
async function populateDestinations() {
    try {
        const res = await fetch("https://alexia-tours-backend-production.up.railway.app/api/destinations");
        const destinations = await res.json();
        const select = document.getElementById("destination");
        
        // Keep the first default option
        select.innerHTML = '<option value="">-- Select Destination --</option>';
        
        destinations.forEach(dest => {
            const option = document.createElement("option");
            option.value = dest.id; // This is what goes to the DB
            option.textContent = dest.name; // This is what the Admin sees
            select.appendChild(option);
        });
    } catch (err) {
        console.error("Error loading destinations for dropdown:", err);
    }
}

// Call this when the page loads
document.addEventListener("DOMContentLoaded", () => {
    loadPackages();
    populateDestinations();
});



async function editPackage(id) {
    try {
        const res = await fetch(`${API}/${id}`);
        const pkg = await res.json();

        // Fill text fields
        document.getElementById("packageId").value = pkg.id;
        document.getElementById("title").value = pkg.title;
        document.getElementById("price").value = pkg.price;
        document.getElementById("days").value = pkg.duration_days;
        document.getElementById("nights").value = pkg.duration_nights;
        document.getElementById("description").value = pkg.description;

        // Handle the Dropdown (Select the correct destination)
        const select = document.getElementById("destination");
        select.value = pkg.destination_id; 

        // Handle the Image Preview
        const preview = document.getElementById("imagePreview");
        if (pkg.image) {
            preview.src = `${IMAGE_BASE}${pkg.image}`;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }

        // Show the modal
        new bootstrap.Modal(document.getElementById("packageModal")).show();
    } catch (err) {
        console.error("Error fetching package details:", err);
    }
}

async function deletePackage(id){
    if(!confirm("Delete packege?")) return;
    await fetch(`${API}/${id}`,{
        method: "DELETE"
    })
    loadPackages()
}
loadPackages()