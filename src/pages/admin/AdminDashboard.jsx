import { useState, useMemo, useEffect } from 'react';
import API_URL from '../../config'; // ✅ IMPORT CONFIG

function AdminDashboard({ drivers, trips, fetchTrips }) {
  const [view, setView] = useState('drivers');
  const [activeDatabase, setActiveDatabase] = useState('main'); // 'main' or 'historical'
  
  // Historical 2025 data state
  const [historicalTrips, setHistoricalTrips] = useState([]);
  const [historicalDrivers, setHistoricalDrivers] = useState([]);
  const [historicalStats, setHistoricalStats] = useState(null);
  const [loadingHistorical, setLoadingHistorical] = useState(false);

  // Fetch historical data when needed
  useEffect(() => {
    if (activeDatabase === 'historical') {
      fetchHistoricalData();
    }
  }, [activeDatabase]);

  const fetchHistoricalData = async () => {
    setLoadingHistorical(true);
    try {
      // ✅ GAMITIN ANG API_URL
      const [tripsRes, driversRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/2025/trips`, { credentials: 'include' }),
        fetch(`${API_URL}/api/2025/drivers`, { credentials: 'include' }),
        fetch(`${API_URL}/api/2025/stats`, { credentials: 'include' })
      ]);

      const tripsData = await tripsRes.json();
      const driversData = await driversRes.json();
      const statsData = await statsRes.json();

      setHistoricalTrips(tripsData.trips || []);
      setHistoricalDrivers(driversData.drivers || []);
      setHistoricalStats(statsData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoadingHistorical(false);
    }
  };

  // Get current data based on selected database
  const currentTrips = activeDatabase === 'main' ? trips : historicalTrips;
  const currentDrivers = activeDatabase === 'main' ? drivers : historicalDrivers;

  // Search and filter states
  const [driverSearch, setDriverSearch] = useState('');
  const [tripSearch, setTripSearch] = useState('');
  const [filterDriver, setFilterDriver] = useState('');
  const [filterDealer, setFilterDealer] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Analytics states
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');
  const [analyticsDriver, setAnalyticsDriver] = useState('');
  const [analyticsYear, setAnalyticsYear] = useState('all');

  // Derived data
  const driverNames = useMemo(() => [...new Set(currentTrips.map(t => t.driver_name).filter(Boolean))], [currentTrips]);
  const dealers = useMemo(() => [...new Set(currentTrips.map(t => t.dealer).filter(Boolean))], [currentTrips]);

  const availableYears = useMemo(() => {
    const years = [...new Set(currentTrips.map(t => t.date?.slice(0, 4)).filter(Boolean))].sort((a, b) => b - a);
    return years;
  }, [currentTrips]);

  // Filtered data
  const filteredDrivers = useMemo(() => {
    const q = driverSearch.toLowerCase();
    if (!q) return currentDrivers;
    return currentDrivers.filter(d => 
      [d.full_name, d.username, d.email, d.phone, d.license_number]
        .some(v => v?.toLowerCase().includes(q))
    );
  }, [currentDrivers, driverSearch]);

  const filteredTrips = useMemo(() => {
    return currentTrips.filter(t => {
      const q = tripSearch.toLowerCase();
      const matchSearch = !q || [t.driver_name, t.helper, t.dealer, t.invoice_no, t.date]
        .some(v => v?.toLowerCase().includes(q));
      const matchDriver = !filterDriver || t.driver_name === filterDriver;
      const matchDealer = !filterDealer || t.dealer === filterDealer;
      const matchFrom = !filterDateFrom || t.date >= filterDateFrom;
      const matchTo = !filterDateTo || t.date <= filterDateTo;
      return matchSearch && matchDriver && matchDealer && matchFrom && matchTo;
    });
  }, [currentTrips, tripSearch, filterDriver, filterDealer, filterDateFrom, filterDateTo]);

  const hasDriverFilters = !!driverSearch;
  const hasTripFilters = tripSearch || filterDriver || filterDealer || filterDateFrom || filterDateTo;

  // Clear filters
  const clearDriverFilters = () => setDriverSearch('');
  const clearTripFilters = () => { 
    setTripSearch(''); 
    setFilterDriver(''); 
    setFilterDealer(''); 
    setFilterDateFrom(''); 
    setFilterDateTo(''); 
  };

  // Export functions
  const exportDrivers = () => {
    const headers = ['Full Name', 'Username', 'Email', 'Phone', 'License No.'];
    const rows = filteredDrivers.map(d => [d.full_name, d.username, d.email, d.phone, d.license_number]);
    downloadCSV(headers, rows, `drivers_${activeDatabase}_${today()}.csv`);
  };

  const exportTrips = () => {
    const headers = ['Date', 'Driver', 'Helper', 'Dealer', 'Time In', 'Time Out', 'Odometer (km)', 'Invoice No.'];
    const rows = filteredTrips.map(t => [t.date, t.driver_name, t.helper, t.dealer, t.time_in, t.time_out, t.odometer, t.invoice_no]);
    downloadCSV(headers, rows, `trips_${activeDatabase}_${today()}.csv`);
  };

  const downloadCSV = (headers, rows, filename) => {
    const csv = [headers, ...rows].map(r => 
      r.map(c => `"${(c ?? '').toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const today = () => new Date().toISOString().split('T')[0];

  // Analytics
  const analyticsTrips = useMemo(() => {
    let filtered = analyticsDriver ? currentTrips.filter(t => t.driver_name === analyticsDriver) : currentTrips;
    if (analyticsYear !== 'all') filtered = filtered.filter(t => t.date?.startsWith(analyticsYear));
    return filtered;
  }, [currentTrips, analyticsDriver, analyticsYear]);

  const analyticsData = useMemo(() => {
    const now = new Date();
    const refYear = analyticsYear !== 'all' ? parseInt(analyticsYear) : now.getFullYear();
    const refDate = analyticsYear !== 'all' ? new Date(refYear, 11, 31) : now;
    const labels = [], tripCounts = [], kmTotals = [];

    if (analyticsPeriod === 'day') {
      for (let i = 13; i >= 0; i--) {
        const d = new Date(refDate); d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dayTrips = analyticsTrips.filter(t => t.date === key);
        labels.push(label); tripCounts.push(dayTrips.length);
        kmTotals.push(dayTrips.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0));
      }
    } else if (analyticsPeriod === 'week') {
      for (let i = 11; i >= 0; i--) {
        const start = new Date(refDate); start.setDate(start.getDate() - (i * 7) - start.getDay());
        const end = new Date(start); end.setDate(end.getDate() + 6);
        const startKey = start.toISOString().split('T')[0];
        const endKey = end.toISOString().split('T')[0];
        const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const weekTrips = analyticsTrips.filter(t => t.date >= startKey && t.date <= endKey);
        labels.push(label); tripCounts.push(weekTrips.length);
        kmTotals.push(weekTrips.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0));
      }
    } else if (analyticsPeriod === 'month') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(refYear, (analyticsYear !== 'all' ? 11 : now.getMonth()) - i, 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const prefix = `${year}-${month}`;
        const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        const monthTrips = analyticsTrips.filter(t => t.date?.startsWith(prefix));
        labels.push(label); tripCounts.push(monthTrips.length);
        kmTotals.push(monthTrips.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0));
      }
    } else if (analyticsPeriod === 'year') {
      const startYear = analyticsYear !== 'all' ? refYear - 4 : now.getFullYear() - 4;
      for (let y = startYear; y <= (analyticsYear !== 'all' ? refYear : now.getFullYear()); y++) {
        const yearTrips = analyticsTrips.filter(t => t.date?.startsWith(String(y)));
        labels.push(String(y)); tripCounts.push(yearTrips.length);
        kmTotals.push(yearTrips.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0));
      }
    }

    return { labels, tripCounts, kmTotals };
  }, [analyticsTrips, analyticsPeriod, analyticsYear]);

  // Top drivers and dealers
  const topDrivers = useMemo(() => {
    const map = {};
    analyticsTrips.forEach(t => {
      if (!t.driver_name) return;
      if (!map[t.driver_name]) map[t.driver_name] = { trips: 0, km: 0 };
      map[t.driver_name].trips++;
      map[t.driver_name].km += parseFloat(t.odometer) || 0;
    });
    return Object.entries(map).map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.trips - a.trips).slice(0, 5);
  }, [analyticsTrips]);

  const topDealers = useMemo(() => {
    const map = {};
    analyticsTrips.forEach(t => {
      if (!t.dealer) return;
      if (!map[t.dealer]) map[t.dealer] = 0;
      map[t.dealer]++;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 5);
  }, [analyticsTrips]);

  const maxTrips = Math.max(...analyticsData.tripCounts, 1);
  const maxKm = Math.max(...analyticsData.kmTotals, 1);
  const maxDriverTrips = Math.max(...topDrivers.map(d => d.trips), 1);
  const maxDealerCount = Math.max(...topDealers.map(d => d.count), 1);
  const totalAnalyticsTrips = analyticsTrips.length;
  const totalAnalyticsKm = analyticsTrips.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0);
  const avgKmPerTrip = totalAnalyticsTrips ? (totalAnalyticsKm / totalAnalyticsTrips).toFixed(1) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .ad-root { font-family: 'DM Sans', sans-serif; }

        /* Database Switcher */
        .ad-db-switcher {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          background: #fff;
          padding: 16px 24px;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
        }
        .ad-db-label {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .ad-db-buttons {
          display: flex;
          gap: 8px;
        }
        .ad-db-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          font-size: 13px;
          font-weight: 500;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ad-db-btn.active {
          background: #0f1117;
          color: #fff;
          border-color: #0f1117;
        }
        .ad-db-btn.active .ad-db-badge {
          background: #f59e0b;
          color: #0f1117;
        }
        .ad-db-badge {
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        .ad-db-info {
          margin-left: auto;
          font-size: 12px;
          color: #9ca3af;
        }

        /* Stats */
        .ad-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .ad-stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 22px 26px; display: flex; align-items: center; gap: 18px; }
        .ad-stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; }
        .ad-stat-icon.amber   { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .ad-stat-icon.indigo  { background: linear-gradient(135deg, #6366f1, #4f46e5); }
        .ad-stat-icon.emerald { background: linear-gradient(135deg, #10b981, #059669); }
        .ad-stat-icon.rose    { background: linear-gradient(135deg, #f43f5e, #e11d48); }
        .ad-stat-value { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #0f1117; letter-spacing: -0.5px; line-height: 1; margin-bottom: 5px; }
        .ad-stat-label { font-size: 12.5px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.6px; }

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
        .ad-card-sub { font-size: 13.5px; color: #9ca3af; margin-top: 3px; }
        .ad-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

        .ad-search-wrap { position: relative; display: flex; align-items: center; }
        .ad-search-icon { position: absolute; left: 11px; color: #9ca3af; pointer-events: none; display: flex; align-items: center; }
        .ad-search { padding: 8px 14px 8px 34px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; color: #111827; background: #f9fafb; outline: none; width: 210px; transition: border-color 0.18s, box-shadow 0.18s; }
        .ad-search:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.08); background: #fff; }
        .ad-select, .ad-date-input { padding: 8px 11px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; color: #374151; background: #f9fafb; outline: none; cursor: pointer; transition: border-color 0.18s; }
        .ad-select:focus, .ad-date-input:focus { border-color: #f59e0b; }

        .ad-export-btn { display: flex; align-items: center; gap: 7px; background: #0f1117; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #fff; cursor: pointer; transition: background 0.2s; }
        .ad-export-btn:hover { background: #1f2937; }
        .ad-refresh-btn { display: flex; align-items: center; gap: 7px; background: #f3f4f6; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #4b5563; cursor: pointer; transition: background 0.2s; }
        .ad-refresh-btn:hover { background: #e5e7eb; }
        .ad-clear-btn { display: flex; align-items: center; gap: 6px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #ef4444; cursor: pointer; transition: background 0.2s; }
        .ad-clear-btn:hover { background: #fee2e2; }

        .ad-filter-bar { padding: 12px 26px; background: #fafafa; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .ad-filter-label { font-size: 11.5px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.6px; }
        .ad-filter-tag { display: flex; align-items: center; gap: 5px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); color: #92400e; border-radius: 6px; padding: 4px 10px; font-size: 12.5px; font-weight: 500; }
        .ad-results-count { padding: 10px 26px; background: #f8fafc; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #6b7280; }

        /* Table */
        .ad-table-wrap { overflow-x: auto; }
        .ad-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .ad-table thead tr { background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
        .ad-table th { padding: 13px 22px; text-align: left; font-size: 11.5px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.7px; white-space: nowrap; }
        .ad-table td { padding: 15px 22px; color: #374151; border-bottom: 1px solid #f3f4f6; white-space: nowrap; font-size: 14px; }
        .ad-table tbody tr:last-child td { border-bottom: none; }
        .ad-table tbody tr { transition: background 0.15s; }
        .ad-table tbody tr:hover { background: #fafafa; }

        .ad-driver-cell { display: flex; align-items: center; gap: 12px; }
        .ad-driver-avatar { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0f1117; flex-shrink: 0; }
        .ad-driver-name { font-weight: 600; color: #111827; font-size: 14px; }
        .ad-driver-user { font-size: 12.5px; color: #9ca3af; margin-top: 2px; }
        .ad-badge { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px; font-size: 12.5px; font-weight: 500; }
        .ad-badge.license { background: #eff6ff; color: #3b82f6; }
        .ad-empty { padding: 70px 20px; text-align: center; color: #9ca3af; font-size: 14.5px; }
        .ad-empty-icon { width: 52px; height: 52px; background: #f3f4f6; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; color: #d1d5db; }
        .ad-table-wrap::-webkit-scrollbar { height: 5px; }
        .ad-table-wrap::-webkit-scrollbar-track { background: transparent; }
        .ad-table-wrap::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }

        /* Analytics */
        .an-header { padding: 22px 26px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
        .an-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: #0f1117; letter-spacing: -0.2px; }
        .an-sub { font-size: 13.5px; color: #9ca3af; margin-top: 4px; line-height: 1.5; }
        .an-filters { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

        .an-period-group { display: flex; gap: 3px; background: #f3f4f6; border-radius: 9px; padding: 3px; }
        .an-period-btn { padding: 7px 16px; border-radius: 7px; border: none; background: transparent; font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .an-period-btn.active { background: #0f1117; color: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
        .an-period-btn:not(.active):hover { color: #374151; background: #e9eaec; }

        .an-body { padding: 26px; display: flex; flex-direction: column; gap: 26px; }

        /* Summary cards */
        .an-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 700px) { .an-summary { grid-template-columns: 1fr; } }
        .an-summary-card { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px 24px; }
        .an-summary-val { font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800; color: #0f1117; letter-spacing: -1px; line-height: 1; margin-bottom: 6px; }
        .an-summary-label { font-size: 12px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.7px; }
        .an-summary-card.accent { background: #0f1117; border-color: #0f1117; }
        .an-summary-card.accent .an-summary-val { color: #f59e0b; }
        .an-summary-card.accent .an-summary-label { color: #6b7280; }

        /* Charts grid */
        .an-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 900px) { .an-charts { grid-template-columns: 1fr; } }

        .an-chart-card { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 14px; padding: 22px 24px; }
        .an-chart-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #0f1117; margin-bottom: 4px; letter-spacing: -0.2px; }
        .an-chart-sub { font-size: 12.5px; color: #9ca3af; margin-bottom: 20px; }

        /* Bar chart */
        .an-bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 180px; overflow-x: auto; padding-bottom: 2px; }
        .an-bar-chart::-webkit-scrollbar { height: 4px; }
        .an-bar-chart::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
        .an-bar-col { display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 1; min-width: 36px; }
        .an-bar-wrap { width: 100%; display: flex; flex-direction: column; justify-content: flex-end; height: 130px; }
        .an-bar { width: 100%; border-radius: 6px 6px 0 0; transition: height 0.4s ease; min-height: 3px; cursor: pointer; }
        .an-bar:hover { filter: brightness(1.1); }
        .an-bar.trips { background: linear-gradient(180deg, #f59e0b, #d97706); }
        .an-bar.km    { background: linear-gradient(180deg, #6366f1, #4f46e5); }
        .an-bar-label { font-size: 11px; color: #9ca3af; white-space: nowrap; font-family: 'DM Sans', sans-serif; }
        .an-bar-val   { font-size: 11.5px; font-weight: 600; color: #374151; font-family: 'Syne', sans-serif; line-height: 1; }

        /* Leaderboard */
        .an-leaderboard { display: flex; flex-direction: column; gap: 14px; }
        .an-lb-row { display: flex; align-items: center; gap: 12px; }
        .an-lb-rank { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 800; color: #d1d5db; width: 18px; flex-shrink: 0; text-align: center; }
        .an-lb-rank.top { color: #f59e0b; }
        .an-lb-avatar { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; color: #0f1117; flex-shrink: 0; }
        .an-lb-avatar.indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; }
        .an-lb-name { font-size: 13.5px; font-weight: 500; color: #111827; width: 110px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .an-lb-bar-wrap { flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
        .an-lb-bar { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
        .an-lb-bar.amber  { background: linear-gradient(90deg, #f59e0b, #d97706); }
        .an-lb-bar.indigo { background: linear-gradient(90deg, #6366f1, #4f46e5); }
        .an-lb-val { font-size: 13px; font-weight: 700; color: #374151; width: 64px; text-align: right; flex-shrink: 0; font-family: 'Syne', sans-serif; }

        .an-empty { padding: 48px 20px; text-align: center; color: #9ca3af; font-size: 14px; }
        .an-empty-icon { width: 48px; height: 48px; background: #f0f0f0; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: #d1d5db; }
      `}</style>

      <div className="ad-root">
        {/* Database Switcher */}
        <div className="ad-db-switcher">
          <span className="ad-db-label">Year:</span>
          <div className="ad-db-buttons">
            <button 
              className={`ad-db-btn ${activeDatabase === 'main' ? 'active' : ''}`}
              onClick={() => setActiveDatabase('main')}
            >
              2026
              <span className="ad-db-badge">{trips.length} trips</span>
            </button>
            <button 
              className={`ad-db-btn ${activeDatabase === 'historical' ? 'active' : ''}`}
              onClick={() => setActiveDatabase('historical')}
            >
              2025
              <span className="ad-db-badge">{historicalTrips.length} trips</span>
            </button>
          </div>
          {loadingHistorical && activeDatabase === 'historical' && (
            <span className="ad-db-info">Loading historical data...</span>
          )}
        </div>

        {/* Stats based on selected database */}
        <div className="ad-stats">
          <div className="ad-stat-card">
            <div className="ad-stat-icon amber"><UsersIcon size={22} /></div>
            <div>
              <div className="ad-stat-value">{currentDrivers.length}</div>
              <div className="ad-stat-label">Total Drivers</div>
            </div>
          </div>
          <div className="ad-stat-card">
            <div className="ad-stat-icon indigo"><TruckIcon size={22} /></div>
            <div>
              <div className="ad-stat-value">{currentTrips.length}</div>
              <div className="ad-stat-label">Total Trips</div>
            </div>
          </div>
          <div className="ad-stat-card">
            <div className="ad-stat-icon emerald"><CalendarIcon size={22} /></div>
            <div>
              <div className="ad-stat-value">
                {activeDatabase === 'main' 
                  ? currentTrips.filter(t => t.date === today()).length 
                  : 'N/A'}
              </div>
              <div className="ad-stat-label">Trips Today</div>
            </div>
          </div>
          <div className="ad-stat-card">
            <div className="ad-stat-icon rose"><RouteIcon size={22} /></div>
            <div>
              <div className="ad-stat-value">
                {currentTrips.reduce((s, t) => s + (parseFloat(t.odometer) || 0), 0).toLocaleString()}
              </div>
              <div className="ad-stat-label">Total km</div>
            </div>
          </div>
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

        {/* Drivers Table */}
        {view === 'drivers' && (
          <div className="ad-card">
            <div className="ad-card-header">
              <div>
                <div className="ad-card-title">Registered Drivers</div>
                <div className="ad-card-sub">
                  {activeDatabase === 'main' ? 'Current database' : 'Historical 2025 database'} · {currentDrivers.length} driver{currentDrivers.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="ad-actions">
                <div className="ad-search-wrap">
                  <span className="ad-search-icon"><SearchIcon /></span>
                  <input className="ad-search" type="text" placeholder="Search drivers..." value={driverSearch} onChange={e => setDriverSearch(e.target.value)} />
                </div>
                {hasDriverFilters && <button className="ad-clear-btn" onClick={clearDriverFilters}><CloseIcon /> Clear</button>}
                <button className="ad-export-btn" onClick={exportDrivers}><ExportIcon /> Export CSV</button>
                <button className="ad-refresh-btn" onClick={activeDatabase === 'main' ? fetchTrips : fetchHistoricalData}>
                  <RefreshIcon /> Refresh
                </button>
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
            {filteredDrivers.length === 0 ? (
              <div className="ad-empty">
                <div className="ad-empty-icon"><UsersIcon /></div>
                {hasDriverFilters ? 'No drivers match your search.' : 'No drivers in this database.'}
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* Trips Table */}
        {view === 'trips' && (
          <div className="ad-card">
            <div className="ad-card-header">
              <div>
                <div className="ad-card-title">All Trip Records</div>
                <div className="ad-card-sub">
                  {activeDatabase === 'main' ? 'Current database' : 'Historical 2025 database'} · {currentTrips.length} trip{currentTrips.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="ad-actions">
                <div className="ad-search-wrap">
                  <span className="ad-search-icon"><SearchIcon /></span>
                  <input className="ad-search" type="text" placeholder="Search trips..." value={tripSearch} onChange={e => setTripSearch(e.target.value)} />
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
                <button className="ad-refresh-btn" onClick={activeDatabase === 'main' ? fetchTrips : fetchHistoricalData}>
                  <RefreshIcon /> Refresh
                </button>
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
            {filteredTrips.length === 0 ? (
              <div className="ad-empty">
                <div className="ad-empty-icon"><TruckIcon /></div>
                {hasTripFilters ? 'No trips match your filters.' : 'No trips in this database.'}
              </div>
            ) : (
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr><th>Date</th><th>Driver</th><th>Helper</th><th>Dealer</th><th>Time In</th><th>Time Out</th><th>Odometer</th><th>Invoice</th></tr>
                  </thead>
                  <tbody>
                    {filteredTrips.map(trip => (
                      <tr key={trip.id}>
                        <td>{trip.date}</td>
                        <td>
                          <div className="ad-driver-cell">
                            <div className="ad-driver-avatar">{trip.driver_name?.charAt(0).toUpperCase()}</div>
                            <span style={{ fontSize: 14, fontWeight: 500 }}>{trip.driver_name}</span>
                          </div>
                        </td>
                        <td>{trip.helper || '—'}</td>
                        <td>{trip.dealer}</td>
                        <td>{trip.time_in || '—'}</td>
                        <td>{trip.time_out || '—'}</td>
                        <td>{trip.odometer ? `${trip.odometer} km` : '—'}</td>
                        <td>{trip.invoice_no || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {view === 'analytics' && (
          <div className="ad-card">
            <div className="an-header">
              <div>
                <div className="an-title">Analytics Overview</div>
                <div className="an-sub">
                  {activeDatabase === 'main' ? 'Current database' : 'Historical 2025 database'} · 
                  {analyticsDriver ? ` Driver: ${analyticsDriver}` : ' All drivers'}{' · '}
                  {analyticsYear !== 'all' ? ` Year: ${analyticsYear}` : ' All years'}{' · '}
                  {analyticsPeriod === 'day' ? 'Last 14 days' : analyticsPeriod === 'week' ? 'Last 12 weeks' : analyticsPeriod === 'month' ? 'Last 12 months' : 'Last 5 years'}
                </div>
              </div>
              <div className="an-filters">
                <div className="an-period-group">
                  {['day','week','month','year'].map(p => (
                    <button key={p} className={`an-period-btn${analyticsPeriod === p ? ' active' : ''}`} onClick={() => setAnalyticsPeriod(p)}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
                <select
                  className="ad-select"
                  value={analyticsYear}
                  onChange={e => setAnalyticsYear(e.target.value)}
                  style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600 }}
                >
                  <option value="all">All Years</option>
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select className="ad-select" value={analyticsDriver} onChange={e => setAnalyticsDriver(e.target.value)}>
                  <option value="">All Drivers</option>
                  {driverNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <button className="ad-refresh-btn" onClick={activeDatabase === 'main' ? fetchTrips : fetchHistoricalData}>
                  <RefreshIcon /> Refresh
                </button>
              </div>
            </div>

            <div className="an-body">
              {/* Summary */}
              <div className="an-summary">
                <div className="an-summary-card accent">
                  <div className="an-summary-val">{totalAnalyticsTrips}</div>
                  <div className="an-summary-label">Total Trips</div>
                </div>
                <div className="an-summary-card">
                  <div className="an-summary-val">{totalAnalyticsKm.toLocaleString()}</div>
                  <div className="an-summary-label">Total km</div>
                </div>
                <div className="an-summary-card">
                  <div className="an-summary-val">{avgKmPerTrip}</div>
                  <div className="an-summary-label">Avg km / Trip</div>
                </div>
              </div>

              {/* Charts */}
              <div className="an-charts">
                {/* Trips bar chart */}
                <div className="an-chart-card">
                  <div className="an-chart-title">Trips per {analyticsPeriod.charAt(0).toUpperCase() + analyticsPeriod.slice(1)}</div>
                  <div className="an-chart-sub">Number of trips logged over time</div>
                  {analyticsData.tripCounts.every(v => v === 0) ? (
                    <div className="an-empty"><div className="an-empty-icon"><ChartIcon /></div>No trip data for this period.</div>
                  ) : (
                    <div className="an-bar-chart">
                      {analyticsData.labels.map((label, i) => (
                        <div className="an-bar-col" key={i}>
                          <div className="an-bar-val">{analyticsData.tripCounts[i] > 0 ? analyticsData.tripCounts[i] : ''}</div>
                          <div className="an-bar-wrap">
                            <div className="an-bar trips" style={{ height: `${(analyticsData.tripCounts[i] / maxTrips) * 100}%` }} title={`${label}: ${analyticsData.tripCounts[i]} trips`} />
                          </div>
                          <div className="an-bar-label">{label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* KM bar chart */}
                <div className="an-chart-card">
                  <div className="an-chart-title">Kilometers per {analyticsPeriod.charAt(0).toUpperCase() + analyticsPeriod.slice(1)}</div>
                  <div className="an-chart-sub">Total odometer distance over time</div>
                  {analyticsData.kmTotals.every(v => v === 0) ? (
                    <div className="an-empty"><div className="an-empty-icon"><RouteIcon /></div>No km data for this period.</div>
                  ) : (
                    <div className="an-bar-chart">
                      {analyticsData.labels.map((label, i) => (
                        <div className="an-bar-col" key={i}>
                          <div className="an-bar-val">{analyticsData.kmTotals[i] > 0 ? (analyticsData.kmTotals[i] > 999 ? `${(analyticsData.kmTotals[i]/1000).toFixed(1)}k` : analyticsData.kmTotals[i]) : ''}</div>
                          <div className="an-bar-wrap">
                            <div className="an-bar km" style={{ height: `${(analyticsData.kmTotals[i] / maxKm) * 100}%` }} title={`${label}: ${analyticsData.kmTotals[i]} km`} />
                          </div>
                          <div className="an-bar-label">{label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Drivers */}
                <div className="an-chart-card">
                  <div className="an-chart-title">Top Drivers by Trips</div>
                  <div className="an-chart-sub">Most active drivers in selected period</div>
                  {topDrivers.length === 0 ? (
                    <div className="an-empty"><div className="an-empty-icon"><UsersIcon /></div>No driver data available.</div>
                  ) : (
                    <div className="an-leaderboard">
                      {topDrivers.map((d, i) => (
                        <div className="an-lb-row" key={d.name}>
                          <span className={`an-lb-rank${i === 0 ? ' top' : ''}`}>{i + 1}</span>
                          <div className="an-lb-avatar">{d.name.charAt(0).toUpperCase()}</div>
                          <span className="an-lb-name" title={d.name}>{d.name}</span>
                          <div className="an-lb-bar-wrap">
                            <div className="an-lb-bar amber" style={{ width: `${(d.trips / maxDriverTrips) * 100}%` }} />
                          </div>
                          <span className="an-lb-val">{d.trips} trips</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Dealers */}
                <div className="an-chart-card">
                  <div className="an-chart-title">Top Dealers</div>
                  <div className="an-chart-sub">Most frequently served dealers</div>
                  {topDealers.length === 0 ? (
                    <div className="an-empty"><div className="an-empty-icon"><TruckIcon /></div>No dealer data available.</div>
                  ) : (
                    <div className="an-leaderboard">
                      {topDealers.map((d, i) => (
                        <div className="an-lb-row" key={d.name}>
                          <span className={`an-lb-rank${i === 0 ? ' top' : ''}`}>{i + 1}</span>
                          <div className="an-lb-avatar indigo">{d.name.charAt(0).toUpperCase()}</div>
                          <span className="an-lb-name" title={d.name}>{d.name}</span>
                          <div className="an-lb-bar-wrap">
                            <div className="an-lb-bar indigo" style={{ width: `${(d.count / maxDealerCount) * 100}%` }} />
                          </div>
                          <span className="an-lb-val">{d.count} trips</span>
                        </div>
                      ))}
                    </div>
                  )}
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