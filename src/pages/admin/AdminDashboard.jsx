import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import API_URL from '../../config';

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const AD_STYLE_ID = 'ad-global-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(AD_STYLE_ID)) {
  const s = document.createElement('style');
  s.id = AD_STYLE_ID;
  s.textContent = `
    @keyframes toastIn  { from{opacity:0;transform:translateX(30px) scale(0.95)} to{opacity:1;transform:none} }
    @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    @keyframes modalIn  { from{opacity:0;transform:scale(0.9) translateY(16px)} to{opacity:1;transform:none} }
    @keyframes pulse    { 0%{transform:scale(1);opacity:1} 50%{transform:scale(1.2);opacity:0.7} 100%{transform:scale(1);opacity:1} }
    @keyframes slideIn  { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
  `;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────
   SOUND HELPER
───────────────────────────────────────────── */
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const playBeep = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    playBeep(880, ctx.currentTime, 0.12);
    playBeep(1100, ctx.currentTime + 0.13, 0.12);
    playBeep(1320, ctx.currentTime + 0.26, 0.18);
  } catch (e) { /* fail silently */ }
}

/* ─────────────────────────────────────────────
   NOTIFICATION BELL
───────────────────────────────────────────── */
function NotificationBell({ count, onClick }) {
  return (
    <button onClick={onClick}
      style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'background 0.2s', marginRight: '4px' }}
      onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 && (
        <span style={{ position: 'absolute', top: '2px', right: '2px', minWidth: '16px', height: '16px', background: '#ef4444', borderRadius: '8px', fontSize: '10px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', animation: 'pulse 1.5s infinite' }}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────
   NOTIFICATION PANEL
───────────────────────────────────────────── */
function NotificationPanel({ notifications, onClickNotif, onClear, onClose }) {
  return ReactDOM.createPortal(
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999 }} />
      <div style={{ position: 'fixed', top: '64px', right: '16px', width: '340px', maxHeight: '460px', background: '#fff', borderRadius: '14px', boxShadow: '0 12px 48px rgba(0,0,0,0.18)', zIndex: 10000, overflow: 'hidden', animation: 'slideIn 0.25s ease', border: '1px solid #e5e7eb' }}>
        <div style={{ padding: '14px 16px', background: '#0f1117', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff', fontFamily: "'Syne',sans-serif" }}>
            🔔 Notifications
            {notifications.length > 0 && <span style={{ background: '#ef4444', borderRadius: 10, padding: '1px 7px', fontSize: 11, marginLeft: 6 }}>{notifications.length}</span>}
          </span>
          <button onClick={onClear}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '12px', fontFamily: "'DM Sans',sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
          >Clear all</button>
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {notifications.length === 0
            ? <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No notifications yet</div>
            : notifications.map(n => (
              <div key={n.id} onClick={() => onClickNotif(n)}
                style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.15s', display: 'flex', gap: 12, alignItems: 'flex-start' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{n.type === 'new' ? '🚚' : '✏️'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f1117' }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 4 }}>{n.time}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </>,
    document.body
  );
}

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
function Toast({ toasts, removeToast }) {
  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999999, display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px 0', pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'all', display: 'flex', alignItems: 'flex-start', gap: 12, background: t.type === 'error' ? '#1a0505' : '#0f1117', border: `1px solid ${t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#f59e0b'}`, borderLeft: `4px solid ${t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#f59e0b'}`, borderRadius: 12, padding: '12px 16px', width: '100%', maxWidth: 480, marginLeft: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)', fontFamily: "'DM Sans',sans-serif" }}>
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            {t.title && <div style={{ fontWeight: 700, fontSize: 13.5, color: '#fff', marginBottom: 2 }}>{t.title}</div>}
            <div style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.45 }}>{t.message}</div>
          </div>
          <button onClick={() => removeToast(t.id)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 18, padding: 0, marginLeft: 4, flexShrink: 0 }}>×</button>
        </div>
      ))}
    </div>,
    document.body
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type, title }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
  }, []);
  const removeToast = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, addToast, removeToast };
}

