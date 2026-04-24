const BASE_URL = "https://alexia-tours-backend-production.up.railway.app";
const API_TOURS = `${BASE_URL}/api/tours`;
const API_DESTINATIONS = `${BASE_URL}/api/destinations`;
const IMAGE_BASE = `${BASE_URL}/uploads/`;

/* ─── Skeleton CSS (injected once) ─────────────────────────────────────── */
(function injectSkeletonStyles() {
  if (document.getElementById("skeleton-styles")) return;
  const style = document.createElement("style");
  style.id = "skeleton-styles";
  style.textContent = `
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .skeleton {
      background: linear-gradient(90deg, #e8e8e8 25%, #d0d0d0 50%, #e8e8e8 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 12px;
    }
    .skeleton-tour { min-width: 300px; height: 320px; margin-right: 1rem; flex-shrink: 0; }
    .skeleton-dest { height: 250px; border-radius: 16px; }
    .lazy-img { opacity: 0; transition: opacity 0.4s ease; }
    .lazy-img.loaded { opacity: 1; }
  `;
  document.head.appendChild(style);
})();

/* ─── IntersectionObserver ──────────────────────────────────────────────── */
const imageObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;
      img.onload  = () => img.classList.add("loaded");
      img.onerror = () => { img.src = "https://placehold.co/400x300"; img.classList.add("loaded"); };
      imageObserver.unobserve(img);
    });
  },
  { rootMargin: "200px 0px" }
);

/* ─── Helper: lazy <img> ────────────────────────────────────────────────── */
function lazyImg(src, alt, extraStyle = "") {
  const placeholder =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E";
  const img = document.createElement("img");
  img.src = placeholder;
  img.dataset.src = src || "https://placehold.co/400x300";
  img.alt = alt || "";
  img.className = "lazy-img";
  img.decoding = "async";
  img.loading = "lazy";
  if (extraStyle) img.style.cssText = extraStyle;
  imageObserver.observe(img);
  return img;
}

/* ─── Skeleton helpers ──────────────────────────────────────────────────── */
function showTourSkeletons(container, count = 4) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "skeleton skeleton-tour";
    container.appendChild(el);
  }
}

function showDestSkeletons(grid, count = 8) {
  grid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const col = document.createElement("div");
    col.className = "col-md-3 col-sm-6 mb-4";
    col.innerHTML = `<div class="skeleton skeleton-dest"></div>`;
    grid.appendChild(col);
  }
}

/* ─── Load Trending Tours (Carousel) ────────────────────────────────────── */
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
      card.className = "card border-0 shadow-sm rounded-4 overflow-hidden h-100";

      const img = lazyImg(imageSrc, tour.title, "height:200px; object-fit:cover; width:100%;");

      const body = document.createElement("div");
      body.className = "card-body";
      body.innerHTML = `
        <h5 class="fw-bold">${tour.title}</h5>
        <p class="text-muted small">${tour.duration}</p>
        <h6 class="text-warning fw-bold">KSH ${Number(tour.price).toLocaleString()}</h6>
        <a href="tour-details.html?id=${tour.id}"
           class="btn btn-sm btn-outline-warning rounded-pill mt-2">Details</a>
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

/* ─── Load Top Destinations (Grid) ──────────────────────────────────────── */
async function displayDestinations() {
  const destGrid = document.getElementById("destinations-grid");
  if (!destGrid) return;

  showDestSkeletons(destGrid, 8);

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
      const imageSrc = dest.image
        ? `${IMAGE_BASE}${dest.image}`
        : "https://placehold.co/600x400";

      const shortDesc = dest.description
        ? dest.description.substring(0, 40) + "..."
        : "";

      const col = document.createElement("div");
      col.className = "col-md-3 col-sm-6 mb-4";

      const card = document.createElement("div");
      card.className = "destination-card position-relative overflow-hidden rounded-4 shadow-sm";
      card.style.height = "250px";

      const img = lazyImg(imageSrc, dest.name, "width:100%; height:100%; object-fit:cover; transition:0.5s;");

      const overlay = document.createElement("div");
      overlay.className = "position-absolute bottom-0 start-0 w-100 p-3 text-white";
      overlay.style.background = "linear-gradient(transparent, rgba(0,0,0,0.8))";
      overlay.innerHTML = `
        <h5 class="fw-bold mb-0">${dest.name}</h5>
        <p class="small mb-0 opacity-75">${shortDesc}</p>
        <a href="destination-details.html?id=${dest.id}">
          <ion-icon style="font-size:1.5em;" name="arrow-forward-outline"></ion-icon>
        </a>
      `;

      card.appendChild(img);
      card.appendChild(overlay);
      col.appendChild(card);
      destGrid.appendChild(col);
    });

  } catch (err) {
    console.error("Destinations Error:", err);
    destGrid.innerHTML = `<p class="text-danger py-4">Failed to load destinations. Please try again later.</p>`;
  }
}

/* ─── Init ──────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  displayTrendingTours();
  displayDestinations();
});