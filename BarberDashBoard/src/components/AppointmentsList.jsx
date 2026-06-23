import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiFilter } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  extractData, getStatusStyle, formatDate, formatTime,
  getApptDate, getApptTime,
} from '../utils/helpers';

const STATUSES = ['', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

const AppointmentsList = () => {
  const { user: me } = useAuth();
  const isBarber = me?.role === 'barber';
  const myBarberId = isBarber ? String(me?.barber_id || me?.barber?.id || '') : '';

  const [appointments, setAppointments] = useState([]);
  const [barbers,      setBarbers]      = useState([]);
  const [services,     setServices]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [deleting,     setDeleting]     = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    barber_id: myBarberId,
    status: '', email: '', service_id: '', search: '',
  });

  // ── Fetch ───────────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.date)       params.date       = filters.date;
      if (filters.barber_id)  params.barber_id  = filters.barber_id;
      if (filters.status)     params.status     = filters.status;
      if (filters.email)      params.email      = filters.email;
      if (filters.service_id) params.service_id = filters.service_id;
      if (filters.search)     params.search     = filters.search;

      const res = await api.get('/api/admin/appointments', { params });
      setAppointments(extractData(res));
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    api.get('/api/admin/barbers').then((r) => setBarbers(extractData(r))).catch(() => {});
    api.get('/api/admin/services').then((r) => setServices(extractData(r))).catch(() => {});
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // ── Bulk delete past appointments (admin only) ──────────
  const handleBulkDeleteOld = async () => {
    if (!window.confirm('Delete ALL appointments before today? This cannot be undone.')) return;
    setBulkDeleting(true);
    try {
      const res = await api.delete('/api/admin/appointments/bulk-delete-old');
      toast.success(res.data?.message || 'Old appointments deleted');
      fetchAppointments();
    } catch {
      toast.error('Failed to delete old appointments');
    } finally {
      setBulkDeleting(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/api/admin/appointments/${id}`);
      toast.success('Appointment deleted');
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error('Failed to delete appointment');
    } finally {
      setDeleting(null);
    }
  };

  // ── Filter change ───────────────────────────────────────
  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  const clearFilters = () =>
    setFilters({ date: '', barber_id: '', status: '', email: '', service_id: '', search: '' });

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">{appointments.length} record{appointments.length !== 1 ? 's' : ''} found</p>
        </div>
        {me?.role === 'admin' && (
          <button
            className="btn btn-danger btn-sm"
            onClick={handleBulkDeleteOld}
            disabled={bulkDeleting}
          >
            {bulkDeleting ? 'Deleting…' : 'Delete Old Appointments'}
          </button>
        )}
      </div>

      <div className="card">
        {/* ── Filter Bar ── */}
        <div className="filter-bar">
          {/* Primary row: date + search + toggle + clear (always visible) */}
          <div className="filter-row-primary">
            <input
              type="date"
              className="form-input"
              value={filters.date}
              onChange={(e) => setFilter('date', e.target.value)}
              title="Filter by date"
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search name or phone…"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
            <button
              className="filter-toggle-btn"
              onClick={() => setShowAdvanced((v) => !v)}
              aria-expanded={showAdvanced}
            >
              <FiFilter size={14} />
              Filters
            </button>
            {hasFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                ✕ Clear
              </button>
            )}
          </div>

          {/* Advanced row: extra filters (always visible on desktop, toggled on mobile) */}
          <div className={`filter-advanced${showAdvanced ? ' open' : ''}`}>
            {/* Barber dropdown: hidden for barbers (they always see only their own) */}
            {!isBarber && (
              <select
                className="form-select"
                value={filters.barber_id}
                onChange={(e) => setFilter('barber_id', e.target.value)}
              >
                <option value="">All Barbers</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st ? st.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase()) : 'All Statuses'}
                </option>
              ))}
            </select>
            <input
              type="email"
              className="form-input"
              placeholder="Search by email…"
              value={filters.email}
              onChange={(e) => setFilter('email', e.target.value)}
            />
            <select
              className="form-select"
              value={filters.service_id}
              onChange={(e) => setFilter('service_id', e.target.value)}
            >
              <option value="">All Services</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <span>Loading appointments…</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No appointments found</h3>
            <p>{hasFilters ? 'Try adjusting your filters.' : 'No appointments have been booked yet.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Barber</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => {
                  const st = getStatusStyle(appt.status);
                  return (
                    <tr key={appt.id}>
                      <td className="col-index" style={{ color: '#a0aec0', fontSize: 12, whiteSpace: 'nowrap' }}>
                        #{appt.id}
                      </td>
                      <td data-label="Customer">
                        <div style={{ fontWeight: 500 }}>
                          {appt.customer_name || appt.name || '—'}
                        </div>
                        <div style={{ fontSize: 12, color: '#a0aec0' }}>
                          {appt.customer_email || appt.email || ''}
                        </div>
                      </td>
                      <td data-label="Phone" style={{ color: '#718096', fontSize: 13 }}>
                        {appt.customer_phone || appt.phone || '—'}
                      </td>
                      <td data-label="Barber">
                        {appt.barber?.name || appt.barber_name || '—'}
                      </td>
                      <td data-label="Service">
                        {appt.service?.name || appt.service_name || '—'}
                      </td>
                      <td data-label="Date & Time" style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 500 }}>{formatDate(getApptDate(appt))}</div>
                        <div style={{ fontSize: 12, color: '#a0aec0' }}>{formatTime(getApptTime(appt))}</div>
                      </td>
                      <td data-label="Status">
                        <span
                          className="badge"
                          style={{
                            color: st.color,
                            background: st.background,
                            border: `1px solid ${st.border}`,
                          }}
                        >
                          {appt.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td data-label="Notes" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#718096', fontSize: 13 }}>
                        {appt.notes || <span style={{ color: '#cbd5e0' }}>—</span>}
                      </td>
                      <td className="col-actions">
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link
                            to={`/appointments/${appt.id}/edit`}
                            className="btn btn-primary btn-sm"
                          >
                            View
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(appt.id)}
                            disabled={deleting === appt.id}
                          >
                            {deleting === appt.id ? '…' : 'Del'}
                          </button>
                        </div>
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

export default AppointmentsList;
