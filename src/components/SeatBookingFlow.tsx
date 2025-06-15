import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, IndianRupee, Calendar, CheckCircle } from 'lucide-react';
import BookingForm from './BookingForm';
import { useSeats } from '@/hooks/useSeats';
import { useBookings } from '@/hooks/useBookings';
import { toast } from '@/hooks/use-toast';

interface SeatBookingFlowProps {
  selectedSeat: any;
  onBack: () => void;
  onBookingComplete: () => void;
}

const SeatBookingFlow: React.FC<SeatBookingFlowProps> = ({
  selectedSeat,
  onBack,
  onBookingComplete
}) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { createBooking } = useBookings();
  const { lockSeat, releaseSeatLock } = useSeats();

  const handleConfirmSelection = () => {
    setShowBookingForm(true);
  };

  const handleSubmitBooking = async (bookingData: any) => {
    const durationMonths = parseInt(bookingData.duration);
    const totalAmount = durationMonths * selectedSeat.monthly_rate;

    // Try to lock the seat before creating a booking
    const lockResult = await lockSeat(selectedSeat.id);
    if (lockResult.error) {
      toast({
        title: "Booking Error",
        description: lockResult.error.message || "Failed to lock seat for booking.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await createBooking(
      selectedSeat.id,
      durationMonths,
      totalAmount
    );

    // Always release the lock after booking attempt (success or failure)
    await releaseSeatLock(selectedSeat.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking request.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Booking Request Submitted",
        description: "Your booking request has been submitted for admin approval.",
      });
      onBookingComplete();
    }
  };

  if (showBookingForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={() => setShowBookingForm(false)}
              className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Seat Details
            </Button>
          </div>
          <BookingForm 
            selectedSeat={selectedSeat.seat_number}
            onSubmitBooking={handleSubmitBooking}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={onBack}
            className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Seat Selection
          </Button>
        </div>

        <Card className="dashboard-card">
          <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Seat Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg inline-block mb-4">
                <span className="font-bold text-lg">Seat {selectedSeat.seat_number}</span>
              </div>
              <Badge variant="default" className="bg-green-500">
                Available
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                <span className="text-slate-300">Section</span>
                <span className="text-white font-semibold">{selectedSeat.section}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                <span className="text-slate-300">Row</span>
                <span className="text-white font-semibold">{selectedSeat.row_number}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                <span className="text-slate-300">Monthly Rate</span>
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-semibold">{selectedSeat.monthly_rate}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Booking Process:</p>
                  <p>After confirming, you'll fill out your details and your request will be sent for admin approval.</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleConfirmSelection}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold shadow-lg"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirm Seat Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeatBookingFlow;
