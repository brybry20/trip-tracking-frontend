import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AdminDashboard from './admin/AdminDashboard';
import DriverDashboard from './driver/DriverDashboard';
import logo from '../assets/logo2.png';
import API_URL from '../config'; // ✅ IMPORT CONFIG

function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [driverInfo, setDriverInfo] = useState(null);
  const [trips, setTrips] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (user.role === 'driver') fetchDriverInfo();
    else if (user.role === 'admin') fetchDrivers();
    fetchTrips();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [user]);

  const fetchDriverInfo = async () => {
    try {
      // ✅ GAMITIN ANG API_URL
      const res = await fetch(`${API_URL}/auth/drivers`, { credentials: 'include' });
      const data = await res.json();
      setDriverInfo(data.find(d => d.username === user.username));
    } catch (err) { console.log(err); }
  };

  const fetchDrivers = async () => {
    try {
      // ✅ GAMITIN ANG API_URL
      const res = await fetch(`${API_URL}/auth/drivers`, { credentials: 'include' });
      setDrivers(await res.json());
    } catch (err) { console.log(err); }
  };

  const fetchTrips = async () => {
    try {
      // ✅ GAMITIN ANG API_URL
      const res = await fetch(`${API_URL}/trips`, { credentials: 'include' });
      setTrips(await res.json());
    } catch (err) { console.log(err); }
  };

  const handleLogout = async () => {
    // ✅ GAMITIN ANG API_URL
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    navigate('/login');
  };

  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

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

        /* ── Top Header ── */
        .db-header {
          background: #0f1117;
          height: 72px;
          padding: 0 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .db-header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .db-logo {
          display: flex;
          align-items: center;
        }

        .db-header-sep {
          width: 1px;
          height: 28px;
          background: rgba(255,255,255,0.1);
        }

        .db-page-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #9ca3af;
          letter-spacing: 0.1px;
        }

        .db-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* DateTime pill */
        .db-datetime-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 8px 16px;
          margin-right: 6px;
        }

        .db-datetime-icon {
          color: #f59e0b;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .db-datetime-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .db-date-text {
          font-size: 11.5px;
          color: #6b7280;
          letter-spacing: 0.2px;
          line-height: 1;
          white-space: nowrap;
        }

        .db-time-text {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #e5e7eb;
          letter-spacing: -0.3px;
          line-height: 1;
        }

        /* Role badge */
        .db-role-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 7px 14px;
          margin-right: 2px;
        }

        .db-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 14px;
          color: #0f1117;
          flex-shrink: 0;
        }

        .db-user-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .db-username {
          font-size: 14px;
          font-weight: 600;
          color: #f3f4f6;
          line-height: 1;
        }

        .db-role-text {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          line-height: 1;
        }

        /* Icon button */
        .db-icon-btn {
          position: relative;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #9ca3af;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .db-icon-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #f3f4f6;
          border-color: rgba(255,255,255,0.15);
        }

        .db-notif-dot {
          position: absolute;
          top: 9px;
          right: 10px;
          width: 7px;
          height: 7px;
          background: #f59e0b;
          border-radius: 50%;
          border: 2px solid #0f1117;
        }

        /* Logout button */
        .db-logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.18);
          border-radius: 10px;
          padding: 0 18px;
          height: 42px;
          color: #f87171;
          cursor: pointer;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          transition: background 0.2s, border-color 0.2s;
          margin-left: 4px;
          white-space: nowrap;
        }
        .db-logout-btn:hover {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.35);
        }

        /* ── Content ── */
        .db-content {
          flex: 1;
          padding: 32px 36px;
          overflow-y: auto;
          height: 0;
        }

        /* Scrollbar */
        .db-content::-webkit-scrollbar { width: 6px; }
        .db-content::-webkit-scrollbar-track { background: transparent; }
        .db-content::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
      `}</style>

      <div className="db-root">
        {/* Header */}
        <header className="db-header">
          <div className="db-header-left">
            <div className="db-logo">
              <img src={logo} alt="DeltaPlus" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <div className="db-header-sep" />
            <span className="db-page-title">
              {user.role === 'admin' ? 'Admin Dashboard' : 'Driver Dashboard'}
            </span>
          </div>

          <div className="db-header-right">
            {/* DateTime */}
            <div className="db-datetime-pill">
              <span className="db-datetime-icon"><ClockIcon /></span>
              <div className="db-datetime-text">
                <span className="db-date-text">{formatDate(currentTime)}</span>
                <span className="db-time-text">{formatTime(currentTime)}</span>
              </div>
            </div>

            {/* User */}
            <div className="db-role-badge">
              <div className="db-avatar">{user.username?.charAt(0).toUpperCase()}</div>
              <div className="db-user-details">
                <span className="db-username">{user.username}</span>
                <span className="db-role-text">{user.role}</span>
              </div>
            </div>

            {/* Notifications */}
            <button className="db-icon-btn">
              <BellIcon />
              <span className="db-notif-dot" />
            </button>

            {/* Logout */}
            <button className="db-logout-btn" onClick={handleLogout}>
              <LogoutIcon />
              Sign Out
            </button>
          </div>
        </header>

        {/* Main content */}
        <div className="db-content">
          {user.role === 'admin' ? (
            <AdminDashboard drivers={drivers} trips={trips} fetchTrips={fetchTrips} />
          ) : (
            <DriverDashboard driverInfo={driverInfo} trips={trips} fetchTrips={fetchTrips} user={user} />
          )}
        </div>
      </div>
    </>
  );
}

/* ── SVG Icons ── */
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

export default Dashboard;