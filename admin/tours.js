// --- CONFIGURATION MANAGEMENT CONTEXT ---
const token = sessionStorage.getItem('adminToken');

const LIVE_URL = "https://alexia-tours-backend-production.up.railway.app";
const LOCAL_URL = "http://localhost:5000";

const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? LOCAL_URL
    : LIVE_URL;

const API = `${BASE_URL}/api/tours`; 
const API_ITIN = `${BASE_URL}/api/itineraries`;
const IMAGE_BASE = `${BASE_URL}/uploads/`;

// Initialize both independent Bootstrap modal contexts securely
let modal = new bootstrap.Modal(document.getElementById("tourModal"));
let itineraryModal = new bootstrap.Modal(document.getElementById("itineraryModal"));

// --- 1. CORE TOURS TABLE MANAGEMENT ---
async function loadTours() {
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("Failed to fetch Packages Matrix");
        
        const data = await res.json();
        const table = document.getElementById("toursTable");
        if (!table) return; 
        table.innerHTML = "";

        data.forEach(t => {
            const imageSrc = t.image_path 
                ? `${IMAGE_BASE}${t.image_path.split('/').pop()}` 
                : "https://placehold.co/70x50?text=No+Image";

            table.innerHTML += `
            <tr>
                <td>${t.id}</td>
                <td><img src="${imageSrc}" class="tour-img-preview"></td>
                <td><strong>${t.title}</strong></td>
                <td><span class="badge bg-info text-dark">${t.category}</span></td>
                <td>USD ${Number(t.price).toLocaleString()}</td>
                <td>${t.duration || "-"}</td>
                <td class="text-center">
                    <button onclick="openItineraryManager(${t.id}, '${t.title.replace(/'/g, "\\'")}')" class="btn btn-icon me-1" style="color: #F99E1C; border:none; background:none;" title="Build Itinerary Mapping">
                        <i class="bi bi-calendar3" style="font-size: 1.35rem;"></i>
                    </button>
                    <button onclick="editTour(${t.id})" class="btn btn-icon me-1" style="color: blue; border:none; background:none;" title="Edit Core Specifications">
                        <ion-icon name="create-outline" style="font-size: 1.45rem;"></ion-icon>
                    </button>
                    <button onclick="deleteTour(${t.id})" class="btn btn-icon" style="color: red; border:none; background:none;" title="Drop Asset Package">
                        <ion-icon name="trash-outline" style="font-size: 1.45rem;"></ion-icon>
                    </button>
                </td>
            </tr>`;
        });
    } catch (error) {
        console.error("Load Error Logging Workspace:", error);
        if (document.getElementById("toursTable")) {
            alert("Network link dropped: Unable to reach data synchronization gateway.");
        }
    }
}

// --- 2. PARENT TOUR CONSOLE ACTION ACTIONS ---
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
    if (imageFile) formData.append("image", imageFile);

    if (!document.getElementById("title").value) return alert("Tour Package title requires structural naming validation inputs.");

    try {
        const url = id ? `${API}/${id}` : API;
        const method = id ? "PUT" : "POST";

        const res = await fetch(url, {
            method: method,
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData 
        });

        if (res.status === 401 || res.status === 403) {
            alert("Credential window tracking out of validation space. Please sign back in.");
            window.location.href = 'login.html';
            return;
        }

        if (!res.ok) throw new Error("Save rejected");

        modal.hide();
        loadTours();
        alert(id ? "Asset package parameters modified!" : "New signature package seeded successfully!");
    } catch (error) {
        console.error("Save Error:", error);
        alert("Transaction failed synchronizing data array payloads.");
    }
}

async function editTour(id) {
    try {
        const res = await fetch(`${API}/${id}`);
        if (!res.ok) throw new Error("Tour missing context stack traces");
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
            preview.src = `${IMAGE_BASE}${t.image_path.split('/').pop()}`;
            preview.style.display = "block";
        }

        document.getElementById("modalTitle").innerText = "Edit Tour Core Specifications";
        modal.show();
    } catch (error) {
        console.error("Edit Tracking Parameter Extraction Interrupted:", error);
        alert("Failed extracting target database rows data attributes.");
    }
}

