const BASE_URL = "https://alexia-tours-backend-production.up.railway.app";
const API_TOURS = `${BASE_URL}/api/tours`;
const API_DESTINATIONS = "https://alexia-tours-backend-production.up.railway.app/api/explore-places";
const API_PACKAGES = `${BASE_URL}/api/packages`;
const IMAGE_BASE = `${BASE_URL}/uploads/`;

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
    .skeleton-tour      { min-width: 300px; height: 320px; margin-right: 1rem; flex-shrink: 0; }
    .skeleton-dest      { height: 250px; border-radius: 16px; }
    .skeleton-dest-card { min-width: 300px; height: 360px; margin-right: 1rem; flex-shrink: 0; }
    .skeleton-pkg-card  { height: 320px; border-radius: 12px; }
    .lazy-img { opacity: 0; transition: opacity 0.4s ease; }
    .lazy-img.loaded { opacity: 1; }
  `;
  document.head.appendChild(style);
})();






const imageObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      const src = img.dataset.src;
      if (!src) return;
      img.src = src;
      img.onload  = () => img.classList.add("loaded");
      img.onerror = () => { img.src = "https://placehold.co/400x300"; img.classList.add("loaded"); };
      imageObserver.unobserve(img);
    });
  },
  { rootMargin: "200px 0px" }
);






function lazyImg(src, alt, extraStyle = "") {
  const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E";
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