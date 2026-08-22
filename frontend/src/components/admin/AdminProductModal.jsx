import React from 'react';
import { X } from 'lucide-react';

const AdminProductModal = ({
  show,
  editingProduct,
  productForm,
  setProductForm,
  categories,
  onSave,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '580px',
          borderRadius: '24px',
          padding: '28px',
          background: '#ffffff',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a' }}>
            {editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} color="#64748b" />
          </button>
        </div>

        <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '4px',
              }}
            >
              Product Title
            </label>
            <input
              type="text"
              required
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              placeholder="Fresh Organic Avocados"
              className="input-control"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                Category
              </label>
              <select
                value={productForm.categoryId}
                onChange={(e) =>
                  setProductForm({ ...productForm, categoryId: parseInt(e.target.value) })
                }
                className="input-control"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                Brand / Farm
              </label>
              <input
                type="text"
                value={productForm.brand}
                onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                placeholder="Farm Fresh"
                className="input-control"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                Selling Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={productForm.sellingPrice}
                onChange={(e) => setProductForm({ ...productForm, sellingPrice: e.target.value })}
                placeholder="120"
                className="input-control"
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                MRP (₹)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={productForm.mrp}
                onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                placeholder="150"
                className="input-control"
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                Unit / Weight
              </label>
              <input
                type="text"
                value={productForm.unitQuantity}
                onChange={(e) => setProductForm({ ...productForm, unitQuantity: e.target.value })}
                placeholder="500 g"
                className="input-control"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                Initial Stock
              </label>
              <input
                type="number"
                value={productForm.stockQuantity}
                onChange={(e) =>
                  setProductForm({ ...productForm, stockQuantity: parseInt(e.target.value) || 0 })
                }
                className="input-control"
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                Low Stock Alert Below
              </label>
              <input
                type="number"
                value={productForm.lowStockThreshold}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    lowStockThreshold: parseInt(e.target.value) || 0,
                  })
                }
                className="input-control"
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '4px',
              }}
            >
              Image URL
            </label>
            <input
              type="url"
              value={productForm.imageUrl}
              onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
              className="input-control"
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={productForm.isFeatured}
                onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
              />
              Featured Product
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={productForm.isDailyDeal}
                onChange={(e) => setProductForm({ ...productForm, isDailyDeal: e.target.checked })}
              />
              Deal of the Day
            </label>
          </div>

          <div
            style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}
          >
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductModal;
