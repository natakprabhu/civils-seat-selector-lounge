
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SeatSelection from './SeatSelection';
import BookingForm from './BookingForm';
import BookingSuccess from './BookingSuccess';
import { Plus, LogOut, Users, Calendar, CheckCircle, CreditCard, UserCheck, AlertCircle } from 'lucide-react';

interface ClientDashboardProps {
  userMobile: string;
  onLogout: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ userMobile, onLogout }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'seat-selection' | 'booking-form' | 'success'>('dashboard');
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  // Generate seats with row-based numbering
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
        const statuses = ['vacant', 'booked', 'pending'] as const;
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

  // Mock user data - in real app this would come from backend
  const [userStatus] = useState(() => {
    // Simulate different user statuses based on mobile number
    const isSubscribed = Math.random() > 0.3; // 70% chance of being subscribed
    const paymentStatus = ['approved', 'waiting_for_approval', 'pending_payment'][Math.floor(Math.random() * 3)];
    
    return {
      isSubscribed,
      subscriptionValidTill: isSubscribed ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      paymentStatus,
      currentSeat: isSubscribed ? seats.find(s => s.status === 'booked')?.number || null : null
    };
  });

  // Stats calculation
  const stats = {
    total: seats.length,
    booked: seats.filter(s => s.status === 'booked').length,
    vacant: seats.filter(s => s.status === 'vacant').length,
    pending: seats.filter(s => s.status === 'pending').length
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
    setCurrentView('success');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedSeat(null);
  };

  const getPaymentStatusBadge = () => {
    switch (userStatus.paymentStatus) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'waiting_for_approval':
        return <Badge className="bg-yellow-100 text-yellow-800">Waiting for Approval</Badge>;
      case 'pending_payment':
        return <Badge className="bg-red-100 text-red-800">Pending Payment</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  if (currentView === 'seat-selection') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-blue-900">Select Your Seat</h1>
            <Button
              variant="outline"
              onClick={() => setCurrentView('dashboard')}
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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-blue-900">Complete Booking</h1>
            <Button
              variant="outline"
              onClick={() => setCurrentView('seat-selection')}
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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <BookingSuccess onBackToDashboard={handleBackToDashboard} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">CL</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">Civils Lounge</h1>
                <p className="text-sm text-gray-600">Welcome, {userMobile}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* User Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Seat</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStatus.currentSeat || 'Not Assigned'}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Subscription Valid Till</p>
                  <p className="text-lg font-bold text-gray-900">
                    {userStatus.subscriptionValidTill || 'NA'}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Status</p>
                  <div className="mt-2">
                    {getPaymentStatusBadge()}
                  </div>
                </div>
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Seats</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vacant</p>
                  <p className="text-2xl font-bold text-green-600">{stats.vacant}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Booked</p>
                  <p className="text-2xl font-bold text-red-600">{stats.booked}</p>
                </div>
                <Calendar className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Seat Status with Flipped Layout */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Real-time Seat Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
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
                  <span className="font-bold text-blue-900 w-6">{row.letter}:</span>
                  <div className="flex gap-1">
                    {seats.slice(row.startIndex, row.startIndex + row.count).map((seat) => (
                      <div
                        key={seat.id}
                        className={`
                          w-10 h-10 flex items-center justify-center font-semibold text-xs cursor-pointer
                          ${row.flipped ? 'rounded-b-lg rounded-t-sm' : 'rounded-t-lg rounded-b-sm'}
                          ${seat.status === 'vacant' ? 'bg-gray-300 hover:bg-blue-400' : ''}
                          ${seat.status === 'booked' ? 'bg-red-500 text-white' : ''}
                          ${seat.status === 'pending' ? 'bg-yellow-500 text-white' : ''}
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
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
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
              <p className="text-center text-sm text-gray-600 mt-2">
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
