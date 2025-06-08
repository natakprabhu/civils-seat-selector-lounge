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
  Calendar, 
  CheckCircle, 
  Clock, 
  Send, 
  Check, 
  X,
  Printer,
  RefreshCw,
  Upload,
  Edit,
  ToggleLeft,
  ToggleRight,
  IndianRupee,
  FileImage
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
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  paymentMode?: 'cash' | 'online';
  paymentDate?: string;
  screenshot?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  lastPayment: string;
  expiry: string;
  remainingDays: number;
  isActive: boolean;
  seatNumber?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([
    {
      id: '1',
      name: 'Rahul Sharma',
      mobile: '9876543210',
      email: 'rahul@email.com',
      seatNumber: 'A5',
      duration: '6',
      amount: 15000,
      status: 'pending',
      submittedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Priya Singh',
      mobile: '9876543211',
      email: 'priya@email.com',
      seatNumber: 'B12',
      duration: '3',
      amount: 7500,
      status: 'approved',
      submittedAt: '2024-01-14T15:45:00Z',
      paymentMode: 'online',
      paymentDate: '2024-01-16'
    }
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Rahul Sharma',
      email: 'rahul@email.com',
      lastPayment: '2024-01-16',
      expiry: '2024-07-16',
      remainingDays: 45,
      isActive: true,
      seatNumber: 'A5'
    },
    {
      id: '2',
      name: 'Priya Singh',
      email: 'priya@email.com',
      lastPayment: '2024-01-10',
      expiry: '2024-04-10',
      remainingDays: 15,
      isActive: true,
      seatNumber: 'B12'
    }
  ]);

  const handleApproveRequest = async (requestId: string) => {
    try {
      // Mock API call
      console.log('Approving request:', requestId);
      
      setBookingRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'approved' }
            : req
        )
      );
      
      toast({
        title: "Request Approved",
        description: "Booking request has been approved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request.",
        variant: "destructive"
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      // Mock API call
      console.log('Rejecting request:', requestId);
      
      setBookingRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'rejected' }
            : req
        )
      );
      
      toast({
        title: "Request Rejected",
        description: "Booking request has been rejected.",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request.",
        variant: "destructive"
      });
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      // Mock API call
      console.log('Toggling user status:', userId);
      
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, isActive: !user.isActive }
            : user
        )
      );
      
      toast({
        title: "User Status Updated",
        description: "User status has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive"
      });
    }
  };

  const handleScreenshotUpload = (requestId: string, file: File) => {
    // Mock file upload
    const reader = new FileReader();
    reader.onload = () => {
      setBookingRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, screenshot: reader.result as string }
            : req
        )
      );
      
      toast({
        title: "Screenshot Uploaded",
        description: "Payment screenshot has been uploaded successfully.",
      });
    };
    reader.readAsDataURL(file);
  };

  const stats = {
    totalRequests: bookingRequests.length,
    pendingRequests: bookingRequests.filter(r => r.status === 'pending').length,
    approvedRequests: bookingRequests.filter(r => r.status === 'approved').length,
    rejectedRequests: bookingRequests.filter(r => r.status === 'rejected').length
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

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Section 1: Stats Cards with Dark Theme */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Requests</p>
                  <p className="text-2xl font-bold text-white">{stats.totalRequests}</p>
                </div>
                <Users className="w-8 h-8 text-cyan-400" />
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

        {/* Section 2: Request Management Table with Dark Theme */}
        <Card className="dashboard-card">
          <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <CardTitle className="text-xl font-bold text-white">Request Management</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {bookingRequests.map((request, index) => (
                <div key={request.id} className={`p-6 ${index !== bookingRequests.length - 1 ? 'border-b border-slate-700/50' : ''}`}>
                  <div className="grid md:grid-cols-6 gap-4 items-center">
                    <div>
                      <p className="text-sm text-slate-400">Name</p>
                      <p className="font-semibold text-white">{request.name}</p>
                      <p className="text-sm text-slate-500">{request.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Seat & Duration</p>
                      <p className="font-semibold text-white">Seat {request.seatNumber}</p>
                      <p className="text-sm text-slate-500">{request.duration} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Amount</p>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4 text-green-400" />
                        <span className="font-semibold text-green-400">{request.amount}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Payment Info</p>
                      {request.paymentMode && (
                        <p className="text-sm text-white capitalize">{request.paymentMode}</p>
                      )}
                      {request.paymentDate && (
                        <p className="text-xs text-slate-500">{request.paymentDate}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Screenshot</p>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleScreenshotUpload(request.id, file);
                          }}
                          className="hidden"
                          id={`upload-${request.id}`}
                        />
                        <label htmlFor={`upload-${request.id}`}>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            asChild
                            className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
                          >
                            <span>
                              <Upload className="w-4 h-4 mr-1" />
                              Upload
                            </span>
                          </Button>
                        </label>
                        {request.screenshot && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
                          >
                            <FileImage className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Actions</p>
                      <div className="flex gap-2">
                        <Badge 
                          variant={
                            request.status === 'approved' ? 'default' : 
                            request.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
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
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: User Management Table with Dark Theme */}
        <Card className="dashboard-card">
          <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <CardTitle className="text-xl font-bold text-white">User Management</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {users.map((user, index) => (
                <div key={user.id} className={`p-6 ${index !== users.length - 1 ? 'border-b border-slate-700/50' : ''}`}>
                  <div className="grid md:grid-cols-6 gap-4 items-center">
                    <div>
                      <p className="text-sm text-slate-400">Name</p>
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Seat</p>
                      <p className="font-semibold text-white">{user.seatNumber || 'Not Assigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Last Payment</p>
                      <p className="text-sm text-white">{user.lastPayment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Expiry</p>
                      <p className="text-sm text-white">{user.expiry}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Remaining Days</p>
                      <p className={`font-semibold ${user.remainingDays < 30 ? 'text-red-400' : 'text-green-400'}`}>
                        {user.remainingDays}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Status</p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleUserStatus(user.id)}
                          className="p-0 hover:bg-slate-800"
                        >
                          {user.isActive ? (
                            <ToggleRight className="w-6 h-6 text-green-400" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-500" />
                          )}
                        </Button>
                        <span className={`text-sm ${user.isActive ? 'text-green-400' : 'text-slate-500'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
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
