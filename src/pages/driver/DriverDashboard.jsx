import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import API_URL from '../../config';

/* ─────────────────────────────────────────────
   TOAST SYSTEM
───────────────────────────────────────────── */
function Toast({ toasts, removeToast }) {
  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', top: 0, right: 0, left: 0, zIndex: 999999,
      display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none',
      padding: '12px 12px 0',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          pointerEvents: 'all',
          display: 'flex', alignItems: 'flex-start', gap: 12,
          background: t.type === 'success' ? '#0f1117' : t.type === 'error' ? '#1a0505' : '#0f1117',
          border: `1px solid ${t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#f59e0b'}`,
          borderLeft: `4px solid ${t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#f59e0b'}`,
          borderRadius: 12, padding: '13px 16px',
          width: '100%', maxWidth: 480, marginLeft: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <span style={{ fontSize: 17, flexShrink: 0, marginTop: 1 }}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            {t.title && <div style={{ fontWeight: 700, fontSize: 13.5, color: '#fff', marginBottom: 2 }}>{t.title}</div>}
            <div style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.45 }}>{t.message}</div>
          </div>
          <button onClick={() => removeToast(t.id)} style={{
            background: 'none', border: 'none', color: '#6b7280',
            cursor: 'pointer', fontSize: 18, padding: 0, marginLeft: 4, flexShrink: 0, lineHeight: 1
          }}>×</button>
        </div>
      ))}
    </div>,
    document.body
  );
}

// Inject global keyframes into <head> once
const DD_STYLE_ID = 'dd-global-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(DD_STYLE_ID)) {
  const s = document.createElement('style');
  s.id = DD_STYLE_ID;
  s.textContent = `
    @keyframes toastIn   { from{opacity:0;transform:translateX(30px) scale(0.95)} to{opacity:1;transform:none} }
    @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
    @keyframes modalIn   { from{opacity:0;transform:scale(0.9) translateY(16px)} to{opacity:1;transform:none} }
    @keyframes spin      { to{transform:rotate(360deg)} }
    @keyframes loadPulse { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:1} 50%{transform:translate(-50%,-50%) scale(0.5);opacity:0.4} }
    @keyframes loadBar   { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.3} }
  `;
  document.head.appendChild(s);
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
function LoadingOverlay({ isVisible, message = 'Processing…', submessage = '' }) {
  if (!isVisible) return null;
  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999998,
      background: 'rgba(10,12,16,0.82)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.18s ease',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: '#0f1117',
        border: '1px solid rgba(255,255,255,0.08)',
        borderTop: '3px solid #f59e0b',
        borderRadius: 18,
        padding: 'clamp(28px, 6vw, 42px) clamp(24px, 8vw, 56px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.65)',
        animation: 'modalIn 0.28s cubic-bezier(0.34,1.4,0.64,1)',
        minWidth: 260, textAlign: 'center',
      }}>
        <div style={{ position: 'relative', width: 58, height: 58 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.05)' }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#f59e0b',
            borderRightColor: 'rgba(245,158,11,0.25)',
            animation: 'spin 0.75s linear infinite',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 10, height: 10, borderRadius: '50%',
            background: '#f59e0b',
            animation: 'loadPulse 1.2s ease-in-out infinite',
            boxShadow: '0 0 12px rgba(245,158,11,0.7)',
          }} />
        </div>
        <div>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700,
            color: '#f3f4f6', letterSpacing: -0.2, marginBottom: submessage ? 6 : 0,
          }}>{message}</div>
          {submessage && <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{submessage}</div>}
        </div>
        <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)',
            backgroundSize: '200% 100%',
            animation: 'loadBar 1.4s ease-in-out infinite',
          }} />
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─────────────────────────────────────────────
   CONFIRM MODAL
