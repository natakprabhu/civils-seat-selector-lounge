
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, CheckCircle } from 'lucide-react';
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
      // Mock API call
      setTimeout(() => {
        onSubmitChange(selectedSeat);
        toast({
          title: "Request Submitted",
          description: "Your seat change request has been submitted for admin approval.",
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Request Seat Change</h1>
        </div>

        <div className="space-y-8">
          {/* Current Seat Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Current Seat Information
              </CardTitle>
            </CardHeader>
            <CardContent>
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
          <Card>
            <CardHeader>
              <CardTitle>Select New Seat</CardTitle>
            </CardHeader>
            <CardContent>
              <SeatSelection 
                seats={seats}
                selectedSeat={selectedSeat ? seats.find(s => s.number === selectedSeat)?.id || null : null}
                onSeatSelect={handleSeatSelect}
                onConfirmSelection={() => {}}
              />
              
              {selectedSeat && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Selected New Seat: {selectedSeat}</p>
                        <p className="text-sm text-muted-foreground">Change from {currentSeat} to {selectedSeat}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSubmitChange}
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90"
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
