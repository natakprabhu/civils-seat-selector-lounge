
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, IndianRupee, Clock, ArrowRight } from 'lucide-react';

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
  fromTime?: string;
  toTime?: string;
}

interface MyBookingDetailsProps {
  userBooking: BookingData;
  onBack: () => void;
  onViewTransactions: () => void;
}

const MyBookingDetails: React.FC<MyBookingDetailsProps> = ({ 
  userBooking, 
  onBack, 
  onViewTransactions 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            onClick={onBack}
            className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-white">My Booking Details</h1>
        </div>

        <div className="space-y-6">
          {/* Active Booking Details */}
          <Card className="dashboard-card">
            <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
              <CardTitle className="text-xl font-bold text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Active Booking
                </div>
                <Badge variant="default" className="text-sm">
                  {userBooking.status === 'approved' ? 'Active' : userBooking.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Seat Number</p>
                    <p className="text-2xl font-bold text-white">{userBooking.seatNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Plan Duration</p>
                    <p className="text-lg text-white">{userBooking.planDetails}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Start Date</p>
                    <p className="text-lg text-white">{userBooking.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Timing</p>
                    <p className="text-lg text-white">
                      {userBooking.fromTime || '9:00 AM'} - {userBooking.toTime || '9:00 PM'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Valid Till</p>
                    <p className="text-lg text-white">{userBooking.validTill}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Days Remaining</p>
                    <p className="text-2xl font-bold text-green-400">{userBooking.remainingDays}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Last Payment</p>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4 text-green-400" />
                      <span className="text-lg font-bold text-green-400">{userBooking.paidAmount}</span>
                    </div>
                    <p className="text-xs text-slate-400">Paid on {userBooking.paidOn}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="dashboard-card">
            <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
              <CardTitle className="text-xl font-bold text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  onClick={onViewTransactions}
                  className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600 h-12"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View All Transactions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600 h-12"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Request Seat Change
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Booking History Summary */}
          <Card className="dashboard-card">
            <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
              <CardTitle className="text-xl font-bold text-white">Membership History</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-lg border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Current 6-Month Plan</p>
                      <p className="text-sm text-slate-400">{userBooking.startDate} - {userBooking.validTill}</p>
                      <p className="text-sm text-slate-300">
                        Timing: {userBooking.fromTime || '9:00 AM'} - {userBooking.toTime || '9:00 PM'}
                      </p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
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
