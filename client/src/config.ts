// Dynamically determine the socket URL based on the current window location
// This allows the app to work seamlessly on both localhost and the local network IP
const hostname = window.location.hostname;

export const SOCKET_URL = import.meta.env.PROD
    ? "https://ownproject-interview.onrender.com"
    : `http://${hostname}:3000`; // Match API port for dev simplicity, or 5000 if direct

// In development, force localhost:3000 to avoid accidental production connections
// even if .env has VITE_API_URL set to production
export const API_BASE_URL = import.meta.env.PROD
    ? (import.meta.env.VITE_API_URL || "https://ownproject-interview.onrender.com")
    : `http://${hostname}:3000`;

export const API_URL = API_BASE_URL;
