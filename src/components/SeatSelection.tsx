import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Seat {
  id: string;
  number: string;
  status: 'vacant' | 'booked' | 'waiting_for_approval';
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
    return seats.find(seat => seat.number === seatNumber);
  };

  const getSeatStyle = (seatNumber: string) => {
    const seatData = getSeatData(seatNumber);
    const isSelected = selectedSeat === seatData?.id;
    
    if (isSelected) {
      return 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50 border-2 border-blue-400 scale-110 transform transition-all duration-300';
    }
    
    if (!seatData) {
      return 'bg-gray-300 text-gray-600 border border-gray-400';
    }
    
    switch (seatData.status) {
      case 'vacant':
        return 'bg-gradient-to-br from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white cursor-pointer shadow-lg shadow-emerald-500/30 border-2 border-emerald-300 hover:border-emerald-400 transition-all duration-200 hover:scale-105';
      case 'booked':
        return 'bg-gradient-to-br from-red-500 to-rose-600 text-white cursor-not-allowed shadow-lg shadow-red-500/30 border-2 border-red-400';
      case 'waiting_for_approval':
        return 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white cursor-not-allowed shadow-lg shadow-amber-500/30 border-2 border-amber-300';
      default:
        return 'bg-gray-300 text-gray-600 border border-gray-400';
    }
  };

  const handleSeatClick = (seatNumber: string) => {
    const seatData = getSeatData(seatNumber);
    if (seatData && seatData.status === 'vacant') {
      onSeatSelect(seatData.id);
    }
  };

  const SeatComponent = ({ seatNumber }: { seatNumber: string }) => (
    <div
      className={`w-10 h-10 m-1 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-300 ${getSeatStyle(seatNumber)}`}
      onClick={() => handleSeatClick(seatNumber)}
      title={`Seat ${seatNumber} - ${getSeatData(seatNumber)?.status || 'Unknown'}`}
    >
      {seatNumber}
    </div>
  );

  return (
    <Card className="w-full border-0 shadow-xl bg-gradient-to-br from-card to-card/80 border border-emerald-400/30 shadow-emerald-500/20">
      <CardHeader className="border-b border-emerald-400/20 bg-gradient-to-r from-emerald-50/50 to-green-50/50">
        <CardTitle className="flex items-center justify-between text-xl font-bold text-slate-800">
          <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Select Your Seat</span>
          <div className="flex gap-6 text-sm font-medium">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-300/50">
              <div className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded border border-emerald-300 shadow-sm"></div>
              <span className="text-emerald-700">Available</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100/50 border border-red-300/50">
              <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-rose-600 rounded border border-red-300 shadow-sm"></div>
              <span className="text-red-700">Booked</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/50 border border-amber-300/50">
              <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-yellow-500 rounded border border-amber-300 shadow-sm"></div>
              <span className="text-amber-700">Waiting</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 border border-blue-300/50">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded border border-blue-300 shadow-sm"></div>
              <span className="text-blue-700">Selected</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-gradient-to-br from-slate-50/50 to-gray-50/50">
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
              <div className="w-20 h-16 bg-gradient-to-t from-gray-500 to-gray-400 m-1 flex items-center justify-center border-2 border-gray-400/50 text-xs font-bold rounded-lg shadow-lg shadow-gray-500/20">
                <div className="text-center text-white">
                  <div className="h-1 bg-gray-300 mb-1 rounded"></div>
                  <div className="h-1 bg-gray-300 mb-1 rounded"></div>
                  <div className="h-1 bg-gray-300 mb-1 rounded"></div>
                  Stairs
                </div>
              </div>
              <div className="w-20 h-16 bg-gradient-to-br from-slate-400 to-slate-500 m-1 flex items-center justify-center border-2 border-slate-400/50 text-xs font-bold rounded-lg shadow-lg shadow-slate-500/20 text-white">
                Washroom
              </div>
            </div>
          </div>

          {/* Aisle */}
          <div className="relative w-16 flex justify-center items-center bg-gradient-to-br from-slate-100/50 to-gray-100/50 mx-2 rounded-lg border border-slate-300/50">
            <div className="absolute top-2 bottom-2 left-2 w-1 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full"></div>
            <div className="absolute top-2 bottom-2 right-2 w-1 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full"></div>
            <div className="transform rotate-90 text-xs font-bold text-slate-600 whitespace-nowrap tracking-wider">
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

        {selectedSeat && (
          <div className="text-center bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-2 border-blue-300/50 rounded-xl p-6 mt-8 shadow-lg shadow-blue-500/10">
            <p className="text-lg mb-4 text-slate-800">
              Selected Seat: <strong className="text-blue-700 text-xl">{seats.find(s => s.id === selectedSeat)?.number}</strong>
            </p>
            <Button
              onClick={onConfirmSelection}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 px-8 py-3 shadow-lg shadow-blue-500/30 border border-blue-400/30"
              size="lg"
            >
              Confirm Seat Selection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SeatSelection;
