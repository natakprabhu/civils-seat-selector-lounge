import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  LogOut, 
  Users, 
  Clock, 
  Check, 
  X,
  Edit3,
  Save,
  DollarSign,
  Upload,
  IndianRupee
} from 'lucide-react';

interface AdminPageProps {
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
  paymentStatus: 'pending' | 'waiting_for_approval' | 'approved';
  paidAmount?: number;
  paidOn?: string;
  paymentMethod?: 'cash' | 'online';
}

const AdminPage: React.FC<AdminPageProps> = ({ onLogout }) => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([
    {
      id: '1',
      name: 'Rahul Sharma',
      mobile: '9876543210',
      email: 'rahul@email.com',
      seatNumber: 'A5',
      duration: '6',
      status: 'pending',
      submittedAt: '2024-01-15T10:30:00Z',
      paymentStatus: 'pending',
      paidAmount: 0
    },
    {
      id: '2',
      name: 'Priya Singh',
      mobile: '9876543211',
      email: 'priya@email.com',
      seatNumber: 'B12',
      duration: '3',
      status: 'approved',
      submittedAt: '2024-01-14T15:45:00Z',
      paymentStatus: 'approved',
      paidAmount: 15000,
      paidOn: '2024-01-16',
      paymentMethod: 'online'
    }
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<BookingRequest>>({});
  const [paymentEditId, setPaymentEditId] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{
    amount: number;
    method: 'cash' | 'online';
    date: string;
    validityExtension: number; // in months
  }>({
    amount: 0,
    method: 'cash',
    date: new Date().toISOString().split('T')[0],
    validityExtension: 1
  });

  const handleApprove = (id: string) => {
    setBookingRequests(prev => 
      prev.map(booking => 
        booking.id === id 
          ? { ...booking, status: 'approved' }
          : booking
      )
    );
    toast({
      title: "Booking Approved",
      description: "The booking has been approved successfully.",
    });
  };

  const handleReject = (id: string) => {
    setBookingRequests(prev => 
      prev.map(booking => 
        booking.id === id 
          ? { ...booking, status: 'rejected' }
          : booking
      )
    );
    toast({
      title: "Booking Rejected",
      description: "The booking has been rejected.",
      variant: "destructive"
    });
  };

  const handleEdit = (booking: BookingRequest) => {
    setEditingId(booking.id);
    setEditData(booking);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    
    setBookingRequests(prev => 
      prev.map(booking => 
        booking.id === editingId 
          ? { ...booking, ...editData }
          : booking
      )
    );
    setEditingId(null);
    setEditData({});
    toast({
      title: "Booking Updated",
      description: "The booking details have been updated successfully.",
    });
  };

  const handlePaymentEdit = (booking: BookingRequest) => {
    setPaymentEditId(booking.id);
    setPaymentData({
      amount: booking.paidAmount || 0,
      method: booking.paymentMethod || 'cash',
      date: booking.paidOn || new Date().toISOString().split('T')[0],
      validityExtension: 1
    });
  };

  const handleSavePayment = () => {
    if (!paymentEditId) return;
    
    setBookingRequests(prev => 
      prev.map(booking => 
        booking.id === paymentEditId 
          ? { 
              ...booking, 
              paidAmount: (booking.paidAmount || 0) + paymentData.amount,
              paymentMethod: paymentData.method,
              paidOn: paymentData.date,
              paymentStatus: paymentData.amount > 0 ? 'approved' : 'pending',
              // Calculate new validity based on extension
              validityExtendedBy: paymentData.validityExtension
            }
          : booking
      )
    );
    setPaymentEditId(null);
    setPaymentData({ 
      amount: 0, 
      method: 'cash', 
      date: new Date().toISOString().split('T')[0],
      validityExtension: 1
    });
    toast({
      title: "Payment Updated",
      description: `Payment recorded successfully. Validity extended by ${paymentData.validityExtension} month(s).`,
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const stats = {
    totalRequests: bookingRequests.length,
    pendingRequests: bookingRequests.filter(b => b.status === 'pending').length,
    approvedBookings: bookingRequests.filter(b => b.status === 'approved').length,
    rejectedRequests: bookingRequests.filter(b => b.status === 'rejected').length
  };

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
                <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                <p className="text-slate-600">Booking Management System</p>
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
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Requests</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalRequests}</p>
                </div>
                <Users className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pending</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.pendingRequests}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Approved</p>
                  <p className="text-3xl font-bold text-green-900">{stats.approvedBookings}</p>
                </div>
                <Check className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Rejected</p>
                  <p className="text-3xl font-bold text-red-900">{stats.rejectedRequests}</p>
                </div>
                <X className="w-10 h-10 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Requests */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-200 bg-slate-50">
            <CardTitle className="text-xl font-bold text-slate-800">Booking Requests Management</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {bookingRequests.map((booking, index) => (
                <div key={booking.id} className={`p-6 ${index !== bookingRequests.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Name</p>
                          {editingId === booking.id ? (
                            <Input
                              value={editData.name || ''}
                              onChange={(e) => setEditData({...editData, name: e.target.value})}
                              className="h-8"
                            />
                          ) : (
                            <p className="font-semibold text-slate-800">{booking.name}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Contact</p>
                          <p className="text-sm text-slate-800">{booking.mobile}</p>
                          <p className="text-xs text-slate-500">{booking.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Seat & Duration</p>
                          <p className="font-semibold text-slate-800">Seat {booking.seatNumber}</p>
                          {editingId === booking.id ? (
                            <Input
                              value={editData.duration || ''}
                              onChange={(e) => setEditData({...editData, duration: e.target.value})}
                              className="h-6 text-xs mt-1"
                              placeholder="months"
                            />
                          ) : (
                            <p className="text-xs text-slate-500">{booking.duration} months</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Payment</p>
                          {paymentEditId === booking.id ? (
                            <div className="space-y-1">
                              <Input
                                type="number"
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                                className="h-6 text-xs"
                                placeholder="Amount"
                              />
                              <Select value={paymentData.method} onValueChange={(value: 'cash' | 'online') => setPaymentData({...paymentData, method: value})}>
                                <SelectTrigger className="h-6 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="online">Online</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                type="date"
                                value={paymentData.date}
                                onChange={(e) => setPaymentData({...paymentData, date: e.target.value})}
                                className="h-6 text-xs"
                              />
                              <Input
                                type="number"
                                value={paymentData.validityExtension}
                                onChange={(e) => setPaymentData({...paymentData, validityExtension: Number(e.target.value)})}
                                className="h-6 text-xs"
                                placeholder="Validity (months)"
                                min="1"
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-1">
                                <IndianRupee className="w-3 h-3 text-green-600" />
                                <span className="font-semibold text-green-600">{booking.paidAmount || 0}</span>
                              </div>
                              {booking.paidOn && (
                                <p className="text-xs text-slate-500">Paid on: {booking.paidOn}</p>
                              )}
                              {booking.paymentMethod && (
                                <p className="text-xs text-slate-500 capitalize">{booking.paymentMethod}</p>
                              )}
                              {booking.validityExtendedBy && (
                                <p className="text-xs text-blue-500">+{booking.validityExtendedBy} months</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Status</p>
                          <p className="text-xs text-slate-500">{formatDateTime(booking.submittedAt)}</p>
                          <Badge 
                            variant={
                              booking.status === 'approved' ? 'default' : 
                              booking.status === 'rejected' ? 'destructive' : 'secondary'
                            }
                            className="mt-1"
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {editingId === booking.id ? (
                        <>
                          <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      ) : paymentEditId === booking.id ? (
                        <>
                          <Button size="sm" onClick={handleSavePayment} className="bg-green-600 hover:bg-green-700">
                            <Save className="w-4 h-4 mr-1" />
                            Save Payment
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setPaymentEditId(null)}>
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(booking)}>
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handlePaymentEdit(booking)}>
                            <DollarSign className="w-4 h-4 mr-1" />
                            Payment
                          </Button>
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(booking.id)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(booking.id)}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
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

export default AdminPage;
