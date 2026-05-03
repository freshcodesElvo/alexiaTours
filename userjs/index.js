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
      const imageSrc = dest.image || "https://placehold.co/400x300";
      const shortDesc = dest.description && dest.description.length > 80
        ? dest.description.substring(0, 80) + "…"
        : dest.description || "";

      const card = document.createElement("div");
      card.className = "card tour-card me-3";
      card.style.minWidth = "300px";

      const img = lazyImg(imageSrc, dest.name,
        "height:250px; object-fit:cover; width:100%; border-radius:12px 12px 0 0;");

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

    packages.slice(0, 8).forEach((pkg) => {
      const col = document.createElement("div");
      col.className = "col-md-3";

      const pkgCard = document.createElement("div");
      pkgCard.className = "package-card";

      const img = lazyImg(pkg.image || "https://placehold.co/400x300", pkg.title,
        "height:200px; object-fit:cover; width:100%;");

      const body = document.createElement("div");
      body.className = "packages-card-body";
      body.innerHTML = `
        <h5 class="fw-bold text-truncate">${pkg.title}</h5>
        <p class="price text-warning">From USD ${Number(pkg.price).toLocaleString()} <span>Per Person</span></p>
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