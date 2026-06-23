import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import api from '../api/axios';
import { extractData, getStatusStyle, formatDate, formatTime, getApptDate, getApptTime } from '../utils/helpers';

// ── Stat Card ─────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, sub }) => (
  <div style={{ ...s.statCard, borderTop: `3px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={s.statLabel}>{label}</div>
        <div style={{ ...s.statValue, color }}>{value}</div>
        {sub && <div style={s.statSub}>{sub}</div>}
      </div>
      <div style={{ ...s.statIcon, background: color + '18', color }}>
        {icon}
      </div>
    </div>
  </div>
);

// ── Helpers ───────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0];

const getWeekStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

const getMonthStart = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const buildChartData = (appointments) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const count = appointments.filter((a) => {
      const ad = getApptDate(a);
      return ad && ad.startsWith(dateStr);
    }).length;
    days.push({ date: label, Appointments: count });
  }
  return days;
};

// ── Dashboard ─────────────────────────────────────────────
const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [barbers,      setBarbers]      = useState([]);
  const [services,     setServices]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [apptRes, barbRes, svcRes] = await Promise.all([
        api.get('/api/admin/appointments'),
        api.get('/api/admin/barbers'),
        api.get('/api/admin/services'),
      ]);
      setAppointments(extractData(apptRes));
      setBarbers(extractData(barbRes));
      setServices(extractData(svcRes));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Computed stats
  const today     = todayStr();
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();

  const todayAppts = appointments.filter((a) => {
    const d = getApptDate(a);
    return d && d.startsWith(today);
  });

  const weekAppts = appointments.filter((a) => {
    const d = new Date(getApptDate(a));
    return !isNaN(d) && d >= weekStart;
  });

  const monthAppts = appointments.filter((a) => {
    const d = new Date(getApptDate(a));
    return !isNaN(d) && d >= monthStart;
  });

  const upcomingAppts = appointments.filter((a) => {
    const d = new Date(getApptDate(a));
    const isUpcoming = !isNaN(d) && d >= new Date(today);
    const status = a.status;
    return isUpcoming && status !== 'cancelled' && status !== 'no_show';
  });

  const recentAppts = [...appointments]
    .sort((a, b) => new Date(getApptDate(b)) - new Date(getApptDate(a)))
    .slice(0, 8);

  const chartData = buildChartData(appointments);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  return (
    <div>
      {/* ── Stats ─────────────────────────────── */}
      <div style={s.statsGrid}>
        <StatCard
          label="Today's Appointments"
          value={todayAppts.length}
          icon="📅"
          color="#4299e1"
          sub={`${todayAppts.filter(a => a.status === 'confirmed').length} confirmed`}
        />
        <StatCard
          label="This Week"
          value={weekAppts.length}
          icon="📆"
          color="#9f7aea"
          sub={`${weekAppts.filter(a => a.status === 'completed').length} completed`}
        />
        <StatCard
          label="This Month"
          value={monthAppts.length}
          icon="🗓"
          color="#48bb78"
          sub={`${monthAppts.filter(a => a.status === 'completed').length} completed`}
        />
        <StatCard
          label="Upcoming"
          value={upcomingAppts.length}
          icon="⏰"
          color="#f6ad55"
          sub="not cancelled / no-show"
        />
        <StatCard
          label="Active Barbers"
          value={barbers.filter(b => b.is_active || b.is_active === undefined).length}
          icon="✂"
          color="#38b2ac"
          sub={`${barbers.length} total`}
        />
        <StatCard
          label="Services"
          value={services.filter(sv => sv.is_active || sv.is_active === undefined).length}
          icon="💈"
          color="#ed8936"
          sub={`${services.length} total`}
        />
      </div>

      {/* ── Chart ─────────────────────────────── */}
      <div className="card" style={s.chartCard}>
        <div style={s.sectionHeader}>
          <h3 style={s.sectionTitle}>Appointments — Last 7 Days</h3>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#a0aec0' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#a0aec0' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8, border: '1px solid #e2e8f0',
                fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar dataKey="Appointments" fill="#4299e1" radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Recent Appointments ───────────────── */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ ...s.sectionHeader, borderBottom: '1px solid #f0f4f8' }}>
          <h3 style={s.sectionTitle}>Recent Appointments</h3>
          <Link to="/appointments" style={s.viewAllLink}>View all →</Link>
        </div>
        {recentAppts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No appointments yet</h3>
            <p>Appointments will appear here once booked.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Barber</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentAppts.map((appt) => {
                  const st = getStatusStyle(appt.status);
                  return (
                    <tr key={appt.id}>
                      <td style={{ color: '#a0aec0', fontSize: 12 }}>#{appt.id}</td>
                      <td>
                        <div style={s.customerName}>{appt.customer_name || appt.name || '—'}</div>
                        <div style={s.customerEmail}>{appt.customer_email || appt.email || ''}</div>
                      </td>
                      <td>{appt.barber?.name || appt.barber_name || '—'}</td>
                      <td>{appt.service?.name || appt.service_name || '—'}</td>
                      <td>
                        <div>{formatDate(getApptDate(appt))}</div>
                        <div style={{ color: '#a0aec0', fontSize: 12 }}>{formatTime(getApptTime(appt))}</div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{ color: st.color, background: st.background, border: `1px solid ${st.border}` }}
                        >
                          {appt.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/appointments/${appt.id}/edit`}
                          style={s.viewLink}
                        >
                          View
                        </Link>
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
  );
};

const s = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '20px 22px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
  },
  statLabel: { fontSize: 12, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 },
  statValue: { fontSize: 32, fontWeight: 800, lineHeight: 1 },
  statSub:   { fontSize: 12, color: '#a0aec0', marginTop: 6 },
  statIcon:  { width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  chartCard: { padding: 0, overflow: 'hidden' },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 22px',
  },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#2d3748' },
  viewAllLink: { fontSize: 13, color: '#4299e1', fontWeight: 500 },
  customerName: { fontWeight: 500, fontSize: 14 },
  customerEmail: { fontSize: 12, color: '#a0aec0' },
  viewLink: {
    color: '#4299e1',
    fontSize: 13,
    fontWeight: 500,
    padding: '4px 10px',
    borderRadius: 6,
    background: '#ebf8ff',
  },
};

export default Dashboard;
