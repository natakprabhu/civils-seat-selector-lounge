
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LogOut, 
  Users, 
  CheckCircle, 
  Clock, 
  X, 
  Bell, 
  Image
} from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useSeats } from '@/hooks/useSeats';
import NoticeBoard from './NoticeBoard';
import SeatImageUpload from './SeatImageUpload';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { seats, loading: seatsLoading } = useSeats();
  const { bookings, loading } = useBookings();
  const [currentView, setCurrentView] = useState<'dashboard' | 'notices' | 'seat-images'>('dashboard');

  // Stats can only show total bookings and total seats with the available shape
  const totalSeats = seats.length;
  const totalBookings = bookings.length;
  const availableSeats = totalSeats - totalBookings;

  if (currentView === 'notices') {
    return <NoticeBoard onBack={() => setCurrentView('dashboard')} isStaff={true} />;
  }

  if (currentView === 'seat-images') {
    return <SeatImageUpload onBack={() => setCurrentView('dashboard')} />;
  }

  if (seatsLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Header */}
      <div className="header-gradient shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-black/50 border border-slate-600">
                <img 
                  src="/lovable-uploads/44a09473-e73f-4b90-a571-07436f03ef6e.png" 
                  alt="अध्ययन Library Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">अध्ययन Library - Admin</h1>
                <p className="text-slate-400">Booking Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setCurrentView('notices')}
                className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg border border-slate-600"
              >
                <Bell className="w-4 h-4 mr-2" />
                Manage Notices
              </Button>
              <Button
                onClick={() => setCurrentView('seat-images')}
                className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg border border-slate-600"
              >
                <Image className="w-4 h-4 mr-2" />
                Seat Images
              </Button>
              <Button
                variant="outline"
                onClick={onLogout}
                className="border-slate-600 bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white hover:border-slate-500 shadow-lg shadow-black/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Seats</p>
                  <p className="text-2xl font-bold text-white">{totalSeats}</p>
                </div>
                <Users className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Available</p>
                  <p className="text-2xl font-bold text-green-400">{availableSeats}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Bookings</p>
                  <p className="text-2xl font-bold text-yellow-400">{totalBookings}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-card">
          <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <CardTitle className="text-xl font-bold text-white">Booking Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {bookings.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Booking Requests</h3>
                <p className="text-slate-400">No booking requests to review</p>
              </div>
            ) : (
              <div className="space-y-0">
                {bookings.map((request, index) => (
                  <div key={request.id} className={`p-6 ${index !== bookings.length - 1 ? 'border-b border-slate-700/50' : ''}`}>
                    <div className="grid md:grid-cols-5 gap-4 items-center">
                      <div>
                        <p className="text-sm text-slate-400">Booking ID</p>
                        <p className="font-semibold text-white">{request.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Seat ID</p>
                        <p className="font-semibold text-white">{request.seat_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Show ID</p>
                        <p className="font-semibold text-white">{request.show_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">User ID</p>
                        <p className="font-semibold text-white">{request.user_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Booked At</p>
                        <p className="font-semibold text-white">{request.booked_at}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

