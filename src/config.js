// frontend/src/config.js

// Sa Vite (ginagamit mo), ang environment variables ay nasa import.meta.env
// at dapat naka-prefix ng VITE_

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_URL;