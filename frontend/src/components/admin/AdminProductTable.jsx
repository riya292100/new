import React from 'react';
import PropTypes from 'prop-types';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminProductTable = ({
  products = [],
  onAddProduct = () => {},
  onEditProduct = () => {},
  onDeleteProduct = () => {},
}) => {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid #e2e8f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>
          Catalog Products ({products.length})
        </h3>
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
                <td
                  style={{
                    padding: '12px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <img
                    src={product.imageUrl}
                    alt=""
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{product.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {product.brand} • {product.unitQuantity}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 8px', color: '#475569' }}>
                  {product.categoryName || 'General'}
                </td>
                <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0f172a' }}>
                  ₹{product.price || product.sellingPrice}
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <span
                    className={`badge ${
                      (product.stockQuantity || 0) <= 10 ? 'badge-danger' : 'badge-success'
                    }`}
                  >
                    {product.stockQuantity} in stock
                  </span>
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {product.isFeatured && (
                      <span
                        className="badge badge-featured"
                        style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                      >
                        Featured
                      </span>
                    )}
                    {product.isDailyDeal && (
                      <span
                        className="badge badge-deal"
                        style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                      >
                        Deal
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onEditProduct(product)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '6px' }}
                      title="Edit Product"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '6px' }}
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
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

AdminProductTable.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object),
  onAddProduct: PropTypes.func,
  onEditProduct: PropTypes.func,
  onDeleteProduct: PropTypes.func,
};

export default AdminProductTable;
