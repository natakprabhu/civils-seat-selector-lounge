import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import SeatSelection from './SeatSelection';
import { useSeats } from '@/hooks/useSeats';
import { useSeatMapStatus } from '@/hooks/useSeatMapStatus';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface SeatChangeRequestProps {
  currentSeat: string;
  onBack: () => void;
  onSubmitChange: (newSeat: string) => void;
}

const SeatChangeRequest: React.FC<SeatChangeRequestProps> = ({ currentSeat, onBack, onSubmitChange }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [reason, setReason] = useState('');
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const { seats, loading: seatsLoading } = useSeats();
  const { seatStatuses, loading: seatStatusesLoading } = useSeatMapStatus("61559e4a-63b6-49ae-bdb4-17b046d3534f"); // Replace with actual show ID

  useEffect(() => {
    if (!seatsLoading && seats.length > 0) {
      // You might want to pre-select the current seat if it's still available
      // setSelectedSeat(currentSeat);
    }
  }, [seats, seatsLoading, currentSeat]);

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeat(seatId);
  };

  const handleSubmit = async () => {
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
        description: "Please provide a reason for the seat change request.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Insert seat change request into the database
      const { error } = await supabase
        .from('seat_change_requests')
        .insert({
          user_id: userId,
          current_booking_id: null, // You might need to fetch the current booking ID
          new_seat_id: selectedSeat,
          reason: reason,
          status: 'pending',
          requested_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Your seat change request has been submitted.",
      });

      onSubmitChange(selectedSeat); // Notify parent component
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (seatsLoading || seatStatusesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <Button variant="ghost" onClick={onBack} className="text-white">
          &larr; Back to Dashboard
        </Button>

        <Card className="dashboard-card">
          <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <CardTitle className="text-xl font-bold text-white">Request Seat Change</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentSeat" className="text-sm font-medium text-slate-300">Current Seat</Label>
                <Input
                  id="currentSeat"
                  value={currentSeat || 'Not Assigned'}
                  className="bg-slate-700 border-slate-600 text-white"
                  readOnly
                />
              </div>

              <div>
                <Label htmlFor="reason" className="text-sm font-medium text-slate-300">Reason for Change</Label>
                <Input
                  id="reason"
                  placeholder="Enter reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-300">Select New Seat</Label>
                <SeatSelection
                  seats={seats}
                  seatStatuses={seatStatuses}
                  selectedSeatId={selectedSeat}
                  onSeatSelect={handleSeatSelect}
                  bookingInProgress={false}
                  myUserId={userId}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="secondary" onClick={onBack}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  Submit Request
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeatChangeRequest;
