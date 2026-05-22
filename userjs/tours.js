function showTourSkeletons(container, count = 4) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "skeleton skeleton-tour";
    container.appendChild(el);
  }
}

function showDestSkeletons(grid, count = 6) {
  grid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const col = document.createElement("div");
    col.className = "destination-card-wrapper me-3";
    col.innerHTML = `<div class="skeleton skeleton-dest" style="min-width:250px; height:250px;"></div>`;
    grid.appendChild(col);
  }
}

async function displayTrendingTours() {
  const container = document.getElementById("tour-container");
  if (!container) return;

  showTourSkeletons(container, 4);

  try {
    const res = await fetch(API_TOURS);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const tours = await res.json();

    container.innerHTML = "";
    const trending = tours.filter(t => t.is_trending == 1);

    if (!trending.length) {
      container.innerHTML = `<p class="text-muted py-4">No trending tours at the moment.</p>`;
      return;
    }

    trending.forEach(tour => {
      const imgPath = tour.image_path
        ? tour.image_path.replace("./uploads/", "").replace("uploads/", "")
        : "";
      const imageSrc = imgPath ? `${IMAGE_BASE}${imgPath}` : "https://placehold.co/400x300";

      const wrapper = document.createElement("div");
      wrapper.className = "tour-card-wrapper me-4";

      const card = document.createElement("div");
      card.className = "card tour-premium-card h-100";

      const imgContainer = document.createElement("div");
      imgContainer.className = "tour-img-container";
      
      const img = lazyImg(imageSrc, tour.title, "");
      imgContainer.appendChild(img);

      const badge = document.createElement("div");
      badge.className = "tour-img-badge";
      badge.innerHTML = `<i class="ri-time-line me-1"></i> ${tour.duration || 'Flexible'}`;
      imgContainer.appendChild(badge);

      const body = document.createElement("div");
      body.className = "card-body d-flex flex-column justify-content-between p-3";
      body.innerHTML = `
        <div>
          <h5 class="tour-premium-title mb-2">${tour.title}</h5>
          <div class="d-flex align-items-center gap-1 mb-3 text-warning small">
            <i class="ri-star-fill"></i>
            <i class="ri-star-fill"></i>
            <i class="ri-star-fill"></i>
            <i class="ri-star-fill"></i>
            <i class="ri-star-fill"></i>
            <span class="text-muted small ms-1">(5.0)</span>
          </div>
        </div>
        
        <div class="d-flex align-items-center justify-content-between pt-3 mt-2 border-top border-light">
          <div>
            <span class="text-uppercase text-muted d-block tracking-wider" style="font-size: 0.7rem; font-weight: 600;">From</span>
            <span class="fw-bold text-dark fs-5">USD ${Number(tour.price).toLocaleString()}</span>
          </div>
          <a href="tour-details.html?id=${tour.id}" class="btn tour-premium-btn btn-outline-warning">
            Details <i class="ri-arrow-right-line ms-1"></i>
          </a>
        </div>
      `;

      card.appendChild(imgContainer);
      card.appendChild(body);
      wrapper.appendChild(card);
      container.appendChild(wrapper);
    });

  } catch (err) {
    console.error("Tours Error:", err);
    container.innerHTML = `<p class="text-danger py-4">Failed to load tours. Please try again later.</p>`;
  }
}

async function displayDestinations() {
  const destGrid = document.getElementById("index-destinations-container");
  if (!destGrid) return;

  showDestSkeletons(destGrid, 6);

  try {
    const res = await fetch(API_DESTINATIONS);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const destinations = await res.json();

    destGrid.innerHTML = "";
    if (!destinations.length) {
      destGrid.innerHTML = `<p class="text-muted py-4">No destinations found.</p>`;
      return;
    }

    destinations.forEach(dest => {
      const imageSrc = dest.image || "https://placehold.co/600x400";
      const shortDesc = dest.description ? dest.description.substring(0, 45) + "..." : "";

      const wrapper = document.createElement("div");
      wrapper.className = "destination-premium-card position-relative overflow-hidden me-3 flex-shrink-0";

      const img = lazyImg(imageSrc, dest.name, "width:100%; height:100%; object-fit:cover; transition: transform 0.4s ease;");

      const overlay = document.createElement("div");
      overlay.className = "position-absolute bottom-0 start-0 w-100 p-3 text-white d-flex flex-column justify-content-end";
      overlay.style.background = "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)";
      overlay.style.height = "100%";
      overlay.innerHTML = `
        <h5 class="fw-bold mb-1 text-white">${dest.name}</h5>
        <p class="small mb-0 text-white-50 opacity-75 line-clamp-desc">${shortDesc}</p>
        <a href="destination-details.html?id=${dest.id}" class="stretched-link">
          <div class="dest-arrow-box">
            <i class="ri-arrow-right-line"></i>
          </div>
        </a>
      `;

      wrapper.appendChild(img);
      wrapper.appendChild(overlay);
      destGrid.appendChild(wrapper);
    });

  } catch (err) {
    console.error("Destinations Error:", err);
    destGrid.innerHTML = `<p class="text-danger py-4">Failed to load destinations. Please try again later.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  displayTrendingTours();
  displayDestinations();
});