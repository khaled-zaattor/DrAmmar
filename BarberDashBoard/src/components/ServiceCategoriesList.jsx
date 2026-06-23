import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { extractData } from '../utils/helpers';
import ServiceCategoryForm from './ServiceCategoryForm';

const ServiceCategoriesList = () => {
  const [categories,       setCategories]       = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [deleting,         setDeleting]         = useState(null);
  const [modalOpen,        setModalOpen]        = useState(false);
  const [editingCategory,  setEditingCategory]  = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/categories');
      setCategories(extractData(res));
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    setDeleting(cat.id);
    try {
      await api.delete(`/api/admin/categories/${cat.id}`);
      toast.success('Category deleted');
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  const openCreate = () => { setEditingCategory(null); setModalOpen(true); };
  const openEdit   = (cat) => { setEditingCategory(cat); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingCategory(null); };

  const handleSaved = () => {
    closeModal();
    fetchCategories();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Service Categories</h1>
          <p className="page-subtitle">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Category
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-container" style={{ padding: '60px 0' }}>
            <div className="loading-spinner" />
            <span>Loading categories…</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏷</div>
            <h3>No categories yet</h3>
            <p>Create your first category to organise services.</p>
            <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 16 }}>
              + Add Category
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Color</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ color: '#a0aec0', fontSize: 12 }}>{cat.id}</td>

                    <td style={{ fontWeight: 500 }}>{cat.name}</td>

                    <td>
                      {cat.color ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '3px 10px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          background: cat.color + '22',
                          color: cat.color,
                          border: `1px solid ${cat.color}55`,
                        }}>
                          <span style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: cat.color,
                            flexShrink: 0,
                          }} />
                          {cat.color}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e0' }}>—</span>
                      )}
                    </td>

                    <td style={{
                      maxWidth: 260,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#718096',
                      fontSize: 13,
                    }}>
                      {cat.description || <span style={{ color: '#cbd5e0' }}>—</span>}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(cat)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleDelete(cat)}
                          disabled={deleting === cat.id}
                          style={{ background: '#fff5f5', color: '#e53e3e', border: '1px solid #feb2b2' }}
                        >
                          {deleting === cat.id ? '…' : 'Delete'}
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

      {modalOpen && (
        <ServiceCategoryForm
          category={editingCategory}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default ServiceCategoriesList;
