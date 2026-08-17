import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SLOT_OPTIONS = [15, 20, 30, 40, 45, 60];

// ─── Helpers ────────────────────────────────────────────────────────────────

const emptyBusinessHours = () =>
  DAYS.map((_, i) => ({
    day_of_week: i,
    is_closed: false,
    open_time: '09:00',
    close_time: i === 0 ? '15:00' : i === 6 ? '19:00' : '21:00',
    slot_duration: 30,
  }));

const emptySchedule = () =>
  DAYS.map((_, i) => ({
    day_of_week: i,
    is_off: false,
    start_time: '',
    end_time: '',
  }));

// ─── Business Hours Tab ──────────────────────────────────────────────────────

const BusinessHoursTab = ({ me }) => {
  const [hours, setHours]     = useState(emptyBusinessHours());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (me?.role === 'barber') { setLoading(false); return; }
    api.get('/api/admin/availability')
      .then((res) => {
        const bh = res.data?.data?.business_hours;
        if (bh && bh.length) {
          const merged = emptyBusinessHours().map((def) => {
            const found = bh.find((r) => r.day_of_week === def.day_of_week);
            return found
              ? {
                  day_of_week:   found.day_of_week,
                  is_closed:     !!found.is_closed,
                  open_time:     found.open_time  ? found.open_time.slice(0, 5)  : def.open_time,
                  close_time:    found.close_time ? found.close_time.slice(0, 5) : def.close_time,
                  slot_duration: found.slot_duration ?? 30,
                }
              : def;
          });
          setHours(merged);
        }
      })
      .catch(() => toast.error('Failed to load business hours'))
      .finally(() => setLoading(false));
  }, []);

  const setField = (index, key, value) =>
    setHours((prev) => prev.map((h, i) => (i === index ? { ...h, [key]: value } : h)));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/api/admin/business-hours', { days: hours });
      toast.success('Business hours saved');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (me?.role === 'barber') {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔒</div>
        <h3>Access Restricted</h3>
        <p>Business Hours can only be managed by admins and receptionists.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <span>Loading business hours…</span>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: '#718096', marginBottom: 16, fontSize: 14 }}>
        Configure the salon's weekly opening hours and default booking slot size.
      </p>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Closed</th>
              <th>Open Time</th>
              <th>Close Time</th>
              <th>Slot Duration</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((h, i) => (
              <tr key={h.day_of_week} style={{ opacity: h.is_closed ? 0.5 : 1 }}>
                <td style={{ fontWeight: 600 }}>{DAYS[h.day_of_week]}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={h.is_closed}
                    onChange={(e) => setField(i, 'is_closed', e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    className="form-input"
                    value={h.open_time}
                    disabled={h.is_closed}
                    onChange={(e) => setField(i, 'open_time', e.target.value)}
                    style={{ width: 120 }}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    className="form-input"
                    value={h.close_time}
                    disabled={h.is_closed}
                    onChange={(e) => setField(i, 'close_time', e.target.value)}
                    style={{ width: 120 }}
                  />
                </td>
                <td>
                  <select
                    className="form-select"
                    value={h.slot_duration}
                    disabled={h.is_closed}
                    onChange={(e) => setField(i, 'slot_duration', Number(e.target.value))}
                    style={{ width: 120 }}
                  >
                    {SLOT_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m} min</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Business Hours'}
        </button>
      </div>
    </div>
  );
};

// ─── Barber Schedules Tab ────────────────────────────────────────────────────

const BarberSchedulesTab = ({ me }) => {
  const [barbers,   setBarbers]   = useState([]);
  const [selected,  setSelected]  = useState('');
  const [schedule,  setSchedule]  = useState(emptySchedule());
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    if (me?.role === 'barber') { setLoading(false); return; }
    api.get('/api/admin/availability')
      .then((res) => {
        const barberList = res.data?.data?.barbers ?? [];
        setBarbers(barberList);
        if (barberList.length) {
          const first = barberList[0];
          setSelected(String(first.id));
          loadScheduleFor(first);
        }
      })
      .catch(() => toast.error('Failed to load barbers'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadScheduleFor = (barber) => {
    const existing = barber.schedules ?? [];
    const merged = emptySchedule().map((def) => {
      const found = existing.find((s) => s.day_of_week === def.day_of_week);
      return found
        ? {
            day_of_week: found.day_of_week,
            is_off:      !!found.is_off,
            start_time:  found.start_time ? found.start_time.slice(0, 5) : '',
            end_time:    found.end_time   ? found.end_time.slice(0, 5)   : '',
          }
        : def;
    });
    setSchedule(merged);
  };

  const handleBarberChange = (e) => {
    const id = e.target.value;
    setSelected(id);
    const barber = barbers.find((b) => String(b.id) === id);
    if (barber) loadScheduleFor(barber);
  };

  const setField = (index, key, value) =>
    setSchedule((prev) => prev.map((s, i) => (i === index ? { ...s, [key]: value } : s)));

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const payload = schedule.map((s) => ({
        barber_id:   Number(selected),
        day_of_week: s.day_of_week,
        is_off:      s.is_off,
        start_time:  s.is_off ? null : (s.start_time || null),
        end_time:    s.is_off ? null : (s.end_time   || null),
      }));
      await api.post('/api/admin/barber-schedules', { schedules: payload });
      // Refresh the barber list so schedules are in sync
      const res = await api.get('/api/admin/availability');
      const updated = res.data?.data?.barbers ?? [];
      setBarbers(updated);
      const refreshed = updated.find((b) => String(b.id) === selected);
      if (refreshed) loadScheduleFor(refreshed);
      toast.success('Barber schedule saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  if (me?.role === 'barber') {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔒</div>
        <h3>Access Restricted</h3>
        <p>Barber Schedules can only be managed by admins and receptionists.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <span>Loading barber schedules…</span>
      </div>
    );
  }

  if (!barbers.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">✂</div>
        <h3>No active barbers</h3>
        <p>Add barbers first before configuring their schedules.</p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: '#718096', marginBottom: 16, fontSize: 14 }}>
        Set each barber's personal weekly hours. Leave start/end blank to inherit salon hours.
        Toggle "Day Off" to mark the barber as unavailable.
      </p>
      <div style={{ marginBottom: 16 }}>
        <select
          className="form-select"
          value={selected}
          onChange={handleBarberChange}
          style={{ width: 220 }}
        >
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Day Off</th>
              <th>Start Time</th>
              <th>End Time</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((s, i) => (
              <tr key={s.day_of_week} style={{ opacity: s.is_off ? 0.5 : 1 }}>
                <td style={{ fontWeight: 600 }}>{DAYS[s.day_of_week]}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={s.is_off}
                    onChange={(e) => setField(i, 'is_off', e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    className="form-input"
                    value={s.start_time}
                    disabled={s.is_off}
                    placeholder="Inherit salon hours"
                    onChange={(e) => setField(i, 'start_time', e.target.value)}
                    style={{ width: 130 }}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    className="form-input"
                    value={s.end_time}
                    disabled={s.is_off}
                    placeholder="Inherit salon hours"
                    onChange={(e) => setField(i, 'end_time', e.target.value)}
                    style={{ width: 130 }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Schedule'}
        </button>
      </div>
    </div>
  );
};

// ─── Blocked Slots Tab ───────────────────────────────────────────────────────

const emptyForm = () => ({
  barber_id: '',
  blocked_date: '',
  start_time: '',
  end_time: '',
  reason: '',
});

const BlockedSlotsTab = ({ me }) => {
  const isAdmin     = me?.role === 'admin';
  const isBarberRole = me?.role === 'barber';
  const [slots,    setSlots]    = useState([]);
  const [barbers,  setBarbers]  = useState([]);
  const [myBarber, setMyBarber] = useState(null); // { id, name } — the barber linked to this user
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(emptyForm());
  const [editing,  setEditing]  = useState(null); // id of slot being edited
  const [saving,              setSaving]              = useState(false);
  const [deleting,            setDeleting]            = useState(null);
  const [checking,            setChecking]            = useState(false);
  const [conflictInfo,        setConflictInfo]        = useState(null);
  const [replacementBarberId, setReplacementBarberId] = useState('');

  // ── Monthly report state (admin only) ──────────────────
  const [reportMonth,   setReportMonth]   = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [report,        setReport]        = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [bulkDelOld,    setBulkDelOld]    = useState(false);

  // Resolve the barber linked to the logged-in user from all available sources
  const resolveMyBarber = useCallback((barberList) => {
    if (!isBarberRole) return;
    // Source 1: me.barber (new login response)
    if (me?.barber?.id) {
      setMyBarber({ id: String(me.barber.id), name: me.barber.name });
      return;
    }
    // Source 2: me.barber_id matched against list
    if (me?.barber_id) {
      const found = barberList.find((b) => String(b.id) === String(me.barber_id));
      if (found) { setMyBarber({ id: String(found.id), name: found.name }); return; }
    }
    // Source 3: match user_id in the list (barbers now include user_id)
    const byUserId = barberList.find((b) => b.user_id === me?.id);
    if (byUserId) setMyBarber({ id: String(byUserId.id), name: byUserId.name });
  }, [isBarberRole, me]);

  const fetchSlots = useCallback(async (barberId) => {
    setLoading(true);
    try {
      const params = barberId ? { barber_id: barberId } : {};
      const res = await api.get('/api/admin/blocked-slots', { params });
      const raw = res.data?.data;
      setSlots(Array.isArray(raw) ? raw : (raw?.data ?? []));
    } catch {
      toast.error('Failed to load blocked slots');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.get('/api/admin/barbers')
      .then((r) => {
        const list = r.data?.data;
        const barberList = Array.isArray(list) ? list : (list?.data ?? []);
        setBarbers(barberList);
        resolveMyBarber(barberList);
      })
      .catch(() => {});
  }, [resolveMyBarber]);

  // Fetch slots once myBarber is resolved (or immediately for non-barber roles)
  useEffect(() => {
    if (!isBarberRole) {
      fetchSlots(null);
    } else if (myBarber) {
      fetchSlots(myBarber.id);
    }
  }, [isBarberRole, myBarber, fetchSlots]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm(), barber_id: isBarberRole ? (myBarber?.id ?? '') : '' });
    setShowForm(true);
  };

  const openEdit = (slot) => {
    setEditing(slot.id);
    setForm({
      barber_id:    String(slot.barber_id),
      blocked_date: slot.blocked_date,
      start_time:   slot.start_time?.slice(0, 5) ?? '',
      end_time:     slot.end_time?.slice(0, 5)   ?? '',
      reason:       slot.reason ?? '',
    });
    setShowForm(true);
  };

  const toMinutes = (t) => {
    const [h, m] = (t ?? '00:00').split(':').map(Number);
    return h * 60 + m;
  };

  const clearConflict = () => {
    setConflictInfo(null);
    setReplacementBarberId('');
  };

  const doSave = async (payload) => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/admin/blocked-slots/${editing}`, payload);
        toast.success('Blocked slot updated');
      } else {
        await api.post('/api/admin/blocked-slots', payload);
        toast.success('Blocked slot created');
      }
      setShowForm(false);
      setConflictInfo(null);
      fetchSlots();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((msg) => toast.error(msg));
      } else {
        toast.error(err.response?.data?.message || 'Failed to save');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!form.barber_id || !form.blocked_date || !form.start_time || !form.end_time) {
      toast.warn('Please fill in all required fields');
      return;
    }

    // If conflict is shown, user must pick a replacement barber to reassign appointments to
    if (conflictInfo) {
      if (!replacementBarberId) {
        toast.warn('Please select a replacement barber');
        return;
      }

      // Verify the replacement barber is free during each conflicting appointment's time
      setChecking(true);
      try {
        const checkRes = await api.get('/api/admin/appointments', {
          params: { barber_id: replacementBarberId, date: form.blocked_date, per_page: 100 },
        });
        const checkRaw = checkRes.data?.data;
        const checkList = Array.isArray(checkRaw) ? checkRaw : (checkRaw?.data ?? []);

        const busyAppts = conflictInfo.appointments.filter((conflictAppt) => {
          const cStart = toMinutes((conflictAppt.appointment_time ?? '').slice(0, 5));
          const cEnd   = cStart + (conflictAppt.duration_minutes ?? 0);
          return checkList.some((a) => {
            if (a.status === 'cancelled') return false;
            const aStart = toMinutes((a.appointment_time ?? '').slice(0, 5));
            const aEnd   = aStart + (a.duration_minutes ?? 0);
            return aStart < cEnd && aEnd > cStart;
          });
        });

        if (busyAppts.length > 0) {
          toast.error('The selected barber already has an appointment during that time. Please choose a different barber.');
          setChecking(false);
          return;
        }
      } catch {
        // If check fails, proceed
      }
      setChecking(false);

      setSaving(true);
      try {
        // Reassign each conflicting appointment to the new barber
        for (const appt of conflictInfo.appointments) {
          await api.put(`/api/admin/appointments/${appt.id}`, { barber_id: replacementBarberId });
        }
        // Then save the blocked slot for the original barber
        await doSave(form);
      } catch {
        toast.error('Failed to reassign appointments');
        setSaving(false);
      }
      return;
    }

    // Check for appointment conflicts first
    setChecking(true);
    try {
      const res = await api.get('/api/admin/appointments', {
        params: { barber_id: form.barber_id, date: form.blocked_date, per_page: 100 },
      });
      const raw = res.data?.data;
      const list = Array.isArray(raw) ? raw : (raw?.data ?? []);

      const blockStart = toMinutes(form.start_time);
      const blockEnd   = toMinutes(form.end_time);

      const conflicts = list.filter((a) => {
        if (a.status === 'cancelled') return false;
        const apptStart = toMinutes((a.appointment_time ?? '').slice(0, 5));
        const apptEnd   = apptStart + (a.duration_minutes ?? 0);
        return apptStart < blockEnd && apptEnd > blockStart;
      });

      if (conflicts.length > 0) {
        setConflictInfo({ appointments: conflicts });
        setReplacementBarberId('');
        setChecking(false);
        return;
      }
    } catch {
      // If check fails, proceed with saving
    }
    setChecking(false);

    await doSave(form);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blocked slot?')) return;
    setDeleting(id);
    try {
      await api.delete(`/api/admin/blocked-slots/${id}`);
      toast.success('Blocked slot deleted');
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  // ── Monthly report (admin only) ─────────────────────────
  const fetchMonthlyReport = async () => {
    if (!reportMonth) { toast.warn('Please select a month'); return; }
    setReportLoading(true);
    setReport(null);
    try {
      const res = await api.get('/api/admin/blocked-slots/monthly-report', { params: { month: reportMonth } });
      setReport(res.data?.data ?? []);
    } catch {
      toast.error('Failed to load report');
    } finally {
      setReportLoading(false);
    }
  };

  const handleBulkDeleteOld = async () => {
    if (!window.confirm('Delete ALL blocked slots before this month? This cannot be undone.')) return;
    setBulkDelOld(true);
    try {
      const res = await api.delete('/api/admin/blocked-slots/bulk-delete-old');
      toast.success(res.data?.message || 'Old blocked slots deleted');
      fetchSlots(isBarberRole ? myBarber?.id : null);
    } catch {
      toast.error('Failed to delete old blocked slots');
    } finally {
      setBulkDelOld(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ color: '#718096', fontSize: 14, margin: 0 }}>
          Block specific time ranges for vacations, lunch breaks, or special closures.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin && (
            <button
              className="btn btn-danger btn-sm"
              onClick={handleBulkDeleteOld}
              disabled={bulkDelOld}
            >
              {bulkDelOld ? 'Deleting…' : 'Delete Old Slots'}
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + Add Block
          </button>
        </div>
      </div>

      {/* ── Monthly Report (admin only) ── */}
      {isAdmin && (
        <div className="card" style={{ marginBottom: 20, background: '#f7fafc', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 15 }}>Monthly Report</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="month"
              className="form-input"
              value={reportMonth}
              onChange={(e) => { setReportMonth(e.target.value); setReport(null); }}
              style={{ maxWidth: 180 }}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={fetchMonthlyReport}
              disabled={reportLoading}
            >
              {reportLoading ? 'Loading…' : 'Generate Report'}
            </button>
          </div>
          {report !== null && (
            report.length === 0 ? (
              <p style={{ marginTop: 12, color: '#718096', fontSize: 13 }}>No blocked slots found for this month.</p>
            ) : (
              <div className="table-wrapper" style={{ marginTop: 14 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Barber</th>
                      <th style={{ textAlign: 'right' }}>Blocked Slots</th>
                      <th style={{ textAlign: 'right' }}>Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.map((row) => (
                      <tr key={row.barber_id}>
                        <td style={{ fontWeight: 500 }}>{row.barber_name}</td>
                        <td style={{ textAlign: 'right' }}>{row.blocked_slot_count}</td>
                        <td style={{ textAlign: 'right' }}>{row.total_hours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}

      {/* ── Inline Form ── */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20, background: '#f7fafc', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 15 }}>
            {editing ? 'Edit Blocked Slot' : 'New Blocked Slot'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div>
              <label style={labelStyle}>Barber *</label>
              {isBarberRole ? (
                <input
                  className="form-input"
                  value={myBarber?.name ?? '—'}
                  disabled
                  style={{ background: '#f0f4f8', color: '#718096', cursor: 'not-allowed' }}
                />
              ) : (
                <select
                  className="form-select"
                  value={form.barber_id}
                  onChange={(e) => { clearConflict(); setForm((f) => ({ ...f, barber_id: e.target.value })); }}
                >
                  <option value="">Select barber</option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label style={labelStyle}>Date *</label>
              <input
                type="date"
                className="form-input"
                value={form.blocked_date}
                onChange={(e) => { clearConflict(); setForm((f) => ({ ...f, blocked_date: e.target.value })); }}
              />
            </div>
            <div>
              <label style={labelStyle}>Start Time *</label>
              <input
                type="time"
                className="form-input"
                value={form.start_time}
                onChange={(e) => { clearConflict(); setForm((f) => ({ ...f, start_time: e.target.value })); }}
              />
            </div>
            <div>
              <label style={labelStyle}>End Time *</label>
              <input
                type="time"
                className="form-input"
                value={form.end_time}
                onChange={(e) => { clearConflict(); setForm((f) => ({ ...f, end_time: e.target.value })); }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Reason</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Lunch break, Vacation, Holiday…"
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              />
            </div>
          </div>
          {conflictInfo && (() => {
            const conflictCount = conflictInfo.appointments.length;
            // Collect all unique service IDs from conflicting appointments
            const neededServiceIds = [...new Set(
              conflictInfo.appointments.map((a) => a.service?.id).filter(Boolean)
            )];
            // Only show barbers who offer ALL required services (and aren't the current barber)
            const eligibleBarbers = barbers.filter((b) => {
              if (String(b.id) === String(form.barber_id)) return false;
              const barberSvcIds = (b.services ?? []).map((s) => s.id);
              return neededServiceIds.every((sid) => barberSvcIds.includes(sid));
            });
            const serviceNames = [...new Set(
              conflictInfo.appointments.map((a) => a.service?.name).filter(Boolean)
            )].join(', ');
            return (
              <div style={{ marginTop: 14, padding: '12px 14px', background: '#fff5f5', border: '1px solid #fc8181', borderRadius: 8 }}>
                <p style={{ color: '#c53030', fontWeight: 600, fontSize: 13, margin: '0 0 4px' }}>
                  ⚠ This barber has {conflictCount} appointment{conflictCount > 1 ? 's' : ''} during this time slot
                  {serviceNames ? ` (${serviceNames})` : ''}.
                </p>
                <p style={{ color: '#742a2a', fontSize: 12, margin: '0 0 10px' }}>
                  Select a barber below to reassign the conflicting appointment{conflictCount > 1 ? 's' : ''} to.
                  Only barbers who offer the same service{neededServiceIds.length > 1 ? 's' : ''} are shown.
                </p>
                {eligibleBarbers.length === 0 ? (
                  <p style={{ color: '#c53030', fontSize: 12, margin: 0 }}>
                    No other barbers offer the required service{neededServiceIds.length > 1 ? 's' : ''}. Add another barber with this service first.
                  </p>
                ) : (
                  <select
                    className="form-select"
                    value={replacementBarberId}
                    onChange={(e) => setReplacementBarberId(e.target.value)}
                    style={{ maxWidth: 300 }}
                  >
                    <option value="">— Select a replacement barber —</option>
                    {eligibleBarbers.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
              </div>
            );
          })()}
          <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowForm(false); clearConflict(); }}>
              Cancel
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={saving || checking || (conflictInfo && (() => {
                const neededServiceIds = [...new Set(conflictInfo.appointments.map((a) => a.service?.id).filter(Boolean))];
                const eligible = barbers.filter((b) => {
                  if (String(b.id) === String(form.barber_id)) return false;
                  const ids = (b.services ?? []).map((s) => s.id);
                  return neededServiceIds.every((sid) => ids.includes(sid));
                });
                return eligible.length === 0;
              })())}
            >
              {checking ? 'Checking…' : saving ? 'Saving…' : conflictInfo ? 'Reassign & Block' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* ── List ── */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <span>Loading blocked slots…</span>
        </div>
      ) : slots.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚫</div>
          <h3>No blocked slots</h3>
          <p>Add blocks to prevent bookings during specific times.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Barber</th>
                <th>Date</th>
                <th>Start</th>
                <th>End</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td style={{ fontWeight: 500 }}>
                    {slot.barber?.name ?? slot.barber_name ?? '—'}
                  </td>
                  <td>{slot.blocked_date}</td>
                  <td>{slot.start_time?.slice(0, 5)}</td>
                  <td>{slot.end_time?.slice(0, 5)}</td>
                  <td style={{ color: '#718096', fontSize: 13 }}>
                    {slot.reason || <span style={{ color: '#cbd5e0' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openEdit(slot)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(slot.id)}
                        disabled={deleting === slot.id}
                      >
                        {deleting === slot.id ? '…' : 'Del'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#4a5568',
  marginBottom: 4,
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'hours',    label: 'Business Hours'  },
  { key: 'schedule', label: 'Barber Schedules' },
  { key: 'blocked',  label: 'Blocked Slots'    },
];

const AvailabilityPage = () => {
  const { user: me } = useAuth();
  const [activeTab, setActiveTab] = useState(() => me?.role === 'barber' ? 'blocked' : 'hours');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Available Appointments</h1>
          <p className="page-subtitle">
            Manage when the salon is open and which time slots customers can book.
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #e2e8f0' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #4299e1' : '2px solid transparent',
              marginBottom: -2,
              color: activeTab === tab.key ? '#4299e1' : '#718096',
              fontWeight: activeTab === tab.key ? 600 : 500,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'hours'    && <BusinessHoursTab me={me} />}
        {activeTab === 'schedule' && <BarberSchedulesTab me={me} />}
        {activeTab === 'blocked'  && <BlockedSlotsTab me={me} />}
      </div>
    </div>
  );
};

export default AvailabilityPage;
