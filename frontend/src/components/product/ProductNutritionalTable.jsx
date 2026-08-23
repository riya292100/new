import React from 'react';
import PropTypes from 'prop-types';
import { Sparkles, ShieldCheck } from 'lucide-react';

const ProductNutritionalTable = ({ highlights = [] }) => {
  const defaultNutrition = [
    { label: 'Energy / Calories', value: '110 kcal' },
    { label: 'Dietary Fiber', value: '3.2 g' },
    { label: 'Carbohydrates', value: '18.4 g' },
    { label: 'Protein', value: '2.1 g' },
    { label: 'Natural Sugars', value: '12.0 g' },
  ];

  const nutritionData = highlights.length > 0 ? highlights : defaultNutrition;

  return (
    <div style={{ marginTop: '16px' }}>
      <h4
        style={{
          fontSize: '0.92rem',
          color: '#0f172a',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Sparkles size={16} color="#059669" /> Nutritional Highlights & Freshness
      </h4>

      <div
        style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          marginBottom: '12px',
        }}
      >
        <span className="qc-nutrition-badge badge-organic">
          <ShieldCheck size={12} /> 100% Organic
        </span>
        <span className="qc-nutrition-badge badge-farm">Farm Fresh</span>
        <span className="qc-nutrition-badge badge-clean">Zero Chemical Preservatives</span>
      </div>

      <div
        style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '12px 16px',
          border: '1px solid #f1f5f9',
        }}
      >
        <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
          <tbody>
            {nutritionData.map((item, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: idx < nutritionData.length - 1 ? '1px solid #e2e8f0' : 'none',
                }}
              >
                <td style={{ padding: '6px 0', color: '#64748b', fontWeight: '500' }}>
                  {item.label}
                </td>
                <td
                  style={{
                    padding: '6px 0',
                    color: '#0f172a',
                    fontWeight: '700',
                    textAlign: 'right',
                  }}
                >
                  {item.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

ProductNutritionalTable.propTypes = {
  highlights: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
};

export default ProductNutritionalTable;
