import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import AdminDashboard from './admin/AdminDashboard';
import DriverDashboard from './driver/DriverDashboard';
import logo from '../assets/deltaplus.png';
import API_URL from '../config';

// Inject global keyframes once — needed for portal elements (mobile menu)
// that render outside the component's <style> tag scope.
const DB_STYLE_ID = 'db-global-styles';
if (typeof document !== 'undefined' && !document.getElementById(DB_STYLE_ID)) {
  const s = document.createElement('style');
  s.id = DB_STYLE_ID;
  s.textContent = `
    @keyframes menuSlideDown {
      from { opacity:0; transform:translateY(-8px) scale(0.97); }
      to   { opacity:1; transform:translateY(0) scale(1); }
    }
    .db-mobile-menu {
      position:fixed; top:58px; right:12px;
      background:#1c1f2e;
      border:1px solid rgba(255,255,255,0.12);
      border-radius:14px; padding:8px;
      min-width:240px;
      box-shadow:0 20px 60px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.05);
      z-index:99999;
      font-family:'DM Sans',sans-serif;
    }
    .db-menu-user { display:flex; align-items:center; gap:10px; padding:10px 12px 12px; border-bottom:1px solid rgba(255,255,255,0.07); margin-bottom:6px; }
    .db-menu-avatar { width:36px; height:36px; border-radius:9px; background:linear-gradient(135deg,#f59e0b,#d97706); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:800; font-size:14px; color:#0a0c10; flex-shrink:0; box-shadow:0 0 0 1px rgba(245,158,11,0.3); }
    .db-menu-username { font-size:14px; font-weight:600; color:#f3f4f6; line-height:1; margin-bottom:4px; }
    .db-menu-role { font-size:11px; color:#4b5563; }
    .db-menu-clock { display:flex; align-items:center; gap:9px; padding:9px 12px; background:rgba(255,255,255,0.03); border-radius:9px; margin-bottom:6px; }
    .db-menu-time { font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:600; color:#f3f4f6; }
    .db-menu-date { font-size:11px; color:#4b5563; }
    .db-menu-logout { display:flex; align-items:center; gap:8px; width:100%; padding:12px; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.15); border-radius:9px; color:#f87171; font-size:13.5px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; -webkit-appearance:none; }
    .db-menu-logout:active { background:rgba(239,68,68,0.16); }
  `;
  document.head.appendChild(s);
}
function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [drivers, setDrivers]       = useState([]);
  const [driverInfo, setDriverInfo] = useState(null);
  const [trips, setTrips]           = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted]       = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res  = await fetch(`${API_URL}/auth/check`, { credentials: 'include' });
        const data = await res.json();
        if (!data.authenticated) {
          navigate('/login');
        } else {
          if (!user || !user.username) setUser(data);
          if (data.role === 'driver')      fetchDriverInfo();
          else if (data.role === 'admin')  fetchDrivers();
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

  // Close menu on outside tap
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener('click', close, { once: true });
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  const fetchDriverInfo = async () => {
    try {
      const res  = await fetch(`${API_URL}/auth/drivers`, { credentials: 'include' });
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

  const formatTime = d => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = d => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const formatDateMobile = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=JetBrains+Mono:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

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
          from { opacity:0; transform:translateY(-12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.5; transform:scale(.75); }
        }
        @keyframes grain {
          0%,100% { transform:translate(0,0); }
          10%  { transform:translate(-1%,-1%); }
          30%  { transform:translate(1%,-2%); }
          50%  { transform:translate(-2%,1%); }
          70%  { transform:translate(2%,2%); }
          90%  { transform:translate(-1%,1%); }
        }
        @keyframes menuSlideDown {
          from { opacity:0; transform:translateY(-8px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        .db-root {
          display: flex;
          flex-direction: column;
          width: 100vw;
          height: 100dvh; /* dvh respects mobile browser chrome */
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
          height: 64px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 200;
          border-bottom: 1px solid rgba(255,255,255,0.09);
          box-shadow: 0 2px 24px rgba(0,0,0,0.4);
          isolation: isolate;
          animation: fadeSlideDown 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* Grain texture */
        .db-header::before {
          content:'';
          position:absolute; inset:0;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          background-size:180px;
          pointer-events:none; z-index:-1;
          animation:grain 8s steps(1) infinite;
        }

        /* Amber accent line */
        .db-header::after {
          content:'';
          position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg, transparent 0%, var(--amber) 30%, var(--amber-dim) 60%, transparent 100%);
          opacity:.85;
        }

        /* ── Left ── */
        .db-header-left { display:flex; align-items:center; gap:0; min-width:0; }

        .db-logo-wrap {
          display:flex; align-items:center;
          background:radial-gradient(ellipse at center, rgba(245,158,11,0.15) 0%, transparent 70%);
          border-radius:12px;
          padding:4px 14px 4px 8px;
          flex-shrink:0;
        }
        .db-logo-img { height:44px; width:auto; object-fit:contain; }

        .db-sep {
          width:1px; height:30px;
          background:linear-gradient(180deg, transparent, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 70%, transparent);
          margin:0 18px 0 0;
          flex-shrink:0;
        }

        .db-breadcrumb { display:flex; align-items:center; gap:7px; min-width:0; }
        .db-breadcrumb-arrow { color:var(--text-dim); font-size:12px; flex-shrink:0; }
        .db-breadcrumb-current {
          display:flex; align-items:center; gap:7px;
          font-size:13px; font-weight:600; color:var(--text-secondary);
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .db-role-dot {
          width:6px; height:6px; border-radius:50%; flex-shrink:0;
          animation:pulse-dot 2.5s ease-in-out infinite;
        }
        .db-role-dot.admin  { background:var(--amber); box-shadow:0 0 6px var(--amber); }
        .db-role-dot.driver { background:var(--green);  box-shadow:0 0 6px var(--green); }

        /* ── Right (desktop) ── */
        .db-header-right { display:flex; align-items:center; gap:6px; flex-shrink:0; }

        .db-clock {
          display:flex; align-items:center; gap:10px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; padding:7px 14px;
          margin-right:4px; transition:border-color .2s;
        }
        .db-clock:hover { border-color:rgba(255,255,255,0.14); }
        .db-clock-icon { color:var(--amber); display:flex; align-items:center; flex-shrink:0; opacity:.85; }
        .db-clock-body { display:flex; flex-direction:column; gap:2px; }
        .db-clock-date { font-size:10px; color:var(--text-dim); letter-spacing:.3px; line-height:1; white-space:nowrap; text-transform:uppercase; }
        .db-clock-time { font-family:'JetBrains Mono',monospace; font-size:13.5px; font-weight:600; color:var(--text-primary); letter-spacing:.5px; line-height:1; }

        .db-hdivider { width:1px; height:26px; background:rgba(255,255,255,0.08); margin:0 4px; flex-shrink:0; }

        .db-user-pill {
          display:flex; align-items:center; gap:10px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; padding:5px 12px 5px 5px;
          transition:border-color .2s;
        }
        .db-user-pill:hover { border-color:rgba(255,255,255,0.14); }
        .db-avatar {
          width:30px; height:30px; border-radius:8px;
          background:linear-gradient(135deg,var(--amber),var(--amber-dim));
          display:flex; align-items:center; justify-content:center;
          font-family:'Syne',sans-serif; font-weight:800; font-size:12px; color:var(--dark);
          flex-shrink:0;
          box-shadow:0 0 0 1px rgba(245,158,11,0.3),0 2px 8px rgba(245,158,11,0.15);
        }
        .db-user-details { display:flex; flex-direction:column; gap:3px; }
        .db-username { font-size:13px; font-weight:600; color:var(--text-primary); line-height:1; }
        .db-role-tag {
          display:inline-flex; align-items:center; gap:4px;
          font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.8px;
          padding:2px 6px; border-radius:4px; width:fit-content; line-height:1;
        }
        .db-role-tag.admin  { background:rgba(245,158,11,0.12); color:var(--amber); border:1px solid rgba(245,158,11,0.2); }
        .db-role-tag.driver { background:rgba(16,185,129,0.1);  color:var(--green); border:1px solid rgba(16,185,129,0.2); }

        .db-notif-btn {
          position:relative; background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08); border-radius:10px;
          width:38px; height:38px; display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:var(--text-secondary); transition:all .2s; flex-shrink:0;
        }
        .db-notif-btn:hover { background:rgba(255,255,255,0.08); color:var(--text-primary); border-color:rgba(255,255,255,0.14); }
        .db-notif-badge { position:absolute; top:8px; right:8px; width:7px; height:7px; background:var(--amber); border-radius:50%; border:1.5px solid #12141c; animation:pulse-dot 2.5s ease-in-out infinite; }

        .db-logout-btn {
          display:flex; align-items:center; gap:7px;
          background:transparent; border:1px solid rgba(239,68,68,0.2);
          border-radius:10px; padding:0 14px; height:38px;
          color:#f87171; cursor:pointer; font-size:13px;
          font-family:'DM Sans',sans-serif; font-weight:600;
          transition:all .2s; white-space:nowrap; flex-shrink:0;
          -webkit-appearance:none;
        }
        .db-logout-btn:hover { background:rgba(239,68,68,0.08); border-color:rgba(239,68,68,0.4); color:#fca5a5; }
        .db-logout-btn svg { transition:transform .2s; }
        .db-logout-btn:hover svg { transform:translateX(2px); }

        /* ── Mobile hamburger menu button ── */
        .db-hamburger {
          display:none;
          background:rgba(255,255,255,0.06);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:9px;
          width:38px; height:38px;
          align-items:center; justify-content:center;
          cursor:pointer; color:var(--text-secondary);
          transition:all .2s; flex-shrink:0;
          -webkit-appearance:none;
        }
        .db-hamburger:active { background:rgba(255,255,255,0.12); }

        /* ═══════════════════════════════
           SUBHEADER
        ═══════════════════════════════ */
        .db-subheader {
          background:#0f1117;
          border-bottom:1px solid var(--dark-border-2);
          padding:0 24px;
          height:36px;
          display:flex; align-items:center; justify-content:space-between;
          flex-shrink:0;
          animation:fadeSlideDown .5s .08s cubic-bezier(0.22,1,0.36,1) both;
        }
        .db-subheader-left { display:flex; align-items:center; gap:14px; }
        .db-subheader-label { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--text-dim); }
        .db-subheader-divider { width:3px; height:3px; border-radius:50%; background:var(--text-dim); }
        .db-status-chip { display:inline-flex; align-items:center; gap:5px; font-size:10.5px; font-weight:600; color:var(--green); letter-spacing:.3px; }
        .db-status-pulse { width:5px; height:5px; border-radius:50%; background:var(--green); animation:pulse-dot 1.8s ease-in-out infinite; }
        .db-subheader-right { font-size:10.5px; color:var(--text-dim); font-family:'JetBrains Mono',monospace; letter-spacing:.5px; white-space:nowrap; }

        /* ═══════════════════════════════
           CONTENT
        ═══════════════════════════════ */
        .db-content {
          flex:1; padding:24px 24px 32px;
          overflow-y:auto; height:0;
          animation:fadeSlideUp .5s .12s cubic-bezier(0.22,1,0.36,1) both;
        }
        .db-content::-webkit-scrollbar { width:4px; }
        .db-content::-webkit-scrollbar-track { background:transparent; }
        .db-content::-webkit-scrollbar-thumb { background:#2d2f36; border-radius:3px; }
        .db-content::-webkit-scrollbar-thumb:hover { background:#3d3f48; }

        /* ═══════════════════════════════
           MOBILE  ≤ 640px
        ═══════════════════════════════ */
        @media(max-width:640px){
          .db-header{ height:56px; padding:0 14px; }

          /* Logo — smaller */
          .db-logo-wrap{ padding:3px 10px 3px 4px; }
          .db-logo-img{ height:38px; }
          .db-sep{ height:26px; margin:0 12px 0 0; }

          /* Breadcrumb text — shorter on small screens */
          .db-breadcrumb-current{ font-size:12.5px; }

          /* Hide desktop right-side elements */
          .db-clock,
          .db-hdivider,
          .db-user-pill,
          .db-notif-btn,
          .db-logout-btn { display:none !important; }

          /* Show hamburger */
          .db-hamburger{ display:flex; }

          /* Mobile menu anchors to header bottom */
          .db-mobile-menu{ top:calc(56px + 2px); }

          /* Subheader — hide verbose right side */
          .db-subheader{ padding:0 14px; height:32px; }
          .db-subheader-right{ display:none; }
          .db-subheader-label{ font-size:10px; letter-spacing:.7px; }

          /* Content — tighter padding on mobile */
          .db-content{ padding:14px 12px 24px; }
        }

        @media(max-width:380px){
          .db-header{ padding:0 12px; }
          .db-logo-img{ height:34px; }
          .db-sep{ margin:0 10px 0 0; }
          .db-breadcrumb-current{ font-size:12px; }
          .db-content{ padding:12px 10px 20px; }
        }
      `}</style>

      <div className="db-root">

        {/* ── Header ── */}
        <header className="db-header">
          <div className="db-header-left">
            <div className="db-logo-wrap">
              <img src={logo} alt="DeltaPlus" className="db-logo-img" />
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

          {/* Desktop right */}
          <div className="db-header-right">
            <div className="db-clock">
              <span className="db-clock-icon"><ClockIcon /></span>
              <div className="db-clock-body">
                <span className="db-clock-date">{formatDate(currentTime)}</span>
                <span className="db-clock-time">{formatTime(currentTime)}</span>
              </div>
            </div>
            <div className="db-hdivider" />
            <div className="db-user-pill">
              <div className="db-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
              <div className="db-user-details">
                <span className="db-username">{user?.username}</span>
                <span className={`db-role-tag ${isAdmin ? 'admin' : 'driver'}`}>{isAdmin ? '⬡ Admin' : '⬡ Driver'}</span>
              </div>
            </div>
            <button className="db-notif-btn" title="Notifications">
              <BellIcon />
              <span className="db-notif-badge" />
            </button>
            <button className="db-logout-btn" onClick={handleLogout}>
              <LogoutIcon /> Sign Out
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="db-hamburger"
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
            aria-label="Menu"
          >
            {menuOpen ? <CloseMenuIcon /> : <HamburgerIcon />}
          </button>

          {/* Mobile dropdown — rendered via portal so it escapes isolation:isolate */}

        </header>

        {/* ── Mobile menu — portal so it escapes isolation:isolate on header ── */}
        {menuOpen && ReactDOM.createPortal(
          <div
            className="db-mobile-menu"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'menuSlideDown .2s cubic-bezier(0.22,1,0.36,1)' }}
          >
            {/* User info */}
            <div className="db-menu-user">
              <div className="db-menu-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
              <div>
                <div className="db-menu-username">{user?.username}</div>
                <div className="db-menu-role">{isAdmin ? '⬡ Admin' : '⬡ Driver'} · Session Active</div>
              </div>
            </div>
            {/* Live clock */}
            <div className="db-menu-clock">
              <span style={{ color: 'var(--amber)', display: 'flex', alignItems: 'center' }}><ClockIcon /></span>
              <div>
                <div className="db-menu-time">{formatTime(currentTime)}</div>
                <div className="db-menu-date">{formatDate(currentTime)}</div>
              </div>
            </div>
            {/* Logout */}
            <button className="db-menu-logout" onClick={handleLogout}>
              <LogoutIcon /> Sign Out
            </button>
          </div>,
          document.body
        )}

        {/* ── Subheader ── */}
        <div className="db-subheader">
          <div className="db-subheader-left">
            <span className="db-subheader-label">{isAdmin ? 'Operations Center' : 'Delivery Console'}</span>
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
          {isAdmin
            ? <AdminDashboard  drivers={drivers}    trips={trips} fetchTrips={fetchTrips} />
            : <DriverDashboard driverInfo={driverInfo} trips={trips} fetchTrips={fetchTrips} user={user} />
          }
        </div>

      </div>
    </>
  );
}

/* ── Icons ── */
function ClockIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function BellIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function LogoutIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function HamburgerIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function CloseMenuIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

export default Dashboard;