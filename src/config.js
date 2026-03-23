// frontend/src/config.js

// ✅ PARA SA LOCAL DEVELOPMENT - gamitin ang localhost
// const API_URL = 'http://localhost:5000';

// ❌ I-comment muna ito para sa production
const API_URL = import.meta.env.VITE_API_URL || 'https://trip-tracking-backend.onrender.com';

console.log('🔍 API_URL:', API_URL); // Para makita sa console

export default API_URL;