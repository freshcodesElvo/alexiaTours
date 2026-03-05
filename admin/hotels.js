const API = "http://localhost:5000/api/hotels";
const IMAGE_BASE = "http://localhost:5000/uploads/";
let hotelModalInstance;

// Wait for DOM to load to prevent "backdrop" undefined error
document.addEventListener("DOMContentLoaded", () => {
    const modalEl = document.getElementById("hotelModal");
    if (modalEl) {
        hotelModalInstance = new bootstrap.Modal(modalEl);
    }
    loadHotels();

    // Image Preview listener
    document.getElementById("image").addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
            const preview = document.getElementById("preview");
            preview.src = URL.createObjectURL(file);
            preview.style.display = "block";
        }
    });
});

async function loadHotels() {
    const res = await fetch(API);
    const data = await res.json();
    const table = document.getElementById("hotelsTable");
    table.innerHTML = "";

    data.forEach(h => {
        table.innerHTML += `
        <tr>
            <td>${h.id}</td>
            <td><img src="${IMAGE_BASE}${h.image}" class="destination-img"></td>
            <td>${h.name}</td>
            <td>${h.location}</td>
            <td>KSH ${h.price}</td>
            <td>
                <button  onclick="editHotel(${h.id})" 
                class="btn btn-icon" style="font-size: 1.5rem; color: blue" title="Edit hotel">
                    <ion-icon name="create-outline"></ion-icon>

                </button>
                <button  onclick="deleteHotel(${h.id})"
                 class="btn btn-icon" style="font-size: 1.5rem; color: red" title="Delete hotel">
            <ion-icon name="trash-outline"></ion-icon>

                </button>
            </td>
        </tr>`;
    });
}

function openAddModal() {
    document.getElementById("hotelId").value = "";
    document.getElementById("name").value = "";
    document.getElementById("location").value = "";
    document.getElementById("price").value = "";
    document.getElementById("description").value = "";
    document.getElementById("image").value = "";
    document.getElementById("preview").style.display = "none";
    hotelModalInstance.show();
}

async function saveHotel() {
    const id = document.getElementById("hotelId").value;
    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("location", document.getElementById("location").value);
    formData.append("price", document.getElementById("price").value);
    formData.append("description", document.getElementById("description").value);

    const file = document.getElementById("image").files[0];
    if (file) formData.append("image", file);

    const method = id ? "PUT" : "POST";
    const url = id ? `${API}/${id}` : API;

    await fetch(url, { method, body: formData });
    hotelModalInstance.hide();
    loadHotels();
}

async function editHotel(id) {
    const res = await fetch(`${API}/${id}`);
    const h = await res.json();

    document.getElementById("hotelId").value = h.id;
    document.getElementById("name").value = h.name;
    document.getElementById("location").value = h.location;
    document.getElementById("price").value = h.price;
    document.getElementById("description").value = h.description;

    if (h.image) {
        const preview = document.getElementById("preview");
        preview.src = IMAGE_BASE + h.image;
        preview.style.display = "block";
    }
    hotelModalInstance.show();
}

async function deleteHotel(id) {
    if (!confirm("Delete hotel?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadHotels();
}