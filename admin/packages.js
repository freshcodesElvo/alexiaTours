// const { document } = require("postcss")

const API = "http://localhost:5000/api/packages"

async function loadPackages(){
    const res = await fetch(API)
    const packages = await res.json()
    const table = document.getElementById("packagesTable")

    table.innerHTML= " "

    packages.forEach(pkg =>{
        const tr = document.createElement("tr")
        tr.innerHTML = `
        <td>${pkg.id}</td>
        <td>${pkg.title}</td>
        <td>${pkg.destination_name || "-"}</td>
        <td>${pkg.price}</td>
        <td>${pkg.duration_days} Days / ${pkg.duration_nights} Nights</td>

        <td>

        <button onclick="editPackage(${pkg.id})" 
        class="btn btn-primary btn-sm me-1">
        Edit
        </button>

        <button onclick="deletePackage(${pkg.id})" 
        class="btn btn-danger btn-sm">
        Delete
        </button>

        </td>


        `

        table.appendChild(tr)
    })
}




async function savePackage() {

    const id = document.getElementById("packageId").value;

    const data = {
        title: document.getElementById("title").value.trim(),
        price: document.getElementById("price").value,
        duration_days: document.getElementById("days").value,
        duration_nights: document.getElementById("nights").value,
        destination_id: document.getElementById("destination").value,
        image: document.getElementById("image").value,
        description: document.getElementById("description").value,
    };

    // VALIDATION
    if (!data.title || !data.price || !data.destination_id) {
        alert("Please fill in all required fields");
        return;
    }

    if (data.price <= 0) {
        alert("Price must be greater than zero");
        return;
    }

    try {

        let response;

        // ✅ UPDATE mode
        if (id) {

            response = await fetch(`${API}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

        }
        // ✅ CREATE mode
        else {

            response = await fetch(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

        }

        if (response.ok) {

            alert(id ? "Package updated successfully" : "Package created successfully");

            const modal = bootstrap.Modal.getInstance(
                document.getElementById("packageModal")
            );

            modal.hide();

            loadPackages();

        } else {

            alert("Server error");

        }

    } catch (error) {

        console.error(error);

    }

}


async function editPackage(id) {

    const res = await fetch(`${API}/${id}`);

    const pkg = await res.json();

    document.getElementById("packageId").value = pkg.id;

    document.getElementById("title").value = pkg.title;
    document.getElementById("price").value = pkg.price;
    document.getElementById("days").value = pkg.duration_days;
    document.getElementById("nights").value = pkg.duration_nights;
    document.getElementById("destination").value = pkg.destination_id;
    document.getElementById("image").value = pkg.image;
    document.getElementById("description").value = pkg.description;

    new bootstrap.Modal(
        document.getElementById("packageModal")
    ).show();

}

async function deletePackage(id){
    if(!confirm("Delete packege?")) return;
    await fetch(`${API}/${id}`,{
        method: "DELETE"
    })
    loadPackages()
}
loadPackages()