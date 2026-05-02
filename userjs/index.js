const BASE_URL = "https://alexia-tours-backend-production.up.railway.app";
const API_DESTINATIONS = `${BASE_URL}/api/destinations`;
const API_PACKAGES = `${BASE_URL}/api/packages`;

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
    .skeleton-dest-card {
      min-width: 300px;
      height: 360px;
      margin-right: 1rem;
      flex-shrink: 0;
    }
    .skeleton-pkg-card {
      height: 320px;
      border-radius: 12px;
    }
    /* Fade-in for real images once loaded */
    .lazy-img {
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    .lazy-img.loaded {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
})();

/* ─── IntersectionObserver for lazy images ──────────────────────────────── */
const imageObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      const src = img.dataset.src;
      if (!src) return;

      img.src = src;
      img.onload = () => img.classList.add("loaded");
      img.onerror = () => {
        img.src = "./pictures/placeholder.jpg";
        img.classList.add("loaded");
      };
      imageObserver.unobserve(img);
    });
  },
  { rootMargin: "200px 0px" } // start loading 200px before entering viewport
);

/* ─── Helper: create a lazy <img> element ───────────────────────────────── */
function lazyImg(src, alt, extraStyle = "") {
  const fallback = "./pictures/placeholder.jpg";
  // 1×1 transparent SVG used as the placeholder while real src loads
  const placeholder =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E";

  const img = document.createElement("img");
  img.src = placeholder;
  img.dataset.src = src || fallback;
  img.alt = alt || "";
  img.className = "lazy-img";
  img.decoding = "async";
  img.loading = "lazy";
  if (extraStyle) img.style.cssText = extraStyle;

  imageObserver.observe(img);
  return img;
}

/* ─── Skeleton helpers ──────────────────────────────────────────────────── */
function showDestinationSkeletons(container, count = 4) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "skeleton skeleton-dest-card";
    container.appendChild(el);
  }
}

function showPackageSkeletons(container, count = 4) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const col = document.createElement("div");
    col.className = "col-md-3";
    col.innerHTML = `<div class="skeleton skeleton-pkg-card"></div>`;
    container.appendChild(col);
  }
}

/* ─── Load Destinations ─────────────────────────────────────────────────── */
async function loadIndexDestinations() {
  const container = document.getElementById("index-destinations-container");
  if (!container) return;

  showDestinationSkeletons(container, 4);

  try {
    const res = await fetch(API_DESTINATIONS);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const destinations = await res.json();

    container.innerHTML = "";

    if (!destinations.length) {
      container.innerHTML = `<p class="text-muted py-4">No destinations found.</p>`;
      return;
    }

    destinations.forEach((dest) => {
      const imageSrc = dest.image || "./pictures/placeholder.jpg";
      const shortDesc =
        dest.description && dest.description.length > 80
          ? dest.description.substring(0, 80) + "…"
          : dest.description || "";

      // Build card element (no innerHTML += to avoid repeated reflows)
      const card = document.createElement("div");
      card.className = "card tour-card me-3";
      card.style.minWidth = "300px";

      const img = lazyImg(
        imageSrc,
        dest.name,
        "height:250px; object-fit:cover; width:100%; border-radius:12px 12px 0 0;"
      );

      const body = document.createElement("div");
      body.className = "card-body";
      body.innerHTML = `
        <h5 class="card-title fw-bold">${dest.name}</h5>
        <p class="card-text text-muted">${shortDesc}</p>
        <a href="destination-details.html?id=${dest.id}"
           class="btn btn-sm btn-warning rounded-circle shadow-sm">
          <ion-icon name="arrow-forward-outline"></ion-icon>
        </a>
      `;

      card.appendChild(img);
      card.appendChild(body);
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading destinations:", error);
    container.innerHTML = `<p class="text-danger py-4">Failed to load destinations. Please try again later.</p>`;
  }
}

/* ─── Load Packages ─────────────────────────────────────────────────────── */
async function loadHomePackages() {
  const container = document.getElementById("index-packages-container");
  if (!container) return;

  showPackageSkeletons(container, 4);

  try {
    const res = await fetch(API_PACKAGES);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const packages = await res.json();

    container.innerHTML = "";

    if (!packages.length) {
      container.innerHTML = `<p class="text-muted py-4">No packages available.</p>`;
      return;
    }

    const topPackages = packages.slice(0, 8);

    topPackages.forEach((pkg) => {
      const imgSrc = pkg.image || "./pictures/placeholder.jpg";
      const formattedPrice = Number(pkg.price).toLocaleString();

      // Build elements to avoid innerHTML += reflows
      const col = document.createElement("div");
      col.className = "col-md-3";

      const pkgCard = document.createElement("div");
      pkgCard.className = "package-card";

      const img = lazyImg(
        imgSrc,
        pkg.title,
        "height:200px; object-fit:cover; width:100%;"
      );

      const body = document.createElement("div");
      body.className = "packages-card-body";
      body.innerHTML = `
        <h5 class="fw-bold text-truncate">${pkg.title}</h5>
        <p class="price text-warning">
          From USD ${formattedPrice} <span>Per Person</span>
        </p>
        <div class="tour-meta">
          <a href="package-details.html?id=${pkg.id}" class="btn explore-btn">Explore</a>
          <div class="text-white-50 small">
            <span><ion-icon name="sunny-outline"></ion-icon> ${pkg.duration_days} Days</span>
            <span><ion-icon name="moon-outline"></ion-icon> ${pkg.duration_nights} Nights</span>
          </div>
        </div>
      `;

      pkgCard.appendChild(img);
      pkgCard.appendChild(body);
      col.appendChild(pkgCard);
      container.appendChild(col);
    });
  } catch (error) {
    console.error("Error loading packages:", error);
    container.innerHTML = `<p class="text-danger py-4">Failed to load packages. Please try again later.</p>`;
  }
}

/* ─── Init ──────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  loadIndexDestinations();
  loadHomePackages();
});