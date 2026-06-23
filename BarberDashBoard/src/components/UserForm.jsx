import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ROLES = ['admin', 'receptionist', 'barber'];
const EMPTY  = { name: '', email: '', password: '', role: 'receptionist', is_active: true, barber_id: '' };

/**
 * UserForm — modal for creating or editing a dashboard user.
 * Props:
 *  user     – existing user object (edit mode) or null (create mode)
 *  onClose  – close the modal
 *  onSaved  – callback after successful save
 */
const UserForm = ({ user, onClose, onSaved }) => {
  const { user: me } = useAuth();
  const [form,           setForm]           = useState(EMPTY);
  const [saving,         setSaving]         = useState(false);
  const [errors,         setErrors]         = useState({});
  const [linkableBarbers, setLinkableBarbers] = useState([]);
  const [loadingBarbers,  setLoadingBarbers]  = useState(false);

  const isEdit = Boolean(user?.id);
  const isMe   = user?.id === me?.id;

  useEffect(() => {
    if (user) {
      setForm({
        name:      user.name      || '',
        email:     user.email     || '',
        password:  '',
        role:      user.role      || 'receptionist',
        is_active: user.is_active !== undefined ? user.is_active : true,
        barber_id: user.barber?.id ? String(user.barber.id) : '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [user]);

  useEffect(() => {
    setLoadingBarbers(true);
    const params = isEdit ? { except_user_id: user.id } : {};
    api.get('/api/admin/users/linkable-barbers', { params })
      .then((r) => setLinkableBarbers(r.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingBarbers(false));
  }, [isEdit, user?.id]);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!isEdit && form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      if (isEdit) {
        const payload = {
          name:      form.name,
          email:     form.email,
          role:      form.role,
          is_active: form.is_active,
          barber_id: form.role === 'barber' ? (form.barber_id || null) : null,
        };
        await api.put(`/api/admin/users/${user.id}`, payload);
        toast.success('User updated');
      } else {
        await api.post('/api/admin/users', form);
        toast.success('User created');
      }
      onSaved();
    } catch (err) {
      const fieldErrors = err.response?.data?.errors || {};
      if (Object.keys(fieldErrors).length) {
        const mapped = {};
        Object.entries(fieldErrors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(mapped);
      } else {
        toast.error(err.response?.data?.message || 'Failed to save user');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? `Edit — ${user.name}` : 'Add New User'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Sarah Johnson"
              />
              {errors.name && <p style={s.err}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="staff@example.com"
              />
              {errors.email && <p style={s.err}>{errors.email}</p>}
            </div>

            {/* Password — only on create */}
            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className="form-input"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="Minimum 8 characters"
                />
                {errors.password && <p style={s.err}>{errors.password}</p>}
              </div>
            )}

            {/* Role */}
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select
                className="form-select"
                value={form.role}
                onChange={(e) => {
                  const newRole = e.target.value;
                  set('role', newRole);
                  if (newRole !== 'barber') set('barber_id', '');
                }}
                disabled={isMe}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
              {isMe && (
                <p style={{ fontSize: 12, color: '#a0aec0', marginTop: 4 }}>
                  You cannot change your own role.
                </p>
              )}
            </div>

            {/* Barber link — only when role is barber */}
            {form.role === 'barber' && (
              <div className="form-group">
                <label className="form-label">Link to Barber Profile</label>
                {loadingBarbers ? (
                  <p style={{ fontSize: 13, color: '#a0aec0' }}>Loading barbers…</p>
                ) : linkableBarbers.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#e53e3e' }}>
                    No unlinked barber profiles available. Create a barber profile first.
                  </p>
                ) : (
                  <select
                    className="form-select"
                    value={form.barber_id}
                    onChange={(e) => set('barber_id', e.target.value)}
                  >
                    <option value="">— No barber linked —</option>
                    {linkableBarbers.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
                {errors.barber_id && <p style={s.err}>{errors.barber_id}</p>}
              </div>
            )}

            {/* Active — hide for yourself */}
            {!isMe && (
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => set('is_active', e.target.checked)}
                />
                Active (can log in to dashboard)
              </label>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const s = {
  err: { color: '#e53e3e', fontSize: 12, marginTop: 4 },
};

export default UserForm;
