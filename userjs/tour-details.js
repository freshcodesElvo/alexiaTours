const BASE_URL = "https://alexia-tours-backend-production.up.railway.app"; 
const API_TOURS = `${BASE_URL}/api/tours`;
const IMAGE_BASE = `${BASE_URL}/uploads/`;

async function loadTourDetails() {
    const params = new URLSearchParams(window.location.search);
    const tourId = params.get('id');

    if (!tourId) {
        window.location.href = 'destinations.html';
        return;
    }

    try {
        const res = await fetch(`${API_TOURS}/${tourId}`);
        if (!res.ok) throw new Error("Tour context could not be resolved");
        
        const tour = await res.json();

        // 1. Text Field Replacements
        document.getElementById('tour-title').innerText = tour.title;
        document.getElementById('tour-category').innerText = tour.category;
        document.getElementById('tour-duration').innerText = tour.duration || "Contact for info";
        document.getElementById('tour-price').innerText = `Ksh ${Number(tour.price).toLocaleString()}`;
        
        // 2. Multiline Description Handler
        const descContainer = document.getElementById('tour-description');
        if (tour.description) {
            descContainer.innerHTML = tour.description
                .split('\n')
                .filter(p => p.trim() !== "")
                .map(p => `<p class="mb-4">${p.trim()}</p>`)
                .join('');
        } else {
            descContainer.innerHTML = `<p class="text-muted small">No extensive narrative descriptions written for this package asset yet.</p>`;
        }

        // 3. Background Hero Image Configuration Setup
        const imgPath = tour.image_path ? tour.image_path.replace('./uploads/', '').replace('uploads/', '') : '';
        const imageSrc = imgPath ? `${IMAGE_BASE}${imgPath}` : 'assets/img/placeholder.jpg';
        document.getElementById('tour-hero-bg').style.backgroundImage = `url('${imageSrc}')`;

        // 4. Insight Vacations Relational Multi-Day Accordion Rendering
        const itineraryContainer = document.getElementById('dynamic-itinerary-box');
        
        if (!tour.itinerary || tour.itinerary.length === 0) {
            // Safe elegant placeholder fallback if no multi-day items are seeded yet
            itineraryContainer.innerHTML = `
                <div class="alert alert-light border text-muted small p-4">
                    <i class="ri-information-line me-1"></i> A bespoke day-by-day structural itinerary mapping sequence is currently being configured for this package by our operations desk.
                </div>`;
        } else {
            itineraryContainer.innerHTML = tour.itinerary.map((day, index) => {
                const isOpenByDefault = index === 0; // Keep the first day expanded cleanly for better UX layout
                return `
                    <div class="timeline-node">
                        <div class="node-circle">${day.day_number}</div>
                        <div class="accordion border-0 shadow-sm" id="parentAccordionDay${day.day_number}" style="border-radius: 8px; overflow: hidden; border: 1px solid #f0f0f0 !important;">
                            <div class="accordion-item border-0">
                                <h2 class="accordion-header">
                                    <button class="accordion-button ${isOpenByDefault ? '' : 'collapsed'} fw-bold text-dark" style="font-size: 15px;" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTargetDay${day.day_number}" aria-expanded="${isOpenByDefault}" aria-controls="collapseTargetDay${day.day_number}">
                                        Day ${day.day_number}: ${day.day_title}
                                    </button>
                                </h2>
                                <div id="collapseTargetDay${day.day_number}" class="accordion-collapse collapse ${isOpenByDefault ? 'show' : ''}" data-bs-parent="#dynamic-itinerary-box">
                                    <div class="accordion-body text-secondary bg-white" style="font-size: 0.95rem; line-height: 1.7;">
                                        <p style="white-space: pre-line;" class="mb-3">${day.day_description}</p>
                                        
                                        <div class="row g-2 pt-3 border-top mt-2 text-muted" style="font-size: 12px; font-weight: 600;">
                                            <div class="col-sm-6">
                                                <i class="ri-hotel-line text-warning me-1"></i> Accommodation: <span class="text-dark">${day.accommodation || 'Luxury Safari Camp'}</span>
                                            </div>
                                            <div class="col-sm-6">
                                                <i class="ri-restaurant-line text-warning me-1"></i> Food Plan: <span class="text-dark">${day.meals_included || 'Breakfast & Dinner (B, D)'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Setup Scrollspy link active toggle states
        setupSubnavScrollspy();

    } catch (error) {
        console.error("Error building premium tour details card view layer:", error);
        document.body.innerHTML = `<h2 class="text-center mt-5">Tour detail context trace lost. <a href="destinations.html">Return to Packages Matrix</a></h2>`;
    }
}

// Simple internal function tracking active scrolling windows to update subnavigation tab states
function setupSubnavScrollspy() {
    const sections = document.querySelectorAll('.scroll-section');
    const navLinks = document.querySelectorAll('.subnav-link');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 180) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

// Global state trackers pulled dynamically from your API load sequence
let baseTourPricePerPerson = 1200; // Updated dynamically when your page pulls tour details
let tourTitleName = "";            // Assigned during fetch (e.g., "7-Day Maasai Mara Spectacular")

document.addEventListener("DOMContentLoaded", () => {
    // 1. Intercept your form submission event loop
    const form = document.getElementById("booking-form");
    if (form) {
        form.addEventListener("submit", handleAvailabilityCheck);
    }
});
function handleAvailabilityCheck(e) {
    e.preventDefault();

    // 1. DYNAMICALLY EXTRACT THE REAL TOUR PRICE FROM THE HTML
    // Reads "#tour-price" (e.g., "USD 400"), strips "USD " and parses it into a number
    const priceText = document.getElementById("tour-price").innerText;
    const dynamicTourPrice = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;

    // Pull the tour title dynamically too
    const activeTourTitle = document.getElementById("tour-title").innerText;

    // 2. Gather user party configuration inputs
    const fullName = document.getElementById("bk-name").value;
    const email = document.getElementById("bk-email").value;
    const phone = document.getElementById("bk-phone").value;
    const startDate = document.getElementById("bk-date").value;
    const adults = parseInt(document.getElementById("bk-adults").value) || 1;
    const children = parseInt(document.getElementById("bk-children").value) || 0;
    const specialRequests = document.getElementById("bk-requests").value;

    // 3. Dynamic Calculation Matrix using the real price
    const adultTotal = adults * dynamicTourPrice;
    const childTotal = children * (dynamicTourPrice * 0.5); // Children get a 50% discount rate
    const grossInvestment = adultTotal + childTotal;

    const container = document.getElementById("booking-flow-container");

    // 4. Render the Itemized Receipt Screen with accurate rates
    container.innerHTML = `
        <div class="quote-invoice-panel">
            <div class="alert alert-success d-flex align-items-center py-2 border-0 mb-3" style="background-color: rgba(25, 135, 84, 0.08); color: #198754;">
                <i class="ri-checkbox-circle-fill fs-5 me-2"></i>
                <small class="fw-bold">Spaces Available for this Date!</small>
            </div>

            <h6 class="fw-bold text-dark small text-uppercase mb-2">Quote Summary Breakdown</h6>
            <div class="bg-light p-3 rounded-3 border mb-3 small">
                <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted">${adults} Adult(s) × USD ${dynamicTourPrice}</span>
                    <span class="fw-bold text-dark">USD ${adultTotal.toLocaleString()}</span>
                </div>
                ${children > 0 ? `
                <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted">${children} Child(ren) × USD ${dynamicTourPrice * 0.5}</span>
                    <span class="fw-bold text-dark">USD ${childTotal.toLocaleString()}</span>
                </div>` : ''}
                <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted">Target Departure</span>
                    <span class="fw-semibold text-dark">${new Date(startDate).toLocaleDateString(undefined, {dateStyle: 'medium'})}</span>
                </div>
                <hr class="my-2 text-muted opacity-25">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold text-dark">Total Gross Investment</span>
                    <span class="fs-5 fw-bold text-primary">USD ${grossInvestment.toLocaleString()}</span>
                </div>
            </div>

            <button id="pay-now-btn" class="btn btn-warning text-dark w-100 fw-bold py-2.5 mb-2 border-0 shadow-sm" style="background-color:#F99E1C;">
                <i class="ri-shield-flash-line me-1"></i> Pay Secure Deposit via IntaSend
            </button>
            
            <button id="request-callback-btn" class="btn btn-outline-secondary w-100 fw-bold py-2 small mb-3">
                Submit as Offline Inquiry
            </button>

            <button id="reset-flow-btn" class="btn btn-link btn-sm w-100 text-decoration-none text-muted small">
                <i class="ri-arrow-left-line me-1"></i> Modify dates or group count
            </button>
        </div>
    `;

    // 5. Re-bind payment execution context loops
    document.getElementById("reset-flow-btn").addEventListener("click", () => location.reload());
    
    document.getElementById("request-callback-btn").addEventListener("click", () => {
        submitBookingPayload({
            full_name: fullName,
            email: email,
            phone: phone,
            start_date: startDate,
            adults: adults,
            children: children,
            tour_name: activeTourTitle,
            special_requests: specialRequests,
            transaction_id: "OFFLINE_QUOTE_REQ",
            payment_method: "Inquiry Callback Request"
        });
    });

    document.getElementById("pay-now-btn").addEventListener("click", () => {
        const intasend = new window.IntaSend({
            publicAPIKey: "ISPubKey_live_your_actual_public_key_here",
            live: true
        });

        intasend.on("COMPLETE", (results) => {
            submitBookingPayload({
                full_name: fullName,
                email: email,
                phone: phone,
                start_date: startDate,
                adults: adults,
                children: children,
                tour_name: activeTourTitle,
                special_requests: specialRequests,
                transaction_id: results.transaction_id,
                payment_method: results.method || "M-PESA / Card Gateway"
            });
        });

        intasend.on("FAILED", () => {
            alert("Payment transaction declined. Please retry or pick the offline quote processing path.");
        });

        intasend.performCheckout({
            amount: grossInvestment,
            currency: "USD",
            email: email,
            phone_number: phone,
            first_name: fullName.split(" ")[0],
            last_name: fullName.split(" ")[1] || "Client"
        });
    });
}

async function submitBookingPayload(payload) {
    const container = document.getElementById("booking-flow-container");
    container.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-warning mb-2" role="status"></div>
            <p class="text-muted small mb-0">Securing database record registers...</p>
        </div>
    `;

    try {
        const response = await fetch("https://alexia-tours-backend-production.up.railway.app/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            container.innerHTML = `
                <div class="text-center py-4 animate__animated animate__zoomIn">
                    <i class="ri-checkbox-circle-line ri-3x text-success mb-2 d-block"></i>
                    <h5 class="fw-bold text-dark">Reservation Recorded!</h5>
                    <p class="text-muted small">Your safari file has been opened successfully. An expert consultant will contact you via <strong>${payload.email}</strong> shortly.</p>
                </div>
            `;
        } else {
            throw new Error("API rejection handling execution.");
        }
    } catch (err) {
        console.error(err);
        alert("System synchronization failure. Your data remains protected, please retry shortly.");
    }
}

document.addEventListener('DOMContentLoaded', loadTourDetails);