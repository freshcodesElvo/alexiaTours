const API = "https://alexia-tours-backend-production.up.railway.app/api/messages";

document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add("was-validated");
        return;
    }

    const formData = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...`;

    try {
        const res = await fetch(API, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            alert("Message sent successfully! We will get back to you soon.");
            this.reset(); 
            this.classList.remove('was-validated');
        } else {
            throw new Error("Server responded with an error.");
        }

    } catch (error) {
        console.error("Submission Error:", error);
        alert("Something went wrong. Please ensure the backend server is running on port 5000.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});