───────────────────────────────────────────── */
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', confirmColor = '#ef4444' }) {
  if (!isOpen) return null;
  const isDelete = confirmLabel === 'Delete';
  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999997,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: 18, padding: '36px 32px',
        maxWidth: 420, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        animation: 'modalIn 0.25s cubic-bezier(0.34,1.4,0.64,1)',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: isDelete ? '#fee2e2' : '#f0fdf4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0
          }}>
            {isDelete ? '🗑️' : '💾'}
          </div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, color: '#0f1117' }}>{title}</div>
        </div>
        <p style={{ fontSize: 14.5, color: '#6b7280', lineHeight: 1.6, margin: '0 0 28px' }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '12px', border: '1.5px solid #e5e7eb', borderRadius: 10,
            background: '#fff', color: '#374151', fontSize: 14.5, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif"
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '12px', border: 'none', borderRadius: 10,
            background: confirmColor, color: '#fff', fontSize: 14.5, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif"
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─────────────────────────────────────────────
   LOCATION CARD
───────────────────────────────────────────── */
function LocationCard({ currentLocation, locationError, isGettingLocation, onRefresh }) {
  return (
    <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: '1.5px solid #e5e7eb' }}>
      <div style={{ background: '#0f1117', padding: '13px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontSize: 16 }}>📍</span>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13.5, fontWeight: 700, color: '#fff', letterSpacing: 0.3 }}>GPS LOCATION</span>
          {isGettingLocation && (
            <span style={{ fontSize: 11, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '2px 8px', borderRadius: 20, fontWeight: 600, letterSpacing: 0.5 }}>DETECTING…</span>
          )}
        </div>
        <button onClick={onRefresh} disabled={isGettingLocation} style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          color: '#9ca3af', borderRadius: 7, padding: '6px 12px', fontSize: 12.5,
          cursor: isGettingLocation ? 'not-allowed' : 'pointer',
          fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          opacity: isGettingLocation ? 0.4 : 1, transition: 'all 0.2s'
        }}>↺ Refresh</button>
      </div>
      <div style={{ padding: '14px 18px', background: '#fafafa' }}>
        {locationError ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#ef4444', fontSize: 13.5 }}>
            <span style={{ fontSize: 16 }}>⚠️</span><span>{locationError}</span>
          </div>
        ) : currentLocation ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'LAT', value: currentLocation.latitude.toFixed(6) },
              { label: 'LNG', value: currentLocation.longitude.toFixed(6) },
              { label: 'ACCURACY', value: `±${currentLocation.accuracy.toFixed(1)}m` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', flex: 1, minWidth: 110 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9ca3af', letterSpacing: 0.8, marginBottom: 3 }}>{label}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: '#0f1117', letterSpacing: -0.2 }}>{value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#9ca3af', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d1d5db', animation: isGettingLocation ? 'pulse 1s infinite' : 'none' }} />
            {isGettingLocation ? 'Acquiring GPS signal…' : 'Location not detected'}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
function DriverDashboard({ driverInfo, trips, fetchTrips, user }) {
  const { toasts, addToast, removeToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDealer, setFilterDealer] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });

  // DOM refs
  const formCardRef = useRef(null);
  const tableCardRef = useRef(null);

  // Loading overlay
  const [loadingOverlay, setLoadingOverlay] = useState({ visible: false, message: '', submessage: '' });
  const showLoading = useCallback((message, submessage = '') =>
    setLoadingOverlay({ visible: true, message, submessage }), []);
  const hideLoading = useCallback(() =>
    setLoadingOverlay({ visible: false, message: '', submessage: '' }), []);

  // Location
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Trip form - UPDATED with three time fields
  const [tripForm, setTripForm] = useState({
    date: new Date().toISOString().split('T')[0],
    helper: '',
    time_departure: '',
    time_arrival: '',
    time_unload_end: '',
    odometer: '',
    dealer: ''
  });
  const [invoices, setInvoices] = useState([{ invoice_no: '', amount: '' }]);
  const [checks, setChecks] = useState([{ check_no: '', amount: '' }]);

  // Refs that mirror state
  const tripFormRef = useRef(tripForm);
  const invoicesRef = useRef(invoices);
  const checksRef = useRef(checks);
  const editingTripRef = useRef(editingTrip);

  useEffect(() => { tripFormRef.current = tripForm; }, [tripForm]);
  useEffect(() => { invoicesRef.current = invoices; }, [invoices]);
  useEffect(() => { checksRef.current = checks; }, [checks]);
  useEffect(() => { editingTripRef.current = editingTrip; }, [editingTrip]);

  // Scroll helper
  const scrollTo = useCallback((ref, delay = 80) => {
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), delay);
  }, []);

  const prevShowForm = useRef(false);
  useEffect(() => {
    if (showForm && !prevShowForm.current) scrollTo(formCardRef);
    prevShowForm.current = showForm;
  }, [showForm, scrollTo]);

  const prevEditingId = useRef(null);
  useEffect(() => {
    const newId = editingTrip?.id ?? null;
    if (showForm && newId && newId !== prevEditingId.current) scrollTo(formCardRef);
    prevEditingId.current = newId;
  }, [editingTrip, showForm, scrollTo]);

  const didGetLocationForCurrentForm = useRef(false);
  useEffect(() => {
    if (showForm && !editingTrip && !didGetLocationForCurrentForm.current) {
      didGetLocationForCurrentForm.current = true;
      getCurrentLocation();
    }
    if (!showForm) didGetLocationForCurrentForm.current = false;
  }, [showForm, editingTrip]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsGettingLocation(false); return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCurrentLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: new Date().toISOString() });
        setIsGettingLocation(false);
      },
      err => {
        const msgs = { 1: 'Location permission denied.', 2: 'Location unavailable.', 3: 'Location request timed out.' };
        setLocationError(msgs[err.code] || 'Unknown error occurred');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Form helpers
  const handleInputChange = e => setTripForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const addInvoiceRow = () => setInvoices(p => [...p, { invoice_no: '', amount: '' }]);
  const removeInvoiceRow = i => setInvoices(p => p.length > 1 ? p.filter((_, idx) => idx !== i) : p);
  const handleInvoiceChange = (i, f, v) => setInvoices(p => { const n = [...p]; n[i][f] = v; return n; });
  const addCheckRow = () => setChecks(p => [...p, { check_no: '', amount: '' }]);
  const removeCheckRow = i => setChecks(p => p.length > 1 ? p.filter((_, idx) => idx !== i) : p);
  const handleCheckChange = (i, f, v) => setChecks(p => { const n = [...p]; n[i][f] = v; return n; });

  // START TRIP (RECORD DEPARTURE)
  const handleStartTrip = async () => {
    if (!tripForm.helper.trim()) { addToast('Please enter a helper name.', 'error', 'Missing Field'); return; }
    if (!tripForm.dealer.trim()) { addToast('Please enter a dealer name.', 'error', 'Missing Field'); return; }
    if (!currentLocation) { addToast('GPS location is required. Please wait for detection.', 'error', 'Location Required'); return; }

    showLoading('Starting Trip…', 'Recording departure time and GPS location');
    try {
      const validInvoices = invoices.filter(inv => inv.invoice_no && inv.amount);
      const validChecks = checks.filter(chk => chk.check_no && chk.amount);
      const res = await fetch(`${API_URL}/trips`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tripForm, invoices: validInvoices, checks: validChecks, location: currentLocation }),
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        let newTrip = null;
        if (data.trip) {
          newTrip = data.trip;
        } else {
          const id = data.trip_id || data.id;
          if (id) newTrip = { id, ...tripForm, time_departure: data.time_departure };
        }

        if (newTrip) {
          setEditingTrip(newTrip);
          setTripForm(prev => ({
            ...prev,
            time_departure: newTrip.time_departure || data.time_departure || '',
            time_arrival: newTrip.time_arrival || '',
            time_unload_end: newTrip.time_unload_end || '',
            odometer: newTrip.odometer || prev.odometer,
          }));
        }

        await fetchTrips();
        hideLoading();
        addToast(`Trip started at ${formatTimeDisplay(data.time_departure)}`, 'success', 'Trip Started');
      } else {
        hideLoading();
        addToast(data.message || 'Failed to start trip.', 'error', 'Error');
      }
    } catch {
      hideLoading();
      addToast('Could not connect to server.', 'error', 'Connection Error');
    }
  };

  // ARRIVE (RECORD ARRIVAL TIME)
  const handleArrive = async () => {
    if (!editingTrip) { addToast('Please start the trip first.', 'error', 'No Active Trip'); return; }
    if (editingTrip.time_arrival) { addToast('Arrival already recorded.', 'error', 'Already Arrived'); return; }
    if (editingTrip.is_completed) { addToast('Trip is already completed.', 'error', 'Cannot Modify'); return; }

    showLoading('Recording Arrival…', 'Saving arrival time');
    try {
      const res = await fetch(`${API_URL}/trips/${editingTrip.id}/arrive`, { method: 'POST', credentials: 'include' });
      const data = await res.json();

      if (data.success) {
        setTripForm(prev => ({ ...prev, time_arrival: data.time_arrival }));
        setEditingTrip(prev => ({ ...prev, time_arrival: data.time_arrival }));
        await fetchTrips();
        hideLoading();
        addToast(`Arrived at ${formatTimeDisplay(data.time_arrival)}. Travel time: ${data.travel_duration}`, 'success', 'Arrival Recorded');
      } else {
        hideLoading();
        addToast(data.message || 'Failed to record arrival.', 'error', 'Error');
      }
    } catch {
      hideLoading();
      addToast('Could not connect to server.', 'error', 'Connection Error');
    }
  };

  // END TRIP (RECORD UNLOAD END)
  const handleEndTrip = async () => {
    if (!editingTrip) { addToast('Please start the trip first.', 'error', 'No Active Trip'); return; }
    if (!editingTrip.time_arrival) { addToast('Please record arrival first.', 'error', 'Missing Arrival'); return; }
    if (!tripForm.odometer) { addToast('Please enter the odometer reading before ending.', 'error', 'Missing Field'); return; }
    if (editingTrip.time_unload_end) { addToast('Trip already ended.', 'error', 'Already Ended'); return; }
    if (editingTrip.is_completed) { addToast('Trip is already completed.', 'error', 'Already Completed'); return; }

    showLoading('Ending Trip…', 'Saving all details and recording completion time');
    try {
      // Save latest details first
      const validInvoices = invoices.filter(inv => inv.invoice_no && inv.amount);
      const validChecks = checks.filter(chk => chk.check_no && chk.amount);
      
      await fetch(`${API_URL}/trips/${editingTrip.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tripForm, invoices: validInvoices, checks: validChecks }),
        credentials: 'include'
      });
      
      // Then end the trip
      const res = await fetch(`${API_URL}/trips/${editingTrip.id}/end-trip`, { method: 'POST', credentials: 'include' });
      const data = await res.json();

      if (data.success) {
        setTripForm(prev => ({ ...prev, time_unload_end: data.time_unload_end }));
        setEditingTrip(prev => ({ ...prev, time_unload_end: data.time_unload_end, is_completed: true }));
        await fetchTrips();
        hideLoading();
        addToast(`Trip completed! Unload time: ${data.unload_duration}, Total trip: ${data.total_duration}`, 'success', 'Trip Ended');
      } else {
        hideLoading();
        addToast(data.message || 'Failed to end trip.', 'error', 'Error');
      }
    } catch {
      hideLoading();
      addToast('Could not connect to server.', 'error', 'Connection Error');
    }
  };

  // RESET FORM
  const resetForm = () => {
    setTripForm({ 
      date: new Date().toISOString().split('T')[0], 
      helper: '', 
      time_departure: '', 
      time_arrival: '', 
      time_unload_end: '', 
      odometer: '', 
      dealer: '' 
    });
    setInvoices([{ invoice_no: '', amount: '' }]);
    setChecks([{ check_no: '', amount: '' }]);
    setCurrentLocation(null);
    setLocationError('');
    setIsGettingLocation(false);
    setEditingTrip(null);
    setShowForm(false);
    didGetLocationForCurrentForm.current = false;
  };

  // EDIT TRIP
  const handleEdit = trip => {
    setEditingTrip(trip);
    setTripForm({
      date: trip.date,
      helper: trip.helper || '',
      time_departure: trip.time_departure || '',
      time_arrival: trip.time_arrival || '',
      time_unload_end: trip.time_unload_end || '',
      odometer: trip.odometer || '',
      dealer: trip.dealer || '',
    });
    
    if (trip.invoices?.length > 0) {
      setInvoices(trip.invoices.map(inv => ({ invoice_no: inv.invoice_no, amount: String(inv.amount) })));
    } else if (trip.invoice_no) {
      setInvoices([{ invoice_no: trip.invoice_no, amount: String(trip.amount || '') }]);
    } else {
      setInvoices([{ invoice_no: '', amount: '' }]);
    }
    
    if (trip.checks?.length > 0) {
      setChecks(trip.checks.map(chk => ({ check_no: chk.check_no, amount: String(chk.amount) })));
    } else {
      setChecks([{ check_no: '', amount: '' }]);
    }
    
    setCurrentLocation(null);
    setLocationError('');
    setShowForm(true);
  };

  // DELETE TRIP
  const handleDelete = tripId => {
    setConfirm({
      open: true, title: 'Delete Trip',
      message: 'This action cannot be undone. Are you sure you want to permanently delete this trip record?',
      confirmLabel: 'Delete', confirmColor: '#ef4444',
      onConfirm: async () => {
        setConfirm(p => ({ ...p, open: false }));
        showLoading('Deleting Trip…', 'Removing trip record from the database');
        try {
          const res = await fetch(`${API_URL}/trips/${tripId}`, { method: 'DELETE', credentials: 'include' });
          const data = await res.json();
          if (data.success) {
            await fetchTrips();
            hideLoading();
            addToast('Trip record has been deleted.', 'success', 'Deleted');
            scrollTo(tableCardRef, 100);
          } else {
            hideLoading();
            addToast(data.message || 'Delete failed.', 'error', 'Delete Failed');
          }
        } catch {
          hideLoading();
          addToast('Could not connect to server.', 'error', 'Connection Error');
        }
      }
    });
  };

  // UPDATE TRIP
  const handleUpdateTrip = () => {
    if (!editingTripRef.current) return;
    if (!tripFormRef.current.helper.trim()) { addToast('Helper name is required.', 'error', 'Missing Field'); return; }
    if (!tripFormRef.current.dealer.trim()) { addToast('Dealer name is required.', 'error', 'Missing Field'); return; }
    if (!tripFormRef.current.odometer) { addToast('Odometer reading is required.', 'error', 'Missing Field'); return; }

    setConfirm({
      open: true, title: 'Update Trip',
      message: 'Save all changes to this trip including invoices, checks, and odometer?',
      confirmLabel: 'Save Changes', confirmColor: '#0f1117',
      onConfirm: async () => {
        setConfirm(p => ({ ...p, open: false }));

        const form = tripFormRef.current;
        const invs = invoicesRef.current;
        const chks = checksRef.current;
        const activeTrip = editingTripRef.current;

        if (!activeTrip) { addToast('No active trip to update.', 'error', 'Error'); return; }

        showLoading('Saving Details…', 'Updating invoices, checks, and odometer');
        try {
          const validInvoices = invs.filter(inv => inv.invoice_no && inv.amount);
          const validChecks = chks.filter(chk => chk.check_no && chk.amount);
          const res = await fetch(`${API_URL}/trips/${activeTrip.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, invoices: validInvoices, checks: validChecks }),
            credentials: 'include'
          });
          const data = await res.json();
          if (data.success) {
            await fetchTrips();
            hideLoading();
            addToast('Trip details updated successfully.', 'success', 'Trip Updated');
            scrollTo(tableCardRef, 100);
          } else {
            hideLoading();
            addToast(data.message || 'Failed to update trip.', 'error', 'Update Failed');
          }
        } catch {
          hideLoading();
          addToast('Could not connect to server.', 'error', 'Connection Error');
        }
      }
    });
  };

  // Derived data
  const tripsArray = Array.isArray(trips) ? trips : [];
  const myTrips = tripsArray.filter(t => t.driver_name === driverInfo?.full_name);
  const todayTrips = myTrips.filter(t => t.date === new Date().toISOString().split('T')[0]);
  const totalKm = myTrips.reduce((sum, t) => sum + (parseFloat(t.odometer) || 0), 0);
  const dealers = useMemo(() => [...new Set(myTrips.map(t => t.dealer).filter(Boolean))], [myTrips]);

  const filteredTrips = useMemo(() => myTrips.filter(t => {
    const q = search.toLowerCase();
    return (!q || [t.helper, t.dealer, t.date].some(v => v?.toLowerCase().includes(q)))
      && (!filterDealer || t.dealer === filterDealer)
      && (!filterDateFrom || t.date >= filterDateFrom)
      && (!filterDateTo || t.date <= filterDateTo);
  }), [myTrips, search, filterDealer, filterDateFrom, filterDateTo]);

  const hasFilters = search || filterDealer || filterDateFrom || filterDateTo;
  const clearFilters = () => { setSearch(''); setFilterDealer(''); setFilterDateFrom(''); setFilterDateTo(''); };

  // Export
  const exportToCSV = () => {
    const headers = ['Date', 'Driver', 'Helper', 'Dealer', 'Time Departure', 'Time Arrival', 'Time Unload End', 'Odometer (km)', 'Invoices', 'Checks', 'Location Lat', 'Location Lng', 'Google Maps Link'];
    const rows = filteredTrips.map(trip => {
      const mapsLink = trip.location_lat && trip.location_lng
        ? `https://www.google.com/maps?q=${trip.location_lat},${trip.location_lng}` : '';
      const invoicesStr = trip.invoices?.length > 0
        ? trip.invoices.map(inv => `${inv.invoice_no} (₱${inv.amount})`).join('; ')
        : trip.invoice_no ? `${trip.invoice_no} (₱${trip.amount || 0})` : '';
      const checksStr = trip.checks?.length > 0
        ? trip.checks.map(chk => `${chk.check_no} (₱${chk.amount})`).join('; ') : '';
      return [trip.date, trip.driver_name, trip.helper || '', trip.dealer,
        trip.time_departure || '', trip.time_arrival || '', trip.time_unload_end || '', trip.odometer || '',
        invoicesStr, checksStr, trip.location_lat || '', trip.location_lng || '', mapsLink];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trips_${driverInfo?.full_name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${filteredTrips.length} trip(s) to CSV.`, 'success', 'Export Complete');
  };

  // Formatters
  const formatDateDisplay = val => {
    if (!val) return '';
    return new Date(val + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const formatTimeDisplay = val => {
    if (!val) return '';
    const parts = val.split(':');
    const hour = parseInt(parts[0], 10);
    const min = parts[1] || '00';
    return `${hour % 12 || 12}:${min} ${hour >= 12 ? 'PM' : 'AM'}`;
  };
  
  const calcDuration = (start, end) => {
    if (!start || !end) return '';
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const diff = Math.abs((endH * 60 + endM) - (startH * 60 + startM));
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  if (!driverInfo) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#9ca3af', fontFamily: 'DM Sans, sans-serif', fontSize: 16 }}>
      Loading driver information…
    </div>
  );

  const tripEnded = !!(editingTrip?.time_unload_end || editingTrip?.is_completed);
  const canEditTime = !editingTrip?.is_completed; // Time fields cannot be edited after completion

  /* ── RENDER ─────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        @keyframes toastIn   { from{opacity:0;transform:translateX(30px) scale(0.95)} to{opacity:1;transform:none} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes modalIn   { from{opacity:0;transform:scale(0.9) translateY(16px)} to{opacity:1;transform:none} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes loadPulse { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:1} 50%{transform:translate(-50%,-50%) scale(0.5);opacity:0.4} }
        @keyframes loadBar   { 0%{background-position:-200% center} 100%{background-position:200% center} }

        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}

        .dd-root{font-family:'DM Sans',sans-serif}

        /* Stats */
        .dd-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
        .dd-stat-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px;transition:box-shadow .2s,transform .2s}
        .dd-stat-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.07);transform:translateY(-1px)}
        .dd-stat-icon{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff}
        .dd-stat-icon.amber{background:linear-gradient(135deg,#f59e0b,#d97706)}
        .dd-stat-icon.indigo{background:linear-gradient(135deg,#6366f1,#4f46e5)}
        .dd-stat-icon.emerald{background:linear-gradient(135deg,#10b981,#059669)}
        .dd-stat-value{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:#0f1117;letter-spacing:-.8px;line-height:1;margin-bottom:4px}
        .dd-stat-label{font-size:11px;color:#9ca3af;font-weight:500;text-transform:uppercase;letter-spacing:.6px}

        /* Driver Info */
        .dd-info-card{background:#0f1117;border-radius:16px;padding:22px 24px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:16px;position:relative;overflow:hidden;flex-wrap:wrap}
        .dd-info-card::before{content:'';position:absolute;top:-50px;right:-50px;width:220px;height:220px;background:radial-gradient(circle,rgba(245,158,11,.12) 0%,transparent 70%);pointer-events:none}
        .dd-info-left{display:flex;align-items:center;gap:14px}
        .dd-big-avatar{width:52px;height:52px;border-radius:12px;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:20px;color:#0f1117;flex-shrink:0}
        .dd-info-name{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:#fff;letter-spacing:-.3px;margin-bottom:5px}
        .dd-info-meta{display:flex;gap:14px;flex-wrap:wrap}
        .dd-info-item{font-size:13px;color:#9ca3af;display:flex;align-items:center;gap:5px}
        .dd-license-badge{background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.25);color:#f59e0b;padding:7px 14px;border-radius:9px;font-size:12.5px;font-weight:600;font-family:'Syne',sans-serif;letter-spacing:.3px;white-space:nowrap;flex-shrink:0}

        /* Add Button */
        .dd-add-btn{display:flex;align-items:center;gap:9px;background:#0f1117;color:#fff;border:none;padding:13px 22px;border-radius:10px;cursor:pointer;font-size:15px;font-family:'DM Sans',sans-serif;font-weight:600;margin-bottom:18px;transition:all .2s;box-shadow:0 1px 3px rgba(0,0,0,.12);-webkit-appearance:none}
        .dd-add-btn:hover{background:#1f2937;box-shadow:0 4px 14px rgba(0,0,0,.18)}
        .dd-add-btn.cancel{background:#fff;color:#ef4444;border:1.5px solid #fecaca}
        .dd-add-btn.cancel:hover{background:#fef2f2}

        /* Form Card */
        .dd-form-card{background:#fff;border:1px solid #e5e7eb;border-top:3px solid #f59e0b;border-radius:14px;padding:24px;margin-bottom:20px}
        .dd-form-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#0f1117;letter-spacing:-.2px;margin-bottom:20px;display:flex;align-items:center;gap:9px}
        .dd-form-title-dot{width:9px;height:9px;background:#f59e0b;border-radius:50%;flex-shrink:0}
        .dd-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
        .dd-field{display:flex;flex-direction:column;gap:6px}
        .dd-label{font-size:11.5px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.7px}
        .dd-input{padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:16px;font-family:'DM Sans',sans-serif;color:#111827;background:#fff;transition:border-color .18s,box-shadow .18s;outline:none;width:100%;-webkit-appearance:none;appearance:none}
        .dd-input:focus{border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.1)}
        .dd-input:disabled{background:#f9fafb;color:#9ca3af;cursor:not-allowed}

        /* Date Picker */
        .dd-date-field{position:relative;background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:10px;overflow:hidden;transition:border-color .18s,box-shadow .18s}
        .dd-date-field:focus-within{border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.1);background:#fff}
        .dd-date-field-inner{display:flex;align-items:center}
        .dd-date-icon-box{width:48px;height:50px;background:#f59e0b;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#0f1117}
        .dd-date-content{flex:1;padding:9px 13px;position:relative}
        .dd-date-display{font-size:14px;font-weight:500;color:#111827;line-height:1.3;pointer-events:none}
        .dd-date-placeholder{color:#9ca3af;font-size:13.5px}
        .dd-date-native{position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer;border:none;background:none}

        /* Time Fields */
        .dd-time-field{background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:10px;overflow:hidden}
        .dd-time-field.active{border-color:#10b981;background:#fff}
        .dd-time-field.ended{border-color:#ef4444;background:#fff}
        .dd-time-field-inner{display:flex;align-items:center}
        .dd-time-icon-box{width:48px;height:50px;background:#0f1117;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#f59e0b}
        .dd-time-content{flex:1;padding:9px 13px}
        .dd-time-sub{font-size:10.5px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;line-height:1;margin-bottom:3px}
        .dd-time-display{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#111827;letter-spacing:-.3px;line-height:1.2}
        .dd-time-display.empty{font-family:'DM Sans',sans-serif;font-size:14px;font-weight:400;color:#9ca3af;letter-spacing:0}

        /* Trip Buttons */
        .dd-trip-buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0 16px}
        .dd-trip-btn{padding:15px 10px;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:7px;letter-spacing:.3px;font-family:'Syne',sans-serif;-webkit-appearance:none}
        .dd-trip-btn.start{background:#10b981;color:#fff;box-shadow:0 2px 8px rgba(16,185,129,.25)}
        .dd-trip-btn.arrive{background:#3b82f6;color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.25)}
        .dd-trip-btn.end{background:#ef4444;color:#fff;box-shadow:0 2px 8px rgba(239,68,68,.25)}
        .dd-trip-btn:active:not(:disabled){transform:scale(.98)}
        .dd-trip-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}

        /* Save/Cancel */
        .dd-submit-btn{width:100%;padding:15px;background:#0f1117;color:#fff;border:none;border-radius:10px;font-size:15px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:9px;-webkit-appearance:none}
        .dd-submit-btn:active{background:#1f2937}
        .dd-cancel-btn{width:100%;padding:15px;background:#f9fafb;color:#6b7280;border:1.5px solid #e5e7eb;border-radius:10px;font-size:15px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;transition:all .2s;-webkit-appearance:none}
        .dd-cancel-btn:active{background:#f3f4f6}

        /* Invoice / Check Sections */
        .dd-section-card{margin-bottom:16px;border:1.5px solid #e5e7eb;border-radius:12px;overflow:hidden}
        .dd-section-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e5e7eb}
        .dd-section-title{font-family:'Syne',sans-serif;font-size:13.5px;font-weight:700;color:#0f1117;display:flex;align-items:center;gap:7px}
        .dd-section-body{padding:12px;background:#fff}
        .dd-row-card{display:flex;align-items:center;gap:8px;padding:9px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:9px;margin-bottom:8px}
        .dd-row-card:last-of-type{margin-bottom:0}
        .dd-add-row-btn{display:flex;align-items:center;gap:5px;border:none;border-radius:7px;padding:7px 12px;font-size:12.5px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap;-webkit-appearance:none}
        .dd-remove-row-btn{width:32px;height:32px;border:none;border-radius:6px;background:#fee2e2;color:#ef4444;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;-webkit-appearance:none}
        .dd-remove-row-btn:active{background:#fecaca}
        .dd-section-hint{font-size:11.5px;color:#9ca3af;font-style:italic;padding:8px 12px 12px}

        /* Table Card */
        .dd-table-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden}
        .dd-table-header{padding:18px 20px;border-bottom:1px solid #f3f4f6;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
        .dd-table-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#0f1117;letter-spacing:-.2px}
        .dd-table-sub{font-size:13px;color:#9ca3af;margin-top:2px}
        .dd-table-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .dd-search-wrap{position:relative;display:flex;align-items:center;flex:1;min-width:0}
        .dd-search-icon{position:absolute;left:11px;color:#9ca3af;pointer-events:none;display:flex;align-items:center}
        .dd-search{padding:10px 14px 10px 35px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:15px;font-family:'DM Sans',sans-serif;color:#111827;background:#f9fafb;outline:none;width:100%;transition:all .18s;-webkit-appearance:none}
        .dd-search:focus{border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.08);background:#fff}
        .dd-select{padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:14px;font-family:'DM Sans',sans-serif;color:#374151;background:#f9fafb;outline:none;cursor:pointer;-webkit-appearance:none;appearance:none;padding-right:28px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center}
        .dd-select:focus{border-color:#f59e0b}
        .dd-date-input{padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:14px;font-family:'DM Sans',sans-serif;color:#374151;background:#f9fafb;outline:none;-webkit-appearance:none}
        .dd-date-input:focus{border-color:#f59e0b}
        .dd-clear-btn{display:flex;align-items:center;gap:5px;background:#fef2f2;border:1px solid #fecaca;border-radius:9px;padding:9px 12px;font-size:13px;font-family:'DM Sans',sans-serif;font-weight:500;color:#ef4444;cursor:pointer;white-space:nowrap;-webkit-appearance:none}
        .dd-clear-btn:active{background:#fee2e2}
        .dd-export-btn{display:flex;align-items:center;gap:6px;background:#0f1117;border:none;border-radius:9px;padding:9px 14px;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:500;color:#fff;cursor:pointer;white-space:nowrap;-webkit-appearance:none}
        .dd-export-btn:active{background:#1f2937}
        .dd-refresh-btn{display:flex;align-items:center;gap:6px;background:#f3f4f6;border:none;border-radius:9px;padding:9px 14px;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:500;color:#4b5563;cursor:pointer;white-space:nowrap;-webkit-appearance:none}
        .dd-refresh-btn:active{background:#e5e7eb}

        /* Action buttons */
        .dd-action-btn{background:none;border:none;cursor:pointer;margin:0 2px;padding:8px;border-radius:8px;transition:all .18s;font-size:16px;-webkit-appearance:none}
        .dd-action-btn.edit:active{background:#eff6ff}
        .dd-action-btn.delete:active{background:#fee2e2}

        /* Filters */
        .dd-filter-bar{padding:12px 20px;background:#fafafa;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .dd-filter-label{font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;margin-right:2px}
        .dd-filter-tag{display:flex;align-items:center;gap:4px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);color:#92400e;border-radius:6px;padding:3px 10px;font-size:12.5px;font-weight:500}
        .dd-results-count{padding:10px 20px;background:#f8fafc;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280}

        /* Table */
        .dd-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
        .dd-table{width:100%;border-collapse:collapse;font-size:14px}
        .dd-table thead tr{background:#f8fafc;border-bottom:1px solid #e5e7eb}
        .dd-table th{padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.7px;white-space:nowrap}
        .dd-table td{padding:14px 16px;color:#374151;border-bottom:1px solid #f3f4f6;white-space:nowrap;font-size:13.5px}
        .dd-table tbody tr:last-child td{border-bottom:none}
        .dd-table tbody tr{transition:background .15s}
        .dd-table tbody tr:hover{background:#fffbf0}
        .dd-status-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;font-size:12px;font-weight:600}
        .dd-empty{padding:60px 20px;text-align:center;color:#9ca3af;font-size:15px}
        .dd-empty-icon{width:52px;height:52px;background:#f3f4f6;border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#d1d5db}

        /* Mobile Styles */
        @media(max-width:640px){
          .dd-stats{grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
          .dd-stat-card{padding:12px 10px;gap:8px;flex-direction:column;align-items:flex-start}
          .dd-stat-icon{width:34px;height:34px;border-radius:9px}
          .dd-stat-value{font-size:20px;margin-bottom:2px}
          .dd-stat-label{font-size:9.5px}
          .dd-info-card{padding:16px;flex-direction:column;align-items:flex-start;gap:12px}
          .dd-info-left{gap:12px}
          .dd-big-avatar{width:46px;height:46px;font-size:18px}
          .dd-info-name{font-size:16px}
          .dd-add-btn{width:100%;justify-content:center;padding:14px}
          .dd-form-card{padding:16px}
          .dd-form-grid{grid-template-columns:1fr!important}
          .dd-trip-buttons{grid-template-columns:1fr!important;gap:8px}
          .dd-trip-btn{padding:14px}
          .dd-input{font-size:16px;padding:13px 14px}
          .dd-row-card{flex-wrap:wrap}
          .dd-table-header{flex-direction:column;align-items:stretch}
          .dd-table-actions{flex-direction:column;width:100%}
          .dd-search-wrap{width:100%}
          .dd-select,.dd-date-input{width:100%}
          .dd-clear-btn,.dd-export-btn,.dd-refresh-btn{width:100%;justify-content:center}
          .dd-table thead{display:none}
          .dd-table,.dd-table tbody,.dd-table tr,.dd-table td{display:block;width:100%}
          .dd-table tbody tr{
            border:1px solid #e5e7eb;border-radius:12px;
            margin:0 16px 12px;width:calc(100% - 32px);padding:14px;
            background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.05);
          }
          .dd-table td{
            padding:6px 0;border-bottom:1px solid #f7f7f7;
            display:flex;align-items:flex-start;gap:8px;
          }
          .dd-table td::before{
            content:attr(data-label);font-size:10.5px;font-weight:700;
            color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;
            flex-shrink:0;width:100px;
          }
          .dd-table td:last-child::before{display:none}
          .dd-table td:last-child{padding-top:10px;justify-content:flex-end}
        }
      `}</style>

      <Toast toasts={toasts} removeToast={removeToast} />
      <LoadingOverlay isVisible={loadingOverlay.visible} message={loadingOverlay.message} submessage={loadingOverlay.submessage} />
      <ConfirmModal
        isOpen={confirm.open} title={confirm.title} message={confirm.message}
        onConfirm={confirm.onConfirm} onCancel={() => setConfirm(p => ({ ...p, open: false }))}
        confirmLabel={confirm.confirmLabel || 'Confirm'} confirmColor={confirm.confirmColor || '#ef4444'}
      />

      <div className="dd-root">

        {/* Stats */}
        <div className="dd-stats">
          {[
            { icon: <TruckIcon />, cls: 'amber', val: myTrips.length, label: 'Total Trips' },
            { icon: <CalendarIcon />, cls: 'emerald', val: todayTrips.length, label: 'Trips Today' },
            { icon: <RouteIcon />, cls: 'indigo', val: totalKm.toLocaleString(), label: 'Total km' },
          ].map(({ icon, cls, val, label }) => (
            <div key={label} className="dd-stat-card">
              <div className={`dd-stat-icon ${cls}`}>{icon}</div>
              <div><div className="dd-stat-value">{val}</div><div className="dd-stat-label">{label}</div></div>
            </div>
          ))}
        </div>

        {/* Driver Info */}
        <div className="dd-info-card">
          <div className="dd-info-left">
            <div className="dd-big-avatar">{driverInfo.full_name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="dd-info-name">{driverInfo.full_name}</div>
              <div className="dd-info-meta">
                <span className="dd-info-item"><PhoneIcon /> {driverInfo.phone}</span>
                <span className="dd-info-item"><MailIcon /> {driverInfo.email}</span>
              </div>
            </div>
          </div>
          <div className="dd-license-badge">License: {driverInfo.license_number}</div>
        </div>

        {/* Toggle form */}
        <button className={`dd-add-btn${showForm ? ' cancel' : ''}`} onClick={() => showForm ? resetForm() : setShowForm(true)}>
          {showForm ? <><CloseIcon /> Cancel</> : <><PlusIcon /> Log New Trip</>}
        </button>

        {/* Form */}
        {showForm && (
          <div className="dd-form-card" ref={formCardRef}>
            <div className="dd-form-title">
              <span className="dd-form-title-dot" />
              {editingTrip ? 'Edit Trip' : 'New Trip Log'}
            </div>

            {/* GPS — new trip only */}
            {!editingTrip && (
              <LocationCard currentLocation={currentLocation} locationError={locationError} isGettingLocation={isGettingLocation} onRefresh={getCurrentLocation} />
            )}

            <form onSubmit={e => e.preventDefault()}>
              <div className="dd-form-grid">
                <div className="dd-field">
                  <label className="dd-label">Date</label>
                  <div className="dd-date-field">
                    <div className="dd-date-field-inner">
                      <div className="dd-date-icon-box"><CalendarIcon size={20} /></div>
                      <div className="dd-date-content">
                        {tripForm.date
                          ? <div className="dd-date-display">{formatDateDisplay(tripForm.date)}</div>
                          : <div className="dd-date-display dd-date-placeholder">Pick a date</div>}
                        <input className="dd-date-native" type="date" name="date" value={tripForm.date} onChange={handleInputChange} required />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dd-field">
                  <label className="dd-label">Driver</label>
                  <input className="dd-input" type="text" value={driverInfo?.full_name || ''} disabled />
                </div>
              </div>

              <div className="dd-form-grid">
                <div className="dd-field">
                  <label className="dd-label">Helper</label>
                  <input className="dd-input" type="text" name="helper" value={tripForm.helper} onChange={handleInputChange} placeholder="Helper name" />
                </div>
                <div className="dd-field">
                  <label className="dd-label">Dealer</label>
                  <input className="dd-input" type="text" name="dealer" value={tripForm.dealer} onChange={handleInputChange} placeholder="Dealer name" />
                </div>
              </div>

              {/* Trip Buttons - Three buttons */}
              <div className="dd-trip-buttons">
                <button type="button" className="dd-trip-btn start" onClick={handleStartTrip} disabled={!!editingTrip}>
                  <span style={{ fontSize: 16 }}>🚚</span> START
                </button>
                <button type="button" className="dd-trip-btn arrive" onClick={handleArrive} 
                  disabled={!editingTrip || editingTrip.time_arrival || editingTrip.is_completed}>
                  <span style={{ fontSize: 16 }}>📍</span> ARRIVE
                </button>
                <button type="button" className="dd-trip-btn end" onClick={handleEndTrip} 
                  disabled={!editingTrip || editingTrip.time_unload_end || editingTrip.is_completed || !editingTrip.time_arrival}>
                  <span style={{ fontSize: 16 }}>✅</span> END
                </button>
              </div>

              {editingTrip && (
                <div style={{
                  marginBottom: 18, padding: '10px 14px',
                  background: editingTrip.is_completed ? '#f0fdf4' : '#fffbeb',
                  border: `1px solid ${editingTrip.is_completed ? '#bbf7d0' : '#fde68a'}`,
                  borderRadius: 9, fontSize: 13,
                  color: editingTrip.is_completed ? '#166534' : '#92400e',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <span>{editingTrip.is_completed ? '✅' : '💡'}</span>
                  <span>
                    {editingTrip.is_completed
                      ? 'Trip is completed. You can still update invoices, checks, and odometer.'
                      : 'Trip in progress! Fill in invoices, checks, and odometer, then tap Save Details.'}
                  </span>
                </div>
              )}

              {/* Time Display Section - Three time fields */}
              <div className="dd-form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="dd-field">
                  <label className="dd-label">Departure Time</label>
                  <div className={`dd-time-field${tripForm.time_departure ? ' active' : ''}`}>
                    <div className="dd-time-field-inner">
                      <div className="dd-time-icon-box"><ClockOutIcon /></div>
                      <div className="dd-time-content">
                        <div className="dd-time-sub">Left warehouse</div>
                        <div className={`dd-time-display${!tripForm.time_departure ? ' empty' : ''}`}>
                          {tripForm.time_departure ? formatTimeDisplay(tripForm.time_departure) : 'Not yet departed'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dd-field">
                  <label className="dd-label">Arrival Time</label>
                  <div className={`dd-time-field${tripForm.time_arrival ? ' active' : ''}`}>
                    <div className="dd-time-field-inner">
                      <div className="dd-time-icon-box"><ClockInIcon /></div>
                      <div className="dd-time-content">
                        <div className="dd-time-sub">Start unloading</div>
                        <div className={`dd-time-display${!tripForm.time_arrival ? ' empty' : ''}`}>
                          {tripForm.time_arrival ? formatTimeDisplay(tripForm.time_arrival) : 'Not yet arrived'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dd-field">
                  <label className="dd-label">Unload End</label>
                  <div className={`dd-time-field${tripForm.time_unload_end ? ' ended' : ''}`}>
                    <div className="dd-time-field-inner">
                      <div className="dd-time-icon-box"><CheckIcon /></div>
                      <div className="dd-time-content">
                        <div className="dd-time-sub">Unload completed</div>
                        <div className={`dd-time-display${!tripForm.time_unload_end ? ' empty' : ''}`}>
                          {tripForm.time_unload_end ? formatTimeDisplay(tripForm.time_unload_end) : 'Not yet completed'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dd-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="dd-field">
                  <label className="dd-label">Odometer (km)</label>
                  <input className="dd-input" type="number" name="odometer" value={tripForm.odometer} onChange={handleInputChange} placeholder="e.g. 12400" />
                </div>
              </div>

              {/* Invoices */}
              <div className="dd-section-card">
                <div className="dd-section-header">
                  <div className="dd-section-title">
                    <span>📋</span> Invoices
                    <span style={{ background: '#f59e0b20', color: '#d97706', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                      {invoices.filter(i => i.invoice_no).length}
                    </span>
                  </div>
                  <button type="button" onClick={addInvoiceRow} className="dd-add-row-btn" style={{ background: '#fef3c7', color: '#d97706' }}>+ Add Invoice</button>
                </div>
                <div className="dd-section-body">
                  {invoices.map((invoice, idx) => (
                    <div key={idx} className="dd-row-card">
                      <div style={{ flex: 2, minWidth: 0 }}>
                        <input className="dd-input" type="text" value={invoice.invoice_no}
                          onChange={e => handleInvoiceChange(idx, 'invoice_no', e.target.value)}
                          placeholder="Invoice No. (e.g. INV-001)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <input className="dd-input" type="number" value={invoice.amount}
                          onChange={e => handleInvoiceChange(idx, 'amount', e.target.value)}
                          placeholder="Amount (₱)" />
                      </div>
                      {invoices.length > 1 && <button type="button" className="dd-remove-row-btn" onClick={() => removeInvoiceRow(idx)}>×</button>}
                    </div>
                  ))}
                  <div className="dd-section-hint">Leave blank if no invoices for this trip.</div>
                </div>
              </div>

              {/* Checks */}
              <div className="dd-section-card">
                <div className="dd-section-header">
                  <div className="dd-section-title">
                    <span>💳</span> Checks
                    <span style={{ background: '#d1fae5', color: '#059669', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                      {checks.filter(c => c.check_no).length}
                    </span>
                  </div>
                  <button type="button" onClick={addCheckRow} className="dd-add-row-btn" style={{ background: '#d1fae5', color: '#059669' }}>+ Add Check</button>
                </div>
                <div className="dd-section-body">
                  {checks.map((check, idx) => (
                    <div key={idx} className="dd-row-card">
                      <div style={{ flex: 2, minWidth: 0 }}>
                        <input className="dd-input" type="text" value={check.check_no}
                          onChange={e => handleCheckChange(idx, 'check_no', e.target.value)}
                          placeholder="Check No. (e.g. CHK-001)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <input className="dd-input" type="number" value={check.amount}
                          onChange={e => handleCheckChange(idx, 'amount', e.target.value)}
                          placeholder="Amount (₱)" />
                      </div>
                      {checks.length > 1 && <button type="button" className="dd-remove-row-btn" onClick={() => removeCheckRow(idx)}>×</button>}
                    </div>
                  ))}
                  <div className="dd-section-hint">Leave blank if no checks for this trip.</div>
                </div>
              </div>

              {editingTrip && (
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" className="dd-submit-btn" style={{ flex: 1 }} onClick={handleUpdateTrip}>
                    <SaveIcon /> Save Details
                  </button>
                  <button type="button" className="dd-cancel-btn" style={{ flex: 1 }} onClick={resetForm}>Close</button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Table */}
        <div className="dd-table-card" ref={tableCardRef}>
          <div className="dd-table-header">
            <div>
              <div className="dd-table-title">My Recent Trips</div>
              <div className="dd-table-sub">{myTrips.length} trip{myTrips.length !== 1 ? 's' : ''} recorded</div>
            </div>
            <div className="dd-table-actions">
              <div className="dd-search-wrap">
                <span className="dd-search-icon"><SearchIcon /></span>
                <input className="dd-search" type="text" placeholder="Search trips…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="dd-select" value={filterDealer} onChange={e => setFilterDealer(e.target.value)}>
                <option value="">All Dealers</option>
                {dealers.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input className="dd-date-input" type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} title="From date" />
              <input className="dd-date-input" type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} title="To date" />
              {hasFilters && <button className="dd-clear-btn" onClick={clearFilters}><CloseIcon /> Clear</button>}
              <button className="dd-export-btn" onClick={exportToCSV}><ExportIcon /> Export CSV</button>
              <button className="dd-refresh-btn" onClick={fetchTrips}><RefreshIcon /> Refresh</button>
            </div>
          </div>

          {hasFilters && (
            <div className="dd-filter-bar">
              <span className="dd-filter-label">Filters:</span>
              {search && <span className="dd-filter-tag"><SearchIcon /> "{search}"</span>}
              {filterDealer && <span className="dd-filter-tag">{filterDealer}</span>}
              {filterDateFrom && <span className="dd-filter-tag">From: {filterDateFrom}</span>}
              {filterDateTo && <span className="dd-filter-tag">To: {filterDateTo}</span>}
            </div>
          )}
          {hasFilters && <div className="dd-results-count">Showing {filteredTrips.length} of {myTrips.length} trips</div>}

          {filteredTrips.length === 0 ? (
            <div className="dd-empty">
              <div className="dd-empty-icon"><TruckIcon /></div>
              {hasFilters ? 'No trips match your filters.' : 'No trips recorded yet. Log your first trip above.'}
            </div>
          ) : (
            <div className="dd-table-wrap">
              <table className="dd-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Helper</th>
                    <th>Dealer</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Unload End</th>
                    <th>Travel Time</th>
                    <th>Unload Time</th>
                    <th>Odometer</th>
                    <th>Invoices</th>
                    <th>Checks</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrips.map(trip => {
                    const travelDuration = calcDuration(trip.time_departure, trip.time_arrival);
                    const unloadDuration = calcDuration(trip.time_arrival, trip.time_unload_end);
                    return (
                      <tr key={trip.id}>
                        <td data-label="Date"><span style={{ fontWeight: 600, color: '#0f1117' }}>{trip.date}</span></td>
                        <td data-label="Helper">{trip.helper || <span style={{ color: '#d1d5db' }}>—</span>}</td>
                        <td data-label="Dealer"><span style={{ fontWeight: 600 }}>{trip.dealer}</span></td>
                        <td data-label="Departure">
                          {trip.time_departure
                            ? <span style={{ color: '#10b981', fontWeight: 600 }}>{formatTimeDisplay(trip.time_departure)}</span>
                            : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td data-label="Arrival">
                          {trip.time_arrival
                            ? <span style={{ color: '#3b82f6', fontWeight: 600 }}>{formatTimeDisplay(trip.time_arrival)}</span>
                            : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td data-label="Unload End">
                          {trip.time_unload_end
                            ? <span style={{ color: '#ef4444', fontWeight: 600 }}>{formatTimeDisplay(trip.time_unload_end)}</span>
                            : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td data-label="Travel Time">
                          {travelDuration
                            ? <span style={{ background: '#f3f4f6', borderRadius: 6, padding: '3px 9px', fontSize: 12, fontWeight: 600, color: '#374151' }}>{travelDuration}</span>
                            : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td data-label="Unload Time">
                          {unloadDuration
                            ? <span style={{ background: '#f3f4f6', borderRadius: 6, padding: '3px 9px', fontSize: 12, fontWeight: 600, color: '#374151' }}>{unloadDuration}</span>
                            : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td data-label="Odometer">{trip.odometer ? `${trip.odometer} km` : <span style={{ color: '#d1d5db' }}>—</span>}</td>
                        <td data-label="Invoices">
                          {trip.invoices?.length > 0
                            ? <div style={{ fontSize: 13 }}>{trip.invoices.map((inv, i) => (
                              <div key={i}>{inv.invoice_no}: <span style={{ color: '#d97706', fontWeight: 600 }}>₱{Number(inv.amount).toLocaleString()}</span></div>
                            ))}</div>
                            : trip.invoice_no
                              ? <div>{trip.invoice_no}: <span style={{ color: '#d97706', fontWeight: 600 }}>₱{trip.amount}</span></div>
                              : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td data-label="Checks">
                          {trip.checks?.length > 0
                            ? <div style={{ fontSize: 13 }}>{trip.checks.map((chk, i) => (
                              <div key={i}>{chk.check_no}: <span style={{ color: '#10b981', fontWeight: 600 }}>₱{Number(chk.amount).toLocaleString()}</span></div>
                            ))}</div>
                            : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td data-label="Location">
                          {trip.location_lat && trip.location_lng
                            ? <a href={`https://www.google.com/maps?q=${trip.location_lat},${trip.location_lng}`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ color: '#3b82f6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', background: '#eff6ff', borderRadius: 6, fontSize: 12.5, fontWeight: 500 }}
                              onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                              onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                            >📍 View Map</a>
                            : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td>
                          <button className="dd-action-btn edit" onClick={() => handleEdit(trip)} title="Edit">✏️</button>
                          <button className="dd-action-btn delete" onClick={() => handleDelete(trip.id)} title="Delete">🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  );
}

/* ── Icons ──────────────────────────────────────────────────────────────── */
function TruckIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>; }
function CalendarIcon({ size = 20 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>; }
function RouteIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg>; }
function PhoneIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>; }
function MailIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>; }
function PlusIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
function CloseIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }
function SaveIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>; }
function RefreshIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>; }
function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>; }
function ExportIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>; }
function ClockInIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /><line x1="2" y1="12" x2="5" y2="12" /></svg>; }
function ClockOutIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 8 14" /><line x1="19" y1="12" x2="22" y2="12" /></svg>; }
function CheckIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>; }

export default DriverDashboard;