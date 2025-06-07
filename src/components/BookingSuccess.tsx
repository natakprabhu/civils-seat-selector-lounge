
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Phone, ArrowRight, Home } from 'lucide-react';

interface BookingSuccessProps {
  seatNumber: string;
  onBackToDashboard: () => void;
}

const BookingSuccess: React.FC<BookingSuccessProps> = ({ seatNumber, onBackToDashboard }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Congratulations!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-lg font-semibold">
              Your booking request for Seat {seatNumber} has been submitted successfully!
            </p>
            
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-4 h-4 text-primary" />
                <span>You will receive a payment link shortly</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-4 h-4 text-primary" />
                <span>Admin will review your request within 24 hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-4 h-4 text-primary" />
                <span>You'll be notified once approved</span>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-semibold">Need Help?</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                For any queries or assistance, contact us at:
              </p>
              <p className="font-semibold">+91-9876543210</p>
            </div>
          </div>
          
          <Button 
            onClick={onBackToDashboard}
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingSuccess;
