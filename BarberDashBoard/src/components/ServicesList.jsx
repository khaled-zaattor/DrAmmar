import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { extractData, formatCurrency } from '../utils/helpers';
import ServiceForm from './ServiceForm';

const ServicesList = () => {
  const [services,       setServices]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showInactive,   setShowInactive]   = useState(false);
  const [deleting,       setDeleting]       = useState(null);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [editingService, setEditingService] = useState(null);

  // ── Fetch ────────────────────────────────────────────────
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/services');
      setServices(extractData(res));
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (service) => {
    if (!window.confirm(`Delete service "${service.name}"? This cannot be undone.`)) return;
    setDeleting(service.id);
    try {
      await api.delete(`/api/admin/services/${service.id}`);
      toast.success('Service deleted');
      setServices((prev) => prev.filter((sv) => sv.id !== service.id));
    } catch {
      toast.error('Failed to delete service');
    } finally {
      setDeleting(null);
    }
  };

  // ── Modal ────────────────────────────────────────────────
  const openCreate  = ()  => { setEditingService(null);    setModalOpen(true); };
  const openEdit    = (s) => { setEditingService(s);       setModalOpen(true); };
  const closeModal  = ()  => { setModalOpen(false);        setEditingService(null); };

  const handleSaved = () => {
    closeModal();
    fetchServices();
  };

  // ── Filter ───────────────────────────────────────────────
  const visible = showInactive
    ? services
    : services.filter((sv) => sv.is_active !== false);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Services</h1>
          <p className="page-subtitle">
            {visible.length} of {services.length} service{services.length !== 1 ? 's' : ''}
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
            + Add Service
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <span>Loading services…</span>
          </div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💈</div>
            <h3>No services found</h3>
            <p>
              {!showInactive && services.length > 0
                ? 'All services are inactive. Enable "Show inactive" to see them.'
                : 'Add your first service to get started.'}
            </p>
            <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 16 }}>
              + Add Service
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'center' }}>Bookings</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((service) => (
                  <tr key={service.id}>
                    <td style={{ color: '#a0aec0', fontSize: 12 }}>{service.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={s.iconBadge}>💈</div>
                        <span style={{ fontWeight: 500 }}>{service.name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={s.durationTag}>
                        {service.is_addon ? 'Add-on · No time reserved' : service.duration_minutes ? `${service.duration_minutes} min` : '—'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#276749' }}>
                      {service.price != null ? formatCurrency(service.price) : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={s.bookingBadge}>
                        {service.booking_count ?? 0}
                      </span>
                    </td>
                    <td>
                      {service.category ? (
                        <span style={s.categoryTag}>{service.category.name}</span>
                      ) : (
                        <span style={{ color: '#cbd5e0' }}>—</span>
                      )}
                    </td>
                    <td style={{
                      maxWidth: 220,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#718096',
                      fontSize: 13,
                    }}>
                      {service.description || <span style={{ color: '#cbd5e0' }}>—</span>}
                    </td>
                    <td>
                      {service.is_active !== false ? (
                        <span className="badge" style={s.activeTag}>Active</span>
                      ) : (
                        <span className="badge" style={s.inactiveTag}>Inactive</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(service)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(service)}
                          disabled={deleting === service.id}
                        >
                          {deleting === service.id ? '…' : 'Delete'}
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
        <ServiceForm
          service={editingService}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

const s = {
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: '#faf5ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
  },
  durationTag: {
    background: '#ebf8ff',
    color: '#2b6cb0',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  categoryTag: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: '#ebf4ff',
    color: '#2b6cb0',
    whiteSpace: 'nowrap',
  },
  activeTag:   { color: '#276749', background: '#f0fff4', border: '1px solid #9ae6b4' },
  inactiveTag: { color: '#718096', background: '#f7fafc', border: '1px solid #e2e8f0' },
  bookingBadge: {
    display: 'inline-block',
    minWidth: 28,
    padding: '2px 8px',
    borderRadius: 999,
    background: '#faf5ff',
    color: '#553c9a',
    fontWeight: 700,
    fontSize: 13,
    textAlign: 'center',
  },
};

export default ServicesList;
