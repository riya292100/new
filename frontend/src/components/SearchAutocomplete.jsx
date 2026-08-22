import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { catalogApi } from '../services/api';
import { useCart } from '../context/CartContext';

const POPULAR_SEARCHES = [
  'Mangoes',
  'Amul Milk',
  'Paneer',
  'Maggi',
  'Chips',
  'Diapers',
  'Coca Cola',
  'Eggs',
];

const SearchAutocomplete = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart, getItemQuantity } = useCart();

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await catalogApi.getSearchSuggestions(query.trim(), 6);
        if (res?.data) {
          setSuggestions(res.data);
        }
      } catch (err) {
        console.warn('Search suggestions failed:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/category/all?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleQuickTagClick = (tag) => {
    setQuery(tag);
    setIsOpen(false);
    navigate(`/category/all?search=${encodeURIComponent(tag)}`);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '520px' }}>
      <form onSubmit={handleSearchSubmit}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f1f5f9',
            borderRadius: '9999px',
            padding: '8px 18px',
            border: isOpen ? '1.5px solid #059669' : '1.5px solid transparent',
            boxShadow: isOpen ? '0 0 0 3px rgba(16, 185, 129, 0.15)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <Search size={18} color="#64748b" style={{ flexShrink: 0, marginRight: '10px' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder='Search "milk", "mango", "chips", "diapers"...'
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.92rem',
              color: '#0f172a',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 15px 35px -5px rgba(0,0,0,0.15), 0 5px 15px rgba(0,0,0,0.07)',
            border: '1px solid #e2e8f0',
            zIndex: 1050,
            overflow: 'hidden',
            maxHeight: '460px',
            overflowY: 'auto',
          }}
        >
          {/* Quick Popular Chips */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Zap size={13} color="#f59e0b" /> Popular Searches
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {POPULAR_SEARCHES.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQuickTagClick(tag)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '9999px',
                    padding: '4px 12px',
                    fontSize: '0.8rem',
                    color: '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => (e.target.style.background = '#e2e8f0')}
                  onMouseLeave={(e) => (e.target.style.background = '#f8fafc')}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Search Result Items */}
          {loading && (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.88rem',
              }}
            >
              Searching fresh inventory...
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div>
              <div
                style={{
                  padding: '8px 16px',
                  background: '#f8fafc',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#64748b',
                  textTransform: 'uppercase',
                }}
              >
                Instant Matches ({suggestions.length})
              </div>
              {suggestions.map((item) => {
                const qty = getItemQuantity(item.id);
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 16px',
                      borderBottom: '1px solid #f8fafc',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/product/${item.id}`);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{
                          width: '44px',
                          height: '44px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#0f172a' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {item.unitQuantity} •{' '}
                          <span style={{ fontWeight: '700', color: '#059669' }}>
                            ₹{item.sellingPrice}
                          </span>
                          {item.discountPercentage > 0 && (
                            <span
                              style={{
                                textDecoration: 'line-through',
                                color: '#94a3b8',
                                marginLeft: '6px',
                                fontSize: '0.72rem',
                              }}
                            >
                              ₹{item.mrp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item, 1);
                      }}
                      className="btn btn-outline-primary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      {qty > 0 ? `In Cart (${qty})` : '+ Add'}
                    </button>
                  </div>
                );
              })}

              <div
                onClick={handleSearchSubmit}
                style={{
                  padding: '12px 16px',
                  background: '#f8fafc',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#059669',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                See all results for "{query}" <ArrowRight size={14} />
              </div>
            </div>
          )}

          {!loading && query && suggestions.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>
                No products found for "{query}"
              </p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                Try searching for fruits, milk, snacks, or groceries.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
