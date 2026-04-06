(function() {
    const token = localStorage.getItem('adminToken');

    if (!token) {
        console.warn("Unauthorized access attempt. Redirecting to login...");
        // Use a relative path to ensure it finds login.html correctly
        window.location.href = 'login.html';
    }
})();