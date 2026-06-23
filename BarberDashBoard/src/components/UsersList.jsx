import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import UserForm from './UserForm';

const ROLE_STYLE = {
  admin:        { color: '#e53e3e', background: 'rgba(229,62,62,0.1)',   border: 'rgba(229,62,62,0.3)'   },
  receptionist: { color: '#4299e1', background: 'rgba(66,153,225,0.1)',  border: 'rgba(66,153,225,0.3)'  },
  barber:       { color: '#48bb78', background: 'rgba(72,187,120,0.1)',  border: 'rgba(72,187,120,0.3)'  },
};

const UsersList = () => {
  const { user: me } = useAuth();

  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [formTarget, setFormTarget] = useState(undefined); // undefined = closed, null = new, object = edit
  const [pwdTarget,  setPwdTarget]  = useState(null);      // user being password-changed
  const [pwdForm,    setPwdForm]    = useState({ new_password: '', new_password_confirmation: '' });
  const [pwdSaving,  setPwdSaving]  = useState(false);
  const [toggling,   setToggling]   = useState(null);
  const [deleting,   setDeleting]   = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data?.data ?? []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Toggle active/disabled ──────────────────────────────
  const handleToggle = async (user) => {
    if (user.id === me?.id) {
      toast.warn('You cannot disable your own account.');
      return;
    }
    setToggling(user.id);
    try {
      await api.put(`/api/admin/users/${user.id}`, { is_active: !user.is_active });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
      toast.success(user.is_active ? 'User disabled' : 'User enabled');
    } catch {
      toast.error('Failed to update user status');
    } finally {
      setToggling(null);
    }
  };

  // ── Delete ──────────────────────────────────────────────
  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    setDeleting(user.id);
    try {
      await api.delete(`/api/admin/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  // ── Change Password ─────────────────────────────────────
  const openPwd = (user) => {
    setPwdTarget(user);
    setPwdForm({ new_password: '', new_password_confirmation: '' });
  };

  const handlePwdSave = async () => {
    if (!pwdForm.new_password || pwdForm.new_password.length < 8) {
      toast.warn('Password must be at least 8 characters');
      return;
    }
    if (pwdForm.new_password !== pwdForm.new_password_confirmation) {
      toast.warn('Passwords do not match');
      return;
    }
    setPwdSaving(true);
    try {
      await api.put(`/api/admin/users/${pwdTarget.id}/password`, pwdForm);
      toast.success(`Password changed for ${pwdTarget.name}`);
      setPwdTarget(null);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach((m) => toast.error(m));
      else toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage dashboard staff accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setFormTarget(null)}>
          + Add User
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <span>Loading users…</span>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <h3>No users found</h3>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const rs  = ROLE_STYLE[user.role] ?? ROLE_STYLE.receptionist;
                  const isMe = user.id === me?.id;
                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {user.name}
                          {isMe && (
                            <span style={{ fontSize: 11, color: '#4299e1', marginLeft: 6 }}>
                              (you)
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: '#718096', fontSize: 13 }}>{user.email}</td>
                      <td>
                        <span
                          className="badge"
                          style={{ color: rs.color, background: rs.background, border: `1px solid ${rs.border}` }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={
                            user.is_active
                              ? { color: '#48bb78', background: 'rgba(72,187,120,0.1)', border: '1px solid rgba(72,187,120,0.3)' }
                              : { color: '#a0aec0', background: 'rgba(160,174,192,0.1)', border: '1px solid rgba(160,174,192,0.3)' }
                          }
                        >
                          {user.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setFormTarget(user)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openPwd(user)}
                            style={{ border: '1px solid #4a5568' }}
                          >
                            Password
                          </button>
                          {!isMe && (
                            <>
                              <button
                                className={`btn btn-sm ${user.is_active ? 'btn-secondary' : 'btn-primary'}`}
                                onClick={() => handleToggle(user)}
                                disabled={toggling === user.id}
                              >
                                {toggling === user.id ? '…' : user.is_active ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(user)}
                                disabled={deleting === user.id}
                              >
                                {deleting === user.id ? '…' : 'Delete'}
                              </button>
                            </>
                          )}
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

      {/* Add / Edit modal */}
      {formTarget !== undefined && (
        <UserForm
          user={formTarget}
          onClose={() => setFormTarget(undefined)}
          onSaved={() => {
            setFormTarget(undefined);
            fetchUsers();
          }}
        />
      )}

      {/* Change Password modal */}
      {pwdTarget && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setPwdTarget(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Change Password — {pwdTarget.name}</h2>
              <button className="modal-close" onClick={() => setPwdTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">New Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Minimum 8 characters"
                  value={pwdForm.new_password}
                  onChange={(e) => setPwdForm((f) => ({ ...f, new_password: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Repeat the password"
                  value={pwdForm.new_password_confirmation}
                  onChange={(e) => setPwdForm((f) => ({ ...f, new_password_confirmation: e.target.value }))}
                />
              </div>
              <p style={{ fontSize: 12, color: '#a0aec0', marginTop: 8 }}>
                After saving, this user's active sessions will be revoked and they must log in again.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPwdTarget(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handlePwdSave} disabled={pwdSaving}>
                {pwdSaving ? 'Saving…' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
