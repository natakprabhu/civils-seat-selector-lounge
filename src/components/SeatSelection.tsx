import React from 'react';
import SeatIcon from './SeatIcon';
import { Seat } from '@/hooks/useSeats';
import { BookingRequest } from '@/hooks/useBookings';

// Left and Right Layouts matching the floor plan
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

const NUM_AISLE_LABELS = 5;

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

  /** Helper to get status for seat (selected, vacant, on_hold, booked) */
  function getSeatStatus(seat: Seat): 'vacant' | 'selected' | 'pending' | 'booked' {
    // Selected in this UI
    if (selectedSeat && seat.id === selectedSeat) return 'selected';
    // Pending for this user
    if (pendingSeatId && seat.id === pendingSeatId && seat.status !== 'booked') return 'pending';
    // Underlying status
    if (seat.status === 'booked') return 'booked';
    if (seat.status === 'on_hold') return 'pending';
    return 'vacant';
  }

  // Aisle label styling using tailwind: rotate, vertical writing, faded
  // Stairs and Washroom boxes
  return (
    <div className="w-full flex justify-center items-stretch mt-2 gap-4 flex-wrap relative min-h-[70vh]">
      {/* Left block */}
      <div className="flex flex-col items-end relative min-h-[70vh]">
        {/* Seat rows */}
        {LEFT_LAYOUT.map((row, i) => (
          <div key={i} className="flex flex-row mb-1">
            {row.map((seatNum) => {
              const seat = seatsByNumber[seatNum];
              if (!seat) {
                // Render placeholder (empty/filler seat)
                return (
                  <div
                    key={seatNum}
                    className="w-10 h-10 m-1 rounded bg-gray-200 opacity-70"
                  />
                );
              }
              const status = getSeatStatus(seat);
              return (
                <div key={seatNum} className="m-1">
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
                </div>
              );
            })}
          </div>
        ))}
        {/* Stairs and Washroom, stretch to bottom */}
        <div className="flex w-full absolute left-0 right-0 bottom-0 mt-2 pointer-events-none" style={{height: "calc(100% - 15rem)"}}>
          <div className="flex-1 flex justify-end items-end h-full">
            <div className="w-full h-full bg-gradient-to-t from-slate-400 to-slate-100 border rounded text-sm font-bold flex items-center justify-center shadow box-border pointer-events-auto min-h-[110px]">
              Stairs
            </div>
          </div>
          <div className="flex-1 flex items-end h-full">
            <div className="w-full h-full bg-slate-200 border rounded text-sm font-bold flex items-center justify-center shadow box-border pointer-events-auto min-h-[110px]">
              Washroom
            </div>
          </div>
        </div>
      </div>
      {/* Aisle/passage with multiple labels */}
      <div className="relative flex flex-col items-center mx-2 flex-grow h-full min-h-[70vh]">
        <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between items-center z-0">
          {Array.from({ length: NUM_AISLE_LABELS }).map((_, idx) => (
            <div key={idx} className="w-full flex justify-center items-center my-2">
              <span
                className="font-bold text-slate-400 text-base whitespace-nowrap"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)"
                }}
              >
                Aisle
              </span>
            </div>
          ))}
          {/* Passage side lines */}
          <div className="absolute inset-y-0 left-1 w-0.5 bg-gray-300 rounded z-[-1]" />
          <div className="absolute inset-y-0 right-1 w-0.5 bg-gray-300 rounded z-[-1]" />
        </div>
        {/* Invisible block for alignment/space */}
        <div className="flex-1" />
      </div>
      {/* Right block */}
      <div className="flex flex-col items-start min-h-[70vh]">
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
                <div key={seatNum} className="m-1">
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
