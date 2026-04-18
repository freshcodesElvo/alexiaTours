(function() {
    const token = sessionStorage.getItem('adminToken');

    if (!token) {
        console.warn("Unauthorized access attempt. Redirecting to login...");
        window.location.href = 'login.html';
    }
})();