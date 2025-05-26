
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  LogOut, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Send, 
  Check, 
  X,
  Printer,
  RefreshCw
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface BookingRequest {
  id: string;
  name: string;
  mobile: string;
  email: string;
  seatNumber: string;
  duration: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  paymentStatus: 'pending' | 'sent' | 'completed';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([
    {
      id: '1',
      name: 'Rahul Sharma',
      mobile: '9876543210',
      email: 'rahul@email.com',
      seatNumber: '05',
      duration: '6',
      status: 'pending',
      submittedAt: '2024-01-15T10:30:00Z',
      paymentStatus: 'pending'
    },
    {
      id: '2',
      name: 'Priya Singh',
      mobile: '9876543211',
      email: 'priya@email.com',
      seatNumber: '12',
      duration: '3',
      status: 'approved',
      submittedAt: '2024-01-14T15:45:00Z',
      paymentStatus: 'completed'
    },
    {
      id: '3',
      name: 'Amit Kumar',
      mobile: '9876543212',
      email: 'amit@email.com',
      seatNumber: '08',
      duration: '12',
      status: 'pending',
      submittedAt: '2024-01-15T09:15:00Z',
      paymentStatus: 'pending'
    }
  ]);

  const handleSendPaymentLink = (bookingId: string) => {
    setBookingRequests(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, paymentStatus: 'sent' }
          : booking
      )
    );
  };

  const handleApproveBooking = (bookingId: string) => {
    setBookingRequests(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'approved', paymentStatus: 'completed' }
          : booking
      )
    );
  };

  const handleRejectBooking = (bookingId: string) => {
    setBookingRequests(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'rejected' }
          : booking
      )
    );
  };

  const stats = {
    totalRequests: bookingRequests.length,
    pendingRequests: bookingRequests.filter(b => b.status === 'pending').length,
    approvedBookings: bookingRequests.filter(b => b.status === 'approved').length,
    rejectedRequests: bookingRequests.filter(b => b.status === 'rejected').length
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
                <h1 className="text-xl font-bold text-blue-900">Civils Lounge - Admin</h1>
                <p className="text-sm text-gray-600">Booking Management System</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approvedBookings}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejectedRequests}</p>
                </div>
                <X className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Requests Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookingRequests.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-6 bg-white">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-semibold">{booking.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Contact</p>
                          <p className="text-sm">{booking.mobile}</p>
                          <p className="text-sm text-gray-500">{booking.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Seat & Duration</p>
                          <p className="font-semibold">Seat {booking.seatNumber}</p>
                          <p className="text-sm text-gray-500">{booking.duration} months</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <div className="flex flex-col gap-1">
                            <Badge 
                              variant={
                                booking.status === 'approved' ? 'default' : 
                                booking.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                            >
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                            {booking.status === 'approved' && (
                              <Badge variant="outline" className="text-xs">
                                Payment: {booking.paymentStatus}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendPaymentLink(booking.id)}
                            disabled={booking.paymentStatus === 'sent'}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            {booking.paymentStatus === 'sent' ? 'Link Sent' : 'Send Payment Link'}
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveBooking(booking.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectBooking(booking.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {booking.status === 'approved' && (
                        <>
                          <Button size="sm" variant="outline">
                            <Printer className="w-4 h-4 mr-1" />
                            Print Receipt
                          </Button>
                          <Button size="sm" variant="outline">
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Resend Receipt
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