async function deleteTour(id) {
    if (!confirm("Are you absolutely sure you want to delete this tour asset package? This action cascades down and wipes its complete itinerary history concurrently!")) return;

    try {
        const res = await fetch(`${API}/${id}`, { 
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
            window.location.href = 'login.html';
            return;
        }

        if (!res.ok) throw new Error("Deletion execution protocol rejected");
        
        loadTours();
        alert("Tour operational index tracking context dropped clean.");
    } catch (error) {
        console.error("Delete Command Trace Exception:", error);
        alert("Operational structural breakdown executing server-side deletion commands.");
    }
}

// --- 3. NEW: ITINERARY CONSOLE INTERACTION LOGIC ---
async function openItineraryManager(tourId, tourTitle) {
    document.getElementById("itinTourId").value = tourId;
    document.getElementById("itineraryModalTourTitle").innerText = tourTitle;
    
    // Clear itinerary input workflow fields cleanly
    document.getElementById("itinDayNumber").value = "";
    document.getElementById("itinDayTitle").value = "";
    document.getElementById("itinDayDescription").value = "";
    document.getElementById("itinAccommodation").value = "";
    document.getElementById("itinMeals").value = "";
    
    await fetchAndRenderItineraryDays(tourId);
    itineraryModal.show();
}

async function fetchAndRenderItineraryDays(tourId) {
    const streamTimelineContainer = document.getElementById("itineraryTimelineList");
    streamTimelineContainer.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-warning spinner-border-sm" role="status"></div> Reading chronological logs...</div>`;
    
    try {
        // Fetch through our newly added child relation map query router endpoint
        const response = await fetch(`${API_ITIN}/tour/${tourId}`);
        if (!response.ok) throw new Error("Data tracing failure reading itineraries schema data blocks");
        
        const dayRows = await response.json();
        
        if (dayRows.length === 0) {
            streamTimelineContainer.innerHTML = `
                <div class="alert alert-light border text-center text-muted p-4 my-3">
                    <i class="bi bi-calendar-x d-block fs-3 mb-2 text-secondary"></i>
                    No itinerary sequencing records exist for this package asset yet. Use the subform on the left to inject your first operational map node.
                </div>`;
            return;
        }
        
        streamTimelineContainer.innerHTML = dayRows.map(day => `
            <div class="p-3 mb-3 border rounded bg-white shadow-sm position-relative">
                <button onclick="dropItineraryNode(${day.id}, ${day.tour_id})" class="btn p-1 border-0 position-absolute" style="top:10px; right:14px; color:#dc3545; background:none;" title="Drop Day Sequence">
                    <i class="bi bi-trash-fill fs-5"></i>
                </button>
                <div class="d-flex align-items-center gap-2 mb-2">
                    <span class="badge bg-dark text-white px-2.5 py-1.5 fw-bold">Day ${day.day_number}</span>
                    <h6 class="fw-bold text-dark mb-0">${day.day_title}</h6>
                </div>
                <p class="small text-secondary mb-2" style="white-space: pre-line;">${day.day_description}</p>
                <div class="row g-1 text-muted border-top pt-2" style="font-size: 11px; font-weight:600;">
                    <div class="col-6"><i class="bi bi-building me-1 text-warning"></i> Lodging: <span class="text-dark">${day.accommodation || 'Not Specified'}</span></div>
                    <div class="col-6"><i class="bi bi-egg-fried me-1 text-warning"></i> Meals: <span class="text-dark">${day.meals_included || 'Not Specified'}</span></div>
                </div>
            </div>
        `).join('');
        
    } catch (err) {
        console.error("Timeline Rendering Interrupt:", err);
        streamTimelineContainer.innerHTML = `<div class="alert alert-danger p-2 small">Error pulling matching layout tracking matrices.</div>`;
    }
}

async function saveItineraryDay() {
    const tour_id = document.getElementById("itinTourId").value;
    const day_number = document.getElementById("itinDayNumber").value;
    const day_title = document.getElementById("itinDayTitle").value.trim();
    const day_description = document.getElementById("itinDayDescription").value.trim();
    const accommodation = document.getElementById("itinAccommodation").value.trim();
    const meals_included = document.getElementById("itinMeals").value.trim();

    if (!day_number || !day_title || !day_description) {
        return alert("Please fill out the Day Number, Headline Title, and Description parameters before trying to sync records.");
    }

    const payload = { tour_id, day_number, day_title, day_description, accommodation, meals_included };

    try {
        const res = await fetch(API_ITIN, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.status === 401 || res.status === 403) {
            alert("Verification ticket tracking error. Re-authenticating panel windows...");
            window.location.href = 'login.html';
            return;
        }

        if (!res.ok) throw new Error("Itinerary save request denied");

        // Flash clean status message inside input panel controls
        alert("Day tracking log map successfully synced!");
        
        // Reset interactive subform fields except the hidden keys index fields
        document.getElementById("itinDayNumber").value = "";
        document.getElementById("itinDayTitle").value = "";
        document.getElementById("itinDayDescription").value = "";
        document.getElementById("itinAccommodation").value = "";
        document.getElementById("itinMeals").value = "";
        
        // Refresh structural data monitoring arrays directly inside the right console box panel
        await fetchAndRenderItineraryDays(tour_id);
    } catch (error) {
        console.error("Save Itinerary Protocol Aborted Error:", error);
        alert("Unable to process request matching current unique index constraint tables rules keys.");
    }
}

async function dropItineraryNode(id, tourId) {
    if (!confirm("Remove this unique single day itinerary tracking cell element from the system live tracking register?")) return;
    
    try {
        const res = await fetch(`${API_ITIN}/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Erase command tracking logic fault trace executed from dashboard controls panel link");

        await fetchAndRenderItineraryDays(tourId);
    } catch (ex) {
        console.error("Drop Tracking Exception Trace Context:", ex);
        alert("An error occurred executing delete sequences on the remote execution database pipeline.");
    }
}

// INITIAL SEEDING LAUNCH
loadTours();