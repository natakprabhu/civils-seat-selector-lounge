
// Remove all logic, leave empty stub.
export const useBookings = () => {
  // Booking logic removed as the booking feature is deprecated.
  return {
    bookings: [],
    loading: false,
    createBooking: async () => ({ error: { message: 'Bookings are disabled' } }),
    approveBooking: async () => ({ error: { message: 'Bookings are disabled' } }),
    rejectBooking: async () => ({ error: { message: 'Bookings are disabled' } }),
    refetch: () => {},
  };
};
