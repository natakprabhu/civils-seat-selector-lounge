
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import NoticeBoard from './NoticeBoard';
import { 
  LogOut, 
  Users, 
  CheckCircle, 
  Printer,
  Search,
  Calendar,
  Bell
} from 'lucide-react';

interface StaffDashboardProps {
  onLogout: () => void;
}

interface ConfirmedBooking {
  id: string;
  name: string;
  mobile: string;
  email: string;
  seatNumber: string;
  duration: string;
  startDate: string;
  endDate: string;
  receiptNumber: string;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'dashboard' | 'notice-board'>('dashboard');
  
  // Empty array since data is reset
  const [confirmedBookings] = useState<ConfirmedBooking[]>([]);

  const filteredBookings = confirmedBookings.filter(booking =>
    booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.mobile.includes(searchTerm) ||
    booking.seatNumber.includes(searchTerm) ||
    booking.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrintReceipt = (booking: ConfirmedBooking) => {
    console.log('Printing receipt for:', booking);
    // In a real app, this would trigger the print functionality
  };

  const stats = {
    totalBookings: confirmedBookings.length,
    activeSeats: confirmedBookings.length,
    totalRevenue: confirmedBookings.reduce((sum, booking) => {
      const monthlyRate = 2000; // Example rate per month
      return sum + (parseInt(booking.duration) * monthlyRate);
    }, 0)
  };

  if (currentView === 'notice-board') {
    return (
      <NoticeBoard
        onBack={() => setCurrentView('dashboard')}
        isStaff={true}
      />
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
                <img 
                  src="/lovable-uploads/84938183-4aaf-4db7-ab36-6b13bd214f25.png" 
                  alt="अध्ययन Library Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">अध्ययन Library - Staff</h1>
                <p className="text-sm text-gray-600">Booking Records & Receipt Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('notice-board')}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notice Board
              </Button>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmed Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Seats</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeSeats}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Bookings */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Confirmed Bookings</CardTitle>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, mobile, seat, or receipt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-80"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                No confirmed bookings yet. All data has been reset.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;
