import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useBookings } from '@/hooks/useBookings';
import { useSeats } from '@/hooks/useSeats';
import NoticeBoard from './NoticeBoard';
import SeatImageUpload from './SeatImageUpload';
import { 
  LogOut, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Check, 
  X,
  IndianRupee,
  Bell,
  Upload,
  Image
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { seats, loading: seatsLoading } = useSeats();
  const { bookings, loading, approveBooking, rejectBooking } = useBookings();
  const [currentView, setCurrentView] = useState<'dashboard' | 'notices' | 'seat-images'>('dashboard');

  // Filter only legitimate bookings (not dummy data)
  const legitimateBookings = bookings.filter(booking => 
    booking.profile && 
    booking.seat && 
    !booking.notes?.includes('demo') &&
    !booking.notes?.includes('test')
  );

  const handleApproveRequest = async (requestId: string) => {
    const { error } = await approveBooking(requestId);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve request.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Request Approved",
        description: "Booking request has been approved successfully.",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const { error } = await rejectBooking(requestId);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject request.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Request Rejected",
        description: "Booking request has been rejected.",
        variant: "destructive"
      });
    }
  };

  // --- SEAT COUNTS LOGIC FROM REAL DATABASE ---
  const totalSeats = seats.length;
  const availableSeats = seats.filter(s => s.status === 'vacant').length;
  const onHoldSeats = seats.filter(s => s.status === 'on_hold').length;

  const stats = {
    totalRequests: legitimateBookings.length,
    pendingRequests: legitimateBookings.filter(r => r.status === 'pending').length,
    approvedRequests: legitimateBookings.filter(r => r.status === 'approved').length,
    rejectedRequests: legitimateBookings.filter(r => r.status === 'cancelled').length,
    totalSeats,
    availableSeats,
    onHoldSeats,
  };

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
      {/* Header with Dark Theme */}
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
        {/* --- UPDATE: Seats Statistics Cards --- */}
        <div className="grid md:grid-cols-7 gap-6 mb-6">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Seats</p>
                  <p className="text-2xl font-bold text-white">{stats.totalSeats}</p>
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
                  <p className="text-2xl font-bold text-green-400">{stats.availableSeats}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">On Hold</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.onHoldSeats}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          {/* Old Booking Stats */}
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Booking Requests</p>
                  <p className="text-2xl font-bold text-white">{stats.totalRequests}</p>
                </div>
                <Users className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pendingRequests}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Approved</p>
                  <p className="text-2xl font-bold text-green-400">{stats.approvedRequests}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Rejected</p>
                  <p className="text-2xl font-bold text-red-400">{stats.rejectedRequests}</p>
                </div>
                <X className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Management Table */}
        <Card className="dashboard-card">
          <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <CardTitle className="text-xl font-bold text-white">Legitimate Booking Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {legitimateBookings.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Booking Requests</h3>
                <p className="text-slate-400">No legitimate booking requests to review</p>
              </div>
            ) : (
              <div className="space-y-0">
                {legitimateBookings.map((request, index) => (
                  <div key={request.id} className={`p-6 ${index !== legitimateBookings.length - 1 ? 'border-b border-slate-700/50' : ''}`}>
                    <div className="grid md:grid-cols-5 gap-4 items-center">
                      <div>
                        <p className="text-sm text-slate-400">User Details</p>
                        <p className="font-semibold text-white">{request.profile?.full_name}</p>
                        <p className="text-sm text-slate-500">{request.profile?.email}</p>
                        <p className="text-sm text-slate-500">{request.profile?.mobile}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Seat & Duration</p>
                        <p className="font-semibold text-white">Seat {request.seat?.seat_number}</p>
                        <p className="text-sm text-slate-500">{request.duration_months} months</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Amount</p>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4 text-green-400" />
                          <span className="font-semibold text-green-400">{request.total_amount}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Status</p>
                        <Badge 
                          variant={
                            request.status === 'approved' ? 'default' : 
                            request.status === 'cancelled' ? 'destructive' : 'secondary'
                          }
                        >
                          {request.status === 'pending' ? 'Waiting for Approval' : 
                           request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Actions</p>
                        {request.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveRequest(request.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {request.status !== 'pending' && (
                          <p className="text-sm text-slate-500">
                            {request.status === 'approved' ? 'Approved' : 'Rejected'}
                          </p>
                        )}
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
