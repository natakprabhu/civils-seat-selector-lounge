
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SeatIcon from './SeatIcon';

interface Seat {
  id: string;
  number: string;
  status: 'vacant' | 'booked' | 'pending';
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
  // Organize seats in a grid layout (6 rows x 8 columns for example)
  const seatRows = [];
  for (let i = 0; i < seats.length; i += 8) {
    seatRows.push(seats.slice(i, i + 8));
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Select Your Seat</span>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Vacant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span>Selected</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-6">
          {seatRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-2">
              {row.map((seat) => (
                <SeatIcon
                  key={seat.id}
                  seatNumber={seat.number}
                  status={selectedSeat === seat.id ? 'selected' : seat.status}
                  onClick={() => onSeatSelect(seat.id)}
                  disabled={seat.status !== 'vacant'}
                />
              ))}
            </div>
          ))}
        </div>
        
        {selectedSeat && (
          <div className="text-center">
            <p className="mb-4 text-lg">
              Selected Seat: <strong>{seats.find(s => s.id === selectedSeat)?.number}</strong>
            </p>
            <Button
              onClick={onConfirmSelection}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-2"
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