/* ─────────────────────────────────────────────
   LOADING OVERLAY
───────────────────────────────────────────── */
function LoadingOverlay({ message = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 16 }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', border: '3px solid #f3f4f6', borderTopColor: '#f59e0b', animation: 'spin 0.75s linear infinite' }} />
      <span style={{ color: '#9ca3af', fontSize: 14, fontFamily: "'DM Sans',sans-serif" }}>{message}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EDIT TRIP MODAL
───────────────────────────────────────────── */
function EditTripModal({ modal, onClose, onSubmit, tripData, setTripData, invoices, setInvoices, checks, setChecks, loading }) {
  if (!modal.open) return null;

  const addInvoice = () => setInvoices([...invoices, { invoice_no: '', amount: '' }]);
  const removeInvoice = idx => setInvoices(invoices.filter((_, i) => i !== idx));
  const updateInvoice = (idx, field, val) => { const u = [...invoices]; u[idx][field] = val; setInvoices(u); };
  const addCheck = () => setChecks([...checks, { check_no: '', amount: '' }]);
  const removeCheck = idx => setChecks(checks.filter((_, i) => i !== idx));
  const updateCheck = (idx, field, val) => { const u = [...checks]; u[idx][field] = val; setChecks(u); };

  const fmt = val => {
    if (!val) return '—';
    const p = val.split(':'), h = parseInt(p[0], 10), m = p[1] || '00';
    return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 999998, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'fadeIn 0.2s ease' }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: 'clamp(24px,5vw,36px) clamp(20px,5vw,32px)', maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', animation: 'modalIn 0.25s cubic-bezier(0.34,1.4,0.64,1)', fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✏️</div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: '#0f1117' }}>Edit Trip</div>
            <div style={{ fontSize: 13.5, color: '#6b7280', marginTop: 2 }}>Trip #{modal.tripId} · {tripData.date}</div>
          </div>
        </div>

        {/* Time read-only */}
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 20px', marginBottom: 24, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>⏱️ TIME RECORDS (Read Only)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[['Departure', tripData.time_departure, '#10b981', '#ecfdf5'], ['Arrival', tripData.time_arrival, '#3b82f6', '#eff6ff'], ['Unload End', tripData.time_unload_end, '#ef4444', '#fef2f2']].map(([label, val, color, bg]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 500 }}>{label}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color, background: bg, display: 'inline-block', padding: '4px 12px', borderRadius: 8 }}>{fmt(val)}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 12, fontStyle: 'italic', paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>⚠️ Time fields cannot be edited.</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {[['Helper', 'helper', 'Helper name'], ['Dealer', 'dealer', 'Dealer name']].map(([label, key, ph]) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
              <input type="text" value={tripData[key]} onChange={e => setTripData({ ...tripData, [key]: e.target.value })} placeholder={ph}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: "'DM Sans',sans-serif" }}
                onFocus={e => e.target.style.borderColor = '#f59e0b'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Odometer (km)</label>
          <input type="number" value={tripData.odometer} onChange={e => setTripData({ ...tripData, odometer: e.target.value })} placeholder="Enter odometer reading"
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: "'DM Sans',sans-serif" }}
            onFocus={e => e.target.style.borderColor = '#f59e0b'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>

        {[
          { title: '📋 Invoices', items: invoices, keyField: 'invoice_no', keyPh: 'Invoice No.', add: addInvoice, remove: removeInvoice, update: updateInvoice, bg: '#fef3c7', color: '#d97706', hov: '#fde68a' },
          { title: '💳 Checks', items: checks, keyField: 'check_no', keyPh: 'Check No.', add: addCheck, remove: removeCheck, update: updateCheck, bg: '#d1fae5', color: '#059669', hov: '#a7f3d0' },
        ].map(({ title, items, keyField, keyPh, add, remove, update, bg, color, hov }) => (
          <div key={title} style={{ marginBottom: 20, border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>
                {title} <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginLeft: 6 }}>{items.filter(i => i[keyField]).length}</span>
              </span>
              <button onClick={add} style={{ background: bg, border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, color, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = hov} onMouseLeave={e => e.currentTarget.style.background = bg}>+ Add</button>
            </div>
            <div style={{ padding: 16 }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <input type="text" placeholder={keyPh} value={item[keyField]} onChange={e => update(idx, keyField, e.target.value)}
                    style={{ flex: 2, padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#f59e0b'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  <input type="number" placeholder="Amount (₱)" value={item.amount} onChange={e => update(idx, 'amount', e.target.value)}
                    style={{ flex: 1, padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#f59e0b'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  {items.length > 1 && <button onClick={() => remove(idx)} style={{ background: '#fee2e2', border: 'none', padding: '9px 14px', borderRadius: 8, cursor: 'pointer', color: '#ef4444', fontWeight: 600, fontSize: 14 }}>×</button>}
                </div>
              ))}
              <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', marginTop: 8 }}>Leave blank if none for this trip.</div>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '13px', border: '1.5px solid #e5e7eb', borderRadius: 10, background: '#fff', color: '#374151', fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
          <button onClick={onSubmit} disabled={loading} style={{ flex: 1, padding: '13px', border: 'none', borderRadius: 10, background: '#0f1117', color: '#fff', fontSize: 14.5, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─────────────────────────────────────────────
   PASSWORD RESET MODAL
───────────────────────────────────────────── */
function ResetPasswordModal({ modal, onClose, onSubmit, newPassword, setNewPassword, confirmPassword, setConfirmPassword, showNew, setShowNew, showConfirm, setShowConfirm }) {
  if (!modal.open) return null;
  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 999998, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'fadeIn 0.2s ease' }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: 'clamp(24px,5vw,36px) clamp(20px,5vw,32px)', maxWidth: 420, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', animation: 'modalIn 0.25s cubic-bezier(0.34,1.4,0.64,1)', fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🔑</div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: '#0f1117' }}>Reset Password</div>
            <div style={{ fontSize: 13.5, color: '#6b7280', marginTop: 2 }}>{modal.driverName} (@{modal.driverUsername})</div>
          </div>
        </div>
        {[
          { label: 'New Password', val: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(v => !v), ph: 'Enter new password' },
          { label: 'Confirm Password', val: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(v => !v), ph: 'Confirm new password' },
        ].map(({ label, val, set, show, toggle, ph }) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
            <div style={{ position: 'relative' }}>
              <input type={show ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                style={{ width: '100%', padding: '12px 44px 12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 16, outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans',sans-serif" }}
                onFocus={e => e.target.style.borderColor = '#f59e0b'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              <button type="button" onClick={toggle} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280' }}>{show ? '👁️' : '👁️‍🗨️'}</button>
            </div>
            {label === 'New Password' && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Minimum 6 characters</div>}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '13px', border: '1.5px solid #e5e7eb', borderRadius: 10, background: '#fff', color: '#374151', fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
          <button onClick={onSubmit} style={{ flex: 1, padding: '13px', border: 'none', borderRadius: 10, background: '#0f1117', color: '#fff', fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Reset Password</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
function AdminDashboard({ drivers: propDrivers, trips: propTrips, fetchTrips: parentFetchTrips }) {
  const { toasts, addToast, removeToast } = useToast();

  const [view, setView] = useState('drivers');
  const [activeDatabase, setActiveDatabase] = useState('main');
  const [historicalTrips, setHistoricalTrips] = useState([]);
  const [historicalDrivers, setHistoricalDrivers] = useState([]);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // ── INTERNAL TRIPS STATE ────────────────────────────────────────────────
  const [mainTrips, setMainTrips] = useState(propTrips || []);

  // Snapshot of the previous poll for diff comparison
  const prevTripsRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const intervalRef = useRef(null);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  // Edit Trip Modal
  const [editModal, setEditModal] = useState({ open: false, tripId: null });
  const [editTripData, setEditTripData] = useState({ date: '', helper: '', dealer: '', odometer: '', time_departure: '', time_arrival: '', time_unload_end: '' });
  const [editInvoices, setEditInvoices] = useState([]);
  const [editChecks, setEditChecks] = useState([]);

  // Password reset
  const [resetPasswordModal, setResetPasswordModal] = useState({ open: false, driverId: null, driverName: '', driverUsername: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Filters
  const [driverSearch, setDriverSearch] = useState('');
  const [tripSearch, setTripSearch] = useState('');
  const [filterDriver, setFilterDriver] = useState('');
  const [filterDealer, setFilterDealer] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Analytics
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');
  const [analyticsDriver, setAnalyticsDriver] = useState('');
  const [analyticsYear, setAnalyticsYear] = useState('all');

  /* ── Request notification permission ── */
  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    if (result === 'granted') addToast('Browser notifications enabled!', 'success', 'Notifications On');
    else addToast('Notifications blocked. Check browser settings.', 'info', 'Notifications Off');
  }, [addToast]);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      const t = setTimeout(() => requestPermission(), 2000);
      return () => clearTimeout(t);
    }
  }, [requestPermission]);

  /* ── Send browser notification ── */
  const sendBrowserNotif = useCallback((title, body, tag = 'trip-notif') => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    try {
      const n = new Notification(title, { body, icon: '/favicon.ico', tag, renotify: true });
      n.onclick = () => { window.focus(); n.close(); };
    } catch (e) { console.warn('Notification error:', e); }
  }, []);

  /* ── CORE FIX: runNotificationDiff ───────────────────────────────────── */
  const runNotificationDiff = useCallback((freshTrips) => {
    if (isFirstLoadRef.current) {
      prevTripsRef.current = new Map(freshTrips.map(t => [t.id, t]));
      isFirstLoadRef.current = false;
      return;
    }

    const prevMap = prevTripsRef.current || new Map();

    const newTrips = freshTrips.filter(t => !prevMap.has(t.id));
    const updatedTrips = freshTrips.filter(t => {
      const old = prevMap.get(t.id);
      if (!old) return false;
      return (
        old.odometer !== t.odometer ||
        old.dealer !== t.dealer ||
        old.helper !== t.helper ||
        old.updated_at !== t.updated_at
      );
    });

    if (newTrips.length > 0) {
      newTrips.forEach(trip => {
        const notif = {
          id: Date.now() + Math.random(),
          type: 'new',
          title: 'New Trip Added',
          message: `${trip.driver_name} → ${trip.dealer || 'Unknown Dealer'}`,
          time: new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
          data: trip,
        };
        setNotifications(prev => [notif, ...prev].slice(0, 30));
        addToast(`${trip.driver_name} started a new trip to ${trip.dealer || '—'}`, 'success', '🚚 New Trip');
        sendBrowserNotif('🚚 New Trip Added', `${trip.driver_name} → ${trip.dealer || 'Unknown Dealer'}`, `new-trip-${trip.id}`);
      });
      if (soundEnabled) playNotificationSound();
    }

    if (updatedTrips.length > 0) {
      const notif = {
        id: Date.now() + Math.random(),
        type: 'update',
        title: 'Trip Updated',
        message: `${updatedTrips.length} trip${updatedTrips.length > 1 ? 's were' : ' was'} updated`,
        time: new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
        data: null,
      };
      setNotifications(prev => [notif, ...prev].slice(0, 30));
      addToast(`${updatedTrips.length} trip(s) were updated`, 'info', '✏️ Updated');
      sendBrowserNotif('✏️ Trip Updated', `${updatedTrips.length} trip${updatedTrips.length > 1 ? 's were' : ' was'} modified`);
      if (soundEnabled) playNotificationSound();
    }

    prevTripsRef.current = new Map(freshTrips.map(t => [t.id, t]));
  }, [addToast, sendBrowserNotif, soundEnabled]);

  /* ── Internal fetchMainTrips ── */
  const fetchMainTrips = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/trips`, { credentials: 'include' });
      const data = await res.json();
      const fresh = Array.isArray(data) ? data : (data.trips || []);
      runNotificationDiff(fresh);
      setMainTrips(fresh);
      if (typeof parentFetchTrips === 'function') parentFetchTrips();
    } catch {
      // silent
    }
  }, [runNotificationDiff, parentFetchTrips]);

  /* ── Auto-refresh every 1 second ── */
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!autoRefreshEnabled) return;
    intervalRef.current = setInterval(() => {
      if (activeDatabase === 'main') fetchMainTrips();
      else fetchHistoricalData();
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [autoRefreshEnabled, activeDatabase, fetchMainTrips]);

  /* ── Reset snapshot when switching databases ── */
  useEffect(() => {
    isFirstLoadRef.current = true;
    prevTripsRef.current = null;
    if (activeDatabase === 'historical') fetchHistoricalData();
    else { fetchMainTrips(); fetchDrivers(); }
  }, [activeDatabase]);

  /* ── Initial load ── */
  useEffect(() => {
    fetchMainTrips();
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await fetch(`${API_URL}/trips/users`, { credentials: 'include' });
      const data = await res.json();
      if (Array.isArray(data)) setDrivers(data);
      else if (data.error) addToast(data.error, 'error', 'Error');
    } catch { addToast('Failed to load drivers', 'error', 'Connection Error'); }
  };

  const fetchHistoricalData = async () => {
    setLoadingHistorical(true);
    try {
      const [tRes, dRes] = await Promise.all([
        fetch(`${API_URL}/api/2025/trips`, { credentials: 'include' }),
        fetch(`${API_URL}/api/2025/drivers`, { credentials: 'include' }),
      ]);
      const tData = await tRes.json();
      const dData = await dRes.json();
      const freshHist = tData.trips || [];
      runNotificationDiff(freshHist);
      setHistoricalTrips(freshHist);
      setHistoricalDrivers(dData.drivers || []);
      addToast(`Loaded ${freshHist.length} historical trips.`, 'success', '2025 Data Loaded');
    } catch { addToast('Failed to load historical data.', 'error', 'Load Error'); }
    finally { setLoadingHistorical(false); }
  };

  const manualRefresh = async () => {
    addToast('Refreshing data...', 'info', 'Refresh');
    if (activeDatabase === 'main') await fetchMainTrips();
    else await fetchHistoricalData();
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const openEditModal = trip => {
    setEditTripData({ date: trip.date, helper: trip.helper || '', dealer: trip.dealer || '', odometer: trip.odometer || '', time_departure: trip.time_departure || '', time_arrival: trip.time_arrival || '', time_unload_end: trip.time_unload_end || '' });
    setEditInvoices(trip.invoices?.length > 0 ? trip.invoices.map(i => ({ invoice_no: i.invoice_no, amount: String(i.amount) })) : [{ invoice_no: '', amount: '' }]);
    setEditChecks(trip.checks?.length > 0 ? trip.checks.map(c => ({ check_no: c.check_no, amount: String(c.amount) })) : [{ check_no: '', amount: '' }]);
    setEditModal({ open: true, tripId: trip.id });
  };

  const handleUpdateTrip = async () => {
    setLoadingUpdate(true);
    try {
      const validInvoices = editInvoices.filter(i => i.invoice_no && i.amount);
      const validChecks = editChecks.filter(c => c.check_no && c.amount);
      const res = await fetch(`${API_URL}/trips/${editModal.tripId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helper: editTripData.helper, dealer: editTripData.dealer, odometer: editTripData.odometer, invoices: validInvoices, checks: validChecks }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        addToast('Trip updated successfully!', 'success', 'Updated');
        setEditModal({ open: false, tripId: null });
        if (activeDatabase === 'main') await fetchMainTrips(); else await fetchHistoricalData();
      } else { addToast(data.message || 'Failed to update trip', 'error', 'Update Failed'); }
    } catch { addToast('Could not connect to server', 'error', 'Connection Error'); }
    finally { setLoadingUpdate(false); }
  };

  const openResetPasswordModal = driver => {
    setResetPasswordModal({ open: true, driverId: driver.id, driverName: driver.full_name, driverUsername: driver.username });
    setNewPassword(''); setConfirmPassword('');
  };
  const closeResetModal = () => setResetPasswordModal({ open: false, driverId: null, driverName: '', driverUsername: '' });

  const handleResetPassword = async () => {
    if (!newPassword) { addToast('Please enter a new password', 'error', 'Required'); return; }
    if (newPassword.length < 6) { addToast('Minimum 6 characters', 'error', 'Too Short'); return; }
    if (newPassword !== confirmPassword) { addToast('Passwords do not match', 'error', 'Mismatch'); return; }
    try {
      const res = await fetch(`${API_URL}/trips/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: resetPasswordModal.driverId, new_password: newPassword }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) { addToast(`Password for ${resetPasswordModal.driverName} reset`, 'success', 'Done'); closeResetModal(); fetchDrivers(); }
      else { addToast(data.message || 'Failed', 'error', 'Error'); }
    } catch { addToast('Could not connect to server', 'error', 'Connection Error'); }
  };

  /* ── Derived data ── */
  const currentDrivers = activeDatabase === 'main' ? drivers : historicalDrivers;
  const currentTrips = activeDatabase === 'main' ? mainTrips : historicalTrips;
  const today = () => new Date().toISOString().split('T')[0];

  const driverNames = useMemo(() => [...new Set(currentTrips.map(t => t.driver_name).filter(Boolean))], [currentTrips]);
  const dealers = useMemo(() => [...new Set(currentTrips.map(t => t.dealer).filter(Boolean))], [currentTrips]);
  const availableYears = useMemo(() => [...new Set(currentTrips.map(t => t.date?.slice(0, 4)).filter(Boolean))].sort((a, b) => b - a), [currentTrips]);

  const filteredDrivers = useMemo(() => {
    const q = driverSearch.toLowerCase();
    if (!q) return currentDrivers;
    return currentDrivers.filter(d => [d.full_name, d.username, d.email, d.phone, d.license_number].some(v => v?.toLowerCase().includes(q)));
  }, [currentDrivers, driverSearch]);

  const filteredTrips = useMemo(() => currentTrips.filter(t => {
    const q = tripSearch.toLowerCase();
    return (!q || [t.driver_name, t.helper, t.dealer, t.date].some(v => v?.toLowerCase().includes(q)))
      && (!filterDriver || t.driver_name === filterDriver)
      && (!filterDealer || t.dealer === filterDealer)
      && (!filterDateFrom || t.date >= filterDateFrom)
      && (!filterDateTo || t.date <= filterDateTo);
  }), [currentTrips, tripSearch, filterDriver, filterDealer, filterDateFrom, filterDateTo]);

  const hasDriverFilters = !!driverSearch;
  const hasTripFilters = !!(tripSearch || filterDriver || filterDealer || filterDateFrom || filterDateTo);
  const clearDriverFilters = () => setDriverSearch('');
  const clearTripFilters = () => { setTripSearch(''); setFilterDriver(''); setFilterDealer(''); setFilterDateFrom(''); setFilterDateTo(''); };

  const downloadCSV = (headers, rows, filename) => {
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = filename; a.click();
  };

  const exportDrivers = () => {
    downloadCSV(['Full Name', 'Username', 'Email', 'Phone', 'License No.'],
      filteredDrivers.map(d => [d.full_name, d.username, d.email, d.phone, d.license_number]),
      `drivers_${activeDatabase}_${today()}.csv`);
    addToast(`Exported ${filteredDrivers.length} driver(s).`, 'success', 'Export Complete');
  };

  const exportTrips = () => {
    const headers = ['Date', 'Driver', 'Helper', 'Dealer', 'Time Departure', 'Time Arrival', 'Time Unload End', 'Departure Odometer', 'Arrival Odometer', 'Distance (km)', 'Total Invoices', 'Total Checks', 'Invoices', 'Checks', 'Location Lat', 'Location Lng', 'Google Maps Link'];
    const rows = filteredTrips.map(t => {
      const map = t.location_lat && t.location_lng ? `https://www.google.com/maps?q=${t.location_lat},${t.location_lng}` : '';
      const inv = t.invoices?.length > 0 ? t.invoices.map(i => `${i.invoice_no}(₱${i.amount})`).join(';') : '';
      const chk = t.checks?.length > 0 ? t.checks.map(c => `${c.check_no}(₱${c.amount})`).join(';') : '';
      const totalInv = t.total_invoices || 0;
      const totalChk = t.total_checks || 0;
      const distance = t.departure_odometer && t.arrival_odometer ? (t.arrival_odometer - t.departure_odometer).toFixed(1) : '';
      return [t.date, t.driver_name, t.helper || '', t.dealer,
      t.time_departure || '', t.time_arrival || '', t.time_unload_end || '',
      t.departure_odometer || '', t.arrival_odometer || '', distance,
        totalInv, totalChk, inv, chk, t.location_lat || '', t.location_lng || '', map];
    });
    downloadCSV(headers, rows, `trips_${activeDatabase}_${today()}.csv`);
    addToast(`Exported ${filteredTrips.length} trip(s).`, 'success', 'Export Complete');
  };

  /* ── Analytics ── */
  const getAmount = t => t.invoices?.length > 0 ? t.invoices.reduce((s, i) => s + (Number(i.amount) || 0), 0) : (Number(t.amount) || 0);

  const analyticsTrips = useMemo(() => {
    let f = analyticsDriver ? currentTrips.filter(t => t.driver_name === analyticsDriver) : currentTrips;
    if (analyticsYear !== 'all') f = f.filter(t => t.date?.startsWith(analyticsYear));
    return f;
  }, [currentTrips, analyticsDriver, analyticsYear]);

  const analyticsData = useMemo(() => {
    const now = new Date();
    const refYear = analyticsYear !== 'all' ? parseInt(analyticsYear) : now.getFullYear();
    const refDate = analyticsYear !== 'all' ? new Date(refYear, 11, 31) : now;
    const labels = [], tripCounts = [], kmTotals = [], amountTotals = [];
    if (analyticsPeriod === 'day') {
      for (let i = 13; i >= 0; i--) {
        const d = new Date(refDate); d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const dt = analyticsTrips.filter(t => t.date === key);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        tripCounts.push(dt.length);
        kmTotals.push(dt.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0));
        amountTotals.push(dt.reduce((s, t) => s + getAmount(t), 0));
      }
    } else if (analyticsPeriod === 'week') {
      for (let i = 11; i >= 0; i--) {
        const start = new Date(refDate); start.setDate(start.getDate() - (i * 7) - start.getDay());
        const end = new Date(start); end.setDate(end.getDate() + 6);
        const wt = analyticsTrips.filter(t => t.date >= start.toISOString().split('T')[0] && t.date <= end.toISOString().split('T')[0]);
        labels.push(start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        tripCounts.push(wt.length); kmTotals.push(wt.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0)); amountTotals.push(wt.reduce((s, t) => s + getAmount(t), 0));
      }
    } else if (analyticsPeriod === 'month') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(refYear, (analyticsYear !== 'all' ? 11 : now.getMonth()) - i, 1);
        const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const mt = analyticsTrips.filter(t => t.date?.startsWith(prefix));
        labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        tripCounts.push(mt.length); kmTotals.push(mt.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0)); amountTotals.push(mt.reduce((s, t) => s + getAmount(t), 0));
      }
    } else {
      const startYear = analyticsYear !== 'all' ? refYear - 4 : now.getFullYear() - 4;
      for (let y = startYear; y <= refYear; y++) {
        const yt = analyticsTrips.filter(t => t.date?.startsWith(String(y)));
        labels.push(String(y));
        tripCounts.push(yt.length); kmTotals.push(yt.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0)); amountTotals.push(yt.reduce((s, t) => s + getAmount(t), 0));
      }
    }
    return { labels, tripCounts, kmTotals, amountTotals };
  }, [analyticsTrips, analyticsPeriod, analyticsYear]);

  const topDealersByAmount = useMemo(() => {
    const map = {};
    analyticsTrips.forEach(t => { if (!t.dealer) return; if (!map[t.dealer]) map[t.dealer] = { total: 0, count: 0 }; map[t.dealer].total += getAmount(t); map[t.dealer].count++; });
    return Object.entries(map).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.total - a.total);
  }, [analyticsTrips]);

  const driverRevenue = useMemo(() => {
    const map = {};
    analyticsTrips.forEach(t => { if (!t.driver_name) return; if (!map[t.driver_name]) map[t.driver_name] = { total: 0, trips: 0 }; map[t.driver_name].total += getAmount(t); map[t.driver_name].trips++; });
    return Object.entries(map).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.total - a.total);
  }, [analyticsTrips]);

  const totalRevenue = analyticsData.amountTotals.reduce((a, b) => a + b, 0);
  const avgTripValue = analyticsTrips.length > 0 ? totalRevenue / analyticsTrips.length : 0;

  const fmtTime = val => {
    if (!val) return '—';
    const p = val.split(':'), h = parseInt(p[0], 10), m = p[1] || '00';
    return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  /* ── RENDER ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
        .ad-root{font-family:'DM Sans',sans-serif}
        .ad-db-switcher{display:flex;align-items:center;gap:10px;margin-bottom:16px;background:#fff;padding:14px 18px;border-radius:14px;border:1px solid #e5e7eb;flex-wrap:wrap}
        .ad-db-label{font-size:11.5px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.7px;flex-shrink:0}
        .ad-db-buttons{display:flex;gap:6px;flex-wrap:wrap}
        .ad-db-btn{display:flex;align-items:center;gap:7px;padding:8px 16px;border:1.5px solid #e5e7eb;border-radius:9px;background:#fff;font-size:13px;font-weight:600;color:#6b7280;cursor:pointer;transition:all .2s;font-family:'Syne',sans-serif}
        .ad-db-btn:hover:not(.active){border-color:#d1d5db;background:#f9fafb;color:#374151}
        .ad-db-btn.active{background:#0f1117;color:#fff;border-color:#0f1117;box-shadow:0 2px 8px rgba(0,0,0,.18)}
        .ad-db-btn.active .ad-db-badge{background:#f59e0b;color:#0f1117}
        .ad-db-badge{background:#f3f4f6;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700}
        .ad-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
        .ad-stat-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px;transition:box-shadow .2s,transform .2s}
        .ad-stat-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.07);transform:translateY(-1px)}
        .ad-stat-icon{width:44px;height:44px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff}
        .ad-stat-icon.amber{background:linear-gradient(135deg,#f59e0b,#d97706)}
        .ad-stat-icon.indigo{background:linear-gradient(135deg,#6366f1,#4f46e5)}
        .ad-stat-icon.emerald{background:linear-gradient(135deg,#10b981,#059669)}
        .ad-stat-icon.rose{background:linear-gradient(135deg,#f43f5e,#e11d48)}
        .ad-stat-value{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:#0f1117;letter-spacing:-.5px;line-height:1;margin-bottom:4px}
        .ad-stat-label{font-size:11px;color:#9ca3af;font-weight:500;text-transform:uppercase;letter-spacing:.6px}
        .ad-tabs{display:flex;gap:3px;background:#f3f4f6;border-radius:10px;padding:4px;margin-bottom:16px;overflow-x:auto}
        .ad-tabs::-webkit-scrollbar{display:none}
        .ad-tab{display:flex;align-items:center;gap:7px;padding:9px 16px;border-radius:7px;border:none;background:transparent;color:#6b7280;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .18s;white-space:nowrap;flex-shrink:0}
        .ad-tab.active{background:#0f1117;color:#fff;box-shadow:0 1px 4px rgba(0,0,0,.15)}
        .ad-tab-count{background:rgba(245,158,11,.15);color:#f59e0b;font-size:11px;font-weight:700;padding:2px 7px;border-radius:20px}
        .ad-tab.active .ad-tab-count{background:rgba(245,158,11,.25)}
        .ad-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden}
        .ad-card-header{padding:18px 22px;border-bottom:1px solid #f3f4f6;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
        .ad-card-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#0f1117;letter-spacing:-.2px}
        .ad-card-sub{font-size:12.5px;color:#9ca3af;margin-top:3px}
        .ad-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
        .ad-search-wrap{position:relative;display:flex;align-items:center;flex:1;min-width:160px}
        .ad-search-icon{position:absolute;left:10px;color:#9ca3af;pointer-events:none;display:flex;align-items:center}
        .ad-search{padding:9px 13px 9px 32px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;font-family:'DM Sans',sans-serif;color:#111827;background:#f9fafb;outline:none;width:100%}
        .ad-search:focus{border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.08);background:#fff}
        .ad-select,.ad-date-input{padding:9px 11px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;font-family:'DM Sans',sans-serif;color:#374151;background:#f9fafb;outline:none;cursor:pointer;-webkit-appearance:none;appearance:none}
        .ad-select{padding-right:28px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 9px center}
        .ad-select:focus,.ad-date-input:focus{border-color:#f59e0b}
        .ad-export-btn{display:flex;align-items:center;gap:6px;background:#0f1117;border:none;border-radius:8px;padding:9px 14px;font-size:13px;font-family:'DM Sans',sans-serif;font-weight:500;color:#fff;cursor:pointer;white-space:nowrap}
        .ad-refresh-btn{display:flex;align-items:center;gap:6px;background:#f3f4f6;border:none;border-radius:8px;padding:9px 14px;font-size:13px;font-family:'DM Sans',sans-serif;font-weight:500;color:#4b5563;cursor:pointer;white-space:nowrap}
        .ad-clear-btn{display:flex;align-items:center;gap:5px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:9px 12px;font-size:13px;font-family:'DM Sans',sans-serif;font-weight:500;color:#ef4444;cursor:pointer;white-space:nowrap}
        .ad-toggle-btn{display:flex;align-items:center;gap:6px;border:none;border-radius:8px;padding:9px 13px;font-size:12.5px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .2s}
        .ad-filter-bar{padding:11px 22px;background:#fafafa;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .ad-filter-label{font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px}
        .ad-filter-tag{display:flex;align-items:center;gap:4px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);color:#92400e;border-radius:6px;padding:3px 9px;font-size:12px;font-weight:500}
        .ad-results-count{padding:9px 22px;background:#f8fafc;border-bottom:1px solid #f3f4f6;font-size:12.5px;color:#6b7280}
        .ad-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
        .ad-table-wrap::-webkit-scrollbar{height:4px}
        .ad-table-wrap::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:3px}
        .ad-table{width:100%;border-collapse:collapse;font-size:13.5px}
        .ad-table thead tr{background:#f8fafc;border-bottom:1px solid #e5e7eb}
        .ad-table th{padding:12px 16px;text-align:left;font-size:10.5px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.7px;white-space:nowrap}
        .ad-table td{padding:13px 16px;color:#374151;border-bottom:1px solid #f3f4f6;white-space:nowrap}
        .ad-table tbody tr:last-child td{border-bottom:none}
        .ad-table tbody tr:hover{background:#fffbf0}
        .ad-driver-cell{display:flex;align-items:center;gap:10px}
        .ad-driver-avatar{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;color:#0f1117;flex-shrink:0}
        .ad-driver-name{font-weight:600;color:#111827;font-size:13.5px}
        .ad-driver-user{font-size:11.5px;color:#9ca3af;margin-top:2px}
        .ad-badge{display:inline-flex;align-items:center;padding:3px 11px;border-radius:20px;font-size:12px;font-weight:500}
        .ad-badge.license{background:#eff6ff;color:#3b82f6}
        .ad-invoice-badge{display:inline-block;padding:2px 8px;background:#fef3c7;color:#92400e;border-radius:6px;font-size:11.5px;font-weight:600;margin:2px}
        .ad-check-badge{display:inline-block;padding:2px 8px;background:#d1fae5;color:#065f46;border-radius:6px;font-size:11.5px;font-weight:600;margin:2px}
        .ad-map-link{color:#3b82f6;text-decoration:none;display:inline-flex;align-items:center;gap:4px;padding:3px 9px;background:#eff6ff;border-radius:6px;font-size:12px;font-weight:500}
        .ad-map-link:hover{background:#dbeafe}
        .ad-edit-btn{background:#eff6ff;border:none;border-radius:6px;padding:6px 12px;font-size:12px;font-weight:500;color:#3b82f6;cursor:pointer;transition:all .18s}
        .ad-edit-btn:hover{background:#dbeafe}
        .ad-empty{padding:60px 20px;text-align:center;color:#9ca3af;font-size:14px}
        .ad-empty-icon{width:50px;height:50px;background:#f3f4f6;border-radius:13px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#d1d5db}
        .an-kpi-label{font-size:11.5px;color:#6b7280;margin-bottom:9px}
        .an-kpi-val{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:#0f1117}
        @media(max-width:640px){
          .ad-stats{grid-template-columns:1fr 1fr;gap:8px}
          .ad-stat-card{padding:12px 14px}
          .ad-stat-icon{width:36px;height:36px}
          .ad-stat-value{font-size:20px}
          .ad-table thead{display:none}
          .ad-table tbody tr{display:block;margin-bottom:12px;border:1px solid #e5e7eb;border-radius:12px;padding:12px}
          .ad-table td{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border:none;white-space:normal}
          .ad-table td::before{content:attr(data-label);font-weight:600;color:#6b7280;margin-right:12px;font-size:12px}
          .ad-driver-cell{flex:1}
        }
      `}</style>

      <Toast toasts={toasts} removeToast={removeToast} />

      {showNotifications && (
        <NotificationPanel
          notifications={notifications}
          onClickNotif={n => { if (n.data) setView('trips'); setShowNotifications(false); }}
          onClear={clearNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      <EditTripModal modal={editModal} onClose={() => setEditModal({ open: false, tripId: null })} onSubmit={handleUpdateTrip}
        tripData={editTripData} setTripData={setEditTripData}
        invoices={editInvoices} setInvoices={setEditInvoices}
        checks={editChecks} setChecks={setEditChecks} loading={loadingUpdate} />

      <ResetPasswordModal modal={resetPasswordModal} onClose={closeResetModal} onSubmit={handleResetPassword}
        newPassword={newPassword} setNewPassword={setNewPassword}
        confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
        showNew={showNewPassword} setShowNew={setShowNewPassword}
        showConfirm={showConfirmPassword} setShowConfirm={setShowConfirmPassword} />

      <div className="ad-root">

        {/* Permission banner */}
        {notifPermission === 'default' && (
          <div style={{ background: '#0f1117', borderRadius: 12, padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', border: '1px solid #374151' }}>
            <span style={{ fontSize: 20 }}>🔔</span>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', fontFamily: "'Syne',sans-serif" }}>Enable browser notifications</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Get real-time alerts when new trips arrive — even when this tab is minimized.</div>
            </div>
            <button onClick={requestPermission} style={{ background: '#f59e0b', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, color: '#0f1117', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Allow</button>
            <button onClick={() => setNotifPermission('dismissed')} style={{ background: 'none', border: '1px solid #374151', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#9ca3af', cursor: 'pointer' }}>Dismiss</button>
          </div>
        )}

        {notifPermission === 'denied' && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 12.5, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
            🚫 Browser notifications are blocked. Click the lock/info icon in the address bar to enable them.
          </div>
        )}

        {/* Database Switcher */}
        <div className="ad-db-switcher">
          <span className="ad-db-label">Year</span>
          <div className="ad-db-buttons">
            <button className={`ad-db-btn${activeDatabase === 'main' ? ' active' : ''}`} onClick={() => setActiveDatabase('main')}>
              2026 <span className="ad-db-badge">{mainTrips.length} trips</span>
            </button>
            <button className={`ad-db-btn${activeDatabase === 'historical' ? ' active' : ''}`} onClick={() => setActiveDatabase('historical')}>
              2025 <span className="ad-db-badge">{historicalTrips.length} trips</span>
            </button>
          </div>
          <div style={{ flex: 1 }} />
          <button className="ad-toggle-btn" onClick={() => setSoundEnabled(v => !v)}
            style={{ background: soundEnabled ? '#fef3c7' : '#f3f4f6', color: soundEnabled ? '#92400e' : '#6b7280', border: soundEnabled ? '1px solid #fde68a' : '1px solid transparent' }}>
            {soundEnabled ? '🔔' : '🔕'} Sound
          </button>
          <NotificationBell count={notifications.length} onClick={() => setShowNotifications(v => !v)} />
          <button className="ad-toggle-btn" onClick={() => setAutoRefreshEnabled(v => !v)}
            style={{ background: autoRefreshEnabled ? '#059669' : '#f3f4f6', color: autoRefreshEnabled ? '#fff' : '#6b7280', border: 'none' }}>
            {autoRefreshEnabled ? '⏸' : '▶'} Auto {autoRefreshEnabled ? 'On' : 'Off'}
          </button>
          <button className="ad-refresh-btn" onClick={manualRefresh}><RefreshIcon /> Refresh Now</button>
          {loadingHistorical && activeDatabase === 'historical' && (
            <span style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #e5e7eb', borderTopColor: '#f59e0b', animation: 'spin 0.75s linear infinite' }} /> Loading…
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="ad-stats">
          {[
            { icon: <UsersIcon size={20} />, color: 'amber', value: currentDrivers.length, label: 'Total Drivers' },
            { icon: <TruckIcon size={20} />, color: 'indigo', value: currentTrips.length, label: 'Total Trips' },
            { icon: <CalendarIcon size={20} />, color: 'emerald', value: activeDatabase === 'main' ? currentTrips.filter(t => t.date === today()).length : 'N/A', label: 'Trips Today' },
            { icon: <RouteIcon size={20} />, color: 'rose', value: currentTrips.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0).toLocaleString(), label: 'Total km' },
          ].map(({ icon, color, value, label }) => (
            <div key={label} className="ad-stat-card">
              <div className={`ad-stat-icon ${color}`}>{icon}</div>
              <div><div className="ad-stat-value">{value}</div><div className="ad-stat-label">{label}</div></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="ad-tabs">
          {[['drivers', 'Drivers', <UsersIcon size={14} />, currentDrivers.length], ['trips', 'All Trips', <TruckIcon size={14} />, currentTrips.length], ['analytics', 'Analytics', <ChartIcon size={14} />, null]].map(([id, label, icon, count]) => (
            <button key={id} className={`ad-tab${view === id ? ' active' : ''}`} onClick={() => setView(id)}>
              {icon} {label} {count !== null && <span className="ad-tab-count">{count}</span>}
            </button>
          ))}
        </div>

        {/* ── DRIVERS ── */}
        {view === 'drivers' && (
          <div className="ad-card">
            <div className="ad-card-header">
              <div>
                <div className="ad-card-title">Registered Drivers</div>
                <div className="ad-card-sub">{activeDatabase === 'main' ? 'Current database' : 'Historical 2025'} · {currentDrivers.length} driver{currentDrivers.length !== 1 ? 's' : ''}</div>
              </div>
              <div className="ad-actions">
                <div className="ad-search-wrap">
                  <span className="ad-search-icon"><SearchIcon /></span>
                  <input className="ad-search" type="text" placeholder="Search drivers…" value={driverSearch} onChange={e => setDriverSearch(e.target.value)} />
                </div>
                {hasDriverFilters && <button className="ad-clear-btn" onClick={clearDriverFilters}><CloseIcon /> Clear</button>}
                <button className="ad-export-btn" onClick={exportDrivers}><ExportIcon /> Export CSV</button>
                <button className="ad-refresh-btn" onClick={activeDatabase === 'main' ? fetchDrivers : fetchHistoricalData}><RefreshIcon /> Refresh</button>
              </div>
            </div>
            {hasDriverFilters && (
              <>
                <div className="ad-filter-bar"><span className="ad-filter-label">Filters:</span>{driverSearch && <span className="ad-filter-tag"><SearchIcon /> "{driverSearch}"</span>}</div>
                <div className="ad-results-count">Showing {filteredDrivers.length} of {currentDrivers.length} drivers</div>
              </>
            )}
            {loadingHistorical && activeDatabase === 'historical' ? <LoadingOverlay message="Loading 2025 drivers…" /> :
              filteredDrivers.length === 0 ? <div className="ad-empty"><div className="ad-empty-icon"><UsersIcon /></div>{hasDriverFilters ? 'No drivers match your search.' : 'No drivers in this database.'}</div> :
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead><tr><th>Driver</th><th>Email</th><th>Phone</th><th>License No.</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredDrivers.map(driver => (
                        <tr key={driver.id}>
                          <td data-label="Driver">
                            <div className="ad-driver-cell">
                              <div className="ad-driver-avatar">{driver.full_name?.charAt(0).toUpperCase()}</div>
                              <div><div className="ad-driver-name">{driver.full_name}</div>{driver.username && <div className="ad-driver-user">@{driver.username}</div>}</div>
                            </div>
                          </td>
                          <td data-label="Email">{driver.email || '—'}</td>
                          <td data-label="Phone">{driver.phone || '—'}</td>
                          <td data-label="License"><span className="ad-badge license">{driver.license_number || '—'}</span></td>
                          <td data-label="Actions">
                            <button onClick={() => openResetPasswordModal(driver)} className="ad-edit-btn" style={{ background: '#fef3c7', color: '#92400e' }}>🔑 Reset Password</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            }
          </div>
        )}

        {/* ── TRIPS TAB ── (UPDATED with odometer, distance, totals) */}
        {view === 'trips' && (
          <div className="ad-card">
            <div className="ad-card-header">
              <div>
                <div className="ad-card-title">All Trip Records</div>
                <div className="ad-card-sub">{activeDatabase === 'main' ? 'Current database' : 'Historical 2025'} · {currentTrips.length} trip{currentTrips.length !== 1 ? 's' : ''}</div>
              </div>
              <div className="ad-actions">
                <div className="ad-search-wrap">
                  <span className="ad-search-icon"><SearchIcon /></span>
                  <input className="ad-search" type="text" placeholder="Search trips…" value={tripSearch} onChange={e => setTripSearch(e.target.value)} />
                </div>
                <select className="ad-select" value={filterDriver} onChange={e => setFilterDriver(e.target.value)}>
                  <option value="">All Drivers</option>{driverNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select className="ad-select" value={filterDealer} onChange={e => setFilterDealer(e.target.value)}>
                  <option value="">All Dealers</option>{dealers.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input className="ad-date-input" type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} title="From date" />
                <input className="ad-date-input" type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} title="To date" />
                {hasTripFilters && <button className="ad-clear-btn" onClick={clearTripFilters}><CloseIcon /> Clear</button>}
                <button className="ad-export-btn" onClick={exportTrips}><ExportIcon /> Export CSV</button>
                <button className="ad-refresh-btn" onClick={activeDatabase === 'main' ? fetchMainTrips : fetchHistoricalData}><RefreshIcon /> Refresh</button>
              </div>
            </div>
            {hasTripFilters && (
              <>
                <div className="ad-filter-bar">
                  <span className="ad-filter-label">Filters:</span>
                  {tripSearch && <span className="ad-filter-tag"><SearchIcon /> "{tripSearch}"</span>}
                  {filterDriver && <span className="ad-filter-tag"><UsersIcon size={11} /> {filterDriver}</span>}
                  {filterDealer && <span className="ad-filter-tag">{filterDealer}</span>}
                  {filterDateFrom && <span className="ad-filter-tag">From: {filterDateFrom}</span>}
                  {filterDateTo && <span className="ad-filter-tag">To: {filterDateTo}</span>}
                </div>
                <div className="ad-results-count">Showing {filteredTrips.length} of {currentTrips.length} trips</div>
              </>
            )}
            {loadingHistorical && activeDatabase === 'historical' ? <LoadingOverlay message="Loading 2025 trips…" /> :
              filteredTrips.length === 0 ? <div className="ad-empty"><div className="ad-empty-icon"><TruckIcon /></div>{hasTripFilters ? 'No trips match your filters.' : 'No trips in this database.'}</div> :
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Date</th><th>Driver</th><th>Helper</th><th>Dealer</th>
                        <th>Departure</th><th>Arrival</th><th>Unload End</th>
                        <th>Dep. ODO</th><th>Arr. ODO</th><th>Distance</th>

                        <th>Invoices</th><th>Checks</th>
                        <th>Total Inv</th><th>Total Chk</th>
                        <th>Location</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrips.map(trip => {
                        const distance = trip.departure_odometer && trip.arrival_odometer ? (trip.arrival_odometer - trip.departure_odometer).toFixed(1) : null;
                        return (
                          <tr key={trip.id}>
                            <td data-label="Date"><span style={{ fontWeight: 600 }}>{trip.date}</span></td>
                            <td data-label="Driver"><div className="ad-driver-cell"><div className="ad-driver-avatar">{trip.driver_name?.charAt(0).toUpperCase()}</div><span>{trip.driver_name}</span></div></td>
                            <td data-label="Helper">{trip.helper || '—'}</td>
                            <td data-label="Dealer"><strong>{trip.dealer}</strong></td>
                            <td data-label="Departure">{trip.time_departure ? <span style={{ color: '#10b981', fontWeight: 600 }}>{fmtTime(trip.time_departure)}</span> : '—'}</td>
                            <td data-label="Arrival">{trip.time_arrival ? <span style={{ color: '#3b82f6', fontWeight: 600 }}>{fmtTime(trip.time_arrival)}</span> : '—'}</td>
                            <td data-label="Unload End">{trip.time_unload_end ? <span style={{ color: '#ef4444', fontWeight: 600 }}>{fmtTime(trip.time_unload_end)}</span> : '—'}</td>
                            <td data-label="Dep. ODO">{trip.departure_odometer ? `${trip.departure_odometer} km` : '—'}</td>
                            <td data-label="Arr. ODO">{trip.arrival_odometer ? `${trip.arrival_odometer} km` : '—'}</td>
                            <td data-label="Distance">{distance ? <span style={{ color: '#10b981', fontWeight: 700 }}>{distance} km</span> : '—'}</td>
                            <td data-label="Invoices">{trip.invoices?.length > 0 ? <div>{trip.invoices.map((inv, i) => <span key={i} className="ad-invoice-badge">{inv.invoice_no}: ₱{Number(inv.amount).toLocaleString()}</span>)}</div> : '—'}</td>
                            <td data-label="Checks">{trip.checks?.length > 0 ? <div>{trip.checks.map((chk, i) => <span key={i} className="ad-check-badge">{chk.check_no}: ₱{Number(chk.amount).toLocaleString()}</span>)}</div> : '—'}</td>
                            <td data-label="Total Inv"><span style={{ color: '#d97706', fontWeight: 700 }}>₱{(trip.total_invoices || 0).toLocaleString()}</span></td>
                            <td data-label="Total Chk"><span style={{ color: '#10b981', fontWeight: 700 }}>₱{(trip.total_checks || 0).toLocaleString()}</span></td>
                            <td data-label="Location">{trip.location_lat && trip.location_lng ? <a href={`https://www.google.com/maps?q=${trip.location_lat},${trip.location_lng}`} target="_blank" rel="noopener noreferrer" className="ad-map-link">📍 View Map</a> : '—'}</td>
                            <td data-label="Actions"><button onClick={() => openEditModal(trip)} className="ad-edit-btn" style={{ background: '#eff6ff', color: '#3b82f6' }}>✏️ Edit</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
            }
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {view === 'analytics' && (
          <div className="ad-card">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="ad-card-title" style={{ marginBottom: 4 }}>📊 Business Analytics</div>
                <div className="ad-card-sub">{activeDatabase === 'main' ? 'Current Year (2026)' : 'Historical (2025)'}{analyticsDriver ? ` · ${analyticsDriver}` : ' · All Drivers'}{analyticsYear !== 'all' ? ` · ${analyticsYear}` : ' · All Years'}</div>
              </div>
              <div className="ad-actions">
                <div style={{ display: 'flex', gap: 3, background: '#f3f4f6', borderRadius: 9, padding: 3 }}>
                  {[['day', 'Daily'], ['week', 'Weekly'], ['month', 'Monthly'], ['year', 'Yearly']].map(([p, label]) => (
                    <button key={p} onClick={() => setAnalyticsPeriod(p)} style={{ padding: '7px 13px', borderRadius: 7, border: 'none', background: analyticsPeriod === p ? '#0f1117' : 'transparent', color: analyticsPeriod === p ? '#fff' : '#6b7280', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>{label}</button>
                  ))}
                </div>
                <select className="ad-select" value={analyticsYear} onChange={e => setAnalyticsYear(e.target.value)}>
                  <option value="all">All Years</option>{availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select className="ad-select" value={analyticsDriver} onChange={e => setAnalyticsDriver(e.target.value)}>
                  <option value="">All Drivers</option>{driverNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <button className="ad-refresh-btn" onClick={activeDatabase === 'main' ? fetchMainTrips : fetchHistoricalData}><RefreshIcon /> Refresh</button>
              </div>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                <div style={{ background: '#0f1117', borderRadius: 14, padding: '18px 20px' }}>
                  <div className="an-kpi-label" style={{ color: '#6b7280' }}>💰 Total Revenue</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: '#f59e0b' }}>₱{totalRevenue.toLocaleString()}</div>
                  <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 6 }}>{analyticsTrips.length} trips tracked</div>
                </div>
                {[['📦 Avg Trip Value', `₱${Math.round(avgTripValue).toLocaleString()}`], ['🏪 Active Dealers', dealers.length], ['🚚 Revenue/Driver', `₱${driverNames.length > 0 ? Math.round(totalRevenue / driverNames.length).toLocaleString() : 0}`]].map(([label, val]) => (
                  <div key={label} style={{ background: '#f8fafc', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
                    <div className="an-kpi-label">{label}</div><div className="an-kpi-val">{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { title: '📈 Revenue Trend', sub: 'Invoice totals over time', data: analyticsData.amountTotals, fmt: v => `₱${(v / 1000).toFixed(0)}k`, grad: ['#10b981', '#059669'] },
                  { title: '📊 Trip Volume', sub: 'Number of trips over time', data: analyticsData.tripCounts, fmt: v => String(v), grad: ['#f59e0b', '#d97706'] },
                ].map(({ title, sub, data, fmt, grad }) => (
                  <div key={title} style={{ background: '#f8fafc', borderRadius: 14, padding: 20, border: '1px solid #e5e7eb' }}>
                    <div className="ad-card-title" style={{ marginBottom: 4 }}>{title}</div>
                    <div className="ad-card-sub" style={{ marginBottom: 18 }}>{sub}</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160, overflowX: 'auto' }}>
                      {analyticsData.labels.map((label, i) => {
                        const max = Math.max(...data, 1), pct = (data[i] / max) * 100;
                        return (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, minWidth: 32 }}>
                            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#6b7280' }}>{data[i] > 0 ? fmt(data[i]) : ''}</div>
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 110 }}>
                              <div style={{ width: '80%', margin: '0 auto', height: `${pct}%`, background: `linear-gradient(180deg,${grad[0]},${grad[1]})`, borderRadius: '4px 4px 0 0', transition: 'height .4s ease', minHeight: 3 }} />
                            </div>
                            <div style={{ fontSize: 10, color: '#9ca3af' }}>{label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <div className="ad-card-title" style={{ marginBottom: 12 }}>🏆 Top Dealers by Revenue</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {topDealersByAmount.slice(0, 5).map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 12.5, fontWeight: 800, color: i === 0 ? '#f59e0b' : '#d1d5db', width: 16, textAlign: 'center' }}>{i + 1}</span>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, color: '#fff' }}>{d.name.charAt(0)}</div>
                      <span style={{ fontSize: 12.5, fontWeight: 500, color: '#111827', width: 90, flexShrink: 0 }}>{d.name}</span>
                      <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${(d.total / (topDealersByAmount[0]?.total || 1)) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#6366f1,#4f46e5)', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#374151', width: 64, textAlign: 'right', fontFamily: "'Syne',sans-serif" }}>₱{d.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <div className="ad-card-title" style={{ marginBottom: 12 }}>🚚 Driver Revenue Performance</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {driverRevenue.slice(0, 5).map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 12.5, fontWeight: 800, color: i === 0 ? '#f59e0b' : '#d1d5db', width: 16, textAlign: 'center' }}>{i + 1}</span>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, color: '#0f1117' }}>{d.name.charAt(0)}</div>
                      <span style={{ fontSize: 12.5, fontWeight: 500, color: '#111827', width: 90, flexShrink: 0 }}>{d.name}</span>
                      <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${(d.total / (driverRevenue[0]?.total || 1)) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#374151', width: 64, textAlign: 'right', fontFamily: "'Syne',sans-serif" }}>₱{d.total.toLocaleString()}</span>
                      <span style={{ fontSize: 10.5, color: '#9ca3af', marginLeft: 4 }}>({d.trips})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Icons ── */
function UsersIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg> }
function TruckIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg> }
function CalendarIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> }
function RouteIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> }
function RefreshIcon({ size = 14 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg> }
function SearchIcon({ size = 14 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> }
function ExportIcon({ size = 15 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> }
function CloseIcon({ size = 13 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg> }
function ChartIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg> }

export default AdminDashboard;