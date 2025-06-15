import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, IndianRupee, Clock, Receipt } from 'lucide-react';

interface BookingData {
  seatNumber: string;
  name: string;
  mobile: string;
  email: string;
  duration: string;
  status: 'not_applied' | 'pending' | 'approved';
  submittedAt: string;
  // Removed finance props for pending
  // paidAmount?: number;
  // paidOn?: string;
  // paymentMethod?: 'cash' | 'online';
  // validTill?: string;
  // remainingDays?: number;
  // startDate?: string;
  // planDetails?: string;
}

interface MyBookingDetailsProps {
  userBooking: BookingData;
  onBack: () => void;
  onViewTransactions: () => void;
}

const MyBookingDetails: React.FC<MyBookingDetailsProps> = ({
  userBooking,
  onBack,
  onViewTransactions,
}) => {
  // For pending, show only request details.
  const isPending = userBooking.status === "pending";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={onBack} className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">My Booking Details</h1>
        </div>
        <div className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Booking Request Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Seat Number</p>
                  <p className="text-white font-semibold">{userBooking.seatNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Duration</p>
                  <p className="text-white font-semibold">{userBooking.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Request Date & Time</p>
                  <p className="text-white font-semibold">{userBooking.submittedAt}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Current Status</p>
                  <Badge
                    variant={
                      userBooking.status === "approved"
                        ? "default"
                        : userBooking.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {userBooking.status === "not_applied"
                      ? "Not Applied"
                      : userBooking.status === "pending"
                      ? "Pending Approval"
                      : "Active"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyBookingDetails;
