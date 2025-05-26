
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone } from 'lucide-react';

interface BookingSuccessProps {
  onBackToDashboard: () => void;
}

const BookingSuccess: React.FC<BookingSuccessProps> = ({ onBackToDashboard }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-green-700">Booking Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="font-semibold text-yellow-800">Status: Waiting for Admin Approval</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 text-sm leading-relaxed">
              Your booking request is submitted. You will receive a payment link shortly.
            </p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 text-sm">
              <strong>Need Help?</strong>
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-semibold">+91-9875543210</span>
            </div>
          </div>
          
          <Button
            onClick={onBackToDashboard}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingSuccess;
