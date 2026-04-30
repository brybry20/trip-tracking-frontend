import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import API_URL, { TOKEN_KEY, USER_KEY } from './config';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        try {
          // Verify token with backend
          const res = await fetch(`${API_URL}/auth/verify-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: storedToken }),
            credentials: 'include'
          });
          const data = await res.json();
          if (data.valid) {
            setUser(JSON.parse(storedUser));
          } else {
            // Token invalid, clear it
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
        }
      } else {
        // Fallback to cookie check if no token in localStorage
        try {
          const res = await fetch(`${API_URL}/auth/check`, {
            credentials: 'include'
          });
          const data = await res.json();
          if (data.authenticated) {
            setUser(data);
          }
        } catch (err) {
          console.log('Backend check failed:', err);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/dashboard" /> : <Register />
          } />
          <Route path="/dashboard" element={
            user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />
          } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.5rem',
    color: '#667eea'
  }
};

export default App;