import { useState, useMemo } from 'react';
import API_URL from '../../config'; // ✅ IMPORT CONFIG

function DriverDashboard({ driverInfo, trips, fetchTrips, user }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDealer, setFilterDealer] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [tripForm, setTripForm] = useState({
    date: new Date().toISOString().split('T')[0],
    helper: '', time_in: '', time_out: '',
    odometer: '', invoice_no: '', dealer: ''
  });

  const handleInputChange = (e) => {
    setTripForm({ ...tripForm, [e.target.name]: e.target.value });
  };

  const handleSubmitTrip = async (e) => {
    e.preventDefault();
    try {
      // ✅ GAMITIN ANG API_URL
      const res = await fetch(`${API_URL}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripForm),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        alert('Trip saved successfully!');
        setShowForm(false);
        setTripForm({
          date: new Date().toISOString().split('T')[0],
          helper: '', time_in: '', time_out: '',
          odometer: '', invoice_no: '', dealer: ''
        });
        fetchTrips();
      } else {
        alert('Error saving trip: ' + data.message);
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  };

  const myTrips = trips.filter(t => t.driver_name === driverInfo?.full_name);
  const todayTrips = myTrips.filter(t => t.date === new Date().toISOString().split('T')[0]);
  const totalKm = myTrips.reduce((sum, t) => sum + (parseFloat(t.odometer) || 0), 0);

  const dealers = useMemo(() => [...new Set(myTrips.map(t => t.dealer).filter(Boolean))], [myTrips]);

  const filteredTrips = useMemo(() => {
    return myTrips.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !q || [t.helper, t.dealer, t.invoice_no, t.date].some(v => v?.toLowerCase().includes(q));
      const matchDealer = !filterDealer || t.dealer === filterDealer;
      const matchFrom = !filterDateFrom || t.date >= filterDateFrom;
      const matchTo = !filterDateTo || t.date <= filterDateTo;
      return matchSearch && matchDealer && matchFrom && matchTo;
    });
  }, [myTrips, search, filterDealer, filterDateFrom, filterDateTo]);

  const hasFilters = search || filterDealer || filterDateFrom || filterDateTo;
  const clearFilters = () => { setSearch(''); setFilterDealer(''); setFilterDateFrom(''); setFilterDateTo(''); };

  const exportToExcel = () => {
    const headers = ['Date', 'Driver', 'Helper', 'Dealer', 'Time In', 'Time Out', 'Odometer (km)', 'Invoice No.'];
    const rows = filteredTrips.map(t => [t.date, t.driver_name, t.helper, t.dealer, t.time_in, t.time_out, t.odometer, t.invoice_no]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trips_${driverInfo?.full_name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDateDisplay = (val) => {
    if (!val) return '';
    const d = new Date(val + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeDisplay = (val) => {
    if (!val) return '';
    const [h, m] = val.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  if (!driverInfo) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#9ca3af', fontFamily: 'DM Sans, sans-serif', fontSize: '16px' }}>
        Loading driver information...
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .dd-root { font-family: 'DM Sans', sans-serif; }

        /* ── Stats ── */
        .dd-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .dd-stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 22px 26px;
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .dd-stat-icon {
          width: 50px; height: 50px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: #fff;
        }
        .dd-stat-icon.amber   { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .dd-stat-icon.indigo  { background: linear-gradient(135deg, #6366f1, #4f46e5); }
        .dd-stat-icon.emerald { background: linear-gradient(135deg, #10b981, #059669); }
        .dd-stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 28px; font-weight: 800;
          color: #0f1117; letter-spacing: -0.8px;
          line-height: 1; margin-bottom: 5px;
        }
        .dd-stat-label {
          font-size: 12px; color: #9ca3af;
          font-weight: 500; text-transform: uppercase; letter-spacing: 0.6px;
        }

        /* ── Driver Info Card ── */
        .dd-info-card {
          background: #0f1117;
          border-radius: 16px;
          padding: 26px 30px;
          margin-bottom: 22px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 20px;
          position: relative; overflow: hidden;
        }
        .dd-info-card::before {
          content: '';
          position: absolute; top: -50px; right: -50px;
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .dd-info-left { display: flex; align-items: center; gap: 18px; }
        .dd-big-avatar {
          width: 58px; height: 58px; border-radius: 14px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px;
          color: #0f1117; flex-shrink: 0;
        }
        .dd-info-name {
          font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700;
          color: #ffffff; letter-spacing: -0.3px; margin-bottom: 6px;
        }
        .dd-info-meta { display: flex; gap: 18px; flex-wrap: wrap; }
        .dd-info-item {
          font-size: 13.5px; color: #9ca3af;
          display: flex; align-items: center; gap: 6px;
        }
        .dd-info-item svg { color: #f59e0b; }
        .dd-license-badge {
          background: rgba(245,158,11,0.12);
          border: 1px solid rgba(245,158,11,0.25);
          color: #f59e0b; padding: 8px 16px; border-radius: 9px;
          font-size: 13px; font-weight: 600;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.3px; white-space: nowrap; flex-shrink: 0;
        }

        /* ── Add Trip Button ── */
        .dd-add-btn {
          display: flex; align-items: center; gap: 9px;
          background: #0f1117; color: #ffffff; border: none;
          padding: 13px 22px; border-radius: 10px; cursor: pointer;
          font-size: 15px; font-family: 'DM Sans', sans-serif;
          font-weight: 600; margin-bottom: 22px;
          transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }
        .dd-add-btn:hover { background: #1f2937; }
        .dd-add-btn.cancel { background: #fff; color: #ef4444; border: 1px solid #fecaca; }
        .dd-add-btn.cancel:hover { background: #fef2f2; }

        /* ── Form Card ── */
        .dd-form-card {
          background: #ffffff; border: 1px solid #e5e7eb;
          border-top: 3px solid #f59e0b; border-radius: 14px;
          padding: 30px 30px; margin-bottom: 24px;
        }
        .dd-form-title {
          font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700;
          color: #0f1117; letter-spacing: -0.2px; margin-bottom: 24px;
          display: flex; align-items: center; gap: 9px;
        }
        .dd-form-title-dot { width: 9px; height: 9px; background: #f59e0b; border-radius: 50%; }

        .dd-form-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 18px; margin-bottom: 18px;
        }
        @media (max-width: 600px) { .dd-form-grid { grid-template-columns: 1fr; } }

        .dd-field { display: flex; flex-direction: column; gap: 7px; }
        .dd-label {
          font-size: 12px; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.7px;
        }

        /* Standard inputs */
        .dd-input {
          padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 9px;
          font-size: 15px; font-family: 'DM Sans', sans-serif; color: #111827;
          background: #ffffff; transition: border-color 0.18s, box-shadow 0.18s; outline: none;
        }
        .dd-input:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); }
        .dd-input:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }
        .dd-input-hint { font-size: 12px; color: #9ca3af; }

        /* ── Date Input ── */
        .dd-date-field {
          position: relative; background: #f8fafc;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          overflow: hidden; transition: border-color 0.18s, box-shadow 0.18s; cursor: pointer;
        }
        .dd-date-field:focus-within {
          border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); background: #fff;
        }
        .dd-date-field-inner { display: flex; align-items: center; }
        .dd-date-icon-box {
          width: 50px; height: 52px;
          background: #f59e0b;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: #0f1117;
        }
        .dd-date-content { flex: 1; padding: 10px 14px; position: relative; }
        .dd-date-display {
          font-size: 14.5px; font-weight: 500; color: #111827;
          line-height: 1.3; pointer-events: none;
        }
        .dd-date-placeholder { color: #9ca3af; font-size: 14px; }
        .dd-date-native {
          position: absolute; inset: 0; opacity: 0;
          width: 100%; height: 100%; cursor: pointer; border: none; background: none;
        }
        .dd-date-native::-webkit-calendar-picker-indicator {
          position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
        }

        /* ── Time Input ── */
        .dd-time-field {
          position: relative; background: #f8fafc;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          overflow: hidden; transition: border-color 0.18s, box-shadow 0.18s; cursor: pointer;
        }
        .dd-time-field:focus-within {
          border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); background: #fff;
        }
        .dd-time-field-inner { display: flex; align-items: center; }
        .dd-time-icon-box {
          width: 50px; height: 52px;
          background: #0f1117;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: #f59e0b;
        }
        .dd-time-content { flex: 1; padding: 10px 14px; position: relative; }
        .dd-time-sub {
          font-size: 11px; color: #9ca3af;
          text-transform: uppercase; letter-spacing: 0.6px;
          line-height: 1; margin-bottom: 3px;
        }
        .dd-time-display {
          font-family: 'Syne', sans-serif;
          font-size: 17px; font-weight: 700;
          color: #111827; letter-spacing: -0.3px; line-height: 1.2;
          pointer-events: none;
        }
        .dd-time-display.empty {
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px; font-weight: 400;
          color: #9ca3af; letter-spacing: 0;
        }
        .dd-time-native {
          position: absolute; inset: 0; opacity: 0;
          width: 100%; height: 100%; cursor: pointer; border: none; background: none;
        }
        .dd-time-native::-webkit-calendar-picker-indicator {
          position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
        }

        /* Submit button */
        .dd-submit-btn {
          width: 100%; margin-top: 10px; padding: 14px;
          background: #0f1117; color: #ffffff; border: none; border-radius: 10px;
          font-size: 15px; font-family: 'DM Sans', sans-serif; font-weight: 600;
          cursor: pointer; transition: background 0.2s, box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 9px;
        }
        .dd-submit-btn:hover { background: #1f2937; box-shadow: 0 4px 14px rgba(15,17,23,0.2); }

        /* ── Table Card ── */
        .dd-table-card {
          background: #ffffff; border: 1px solid #e5e7eb;
          border-radius: 14px; overflow: hidden;
        }
        .dd-table-header {
          padding: 22px 26px; border-bottom: 1px solid #f3f4f6;
          display: flex; align-items: center;
          justify-content: space-between; gap: 14px; flex-wrap: wrap;
        }
        .dd-table-title {
          font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700;
          color: #0f1117; letter-spacing: -0.2px;
        }
        .dd-table-sub { font-size: 14px; color: #9ca3af; margin-top: 3px; }
        .dd-table-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

        /* Search */
        .dd-search-wrap { position: relative; display: flex; align-items: center; }
        .dd-search-icon {
          position: absolute; left: 11px; color: #9ca3af;
          pointer-events: none; display: flex; align-items: center;
        }
        .dd-search {
          padding: 9px 14px 9px 35px;
          border: 1px solid #e5e7eb; border-radius: 9px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #111827; background: #f9fafb; outline: none;
          width: 210px; transition: border-color 0.18s, box-shadow 0.18s;
        }
        .dd-search:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.08); background: #fff;
        }

        .dd-select {
          padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 9px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #374151; background: #f9fafb; outline: none;
          cursor: pointer; transition: border-color 0.18s;
        }
        .dd-select:focus { border-color: #f59e0b; }

        .dd-date-input {
          padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 9px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #374151; background: #f9fafb; outline: none;
          transition: border-color 0.18s;
        }
        .dd-date-input:focus { border-color: #f59e0b; }

        .dd-clear-btn {
          display: flex; align-items: center; gap: 6px;
          background: #fef2f2; border: 1px solid #fecaca; border-radius: 9px;
          padding: 9px 14px; font-size: 13.5px;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          color: #ef4444; cursor: pointer; transition: background 0.2s;
        }
        .dd-clear-btn:hover { background: #fee2e2; }

        .dd-export-btn {
          display: flex; align-items: center; gap: 7px;
          background: #0f1117; border: none; border-radius: 9px;
          padding: 9px 16px; font-size: 14px;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          color: #ffffff; cursor: pointer; transition: background 0.2s;
        }
        .dd-export-btn:hover { background: #1f2937; }

        .dd-refresh-btn {
          display: flex; align-items: center; gap: 7px;
          background: #f3f4f6; border: none; border-radius: 9px;
          padding: 9px 16px; font-size: 14px;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          color: #4b5563; cursor: pointer; transition: background 0.2s;
        }
        .dd-refresh-btn:hover { background: #e5e7eb; }

        /* Filter bar */
        .dd-filter-bar {
          padding: 13px 26px; background: #fafafa;
          border-bottom: 1px solid #f3f4f6;
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .dd-filter-label {
          font-size: 12px; font-weight: 600; color: #9ca3af;
          text-transform: uppercase; letter-spacing: 0.6px; margin-right: 4px;
        }
        .dd-filter-tag {
          display: flex; align-items: center; gap: 5px;
          background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2);
          color: #92400e; border-radius: 6px; padding: 4px 11px;
          font-size: 13px; font-weight: 500;
        }

        /* Results count */
        .dd-results-count {
          padding: 11px 26px; background: #f8fafc;
          border-bottom: 1px solid #f3f4f6;
          font-size: 13.5px; color: #6b7280;
        }

        /* Table */
        .dd-table-wrap { overflow-x: auto; }
        .dd-table { width: 100%; border-collapse: collapse; font-size: 14.5px; }
        .dd-table thead tr { background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
        .dd-table th {
          padding: 13px 22px; text-align: left;
          font-size: 12px; font-weight: 600; color: #9ca3af;
          text-transform: uppercase; letter-spacing: 0.7px; white-space: nowrap;
        }
        .dd-table td {
          padding: 16px 22px; color: #374151;
          border-bottom: 1px solid #f3f4f6; white-space: nowrap;
          font-size: 14.5px;
        }
        .dd-table tbody tr:last-child td { border-bottom: none; }
        .dd-table tbody tr { transition: background 0.15s; }
        .dd-table tbody tr:hover { background: #fafafa; }

        .dd-empty {
          padding: 70px 20px; text-align: center;
          color: #9ca3af; font-size: 15px;
        }
        .dd-empty-icon {
          width: 54px; height: 54px; background: #f3f4f6; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px; color: #d1d5db;
        }

        .dd-table-wrap::-webkit-scrollbar { height: 5px; }
        .dd-table-wrap::-webkit-scrollbar-track { background: transparent; }
        .dd-table-wrap::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
      `}</style>

      <div className="dd-root">

        {/* Stats */}
        <div className="dd-stats">
          <div className="dd-stat-card">
            <div className="dd-stat-icon amber"><TruckIcon /></div>
            <div>
              <div className="dd-stat-value">{myTrips.length}</div>
              <div className="dd-stat-label">Total Trips</div>
            </div>
          </div>
          <div className="dd-stat-card">
            <div className="dd-stat-icon emerald"><CalendarIcon /></div>
            <div>
              <div className="dd-stat-value">{todayTrips.length}</div>
              <div className="dd-stat-label">Trips Today</div>
            </div>
          </div>
          <div className="dd-stat-card">
            <div className="dd-stat-icon indigo"><RouteIcon /></div>
            <div>
              <div className="dd-stat-value">{totalKm.toLocaleString()}</div>
              <div className="dd-stat-label">Total km</div>
            </div>
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
        <button className={`dd-add-btn${showForm ? ' cancel' : ''}`} onClick={() => setShowForm(!showForm)}>
          {showForm ? <><CloseIcon /> Cancel</> : <><PlusIcon /> Log New Trip</>}
        </button>

        {/* Form */}
        {showForm && (
          <div className="dd-form-card">
            <div className="dd-form-title">
              <span className="dd-form-title-dot" /> New Trip Log
            </div>
            <form onSubmit={handleSubmitTrip}>

              {/* Row 1: Date + Driver */}
              <div className="dd-form-grid">
                <div className="dd-field">
                  <label className="dd-label">Date</label>
                  <div className="dd-date-field">
                    <div className="dd-date-field-inner">
                      <div className="dd-date-icon-box"><CalendarIcon size={20} /></div>
                      <div className="dd-date-content">
                        {tripForm.date
                          ? <div className="dd-date-display">{formatDateDisplay(tripForm.date)}</div>
                          : <div className="dd-date-display dd-date-placeholder">Pick a date</div>
                        }
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

              {/* Row 2: Helper + Dealer */}
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

              {/* Row 3: Time In + Time Out */}
              <div className="dd-form-grid">
                <div className="dd-field">
                  <label className="dd-label">Time In</label>
                  <div className="dd-time-field">
                    <div className="dd-time-field-inner">
                      <div className="dd-time-icon-box"><ClockInIcon /></div>
                      <div className="dd-time-content">
                        <div className="dd-time-sub">Loading</div>
                        <div className={`dd-time-display${!tripForm.time_in ? ' empty' : ''}`}>
                          {tripForm.time_in ? formatTimeDisplay(tripForm.time_in) : 'Select time'}
                        </div>
                        <input className="dd-time-native" type="time" name="time_in" value={tripForm.time_in} onChange={handleInputChange} required />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dd-field">
                  <label className="dd-label">Time Out</label>
                  <div className="dd-time-field">
                    <div className="dd-time-field-inner">
                      <div className="dd-time-icon-box"><ClockOutIcon /></div>
                      <div className="dd-time-content">
                        <div className="dd-time-sub">Unloading</div>
                        <div className={`dd-time-display${!tripForm.time_out ? ' empty' : ''}`}>
                          {tripForm.time_out ? formatTimeDisplay(tripForm.time_out) : 'Select time'}
                        </div>
                        <input className="dd-time-native" type="time" name="time_out" value={tripForm.time_out} onChange={handleInputChange} required />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Odometer + Invoice */}
              <div className="dd-form-grid">
                <div className="dd-field">
                  <label className="dd-label">Odometer (km)</label>
                  <input className="dd-input" type="number" name="odometer" value={tripForm.odometer} onChange={handleInputChange} placeholder="e.g. 12400" required />
                </div>
                <div className="dd-field">
                  <label className="dd-label">Invoice No./s</label>
                  <input className="dd-input" type="text" name="invoice_no" value={tripForm.invoice_no} onChange={handleInputChange} placeholder="e.g. INV-001, INV-002" required />
                </div>
              </div>

              <button type="submit" className="dd-submit-btn">
                <SaveIcon /> Save Trip Log
              </button>
            </form>
          </div>
        )}

        {/* Trips Table */}
        <div className="dd-table-card">
          <div className="dd-table-header">
            <div>
              <div className="dd-table-title">My Recent Trips</div>
              <div className="dd-table-sub">{myTrips.length} trip{myTrips.length !== 1 ? 's' : ''} recorded</div>
            </div>
            <div className="dd-table-actions">
              <div className="dd-search-wrap">
                <span className="dd-search-icon"><SearchIcon /></span>
                <input className="dd-search" type="text" placeholder="Search trips..." value={search} onChange={e => setSearch(e.target.value)} />
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
            <div className="dd-results-count">
              Showing {filteredTrips.length} of {myTrips.length} trips
            </div>
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
                    <th>Date</th>
                    <th>Helper</th>
                    <th>Dealer</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Odometer</th>
                    <th>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrips.map(trip => (
                    <tr key={trip.id}>
                      <td>{trip.date}</td>
                      <td>{trip.helper}</td>
                      <td>{trip.dealer}</td>
                      <td>{trip.time_in}</td>
                      <td>{trip.time_out}</td>
                      <td>{trip.odometer} km</td>
                      <td>{trip.invoice_no}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  );
}

/* ── SVG Icons ── */
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