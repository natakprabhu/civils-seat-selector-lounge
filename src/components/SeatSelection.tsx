import React from 'react';
import SeatIcon from './SeatIcon';
import { Seat } from '@/hooks/useSeats';
import { BookingRequest } from '@/hooks/useBookings';

interface SeatSelectionProps {
  seats: Seat[];
  selectedSeat: string | null;
  onSeatSelect: (seatId: string) => void;
  onConfirmSelection: () => void;
  bookingInProgress: boolean;
  bookings: BookingRequest[];
  userId: string | undefined;
}

const SeatSelection = ({
  seats,
  selectedSeat,
  onSeatSelect,
  onConfirmSelection,
  bookingInProgress,
  bookings,
  userId,
}) => {
  // Determine which seat is pending for the current user
  let pendingSeatId = null;
  if (bookings && userId) {
    const pendingBooking = bookings.find(
      (b) => b.user_id === userId && b.status === "pending"
    );
    if (pendingBooking) {
      pendingSeatId = pendingBooking.seat_id;
    }
  }

  return (
    <div className="grid grid-cols-8 gap-3">
      {seats.map((seat) => {
        // Override status for the current user's pending booking
        let seatStatus = seat.status;
        if (pendingSeatId && seat.id === pendingSeatId && seat.status !== "booked") {
          seatStatus = "on_hold"; // Show "on hold" for this user's pending seat
        }
        return (
          <SeatIcon
            key={seat.id}
            seatNumber={seat.seat_number}
            status={
              selectedSeat === seat.id
                ? "selected"
                : seatStatus === "vacant"
                ? "vacant"
                : seatStatus === "on_hold"
                ? "pending"
                : seatStatus === "booked"
                ? "booked"
                : "vacant"
            }
            onClick={() => onSeatSelect(seat.id)}
            disabled={bookingInProgress || seatStatus !== "vacant"}
          />
        );
      })}
    </div>
  );
};

export default SeatSelection;
