const API = "http://localhost:5000/api/destinations";
const IMAGE_BASE = "http://localhost:5000/uploads/";

let modal = new bootstrap.Modal(
    document.getElementById("destinationModal")
);
// PREVIEW IMAGE
document.getElementById("image").addEventListener("change", function(){

    const file = this.files[0];

    if(file){

        const preview = document.getElementById("preview");

        preview.src = URL.createObjectURL(file);

        preview.style.display = "block";

    }

});

// LOAD DESTINATIONS
async function loadDestinations(){

    try{

        const res = await fetch(API);

        if(!res.ok) throw new Error("Failed to fetch destinations");

        const data = await res.json();

        const table = document.getElementById("destinationsTable");

        table.innerHTML = "";

        data.forEach(d => {

            const imageSrc = d.image 
                ? `${IMAGE_BASE}${d.image}`
: "https://placehold.co/70x50?text=No+Image";
            table.innerHTML += `
            <tr>

                <td>${d.id}</td>

                <td>
                    <img src="${imageSrc}" class="destination-img">
                </td>

                <td>
                    <strong>${d.name}</strong>
                </td>

                <td>
                    ${d.description || "-"}
                </td>

                <td>

                    <button 
                    onclick="editDestination(${d.id})"
                    class="btn btn-icon" style="font-size: 1.5rem; color: blue" title="Edit destination">
                    <ion-icon name="create-outline"></ion-icon>

                        

                    </button>

                    <button 
                    onclick="deleteDestination(${d.id})"
                     class="btn btn-icon" style="font-size: 1.5rem; color: red" title="Delete destination">
            <ion-icon name="trash-outline"></ion-icon>

                    </button>

                </td>

            </tr>
            `;
        });

    }catch(error){

        console.error(error);
        alert("Failed to load destinations");

    }
}


// OPEN MODAL (ADD MODE)
function openModal(){

    clearForm();

    modal.show();

}


// CLEAR FORM
function clearForm(){

    document.getElementById("destinationId").value = "";
    document.getElementById("name").value = "";
    document.getElementById("description").value = "";
    document.getElementById("image").value = "";

}


// save destinations
async function saveDestination(){

    const id = document.getElementById("destinationId").value;

    const data = {

        name: document.getElementById("name").value.trim(),
        description: document.getElementById("description").value.trim(),
        image: document.getElementById("image").value.trim()

    };

    if(!data.name){

        alert("Name is required");
        return;

    }

    try{

        let res;

        // edit destinations
        if(id && id !== ""){

            res = await fetch(`${API}/${id}`,{

                method:"PUT",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(data)

            });

        }

        // create destinations
        else{

            res = await fetch(API,{

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(data)

            });

        }

        if(!res.ok) throw new Error("Save failed");

        modal.hide();

        clearForm();

        loadDestinations();
        alert("Success")

    }catch(error){

        console.error(error);

        alert("Error saving destination");

    }

}


// EDIT DESTINATION
async function editDestination(id){

    try{

        if(!id){

            alert("Invalid destination ID");
            return;

        }

        const res = await fetch(`${API}/${id}`);

        if(!res.ok) throw new Error("Destination not found");

        const d = await res.json();

        if(!d){

            alert("Destination not found");
            return;

        }

        document.getElementById("destinationId").value = d.id;
        document.getElementById("name").value = d.name || "";
        document.getElementById("description").value = d.description || "";
        document.getElementById("image").value = d.image || "";

        modal.show();

    }catch(error){

        console.error(error);

        alert("Failed to load destination");

    }

}


// DELETE DESTINATION
async function deleteDestination(id){

    if(!confirm("Delete destination?")) return;

    try{

        const res = await fetch(`${API}/${id}`,{

            method:"DELETE"

        });

        if(!res.ok) throw new Error("Delete failed");

        loadDestinations();

    }catch(error){

        console.error(error);

        alert("Error deleting destination");

    }

}


// INITIAL LOAD
loadDestinations();