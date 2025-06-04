
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import SeatSelection from './SeatSelection';
import BookingForm from './BookingForm';
import BookingSuccess from './BookingSuccess';
import { Plus, LogOut, Users, Calendar, CheckCircle, CreditCard, UserCheck, AlertCircle, DollarSign } from 'lucide-react';

interface ClientDashboardProps {
  userMobile: string;
  onLogout: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ userMobile, onLogout }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'seat-selection' | 'booking-form' | 'success'>('dashboard');
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  // Generate seats with proper row-based numbering
  const [seats] = useState(() => {
    const seatData = [];
    const rows = [
      { letter: 'A', count: 12 },
      { letter: 'B', count: 12 },
      { letter: 'C', count: 12 },
      { letter: 'D', count: 9 },
      { letter: 'E', count: 7 },
      { letter: 'F', count: 7 }
    ];

    let seatId = 1;
    rows.forEach(row => {
      for (let i = 1; i <= row.count; i++) {
        const statuses = ['vacant', 'booked', 'waiting_for_approval'] as const;
        const randomStatus = seatId <= 20 ? 'vacant' : statuses[Math.floor(Math.random() * 3)];
        seatData.push({
          id: seatId.toString(),
          number: `${row.letter}${i}`,
          status: randomStatus
        });
        seatId++;
      }
    });
    return seatData;
  });

  const [userStatus] = useState(() => {
    const isSubscribed = Math.random() > 0.3;
    const paymentStatus = ['approved', 'waiting_for_approval', 'pending_payment'][Math.floor(Math.random() * 3)];
    
    return {
      isSubscribed,
      subscriptionValidTill: isSubscribed ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      paymentStatus,
      currentSeat: isSubscribed ? seats.find(s => s.status === 'booked')?.number || null : null,
      paidAmount: isSubscribed ? 15000 : 0,
      requestSubmittedAt: '2024-01-15T10:30:00Z'
    };
  });

  const stats = {
    total: seats.length,
    booked: seats.filter(s => s.status === 'booked').length,
    vacant: seats.filter(s => s.status === 'vacant').length,
    waiting: seats.filter(s => s.status === 'waiting_for_approval').length
  };

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeat(seatId);
  };

  const handleConfirmSeatSelection = () => {
    if (selectedSeat) {
      setCurrentView('booking-form');
    }
  };

  const handleSubmitBooking = (bookingData: any) => {
    console.log('Booking submitted:', bookingData);
    toast({
      title: "Booking Request Submitted!",
      description: "Your seat booking request is waiting for admin approval. Contact admin via WhatsApp for any queries.",
    });
    setCurrentView('success');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedSeat(null);
  };

  const getPaymentStatusBadge = () => {
    switch (userStatus.paymentStatus) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'waiting_for_approval':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Waiting for Approval</Badge>;
      case 'pending_payment':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Pending Payment</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (currentView === 'seat-selection') {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Select Your Seat</h1>
            <Button
              variant="outline"
              onClick={() => setCurrentView('dashboard')}
              className="border-slate-300"
            >
              Back to Dashboard
            </Button>
          </div>
          <SeatSelection
            seats={seats}
            selectedSeat={selectedSeat}
            onSeatSelect={handleSeatSelect}
            onConfirmSelection={handleConfirmSeatSelection}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'booking-form') {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Complete Booking</h1>
            <Button
              variant="outline"
              onClick={() => setCurrentView('seat-selection')}
              className="border-slate-300"
            >
              Back to Seat Selection
            </Button>
          </div>
          <BookingForm
            selectedSeat={seats.find(s => s.id === selectedSeat)?.number || ''}
            onSubmitBooking={handleSubmitBooking}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-2xl mx-auto">
          <BookingSuccess onBackToDashboard={handleBackToDashboard} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">CL</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Civils Lounge</h1>
                <p className="text-slate-600">Welcome, {userMobile}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout} className="border-slate-300">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* User Status Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Current Seat</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {userStatus.currentSeat || 'Not Assigned'}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Valid Till</p>
                  <p className="text-lg font-bold text-green-900">
                    {userStatus.subscriptionValidTill || 'NA'}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Payment Status</p>
                  <div className="mt-2">
                    {getPaymentStatusBadge()}
                  </div>
                </div>
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Paid Amount</p>
                  <p className="text-2xl font-bold text-emerald-900">₹{userStatus.paidAmount}</p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Waiting Status Card */}
        {userStatus.paymentStatus === 'waiting_for_approval' && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-10 h-10 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-800">Waiting for Approval</h3>
                  <p className="text-yellow-700">Your booking request is being reviewed by the admin.</p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Submitted: {formatDateTime(userStatus.requestSubmittedAt)}
                  </p>
                </div>
                <Button variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                  Contact Admin
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Seats</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Available</p>
                  <p className="text-2xl font-bold text-green-600">{stats.vacant}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Booked</p>
                  <p className="text-2xl font-bold text-red-600">{stats.booked}</p>
                </div>
                <Calendar className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Waiting</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.waiting}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Seat Status */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader className="border-b border-slate-200 bg-slate-50">
            <CardTitle className="text-xl font-bold text-slate-800">Real-time Seat Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6 flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span>Waiting</span>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {[
                { letter: 'A', count: 12, startIndex: 0, flipped: true },
                { letter: 'B', count: 12, startIndex: 12, flipped: false },
                { letter: 'C', count: 12, startIndex: 24, flipped: true },
                { letter: 'D', count: 9, startIndex: 36, flipped: false },
                { letter: 'E', count: 7, startIndex: 45, flipped: true },
                { letter: 'F', count: 7, startIndex: 52, flipped: false }
              ].map((row) => (
                <div key={row.letter} className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 w-8">{row.letter}:</span>
                  <div className="flex gap-1">
                    {seats.slice(row.startIndex, row.startIndex + row.count).map((seat) => (
                      <div
                        key={seat.id}
                        className={`
                          w-10 h-10 flex items-center justify-center font-semibold text-xs cursor-pointer
                          ${row.flipped ? 'rounded-b-lg rounded-t-sm' : 'rounded-t-lg rounded-b-sm'}
                          ${seat.status === 'vacant' ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                          ${seat.status === 'booked' ? 'bg-red-500 text-white' : ''}
                          ${seat.status === 'waiting_for_approval' ? 'bg-gray-500 text-white' : ''}
                          ${seat.number === userStatus.currentSeat ? 'bg-blue-600 text-white ring-2 ring-blue-300' : ''}
                        `}
                      >
                        {seat.number}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <Button
                onClick={() => setCurrentView('seat-selection')}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 px-8 py-3 shadow-lg"
                size="lg"
                disabled={!userStatus.isSubscribed || userStatus.paymentStatus !== 'approved'}
              >
                <Plus className="w-5 h-5 mr-2" />
                {userStatus.isSubscribed && userStatus.paymentStatus === 'approved' 
                  ? 'Book My Seat' 
                  : 'Subscription Required'}
              </Button>
            </div>
            
            {(!userStatus.isSubscribed || userStatus.paymentStatus !== 'approved') && (
              <p className="text-center text-sm text-slate-600 mt-2">
                Please ensure your subscription is active and payment is approved to book seats.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
