import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const EMPTY = { name: '', email: '', phone: '', bio: '', is_active: true };

const BarberForm = ({ barber, onClose, onSaved }) => {
  const [form,               setForm]               = useState(EMPTY);
  const [allServices,        setAllServices]        = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [saving,             setSaving]             = useState(false);
  const [errors,             setErrors]             = useState({});

  // Image state
  const [imageFile,    setImageFile]    = useState(null);   // new File chosen
  const [imagePreview, setImagePreview] = useState(null);   // preview URL
  const [removeImage,  setRemoveImage]  = useState(false);  // flag to delete existing
  const fileInputRef = useRef(null);

  const isEdit = Boolean(barber?.id);

  // Fetch all available services once
  useEffect(() => {
    api.get('/api/admin/services')
      .then((res) => {
        const list = res.data?.data;
        const services = Array.isArray(list) ? list : (list?.data ?? []);
        setAllServices(services);
        // Auto-select all services when adding a new barber
        if (!barber?.id) {
          setSelectedServiceIds(services.map((s) => s.id));
        }
      })
      .catch(() => {});
  }, []);

  // Populate form when barber prop changes
  useEffect(() => {
    if (barber) {
      setForm({
        name:      barber.name      || '',
        email:     barber.email     || '',
        phone:     barber.phone     || '',
        bio:       barber.bio       || '',
        is_active: barber.is_active !== undefined ? barber.is_active : true,
      });
      const ids = (barber.services ?? []).map((s) => s.id);
      setSelectedServiceIds(ids);
      // Show existing image
      setImagePreview(barber.photo_url || barber.image_url || barber.photo || null);
    } else {
      setForm(EMPTY);
      setSelectedServiceIds([]);
      setImagePreview(null);
    }
    setImageFile(null);
    setRemoveImage(false);
    setErrors({});
  }, [barber]);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const toggleService = (id) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allSelected = allServices.length > 0 && selectedServiceIds.length === allServices.length;

  const selectAllServices = () => {
    if (allSelected) {
      setSelectedServiceIds([]);
    } else {
      setSelectedServiceIds(allServices.map((s) => s.id));
    }
  };

  // ── Image handling ────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    // Validate size (max 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2 MB');
      return;
    }

    setImageFile(file);
    setRemoveImage(false);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Validation ────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      // Use FormData so we can send the image file
      const fd = new FormData();
      fd.append('name',      form.name);
      fd.append('email',     form.email);
      fd.append('phone',     form.phone);
      fd.append('bio',       form.bio);
      fd.append('is_active', form.is_active ? '1' : '0');
      selectedServiceIds.forEach((id) => fd.append('service_ids[]', id));

      if (imageFile) {
        fd.append('image', imageFile);
      }
      if (removeImage) {
        fd.append('remove_image', '1');
      }

      let savedBarber;
      if (isEdit) {
        // Laravel doesn't support PUT with multipart — use POST + _method spoofing
        fd.append('_method', 'PUT');
        const res = await api.post(`/api/admin/barbers/${barber.id}`, fd);
        savedBarber = res.data?.data || res.data;
        toast.success('Barber updated');
      } else {
        const res = await api.post('/api/admin/barbers', fd);
        savedBarber = res.data?.data || res.data;
        toast.success('Barber created');
      }
      onSaved(savedBarber);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save barber';
      const fieldErrors = err.response?.data?.errors || {};
      if (Object.keys(fieldErrors).length) {
        const mapped = {};
        Object.entries(fieldErrors).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : v;
        });
        setErrors(mapped);
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Barber' : 'Add New Barber'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {/* ── Photo Upload ── */}
            <div className="form-group">
              <label className="form-label">Profile Photo</label>
              <div style={s.photoArea}>
                {/* Preview */}
                <div style={s.photoPreview}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={s.previewImg} />
                  ) : (
                    <div style={s.photoPlaceholder}>
                      <span style={{ fontSize: 32 }}>✂</span>
                      <span style={{ fontSize: 11, color: '#a0aec0', marginTop: 4 }}>No photo</span>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div style={s.photoControls}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ fontSize: 13 }}
                  >
                    📁 {imagePreview ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={handleRemoveImage}
                      style={{ fontSize: 13, background: '#fff5f5', color: '#e53e3e', border: '1px solid #feb2b2' }}
                    >
                      ✕ Remove
                    </button>
                  )}
                  <p style={s.photoHint}>JPG, PNG · max 2 MB</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              {errors.image && <p style={s.err}>{errors.image}</p>}
            </div>

            {/* Name */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. John Smith"
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
                placeholder="barber@example.com"
              />
              {errors.email && <p style={s.err}>{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+1 555 000 0000"
              />
            </div>

            {/* Bio */}
            <div className="form-group">
              <label className="form-label">Bio / Description</label>
              <textarea
                className="form-textarea"
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="Short description about this barber…"
                rows={3}
              />
            </div>

            {/* Services */}
            <div className="form-group">
              <label className="form-label">
                Services Offered
                <span style={{ fontWeight: 400, color: '#a0aec0', marginLeft: 6, fontSize: 12 }}>
                  (customers can only book barbers assigned to their chosen service)
                </span>
              </label>
              {allServices.length > 0 && (
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, cursor: 'pointer', fontSize: 13, color: '#4a5568' }}
                  onClick={selectAllServices}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={selectAllServices}
                    style={{ accentColor: '#4299e1' }}
                  />
                  Select All
                </label>
              )}
              {allServices.length === 0 ? (
                <p style={{ color: '#a0aec0', fontSize: 13 }}>No services found. Add services first.</p>
              ) : (
                <div style={s.serviceGrid}>
                  {allServices.map((svc) => {
                    const checked = selectedServiceIds.includes(svc.id);
                    return (
                      <label
                        key={svc.id}
                        style={{ ...s.serviceItem, ...(checked ? s.serviceItemChecked : {}) }}
                        onClick={() => toggleService(svc.id)}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleService(svc.id)}
                          style={{ marginRight: 8, accentColor: '#4299e1' }}
                        />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{svc.name}</div>
                          <div style={{ fontSize: 11, color: checked ? '#90cdf4' : '#a0aec0' }}>
                            ${svc.price} · {svc.duration_minutes} min
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              {selectedServiceIds.length === 0 && (
                <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 6 }}>
                  ⚠ No services selected — this barber won't appear in the booking site.
                </p>
              )}
            </div>

            {/* Active */}
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => set('is_active', e.target.checked)}
              />
              Active (visible to customers)
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Barber'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const s = {
  err: { color: '#e53e3e', fontSize: 12, marginTop: 4 },

  // Photo upload
  photoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '14px',
    background: '#f8fafc',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    border: '2px solid #e2e8f0',
    background: '#edf2f7',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#edf2f7',
    color: '#a0aec0',
  },
  photoControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    alignItems: 'flex-start',
  },
  photoHint: {
    fontSize: 11,
    color: '#a0aec0',
    margin: 0,
  },

  // Services grid
  serviceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 8,
    marginTop: 6,
  },
  serviceItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 4,
    padding: '8px 10px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    cursor: 'pointer',
    background: '#f8fafc',
    transition: 'all 0.15s',
  },
  serviceItemChecked: {
    border: '1px solid #4299e1',
    background: '#ebf8ff',
  },
};

export default BarberForm;
