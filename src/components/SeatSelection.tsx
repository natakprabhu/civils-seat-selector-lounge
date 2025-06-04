
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SeatIcon from './SeatIcon';

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
  const seatRows = [
    { letter: 'A', count: 12, startIndex: 0 },
    { letter: 'B', count: 12, startIndex: 12 },
    { letter: 'C', count: 12, startIndex: 24 },
    { letter: 'D', count: 9, startIndex: 36 },
    { letter: 'E', count: 7, startIndex: 45 },
    { letter: 'F', count: 7, startIndex: 52 }
  ];

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
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
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
        <div className="space-y-4 mb-8">
          {seatRows.map((row) => (
            <div key={row.letter} className="flex items-center gap-4">
              <span className="font-bold text-slate-800 text-lg w-8">{row.letter}:</span>
              <div className="flex gap-2 flex-wrap">
                {seats.slice(row.startIndex, row.startIndex + row.count).map((seat) => (
                  <SeatIcon
                    key={seat.id}
                    seatNumber={seat.number}
                    status={selectedSeat === seat.id ? 'selected' : seat.status === 'waiting_for_approval' ? 'pending' : seat.status}
                    onClick={() => onSeatSelect(seat.id)}
                    disabled={seat.status !== 'vacant'}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {selectedSeat && (
          <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-6">
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
