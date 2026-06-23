import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const EMPTY = { name: '', description: '', color: '' };

const ServiceCategoryForm = ({ category, onClose, onSaved }) => {
  const [form,   setForm]   = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(category?.id);

  useEffect(() => {
    if (category) {
      setForm({
        name:        category.name        || '',
        description: category.description || '',
        color:       category.color       || '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [category]);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Category name is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const body = {
        name:        form.name.trim(),
        description: form.description,
        color:       form.color || null,
      };

      if (isEdit) {
        await api.put(`/api/admin/categories/${category.id}`, body);
        toast.success('Category updated');
      } else {
        await api.post('/api/admin/categories', body);
        toast.success('Category created');
      }
      onSaved();
    } catch (err) {
      const fieldErrors = err.response?.data?.errors || {};
      if (Object.keys(fieldErrors).length) {
        const mapped = {};
        Object.entries(fieldErrors).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : v;
        });
        setErrors(mapped);
      } else {
        toast.error(err.response?.data?.message || 'Failed to save category');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Category' : 'Add Category'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {/* Name */}
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Hair, Beard, Skin Care"
              />
              {errors.name && <p style={s.err}>{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Brief description of this category…"
              />
              {errors.description && <p style={s.err}>{errors.description}</p>}
            </div>

            {/* Color */}
            <div className="form-group">
              <label className="form-label">
                Color <span style={s.optional}>(optional)</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="color"
                  value={form.color || '#4299e1'}
                  onChange={(e) => set('color', e.target.value)}
                  style={s.colorPicker}
                />
                <input
                  className="form-input"
                  value={form.color}
                  onChange={(e) => set('color', e.target.value)}
                  placeholder="#4299e1"
                  style={{ maxWidth: 120 }}
                />
                {form.color && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => set('color', '')}
                  >
                    Clear
                  </button>
                )}
              </div>
              <p style={s.hint}>Displayed as a color tag on the services list.</p>
              {errors.color && <p style={s.err}>{errors.color}</p>}
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const s = {
  err:     { color: '#e53e3e', fontSize: 12, marginTop: 4 },
  optional:{ fontWeight: 400, color: '#a0aec0', fontSize: 12 },
  hint:    { fontSize: 11, color: '#a0aec0', margin: '4px 0 0' },
  colorPicker: {
    width: 44,
    height: 36,
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    cursor: 'pointer',
    padding: 2,
    flexShrink: 0,
  },
};

export default ServiceCategoryForm;
