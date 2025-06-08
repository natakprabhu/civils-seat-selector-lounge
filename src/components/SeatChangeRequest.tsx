
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import SeatSelection from './SeatSelection';

interface SeatChangeRequestProps {
  currentSeat: string;
  onBack: () => void;
  onSubmitChange: (newSeat: string) => void;
}

const SeatChangeRequest: React.FC<SeatChangeRequestProps> = ({ 
  currentSeat, 
  onBack, 
  onSubmitChange 
}) => {
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingRequest] = useState(false); // This would come from props/state

  // Mock seat data
  const seats = [
    { id: 'seat-A1', number: 'A1', status: 'vacant' as const },
    { id: 'seat-A2', number: 'A2', status: 'booked' as const },
    // Add more seats as needed
  ];

  const handleSeatSelect = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (seat && seat.status === 'vacant') {
      setSelectedSeat(seat.number);
    }
  };

  const handleSubmitChange = async () => {
    if (!selectedSeat) {
      toast({
        title: "Error",
        description: "Please select a new seat",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mock API call - this would cancel any existing requests and create new one
      setTimeout(() => {
        onSubmitChange(selectedSeat);
        toast({
          title: "Request Submitted",
          description: hasPendingRequest 
            ? "Your previous seat change request has been cancelled and a new request has been submitted for admin approval."
            : "Your seat change request has been submitted for admin approval.",
        });
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit seat change request.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            onClick={onBack}
            className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-white">Request Seat Change</h1>
        </div>

        <div className="space-y-8">
          {/* Pending Request Warning */}
          {hasPendingRequest && (
            <Card className="dashboard-card border-orange-500/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="font-semibold text-white">Existing Request</p>
                    <p className="text-sm text-slate-400">You have a pending seat change request. Submitting a new request will automatically cancel the previous one.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Seat Info */}
          <Card className="dashboard-card">
            <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Current Seat Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <span className="font-bold text-lg">{currentSeat}</span>
                </div>
                <div>
                  <p className="font-semibold">Your Current Seat: {currentSeat}</p>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Seat Selection */}
          <Card className="dashboard-card">
            <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
              <CardTitle>Select New Seat</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <SeatSelection 
                seats={seats}
                selectedSeat={selectedSeat ? seats.find(s => s.number === selectedSeat)?.id || null : null}
                onSeatSelect={handleSeatSelect}
                onConfirmSelection={() => {}}
              />
              
              {selectedSeat && (
                <div className="mt-6 p-4 bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-lg border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-white">Selected New Seat: {selectedSeat}</p>
                        <p className="text-sm text-muted-foreground">Change from {currentSeat} to {selectedSeat}</p>
                        {hasPendingRequest && (
                          <p className="text-xs text-orange-400">This will cancel your pending request</p>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={handleSubmitChange}
                      disabled={isSubmitting}
                      className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Change Request'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SeatChangeRequest;
