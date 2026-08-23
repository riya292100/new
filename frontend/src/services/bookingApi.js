import axiosClient from './api';

export const bookingApi = {
  createBooking: (bookingData) => {
    return axiosClient.post('/dining/bookings', bookingData);
  },

  getMyBookings: () => {
    return axiosClient.get('/dining/bookings/my-bookings');
  },

  getBookingByReference: (reference) => {
    return axiosClient.get(`/dining/bookings/ref/${reference}`);
  },

  cancelBooking: (bookingId) => {
    return axiosClient.put(`/dining/bookings/${bookingId}/cancel`);
  },
};

export default bookingApi;
