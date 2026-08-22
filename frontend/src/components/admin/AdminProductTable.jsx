import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminProductTable = ({ products, onAddProduct, onEditProduct, onDeleteProduct }) => {
  return (
    <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>Catalog Products ({products.length})</h3>
        <button
          onClick={onAddProduct}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', color: '#64748b' }}>
              <th style={{ padding: '12px 8px' }}>Product</th>
              <th style={{ padding: '12px 8px' }}>Category</th>
              <th style={{ padding: '12px 8px' }}>Price</th>
              <th style={{ padding: '12px 8px' }}>Stock</th>
              <th style={{ padding: '12px 8px' }}>Badges</th>
              <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={product.imageUrl}
                    alt=""
                    style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{product.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{product.unitQuantity}</div>
                  </div>
                </td>
                <td style={{ padding: '12px 8px', color: '#64748b' }}>{product.categoryName}</td>
                <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0f172a' }}>₹{product.sellingPrice}</td>
                <td style={{ padding: '12px 8px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: product.stockQuantity <= product.lowStockThreshold ? '#fef2f2' : '#ecfdf5',
                    color: product.stockQuantity <= product.lowStockThreshold ? '#ef4444' : '#059669',
                  }}>
                    {product.stockQuantity} in stock
                  </span>
                </td>
                <td style={{ padding: '12px 8px' }}>
                  {product.isFeatured && <span className="badge badge-featured" style={{ marginRight: '4px' }}>Featured</span>}
                  {product.isDailyDeal && <span className="badge badge-discount">Deal</span>}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => onEditProduct(product)}
                      style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#2563eb' }}
                      title="Edit"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      style={{ background: '#fef2f2', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#ef4444' }}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductTable;
