import { useState, useMemo, useEffect, useCallback } from 'react';
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
            cursor: 'pointer', fontSize: 18, padding: 0, marginLeft: 4, flexShrink: 0, lineHeight: 1
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
function LoadingOverlay({ message = 'Loading…' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', gap: 16
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid #f3f4f6', borderTopColor: '#f59e0b',
        animation: 'spin 0.75s linear infinite'
      }} />
      <span style={{ color: '#9ca3af', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>{message}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
function AdminDashboard({ drivers, trips, fetchTrips }) {
  const { toasts, addToast, removeToast } = useToast();

  const [view, setView] = useState('drivers');
  const [activeDatabase, setActiveDatabase] = useState('main');

  const [historicalTrips, setHistoricalTrips] = useState([]);
  const [historicalDrivers, setHistoricalDrivers] = useState([]);
  const [loadingHistorical, setLoadingHistorical] = useState(false);

  useEffect(() => {
    if (activeDatabase === 'historical') fetchHistoricalData();
  }, [activeDatabase]);

  const fetchHistoricalData = async () => {
    setLoadingHistorical(true);
    try {
      const [tripsRes, driversRes] = await Promise.all([
        fetch(`${API_URL}/api/2025/trips`, { credentials: 'include' }),
        fetch(`${API_URL}/api/2025/drivers`, { credentials: 'include' }),
      ]);
      const tripsData = await tripsRes.json();
      const driversData = await driversRes.json();
      setHistoricalTrips(tripsData.trips || []);
      setHistoricalDrivers(driversData.drivers || []);
      addToast(`Loaded ${(tripsData.trips || []).length} historical trips.`, 'success', '2025 Data Loaded');
    } catch {
      addToast('Failed to load historical data. Please try again.', 'error', 'Load Error');
    } finally {
      setLoadingHistorical(false);
    }
  };

  const currentTrips = activeDatabase === 'main' ? trips : historicalTrips;
  const currentDrivers = activeDatabase === 'main' ? drivers : historicalDrivers;

  const [driverSearch, setDriverSearch] = useState('');
  const [tripSearch, setTripSearch] = useState('');
  const [filterDriver, setFilterDriver] = useState('');
  const [filterDealer, setFilterDealer] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');
  const [analyticsDriver, setAnalyticsDriver] = useState('');
  const [analyticsYear, setAnalyticsYear] = useState('all');

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

  const today = () => new Date().toISOString().split('T')[0];

  const downloadCSV = (headers, rows, filename) => {
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportDrivers = () => {
    downloadCSV(
      ['Full Name', 'Username', 'Email', 'Phone', 'License No.'],
      filteredDrivers.map(d => [d.full_name, d.username, d.email, d.phone, d.license_number]),
      `drivers_${activeDatabase}_${today()}.csv`
    );
    addToast(`Exported ${filteredDrivers.length} driver(s) to CSV.`, 'success', 'Export Complete');
  };

  const exportTrips = () => {
    const headers = ['Date', 'Driver', 'Helper', 'Dealer', 'Time In', 'Time Out', 'Odometer (km)', 'Invoices', 'Checks', 'Location Lat', 'Location Lng', 'Google Maps Link'];
    const rows = filteredTrips.map(trip => {
      const mapsLink = trip.location_lat && trip.location_lng ? `https://www.google.com/maps?q=${trip.location_lat},${trip.location_lng}` : '';
      const invoicesStr = trip.invoices?.length > 0 ? trip.invoices.map(inv => `${inv.invoice_no} (₱${inv.amount})`).join('; ') : trip.invoice_no ? `${trip.invoice_no} (₱${trip.amount || 0})` : '';
      const checksStr = trip.checks?.length > 0 ? trip.checks.map(chk => `${chk.check_no} (₱${chk.amount})`).join('; ') : '';
      return [trip.date, trip.driver_name, trip.helper || '', trip.dealer, trip.time_in || '', trip.time_out || '', trip.odometer || '', invoicesStr, checksStr, trip.location_lat || '', trip.location_lng || '', mapsLink];
    });
    downloadCSV(headers, rows, `trips_${activeDatabase}_${today()}.csv`);
    addToast(`Exported ${filteredTrips.length} trip(s) to CSV.`, 'success', 'Export Complete');
  };

  // Analytics
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

    const getAmount = (t) => t.invoices?.length > 0 ? t.invoices.reduce((s, inv) => s + (inv.amount || 0), 0) : (t.amount || 0);

    if (analyticsPeriod === 'day') {
      for (let i = 13; i >= 0; i--) {
        const d = new Date(refDate); d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const dayTrips = analyticsTrips.filter(t => t.date === key);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        tripCounts.push(dayTrips.length);
        kmTotals.push(dayTrips.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0));
        amountTotals.push(dayTrips.reduce((s, t) => s + getAmount(t), 0));
      }
    } else if (analyticsPeriod === 'week') {
      for (let i = 11; i >= 0; i--) {
        const start = new Date(refDate); start.setDate(start.getDate() - (i * 7) - start.getDay());
        const end = new Date(start); end.setDate(end.getDate() + 6);
        const weekTrips = analyticsTrips.filter(t => t.date >= start.toISOString().split('T')[0] && t.date <= end.toISOString().split('T')[0]);
        labels.push(start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        tripCounts.push(weekTrips.length);
        kmTotals.push(weekTrips.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0));
        amountTotals.push(weekTrips.reduce((s, t) => s + getAmount(t), 0));
      }
    } else if (analyticsPeriod === 'month') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(refYear, (analyticsYear !== 'all' ? 11 : now.getMonth()) - i, 1);
        const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthTrips = analyticsTrips.filter(t => t.date?.startsWith(prefix));
        labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        tripCounts.push(monthTrips.length);
        kmTotals.push(monthTrips.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0));
        amountTotals.push(monthTrips.reduce((s, t) => s + getAmount(t), 0));
      }
    } else if (analyticsPeriod === 'year') {
      const startYear = analyticsYear !== 'all' ? refYear - 4 : now.getFullYear() - 4;
      for (let y = startYear; y <= refYear; y++) {
        const yearTrips = analyticsTrips.filter(t => t.date?.startsWith(String(y)));
        labels.push(String(y));
        tripCounts.push(yearTrips.length);
        kmTotals.push(yearTrips.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0));
        amountTotals.push(yearTrips.reduce((s, t) => s + getAmount(t), 0));
      }
    }
    return { labels, tripCounts, kmTotals, amountTotals };
  }, [analyticsTrips, analyticsPeriod, analyticsYear]);

  const getAmount = (t) => t.invoices?.length > 0 ? t.invoices.reduce((s, inv) => s + (inv.amount || 0), 0) : (t.amount || 0);

  const topDrivers = useMemo(() => {
    const map = {};
    analyticsTrips.forEach(t => {
      if (!t.driver_name) return;
      if (!map[t.driver_name]) map[t.driver_name] = { trips: 0, km: 0 };
      map[t.driver_name].trips++;
      map[t.driver_name].km += parseFloat(t.odometer) || 0;
    });
    return Object.entries(map).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.trips - a.trips).slice(0, 5);
  }, [analyticsTrips]);

  const topDealersByAmount = useMemo(() => {
    const map = {};
    analyticsTrips.forEach(t => {
      if (!t.dealer) return;
      if (!map[t.dealer]) map[t.dealer] = { total: 0, count: 0 };
      map[t.dealer].total += getAmount(t);
      map[t.dealer].count++;
    });
    return Object.entries(map).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.total - a.total);
  }, [analyticsTrips]);

  const topDealersByAverage = useMemo(() => {
    const map = {};
    analyticsTrips.forEach(t => {
      if (!t.dealer) return;
      if (!map[t.dealer]) map[t.dealer] = { total: 0, count: 0 };
      map[t.dealer].total += getAmount(t);
      map[t.dealer].count++;
    });
    return Object.entries(map)
      .map(([name, d]) => ({ name, average: d.count > 0 ? d.total / d.count : 0, ...d }))
      .filter(d => d.count >= 2).sort((a, b) => b.average - a.average);
  }, [analyticsTrips]);

  const driverRevenue = useMemo(() => {
    const map = {};
    analyticsTrips.forEach(t => {
      if (!t.driver_name) return;
      if (!map[t.driver_name]) map[t.driver_name] = { total: 0, trips: 0 };
      map[t.driver_name].total += getAmount(t);
      map[t.driver_name].trips++;
    });
    return Object.entries(map).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.total - a.total);
  }, [analyticsTrips]);

  const totalRevenue = analyticsData.amountTotals.reduce((a, b) => a + b, 0);
  const avgTripValue = analyticsTrips.length > 0 ? totalRevenue / analyticsTrips.length : 0;

  const formatTimeDisplay = (val) => {
    if (!val) return '—';
    const [h, m] = val.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(30px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .ad-root { font-family: 'DM Sans', sans-serif; }

        /* Database Switcher */
        .ad-db-switcher { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; background: #fff; padding: 16px 24px; border-radius: 14px; border: 1px solid #e5e7eb; }
        .ad-db-label { font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.7px; }
        .ad-db-buttons { display: flex; gap: 6px; }
        .ad-db-btn { display: flex; align-items: center; gap: 8px; padding: 9px 18px; border: 1.5px solid #e5e7eb; border-radius: 9px; background: #fff; font-size: 13.5px; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif; }
        .ad-db-btn:hover:not(.active) { border-color: #d1d5db; background: #f9fafb; color: #374151; }
        .ad-db-btn.active { background: #0f1117; color: #fff; border-color: #0f1117; box-shadow: 0 2px 8px rgba(0,0,0,0.18); }
        .ad-db-btn.active .ad-db-badge { background: #f59e0b; color: #0f1117; }
        .ad-db-badge { background: #f3f4f6; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; font-family: 'DM Sans', sans-serif; }
        .ad-db-info { margin-left: auto; font-size: 12px; color: #9ca3af; display: flex; align-items: center; gap: 8px; }

        /* Stats */
        .ad-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .ad-stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 22px 26px; display: flex; align-items: center; gap: 18px; transition: box-shadow 0.2s, transform 0.2s; }
        .ad-stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); transform: translateY(-1px); }
        .ad-stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; }
        .ad-stat-icon.amber   { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .ad-stat-icon.indigo  { background: linear-gradient(135deg, #6366f1, #4f46e5); }
        .ad-stat-icon.emerald { background: linear-gradient(135deg, #10b981, #059669); }
        .ad-stat-icon.rose    { background: linear-gradient(135deg, #f43f5e, #e11d48); }
        .ad-stat-value { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #0f1117; letter-spacing: -0.5px; line-height: 1; margin-bottom: 5px; }
        .ad-stat-label { font-size: 12px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.6px; }

        /* Tabs */
        .ad-tabs { display: flex; gap: 4px; background: #f3f4f6; border-radius: 10px; padding: 4px; width: fit-content; margin-bottom: 20px; }
        .ad-tab { display: flex; align-items: center; gap: 8px; padding: 9px 20px; border-radius: 7px; border: none; background: transparent; color: #6b7280; font-size: 13.5px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.18s; white-space: nowrap; }
        .ad-tab:hover { color: #374151; }
        .ad-tab.active { background: #0f1117; color: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
        .ad-tab-count { background: rgba(245,158,11,0.15); color: #f59e0b; font-size: 11.5px; font-weight: 700; padding: 2px 8px; border-radius: 20px; font-family: 'Syne', sans-serif; }
        .ad-tab.active .ad-tab-count { background: rgba(245,158,11,0.25); }

        /* Card */
        .ad-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
        .ad-card-header { padding: 20px 26px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
        .ad-card-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: #0f1117; letter-spacing: -0.2px; }
        .ad-card-sub { font-size: 13px; color: #9ca3af; margin-top: 3px; }
        .ad-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

        .ad-search-wrap { position: relative; display: flex; align-items: center; }
        .ad-search-icon { position: absolute; left: 11px; color: #9ca3af; pointer-events: none; display: flex; align-items: center; }
        .ad-search { padding: 8px 14px 8px 34px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; color: #111827; background: #f9fafb; outline: none; width: 210px; transition: all 0.18s; }
        .ad-search:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.08); background: #fff; }
        .ad-select, .ad-date-input { padding: 8px 11px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; color: #374151; background: #f9fafb; outline: none; cursor: pointer; transition: border-color 0.18s; }
        .ad-select:focus, .ad-date-input:focus { border-color: #f59e0b; }

        .ad-export-btn { display: flex; align-items: center; gap: 7px; background: #0f1117; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #fff; cursor: pointer; transition: all 0.2s; }
        .ad-export-btn:hover { background: #1f2937; }
        .ad-refresh-btn { display: flex; align-items: center; gap: 7px; background: #f3f4f6; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #4b5563; cursor: pointer; transition: all 0.2s; }
        .ad-refresh-btn:hover { background: #e5e7eb; }
        .ad-clear-btn { display: flex; align-items: center; gap: 6px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #ef4444; cursor: pointer; transition: all 0.2s; }
        .ad-clear-btn:hover { background: #fee2e2; }

        .ad-filter-bar { padding: 12px 26px; background: #fafafa; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .ad-filter-label { font-size: 11.5px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.6px; }
        .ad-filter-tag { display: flex; align-items: center; gap: 5px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); color: #92400e; border-radius: 6px; padding: 4px 10px; font-size: 12.5px; font-weight: 500; }
        .ad-results-count { padding: 10px 26px; background: #f8fafc; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #6b7280; }

        /* Table */
        .ad-table-wrap { overflow-x: auto; }
        .ad-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .ad-table thead tr { background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
        .ad-table th { padding: 13px 20px; text-align: left; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.7px; white-space: nowrap; }
        .ad-table td { padding: 14px 20px; color: #374151; border-bottom: 1px solid #f3f4f6; white-space: nowrap; font-size: 14px; }
        .ad-table tbody tr:last-child td { border-bottom: none; }
        .ad-table tbody tr { transition: background 0.15s; }
        .ad-table tbody tr:hover { background: #fffbf0; }

        .ad-driver-cell { display: flex; align-items: center; gap: 12px; }
        .ad-driver-avatar { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0f1117; flex-shrink: 0; }
        .ad-driver-name { font-weight: 600; color: #111827; font-size: 14px; }
        .ad-driver-user { font-size: 12px; color: #9ca3af; margin-top: 2px; }
        .ad-badge { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px; font-size: 12.5px; font-weight: 500; }
        .ad-badge.license { background: #eff6ff; color: #3b82f6; }

        .ad-invoice-badge { display: inline-block; padding: 3px 8px; background: #fef3c7; color: #92400e; border-radius: 6px; font-size: 12px; font-weight: 600; margin: 2px; }
        .ad-check-badge  { display: inline-block; padding: 3px 8px; background: #d1fae5; color: #065f46; border-radius: 6px; font-size: 12px; font-weight: 600; margin: 2px; }

        .ad-map-link { color: #3b82f6; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 4px 9px; background: #eff6ff; border-radius: 6px; font-size: 12.5px; font-weight: 500; transition: all 0.18s; }
        .ad-map-link:hover { background: #dbeafe; }

        .ad-empty { padding: 70px 20px; text-align: center; color: #9ca3af; font-size: 14.5px; }
        .ad-empty-icon { width: 52px; height: 52px; background: #f3f4f6; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; color: #d1d5db; }
        .ad-table-wrap::-webkit-scrollbar { height: 5px; }
        .ad-table-wrap::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }

        /* Analytics */
        .an-header { padding: 22px 26px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
        .an-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: #0f1117; letter-spacing: -0.2px; }
        .an-sub { font-size: 13px; color: #9ca3af; margin-top: 4px; }
        .an-filters { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .an-period-group { display: flex; gap: 3px; background: #f3f4f6; border-radius: 9px; padding: 3px; }
        .an-period-btn { padding: 7px 16px; border-radius: 7px; border: none; background: transparent; font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.15s; }
        .an-period-btn.active { background: #0f1117; color: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
        .an-period-btn:not(.active):hover { color: #374151; background: #e9eaec; }
        .an-body { padding: 26px; display: flex; flex-direction: column; gap: 24px; }

        .an-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        @media (max-width: 700px) { .an-kpi-grid { grid-template-columns: 1fr 1fr; } }
        .an-kpi { border-radius: 14px; padding: 20px 22px; border: 1px solid #e5e7eb; background: #f8fafc; }
        .an-kpi.accent { background: #0f1117; border-color: #0f1117; }
        .an-kpi-label { font-size: 12px; color: #9ca3af; margin-bottom: 10px; font-weight: 500; }
        .an-kpi.accent .an-kpi-label { color: #6b7280; }
        .an-kpi-val { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #0f1117; letter-spacing: -1px; line-height: 1; }
        .an-kpi.accent .an-kpi-val { color: #f59e0b; }
        .an-kpi-sub { font-size: 12px; color: #10b981; margin-top: 6px; }
        .an-kpi.accent .an-kpi-sub { color: #6b7280; }

        .an-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 900px) { .an-charts { grid-template-columns: 1fr; } }
        .an-chart-card { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 14px; padding: 22px 24px; }
        .an-chart-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #0f1117; margin-bottom: 3px; letter-spacing: -0.2px; }
        .an-chart-sub { font-size: 12px; color: #9ca3af; margin-bottom: 20px; }

        .an-bar-chart { display: flex; align-items: flex-end; gap: 5px; height: 160px; overflow-x: auto; padding-bottom: 2px; }
        .an-bar-chart::-webkit-scrollbar { height: 4px; }
        .an-bar-chart::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
        .an-bar-col { display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 1; min-width: 36px; }
        .an-bar-wrap { width: 100%; display: flex; flex-direction: column; justify-content: flex-end; height: 110px; }
        .an-bar { width: 80%; margin: 0 auto; border-radius: 5px 5px 0 0; transition: height 0.4s ease; min-height: 3px; cursor: pointer; }
        .an-bar:hover { filter: brightness(1.12); }
        .an-bar-label { font-size: 10.5px; color: #9ca3af; white-space: nowrap; }
        .an-bar-val   { font-size: 11px; font-weight: 700; color: #6b7280; font-family: 'Syne', sans-serif; line-height: 1; }

        .an-leaderboard { display: flex; flex-direction: column; gap: 12px; }
        .an-lb-row { display: flex; align-items: center; gap: 10px; }
        .an-lb-rank { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 800; color: #d1d5db; width: 18px; flex-shrink: 0; text-align: center; }
        .an-lb-rank.top { color: #f59e0b; }
        .an-lb-avatar { width: 30px; height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; flex-shrink: 0; }
        .an-lb-avatar.amber  { background: linear-gradient(135deg, #f59e0b, #d97706); color: #0f1117; }
        .an-lb-avatar.indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; }
        .an-lb-name { font-size: 13px; font-weight: 500; color: #111827; width: 100px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .an-lb-bar-wrap { flex: 1; height: 7px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
        .an-lb-bar { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
        .an-lb-bar.amber  { background: linear-gradient(90deg, #f59e0b, #d97706); }
        .an-lb-bar.indigo { background: linear-gradient(90deg, #6366f1, #4f46e5); }
        .an-lb-val { font-size: 13px; font-weight: 700; color: #374151; width: 68px; text-align: right; flex-shrink: 0; font-family: 'Syne', sans-serif; }

        .an-empty { padding: 48px 20px; text-align: center; color: #9ca3af; font-size: 14px; }
      `}</style>

      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="ad-root">

        {/* Database Switcher */}
        <div className="ad-db-switcher">
          <span className="ad-db-label">Year</span>
          <div className="ad-db-buttons">
            <button className={`ad-db-btn${activeDatabase === 'main' ? ' active' : ''}`} onClick={() => setActiveDatabase('main')}>
              2026 <span className="ad-db-badge">{trips.length} trips</span>
            </button>
            <button className={`ad-db-btn${activeDatabase === 'historical' ? ' active' : ''}`} onClick={() => setActiveDatabase('historical')}>
              2025 <span className="ad-db-badge">{historicalTrips.length} trips</span>
            </button>
          </div>
          {loadingHistorical && activeDatabase === 'historical' && (
            <span className="ad-db-info">
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #e5e7eb', borderTopColor: '#f59e0b', animation: 'spin 0.75s linear infinite' }} />
              Loading 2025 data…
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="ad-stats">
          {[
            { icon: <UsersIcon size={22} />, color: 'amber', value: currentDrivers.length, label: 'Total Drivers' },
            { icon: <TruckIcon size={22} />, color: 'indigo', value: currentTrips.length, label: 'Total Trips' },
            { icon: <CalendarIcon size={22} />, color: 'emerald', value: activeDatabase === 'main' ? currentTrips.filter(t => t.date === today()).length : 'N/A', label: 'Trips Today' },
            { icon: <RouteIcon size={22} />, color: 'rose', value: currentTrips.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0).toLocaleString(), label: 'Total km' },
          ].map(({ icon, color, value, label }) => (
            <div key={label} className="ad-stat-card">
              <div className={`ad-stat-icon ${color}`}>{icon}</div>
              <div><div className="ad-stat-value">{value}</div><div className="ad-stat-label">{label}</div></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="ad-tabs">
          <button className={`ad-tab${view === 'drivers' ? ' active' : ''}`} onClick={() => setView('drivers')}>
            <UsersIcon size={15} /> Drivers <span className="ad-tab-count">{currentDrivers.length}</span>
          </button>
          <button className={`ad-tab${view === 'trips' ? ' active' : ''}`} onClick={() => setView('trips')}>
            <TruckIcon size={15} /> All Trips <span className="ad-tab-count">{currentTrips.length}</span>
          </button>
          <button className={`ad-tab${view === 'analytics' ? ' active' : ''}`} onClick={() => setView('analytics')}>
            <ChartIcon size={15} /> Analytics
          </button>
        </div>

        {/* Drivers Tab */}
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
                <button className="ad-refresh-btn" onClick={activeDatabase === 'main' ? fetchTrips : fetchHistoricalData}><RefreshIcon /> Refresh</button>
              </div>
            </div>

            {hasDriverFilters && (
              <>
                <div className="ad-filter-bar">
                  <span className="ad-filter-label">Filters:</span>
                  {driverSearch && <span className="ad-filter-tag"><SearchIcon /> "{driverSearch}"</span>}
                </div>
                <div className="ad-results-count">Showing {filteredDrivers.length} of {currentDrivers.length} drivers</div>
              </>
            )}

            {loadingHistorical && activeDatabase === 'historical'
              ? <LoadingOverlay message="Loading 2025 drivers…" />
              : filteredDrivers.length === 0
                ? <div className="ad-empty"><div className="ad-empty-icon"><UsersIcon /></div>{hasDriverFilters ? 'No drivers match your search.' : 'No drivers in this database.'}</div>
                : (
                  <div className="ad-table-wrap">
                    <table className="ad-table">
                      <thead><tr><th>Driver</th><th>Email</th><th>Phone</th><th>License No.</th></tr></thead>
                      <tbody>
                        {filteredDrivers.map(driver => (
                          <tr key={driver.id}>
                            <td>
                              <div className="ad-driver-cell">
                                <div className="ad-driver-avatar">{driver.full_name?.charAt(0).toUpperCase()}</div>
                                <div>
                                  <div className="ad-driver-name">{driver.full_name}</div>
                                  {driver.username && <div className="ad-driver-user">@{driver.username}</div>}
                                </div>
                              </div>
                            </td>
                            <td>{driver.email || '—'}</td>
                            <td>{driver.phone || '—'}</td>
                            <td><span className="ad-badge license">{driver.license_number || '—'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
            }
          </div>
        )}

        {/* Trips Tab */}
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
                  <option value="">All Drivers</option>
                  {driverNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select className="ad-select" value={filterDealer} onChange={e => setFilterDealer(e.target.value)}>
                  <option value="">All Dealers</option>
                  {dealers.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input className="ad-date-input" type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} title="From date" />
                <input className="ad-date-input" type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} title="To date" />
                {hasTripFilters && <button className="ad-clear-btn" onClick={clearTripFilters}><CloseIcon /> Clear</button>}
                <button className="ad-export-btn" onClick={exportTrips}><ExportIcon /> Export CSV</button>
                <button className="ad-refresh-btn" onClick={activeDatabase === 'main' ? fetchTrips : fetchHistoricalData}><RefreshIcon /> Refresh</button>
              </div>
            </div>

            {hasTripFilters && (
              <>
                <div className="ad-filter-bar">
                  <span className="ad-filter-label">Filters:</span>
                  {tripSearch && <span className="ad-filter-tag"><SearchIcon /> "{tripSearch}"</span>}
                  {filterDriver && <span className="ad-filter-tag"><UsersIcon size={12} /> {filterDriver}</span>}
                  {filterDealer && <span className="ad-filter-tag">{filterDealer}</span>}
                  {filterDateFrom && <span className="ad-filter-tag">From: {filterDateFrom}</span>}
                  {filterDateTo && <span className="ad-filter-tag">To: {filterDateTo}</span>}
                </div>
                <div className="ad-results-count">Showing {filteredTrips.length} of {currentTrips.length} trips</div>
              </>
            )}

            {loadingHistorical && activeDatabase === 'historical'
              ? <LoadingOverlay message="Loading 2025 trips…" />
              : filteredTrips.length === 0
                ? <div className="ad-empty"><div className="ad-empty-icon"><TruckIcon /></div>{hasTripFilters ? 'No trips match your filters.' : 'No trips in this database.'}</div>
                : (
                  <div className="ad-table-wrap">
                    <table className="ad-table">
                      <thead>
                        <tr>
                          <th>Date</th><th>Driver</th><th>Helper</th><th>Dealer</th>
                          <th>Time In</th><th>Time Out</th><th>Odometer</th>
                          <th>Invoices</th><th>Checks</th><th>Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTrips.map(trip => (
                          <tr key={trip.id}>
                            <td><span style={{ fontWeight: 600, color: '#0f1117' }}>{trip.date}</span></td>
                            <td>
                              <div className="ad-driver-cell">
                                <div className="ad-driver-avatar">{trip.driver_name?.charAt(0).toUpperCase()}</div>
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{trip.driver_name}</span>
                              </div>
                            </td>
                            <td>{trip.helper || <span style={{ color: '#d1d5db' }}>—</span>}</td>
                            <td><span style={{ fontWeight: 600 }}>{trip.dealer}</span></td>
                            <td>
                              {trip.time_in
                                ? <span style={{ color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                                    {formatTimeDisplay(trip.time_in)}
                                  </span>
                                : <span style={{ color: '#d1d5db' }}>—</span>}
                            </td>
                            <td>
                              {trip.time_out
                                ? <span style={{ color: '#ef4444', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                                    {formatTimeDisplay(trip.time_out)}
                                  </span>
                                : <span style={{ color: '#d1d5db' }}>—</span>}
                            </td>
                            <td>{trip.odometer ? `${trip.odometer} km` : <span style={{ color: '#d1d5db' }}>—</span>}</td>
                            <td>
                              {trip.invoices?.length > 0
                                ? <div>{trip.invoices.map((inv, i) => <span key={i} className="ad-invoice-badge">{inv.invoice_no}: <strong>₱{Number(inv.amount).toLocaleString()}</strong></span>)}</div>
                                : trip.invoice_no
                                  ? <span className="ad-invoice-badge">{trip.invoice_no}: <strong>₱{trip.amount || 0}</strong></span>
                                  : <span style={{ color: '#d1d5db' }}>—</span>}
                            </td>
                            <td>
                              {trip.checks?.length > 0
                                ? <div>{trip.checks.map((chk, i) => <span key={i} className="ad-check-badge">{chk.check_no}: <strong>₱{Number(chk.amount).toLocaleString()}</strong></span>)}</div>
                                : <span style={{ color: '#d1d5db' }}>—</span>}
                            </td>
                            <td>
                              {trip.location_lat && trip.location_lng
                                ? <a href={`https://www.google.com/maps?q=${trip.location_lat},${trip.location_lng}`} target="_blank" rel="noopener noreferrer" className="ad-map-link">
                                    📍 View Map
                                  </a>
                                : <span style={{ color: '#d1d5db' }}>—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
            }
          </div>
        )}

        {/* Analytics Tab */}
        {view === 'analytics' && (
          <div className="ad-card">
            <div className="an-header">
              <div>
                <div className="an-title">📊 Business Analytics</div>
                <div className="an-sub">
                  {activeDatabase === 'main' ? 'Current Year (2026)' : 'Historical (2025)'}
                  {analyticsDriver ? ` · ${analyticsDriver}` : ' · All Drivers'}
                  {analyticsYear !== 'all' ? ` · ${analyticsYear}` : ' · All Years'}
                </div>
              </div>
              <div className="an-filters">
                <div className="an-period-group">
                  {[['day','Daily'],['week','Weekly'],['month','Monthly'],['year','Yearly']].map(([p, label]) => (
                    <button key={p} className={`an-period-btn${analyticsPeriod === p ? ' active' : ''}`} onClick={() => setAnalyticsPeriod(p)}>{label}</button>
                  ))}
                </div>
                <select className="ad-select" value={analyticsYear} onChange={e => setAnalyticsYear(e.target.value)}>
                  <option value="all">All Years</option>
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select className="ad-select" value={analyticsDriver} onChange={e => setAnalyticsDriver(e.target.value)}>
                  <option value="">All Drivers</option>
                  {driverNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <button className="ad-refresh-btn" onClick={activeDatabase === 'main' ? fetchTrips : fetchHistoricalData}><RefreshIcon /> Refresh</button>
              </div>
            </div>

            <div className="an-body">
              {/* KPI Cards */}
              <div className="an-kpi-grid">
                <div className="an-kpi accent">
                  <div className="an-kpi-label">💰 Total Revenue</div>
                  <div className="an-kpi-val">₱{totalRevenue.toLocaleString()}</div>
                  <div className="an-kpi-sub">{analyticsTrips.length} trips tracked</div>
                </div>
                <div className="an-kpi">
                  <div className="an-kpi-label">📦 Avg Trip Value</div>
                  <div className="an-kpi-val">₱{Math.round(avgTripValue).toLocaleString()}</div>
                  <div className="an-kpi-sub" style={{ color: '#9ca3af' }}>Per delivery average</div>
                </div>
                <div className="an-kpi">
                  <div className="an-kpi-label">🏪 Active Dealers</div>
                  <div className="an-kpi-val">{dealers.length}</div>
                  <div className="an-kpi-sub" style={{ color: '#9ca3af' }}>{analyticsTrips.length} total trips</div>
                </div>
                <div className="an-kpi">
                  <div className="an-kpi-label">🚚 Revenue/Driver</div>
                  <div className="an-kpi-val">₱{driverNames.length > 0 ? Math.round(totalRevenue / driverNames.length).toLocaleString() : 0}</div>
                  <div className="an-kpi-sub" style={{ color: '#9ca3af' }}>Avg across {driverNames.length} drivers</div>
                </div>
              </div>

              {/* Charts */}
              <div className="an-charts">
                {/* Revenue Trend */}
                <div className="an-chart-card">
                  <div className="an-chart-title">📈 Revenue Trend</div>
                  <div className="an-chart-sub">Invoice totals over time</div>
                  <div className="an-bar-chart">
                    {analyticsData.labels.map((label, i) => {
                      const max = Math.max(...analyticsData.amountTotals, 1);
                      const pct = (analyticsData.amountTotals[i] / max) * 100;
                      return (
                        <div key={i} className="an-bar-col">
                          <div className="an-bar-val">{analyticsData.amountTotals[i] > 0 ? `₱${(analyticsData.amountTotals[i]/1000).toFixed(0)}k` : ''}</div>
                          <div className="an-bar-wrap">
                            <div className="an-bar" style={{ height: `${pct}%`, background: 'linear-gradient(180deg, #10b981, #059669)' }} title={`${label}: ₱${analyticsData.amountTotals[i].toLocaleString()}`} />
                          </div>
                          <div className="an-bar-label">{label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Volume Chart */}
                <div className="an-chart-card">
                  <div className="an-chart-title">📊 Trip Volume</div>
                  <div className="an-chart-sub">Number of trips over time</div>
                  <div className="an-bar-chart">
                    {analyticsData.labels.map((label, i) => {
                      const max = Math.max(...analyticsData.tripCounts, 1);
                      const pct = (analyticsData.tripCounts[i] / max) * 100;
                      return (
                        <div key={i} className="an-bar-col">
                          <div className="an-bar-val">{analyticsData.tripCounts[i] || ''}</div>
                          <div className="an-bar-wrap">
                            <div className="an-bar" style={{ height: `${pct}%`, background: 'linear-gradient(180deg, #f59e0b, #d97706)' }} title={`${label}: ${analyticsData.tripCounts[i]} trips`} />
                          </div>
                          <div className="an-bar-label">{label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Leaderboards */}
              <div className="an-charts">
                <div className="an-chart-card">
                  <div className="an-chart-title">🏆 Top Dealers by Revenue</div>
                  <div className="an-chart-sub">Highest grossing dealers</div>
                  {topDealersByAmount.length === 0
                    ? <div className="an-empty">No data available</div>
                    : <div className="an-leaderboard">
                        {topDealersByAmount.slice(0, 5).map((d, i) => (
                          <div key={i} className="an-lb-row">
                            <span className={`an-lb-rank${i === 0 ? ' top' : ''}`}>{i + 1}</span>
                            <div className="an-lb-avatar indigo">{d.name.charAt(0)}</div>
                            <span className="an-lb-name">{d.name}</span>
                            <div className="an-lb-bar-wrap"><div className="an-lb-bar indigo" style={{ width: `${(d.total / (topDealersByAmount[0].total || 1)) * 100}%` }} /></div>
                            <span className="an-lb-val">₱{d.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                  }
                </div>

                <div className="an-chart-card">
                  <div className="an-chart-title">💰 Top Dealers by Avg</div>
                  <div className="an-chart-sub">Highest avg invoice per trip (min 2 trips)</div>
                  {topDealersByAverage.length === 0
                    ? <div className="an-empty">No data available</div>
                    : <div className="an-leaderboard">
                        {topDealersByAverage.slice(0, 5).map((d, i) => (
                          <div key={i} className="an-lb-row">
                            <span className={`an-lb-rank${i === 0 ? ' top' : ''}`}>{i + 1}</span>
                            <div className="an-lb-avatar indigo">{d.name.charAt(0)}</div>
                            <span className="an-lb-name">{d.name}</span>
                            <div className="an-lb-bar-wrap"><div className="an-lb-bar indigo" style={{ width: `${(d.average / (topDealersByAverage[0].average || 1)) * 100}%` }} /></div>
                            <span className="an-lb-val">₱{Math.round(d.average).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                  }
                </div>
              </div>

              {/* Driver Revenue */}
              <div className="an-chart-card">
                <div className="an-chart-title">🚚 Driver Revenue Performance</div>
                <div className="an-chart-sub">Top drivers by total revenue generated</div>
                {driverRevenue.length === 0
                  ? <div className="an-empty">No data available</div>
                  : <div className="an-leaderboard" style={{ marginTop: 16 }}>
                      {driverRevenue.slice(0, 5).map((d, i) => (
                        <div key={i} className="an-lb-row">
                          <span className={`an-lb-rank${i === 0 ? ' top' : ''}`}>{i + 1}</span>
                          <div className="an-lb-avatar amber">{d.name.charAt(0)}</div>
                          <span className="an-lb-name">{d.name}</span>
                          <div className="an-lb-bar-wrap"><div className="an-lb-bar amber" style={{ width: `${(d.total / (driverRevenue[0].total || 1)) * 100}%` }} /></div>
                          <span className="an-lb-val">₱{d.total.toLocaleString()}</span>
                          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 6, flexShrink: 0 }}>({d.trips} trips)</span>
                        </div>
                      ))}
                    </div>
                }
              </div>

              {/* Distribution */}
              <div className="an-charts">
                <div className="an-chart-card">
                  <div className="an-chart-title">📊 Dealer Distribution</div>
                  <div className="an-chart-sub">Revenue share by top dealers</div>
                  <div style={{ paddingTop: 10 }}>
                    {topDealersByAmount.slice(0, 4).map((dealer, i) => {
                      const pct = totalRevenue > 0 ? ((dealer.total / totalRevenue) * 100).toFixed(1) : 0;
                      const colors = ['#f59e0b', '#10b981', '#6366f1', '#f43f5e'];
                      return (
                        <div key={i} style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{dealer.name}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f1117', fontFamily: "'Syne', sans-serif" }}>{pct}%</span>
                          </div>
                          <div style={{ height: 7, background: '#e5e7eb', borderRadius: 4 }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: colors[i], borderRadius: 4, transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="an-chart-card">
                  <div className="an-chart-title">📈 Period Comparison</div>
                  <div className="an-chart-sub">Latest vs previous period revenue</div>
                  <div style={{ paddingTop: 10 }}>
                    {analyticsData.labels.slice(-3).map((label, i) => {
                      const idx = analyticsData.labels.length - 3 + i;
                      const cur = analyticsData.amountTotals[idx] || 0;
                      const prev = analyticsData.amountTotals[idx - 1] || 0;
                      const growth = prev > 0 ? ((cur - prev) / prev * 100).toFixed(1) : null;
                      return (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
                          <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f1117', fontFamily: "'Syne', sans-serif" }}>₱{cur.toLocaleString()}</div>
                            {growth !== null && (
                              <div style={{ fontSize: 11.5, color: growth > 0 ? '#10b981' : growth < 0 ? '#ef4444' : '#9ca3af', fontWeight: 600 }}>
                                {growth > 0 ? '▲' : growth < 0 ? '▼' : '—'} {Math.abs(growth)}%
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* Icons */
function UsersIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function TruckIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>; }
function CalendarIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function RouteIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>; }
function RefreshIcon({ size = 14 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>; }
function SearchIcon({ size = 14 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function ExportIcon({ size = 15 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>; }
function CloseIcon({ size = 13 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function ChartIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>; }

export default AdminDashboard;