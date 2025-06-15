import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, IndianRupee, Clock, Receipt, X } from 'lucide-react';

interface BookingData {
  seatNumber: string;
  name: string;
  mobile: string;
  email: string;
  duration: string;
  status: 'not_applied' | 'pending' | 'approved';
  submittedAt: string;
  paymentStatus: 'pending' | 'approved';
  paidAmount?: number;
  paidOn?: string;
  paymentMethod?: 'cash' | 'online';
  validTill?: string;
  remainingDays?: number;
  startDate?: string;
  planDetails?: string;
}

interface MyBookingDetailsProps {
  userBooking: BookingData;
  onBack: () => void;
  onViewTransactions: () => void;
  onCancelRequest?: () => Promise<void>; // NEW prop for cancelling booking
}

const MyBookingDetails: React.FC<MyBookingDetailsProps> = ({ 
  userBooking, 
  onBack, 
  onViewTransactions,
  onCancelRequest
}) => {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!onCancelRequest) return;
    setCancelling(true);
    await onCancelRequest();
    setCancelling(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            onClick={onBack}
            className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">My Booking Details</h1>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="dashboard-card">
            <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Full Name</p>
                  <p className="text-white font-semibold">{userBooking.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Mobile Number</p>
                  <p className="text-white font-semibold">{userBooking.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Email Address</p>
                  <p className="text-white font-semibold">{userBooking.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Booking Status</p>
                  <Badge 
                    variant={
                      userBooking.status === 'approved' ? 'default' : 
                      userBooking.status === 'pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {userBooking.status === 'not_applied' ? 'Not Applied' :
                     userBooking.status === 'pending' ? 'Pending Approval' : 'Active'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seat Information */}
          <Card className="dashboard-card">
            <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Seat Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Allocated Seat</p>
                  <p className="text-white font-semibold text-lg">Seat {userBooking.seatNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Plan Duration</p>
                  <p className="text-white font-semibold">{userBooking.planDetails}</p>
                </div>
                {userBooking.startDate && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Start Date</p>
                    <p className="text-white font-semibold">{userBooking.startDate}</p>
                  </div>
                )}
                {userBooking.validTill && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Valid Till</p>
                    <p className="text-white font-semibold">{userBooking.validTill}</p>
                  </div>
                )}
                {userBooking.remainingDays !== undefined && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Days Remaining</p>
                    <p className={`font-semibold text-lg ${userBooking.remainingDays < 30 ? 'text-red-400' : 'text-green-400'}`}>
                      {userBooking.remainingDays} days
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="dashboard-card">
            <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {userBooking.paidAmount && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Amount Paid</p>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-semibold text-lg">{userBooking.paidAmount}</span>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-400 mb-1">Payment Status</p>
                  <Badge 
                    variant={userBooking.paymentStatus === 'approved' ? 'default' : 'secondary'}
                  >
                    {userBooking.paymentStatus === 'approved' ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
                {userBooking.paymentMethod && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Payment Method</p>
                    <p className="text-white font-semibold capitalize">{userBooking.paymentMethod}</p>
                  </div>
                )}
                {userBooking.paidOn && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Payment Date</p>
                    <p className="text-white font-semibold">{userBooking.paidOn}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button 
              onClick={onViewTransactions}
              className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
            >
              <Receipt className="w-4 h-4 mr-2" />
              View All Transactions
            </Button>
            {/* Show Cancel Request ONLY if status is 'pending' (not for 'approved') */}
            {userBooking.status === 'pending' && onCancelRequest && (
              <Button
                onClick={handleCancel}
                disabled={cancelling}
                className="bg-gradient-to-b from-red-700 to-pink-900 hover:from-red-800 hover:to-pink-800 text-white border border-red-500 flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                {cancelling ? 'Cancelling...' : 'Cancel Request'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookingDetails;
