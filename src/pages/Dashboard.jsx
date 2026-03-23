import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AdminDashboard from './admin/AdminDashboard';
import DriverDashboard from './driver/DriverDashboard';
import logo from '../assets/deltaplus.png';
import API_URL from '../config';

function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [driverInfo, setDriverInfo] = useState(null);
  const [trips, setTrips] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/check`, { credentials: 'include' });
        const data = await res.json();
        if (!data.authenticated) {
          navigate('/login');
        } else {
          if (!user || !user.username) setUser(data);
          if (data.role === 'driver') fetchDriverInfo();
          else if (data.role === 'admin') fetchDrivers();
          fetchTrips();
        }
      } catch {
        navigate('/login');
      }
    };
    checkAuth();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    setTimeout(() => setMounted(true), 60);
    return () => clearInterval(timer);
  }, []);

  const fetchDriverInfo = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/drivers`, { credentials: 'include' });
      const data = await res.json();
      setDriverInfo(data.find(d => d.username === user.username));
    } catch (err) { console.log(err); }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/drivers`, { credentials: 'include' });
      setDrivers(await res.json());
    } catch (err) { console.log(err); }
  };

  const fetchTrips = async () => {
    try {
      const res = await fetch(`${API_URL}/trips`, { credentials: 'include' });
      setTrips(await res.json());
    } catch (err) { console.log(err); }
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    navigate('/login');
  };

  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=JetBrains+Mono:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --amber: #f59e0b;
          --amber-dim: #d97706;
          --amber-glow: rgba(245,158,11,0.15);
          --dark: #0a0c10;
          --dark-2: #0f1117;
          --dark-3: #161820;
          --dark-border: rgba(255,255,255,0.07);
          --dark-border-2: rgba(255,255,255,0.04);
          --text-primary: #f3f4f6;
          --text-secondary: #9ca3af;
          --text-dim: #4b5563;
          --red: #ef4444;
          --green: #10b981;
        }

        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0,0); }
          10%  { transform: translate(-1%,-1%); }
          30%  { transform: translate(1%,-2%); }
          50%  { transform: translate(-2%,1%); }
          70%  { transform: translate(2%,2%); }
          90%  { transform: translate(-1%,1%); }
        }

        .db-root {
          display: flex;
          flex-direction: column;
          width: 100vw;
          height: 100vh;
          background: #f0f2f5;
          font-family: 'DM Sans', sans-serif;
          position: fixed;
          inset: 0;
          overflow: hidden;
        }

        /* ═══════════════════════════════
           HEADER
        ═══════════════════════════════ */
        .db-header {
          background: linear-gradient(180deg, #1c1f2e 0%, #12141c 100%);
          height: 68px;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(255,255,255,0.09);
          box-shadow: 0 2px 24px rgba(0,0,0,0.4);
          isolation: isolate;
          animation: fadeSlideDown 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* Grain texture */
        .db-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 180px;
          pointer-events: none;
          z-index: -1;
          animation: grain 8s steps(1) infinite;
        }

        /* Amber accent line at very top */
        .db-header::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, var(--amber) 30%, var(--amber-dim) 60%, transparent 100%);
          opacity: 0.85;
        }

        /* ── Left ── */
        .db-header-left {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .db-logo-wrap {
          display: flex;
          align-items: center;
          position: relative;
          padding-right: 22px;
          background: radial-gradient(ellipse at center, rgba(245,158,11,0.15) 0%, transparent 70%);
          border-radius: 12px;
          padding: 4px 16px 4px 8px;
        }

        .db-logo-img {
          height: 48px;
          width: auto;
          object-fit: contain;
          transition: opacity 0.2s;
        }

        /* Vertical separator */
        .db-sep {
          width: 1px;
          height: 34px;
          background: linear-gradient(180deg, transparent, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 70%, transparent);
          margin: 0 22px 0 0;
          flex-shrink: 0;
        }

        .db-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .db-breadcrumb-home {
          font-size: 13px;
          color: var(--text-dim);
          font-weight: 500;
          letter-spacing: 0.2px;
        }

        .db-breadcrumb-arrow {
          color: var(--text-dim);
          font-size: 12px;
        }

        .db-breadcrumb-current {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.1px;
        }

        .db-role-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          animation: pulse-dot 2.5s ease-in-out infinite;
        }
        .db-role-dot.admin  { background: var(--amber); box-shadow: 0 0 6px var(--amber); }
        .db-role-dot.driver { background: var(--green); box-shadow: 0 0 6px var(--green); }

        /* ── Right ── */
        .db-header-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Clock pill */
        .db-clock {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 8px 14px;
          margin-right: 4px;
          transition: border-color 0.2s;
        }
        .db-clock:hover { border-color: rgba(255,255,255,0.14); }

        .db-clock-icon {
          color: var(--amber);
          display: flex;
          align-items: center;
          flex-shrink: 0;
          opacity: 0.85;
        }

        .db-clock-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .db-clock-date {
          font-size: 10.5px;
          color: var(--text-dim);
          letter-spacing: 0.3px;
          line-height: 1;
          white-space: nowrap;
          text-transform: uppercase;
        }

        .db-clock-time {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: 0.5px;
          line-height: 1;
        }

        /* Divider between clock and user */
        .db-hdivider {
          width: 1px;
          height: 28px;
          background: rgba(255,255,255,0.08);
          margin: 0 4px;
          flex-shrink: 0;
        }

        /* User pill */
        .db-user-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 6px 12px 6px 6px;
          transition: border-color 0.2s;
        }
        .db-user-pill:hover { border-color: rgba(255,255,255,0.14); }

        .db-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--amber), var(--amber-dim));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 13px;
          color: var(--dark);
          flex-shrink: 0;
          box-shadow: 0 0 0 1px rgba(245,158,11,0.3), 0 2px 8px rgba(245,158,11,0.15);
        }

        .db-user-details {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .db-username {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
          letter-spacing: 0.1px;
        }

        .db-role-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          line-height: 1;
          padding: 2px 6px;
          border-radius: 4px;
          width: fit-content;
        }
        .db-role-tag.admin  { background: rgba(245,158,11,0.12); color: var(--amber); border: 1px solid rgba(245,158,11,0.2); }
        .db-role-tag.driver { background: rgba(16,185,129,0.1);  color: var(--green); border: 1px solid rgba(16,185,129,0.2); }

        /* Notification btn */
        .db-notif-btn {
          position: relative;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .db-notif-btn:hover {
          background: rgba(255,255,255,0.08);
          color: var(--text-primary);
          border-color: rgba(255,255,255,0.14);
        }

        .db-notif-badge {
          position: absolute;
          top: 8px; right: 8px;
          width: 7px; height: 7px;
          background: var(--amber);
          border-radius: 50%;
          border: 1.5px solid #12141c;
          animation: pulse-dot 2.5s ease-in-out infinite;
        }

        /* Logout */
        .db-logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          padding: 0 16px;
          height: 40px;
          color: #f87171;
          cursor: pointer;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
          letter-spacing: 0.1px;
        }
        .db-logout-btn:hover {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.4);
          color: #fca5a5;
        }
        .db-logout-btn svg { transition: transform 0.2s; }
        .db-logout-btn:hover svg { transform: translateX(2px); }

        /* ═══════════════════════════════
           SUBHEADER — context bar
        ═══════════════════════════════ */
        .db-subheader {
          background: #0f1117;
          border-bottom: 1px solid var(--dark-border-2);
          padding: 0 28px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          animation: fadeSlideDown 0.5s 0.08s cubic-bezier(0.22,1,0.36,1) both;
        }

        .db-subheader-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .db-subheader-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-dim);
        }

        .db-subheader-divider {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--text-dim);
        }

        .db-status-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          color: var(--green);
          letter-spacing: 0.3px;
        }

        .db-status-pulse {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--green);
          animation: pulse-dot 1.8s ease-in-out infinite;
        }

        .db-subheader-right {
          font-size: 11px;
          color: var(--text-dim);
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.5px;
        }

        /* ═══════════════════════════════
           CONTENT
        ═══════════════════════════════ */
        .db-content {
          flex: 1;
          padding: 28px 28px 32px;
          overflow-y: auto;
          height: 0;
          animation: fadeSlideUp 0.5s 0.12s cubic-bezier(0.22,1,0.36,1) both;
        }

        .db-content::-webkit-scrollbar { width: 5px; }
        .db-content::-webkit-scrollbar-track { background: transparent; }
        .db-content::-webkit-scrollbar-thumb { background: #2d2f36; border-radius: 3px; }
        .db-content::-webkit-scrollbar-thumb:hover { background: #3d3f48; }
      `}</style>

      <div className="db-root">

        {/* ── Header ── */}
        <header className="db-header">
          <div className="db-header-left">
            <div className="db-logo-wrap">
              <img
                src={logo}
                alt="DeltaPlus"
                className="db-logo-img"
              />
            </div>
            <div className="db-sep" />
            <div className="db-breadcrumb">

              <span className="db-breadcrumb-arrow">›</span>
              <div className="db-breadcrumb-current">
                <span className={`db-role-dot ${isAdmin ? 'admin' : 'driver'}`} />
                {isAdmin ? 'Admin Dashboard' : 'Driver Dashboard'}
              </div>
            </div>
          </div>

          <div className="db-header-right">
            {/* Live Clock */}
            <div className="db-clock">
              <span className="db-clock-icon"><ClockIcon /></span>
              <div className="db-clock-body">
                <span className="db-clock-date">{formatDate(currentTime)}</span>
                <span className="db-clock-time">{formatTime(currentTime)}</span>
              </div>
            </div>

            <div className="db-hdivider" />

            {/* User */}
            <div className="db-user-pill">
              <div className="db-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
              <div className="db-user-details">
                <span className="db-username">{user?.username}</span>
                <span className={`db-role-tag ${isAdmin ? 'admin' : 'driver'}`}>
                  {isAdmin ? '⬡ Admin' : '⬡ Driver'}
                </span>
              </div>
            </div>

            {/* Notifications */}
            <button className="db-notif-btn" title="Notifications">
              <BellIcon />
              <span className="db-notif-badge" />
            </button>

            {/* Logout */}
            <button className="db-logout-btn" onClick={handleLogout}>
              <LogoutIcon />
              Sign Out
            </button>
          </div>
        </header>

        {/* ── Subheader context bar ── */}
        <div className="db-subheader">
          <div className="db-subheader-left">
            <span className="db-subheader-label">
              {isAdmin ? 'Operations Center' : 'Delivery Console'}
            </span>
            <span className="db-subheader-divider" />
            <span className="db-status-chip">
              <span className="db-status-pulse" />
              System Online
            </span>
          </div>
          <span className="db-subheader-right">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()} &nbsp;·&nbsp; SESSION ACTIVE
          </span>
        </div>

        {/* ── Main content ── */}
        <div className="db-content">
          {isAdmin ? (
            <AdminDashboard drivers={drivers} trips={trips} fetchTrips={fetchTrips} />
          ) : (
            <DriverDashboard driverInfo={driverInfo} trips={trips} fetchTrips={fetchTrips} user={user} />
          )}
        </div>

      </div>
    </>
  );
}

/* ── Icons ── */
function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

export default Dashboard;