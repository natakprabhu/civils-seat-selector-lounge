
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

const getFloorPlanRows = (seats: Seat[]) => {
  // Group seats by row letter (first char of seat_number)
  const rowMap: Record<string, Seat[]> = {};
  seats.forEach(seat => {
    const row = seat.seat_number.charAt(0);
    if (!rowMap[row]) rowMap[row] = [];
    rowMap[row].push(seat);
  });
  // Sort rows by row key; within each row, sort by seat_number
  const sortedRows = Object.entries(rowMap).sort((a, b) => a[0].localeCompare(b[0]));
  return sortedRows.map(([row, seatsInRow]) => ({
    row,
    seats: seatsInRow.sort((a, b) => a.seat_number.localeCompare(b.seat_number))
  }));
};

const SeatSelection = ({
  seats,
  selectedSeat,
  onSeatSelect,
  onConfirmSelection,
  bookingInProgress,
  bookings,
  userId,
}: SeatSelectionProps) => {
  // Find pending seat ID for this user
  let pendingSeatId = null;
  if (bookings && userId) {
    const pendingBooking = bookings.find(
      (b) => b.user_id === userId && b.status === "pending"
    );
    if (pendingBooking) {
      pendingSeatId = pendingBooking.seat_id;
    }
  }

  // Floor plan rows (A, B, C, etc)
  const seatRows = getFloorPlanRows(seats);

  return (
    <div className="space-y-4">
      {seatRows.map(({ row, seats: rowSeats }) => (
        <div key={row} className="flex flex-row gap-3 justify-center">
          {rowSeats.map((seat) => {
            let seatStatus = seat.status;
            if (
              pendingSeatId &&
              seat.id === pendingSeatId &&
              seat.status !== "booked"
            ) {
              seatStatus = "on_hold"; // Show "on_hold" for this user's pending seat
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
      ))}
    </div>
  );
};

export default SeatSelection;
