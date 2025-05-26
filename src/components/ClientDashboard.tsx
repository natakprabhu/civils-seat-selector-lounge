
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SeatSelection from './SeatSelection';
import BookingForm from './BookingForm';
import BookingSuccess from './BookingSuccess';
import { Plus, LogOut, Users, Calendar, CheckCircle } from 'lucide-react';

interface ClientDashboardProps {
  userMobile: string;
  onLogout: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ userMobile, onLogout }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'seat-selection' | 'booking-form' | 'success'>('dashboard');
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  // Mock data for seats
  const [seats] = useState(() => {
    const seatData = [];
    for (let i = 1; i <= 48; i++) {
      const statuses = ['vacant', 'booked', 'pending'] as const;
      const randomStatus = statuses[Math.floor(Math.random() * 3)];
      seatData.push({
        id: i.toString(),
        number: i.toString().padStart(2, '0'),
        status: i <= 15 ? 'vacant' : randomStatus // Ensure some seats are vacant for demo
      });
    }
    return seatData;
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
                <Calendar className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Seat Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Real-time Seat Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-2 mb-6">
              {seats.map((seat) => (
                <div
                  key={seat.id}
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-sm
                    ${seat.status === 'vacant' ? 'bg-green-500 text-white' : ''}
                    ${seat.status === 'booked' ? 'bg-red-500 text-white' : ''}
                    ${seat.status === 'pending' ? 'bg-yellow-500 text-white' : ''}
                  `}
                >
                  {seat.number}
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <Button
                onClick={() => setCurrentView('seat-selection')}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Book My Seat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
