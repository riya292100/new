import React, { useState, useEffect, useCallback } from 'react';
import { UtensilsCrossed, Compass, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { restaurantApi } from '../services/restaurantApi';
import { FALLBACK_RESTAURANTS } from '../utils/demoConfig';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CuisinePills from '../components/dining/CuisinePills';
import RestaurantSearchFilter from '../components/dining/RestaurantSearchFilter';
import RestaurantGrid from '../components/dining/RestaurantGrid';
import TableBookingModal from '../components/dining/TableBookingModal';
import logger from '../utils/logger';

const DiningDiscoveryPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [restaurants, setRestaurants] = useState(FALLBACK_RESTAURANTS);
  const [cuisines, setCuisines] = useState(['Italian', 'Japanese', 'American', 'French', 'Indian']);
  const [cities, setCities] = useState([
    'Rome',
    'Tokyo',
    'New York',
    'Paris',
    'London',
    'Bengaluru',
  ]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [veganOnly, setVeganOnly] = useState(false);
  const [dineInOnly, setDineInOnly] = useState(false);

  // Modal
  const [selectedRestaurantForBooking, setSelectedRestaurantForBooking] = useState(null);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        query: searchQuery.trim() || undefined,
        cuisine: selectedCuisine || undefined,
        city: selectedCity || undefined,
        priceLevel: priceFilter || undefined,
        vegetarian: vegetarianOnly ? true : undefined,
        vegan: veganOnly ? true : undefined,
        dineIn: dineInOnly ? true : undefined,
      };

      const res = await restaurantApi.getRestaurants(params);
      if (res?.data?.data && res.data.data.length > 0) {
        setRestaurants(res.data.data);
      } else {
        // Fallback filter
        let filtered = FALLBACK_RESTAURANTS;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (r) =>
              r.name.toLowerCase().includes(q) ||
              r.cuisine.toLowerCase().includes(q) ||
              r.city.toLowerCase().includes(q)
          );
        }
        if (selectedCuisine) {
          filtered = filtered.filter(
            (r) => r.cuisine.toLowerCase() === selectedCuisine.toLowerCase()
          );
        }
        if (selectedCity) {
          filtered = filtered.filter((r) => r.city.toLowerCase() === selectedCity.toLowerCase());
        }
        if (priceFilter) {
          filtered = filtered.filter((r) => r.priceLevel === priceFilter);
        }
        if (vegetarianOnly) {
          filtered = filtered.filter((r) => r.isVegetarianFriendly);
        }
        if (veganOnly) {
          filtered = filtered.filter((r) => r.isVeganFriendly);
        }
        if (dineInOnly) {
          filtered = filtered.filter((r) => r.isDineInAvailable);
        }
        setRestaurants(filtered);
      }
    } catch (err) {
      logger.warn(
        'DiningDiscoveryPage',
        'Failed to fetch restaurants from API, using demo fallback',
        err
      );
      let filtered = FALLBACK_RESTAURANTS;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.cuisine.toLowerCase().includes(q) ||
            r.city.toLowerCase().includes(q)
        );
      }
      if (selectedCuisine) {
        filtered = filtered.filter(
          (r) => r.cuisine.toLowerCase() === selectedCuisine.toLowerCase()
        );
      }
      if (selectedCity) {
        filtered = filtered.filter((r) => r.city.toLowerCase() === selectedCity.toLowerCase());
      }
      setRestaurants(filtered);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    selectedCuisine,
    selectedCity,
    priceFilter,
    vegetarianOnly,
    veganOnly,
    dineInOnly,
  ]);

  useEffect(() => {
    restaurantApi
      .getCuisines()
      .then((res) => {
        if (res?.data?.data) setCuisines(res.data.data);
      })
      .catch((err) => {
        logger.error('DiningDiscoveryPage', 'getCuisines failed', err);
      });

    restaurantApi
      .getCities()
      .then((res) => {
        if (res?.data?.data) setCities(res.data.data);
      })
      .catch((err) => {
        logger.error('DiningDiscoveryPage', 'getCities failed', err);
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRestaurants();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchRestaurants]);

  const handleToggleFavorite = async (restaurantId) => {
    if (!user) {
      addToast('Sign in to save your favorite dining spots', 'info');
      return;
    }

    try {
      const res = await restaurantApi.toggleFavorite(restaurantId);
      const isFav = res?.data?.data;
      setRestaurants((prev) =>
        prev.map((r) => (r.id === restaurantId ? { ...r, isFavorite: isFav } : r))
      );
      addToast(isFav ? 'Added to saved dining spots' : 'Removed from favorites', 'success');
    } catch (err) {
      logger.error('DiningDiscoveryPage', 'Toggle favorite failed', err);
      addToast('Failed to update favorite', 'error');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCuisine('');
    setSelectedCity('');
    setPriceFilter('');
    setVegetarianOnly(false);
    setVeganOnly(false);
    setDineInOnly(false);
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <div className="qc-dining-hero">
        <div style={{ maxWidth: '640px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(5, 150, 105, 0.3)',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: '700',
              marginBottom: '16px',
              border: '1px solid rgba(167, 243, 208, 0.3)',
            }}
          >
            <Compass size={14} color="#6ee7b7" /> QuickCart Global Dining Experience
          </div>
          <h1
            style={{
              fontSize: '2.2rem',
              fontWeight: '800',
              lineHeight: '1.2',
              marginBottom: '12px',
            }}
          >
            Discover & Reserve Top Restaurants Worldwide
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: '#cbd5e1',
              lineHeight: '1.6',
              marginBottom: '20px',
            }}
          >
            Explore curated fine dining, authentic trattorias, Michelin-guide sushi, and cozy
            bistros across Rome, Tokyo, New York, London, Paris, and Bengaluru.
          </p>

          {user && (
            <Link
              to="/bookings"
              className="btn btn-outline"
              style={{
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
              }}
            >
              <CalendarCheck size={16} /> View My Table Bookings
            </Link>
          )}
        </div>
      </div>

      {/* Cuisine Quick Filter Carousel */}
      <CuisinePills
        cuisines={cuisines}
        selectedCuisine={selectedCuisine}
        onSelectCuisine={setSelectedCuisine}
      />

      {/* Advanced Search & Filtering Bar */}
      <RestaurantSearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        cities={cities}
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
        vegetarianOnly={vegetarianOnly}
        setVegetarianOnly={setVegetarianOnly}
        veganOnly={veganOnly}
        setVeganOnly={setVeganOnly}
        dineInOnly={dineInOnly}
        setDineInOnly={setDineInOnly}
        onResetFilters={handleResetFilters}
      />

      {/* Grid of Results */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>
          {selectedCuisine ? `${selectedCuisine} Restaurants` : 'Featured Dining Partners'}{' '}
          <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '500' }}>
            ({restaurants?.length || 0})
          </span>
        </h2>
      </div>

      <RestaurantGrid
        restaurants={restaurants}
        loading={loading}
        onToggleFavorite={handleToggleFavorite}
        onBookTable={(rest) => setSelectedRestaurantForBooking(rest)}
      />

      {/* Table Booking Modal */}
      {selectedRestaurantForBooking && (
        <TableBookingModal
          restaurant={selectedRestaurantForBooking}
          onClose={() => setSelectedRestaurantForBooking(null)}
          onBookingSuccess={() => {
            fetchRestaurants();
          }}
        />
      )}
    </div>
  );
};

export default DiningDiscoveryPage;
