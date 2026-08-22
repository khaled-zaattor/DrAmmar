import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiFilter, FiRefreshCw } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  extractData, getStatusStyle, formatDate, formatTime,
  getApptDate, getApptTime,
} from '../utils/helpers';

const STATUSES = ['', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
const EMPTY_FILTERS = {
  date: '', barber_id: '', status: '', email: '', service_id: '', search: '',
};

const VisitCount = ({ value }) => (
  value === null || value === undefined
    ? <span className="visit-count-missing">—</span>
    : <span className="visit-count-value">{value}</span>
);

const AppointmentsList = () => {
  const { user: me } = useAuth();
  const isBarber = me?.role === 'barber';
  const canSyncVisitCounts = me?.role === 'admin' || me?.role === 'receptionist';
  const myBarberId = isBarber ? String(me?.barber_id || me?.barber?.id || '') : '';

  const [appointments, setAppointments] = useState([]);
  const [barbers,      setBarbers]      = useState([]);
  const [services,     setServices]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [deleting,     setDeleting]     = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [syncingVisits, setSyncingVisits] = useState(false);
  const [lastVisitUpdate, setLastVisitUpdate] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    barber_id: myBarberId,
    status: '', email: '', service_id: '', search: '',
  });

  // ── Fetch ───────────────────────────────────────────────
  const fetchAppointments = useCallback(async (filterOverride = null) => {
    setLoading(true);
    try {
      const activeFilters = filterOverride || filters;
      const params = {};
      if (activeFilters.date)       params.date       = activeFilters.date;
      if (activeFilters.barber_id)  params.barber_id  = activeFilters.barber_id;
      if (activeFilters.status)     params.status     = activeFilters.status;
      if (activeFilters.email)      params.email      = activeFilters.email;
      if (activeFilters.service_id) params.service_id = activeFilters.service_id;
      if (activeFilters.search)     params.search     = activeFilters.search;

      const res = await api.get('/api/admin/appointments', { params });
      const records = extractData(res);
      setAppointments(records);

      const summaryUpdates = records
        .flatMap((appointment) => [
          appointment.phone_visit_count_updated_at,
          appointment.email_visit_count_updated_at,
        ])
        .filter(Boolean)
        .sort();
      const latestSummaryUpdate = summaryUpdates[summaryUpdates.length - 1];

      if (latestSummaryUpdate) {
        setLastVisitUpdate((current) => (
          !current || latestSummaryUpdate > current ? latestSummaryUpdate : current
        ));
      }
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

  // ── Visit count sync (admin + receptionist) ──────────────────────
  const handleSyncVisitCounts = async () => {
    setFilters({ ...EMPTY_FILTERS });
    setShowAdvanced(false);
    setSyncingVisits(true);

    try {
      const response = await api.post('/api/admin/appointments/sync-visit-counts');
      const result = response.data?.data || {};

      // Always issue an explicit unfiltered fetch after the calculation. This also
      // refreshes the table when the filters were already empty before the click.
      await fetchAppointments(EMPTY_FILTERS);
      setLastVisitUpdate(result.calculated_at || new Date().toISOString());
      const calculationTime = result.calculated_at
        ? new Date(result.calculated_at).toLocaleString()
        : 'just now';
      toast.success(
        `Visit counts updated: ${result.processed_new_phone ?? 0} phone, `
        + `${result.processed_new_email ?? 0} email; `
        + `${result.skipped_invalid ?? 0} invalid skipped. Calculated ${calculationTime}.`,
      );
    } catch (error) {
      await fetchAppointments(EMPTY_FILTERS);
      toast.error(error.response?.data?.message || 'Failed to update visit counts. Please try again.');
    } finally {
      setSyncingVisits(false);
    }
  };

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

  const clearFilters = () => setFilters({ ...EMPTY_FILTERS });

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">{appointments.length} record{appointments.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="appointment-header-actions">
          {canSyncVisitCounts && (
            <div className="visit-sync-control">
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSyncVisitCounts}
                disabled={syncingVisits}
                aria-label="Update client visit counts and clear appointment filters"
              >
                <FiRefreshCw className={syncingVisits ? 'icon-spinning' : ''} aria-hidden="true" />
                {syncingVisits ? 'Updating counts…' : 'Update visit counts'}
              </button>
              {lastVisitUpdate && (
                <span className="visit-sync-status" role="status">
                  Visit counts last updated {new Date(lastVisitUpdate).toLocaleString()}
                </span>
              )}
            </div>
          )}
          {me?.role === 'admin' && (
            <button
              className="btn btn-danger btn-sm"
              onClick={handleBulkDeleteOld}
              disabled={bulkDeleting || syncingVisits}
            >
              {bulkDeleting ? 'Deleting…' : 'Delete Old Appointments'}
            </button>
          )}
        </div>
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
                  <th>Phone visits</th>
                  <th>Email visits</th>
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
                      <td data-label="Phone visits" className="visit-count-cell">
                        <VisitCount value={appt.phone_visit_count} />
                      </td>
                      <td data-label="Email visits" className="visit-count-cell">
                        <VisitCount value={appt.email_visit_count} />
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
