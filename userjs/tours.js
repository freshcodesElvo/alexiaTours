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
      wrapper.style.minWidth = "300px";

      const card = document.createElement("div");
      card.className = "card border-0 shadow-sm  overflow-hidden h-100";

      const img = lazyImg(imageSrc, tour.title, "height:200px; object-fit:cover; width:100%;");

      const body = document.createElement("div");
      body.className = "card-body";
      body.innerHTML = `
        <h5 class="tour-tag">${tour.title}</h5>
        <p class="text-muted ">${tour.duration}</p>
        <h6 class="price-tag fw-bold">USD ${Number(tour.price).toLocaleString()}</h6>
        <a href="tour-details.html?id=${tour.id}"
           class=" call-to-action-btn btn  btn-outline-warning  mt-2">Details <i class="ri-arrow-right-up-line"></i></a>
      `;

      card.appendChild(img);
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
    console.log("Sample dest image value:", destinations[0]?.image);


    destGrid.innerHTML = "";
    if (!destinations.length) {
      destGrid.innerHTML = `<p class="text-muted py-4">No destinations found.</p>`;
      return;
    }

    destinations.forEach(dest => {
      const imageSrc = dest.image || "https://placehold.co/600x400";

      const shortDesc = dest.description ? dest.description.substring(0, 40) + "..." : "";

      const wrapper = document.createElement("div");
      wrapper.className = "destination-card position-relative overflow-hidden  shadow-sm me-3 flex-shrink-0";
      wrapper.style.cssText = "width: 260px; height: 250px;";

      const img = lazyImg(imageSrc, dest.name, "width:100%; height:100%; object-fit:cover; transition:0.5s;");

      const overlay = document.createElement("div");
      overlay.className = "position-absolute bottom-0 start-0 w-100 p-3 text-white";
      overlay.style.background = "linear-gradient(transparent, rgba(0,0,0,0.8))";
      overlay.innerHTML = `
        <h5 class="fw-bold mb-0">${dest.name}</h5>
        <p class="small mb-0 opacity-75">${shortDesc}</p>
        <a href="destination-details.html?id=${dest.id}" class="stretched-link">
          <ion-icon style="font-size:1.5em; color:white; position:absolute; bottom:15px; right:15px;"
                    name="arrow-forward-outline"></ion-icon>
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