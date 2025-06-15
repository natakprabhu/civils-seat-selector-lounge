import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import SeatSelection from './SeatSelection';
import { useSeats, Seat } from '@/hooks/useSeats';
import { ArrowLeft, MapPin } from 'lucide-react';

interface SeatChangeRequestProps {
  currentSeat: string;
  onBack: () => void;
  onSubmitChange: (newSeat: string) => void;
}

const SeatChangeRequest: React.FC<SeatChangeRequestProps> = ({
  currentSeat,
  onBack,
  onSubmitChange,
}) => {
  const { seats, loading } = useSeats();
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  // dummy values for bookings etc so SeatSelection renders with correct props
  const bookings = [];
  const userActiveBooking = false;

  useEffect(() => {
    if (!loading && seats.length > 0) {
      // Initialize selected seat if currentSeat is valid
      const initialSeat = seats.find(seat => seat.seat_number === currentSeat);
      if (initialSeat) {
        setSelectedSeat(initialSeat.id);
      }
    }
  }, [currentSeat, loading, seats]);

  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeat(seatNumber);
  };

  const handleSubmit = () => {
    if (!selectedSeat) {
      toast({
        title: "Error",
        description: "Please select a new seat.",
        variant: "destructive"
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the seat change.",
        variant: "destructive"
      });
      return;
    }

    onSubmitChange(selectedSeat);
    toast({
      title: "Request Submitted",
      description: "Your seat change request has been submitted.",
    });
  };

  const getSeatNumber = (seatId: string | null) => {
    if (!seatId) return 'N/A';
    const seat = seats.find(seat => seat.id === seatId);
    return seat ? seat.seat_number : 'N/A';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={onBack} className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">Request Seat Change</h1>
        </div>

        <Card className="dashboard-card">
          <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Current Seat: {currentSeat}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Reason for Change</label>
              <Input
                type="text"
                placeholder="Why do you want to change your seat?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Select New Seat</label>
              <SeatSelection
                seats={seats}
                bookings={bookings}
                userActiveBooking={userActiveBooking}
                onSeatSelect={handleSeatSelect}
                selectedSeat={selectedSeat}
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
            >
              Submit Request
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeatChangeRequest;
