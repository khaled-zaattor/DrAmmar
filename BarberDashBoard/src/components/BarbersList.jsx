import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { extractData } from '../utils/helpers';
import BarberForm from './BarberForm';

const BarbersList = () => {
  const [barbers,       setBarbers]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showInactive,  setShowInactive]  = useState(false);
  const [deleting,      setDeleting]      = useState(null);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editingBarber, setEditingBarber] = useState(null); // null = create mode

  // ── Fetch ────────────────────────────────────────────────
  const fetchBarbers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/barbers');
      setBarbers(extractData(res));
    } catch {
      toast.error('Failed to load barbers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBarbers(); }, [fetchBarbers]);

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (barber) => {
    if (!window.confirm(`Delete barber "${barber.name}"? This cannot be undone.`)) return;
    setDeleting(barber.id);
    try {
      await api.delete(`/api/admin/barbers/${barber.id}`);
      toast.success('Barber deleted');
      setBarbers((prev) => prev.filter((b) => b.id !== barber.id));
    } catch {
      toast.error('Failed to delete barber');
    } finally {
      setDeleting(null);
    }
  };

  // ── Open modal ───────────────────────────────────────────
  const openCreate = () => { setEditingBarber(null); setModalOpen(true); };
  const openEdit   = (b)  => { setEditingBarber(b);  setModalOpen(true); };
  const closeModal = ()   => { setModalOpen(false);  setEditingBarber(null); };

  const handleSaved = (savedBarber) => {
    closeModal();
    fetchBarbers();
    // If we have the saved barber with photo_url, update the list immediately
    if (savedBarber) {
      setBarbers((prev) => {
        const idx = prev.findIndex((b) => b.id === savedBarber.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...savedBarber };
          return updated;
        }
        return prev;
      });
    }
  };

  // ── Filter ───────────────────────────────────────────────
  const visible = showInactive
    ? barbers
    : barbers.filter((b) => b.is_active !== false);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Barbers</h1>
          <p className="page-subtitle">
            {visible.length} of {barbers.length} barber{barbers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#718096', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              style={{ accentColor: '#4299e1' }}
            />
            Show inactive
          </label>
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Barber
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <span>Loading barbers…</span>
          </div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✂</div>
            <h3>No barbers found</h3>
            <p>
              {!showInactive && barbers.length > 0
                ? 'All barbers are inactive. Enable "Show inactive" to see them.'
                : 'Add your first barber to get started.'}
            </p>
            <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 16 }}>
              + Add Barber
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Bio</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((barber) => (
                  <tr key={barber.id}>
                    <td style={{ color: '#a0aec0', fontSize: 12 }}>{barber.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={s.avatar}>
                          {barber.name ? barber.name[0].toUpperCase() : '?'}
                        </div>
                        <span style={{ fontWeight: 500 }}>{barber.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#718096' }}>{barber.email || '—'}</td>
                    <td style={{ color: '#718096' }}>{barber.phone || '—'}</td>
                    <td style={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#718096',
                      fontSize: 13,
                    }}>
                      {barber.bio || <span style={{ color: '#cbd5e0' }}>—</span>}
                    </td>
                    <td>
                      {barber.is_active !== false ? (
                        <span className="badge" style={s.activeTag}>Active</span>
                      ) : (
                        <span className="badge" style={s.inactiveTag}>Inactive</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(barber)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(barber)}
                          disabled={deleting === barber.id}
                        >
                          {deleting === barber.id ? '…' : 'Delete'}
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

      {/* Modal */}
      {modalOpen && (
        <BarberForm
          barber={editingBarber}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

const s = {
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4299e1, #3182ce)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },
  activeTag:   { color: '#276749', background: '#f0fff4', border: '1px solid #9ae6b4' },
  inactiveTag: { color: '#718096', background: '#f7fafc', border: '1px solid #e2e8f0' },
};

export default BarbersList;
