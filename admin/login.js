console.log("login.js loaded");
const API_BASE = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://alexia-tours-backend-production.up.railway.app/api";

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem('adminToken', data.accessToken); // ← localStorage → sessionStorage
            sessionStorage.setItem('refreshToken', data.refreshToken); // ← localStorage → sessionStorage
            window.location.replace('dashboard.html');
        }else {
            errorMsg.style.display = 'block';
            errorMsg.innerText = data.message || "Login Failed";
        }

    } catch (error) {
        console.error("Login Error:", error);
        alert("Server connection failed. Is the backend running?");
    }
});