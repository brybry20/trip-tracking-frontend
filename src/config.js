// frontend/src/config.js

// Ito ang magiging base URL ng iyong backend
// Sa development (localhost), gamitin ang port 5000
// Sa production (deployed), palitan ito ng iyong Render URL

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://trip-tracking-backend.onrender.com'  // ✅ PALITAN ITO kapag na-deploy na ang backend
  : 'http://localhost:5000';

export default API_URL;