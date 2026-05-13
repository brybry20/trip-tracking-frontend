import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import API_URL, { TOKEN_KEY, USER_KEY } from './config';
import './App.css';

function SplashScreen({ status }) {
  return (
    <div style={styles.splashContainer}>
      <div style={styles.splashContent}>
        <div style={styles.logoWrapper}>
          <img src="/logo2.png" alt="Deltaplus Logo" style={styles.splashLogo} />
          <div style={styles.logoPulse}></div>
        </div>
        <h1 style={styles.splashTitle}>Deltaplus</h1>
        <p style={styles.splashSubtitle}>Trip Tracking System</p>
        
        <div style={styles.loaderWrapper}>
          <div style={styles.loaderBar}></div>
        </div>
        
        <p style={styles.statusMessage}>{status}</p>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Connecting to server...');

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      // Start pre-warming the server immediately
      const healthPromise = fetch(`${API_URL}/health`, { method: 'GET', cache: 'no-store' }).catch(() => null);
      
      setStatus('Connecting to server...');

      try {
        if (storedToken && storedUser) {
          setStatus('Verifying session...');
          // Concurrently verify token while server is waking up
          const res = await fetch(`${API_URL}/auth/verify-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: storedToken }),
            credentials: 'include'
          });

          if (res.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setUser(null);
          } else {
            const data = await res.json();
            if (data.valid) {
              setUser(JSON.parse(storedUser));
            } else {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
              setUser(null);
            }
          }
        } else {
          setStatus('Checking credentials...');
          const res = await fetch(`${API_URL}/auth/check`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated) setUser(data);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // If it failed, it might be a cold start. Wait a bit if we haven't seen health success.
        const health = await healthPromise;
        if (!health) {
          setStatus('Server waking up (Render Free Tier)...');
          await new Promise(r => setTimeout(r, 3000));
          // Retry once
          try {
            const res = await fetch(`${API_URL}/auth/check`, { credentials: 'include' });
            if (res.ok) {
              const data = await res.json();
              if (data.authenticated) setUser(data);
            }
          } catch {}
        }
      } finally {
        setStatus('Welcome to Deltaplus');
        setTimeout(() => setLoading(false), 600);
      }
    };

    checkAuth();

    // ── STEP 3: Keep-alive ping every 14 minutes ──
    // Render free tier sleeps after 15 min of inactivity.
    // Pinging every 14 min prevents it from sleeping during the user's session.
    const keepAlive = setInterval(() => {
      fetch(`${API_URL}/health`, { method: 'GET', cache: 'no-store' }).catch(() => {});
    }, 14 * 60 * 1000);

    return () => clearInterval(keepAlive);
  }, []);

  if (loading) return <SplashScreen status={status} />;

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
  splashContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#0f1117',
    background: 'radial-gradient(circle at center, #1e232d 0%, #0f1117 100%)',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999
  },
  splashContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    animation: 'fadeIn 0.8s ease-out'
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: '2rem'
  },
  splashLogo: {
    width: '100px',
    height: '100px',
    objectFit: 'contain',
    position: 'relative',
    zIndex: 2
  },
  logoPulse: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '120px',
    height: '120px',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: '50%',
    animation: 'pulse 2s infinite ease-in-out',
    zIndex: 1
  },
  splashTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '3rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.03em',
    marginBottom: '0.5rem',
    background: 'linear-gradient(to right, #fff, #94a3b8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  splashSubtitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '1rem',
    color: '#94a3b8',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    marginBottom: '3rem'
  },
  loaderWrapper: {
    width: '200px',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '1.5rem'
  },
  loaderBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#6366f1',
    boxShadow: '0 0 15px #6366f1',
    borderRadius: '10px',
    animation: 'shimmer 2s infinite linear',
    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    backgroundSize: '200% 100%'
  },
  statusMessage: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.9rem',
    color: '#64748b',
    minHeight: '1.2em'
  }
};

export default App;