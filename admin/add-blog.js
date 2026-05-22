// Post Composition Form Pipeline Handler for Alexia Tours Management Dashboard
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("blog-creation-form");
    const summaryInput = document.getElementById("blog-summary");
    const charCounter = document.getElementById("char-counter");
    const alertBox = document.getElementById("form-alert");
    const submitBtn = document.getElementById("submit-btn");
    const btnText = document.getElementById("btn-text");
    const btnSpinner = document.getElementById("btn-spinner");

    // Dynamic length tracking counter event
    if (summaryInput) {
        summaryInput.addEventListener("input", (e) => {
            charCounter.innerText = `${e.target.value.length} / 450 characters`;
        });
    }

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Structural visual lock adjustments
        alertBox.className = "alert d-none";
        submitBtn.disabled = true;
        btnText.innerText = "Processing Assets...";
        btnSpinner.classList.remove("d-none");

        // FormData construction safely extracts file payloads matching Multer requirements
        const formData = new FormData(form);
        const API_CREATE_BLOG = `${BASE_URL}/api/blogs/create`;

        try {
            const res = await fetch(API_CREATE_BLOG, {
                method: "POST",
                body: formData // Note: Content-Type headers are handled automatically by browser for FormData
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "An unexpected asset error occurred.");
            }

            // Display success alert context layout
            alertBox.className = "alert alert-success d-block fw-semibold";
            alertBox.innerHTML = `<i class="ri-checkbox-circle-line me-2"></i> ${data.message || "Entry launched live successfully!"}`;
            form.reset();
            if(charCounter) charCounter.innerText = "0 / 450 characters";
            
            // Redirect smoothly back to home management feed dashboard after brief delay
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1800);

        } catch (err) {
            console.error("Dashboard Blog Submission Crash Trace Logs:", err);
            alertBox.className = "alert alert-danger d-block fw-semibold";
            alertBox.innerHTML = `<i class="ri-error-warning-line me-2"></i> Error: ${err.message}`;
            
            // Unlock button for adjustment retries
            submitBtn.disabled = false;
            btnText.innerText = "Publish Post Live";
            btnSpinner.classList.add("d-none");
        }
    });
});