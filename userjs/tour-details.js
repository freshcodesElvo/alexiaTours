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

document.addEventListener('DOMContentLoaded', loadTourDetails);