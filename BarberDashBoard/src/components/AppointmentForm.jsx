import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import {
  getStatusStyle, formatDate, formatTime, formatCurrency,
  getApptDate, getApptTime,
} from '../utils/helpers';
import FollowUpStatus from './FollowUpStatus';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

const Field = ({ label, value }) => (
  <div style={f.field}>
    <div style={f.fieldLabel}>{label}</div>
    <div style={f.fieldValue}>{value || '—'}</div>
  </div>
);

const AppointmentForm = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);

  const [status, setStatus] = useState('');
  const [notes,  setNotes]  = useState('');

  const fetchAppointment = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/appointments/${id}`);
      const appt = res.data.data || res.data;
      setAppointment(appt);
      setStatus(appt.status || 'pending');
      setNotes(appt.notes || '');
    } catch {
      toast.error('Failed to load appointment');
      navigate('/appointments');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchAppointment(); }, [fetchAppointment]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/api/admin/appointments/${id}`, { status, notes });
      toast.success('Appointment updated');
      // Refresh to show updated data
      fetchAppointment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update appointment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <span>Loading appointment…</span>
      </div>
    );
  }

  if (!appointment) return null;

  const st = getStatusStyle(appointment.status);
  const apptDate = getApptDate(appointment);
  const apptTime = getApptTime(appointment);
  const followUps = appointment.follow_ups || appointment.followUps || [];

  return (
    <div style={f.page}>
      {/* ── Back + Header ─────────────────────── */}
      <div className="page-header">
        <div>
          <Link to="/appointments" style={f.back}>← Back to Appointments</Link>
          <h1 className="page-title" style={{ marginTop: 6 }}>
            Appointment #{appointment.id}
          </h1>
        </div>
        <span
          className="badge"
          style={{
            color: st.color,
            background: st.background,
            border: `1px solid ${st.border}`,
            fontSize: 13,
            padding: '6px 14px',
          }}
        >
          {appointment.status?.replace('_', ' ')}
        </span>
      </div>

      <div className="appt-grid">
        {/* ── Left Column ──────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Customer Info */}
          <div className="card" style={f.section}>
            <div style={f.sectionTitle}>👤 Customer Information</div>
            <Field label="Full Name"    value={appointment.customer_name || appointment.name} />
            <Field label="Email"        value={appointment.customer_email || appointment.email} />
            <Field label="Phone"        value={appointment.customer_phone || appointment.phone} />
            <Field
              label="Bookings so far"
              value={
                appointment.customer_visits_count == null
                  ? null
                  : appointment.customer_visits_count <= 1
                    ? 'First booking'
                    : `${appointment.customer_visits_count} bookings`
              }
            />
          </div>

          {/* Appointment Info */}
          <div className="card" style={f.section}>
            <div style={f.sectionTitle}>📅 Appointment Details</div>
            <Field label="Date"         value={formatDate(apptDate)} />
            <Field label="Time"         value={formatTime(apptTime)} />
            <Field label="Barber"       value={appointment.barber?.name || appointment.barber_name} />
            <Field label="Service"      value={appointment.service?.name || appointment.service_name} />
            {appointment.service?.duration_minutes && (
              <Field label="Duration" value={`${appointment.service.duration_minutes} min`} />
            )}
            {appointment.service?.price && (
              <Field label="Price" value={formatCurrency(appointment.service.price)} />
            )}
          </div>

          {/* Follow-Up Emails */}
          <div className="card" style={f.section}>
            <FollowUpStatus
              appointmentId={appointment.id}
              followUps={followUps}
              onRefresh={fetchAppointment}
            />
          </div>
        </div>

        {/* ── Right Column ─────────────────────── */}
        <div>
          <div className="card" style={f.section}>
            <div style={f.sectionTitle}>✏️ Update Appointment</div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this appointment…"
                  rows={5}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const f = {
  page: { maxWidth: 1100 },
  back: { fontSize: 13, color: '#4299e1', display: 'inline-block', marginBottom: 4 },
  section: { padding: '22px 24px' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#2d3748',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 18,
    paddingBottom: 12,
    borderBottom: '1px solid #f0f4f8',
  },
  field: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#a0aec0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 3,
  },
  fieldValue: { fontSize: 14, color: '#2d3748' },
};

export default AppointmentForm;
