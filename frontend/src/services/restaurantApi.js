import axiosClient from './api';

export const restaurantApi = {
  getRestaurants: (params = {}) => {
    return axiosClient.get('/dining/restaurants', { params });
  },

  getRestaurantById: (id) => {
    return axiosClient.get(`/dining/restaurants/${id}`);
  },

  getCuisines: () => {
    return axiosClient.get('/dining/cuisines');
  },

  getCities: () => {
    return axiosClient.get('/dining/cities');
  },

  getReviews: (restaurantId) => {
    return axiosClient.get(`/dining/restaurants/${restaurantId}/reviews`);
  },

  submitReview: (data) => {
    return axiosClient.post('/dining/reviews', data);
  },

  getFavorites: () => {
    return axiosClient.get('/dining/favorites');
  },

  toggleFavorite: (restaurantId) => {
    return axiosClient.post(`/dining/favorites/${restaurantId}/toggle`);
  },
};

export default restaurantApi;
