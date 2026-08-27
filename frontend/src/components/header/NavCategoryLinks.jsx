import React from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Utensils } from 'lucide-react';

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  textDecoration: 'none',
  color: '#065f46',
  fontWeight: '700',
  fontSize: '0.86rem',
  padding: '8px 14px',
  borderRadius: '12px',
  background: '#ecfdf5',
  border: '1px solid #a7f3d0',
  whiteSpace: 'nowrap',
  transition: 'all 0.15s ease',
};

const NavCategoryLinks = () => {
  return (
    <>
      <Link to="/clothes" style={linkStyle}>
        <Shirt size={15} color="#059669" /> Clothes Shopping
      </Link>
      <Link to="/dining" style={linkStyle}>
        <Utensils size={15} color="#059669" /> Dining & Tables
      </Link>
    </>
  );
};

export default NavCategoryLinks;
