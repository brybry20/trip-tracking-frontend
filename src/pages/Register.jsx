import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import API_URL from '../config';

function Register() {
  const [formData, setFormData] = useState({
    username: '', password: '', full_name: '', email: '', phone: '', license_number: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Registration successful! Redirecting to login…');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Registration failed');
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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; height: 100%; overflow: hidden; }

        :root {
          --amber: #f59e0b;
          --amber-dim: #d97706;
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
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes grain {
          0%,100%{ transform:translate(0,0); } 20%{ transform:translate(-1%,1%); }
          40%{ transform:translate(1%,-1%); } 60%{ transform:translate(-2%,2%); } 80%{ transform:translate(2%,-2%); }
        }
        @keyframes pulse-line {
          0%,100%{ opacity:0.5; } 50%{ opacity:1; }
        }
        @keyframes shimmer {
          0%{ background-position:-200% center; } 100%{ background-position:200% center; }
        }
        @keyframes step-in {
          from { opacity:0; transform:translateX(-12px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes success-pop {
          0%  { transform:scale(0.94); opacity:0; }
          60% { transform:scale(1.02); }
          100%{ transform:scale(1);    opacity:1; }
        }

        .rg-root {
          position: fixed; inset: 0;
          display: flex; width: 100vw; height: 100vh;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          background: var(--dark);
        }

        /* ══════════════════════════
           LEFT PANEL
        ══════════════════════════ */
        .rg-left {
          width: 42%;
          background: var(--dark-2);
          display: flex; flex-direction: column;
          justify-content: space-between;
          padding: 44px 50px;
          position: relative; overflow: hidden;
          flex-shrink: 0;
          border-right: 1px solid var(--dark-border);
          animation: fadeIn 0.6s ease both;
        }

        /* Amber top accent */
        .rg-left::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, var(--amber) 40%, var(--amber-dim) 70%, transparent);
          animation: pulse-line 3s ease-in-out infinite;
        }

        .rg-grain {
          position: absolute; inset: -50%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 200px; pointer-events: none;
          animation: grain 8s steps(1) infinite; z-index: 0;
        }

        .rg-glow {
          position: absolute; bottom: -120px; left: -120px;
          width: 480px; height: 480px;
          background: radial-gradient(circle, rgba(245,158,11,0.09) 0%, transparent 60%);
          pointer-events: none; z-index: 0;
        }
        .rg-glow2 {
          position: absolute; top: -60px; right: -60px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
        }

        .rg-grid-bg {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px);
          background-size: 48px 48px; pointer-events: none; z-index: 0;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
        }

        .rg-left-inner {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          height: 100%; justify-content: space-between;
        }

        /* Brand */
        .rg-brand {
          display: flex; align-items: center; gap: 12px;
          animation: fadeUp 0.5s 0.1s cubic-bezier(0.22,1,0.36,1) both;
        }
        .rg-brand-mark {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, var(--amber), var(--amber-dim));
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 17px;
          color: var(--dark); flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(245,158,11,0.28);
        }
        .rg-brand-name {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 17px; color: var(--text-primary); letter-spacing: -0.2px;
        }

        /* Hero */
        .rg-hero { animation: fadeUp 0.55s 0.18s cubic-bezier(0.22,1,0.36,1) both; }

        .rg-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10.5px; font-weight: 700; letter-spacing: 1.8px;
          text-transform: uppercase; color: var(--amber);
          margin-bottom: 18px;
          font-family: 'JetBrains Mono', monospace;
        }
        .rg-eyebrow::before {
          content: ''; display: inline-block;
          width: 20px; height: 1.5px; background: var(--amber); opacity: 0.6;
        }

        .rg-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 2.8vw, 40px);
          font-weight: 800; color: var(--text-primary);
          letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 18px;
        }

        .rg-hero-title .accent {
          background: linear-gradient(135deg, var(--amber) 0%, #fbbf24 50%, var(--amber-dim) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        .rg-hero-sub {
          font-size: 13.5px; color: #5a6270; line-height: 1.7; max-width: 320px;
        }

        /* Steps */
        .rg-steps {
          display: flex; flex-direction: column; gap: 0;
          animation: fadeUp 0.6s 0.26s cubic-bezier(0.22,1,0.36,1) both;
        }

        .rg-step {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          animation: step-in 0.4s ease both;
        }
        .rg-step:first-child { border-top: 1px solid rgba(255,255,255,0.04); }
        .rg-step:nth-child(1) { animation-delay: 0.28s; }
        .rg-step:nth-child(2) { animation-delay: 0.36s; }
        .rg-step:nth-child(3) { animation-delay: 0.44s; }

        .rg-step-num {
          width: 26px; height: 26px; border-radius: 7px;
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.2);
          color: var(--amber);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px;
        }

        .rg-step-body { display: flex; flex-direction: column; gap: 2px; }
        .rg-step-title { font-size: 13px; font-weight: 600; color: #c9cdd6; }
        .rg-step-desc  { font-size: 12px; color: var(--text-dim); line-height: 1.4; }

        .rg-caption {
          font-size: 11px; color: var(--text-dim);
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.4px;
          animation: fadeIn 0.6s 0.5s ease both;
        }

        /* ══════════════════════════
           RIGHT PANEL
        ══════════════════════════ */
        .rg-right {
          flex: 1; background: #f8fafc;
          display: flex; align-items: center; justify-content: center;
          padding: 24px 40px; overflow-y: auto; position: relative;
        }

        .rg-right::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--amber) 0%, transparent 50%);
          opacity: 0.3;
        }

        .rg-form-box {
          width: 100%; max-width: 480px;
          animation: fadeUp 0.5s 0.15s cubic-bezier(0.22,1,0.36,1) both;
        }

        .rg-form-logo {
          display: flex; justify-content: center; margin-bottom: 20px;
        }
        .rg-form-logo img { height: 50px; width: auto; object-fit: contain; }

        .rg-form-heading { text-align: center; margin-bottom: 22px; }

        .rg-form-title {
          font-family: 'Syne', sans-serif;
          font-size: 24px; font-weight: 800;
          color: #0a0c10; letter-spacing: -0.7px; margin-bottom: 5px;
        }
        .rg-form-sub { font-size: 13.5px; color: #9ca3af; }

        /* Alerts */
        .rg-alert {
          padding: 11px 14px; border-radius: 9px;
          font-size: 13.5px; margin-bottom: 16px;
          display: flex; align-items: center; gap: 9px;
        }
        .rg-alert.error {
          background: #fef2f2;
          border: 1px solid #fecaca; border-left: 3px solid #ef4444;
          color: #dc2626; animation: fadeUp 0.3s ease;
        }
        .rg-alert.success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0; border-left: 3px solid #10b981;
          color: #15803d; animation: success-pop 0.4s ease both;
        }

        /* Grid */
        .rg-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 13px;
          margin-bottom: 4px;
        }

        .rg-field { margin-bottom: 0; }
        .rg-field.full { grid-column: 1 / -1; }

        .rg-label {
          display: block; font-size: 10.5px; font-weight: 700;
          color: #374151; text-transform: uppercase;
          letter-spacing: 0.9px; margin-bottom: 7px;
        }

        .rg-input-wrap { position: relative; display: flex; align-items: center; }

        .rg-input-icon {
          position: absolute; left: 12px; color: #9ca3af;
          display: flex; align-items: center; pointer-events: none;
          transition: color 0.18s;
        }

        .rg-input {
          width: 100%; padding: 11px 12px 11px 38px;
          border: 1.5px solid #e5e7eb; border-radius: 9px;
          font-size: 13.5px; font-family: 'DM Sans', sans-serif;
          color: #111827; background: #ffffff; outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .rg-input::placeholder { color: #c4c9d0; }
        .rg-input:focus {
          border-color: var(--amber);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
          background: #fffdf7;
        }
        .rg-input-wrap:focus-within .rg-input-icon { color: var(--amber-dim); }
        .rg-input:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }

        .rg-pw-toggle {
          position: absolute; right: 10px;
          background: none; border: none; cursor: pointer;
          color: #c4c9d0; display: flex; align-items: center;
          padding: 5px; border-radius: 6px; transition: color 0.18s, background 0.18s;
        }
        .rg-pw-toggle:hover { color: #6b7280; background: #f3f4f6; }

        /* Submit */
        .rg-submit {
          width: 100%; padding: 13px;
          background: #0a0c10; color: #ffffff; border: none;
          border-radius: 10px; font-size: 14.5px;
          font-family: 'DM Sans', sans-serif; font-weight: 600;
          cursor: pointer; margin-top: 14px;
          transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          letter-spacing: 0.2px; position: relative; overflow: hidden;
        }
        .rg-submit::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(245,158,11,0.08) 50%, transparent 60%);
          transform: translateX(-100%); transition: transform 0.5s ease;
        }
        .rg-submit:hover::after { transform: translateX(100%); }
        .rg-submit:hover:not(:disabled) {
          background: #1a1d26;
          box-shadow: 0 4px 20px rgba(10,12,16,0.28);
          transform: translateY(-1px);
        }
        .rg-submit:active:not(:disabled) { transform: translateY(0); box-shadow: none; }
        .rg-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        .rg-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite; flex-shrink: 0;
        }

        /* Footer */
        .rg-footer { text-align: center; margin-top: 18px; font-size: 13.5px; color: #9ca3af; }
        .rg-footer a {
          color: #0a0c10; font-weight: 700; text-decoration: none;
          border-bottom: 2px solid var(--amber); padding-bottom: 1px; transition: color 0.18s;
        }
        .rg-footer a:hover { color: var(--amber-dim); }

        /* Secure badge */
        .rg-secure {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: 16px; font-size: 11px; color: #c4c9d0;
          font-family: 'JetBrains Mono', monospace; letter-spacing: 0.3px;
        }
        .rg-secure-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #10b981; box-shadow: 0 0 5px rgba(16,185,129,0.5);
        }

        @media (max-width: 768px) {
          .rg-left { display: none; }
          .rg-right { padding: 28px 20px; }
          .rg-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="rg-root">

        {/* ── Left Branding Panel ── */}
        <div className="rg-left">
          <div className="rg-grain" />
          <div className="rg-glow" />
          <div className="rg-glow2" />
          <div className="rg-grid-bg" />

          <div className="rg-left-inner">
            {/* Brand */}
            <div className="rg-brand">

            </div>

            {/* Hero */}
            <div className="rg-hero">
              <div className="rg-eyebrow">Driver Registration</div>
              <h1 className="rg-hero-title">
                Join the<br />
                <span className="accent">Fleet.</span><br />
                Start Driving.
              </h1>
              <p className="rg-hero-sub">
                Register your driver account to start logging trips, tracking deliveries, and managing your routes across the DeltaPlus platform.
              </p>
            </div>

            {/* Steps */}
            <div className="rg-steps">
              {[
                { n: '01', title: 'Fill in your details', desc: 'Personal info, contact, and license number' },
                { n: '02', title: 'Account review',       desc: 'Admin activates your account' },
                { n: '03', title: 'Start logging trips',  desc: 'Sign in and begin your first delivery' },
              ].map(({ n, title, desc }) => (
                <div key={n} className="rg-step">
                  <span className="rg-step-num">{n}</span>
                  <div className="rg-step-body">
                    <span className="rg-step-title">{title}</span>
                    <span className="rg-step-desc">{desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rg-caption">© {new Date().getFullYear()} DeltaPlus · All rights reserved</div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="rg-right">
          <div className="rg-form-box">

            <div className="rg-form-logo">
              <img src={logo} alt="DeltaPlus" />
            </div>

            <div className="rg-form-heading">
              <div className="rg-form-title">Create your account</div>
              <div className="rg-form-sub">All fields are required to complete registration</div>
            </div>

            {error   && <div className="rg-alert error">  <AlertIcon /> {error}   </div>}
            {success && <div className="rg-alert success"><CheckIcon /> {success} </div>}

            <form onSubmit={handleSubmit}>
              <div className="rg-grid">

                <div className="rg-field">
                  <label className="rg-label">Username</label>
                  <div className="rg-input-wrap">
                    <span className="rg-input-icon"><UserIcon /></span>
                    <input className="rg-input" type="text" name="username"
                      value={formData.username} onChange={handleChange}
                      placeholder="Choose a username" required disabled={loading} />
                  </div>
                </div>

                <div className="rg-field">
                  <label className="rg-label">Password</label>
                  <div className="rg-input-wrap">
                    <span className="rg-input-icon"><LockIcon /></span>
                    <input className="rg-input" type={showPassword ? 'text' : 'password'}
                      name="password" value={formData.password} onChange={handleChange}
                      placeholder="Create a password" required disabled={loading}
                      style={{ paddingRight: 40 }} />
                    <button type="button" className="rg-pw-toggle"
                      onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="rg-field full">
                  <label className="rg-label">Full Name</label>
                  <div className="rg-input-wrap">
                    <span className="rg-input-icon"><NameIcon /></span>
                    <input className="rg-input" type="text" name="full_name"
                      value={formData.full_name} onChange={handleChange}
                      placeholder="Your full legal name" required disabled={loading} />
                  </div>
                </div>

                <div className="rg-field">
                  <label className="rg-label">Email</label>
                  <div className="rg-input-wrap">
                    <span className="rg-input-icon"><MailIcon /></span>
                    <input className="rg-input" type="email" name="email"
                      value={formData.email} onChange={handleChange}
                      placeholder="Email address" required disabled={loading} />
                  </div>
                </div>

                <div className="rg-field">
                  <label className="rg-label">Phone</label>
                  <div className="rg-input-wrap">
                    <span className="rg-input-icon"><PhoneIcon /></span>
                    <input className="rg-input" type="tel" name="phone"
                      value={formData.phone} onChange={handleChange}
                      placeholder="Phone number" required disabled={loading} />
                  </div>
                </div>

                <div className="rg-field full">
                  <label className="rg-label">Driver's License Number</label>
                  <div className="rg-input-wrap">
                    <span className="rg-input-icon"><LicenseIcon /></span>
                    <input className="rg-input" type="text" name="license_number"
                      value={formData.license_number} onChange={handleChange}
                      placeholder="e.g. N01-12-345678" required disabled={loading} />
                  </div>
                </div>

              </div>

              <button type="submit" className="rg-submit" disabled={loading}>
                {loading
                  ? <><span className="rg-spinner" /> Creating account…</>
                  : <><UserPlusIcon /> Create Account</>}
              </button>
            </form>

            <div className="rg-footer">
              Already have an account? <Link to="/login">Sign in here</Link>
            </div>

            <div className="rg-secure">
              <span className="rg-secure-dot" />
              Secured · Session-based auth
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

/* ── Icons ── */
function UserIcon()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function LockIcon()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function NameIcon()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>; }
function MailIcon()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function PhoneIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>; }
function LicenseIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>; }
function EyeIcon()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EyeOffIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>; }
function AlertIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function CheckIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function UserPlusIcon(){ return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>; }

export default Register;