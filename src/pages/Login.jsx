import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import API_URL from '../config'; // ✅ IMPORT CONFIG

function Login({ setUser }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // ✅ GAMITIN ANG API_URL
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setUser(data);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; height: 100%; overflow: hidden; }

        .lg-root {
          position: fixed;
          inset: 0;
          display: flex;
          width: 100vw;
          height: 100vh;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* ── Left Panel ── */
        .lg-left {
          width: 45%;
          background: #0f1117;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        /* Decorative glow */
        .lg-left::before {
          content: '';
          position: absolute;
          bottom: -80px;
          left: -80px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 65%);
          pointer-events: none;
        }

        .lg-left::after {
          content: '';
          position: absolute;
          top: -60px;
          right: -60px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .lg-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        .lg-logo-mark {
          width: 40px;
          height: 40px;
          background: #f59e0b;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 18px;
          color: #0f1117;
          flex-shrink: 0;
        }

        .lg-brand-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: #ffffff;
          letter-spacing: -0.3px;
        }

        .lg-hero {
          position: relative;
          z-index: 2;
        }

        .lg-hero-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: #f59e0b;
          margin-bottom: 16px;
        }

        .lg-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 3vw, 38px);
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -1px;
          line-height: 1.15;
          margin-bottom: 16px;
        }

        .lg-hero-title span {
          color: #f59e0b;
        }

        .lg-hero-sub {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
          max-width: 320px;
        }

        .lg-features {
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        .lg-feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: #6b7280;
        }

        .lg-feature-dot {
          width: 6px;
          height: 6px;
          background: #f59e0b;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ── Right Panel ── */
        .lg-right {
          flex: 1;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          overflow-y: auto;
        }

        .lg-form-box {
          width: 100%;
          max-width: 400px;
        }

        .lg-form-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 28px;
        }

        .lg-form-logo img {
          height: 56px;
          width: auto;
          object-fit: contain;
        }

        .lg-form-title {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #0f1117;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
          text-align: center;
        }

        .lg-form-sub {
          font-size: 14px;
          color: #9ca3af;
          text-align: center;
          margin-bottom: 32px;
        }

        /* Error */
        .lg-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13.5px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Fields */
        .lg-field {
          margin-bottom: 18px;
        }

        .lg-label {
          display: block;
          font-size: 11.5px;
          font-weight: 600;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 7px;
        }

        .lg-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .lg-input-icon {
          position: absolute;
          left: 13px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .lg-input {
          width: 100%;
          padding: 11px 13px 11px 40px;
          border: 1px solid #e5e7eb;
          border-radius: 9px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #111827;
          background: #ffffff;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }

        .lg-input:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
        }

        .lg-input:disabled {
          background: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .lg-pw-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 5px;
          transition: color 0.18s;
        }
        .lg-pw-toggle:hover { color: #374151; }

        /* Submit */
        .lg-submit {
          width: 100%;
          padding: 13px;
          background: #0f1117;
          color: #ffffff;
          border: none;
          border-radius: 9px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .lg-submit:hover:not(:disabled) {
          background: #1f2937;
          box-shadow: 0 4px 14px rgba(15,17,23,0.2);
          transform: translateY(-1px);
        }

        .lg-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .lg-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: lg-spin 0.7s linear infinite;
        }

        @keyframes lg-spin {
          to { transform: rotate(360deg); }
        }

        /* Footer */
        .lg-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 13.5px;
          color: #9ca3af;
        }

        .lg-footer a {
          color: #0f1117;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 2px solid #f59e0b;
          padding-bottom: 1px;
          transition: color 0.18s;
        }

        .lg-footer a:hover { color: #f59e0b; }

        /* Slide-in animation */
        .lg-form-box {
          animation: lg-fadein 0.4s ease;
        }

        @keyframes lg-fadein {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .lg-left { display: none; }
          .lg-right { padding: 32px 24px; }
        }
      `}</style>

      <div className="lg-root">
        {/* Left Branding Panel */}
        <div className="lg-left">
          <div className="lg-brand">

          </div>

          <div className="lg-hero">
            <div className="lg-hero-label">Delivery Management Login</div>
            <h1 className="lg-hero-title">
              <br />Deltaplus<br />
            </h1>
            <p className="lg-hero-sub">
              A unified platform for drivers and administrators to manage trips, monitor routes, and streamline logistics.
            </p>
          </div>

          <div className="lg-features">
            <div className="lg-feature-item">
              <span className="lg-feature-dot" />
              Real-time trip logging
            </div>
            <div className="lg-feature-item">
              <span className="lg-feature-dot" />
              Driver performance tracking
            </div>
            <div className="lg-feature-item">
              <span className="lg-feature-dot" />
              Invoice and odometer records
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg-right">
          <div className="lg-form-box">
            <div className="lg-form-logo">
              <img src={logo} alt="DeltaPlus Logo" />
            </div>
            <div className="lg-form-title">Login</div>

            <div className="lg-form-sub">Sign in to your account to continue</div>

            {error && (
              <div className="lg-error">
                <AlertIcon />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="lg-field">
                <label className="lg-label">Username</label>
                <div className="lg-input-wrap">
                  <span className="lg-input-icon"><UserIcon /></span>
                  <input
                    className="lg-input"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter your username"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="lg-field">
                <label className="lg-label">Password</label>
                <div className="lg-input-wrap">
                  <span className="lg-input-icon"><LockIcon /></span>
                  <input
                    className="lg-input"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    style={{ paddingRight: '42px' }}
                  />
                  <button
                    type="button"
                    className="lg-pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button type="submit" className="lg-submit" disabled={loading}>
                {loading ? <><span className="lg-spinner" /> Signing in...</> : 'Sign In'}
              </button>
            </form>

            <div className="lg-footer">
              New driver?&nbsp;<Link to="/register">Create an account</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── SVG Icons ── */
function UserIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function LockIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function EyeIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function EyeOffIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}
function AlertIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}

export default Login;