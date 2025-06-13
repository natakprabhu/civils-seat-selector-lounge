
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSeatImages } from '@/hooks/useSeatImages';

interface Seat {
  id: string;
  seat_number: string;
  status: 'vacant' | 'booked' | 'maintenance' | 'on_hold';
  section: string;
  row_number: string;
  monthly_rate: number;
}

interface SeatSelectionProps {
  seats: Seat[];
  selectedSeat: string | null;
  onSeatSelect: (seatId: string) => void;
  onConfirmSelection: () => void;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
  seats,
  selectedSeat,
  onSeatSelect,
  onConfirmSelection
}) => {
  const { getSeatImage } = useSeatImages();

  // Define the left section layout (rows A-F with varying seat counts)
  const leftSectionRows = [
    { letter: 'A', seats: ['A1', 'A2'] },
    { letter: 'B', seats: ['B1', 'B2', 'B3', 'B4'] },
    { letter: 'C', seats: ['C1', 'C2', 'C3', 'C4'] },
    { letter: 'D', seats: ['D1', 'D2', 'D3', 'D4'] },
    { letter: 'E', seats: ['E1', 'E2', 'E3', 'E4'] },
    { letter: 'F', seats: ['F1', 'F2', 'F3', 'F4'] }
  ];

  // Define the right section layout (rows A-J with 3 seats each)
  const rightSectionRows = [
    { letter: 'A', seats: ['A5', 'A6', 'A7'] },
    { letter: 'B', seats: ['B5', 'B6', 'B7'] },
    { letter: 'C', seats: ['C5', 'C6', 'C7'] },
    { letter: 'D', seats: ['D5', 'D6', 'D7'] },
    { letter: 'E', seats: ['E5', 'E6', 'E7'] },
    { letter: 'F', seats: ['F5', 'F6', 'F7'] },
    { letter: 'G', seats: ['G5', 'G6', 'G7'] },
    { letter: 'H', seats: ['H5', 'H6', 'H7'] },
    { letter: 'I', seats: ['I5', 'I6', 'I7'] },
    { letter: 'J', seats: ['J5', 'J6', 'J7'] }
  ];

  const getSeatData = (seatNumber: string) => {
    return seats.find(seat => seat.seat_number === seatNumber);
  };

  const getSeatStyle = (seatNumber: string) => {
    const seatData = getSeatData(seatNumber);
    const isSelected = selectedSeat === seatData?.id;
    
    if (isSelected) {
      return 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-2xl shadow-cyan-500/50 border-2 border-cyan-300 scale-110 transform transition-all duration-300 ring-4 ring-cyan-400/30';
    }
    
    if (!seatData) {
      return 'bg-gradient-to-br from-slate-600 to-slate-700 text-slate-300 border border-slate-500';
    }
    
    switch (seatData.status) {
      case 'vacant':
        return 'bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-600 text-white cursor-pointer shadow-xl shadow-emerald-500/40 border-2 border-emerald-300 hover:border-emerald-200 transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-400/50';
      case 'booked':
        return 'bg-gradient-to-br from-red-500 via-rose-600 to-red-700 text-white cursor-not-allowed shadow-xl shadow-red-500/40 border-2 border-red-400';
      case 'on_hold':
        return 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 text-white cursor-not-allowed shadow-xl shadow-amber-500/40 border-2 border-amber-300';
      case 'maintenance':
        return 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 text-white cursor-not-allowed shadow-xl shadow-slate-500/40 border-2 border-slate-400';
      default:
        return 'bg-gradient-to-br from-slate-600 to-slate-700 text-slate-300 border border-slate-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on_hold': return 'On Hold';
      case 'booked': return 'Booked';
      case 'vacant': return 'Available';
      case 'maintenance': return 'Maintenance';
      default: return 'Unknown';
    }
  };

  const handleSeatClick = (seatNumber: string) => {
    const seatData = getSeatData(seatNumber);
    console.log('Seat clicked in SeatSelection:', seatNumber, seatData);
    if (seatData && seatData.status === 'vacant') {
      console.log('Calling onSeatSelect with seat ID:', seatData.id);
      onSeatSelect(seatData.id);
    } else {
      console.log('Seat not clickable:', seatData?.status);
    }
  };

  const SeatComponent = ({ seatNumber }: { seatNumber: string }) => {
    const seatData = getSeatData(seatNumber);
    const seatImage = seatData ? getSeatImage(seatData.id) : null;
    
    return (
      <div
        className={`w-12 h-12 m-1 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 relative group ${getSeatStyle(seatNumber)}`}
        onClick={() => handleSeatClick(seatNumber)}
        title={`Seat ${seatNumber} - ${getStatusLabel(seatData?.status || 'unknown')}`}
      >
        {seatNumber}
        {seatImage && (
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
            <img 
              src={seatImage} 
              alt={`Seat ${seatNumber}`}
              className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-lg"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur border border-slate-600/50 rounded-xl shadow-2xl">
      <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
        <CardTitle className="flex items-center justify-between text-xl font-bold text-white">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Select Your Seat</span>
          <div className="flex gap-6 text-sm font-medium">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 backdrop-blur">
              <div className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded border border-emerald-300 shadow-lg"></div>
              <span className="text-emerald-300">Available</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/50 backdrop-blur">
              <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-rose-600 rounded border border-red-300 shadow-lg"></div>
              <span className="text-red-300">Booked</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 backdrop-blur">
              <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-yellow-500 rounded border border-amber-300 shadow-lg"></div>
              <span className="text-amber-300">On Hold</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 backdrop-blur">
              <div className="w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded border border-cyan-300 shadow-lg"></div>
              <span className="text-cyan-300">Selected</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-gradient-to-br from-slate-900/40 to-slate-800/20">
        {/* Reading Room Layout */}
        <div className="flex justify-center items-stretch">
          {/* Left Section */}
          <div className="flex flex-col">
            {leftSectionRows.map((row) => (
              <div key={`left-${row.letter}`} className="flex justify-end mb-1">
                {row.seats.map((seatNumber) => (
                  <SeatComponent key={seatNumber} seatNumber={seatNumber} />
                ))}
              </div>
            ))}
            
            {/* Stairs and Washroom */}
            <div className="flex mt-2">
              <div className="w-20 h-16 bg-gradient-to-t from-slate-700 to-slate-600 m-1 flex items-center justify-center border-2 border-slate-500/50 text-xs font-bold rounded-xl shadow-xl shadow-slate-700/30 backdrop-blur">
                <div className="text-center text-white">
                  <div className="h-1 bg-slate-300 mb-1 rounded"></div>
                  <div className="h-1 bg-slate-300 mb-1 rounded"></div>
                  <div className="h-1 bg-slate-300 mb-1 rounded"></div>
                  Stairs
                </div>
              </div>
              <div className="w-20 h-16 bg-gradient-to-br from-slate-600 to-slate-700 m-1 flex items-center justify-center border-2 border-slate-500/50 text-xs font-bold rounded-xl shadow-xl shadow-slate-700/30 text-white backdrop-blur">
                Washroom
              </div>
            </div>
          </div>

          {/* Aisle */}
          <div className="relative w-16 flex justify-center items-center bg-gradient-to-br from-slate-800/60 to-slate-900/40 mx-2 rounded-xl border border-slate-600/50 shadow-inner backdrop-blur">
            <div className="absolute top-2 bottom-2 left-2 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-500/30"></div>
            <div className="absolute top-2 bottom-2 right-2 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-500/30"></div>
            <div className="transform rotate-90 text-xs font-bold text-cyan-300 whitespace-nowrap tracking-wider">
              AISLE
            </div>
          </div>

          {/* Right Section */}
          <div className="flex flex-col">
            {rightSectionRows.map((row) => (
              <div key={`right-${row.letter}`} className="flex mb-1">
                {row.seats.map((seatNumber) => (
                  <SeatComponent key={seatNumber} seatNumber={seatNumber} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeatSelection;
