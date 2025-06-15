import React, { useMemo } from "react";
import SeatIcon from "./SeatIcon";
import { Seat } from "@/hooks/useSeats";
import SeatStatusLegend from "./SeatStatusLegend";

type BookingStatus = "approved" | "pending" | "cancelled";
type SeatMap = Record<string, { status: BookingStatus; seatId: string; userId: string; subscriptionEndDate?: string }>;
type SeatHoldsMap = Record<string, { lockExpiry: string; userId: string }>;

interface SeatSelectionProps {
  seats: Seat[];
  bookings: { seat_id: string; status: BookingStatus; user_id: string; subscription_end_date?: string }[];
  seatHolds: { seat_id: string; lock_expiry: string; user_id: string }[];
  userActiveBooking: boolean;
  onSeatSelect: (seatNumber: string) => void;
  selectedSeat: string | null;
  currentUserId?: string;
}

const LEFT_LAYOUT = [
  ["A1", "A2"],
  ["B1", "B2", "B3", "B4"],
  ["C1", "C2", "C3", "C4"],
  ["D1", "D2", "D3", "D4"],
  ["E1", "E2", "E3", "E4"],
  ["F1", "F2", "F3", "F4"],
];
const RIGHT_LAYOUT = [
  ["A5", "A6", "A7"],
  ["B5", "B6", "B7"],
  ["C5", "C6", "C7"],
  ["D5", "D6", "D7"],
  ["E5", "E6", "E7"],
  ["F5", "F6", "F7"],
  ["G5", "G6", "G7"],
  ["H5", "H6", "H7"],
  ["I5", "I6", "I7"],
  ["J5", "J6", "J7"],
];

const getSeatStatus = (
  seatNumber: string,
  bookingsMap: SeatMap,
  seatHoldsMap: SeatHoldsMap,
  selectedSeat: string | null,
  currentUserId?: string
): "booked" | "pending" | "vacant" | "selected" => {
  if (selectedSeat === seatNumber) return "selected";
  
  const booking = bookingsMap[seatNumber];
  const hold = seatHoldsMap[seatNumber];
  const now = new Date();
  
  // 1. Booked (Red) - approved booking with active subscription
  if (booking && booking.status === "approved") {
    if (booking.subscriptionEndDate) {
      const subscriptionEnd = new Date(booking.subscriptionEndDate);
      if (subscriptionEnd > now) {
        return "booked"; // Active subscription
      }
    } else {
      // If no subscription_end_date, assume it's active (for backward compatibility)
      return "booked";
    }
  }
  
  // 2. On Hold (Yellow) - pending booking with active hold
  if (booking && booking.status === "pending" && hold) {
    const lockExpiry = new Date(hold.lockExpiry);
    if (lockExpiry > now) {
      return "pending"; // Active hold
    }
  }
  
  // 3. Available (Green) - no approved booking for current period and no active hold
  return "vacant";
};

const getSeatByNumber = (seats: Seat[]) => {
  const map: Record<string, Seat> = {};
  seats.forEach((seat) => {
    map[seat.seat_number] = seat;
  });
  return map;
};

const SeatItem: React.FC<{
  seat: Seat | undefined;
  status: "vacant" | "selected" | "pending" | "booked";
  seatLabel: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({
  seat,
  status,
  seatLabel,
  onClick,
  disabled
}) => {
  if (!seat) {
    return (
      <div className="w-10 h-10 m-1 rounded bg-gray-200 opacity-70" key={seatLabel} />
    );
  }

  const canClick = status === "vacant" && !disabled && onClick;

  return (
    <div className="m-1 flex flex-col items-center" key={seatLabel}>
      <div>
        <SeatIcon
          seatNumber={seat.seat_number}
          status={status}
          disabled={disabled || !canClick}
          onClick={canClick ? onClick : undefined}
        />
      </div>
    </div>
  );
};

const SeatSelection: React.FC<SeatSelectionProps> = ({
  seats,
  bookings,
  seatHolds,
  userActiveBooking,
  onSeatSelect,
  selectedSeat,
  currentUserId
}) => {
  const seatsByNumber = useMemo(() => getSeatByNumber(seats), [seats]);
  
  // Create bookings map based on seat_bookings table
  const bookingsMap: SeatMap = useMemo(() => {
    const map: SeatMap = {};
    bookings.forEach(b => {
      const seat = seats.find(s => s.id === b.seat_id);
      if (seat) {
        map[seat.seat_number] = { 
          status: b.status, 
          seatId: seat.id,
          userId: b.user_id,
          subscriptionEndDate: b.subscription_end_date
        };
      }
    });
    return map;
  }, [bookings, seats]);

  // Create seat holds map
  const seatHoldsMap: SeatHoldsMap = useMemo(() => {
    const map: SeatHoldsMap = {};
    seatHolds.forEach(h => {
      const seat = seats.find(s => s.id === h.seat_id);
      if (seat) {
        map[seat.seat_number] = {
          lockExpiry: h.lock_expiry,
          userId: h.user_id
        };
      }
    });
    return map;
  }, [seatHolds, seats]);

  const handleSeatClick = (seatNumber: string) => {
    // Prevent any booking if user has ANY pending booking in seat_bookings table
    if (!userActiveBooking) {
      onSeatSelect(seatNumber);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <SeatStatusLegend />
      <div className="flex justify-center items-stretch mt-2 gap-4 flex-wrap w-full">
        {/* Left block */}
        <div className="flex flex-col items-end">
          {LEFT_LAYOUT.map((row, i) => (
            <div key={i} className="flex flex-row mb-1">
              {row.map(seatNum => {
                const seat = seatsByNumber[seatNum];
                const status = getSeatStatus(seatNum, bookingsMap, seatHoldsMap, selectedSeat, currentUserId);
                return (
                  <SeatItem
                    key={seatNum}
                    seat={seat}
                    status={status}
                    seatLabel={seatNum}
                    onClick={() => handleSeatClick(seatNum)}
                    disabled={userActiveBooking}
                  />
                );
              })}
            </div>
          ))}
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
        <div className="relative flex flex-col mx-2">
          <div className="flex-1" />
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
        <div className="flex flex-col items-start">
          {RIGHT_LAYOUT.map((row, i) => (
            <div key={i} className="flex flex-row mb-1">
              {row.map(seatNum => {
                const seat = seatsByNumber[seatNum];
                const status = getSeatStatus(seatNum, bookingsMap, seatHoldsMap, selectedSeat, currentUserId);
                return (
                  <SeatItem
                    key={seatNum}
                    seat={seat}
                    status={status}
                    seatLabel={seatNum}
                    onClick={() => handleSeatClick(seatNum)}
                    disabled={userActiveBooking}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
