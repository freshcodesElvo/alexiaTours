if (window.location.href.includes('refresh=true')) {
    console.error("Manual override: Stopping potential loop.");
} else {

    (async function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const pkgId = urlParams.get('id');

        if (!pkgId) return; 

        try {
            const res = await fetch(`https://alexia-tours-backend-production.up.railway.app/api/packages/${pkgId}`);
            if (!res.ok) throw new Error("Backend returned error");
            
            const pkg = await res.json();
            
            document.title = `${pkg.title} | Alexia's Tours`;
            if(document.getElementById("tour-title")) {
                document.getElementById("tour-title").innerText = pkg.title;
            }

            if(document.getElementById("tour-description")) {
                document.getElementById("tour-description").innerText = pkg.description;
            }
            
            document.querySelectorAll("#tour-price").forEach(el => {
                el.innerText = `USD ${Number(pkg.price).toLocaleString()}`;
            });

            const durationText = `${pkg.duration_days} Days / ${pkg.duration_nights} Nights`;
            document.querySelectorAll("#tour-duration").forEach(el => {
                el.innerText = durationText;
            });

            const hero = document.getElementById("tour-hero-bg");
            if (pkg.image && hero) {
                hero.style.backgroundImage = `url('${pkg.image}')`;
            }

        } catch (err) {
            console.error("Fetch Error:", err);
        }
    })();
}