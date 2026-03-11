import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import API_URL from '../config'; // ✅ IMPORT CONFIG

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone: '',
    license_number: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // ✅ GAMITIN ANG API_URL
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Registration failed');
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

        .rg-root {
          position: fixed;
          inset: 0;
          display: flex;
          width: 100vw;
          height: 100vh;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* ── Left Panel ── */
        .rg-left {
          width: 40%;
          background: #0f1117;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .rg-left::before {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 65%);
          pointer-events: none;
        }

        .rg-left::after {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .rg-brand {
          position: relative;
          z-index: 2;
        }

        .rg-brand img {
          height: 44px;
          width: auto;
          object-fit: contain;
        }

        .rg-hero {
          position: relative;
          z-index: 2;
        }

        .rg-hero-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: #f59e0b;
          margin-bottom: 16px;
        }

        .rg-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(26px, 2.8vw, 36px);
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -1px;
          line-height: 1.15;
          margin-bottom: 16px;
        }

        .rg-hero-title span { color: #f59e0b; }

        .rg-hero-sub {
          font-size: 13.5px;
          color: #6b7280;
          line-height: 1.65;
          max-width: 300px;
        }

        .rg-steps {
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          z-index: 2;
        }

        .rg-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .rg-step-num {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          background: rgba(245,158,11,0.15);
          border: 1px solid rgba(245,158,11,0.25);
          color: #f59e0b;
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .rg-step-text {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.4;
        }

        /* ── Right Panel ── */
        .rg-right {
          flex: 1;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 48px;
          overflow-y: auto;
        }

        .rg-form-box {
          width: 100%;
          max-width: 460px;
          animation: rg-fadein 0.4s ease;
        }

        @keyframes rg-fadein {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .rg-form-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .rg-form-logo img {
          height: 52px;
          width: auto;
          object-fit: contain;
        }

        .rg-form-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #0f1117;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
          text-align: center;
        }

        .rg-form-sub {
          font-size: 13.5px;
          color: #9ca3af;
          text-align: center;
          margin-bottom: 24px;
        }

        /* Alerts */
        .rg-alert {
          padding: 11px 14px;
          border-radius: 9px;
          font-size: 13.5px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rg-alert.error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .rg-alert.success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
        }

        /* Grid row */
        .rg-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        /* Field */
        .rg-field {
          margin-bottom: 14px;
        }

        .rg-field.full { grid-column: 1 / -1; }

        .rg-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 6px;
        }

        .rg-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .rg-input-icon {
          position: absolute;
          left: 12px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .rg-input {
          width: 100%;
          padding: 10px 12px 10px 38px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #111827;
          background: #ffffff;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }

        .rg-input:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
        }

        .rg-input:disabled {
          background: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .rg-pw-toggle {
          position: absolute;
          right: 10px;
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
        .rg-pw-toggle:hover { color: #374151; }

        /* Submit */
        .rg-submit {
          width: 100%;
          padding: 12px;
          background: #0f1117;
          color: #ffffff;
          border: none;
          border-radius: 9px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          cursor: pointer;
          margin-top: 6px;
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .rg-submit:hover:not(:disabled) {
          background: #1f2937;
          box-shadow: 0 4px 14px rgba(15,17,23,0.2);
          transform: translateY(-1px);
        }

        .rg-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .rg-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: rg-spin 0.7s linear infinite;
        }

        @keyframes rg-spin { to { transform: rotate(360deg); } }

        .rg-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 13.5px;
          color: #9ca3af;
        }

        .rg-footer a {
          color: #0f1117;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 2px solid #f59e0b;
          padding-bottom: 1px;
          transition: color 0.18s;
        }

        .rg-footer a:hover { color: #f59e0b; }

        @media (max-width: 768px) {
          .rg-left { display: none; }
          .rg-right { padding: 32px 24px; }
          .rg-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="rg-root">
        {/* Left Panel */}
        <div className="rg-left">
          <div className="rg-brand">
           
          </div>

          <div className="rg-hero">
            <div className="rg-hero-label">Driver Registration</div>
            <h1 className="rg-hero-title">
              <br />DeltaPlus<br /><span></span>
            </h1>
            <p className="rg-hero-sub">
              Register your driver account to start logging trips, tracking deliveries, and managing your routes.
            </p>
          </div>

          <div className="rg-steps">
            <div className="rg-step">
              <span className="rg-step-num">1</span>
              <span className="rg-step-text">Fill in your personal and license details</span>
            </div>
            <div className="rg-step">
              <span className="rg-step-num">2</span>
              <span className="rg-step-text">Account is reviewed and activated</span>
            </div>
            <div className="rg-step">
              <span className="rg-step-num">3</span>
              <span className="rg-step-text">Sign in and start logging your trips</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="rg-right">
          <div className="rg-form-box">
            <div className="rg-form-logo">
              <img src={logo} alt="DeltaPlus Logo" />
            </div>

            <div className="rg-form-title">Create your account</div>
            <div className="rg-form-sub">All fields are required to complete registration</div>

            {error && (
              <div className="rg-alert error">
                <AlertIcon /> {error}
              </div>
            )}
            {success && (
              <div className="rg-alert success">
                <CheckIcon /> {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="rg-grid">
                {/* Username */}
                <div className="rg-field">
                  <label className="rg-label">Username</label>
                  <div className="rg-input-wrap">
                    <span className="rg-input-icon"><UserIcon /></span>
                    <input className="rg-input" type="text" name="username"
                      value={formData.username} onChange={handleChange}
                      placeholder="Username" required disabled={loading} />
                  </div>
                </div>

                {/* Password */}
                <div className="rg-field">
                  <label className="rg-label">Password</label>
                  <div className="rg-input-wrap">
                    <span className="rg-input-icon"><LockIcon /></span>
                    <input className="rg-input" type={showPassword ? 'text' : 'password'}
                      name="password" value={formData.password} onChange={handleChange}
                      placeholder="Password" required disabled={loading}
                      style={{ paddingRight: '38px' }} />
                    <button type="button" className="rg-pw-toggle"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div className="rg-field full">
                  <label className="rg-label">Full Name</label>
                  <div className="rg-input-wrap">
                    <span className="rg-input-icon"><NameIcon /></span>
                    <input className="rg-input" type="text" name="full_name"
                      value={formData.full_name} onChange={handleChange}
                      placeholder="Your full name" required disabled={loading} />
                  </div>
                </div>

                {/* Email */}
                <div className="rg-field">
                  <label className="rg-label">Email</label>
                  <div className="rg-input-wrap">
                    <span className="rg-input-icon"><MailIcon /></span>
                    <input className="rg-input" type="email" name="email"
                      value={formData.email} onChange={handleChange}
                      placeholder="Email address" required disabled={loading} />
                  </div>
                </div>

                {/* Phone */}
                <div className="rg-field">
                  <label className="rg-label">Phone</label>
                  <div className="rg-input-wrap">
                    <span className="rg-input-icon"><PhoneIcon /></span>
                    <input className="rg-input" type="tel" name="phone"
                      value={formData.phone} onChange={handleChange}
                      placeholder="Phone number" required disabled={loading} />
                  </div>
                </div>

                {/* License */}
                <div className="rg-field full">
                  <label className="rg-label">Driver's License Number</label>
                  <div className="rg-input-wrap">
                    <span className="rg-input-icon"><LicenseIcon /></span>
                    <input className="rg-input" type="text" name="license_number"
                      value={formData.license_number} onChange={handleChange}
                      placeholder="License number" required disabled={loading} />
                  </div>
                </div>
              </div>

              <button type="submit" className="rg-submit" disabled={loading}>
                {loading
                  ? <><span className="rg-spinner" /> Creating account...</>
                  : <><UserPlusIcon /> Create Account</>}
              </button>
            </form>

            <div className="rg-footer">
              Already have an account?&nbsp;<Link to="/login">Sign in here</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── SVG Icons ── */
function UserIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function LockIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function NameIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
}
function MailIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
function PhoneIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function LicenseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
}
function EyeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function EyeOffIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}
function AlertIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function UserPlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
}

export default Register;