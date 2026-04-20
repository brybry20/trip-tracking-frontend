import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/deltaplus.png';

import API_URL, { TOKEN_KEY, USER_KEY } from '../config';

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
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        // Store token and user data
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify({
          username: data.username,
          role: data.role,
          expires_in: data.expires_in
        }));
        
        setUser(data);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* Minimalist Arial-only font stack */
        * {
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }

        /* Headings and strong text use Arial Black for weight variation */
        h1, h2, h3, h4, .lg-hero-title, .lg-form-title, strong, .lg-feature-text strong,
        .lg-brand-name, .lg-submit, .lg-footer a, .lg-label {
          font-family: 'Arial Black', 'Arial', 'Helvetica', sans-serif !important;
        }

        /* Monospace elements use Arial (no monospace) */
        .lg-eyebrow, .lg-caption, .lg-secure {
          font-family: 'Arial', 'Helvetica', sans-serif !important;
          letter-spacing: normal;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; height: 100%; overflow: hidden; }

        :root {
          --amber: #f59e0b;
          --amber-dim: #d97706;
          --amber-glow: rgba(245,158,11,0.13);
          --dark: #0a0c10;
          --dark-2: #0f1117;
          --dark-3: #14161d;
          --dark-border: rgba(255,255,255,0.07);
          --text-primary: #f3f4f6;
          --text-secondary: #9ca3af;
          --text-dim: #4b5563;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes grain {
          0%,100%{ transform:translate(0,0); }
          20%{ transform:translate(-1%,1%); }
          40%{ transform:translate(1%,-1%); }
          60%{ transform:translate(-2%,2%); }
          80%{ transform:translate(2%,-2%); }
        }
        @keyframes pulse-line {
          0%,100%{ opacity:0.5; transform:scaleX(1); }
          50%{ opacity:1; transform:scaleX(1.04); }
        }
        @keyframes shimmer {
          0%{ background-position:-200% center; }
          100%{ background-position:200% center; }
        }
        @keyframes stagger1 { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes stagger2 { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes stagger3 { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

        .lg-root {
          position: fixed;
          inset: 0;
          display: flex;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: var(--dark);
        }

        /* ══════════════════════════════
           LEFT — Branding Panel
        ══════════════════════════════ */
        .lg-left {
          width: 48%;
          background: var(--dark-2);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px 52px;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          border-right: 1px solid var(--dark-border);
          animation: fadeIn 0.6s ease both;
        }

        /* Amber top accent line */
        .lg-left::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--amber) 40%, var(--amber-dim) 70%, transparent);
          animation: pulse-line 3s ease-in-out infinite;
        }

        /* Grain texture */
        .lg-left-grain {
          position: absolute;
          inset: -50%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 200px;
          pointer-events: none;
          animation: grain 8s steps(1) infinite;
          z-index: 0;
        }

        /* Large radial glow — bottom left */
        .lg-left-glow {
          position: absolute;
          bottom: -120px; left: -120px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        /* Top-right subtle glow */
        .lg-left-glow2 {
          position: absolute;
          top: -60px; right: -60px;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        /* Decorative grid lines */
        .lg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }

        .lg-left-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
        }

        /* Brand mark */
        .lg-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          animation: stagger1 0.5s 0.1s cubic-bezier(0.22,1,0.36,1) both;
        }

        .lg-brand-mark {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, var(--amber), var(--amber-dim));
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 17px;
          color: var(--dark); flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(245,158,11,0.3);
        }

        .lg-brand-name {
          font-weight: 700; font-size: 17px;
          color: var(--text-primary); letter-spacing: -0.2px;
        }

        /* Hero text */
        .lg-hero {
          animation: stagger2 0.55s 0.18s cubic-bezier(0.22,1,0.36,1) both;
        }

        .lg-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 20px;
        }

        .lg-eyebrow::before {
          content: '';
          display: inline-block;
          width: 20px; height: 1.5px;
          background: var(--amber);
          opacity: 0.6;
        }

        .lg-hero-title {
          font-size: clamp(32px, 3.2vw, 44px);
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -1.5px;
          line-height: 1.1;
          margin-bottom: 20px;
        }

        .lg-hero-title .accent {
          background: linear-gradient(135deg, var(--amber) 0%, #fbbf24 50%, var(--amber-dim) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        .lg-hero-sub {
          font-size: 14px;
          color: #5a6270;
          line-height: 1.7;
          max-width: 340px;
        }

        /* Feature list */
        .lg-features {
          display: flex;
          flex-direction: column;
          gap: 0;
          animation: stagger3 0.6s 0.26s cubic-bezier(0.22,1,0.36,1) both;
        }

        .lg-feature {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: padding-left 0.2s;
        }
        .lg-feature:first-child { border-top: 1px solid rgba(255,255,255,0.04); }
        .lg-feature:hover { padding-left: 4px; }

        .lg-feature-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.14);
          display: flex; align-items: center; justify-content: center;
          color: var(--amber); flex-shrink: 0;
          font-size: 14px;
        }

        .lg-feature-text {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 400;
          letter-spacing: 0.1px;
        }

        .lg-feature-text strong {
          display: block;
          font-size: 13.5px;
          font-weight: 600;
          color: #c9cdd6;
          margin-bottom: 1px;
        }

        /* Bottom caption */
        .lg-caption {
          font-size: 11px;
          color: var(--text-dim);
          letter-spacing: 0.4px;
          animation: fadeIn 0.6s 0.5s ease both;
        }

        /* ══════════════════════════════
           RIGHT — Form Panel
        ══════════════════════════════ */
        .lg-right {
          flex: 1;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          overflow-y: auto;
          position: relative;
        }

        /* Subtle top accent on right panel too */
        .lg-right::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--amber) 0%, transparent 60%);
          opacity: 0.3;
        }

        .lg-form-box {
          width: 100%;
          max-width: 390px;
          animation: fadeUp 0.5s 0.15s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* Logo */
        .lg-form-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
        }
        .lg-form-logo img {
          height: 85px; width: auto; object-fit: contain;
        }

        /* Heading */
        .lg-form-heading {
          text-align: center;
          margin-bottom: 32px;
        }

        .lg-form-title {
          font-size: 26px; font-weight: 800;
          color: #0a0c10; letter-spacing: -0.7px;
          margin-bottom: 6px;
        }

        .lg-form-sub {
          font-size: 14px; color: #9ca3af;
          line-height: 1.5;
        }

        /* Error */
        .lg-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-left: 3px solid #ef4444;
          color: #dc2626;
          padding: 11px 14px;
          border-radius: 9px;
          font-size: 13.5px;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          gap: 9px;
          animation: fadeUp 0.3s ease;
        }

        /* Fields */
        .lg-field {
          margin-bottom: 18px;
        }

        .lg-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.9px;
          margin-bottom: 8px;
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
          display: flex; align-items: center;
          pointer-events: none;
          transition: color 0.18s;
        }

        .lg-input {
          width: 100%;
          padding: 12px 13px 12px 41px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14.5px;
          color: #111827;
          background: #ffffff;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }

        .lg-input::placeholder { color: #c4c9d0; }

        .lg-input:focus {
          border-color: var(--amber);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
          background: #fffdf7;
        }

        .lg-input:focus + .lg-input-icon,
        .lg-input-wrap:focus-within .lg-input-icon {
          color: var(--amber-dim);
        }

        .lg-input:disabled {
          background: #f9fafb; color: #9ca3af; cursor: not-allowed;
        }

        .lg-pw-toggle {
          position: absolute; right: 11px;
          background: none; border: none;
          cursor: pointer; color: #c4c9d0;
          display: flex; align-items: center;
          padding: 5px; border-radius: 6px;
          transition: color 0.18s, background 0.18s;
        }
        .lg-pw-toggle:hover { color: #6b7280; background: #f3f4f6; }

        /* Divider */
        .lg-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }
        .lg-divider-line {
          flex: 1; height: 1px; background: #e5e7eb;
        }

        /* Submit button */
        .lg-submit {
          width: 100%;
          padding: 13px;
          background: #0a0c10;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 14.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex; align-items: center;
          justify-content: center; gap: 9px;
          letter-spacing: 0.2px;
          position: relative;
          overflow: hidden;
        }

        /* Amber shimmer on hover */
        .lg-submit::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(245,158,11,0.08) 50%, transparent 60%);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }
        .lg-submit:hover::after { transform: translateX(100%); }

        .lg-submit:hover:not(:disabled) {
          background: #1a1d26;
          box-shadow: 0 4px 20px rgba(10,12,16,0.3);
          transform: translateY(-1px);
        }

        .lg-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: none;
        }

        .lg-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        .lg-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        /* Footer */
        .lg-footer {
          text-align: center;
          margin-top: 22px;
          font-size: 13.5px;
          color: #9ca3af;
        }

        .lg-footer a {
          color: #0a0c10;
          font-weight: 700;
          text-decoration: none;
          border-bottom: 2px solid var(--amber);
          padding-bottom: 1px;
          transition: color 0.18s;
        }
        .lg-footer a:hover { color: var(--amber-dim); }

        /* Secure badge */
        .lg-secure {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 20px;
          font-size: 11.5px;
          color: #c4c9d0;
          letter-spacing: 0.3px;
        }

        .lg-secure-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 5px rgba(16,185,129,0.5);
        }

        @media (max-width: 768px) {
          .lg-left { display: none; }
          .lg-right { padding: 32px 24px; }
          .lg-right::before { display: none; }
        }
      `}</style>

      <div className="lg-root">

        {/* ── Left Branding Panel ── */}
        <div className="lg-left">
          <div className="lg-left-grain" />
          <div className="lg-left-glow" />
          <div className="lg-left-glow2" />
          <div className="lg-grid" />

          <div className="lg-left-content">
            {/* Brand */}
            <div className="lg-brand">

            </div>

            {/* Hero */}
            <div className="lg-hero">
              <div className="lg-eyebrow">Delivery Management System</div>
              <h1 className="lg-hero-title">
                Track Every<br />
                <span className="accent">Delivery.</span><br />
                Every Mile.
              </h1>
              <p className="lg-hero-sub">
                A unified platform for drivers and administrators to manage trips, monitor routes, and streamline logistics operations.
              </p>
            </div>

            {/* Features */}
            <div className="lg-features">
              {[
                { icon: '📍', title: 'Real-time GPS Logging', desc: 'Capture location on every trip start' },
                { icon: '📋', title: 'Invoice & Check Records', desc: 'Attach invoices and payment details per trip' },
                { icon: '📊', title: 'Analytics Dashboard', desc: 'Revenue and performance at a glance' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="lg-feature">
                  <div className="lg-feature-icon">{icon}</div>
                  <div className="lg-feature-text">
                    <strong>{title}</strong>
                    {desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Caption */}
            <div className="lg-caption">© {new Date().getFullYear()} DeltaPlus · All rights reserved</div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="lg-right">
          <div className="lg-form-box">

            {/* Logo */}
            <div className="lg-form-logo">
              <img src={logo} alt="DeltaPlus" />
            </div>

            {/* Heading */}
            <div className="lg-form-heading">
              <div className="lg-form-title">Welcome back</div>
              <div className="lg-form-sub">Sign in to your account to continue</div>
            </div>

            {/* Error */}
            {error && (
              <div className="lg-error">
                <AlertIcon />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="lg-field">
                <label className="lg-label">Username</label>
                <div className="lg-input-wrap">
                  <span className="lg-input-icon"><UserIcon /></span>
                  <input
                    className="lg-input"
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter your username"
                    required
                    disabled={loading}
                    autoComplete="username"
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
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" className="lg-pw-toggle" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button type="submit" className="lg-submit" disabled={loading} style={{ marginTop: 8 }}>
                {loading
                  ? <><span className="lg-spinner" /> Signing in…</>
                  : <><ArrowIcon /> Sign In</>
                }
              </button>
            </form>

            {/* Footer */}
            <div className="lg-footer">
              New driver? <Link to="/register">Create an account</Link>
            </div>

            {/* Secure badge */}
            <div className="lg-secure">
              <span className="lg-secure-dot" />
              Secured · Session-based auth
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

/* ── Icons ── */
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
function ArrowIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}

export default Login;