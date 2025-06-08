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
  validityExtendedBy?: number;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Header with Dark Theme */}
      <div className="header-gradient shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-black/50 border border-slate-600">
                <span className="text-white font-bold text-lg">CL</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-slate-400">Booking Management System</p>
              </div>
            </div>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards with Dark Theme */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Requests</p>
                  <p className="text-3xl font-bold text-white">{stats.totalRequests}</p>
                </div>
                <Users className="w-10 h-10 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Pending</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.pendingRequests}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Approved</p>
                  <p className="text-3xl font-bold text-green-400">{stats.approvedBookings}</p>
                </div>
                <Check className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Rejected</p>
                  <p className="text-3xl font-bold text-red-400">{stats.rejectedRequests}</p>
                </div>
                <X className="w-10 h-10 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Requests with Dark Theme */}
        <Card className="dashboard-card">
          <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <CardTitle className="text-xl font-bold text-white">Booking Requests Management</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {bookingRequests.map((booking, index) => (
                <div key={booking.id} className={`p-6 ${index !== bookingRequests.length - 1 ? 'border-b border-slate-700/50' : ''}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Name</p>
                          {editingId === booking.id ? (
                            <Input
                              value={editData.name || ''}
                              onChange={(e) => setEditData({...editData, name: e.target.value})}
                              className="h-8 bg-slate-800 border-slate-600 text-white"
                            />
                          ) : (
                            <p className="font-semibold text-white">{booking.name}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Contact</p>
                          <p className="text-sm text-white">{booking.mobile}</p>
                          <p className="text-xs text-slate-500">{booking.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Seat & Duration</p>
                          <p className="font-semibold text-white">Seat {booking.seatNumber}</p>
                          {editingId === booking.id ? (
                            <Input
                              value={editData.duration || ''}
                              onChange={(e) => setEditData({...editData, duration: e.target.value})}
                              className="h-6 text-xs mt-1 bg-slate-800 border-slate-600 text-white"
                              placeholder="months"
                            />
                          ) : (
                            <p className="text-xs text-slate-500">{booking.duration} months</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Payment</p>
                          {paymentEditId === booking.id ? (
                            <div className="space-y-1">
                              <Input
                                type="number"
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                                className="h-6 text-xs bg-slate-800 border-slate-600 text-white"
                                placeholder="Amount"
                              />
                              <Select value={paymentData.method} onValueChange={(value: 'cash' | 'online') => setPaymentData({...paymentData, method: value})}>
                                <SelectTrigger className="h-6 text-xs bg-slate-800 border-slate-600 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-600">
                                  <SelectItem value="cash" className="text-white">Cash</SelectItem>
                                  <SelectItem value="online" className="text-white">Online</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                type="date"
                                value={paymentData.date}
                                onChange={(e) => setPaymentData({...paymentData, date: e.target.value})}
                                className="h-6 text-xs bg-slate-800 border-slate-600 text-white"
                              />
                              <Input
                                type="number"
                                value={paymentData.validityExtension}
                                onChange={(e) => setPaymentData({...paymentData, validityExtension: Number(e.target.value)})}
                                className="h-6 text-xs bg-slate-800 border-slate-600 text-white"
                                placeholder="Validity (months)"
                                min="1"
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-1">
                                <IndianRupee className="w-3 h-3 text-green-400" />
                                <span className="font-semibold text-green-400">{booking.paidAmount || 0}</span>
                              </div>
                              {booking.paidOn && (
                                <p className="text-xs text-slate-500">Paid on: {booking.paidOn}</p>
                              )}
                              {booking.paymentMethod && (
                                <p className="text-xs text-slate-500 capitalize">{booking.paymentMethod}</p>
                              )}
                              {booking.validityExtendedBy && (
                                <p className="text-xs text-cyan-400">+{booking.validityExtendedBy} months</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Status</p>
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
                          <Button 
                            size="sm" 
                            onClick={handleSaveEdit} 
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setEditingId(null)}
                            className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      ) : paymentEditId === booking.id ? (
                        <>
                          <Button 
                            size="sm" 
                            onClick={handleSavePayment} 
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save Payment
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setPaymentEditId(null)}
                            className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(booking)}
                            className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handlePaymentEdit(booking)}
                            className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
                          >
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
