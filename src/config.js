// frontend/src/config.js

// ✅ PRODUCTION - use Render backend
// const API_URL = 'https://trip-tracking-backend.onrender.com';
// const API_URL = 'https://trip-tracking-backend-egfp.onrender.com';


// ❌ Comment out local development
const API_URL = 'http://localhost:5000';
// Token storage keys
export const TOKEN_KEY = 'deltaplus_token';
export const USER_KEY = 'deltaplus_user';

console.log('🔍 API_URL:', API_URL);

export default API_URL;