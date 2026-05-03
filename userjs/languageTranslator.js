const translations = {
    en: { overview: "Tour Overview", price: "Starting From", duration: "Duration", book: "Book Now" },
    de: { overview: "Reiseübersicht", price: "Ab", duration: "Dauer", book: "Jetzt Buchen" },
    fr: { overview: "Aperçu du voyage", price: "À partir de", duration: "Durée", book: "Réserver" },
    it: { overview: "Panoramica del tour", price: "A partire da", duration: "Durata", book: "Prenota ora" },
    es: { overview: "Resumen del tour", price: "Desde", duration: "Duración", book: "Reservar ahora" },
    zh: { overview: "行程概览", price: "起价", duration: "持续时间", book: "立即预订" }
};

// Function to get current lang from URL
const getLang = () => new URLSearchParams(window.location.search).get('lang') || 'en';

function applyTranslations() {
    const lang = getLang();
    const t = translations[lang] || translations.en;

    // Update UI elements by ID
    if(document.getElementById("heading-overview")) document.getElementById("heading-overview").innerText = t.overview;
    
    // Update labels in the sticky bar
    document.querySelectorAll(".label-duration").forEach(el => el.innerText = t.duration);
    document.querySelectorAll(".label-price").forEach(el => el.innerText = t.price);
    
    // Update all "Book Now" buttons
    document.querySelectorAll(".btn-book").forEach(el => el.innerText = t.book);
}