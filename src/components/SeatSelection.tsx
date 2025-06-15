import React from 'react';
import SeatIcon from './SeatIcon';
import { Seat } from '@/hooks/useSeats';
import { BookingRequest } from '@/hooks/useBookings';
import SeatStatusLegend from './SeatStatusLegend';

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

const getLegendGradient = (status: 'vacant' | 'booked' | 'pending' | 'selected') => {
  switch(status) {
    case 'vacant':
      return 'linear-gradient(135deg, #10b981, #059669)';
    case 'booked':
      return 'linear-gradient(135deg, #ef4444, #dc2626)';
    case 'pending':
      return 'linear-gradient(135deg, #f59e0b, #d97706)';
    case 'selected':
      return 'linear-gradient(135deg, #2563eb, #1d4ed8)';
    default:
      return '#9ca3af';
  }
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
  // For easier lookup by seat_number
  const seatsByNumber = React.useMemo(() => {
    return getSeatByNumber(seats);
  }, [seats]);

  // Find booking for a seat
  function getBookingStatus(seatId: string): 'pending' | 'approved' | null {
    const found = bookings.find(b => b.seat_id === seatId && (b.status === "pending" || b.status === "approved"));
    return found ? found.status : null;
  }

  function getSeatStatus(seat: Seat): 'vacant' | 'selected' | 'pending' | 'booked' {
    // If selected, this has top priority
    if (selectedSeat && seat.id === selectedSeat) {
      return 'selected';
    }
    // Use booking status from bookings table
    const bookingStatus = getBookingStatus(seat.id);
    if (bookingStatus === "pending") {
      return 'pending';
    }
    if (bookingStatus === "approved") {
      return 'booked';
    }
    return "vacant";
  }

  // Find vacant seat obj for the currently selected seat
  const selectedVacantSeat =
    selectedSeat && seats.find(
      s => s.id === selectedSeat && getSeatStatus(s) === 'selected'
    );

  // Debug: Log booking + seat computed status mapping
  React.useEffect(() => {
    Object.values(seatsByNumber).forEach(seat => {
      const status = getSeatStatus(seat);
      const bookingStatus = getBookingStatus(seat.id);
      console.log('[SeatStatusDebug]', seat.seat_number, 'booking:', bookingStatus, '-> UI computed status:', status);
    });
  }, [seats, bookings, selectedSeat]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Seat status legend above the seat map */}
      <SeatStatusLegend />
      <div className="flex justify-center items-stretch mt-2 gap-4 flex-wrap w-full">
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
                    <div style={{
                        background: getLegendGradient(status),
                        borderRadius: "0.75rem",
                        width: "56px",
                        height: "56px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        boxShadow: "0 2px 8px 0 rgba(30,41,59,0.07)",
                        border: "2px solid #cbd5e1"
                      }}>
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
                    <span className="text-xs mt-0.5 text-slate-400">
                      {
                        status === 'pending'
                          ? 'On Hold'
                          : status.charAt(0).toUpperCase() + status.slice(1)
                      }
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
          {/* Stairs and Washroom at bottom (below last row "F") */}
          <div className="flex flex-row mt-2 w-full">
            {/* Stairs */}
            <div className="flex-1 flex items-center justify-center m-1">
              <div className="w-full h-20 bg-gradient-to-t from-slate-400 to-slate-100 border rounded text-sm font-bold flex items-center justify-center shadow box-border text-black">
                Stairs
              </div>
            </div>
            {/* Washroom */}
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
                    <div style={{
                        background: getLegendGradient(status),
                        borderRadius: "0.75rem",
                        width: "56px",
                        height: "56px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        boxShadow: "0 2px 8px 0 rgba(30,41,59,0.07)",
                        border: "2px solid #cbd5e1"
                      }}>
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
                    <span className="text-xs mt-0.5 text-slate-400">
                      {
                        status === 'pending'
                          ? 'On Hold'
                          : status.charAt(0).toUpperCase() + status.slice(1)
                      }
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Booking button appears ONLY if vacant seat is selected and user can book */}
      {!bookingInProgress && selectedVacantSeat && (
        <button
          className="mt-6 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shadow transition-colors text-base disabled:bg-slate-400 disabled:cursor-not-allowed"
          onClick={onConfirmSelection}
        >
          Confirm Booking
        </button>
      )}
    </div>
  );
};

export default SeatSelection;

// NOTE: This file is now very long (over 250 lines)! Consider asking for a refactor into smaller components for maintainability.
