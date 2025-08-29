let not_programmed_btns = document.querySelectorAll(".not-programmed-btn");

not_programmed_btns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault(); // Prevents the link from jumping the page
        
        // Find the specific text element for this button
        let parentCard = btn.closest(".tour-card");
        let not_programmed_text = parentCard.querySelector(".not-programmed-text");
        
        // Toggle the 'active' class on that specific text element
        not_programmed_text.classList.toggle("active");
    });
});