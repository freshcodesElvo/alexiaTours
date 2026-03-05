const API = "http://localhost:5000/api/visa-services";
const IMAGE_BASE = "http://localhost:5000/uploads/";
let visaModalInstance;

document.addEventListener("DOMContentLoaded", () => {
    const modalEl = document.getElementById("visaModal");
    if (modalEl) {
        visaModalInstance = new bootstrap.Modal(modalEl);
    }
    loadVisaServices();

    document.getElementById("image").addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
            const preview = document.getElementById("preview");
            preview.src = URL.createObjectURL(file);
            preview.style.display = "block";
        }
    });
});

async function loadVisaServices() {
    const res = await fetch(API);
    const data = await res.json();

    const table = document.getElementById("visaTable");
    table.innerHTML = "";

    data.forEach(v => {
    const statusValue = v.status ? v.status.toLowerCase() : "active";
    const badge = statusValue === "active" 
        ? `<span class="badge bg-success">Active</span>` 
        : `<span class="badge bg-secondary">Inactive</span>`;

    // Create the image URL
    const imgUrl = v.image ? `${IMAGE_BASE}${v.image}` : '';

    table.innerHTML += `
    <tr>
        <td>${v.id}</td>
        <td>
            <img src="${imgUrl}" class="destination-img" 
                 onerror="this.onerror=null; this.src='https://placehold.co/70x50?text=No+Img'">
        </td>
        <td>${v.country}</td>
        <td>${v.visa_type || "-"}</td>
        <td>${v.processing_time}</td>
        <td>KSH ${v.price}</td>
        <td>${badge}</td>
        <td>
            <button onclick="editVisa(${v.id})" class="btn btn-icon" style="color: blue">
                <ion-icon name="create-outline"></ion-icon>
            </button>
            <button onclick="deleteVisa(${v.id})" class="btn btn-icon" style="color: red">
                <ion-icon name="trash-outline"></ion-icon>
            </button>
        </td>
    </tr>`;
});
}

function openAddModal() {
    document.getElementById("visaId").value = "";
    document.getElementById("country").value = "";
    document.getElementById("visa_type").value = "";
    document.getElementById("processing_time").value = "";
    document.getElementById("price").value = "";
    document.getElementById("description").value = "";
    document.getElementById("preview").style.display = "none";
    // Using the correct instance name
    visaModalInstance.show();
}

async function saveVisa() {
    const id = document.getElementById("visaId").value;
    const formData = new FormData();

    formData.append("country", document.getElementById("country").value);
    formData.append("visa_type", document.getElementById("visa_type").value);
    formData.append("processing_time", document.getElementById("processing_time").value);
    formData.append("price", document.getElementById("price").value);
    formData.append("description", document.getElementById("description").value);
    
    const statusSelect = document.getElementById("status");
    formData.append("status", statusSelect ? statusSelect.value : "active");

    const file = document.getElementById("image").files[0];
    if (file) {
        formData.append("image", file);
    }

    const method = id ? "PUT" : "POST";
    const url = id ? `${API}/${id}` : API;

    await fetch(url, { method, body: formData });
    
    visaModalInstance.hide();
    loadVisaServices();
}

async function editVisa(id) {
    const res = await fetch(`${API}/${id}`);
    const v = await res.json();

    document.getElementById("visaId").value = v.id;
    document.getElementById("country").value = v.country;
    document.getElementById("visa_type").value = v.visa_type;
    document.getElementById("processing_time").value = v.processing_time;
    document.getElementById("price").value = v.price;
    document.getElementById("description").value = v.description;
    
    if(v.image) {
        const preview = document.getElementById("preview");
        preview.src = IMAGE_BASE + v.image;
        preview.style.display = "block";
    }

    visaModalInstance.show();
}

async function deleteVisa(id) {
    if (!confirm("Delete visa service?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadVisaServices();
}