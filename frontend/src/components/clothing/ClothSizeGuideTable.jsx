import React from 'react';

const ClothSizeGuideTable = () => {
  return (
    <div
      style={{
        background: '#f8fafc',
        borderRadius: '10px',
        padding: '10px',
        border: '1px solid #e2e8f0',
        marginBottom: '10px',
        fontSize: '0.75rem',
      }}
    >
      <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#64748b', borderBottom: '1px solid #cbd5e1' }}>
            <th style={{ padding: '4px' }}>Size</th>
            <th style={{ padding: '4px' }}>Chest (in)</th>
            <th style={{ padding: '4px' }}>Length (in)</th>
            <th style={{ padding: '4px' }}>Waist (in)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '4px', fontWeight: '700' }}>S</td>
            <td style={{ padding: '4px' }}>38&quot;</td>
            <td style={{ padding: '4px' }}>27&quot;</td>
            <td style={{ padding: '4px' }}>30&quot;</td>
          </tr>
          <tr>
            <td style={{ padding: '4px', fontWeight: '700' }}>M</td>
            <td style={{ padding: '4px' }}>40&quot;</td>
            <td style={{ padding: '4px' }}>28&quot;</td>
            <td style={{ padding: '4px' }}>32&quot;</td>
          </tr>
          <tr>
            <td style={{ padding: '4px', fontWeight: '700' }}>L</td>
            <td style={{ padding: '4px' }}>42&quot;</td>
            <td style={{ padding: '4px' }}>29&quot;</td>
            <td style={{ padding: '4px' }}>34&quot;</td>
          </tr>
          <tr>
            <td style={{ padding: '4px', fontWeight: '700' }}>XL</td>
            <td style={{ padding: '4px' }}>44&quot;</td>
            <td style={{ padding: '4px' }}>30&quot;</td>
            <td style={{ padding: '4px' }}>36&quot;</td>
          </tr>
          <tr>
            <td style={{ padding: '4px', fontWeight: '700' }}>XXL</td>
            <td style={{ padding: '4px' }}>46&quot;</td>
            <td style={{ padding: '4px' }}>31&quot;</td>
            <td style={{ padding: '4px' }}>38&quot;</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ClothSizeGuideTable;
