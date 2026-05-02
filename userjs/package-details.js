// 1. IMMEDIATE KILL SWITCH (Put this at the VERY top)
if (window.location.href.includes('refresh=true')) {
    console.error("Manual override: Stopping potential loop.");
} else {

    (async function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const pkgId = urlParams.get('id');

        // 2. LOGGING FOR DEBUGGING (Check your console on the live site)
        console.log("Checking Package ID:", pkgId);

        if (!pkgId) {
            console.warn("No ID found. Displaying UI message instead of redirecting.");
            const container = document.querySelector('.container.py-5');
            if (container) {
                container.innerHTML = `
                    <div class="text-center py-5">
                        <h2>No Tour Selected</h2>
                        <p>Please browse our <a href="./">home page</a> to find a tour.</p>
                    </div>`;
            }
            return; 
        }

        try {
            // Use HTTPS explicitly
            const res = await fetch(`https://alexia-tours-backend-production.up.railway.app/api/packages/${pkgId}`);
            if (!res.ok) throw new Error("Backend returned error");
            
            const pkg = await res.json();
            
            // Standard UI updates
            document.title = `${pkg.title} | Alexia's Tours`;
            if(document.getElementById("tour-title")) document.getElementById("tour-title").innerText = pkg.title;
            
            document.querySelectorAll("#tour-price").forEach(el => {
                el.innerText = `USD ${Number(pkg.price).toLocaleString()}`;
            });

            const hero = document.getElementById("tour-hero-bg");
            if (hero && pkg.image) {
                hero.style.backgroundImage = `url('https://alexia-tours-backend-production.up.railway.app/uploads/${pkg.image}')`;
            }

            console.log("Page loaded successfully without loops.");

        } catch (err) {
            console.error("Production Fetch Error:", err);
        }
    })();
}