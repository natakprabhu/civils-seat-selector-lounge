
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  LogOut, 
  Users, 
  CheckCircle, 
  Printer,
  Search,
  Calendar
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
  
  const [confirmedBookings] = useState<ConfirmedBooking[]>([
    {
      id: '1',
      name: 'Priya Singh',
      mobile: '9876543211',
      email: 'priya@email.com',
      seatNumber: '12',
      duration: '3',
      startDate: '2024-01-15',
      endDate: '2024-04-15',
      receiptNumber: 'CL-2024-001'
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      mobile: '9876543213',
      email: 'rajesh@email.com',
      seatNumber: '25',
      duration: '6',
      startDate: '2024-01-10',
      endDate: '2024-07-10',
      receiptNumber: 'CL-2024-002'
    },
    {
      id: '3',
      name: 'Anita Sharma',
      mobile: '9876543214',
      email: 'anita@email.com',
      seatNumber: '33',
      duration: '12',
      startDate: '2024-01-05',
      endDate: '2025-01-05',
      receiptNumber: 'CL-2024-003'
    }
  ]);

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
                <h1 className="text-xl font-bold text-blue-900">Civils Lounge - Staff</h1>
                <p className="text-sm text-gray-600">Booking Records & Receipt Management</p>
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
              {filteredBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No bookings found matching your search.' : 'No confirmed bookings yet.'}
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-6 bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Student Name</p>
                            <p className="font-semibold">{booking.name}</p>
                            <p className="text-sm text-gray-500">{booking.mobile}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Seat Details</p>
                            <p className="font-semibold">Seat {booking.seatNumber}</p>
                            <p className="text-sm text-gray-500">{booking.duration} months</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="text-sm">{booking.startDate}</p>
                            <p className="text-sm text-gray-500">to {booking.endDate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Receipt No.</p>
                            <p className="font-semibold text-blue-600">{booking.receiptNumber}</p>
                            <Badge variant="outline" className="mt-1">
                              Confirmed
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintReceipt(booking)}
                        >
                          <Printer className="w-4 h-4 mr-1" />
                          Print Receipt
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;
