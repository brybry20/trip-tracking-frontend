// frontend/src/config.js

// Ito ang magiging base URL ng iyong backend
// Sa development (localhost), gamitin ang port 5000
// Sa production (deployed), palitan ito ng iyong Render URL

// frontend/src/config.js
const API_URL = import.meta.env.VITE_API_URL || 'https://trip-tracking-backend.onrender.com';
console.log('🔍 API_URL:', API_URL); // ✅ Para makita sa console
export default API_URL;