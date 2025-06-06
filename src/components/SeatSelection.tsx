
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
      return 'bg-blue-600 text-white';
    }
    
    if (!seatData) {
      return 'bg-gray-300 text-gray-600';
    }
    
    switch (seatData.status) {
      case 'vacant':
        return 'bg-green-500 hover:bg-green-600 text-white cursor-pointer';
      case 'booked':
        return 'bg-red-500 text-white cursor-not-allowed';
      case 'waiting_for_approval':
        return 'bg-yellow-500 text-white cursor-not-allowed';
      default:
        return 'bg-gray-300 text-gray-600';
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
      className={`w-10 h-10 m-1 rounded border-2 border-gray-300 flex items-center justify-center font-bold text-xs transition-all duration-200 shadow-sm ${getSeatStyle(seatNumber)}`}
      onClick={() => handleSeatClick(seatNumber)}
    >
      {seatNumber}
    </div>
  );

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="border-b border-slate-200 bg-slate-50">
        <CardTitle className="flex items-center justify-between text-xl font-bold text-slate-800">
          <span>Select Your Seat</span>
          <div className="flex gap-6 text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Waiting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span>Selected</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
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
              <div className="w-20 h-16 bg-gradient-to-t from-gray-400 to-gray-300 m-1 flex items-center justify-center border border-gray-400 text-xs font-bold rounded">
                <div className="text-center">
                  <div className="h-1 bg-gray-500 mb-1"></div>
                  <div className="h-1 bg-gray-500 mb-1"></div>
                  <div className="h-1 bg-gray-500 mb-1"></div>
                  Stairs
                </div>
              </div>
              <div className="w-20 h-16 bg-gray-300 m-1 flex items-center justify-center border border-gray-400 text-xs font-bold rounded">
                Washroom
              </div>
            </div>
          </div>

          {/* Aisle */}
          <div className="relative w-16 flex justify-center items-center bg-gray-50 mx-2">
            <div className="absolute top-0 bottom-0 left-2 w-0.5 bg-gray-400"></div>
            <div className="absolute top-0 bottom-0 right-2 w-0.5 bg-gray-400"></div>
            <div className="transform rotate-90 text-xs font-bold text-gray-600 whitespace-nowrap">
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
          <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <p className="text-lg mb-4 text-slate-800">
              Selected Seat: <strong className="text-blue-700">{seats.find(s => s.id === selectedSeat)?.number}</strong>
            </p>
            <Button
              onClick={onConfirmSelection}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 px-8 py-3 shadow-lg"
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
