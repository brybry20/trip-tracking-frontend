// frontend/src/config.js

const PROD_API_URL = 'https://trip-tracking-backend.onrender.com/';
// const LOCAL_API_URL = 'http://localhost:5000';

// Auto-select based on environment
const API_URL = import.meta.env.PROD ? PROD_API_URL : LOCAL_API_URL;

// Token storage keys
export const TOKEN_KEY = 'deltaplus_token';
export const USER_KEY = 'deltaplus_user';

console.log('🔍 Current Environment:', import.meta.env.PROD ? 'PRODUCTION' : 'LOCAL');
console.log('🔍 API_URL:', API_URL);

export default API_URL;