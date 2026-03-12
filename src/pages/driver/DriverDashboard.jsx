import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import API_URL from '../../config';

/* ─────────────────────────────────────────────
   TOAST SYSTEM
───────────────────────────────────────────── */
function Toast({ toasts, removeToast }) {
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none'
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          pointerEvents: 'all',
          display: 'flex', alignItems: 'flex-start', gap: 12,
          background: t.type === 'success' ? '#0f1117' : t.type === 'error' ? '#1a0505' : '#0f1117',
          border: `1px solid ${t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#f59e0b'}`,
          borderLeft: `4px solid ${t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#f59e0b'}`,
          borderRadius: 12, padding: '14px 18px',
          minWidth: 300, maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <div style={{ flex: 1 }}>
            {t.title && <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 3 }}>{t.title}</div>}
            <div style={{ fontSize: 13.5, color: '#d1d5db', lineHeight: 1.45 }}>{t.message}</div>
          </div>
          <button onClick={() => removeToast(t.id)} style={{
            background: 'none', border: 'none', color: '#6b7280',
            cursor: 'pointer', fontSize: 16, padding: 0, marginLeft: 4, flexShrink: 0
          }}>×</button>
        </div>
      ))}
    </div>
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
function LoadingOverlay({ isVisible, message = 'Processing…', submessage = '' }) {
  if (!isVisible) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(10,12,16,0.75)',
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
        padding: '42px 56px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.65)',
        animation: 'modalIn 0.28s cubic-bezier(0.34,1.4,0.64,1)',
        minWidth: 260, textAlign: 'center',
      }}>
        <div style={{ position: 'relative', width: 58, height: 58 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.05)',
          }} />
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
            color: '#f3f4f6', letterSpacing: -0.2,
            marginBottom: submessage ? 6 : 0,
          }}>{message}</div>
          {submessage && (
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{submessage}</div>
          )}
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
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONFIRM MODAL
───────────────────────────────────────────── */
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', confirmColor = '#ef4444' }) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
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
            background: confirmColor === '#ef4444' ? '#fee2e2' : '#f0fdf4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0
          }}>
            {confirmColor === '#ef4444' ? '🗑️' : '💾'}
          </div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, color: '#0f1117' }}>{title}</div>
          </div>
        </div>
        <p style={{ fontSize: 14.5, color: '#6b7280', lineHeight: 1.6, margin: '0 0 28px' }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '12px', border: '1.5px solid #e5e7eb', borderRadius: 10,
            background: '#fff', color: '#374151', fontSize: 14.5, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif"
          }}
            onMouseEnter={e => e.target.style.background = '#f9fafb'}
            onMouseLeave={e => e.target.style.background = '#fff'}
          >Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '12px', border: 'none', borderRadius: 10,
            background: confirmColor, color: '#fff', fontSize: 14.5, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif"
          }}
            onMouseEnter={e => e.target.style.opacity = '0.88'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOCATION CARD (inline, no popup)
───────────────────────────────────────────── */
function LocationCard({ currentLocation, locationError, isGettingLocation, onRefresh }) {
  return (
    <div style={{
      marginBottom: 20, borderRadius: 12, overflow: 'hidden',
      border: '1.5px solid #e5e7eb',
    }}>
      <div style={{
        background: '#0f1117', padding: '13px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontSize: 16 }}>📍</span>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13.5, fontWeight: 700, color: '#fff', letterSpacing: 0.3 }}>
            GPS LOCATION
          </span>
          {isGettingLocation && (
            <span style={{
              fontSize: 11, color: '#f59e0b', background: 'rgba(245,158,11,0.15)',
              padding: '2px 8px', borderRadius: 20, fontWeight: 600, letterSpacing: 0.5
            }}>DETECTING…</span>
          )}
        </div>
        <button onClick={onRefresh} disabled={isGettingLocation} style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          color: '#9ca3af', borderRadius: 7, padding: '6px 12px', fontSize: 12.5,
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          opacity: isGettingLocation ? 0.4 : 1, transition: 'all 0.2s'
        }}>↺ Refresh</button>
      </div>

      <div style={{ padding: '14px 18px', background: '#fafafa' }}>
        {locationError ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            color: '#ef4444', fontSize: 13.5
          }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span>{locationError}</span>
          </div>
        ) : currentLocation ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'LAT', value: currentLocation.latitude.toFixed(6) },
              { label: 'LNG', value: currentLocation.longitude.toFixed(6) },
              { label: 'ACCURACY', value: `±${currentLocation.accuracy.toFixed(1)}m` },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
                padding: '8px 14px', flex: 1, minWidth: 110
              }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9ca3af', letterSpacing: 0.8, marginBottom: 3 }}>{label}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: '#0f1117', letterSpacing: -0.2 }}>{value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#9ca3af', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: '#d1d5db',
              animation: isGettingLocation ? 'pulse 1s infinite' : 'none'
            }} />
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

  // Confirm modal state
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });
  const modalRef = useRef(null);

  // Global loading overlay state
  const [loadingOverlay, setLoadingOverlay] = useState({ visible: false, message: '', submessage: '' });
  const showLoading = (message, submessage = '') => setLoadingOverlay({ visible: true, message, submessage });
  const hideLoading = () => setLoadingOverlay({ visible: false, message: '', submessage: '' });

  // LOCATION STATE
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Trip form state
  const [tripForm, setTripForm] = useState({
    date: new Date().toISOString().split('T')[0],
    helper: '', time_in: '', time_out: '',
    odometer: '', dealer: ''
  });

  const [invoices, setInvoices] = useState([{ invoice_no: '', amount: '' }]);
  const [checks, setChecks] = useState([{ check_no: '', amount: '' }]);

  useEffect(() => { if (showForm && !editingTrip) getCurrentLocation(); }, [showForm]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsGettingLocation(false); return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: new Date().toISOString() });
        setIsGettingLocation(false);
      },
      (err) => {
        const msgs = { 1: 'Location permission denied. Please enable location access.', 2: 'Location information unavailable.', 3: 'Location request timed out.' };
        setLocationError(msgs[err.code] || 'Unknown error occurred');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleInputChange = (e) => setTripForm({ ...tripForm, [e.target.name]: e.target.value });

  const addInvoiceRow = () => setInvoices([...invoices, { invoice_no: '', amount: '' }]);
  const removeInvoiceRow = (i) => invoices.length > 1 && setInvoices(invoices.filter((_, idx) => idx !== i));
  const handleInvoiceChange = (i, f, v) => { const n = [...invoices]; n[i][f] = v; setInvoices(n); };

  const addCheckRow = () => setChecks([...checks, { check_no: '', amount: '' }]);
  const removeCheckRow = (i) => checks.length > 1 && setChecks(checks.filter((_, idx) => idx !== i));
  const handleCheckChange = (i, f, v) => { const n = [...checks]; n[i][f] = v; setChecks(n); };

  const handleStartTrip = async () => {
    if (!tripForm.helper.trim()) { addToast('Please enter a helper name before starting the trip.', 'error', 'Missing Field'); return; }
    if (!tripForm.dealer.trim()) { addToast('Please enter a dealer name before starting the trip.', 'error', 'Missing Field'); return; }
    if (!currentLocation) { addToast('GPS location is required to start a trip. Please wait for detection.', 'error', 'Location Required'); return; }
    try {
      showLoading('Starting Trip…', 'Recording your GPS location and trip details');
      const validInvoices = invoices.filter(inv => inv.invoice_no && inv.amount);
      const validChecks = checks.filter(chk => chk.check_no && chk.amount);
      const tripData = { ...tripForm, invoices: validInvoices, checks: validChecks, location: currentLocation };
      const res = await fetch(`${API_URL}/trips`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData), credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        hideLoading();
        addToast(`Trip started successfully at ${formatTimeDisplay(data.time_in)}`, 'success', 'Trip Started');
        await fetchTrips();
        const tripsArray = Array.isArray(trips) ? trips : [];
        const newTrip = tripsArray.find(t => t.driver_name === driverInfo?.full_name && t.date === tripForm.date && t.dealer === tripForm.dealer);
        if (newTrip) {
          setEditingTrip(newTrip);
          setTripForm({ date: newTrip.date, helper: newTrip.helper || '', time_in: newTrip.time_in || '', time_out: newTrip.time_out || '', odometer: newTrip.odometer || '', dealer: newTrip.dealer || '' });
        }
        setInvoices([{ invoice_no: '', amount: '' }]);
        setChecks([{ check_no: '', amount: '' }]);
      } else {
        hideLoading();
        addToast(data.message, 'error', 'Error');
      }
    } catch { hideLoading(); addToast('Could not connect to server. Please try again.', 'error', 'Connection Error'); }
  };

  const handleEndTrip = async () => {
    if (!editingTrip) { addToast('Please start the trip first.', 'error', 'No Active Trip'); return; }
    if (!tripForm.odometer) { addToast('Please enter the odometer reading before ending the trip.', 'error', 'Missing Field'); return; }
    try {
      showLoading('Ending Trip…', 'Saving all details and recording your time out');
      // Auto-save all current details (invoices, checks, odometer) first
      const validInvoices = invoices.filter(inv => inv.invoice_no && inv.amount);
      const validChecks = checks.filter(chk => chk.check_no && chk.amount);
      const payload = { ...tripForm, invoices: validInvoices, checks: validChecks };
      await fetch(`${API_URL}/trips/${editingTrip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      // Then record time out
      const res = await fetch(`${API_URL}/trips/${editingTrip.id}/time-out`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        hideLoading();
        setTripForm(prev => ({ ...prev, time_out: data.time_out }));
        addToast(`Trip ended at ${formatTimeDisplay(data.time_out)}. All details saved.`, 'success', 'Trip Ended');
        fetchTrips();
      } else {
        hideLoading();
        addToast(data.message, 'error', 'Error');
      }
    } catch { hideLoading(); addToast('Could not connect to server.', 'error', 'Connection Error'); }
  };

  const resetForm = () => {
    setTripForm({ date: new Date().toISOString().split('T')[0], helper: '', time_in: '', time_out: '', odometer: '', dealer: '' });
    setInvoices([{ invoice_no: '', amount: '' }]);
    setChecks([{ check_no: '', amount: '' }]);
    setCurrentLocation(null); setLocationError(''); setEditingTrip(null); setShowForm(false);
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setTripForm({ date: trip.date, helper: trip.helper || '', time_in: trip.time_in || '', time_out: trip.time_out || '', odometer: trip.odometer || '', dealer: trip.dealer || '' });
    if (trip.invoices?.length > 0) setInvoices(trip.invoices.map(inv => ({ invoice_no: inv.invoice_no, amount: inv.amount })));
    else if (trip.invoice_no) setInvoices([{ invoice_no: trip.invoice_no, amount: trip.amount || '' }]);
    else setInvoices([{ invoice_no: '', amount: '' }]);
    if (trip.checks?.length > 0) setChecks(trip.checks.map(chk => ({ check_no: chk.check_no, amount: chk.amount })));
    else setChecks([{ check_no: '', amount: '' }]);
    setCurrentLocation(null); setShowForm(true);
  };

  const handleDelete = (tripId) => {
    setConfirm({
      open: true,
      title: 'Delete Trip',
      message: 'This action cannot be undone. Are you sure you want to permanently delete this trip record?',
      confirmLabel: 'Delete',
      confirmColor: '#ef4444',
      onConfirm: async () => {
        setConfirm(p => ({ ...p, open: false }));
        showLoading('Deleting Trip…', 'Removing trip record from the database');
        try {
          const res = await fetch(`${API_URL}/trips/${tripId}`, { method: 'DELETE', credentials: 'include' });
          const data = await res.json();
          hideLoading();
          if (data.success) { addToast('Trip record has been deleted.', 'success', 'Deleted'); fetchTrips(); }
          else addToast(data.message, 'error', 'Delete Failed');
        } catch { hideLoading(); addToast('Could not connect to server.', 'error', 'Connection Error'); }
      }
    });
  };

  // UPDATE TRIP — shows confirm modal first
  const handleUpdateTrip = () => {
    if (!editingTrip) return;
    if (!tripForm.helper.trim()) { addToast('Helper name is required.', 'error', 'Missing Field'); return; }
    if (!tripForm.dealer.trim()) { addToast('Dealer name is required.', 'error', 'Missing Field'); return; }
    if (!tripForm.odometer) { addToast('Odometer reading is required.', 'error', 'Missing Field'); return; }

    // Scroll to top so modal is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setConfirm({
      open: true,
      title: 'Update Trip',
      message: 'Save all changes to this trip including invoices, checks, and odometer?',
      confirmLabel: 'Save Changes',
      confirmColor: '#0f1117',
      onConfirm: async () => {
        setConfirm(p => ({ ...p, open: false }));
        showLoading('Saving Details…', 'Updating invoices, checks, and odometer');
        try {
          const validInvoices = invoices.filter(inv => inv.invoice_no && inv.amount);
          const validChecks = checks.filter(chk => chk.check_no && chk.amount);
          const payload = { ...tripForm, invoices: validInvoices, checks: validChecks };
          const res = await fetch(`${API_URL}/trips/${editingTrip.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
          });
          const data = await res.json();
          hideLoading();
          if (data.success) {
            addToast('Trip details updated successfully.', 'success', 'Trip Updated');
            fetchTrips();
          } else {
            addToast(data.message || 'Failed to update trip.', 'error', 'Update Failed');
          }
        } catch {
          hideLoading();
          addToast('Could not connect to server.', 'error', 'Connection Error');
        }
      }
    });
  };

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

  const exportToExcel = () => {
    const headers = ['Date','Driver','Helper','Dealer','Time In','Time Out','Duration','Odometer (km)','Invoices','Checks','Location Lat','Location Lng','Google Maps Link'];
    const rows = filteredTrips.map(trip => {
      const mapsLink = trip.location_lat && trip.location_lng ? `https://www.google.com/maps?q=${trip.location_lat},${trip.location_lng}` : '';
      let duration = '';
      if (trip.time_in && trip.time_out) {
        const [inH, inM] = trip.time_in.split(':').map(Number);
        const [outH, outM] = trip.time_out.split(':').map(Number);
        const diff = (outH * 60 + outM) - (inH * 60 + inM);
        duration = `${Math.floor(diff / 60)}h ${diff % 60}m`;
      }
      const invoicesStr = trip.invoices?.length > 0 ? trip.invoices.map(inv => `${inv.invoice_no} (₱${inv.amount})`).join('; ') : trip.invoice_no ? `${trip.invoice_no} (₱${trip.amount || 0})` : '';
      const checksStr = trip.checks?.length > 0 ? trip.checks.map(chk => `${chk.check_no} (₱${chk.amount})`).join('; ') : '';
      return [trip.date, trip.driver_name, trip.helper||'', trip.dealer, trip.time_in||'', trip.time_out||'', duration, trip.odometer||'', invoicesStr, checksStr, trip.location_lat||'', trip.location_lng||'', mapsLink];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c??'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `trips_${driverInfo?.full_name?.replace(/\s+/g,'_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    addToast(`Exported ${filteredTrips.length} trip(s) to CSV.`, 'success', 'Export Complete');
  };

  const formatDateDisplay = (val) => {
    if (!val) return '';
    return new Date(val + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };
  const formatTimeDisplay = (val) => {
    if (!val) return '';
    const [h, m] = val.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  if (!driverInfo) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#9ca3af', fontFamily: 'DM Sans, sans-serif', fontSize: 16 }}>
      Loading driver information…
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(30px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.9) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); } to { transform: rotate(360deg); }
        }
        @keyframes loadPulse {
          0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          50%       { transform: translate(-50%,-50%) scale(0.5); opacity: 0.4; }
        }
        @keyframes loadBar {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .dd-root { font-family: 'DM Sans', sans-serif; }

        /* Stats */
        .dd-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .dd-stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 22px 26px; display: flex; align-items: center; gap: 18px; transition: box-shadow 0.2s, transform 0.2s; }
        .dd-stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); transform: translateY(-1px); }
        .dd-stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; }
        .dd-stat-icon.amber   { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .dd-stat-icon.indigo  { background: linear-gradient(135deg, #6366f1, #4f46e5); }
        .dd-stat-icon.emerald { background: linear-gradient(135deg, #10b981, #059669); }
        .dd-stat-value { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #0f1117; letter-spacing: -0.8px; line-height: 1; margin-bottom: 5px; }
        .dd-stat-label { font-size: 12px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.6px; }

        /* Driver Info Card */
        .dd-info-card { background: #0f1117; border-radius: 16px; padding: 26px 30px; margin-bottom: 22px; display: flex; align-items: center; justify-content: space-between; gap: 20px; position: relative; overflow: hidden; }
        .dd-info-card::before { content: ''; position: absolute; top: -50px; right: -50px; width: 260px; height: 260px; background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%); pointer-events: none; }
        .dd-info-left { display: flex; align-items: center; gap: 18px; }
        .dd-big-avatar { width: 58px; height: 58px; border-radius: 14px; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0f1117; flex-shrink: 0; }
        .dd-info-name { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.3px; margin-bottom: 6px; }
        .dd-info-meta { display: flex; gap: 18px; flex-wrap: wrap; }
        .dd-info-item { font-size: 13.5px; color: #9ca3af; display: flex; align-items: center; gap: 6px; }
        .dd-info-item svg { color: #f59e0b; }
        .dd-license-badge { background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.25); color: #f59e0b; padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 600; font-family: 'Syne', sans-serif; letter-spacing: 0.3px; white-space: nowrap; flex-shrink: 0; }

        /* Add Trip Button */
        .dd-add-btn { display: flex; align-items: center; gap: 9px; background: #0f1117; color: #fff; border: none; padding: 13px 22px; border-radius: 10px; cursor: pointer; font-size: 15px; font-family: 'DM Sans', sans-serif; font-weight: 600; margin-bottom: 22px; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.12); }
        .dd-add-btn:hover { background: #1f2937; box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
        .dd-add-btn.cancel { background: #fff; color: #ef4444; border: 1.5px solid #fecaca; }
        .dd-add-btn.cancel:hover { background: #fef2f2; }

        /* Form Card */
        .dd-form-card { background: #fff; border: 1px solid #e5e7eb; border-top: 3px solid #f59e0b; border-radius: 14px; padding: 30px; margin-bottom: 24px; }
        .dd-form-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: #0f1117; letter-spacing: -0.2px; margin-bottom: 24px; display: flex; align-items: center; gap: 9px; }
        .dd-form-title-dot { width: 9px; height: 9px; background: #f59e0b; border-radius: 50%; }
        .dd-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
        @media (max-width: 600px) { .dd-form-grid { grid-template-columns: 1fr; } }
        .dd-field { display: flex; flex-direction: column; gap: 7px; }
        .dd-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.7px; }

        .dd-input { padding: 12px 14px; border: 1.5px solid #e5e7eb; border-radius: 9px; font-size: 15px; font-family: 'DM Sans', sans-serif; color: #111827; background: #fff; transition: border-color 0.18s, box-shadow 0.18s; outline: none; }
        .dd-input:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); }
        .dd-input:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }

        /* Date Input */
        .dd-date-field { position: relative; background: #f8fafc; border: 1.5px solid #e5e7eb; border-radius: 10px; overflow: hidden; transition: border-color 0.18s, box-shadow 0.18s; cursor: pointer; }
        .dd-date-field:focus-within { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); background: #fff; }
        .dd-date-field-inner { display: flex; align-items: center; }
        .dd-date-icon-box { width: 50px; height: 52px; background: #f59e0b; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #0f1117; }
        .dd-date-content { flex: 1; padding: 10px 14px; position: relative; }
        .dd-date-display { font-size: 14.5px; font-weight: 500; color: #111827; line-height: 1.3; pointer-events: none; }
        .dd-date-placeholder { color: #9ca3af; font-size: 14px; }
        .dd-date-native { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; border: none; background: none; }
        .dd-date-native::-webkit-calendar-picker-indicator { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

        /* Time Display */
        .dd-time-field { position: relative; background: #f8fafc; border: 1.5px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
        .dd-time-field.active { border-color: #10b981; background: #fff; }
        .dd-time-field.ended { border-color: #ef4444; background: #fff; }
        .dd-time-field-inner { display: flex; align-items: center; }
        .dd-time-icon-box { width: 50px; height: 52px; background: #0f1117; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #f59e0b; }
        .dd-time-content { flex: 1; padding: 10px 14px; }
        .dd-time-sub { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.6px; line-height: 1; margin-bottom: 3px; }
        .dd-time-display { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: #111827; letter-spacing: -0.3px; line-height: 1.2; }
        .dd-time-display.empty { font-family: 'DM Sans', sans-serif; font-size: 14.5px; font-weight: 400; color: #9ca3af; letter-spacing: 0; }

        /* Trip Buttons */
        .dd-trip-buttons { display: flex; gap: 10px; margin: 15px 0 18px; }
        .dd-trip-btn { flex: 1; padding: 14px; border: none; border-radius: 10px; font-size: 14.5px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; letter-spacing: 0.3px; font-family: 'Syne', sans-serif; }
        .dd-trip-btn.start { background: #10b981; color: #fff; box-shadow: 0 2px 8px rgba(16,185,129,0.25); }
        .dd-trip-btn.start:hover:not(:disabled) { background: #059669; box-shadow: 0 4px 16px rgba(16,185,129,0.35); transform: translateY(-1px); }
        .dd-trip-btn.start:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
        .dd-trip-btn.end { background: #ef4444; color: #fff; box-shadow: 0 2px 8px rgba(239,68,68,0.25); }
        .dd-trip-btn.end:hover:not(:disabled) { background: #dc2626; box-shadow: 0 4px 16px rgba(239,68,68,0.35); transform: translateY(-1px); }
        .dd-trip-btn.end:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

        /* Submit/Cancel */
        .dd-submit-btn { width: 100%; padding: 14px; background: #0f1117; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-family: 'DM Sans', sans-serif; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 9px; }
        .dd-submit-btn:hover { background: #1f2937; box-shadow: 0 4px 14px rgba(15,17,23,0.2); }
        .dd-cancel-btn { width: 100%; padding: 14px; background: #f9fafb; color: #6b7280; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 15px; font-family: 'DM Sans', sans-serif; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .dd-cancel-btn:hover { background: #f3f4f6; }

        /* Section Cards (Invoices/Checks) */
        .dd-section-card { margin-bottom: 20px; border: 1.5px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
        .dd-section-header { display: flex; justify-content: space-between; align-items: center; padding: 13px 18px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
        .dd-section-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #0f1117; display: flex; align-items: center; gap: 8px; }
        .dd-section-body { padding: 14px; background: #fff; }
        .dd-row-card { display: flex; align-items: center; gap: 10px; padding: 10px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 9px; margin-bottom: 10px; }
        .dd-row-card:last-of-type { margin-bottom: 0; }
        .dd-add-row-btn { display: flex; align-items: center; gap: 6px; border: none; border-radius: 7px; padding: 7px 14px; font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .dd-remove-row-btn { width: 30px; height: 30px; border: none; border-radius: 6px; background: #fee2e2; color: #ef4444; cursor: pointer; font-size: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
        .dd-remove-row-btn:hover { background: #fecaca; }
        .dd-section-hint { font-size: 12px; color: #9ca3af; font-style: italic; padding: 10px 14px 14px; }

        /* Table Card */
        .dd-table-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
        .dd-table-header { padding: 22px 26px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
        .dd-table-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: #0f1117; letter-spacing: -0.2px; }
        .dd-table-sub { font-size: 14px; color: #9ca3af; margin-top: 3px; }
        .dd-table-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

        .dd-search-wrap { position: relative; display: flex; align-items: center; }
        .dd-search-icon { position: absolute; left: 11px; color: #9ca3af; pointer-events: none; display: flex; align-items: center; }
        .dd-search { padding: 9px 14px 9px 35px; border: 1.5px solid #e5e7eb; border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #111827; background: #f9fafb; outline: none; width: 210px; transition: all 0.18s; }
        .dd-search:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.08); background: #fff; }
        .dd-select { padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #374151; background: #f9fafb; outline: none; cursor: pointer; transition: border-color 0.18s; }
        .dd-select:focus { border-color: #f59e0b; }
        .dd-date-input { padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #374151; background: #f9fafb; outline: none; transition: border-color 0.18s; }
        .dd-date-input:focus { border-color: #f59e0b; }
        .dd-clear-btn { display: flex; align-items: center; gap: 6px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 9px; padding: 9px 14px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #ef4444; cursor: pointer; transition: all 0.2s; }
        .dd-clear-btn:hover { background: #fee2e2; }
        .dd-export-btn { display: flex; align-items: center; gap: 7px; background: #0f1117; border: none; border-radius: 9px; padding: 9px 16px; font-size: 14px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #fff; cursor: pointer; transition: all 0.2s; }
        .dd-export-btn:hover { background: #1f2937; }
        .dd-refresh-btn { display: flex; align-items: center; gap: 7px; background: #f3f4f6; border: none; border-radius: 9px; padding: 9px 16px; font-size: 14px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #4b5563; cursor: pointer; transition: all 0.2s; }
        .dd-refresh-btn:hover { background: #e5e7eb; }

        /* Action Buttons */
        .dd-action-btn { background: none; border: none; cursor: pointer; margin: 0 3px; padding: 6px 8px; border-radius: 7px; transition: all 0.18s; font-size: 15px; }
        .dd-action-btn.edit:hover { background: #eff6ff; transform: scale(1.1); }
        .dd-action-btn.delete:hover { background: #fee2e2; transform: scale(1.1); }

        /* Filter bar */
        .dd-filter-bar { padding: 13px 26px; background: #fafafa; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .dd-filter-label { font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.6px; margin-right: 4px; }
        .dd-filter-tag { display: flex; align-items: center; gap: 5px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); color: #92400e; border-radius: 6px; padding: 4px 11px; font-size: 13px; font-weight: 500; }
        .dd-results-count { padding: 11px 26px; background: #f8fafc; border-bottom: 1px solid #f3f4f6; font-size: 13.5px; color: #6b7280; }

        /* Table */
        .dd-table-wrap { overflow-x: auto; }
        .dd-table { width: 100%; border-collapse: collapse; font-size: 14.5px; }
        .dd-table thead tr { background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
        .dd-table th { padding: 13px 20px; text-align: left; font-size: 11.5px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.7px; white-space: nowrap; }
        .dd-table td { padding: 15px 20px; color: #374151; border-bottom: 1px solid #f3f4f6; white-space: nowrap; font-size: 14px; }
        .dd-table tbody tr:last-child td { border-bottom: none; }
        .dd-table tbody tr { transition: background 0.15s; }
        .dd-table tbody tr:hover { background: #fffbf0; }

        /* Status Badge */
        .dd-status-badge { display: inline-flex; align-items: center; gap: 5px; padding: '3px 9px'; border-radius: 20px; font-size: 12px; font-weight: 600; }

        .dd-empty { padding: 70px 20px; text-align: center; color: #9ca3af; font-size: 15px; }
        .dd-empty-icon { width: 54px; height: 54px; background: #f3f4f6; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; color: #d1d5db; }
        .dd-table-wrap::-webkit-scrollbar { height: 5px; }
        .dd-table-wrap::-webkit-scrollbar-track { background: transparent; }
        .dd-table-wrap::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
      `}</style>

      {/* Toast Container */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={loadingOverlay.visible}
        message={loadingOverlay.message}
        submessage={loadingOverlay.submessage}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm(p => ({ ...p, open: false }))}
        confirmLabel={confirm.confirmLabel || 'Confirm'}
        confirmColor={confirm.confirmColor || '#ef4444'}
      />

      <div className="dd-root">

        {/* Stats */}
        <div className="dd-stats">
          <div className="dd-stat-card">
            <div className="dd-stat-icon amber"><TruckIcon /></div>
            <div><div className="dd-stat-value">{myTrips.length}</div><div className="dd-stat-label">Total Trips</div></div>
          </div>
          <div className="dd-stat-card">
            <div className="dd-stat-icon emerald"><CalendarIcon /></div>
            <div><div className="dd-stat-value">{todayTrips.length}</div><div className="dd-stat-label">Trips Today</div></div>
          </div>
          <div className="dd-stat-card">
            <div className="dd-stat-icon indigo"><RouteIcon /></div>
            <div><div className="dd-stat-value">{totalKm.toLocaleString()}</div><div className="dd-stat-label">Total km</div></div>
          </div>
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

        {/* Add Trip Button */}
        <button className={`dd-add-btn${showForm ? ' cancel' : ''}`} onClick={() => showForm ? resetForm() : setShowForm(true)}>
          {showForm ? <><CloseIcon /> Cancel</> : <><PlusIcon /> Log New Trip</>}
        </button>

        {/* Form */}
        {showForm && (
          <div className="dd-form-card">
            <div className="dd-form-title">
              <span className="dd-form-title-dot" />
              {editingTrip ? 'Edit Trip' : 'New Trip Log'}
            </div>

            {/* Location Card */}
            <LocationCard
              currentLocation={currentLocation}
              locationError={locationError}
              isGettingLocation={isGettingLocation}
              onRefresh={getCurrentLocation}
            />

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
                  <input className="dd-input" type="text" name="helper" value={tripForm.helper} onChange={handleInputChange} placeholder="Helper name" required />
                </div>
                <div className="dd-field">
                  <label className="dd-label">Dealer</label>
                  <input className="dd-input" type="text" name="dealer" value={tripForm.dealer} onChange={handleInputChange} placeholder="Dealer name" required />
                </div>
              </div>

              {/* Start / End Buttons */}
              <div className="dd-trip-buttons">
                <button type="button" className="dd-trip-btn start" onClick={handleStartTrip} disabled={!!editingTrip}>
                  <span style={{ fontSize: 16 }}>▶</span> START TRIP
                </button>
                <button type="button" className="dd-trip-btn end" onClick={handleEndTrip} disabled={!editingTrip || !!tripForm.time_out}>
                  <span style={{ fontSize: 16 }}>■</span> END TRIP
                </button>
              </div>

              {/* Info tip — shown after trip started */}
              {editingTrip && (
                <div style={{
                  marginBottom: 18, padding: '10px 14px',
                  background: '#fffbeb', border: '1px solid #fde68a',
                  borderRadius: 9, fontSize: 13, color: '#92400e',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <span>💡</span>
                  <span>Trip started! You can still fill in invoices, checks, and odometer below, then tap <strong>Save Details</strong>.</span>
                </div>
              )}

              {/* Time Display */}
              <div className="dd-form-grid">
                <div className="dd-field">
                  <label className="dd-label">Time In</label>
                  <div className={`dd-time-field${tripForm.time_in ? ' active' : ''}`}>
                    <div className="dd-time-field-inner">
                      <div className="dd-time-icon-box"><ClockInIcon /></div>
                      <div className="dd-time-content">
                        <div className="dd-time-sub">Loading started</div>
                        <div className={`dd-time-display${!tripForm.time_in ? ' empty' : ''}`}>
                          {tripForm.time_in ? formatTimeDisplay(tripForm.time_in) : 'Not yet started'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dd-field">
                  <label className="dd-label">Time Out</label>
                  <div className={`dd-time-field${tripForm.time_out ? ' ended' : ''}`}>
                    <div className="dd-time-field-inner">
                      <div className="dd-time-icon-box"><ClockOutIcon /></div>
                      <div className="dd-time-content">
                        <div className="dd-time-sub">Unloading completed</div>
                        <div className={`dd-time-display${!tripForm.time_out ? ' empty' : ''}`}>
                          {tripForm.time_out ? formatTimeDisplay(tripForm.time_out) : 'Not yet ended'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dd-form-grid">
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
                  <button type="button" onClick={addInvoiceRow} className="dd-add-row-btn" style={{ background: '#fef3c7', color: '#d97706' }}>
                    + Add Invoice
                  </button>
                </div>
                <div className="dd-section-body">
                  {invoices.map((invoice, index) => (
                    <div key={index} className="dd-row-card">
                      <div style={{ flex: 2 }}>
                        <input className="dd-input" type="text" value={invoice.invoice_no} onChange={e => handleInvoiceChange(index, 'invoice_no', e.target.value)} placeholder="Invoice No. (e.g. INV-001)" style={{ width: '100%' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input className="dd-input" type="number" value={invoice.amount} onChange={e => handleInvoiceChange(index, 'amount', e.target.value)} placeholder="Amount (₱)" style={{ width: '100%' }} />
                      </div>
                      {invoices.length > 1 && (
                        <button type="button" className="dd-remove-row-btn" onClick={() => removeInvoiceRow(index)}>×</button>
                      )}
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
                  <button type="button" onClick={addCheckRow} className="dd-add-row-btn" style={{ background: '#d1fae5', color: '#059669' }}>
                    + Add Check
                  </button>
                </div>
                <div className="dd-section-body">
                  {checks.map((check, index) => (
                    <div key={index} className="dd-row-card">
                      <div style={{ flex: 2 }}>
                        <input className="dd-input" type="text" value={check.check_no} onChange={e => handleCheckChange(index, 'check_no', e.target.value)} placeholder="Check No. (e.g. CHK-001)" style={{ width: '100%' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input className="dd-input" type="number" value={check.amount} onChange={e => handleCheckChange(index, 'amount', e.target.value)} placeholder="Amount (₱)" style={{ width: '100%' }} />
                      </div>
                      {checks.length > 1 && (
                        <button type="button" className="dd-remove-row-btn" onClick={() => removeCheckRow(index)}>×</button>
                      )}
                    </div>
                  ))}
                  <div className="dd-section-hint">Leave blank if no checks for this trip.</div>
                </div>
              </div>

              {/* Save / Cancel — always visible when editing a trip */}
              {editingTrip && (
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    className="dd-submit-btn"
                    style={{ flex: 1 }}
                    onClick={handleUpdateTrip}
                  >
                    <SaveIcon /> Save Details
                  </button>
                  <button type="button" className="dd-cancel-btn" onClick={resetForm} style={{ flex: 1 }}>
                    Close
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Table */}
        <div className="dd-table-card">
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
              <button className="dd-export-btn" onClick={exportToExcel}><ExportIcon /> Export CSV</button>
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
          {hasFilters && (
            <div className="dd-results-count">Showing {filteredTrips.length} of {myTrips.length} trips</div>
          )}

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
                    <th>Date</th><th>Helper</th><th>Dealer</th>
                    <th>Time In</th><th>Time Out</th><th>Duration</th>
                    <th>Odometer</th><th>Invoices</th><th>Checks</th><th>Location</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrips.map(trip => {
                    let duration = '';
                    if (trip.time_in && trip.time_out) {
                      const [inH, inM] = trip.time_in.split(':').map(Number);
                      const [outH, outM] = trip.time_out.split(':').map(Number);
                      const diff = (outH * 60 + outM) - (inH * 60 + inM);
                      duration = `${Math.floor(diff / 60)}h ${diff % 60}m`;
                    }
                    const hasTimeIn = !!trip.time_in;
                    const hasTimeOut = !!trip.time_out;
                    return (
                      <tr key={trip.id}>
                        <td><span style={{ fontWeight: 600, color: '#0f1117' }}>{trip.date}</span></td>
                        <td>{trip.helper}</td>
                        <td><span style={{ fontWeight: 600 }}>{trip.dealer}</span></td>
                        <td>
                          {hasTimeIn ? (
                            <span style={{ color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                              {formatTimeDisplay(trip.time_in)}
                            </span>
                          ) : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td>
                          {hasTimeOut ? (
                            <span style={{ color: '#ef4444', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                              {formatTimeDisplay(trip.time_out)}
                            </span>
                          ) : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td>
                          {duration ? (
                            <span style={{ background: '#f3f4f6', borderRadius: 6, padding: '3px 9px', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                              {duration}
                            </span>
                          ) : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td>{trip.odometer ? `${trip.odometer} km` : <span style={{ color: '#d1d5db' }}>—</span>}</td>
                        <td>
                          {trip.invoices?.length > 0
                            ? <div style={{ fontSize: 13 }}>{trip.invoices.map((inv, i) => <div key={i} style={{ color: '#374151' }}>{inv.invoice_no}: <span style={{ color: '#d97706', fontWeight: 600 }}>₱{Number(inv.amount).toLocaleString()}</span></div>)}</div>
                            : trip.invoice_no
                              ? <div>{trip.invoice_no}: <span style={{ color: '#d97706', fontWeight: 600 }}>₱{trip.amount}</span></div>
                              : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td>
                          {trip.checks?.length > 0
                            ? <div style={{ fontSize: 13 }}>{trip.checks.map((chk, i) => <div key={i} style={{ color: '#374151' }}>{chk.check_no}: <span style={{ color: '#10b981', fontWeight: 600 }}>₱{Number(chk.amount).toLocaleString()}</span></div>)}</div>
                            : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td>
                          {trip.location_lat && trip.location_lng
                            ? <a
                                href={`https://www.google.com/maps?q=${trip.location_lat},${trip.location_lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#3b82f6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', background: '#eff6ff', borderRadius: 6, fontSize: 12.5, fontWeight: 500, transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                                onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                              >
                                📍 View Map
                              </a>
                            : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td>
                          <button className="dd-action-btn edit" onClick={() => handleEdit(trip)} title="Edit trip">✏️</button>
                          <button className="dd-action-btn delete" onClick={() => handleDelete(trip.id)} title="Delete trip">🗑️</button>
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

/* SVG Icons */
function TruckIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>; }
function CalendarIcon({ size = 20 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function RouteIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>; }
function PhoneIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>; }
function MailIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function PlusIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function CloseIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function SaveIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>; }
function RefreshIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>; }
function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function ExportIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>; }
function ClockInIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><line x1="2" y1="12" x2="5" y2="12"/></svg>; }
function ClockOutIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 8 14"/><line x1="19" y1="12" x2="22" y2="12"/></svg>; }

export default DriverDashboard;