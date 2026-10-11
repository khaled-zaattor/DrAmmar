import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { extractData } from '../utils/helpers';

const EMPTY = { name: '', duration_minutes: '', price: '', description: '', is_active: true, is_addon: false, booking_count: '0', category_id: '' };

const ServiceForm = ({ service, onClose, onSaved }) => {
  const [form,   setForm]   = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Image state
  const [categories,   setCategories]   = useState([]);

  // Image state
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage,  setRemoveImage]  = useState(false);
  const fileInputRef = useRef(null);

  const isEdit = Boolean(service?.id);

  useEffect(() => {
    if (service) {
      setForm({
        name:             service.name             || '',
        duration_minutes: service.duration_minutes != null ? String(service.duration_minutes) : '',
        price:            service.price            != null ? String(service.price) : '',
        description:      service.description      || '',
        is_active:        service.is_active !== undefined ? service.is_active : true,
        is_addon:         Boolean(service.is_addon),
        booking_count:    service.booking_count != null ? String(service.booking_count) : '0',
        category_id:      service.category_id != null ? String(service.category_id) : '',
      });
      setImagePreview(service.image_url || service.photo_url || service.image || null);
    } else {
      setForm(EMPTY);
      setImagePreview(null);
    }
    setImageFile(null);
    setRemoveImage(false);
    setErrors({});
  }, [service]);

  useEffect(() => {
    api.get('/api/admin/categories')
      .then((res) => setCategories(extractData(res)))
      .catch(() => {});
  }, []);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  // ── Image handling ────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, etc.)');
      return;
    }
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
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.is_addon && (!form.duration_minutes || !Number.isInteger(Number(form.duration_minutes)) || Number(form.duration_minutes) < 5 || Number(form.duration_minutes) > 480))
      errs.duration_minutes = 'Duration must be between 5 and 480 minutes';
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0)
      errs.price = 'Valid price is required';
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name',             form.name);
      fd.append('duration_minutes', form.is_addon ? 0 : Number(form.duration_minutes));
      fd.append('is_addon', form.is_addon ? '1' : '0');
      fd.append('price',            Number(form.price));
      fd.append('description',      form.description);
      fd.append('is_active',        form.is_active ? '1' : '0');
      fd.append('booking_count',    Number(form.booking_count) || 0);
      if (form.category_id) fd.append('category_id', form.category_id);

      if (imageFile) {
        fd.append('image', imageFile);
      }
      if (removeImage) {
        fd.append('remove_image', '1');
      }

      if (isEdit) {
        // Laravel method spoofing — PUT via POST for multipart
        fd.append('_method', 'PUT');
        await api.post(`/api/admin/services/${service.id}`, fd);
        toast.success('Service updated');
      } else {
        await api.post('/api/admin/services', fd);
        toast.success('Service created');
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save service';
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
          <h2 className="modal-title">{isEdit ? 'Edit Service' : 'Add New Service'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {/* ── Image Upload ── */}
            <div className="form-group">
              <label className="form-label">Service Image</label>
              <div style={s.imageArea}>
                {/* Preview */}
                <div style={s.imagePreviewBox}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={s.previewImg} />
                  ) : (
                    <div style={s.imagePlaceholder}>
                      <span style={{ fontSize: 28 }}>💈</span>
                      <span style={{ fontSize: 11, color: '#a0aec0', marginTop: 4 }}>No image</span>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div style={s.imageControls}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ fontSize: 13 }}
                  >
                    📁 {imagePreview ? 'Change Image' : 'Upload Image'}
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
                  <p style={s.imageHint}>JPG, PNG · max 2 MB</p>
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

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category_id}
                onChange={(e) => set('category_id', e.target.value)}
              >
                <option value="">— No category —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p style={s.err}>{errors.category_id}</p>}
            </div>

            {/* Name */}
            <div className="form-group">
              <label className="form-label">Service Name *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Haircut & Style"
              />
              {errors.name && <p style={s.err}>{errors.name}</p>}
            </div>

            {/* Duration + Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Duration (minutes){form.is_addon ? '' : ' *'}</label>
                <input
                  type="number"
                  min={form.is_addon ? '0' : '5'}
                  max="480"
                  disabled={form.is_addon}
                  className="form-input"
                  value={form.is_addon ? '0' : form.duration_minutes}
                  onChange={(e) => set('duration_minutes', e.target.value)}
                  placeholder="30"
                />
                {errors.duration_minutes && <p style={s.err}>{errors.duration_minutes}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  placeholder="25.00"
                />
                {errors.price && <p style={s.err}>{errors.price}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={form.is_addon}
                  onChange={(e) => set('is_addon', e.target.checked)}
                />
                Add-on service — no time reserved
              </label>
              <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 0' }}>
                Customers still choose a barber, date and time. Can be booked alone or with other services, including alongside existing appointments.
              </p>
              {errors.is_addon && <p style={s.err}>{errors.is_addon}</p>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe what this service includes…"
                rows={3}
              />
            </div>

            {/* Booking Count */}
            <div className="form-group">
              <label className="form-label">Booking Count</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={form.booking_count}
                onChange={(e) => set('booking_count', e.target.value)}
                placeholder="0"
                style={{ maxWidth: 140 }}
              />
              <p style={{ fontSize: 11, color: '#a0aec0', margin: '4px 0 0' }}>
                Auto-incremented on each booking. Editable for manual corrections.
              </p>
              {errors.booking_count && <p style={s.err}>{errors.booking_count}</p>}
            </div>

            {/* Active */}
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => set('is_active', e.target.checked)}
              />
              Active (available for booking)
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const s = {
  err: { color: '#e53e3e', fontSize: 12, marginTop: 4 },

  imageArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '14px',
    background: '#f8fafc',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
  },
  imagePreviewBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
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
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#edf2f7',
    color: '#a0aec0',
  },
  imageControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    alignItems: 'flex-start',
  },
  imageHint: {
    fontSize: 11,
    color: '#a0aec0',
    margin: 0,
  },
};

export default ServiceForm;
