import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

const DEFAULT_LOCATION = {
  label: 'Home',
  receiverName: 'Riya Gope',
  receiverPhone: '9876543212',
  streetAddress: 'Flat 402, Green Valley Heights, 5th Main',
  apartmentUnit: 'Tower B',
  landmark: 'Near City Center Park',
  city: 'New Delhi',
  state: 'Delhi',
  pincode: '110001',
  latitude: 28.619,
  longitude: 77.215,
  isServiceable: true,
  deliveryEta: '12-15 mins',
};

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const saved = localStorage.getItem('quickcart_location');
    return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
  });

  const [locationModalOpen, setLocationModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('quickcart_location', JSON.stringify(selectedLocation));
  }, [selectedLocation]);

  const updateLocation = (newLoc) => {
    setSelectedLocation({
      ...newLoc,
      isServiceable: true,
      deliveryEta: '10-20 mins',
    });
    setLocationModalOpen(false);
  };

  const detectGPSLocation = () => {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const gpsLoc = {
              label: 'Current Location',
              receiverName: selectedLocation.receiverName || 'Customer',
              receiverPhone: selectedLocation.receiverPhone || '9876543210',
              streetAddress: 'Detected via Device GPS',
              apartmentUnit: '',
              landmark: 'Current live coordinate',
              city: 'New Delhi',
              state: 'Delhi',
              pincode: '110001',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              isServiceable: true,
              deliveryEta: '10-18 mins',
            };
            updateLocation(gpsLoc);
            resolve(gpsLoc);
          },
          () => {
            // Default fallback
            updateLocation(DEFAULT_LOCATION);
            resolve(DEFAULT_LOCATION);
          }
        );
      } else {
        updateLocation(DEFAULT_LOCATION);
        resolve(DEFAULT_LOCATION);
      }
    });
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        locationModalOpen,
        setLocationModalOpen,
        updateLocation,
        detectGPSLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};
