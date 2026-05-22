// Dynamic Grid Orchestrator Module for Alexia Tours Journal System
const API_BLOGS = `${BASE_URL}/api/blogs`;

async function displayBlogGrid() {
  const grid = document.getElementById("blog-grid");
  if (!grid) return;

  try {
    const res = await fetch(API_BLOGS);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const articles = await res.json();

    grid.innerHTML = "";

    if (!articles.length) {
      grid.innerHTML = `<div class="col-12 text-center text-muted py-5">No journey entries have been published yet. Check back soon!</div>`;
      return;
    }

    articles.forEach(article => {
      // Dynamic Asset mapping setup
      const imageSrc = article.image_path ? `${BASE_URL}/${article.image_path}` : 'assets/img/blog-placeholder.jpg';
      const postDate = new Date(article.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });

      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4 d-flex align-items-stretch";

      // Perfectly matches your structural custom configurations ($btns-border-radius: 5px)
      col.innerHTML = `
        <div class="card h-100 tour-premium-card w-100" style="border: 1px solid #dee2e6; border-radius: 5px; overflow:hidden; transition: all 0.3s ease; background-color:#fff;">
          <div style="height: 210px; overflow: hidden; position: relative;" class="tour-img-container">
            <img src="${imageSrc}" alt="${article.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;">
            <span style="position: absolute; top: 12px; left: 12px; background: rgba(32, 32, 32, 0.85); color: #fff; padding: 4px 10px; font-size: 0.72rem; font-weight: 700; border-radius: 5px; text-transform: uppercase; letter-spacing: 0.5px;">
              ${article.category}
            </span>
          </div>
          <div class="card-body p-4 d-flex flex-column justify-content-between">
            <div>
              <small class="text-muted d-block mb-2"><i class="ri-calendar-line me-1"></i> ${postDate}</small>
              <h5 class="fw-bold mb-2 text-dark" style="font-size: 1.2rem; line-height: 1.4; transition: color 0.2s ease;">${article.title}</h5>
              <p class="text-secondary small mb-4" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-height:1.6;">
                ${article.summary}
              </p>
            </div>
            <a href="blog-details.html?slug=${article.slug}" class="btn tour-premium-btn mt-2" style="border: 1px solid #F99E1C; color: #F99E1C; width: max-content; border-radius: 5px; font-weight: 600; font-size: 0.85rem; padding: 6px 14px; background: transparent;">
              Read Article <i class="ri-arrow-right-line ms-1"></i>
            </a>
          </div>
        </div>
      `;

      // Simple mouse-hover transform micro-interactions applied directly for instant responsiveness
      const cardInner = col.querySelector('.tour-premium-card');
      col.addEventListener('mouseenter', () => {
          cardInner.style.transform = 'translateY(-6px)';
          cardInner.style.borderColor = '#F99E1C';
          cardInner.style.boxShadow = '0 0.5rem 1.5rem rgba(0, 0, 0, 0.08)';
          col.querySelector('img').style.transform = 'scale(1.05)';
          const btn = col.querySelector('.tour-premium-btn');
          btn.style.backgroundColor = '#F99E1C';
          btn.style.color = '#fff';
      });
      col.addEventListener('mouseleave', () => {
          cardInner.style.transform = 'translateY(0)';
          cardInner.style.borderColor = '#dee2e6';
          cardInner.style.boxShadow = 'none';
          col.querySelector('img').style.transform = 'scale(1)';
          const btn = col.querySelector('.tour-premium-btn');
          btn.style.backgroundColor = 'transparent';
          btn.style.color = '#F99E1C';
      });

      grid.appendChild(col);
    });

  } catch (err) {
    console.error("Blog Grid Execution Context Logs Error:", err);
    grid.innerHTML = `
      <div class="col-12 text-center text-danger py-5">
        <i class="ri-error-warning-line display-4 d-block mb-2"></i>
        Failed to fetch the journal feed data array cleanly. Please try again later.
      </div>`;
  }
}

document.addEventListener("DOMContentLoaded", displayBlogGrid);