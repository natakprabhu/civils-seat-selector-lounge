
import React from 'react';
import SeatIcon from './SeatIcon';
import { Seat } from '@/hooks/useSeats';
import { BookingRequest } from '@/hooks/useBookings';

// Map out the left and right seat arrangement as per HTML
const LEFT_LAYOUT = [
  ['A1', 'A2'],
  ['B1', 'B2', 'B3', 'B4'],
  ['C1', 'C2', 'C3', 'C4'],
  ['D1', 'D2', 'D3', 'D4'],
  ['E1', 'E2', 'E3', 'E4'],
  ['F1', 'F2', 'F3', 'F4'],
];

const RIGHT_LAYOUT = [
  ['A5', 'A6', 'A7'],
  ['B5', 'B6', 'B7'],
  ['C5', 'C6', 'C7'],
  ['D5', 'D6', 'D7'],
  ['E5', 'E6', 'E7'],
  ['F5', 'F6', 'F7'],
  ['G5', 'G6', 'G7'],
  ['H5', 'H6', 'H7'],
  ['I5', 'I6', 'I7'],
  ['J5', 'J6', 'J7'],
];

interface SeatSelectionProps {
  seats: Seat[];
  selectedSeat: string | null;
  onSeatSelect: (seatId: string) => void;
  onConfirmSelection: () => void;
  bookingInProgress: boolean;
  bookings: BookingRequest[];
  userId: string | undefined;
}

const getSeatByNumber = (seats: Seat[]) => {
  const map: Record<string, Seat> = {};
  seats.forEach((seat) => {
    map[seat.seat_number] = seat;
  });
  return map;
};

const SeatSelection: React.FC<SeatSelectionProps> = ({
  seats,
  selectedSeat,
  onSeatSelect,
  onConfirmSelection,
  bookingInProgress,
  bookings,
  userId,
}) => {
  // Find pending seat for this user (for on_hold highlight)
  let pendingSeatId: string | null = null;
  if (bookings && userId) {
    const pendingBooking = bookings.find(
      (b) => b.user_id === userId && b.status === "pending"
    );
    if (pendingBooking) {
      pendingSeatId = pendingBooking.seat_id;
    }
  }

  // For easier lookup by seat_number
  const seatsByNumber = getSeatByNumber(seats);

  // All users see any on-hold seat as 'pending' regardless of who holds/locked it
  function getSeatStatus(seat: Seat): 'vacant' | 'selected' | 'pending' | 'booked' {
    if (selectedSeat && seat.id === selectedSeat) return 'selected';
    if (seat.status === 'booked') return 'booked';
    if (seat.status === 'on_hold') return 'pending';
    return 'vacant';
  }

  // Debug logs for seat statuses
  React.useEffect(() => {
    Object.values(seatsByNumber).forEach(seat => {
      const status = getSeatStatus(seat);
      // Intentionally log them to spot on_hold seats and status mapping
      console.log('[SeatStatusDebug] seat', seat.seat_number, 'raw status:', seat.status, '-> computed status:', status);
    });
  }, [seats, selectedSeat]);

  return (
    <div className="w-full flex justify-center items-stretch mt-2 gap-4 flex-wrap">
      {/* Left block */}
      <div className="flex flex-col items-end">
        {LEFT_LAYOUT.map((row, i) => (
          <div key={i} className="flex flex-row mb-1">
            {row.map((seatNum) => {
              const seat = seatsByNumber[seatNum];
              if (!seat) {
                // placeholder for missing seat
                return (
                  <div
                    key={seatNum}
                    className="w-10 h-10 m-1 rounded bg-gray-200 opacity-70"
                  />
                );
              }
              const status = getSeatStatus(seat);
              return (
                <div key={seatNum} className="m-1 flex flex-col items-center">
                  <SeatIcon
                    seatNumber={seat.seat_number}
                    status={status}
                    onClick={() =>
                      !bookingInProgress &&
                      status === "vacant" &&
                      onSeatSelect(seat.id)
                    }
                    disabled={bookingInProgress || status !== "vacant"}
                  />
                  <span className="text-xs mt-0.5 text-slate-400">{status}</span>
                </div>
              );
            })}
          </div>
        ))}
        {/* Stairs and Washroom at bottom (below last row "F") */}
        <div className="flex flex-row mt-2 w-full">
          <div className="flex-1 flex items-center justify-center m-1">
            <div className="w-full h-20 bg-gradient-to-t from-slate-400 to-slate-100 border rounded text-sm font-bold flex items-center justify-center shadow box-border text-black">
              Stairs
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center m-1">
            <div className="w-full h-20 bg-slate-200 border rounded text-sm font-bold flex items-center justify-center shadow box-border text-black">
              Washroom
            </div>
          </div>
        </div>
      </div>
      {/* Passage (center) */}
      <div className="relative flex flex-col mx-2">
        <div className="flex-1" />
        {/* Center one "Passage" label vertically */}
        <div className="w-12 flex flex-col items-center justify-center flex-1" style={{ minHeight: '100%' }}>
          <span
            className="writing-vertical font-bold text-slate-400 text-base"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              letterSpacing: 2,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Passage
          </span>
        </div>
        <div className="absolute inset-y-0 left-1 w-0.5 bg-gray-300 rounded" />
        <div className="absolute inset-y-0 right-1 w-0.5 bg-gray-300 rounded" />
      </div>
      {/* Right block */}
      <div className="flex flex-col items-start">
        {RIGHT_LAYOUT.map((row, i) => (
          <div key={i} className="flex flex-row mb-1">
            {row.map((seatNum) => {
              const seat = seatsByNumber[seatNum];
              if (!seat) {
                return (
                  <div
                    key={seatNum}
                    className="w-10 h-10 m-1 rounded bg-gray-200 opacity-70"
                  />
                );
              }
              const status = getSeatStatus(seat);
              return (
                <div key={seatNum} className="m-1 flex flex-col items-center">
                  <SeatIcon
                    seatNumber={seat.seat_number}
                    status={status}
                    onClick={() =>
                      !bookingInProgress &&
                      status === "vacant" &&
                      onSeatSelect(seat.id)
                    }
                    disabled={bookingInProgress || status !== "vacant"}
                  />
                  <span className="text-xs mt-0.5 text-slate-400">{status}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatSelection;

