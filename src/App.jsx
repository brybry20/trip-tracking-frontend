import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    fetch('http://localhost:5000/auth/check', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.log('Backend not running?', err);
        setLoading(false);
      });
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