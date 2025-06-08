import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import GoogleSheetsConfig from './GoogleSheetsConfig';
import { googleSheetsService, BookingSheetRow, UserSheetRow } from '@/services/googleSheetsService';
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
  FileImage,
  Settings
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'config'>('dashboard');
  const [isGoogleSheetsConfigured, setIsGoogleSheetsConfigured] = useState(false);
  const [bookingRequests, setBookingRequests] = useState<BookingSheetRow[]>([]);
  const [users, setUsers] = useState<UserSheetRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if Google Sheets is configured
    const apiKey = localStorage.getItem('google_sheets_api_key');
    const spreadsheetId = localStorage.getItem('google_sheets_spreadsheet_id');
    
    if (apiKey && spreadsheetId) {
      setIsGoogleSheetsConfigured(true);
      googleSheetsService.setCredentials(apiKey, spreadsheetId);
      loadData();
    }
  }, []);

  const loadData = async () => {
    if (!isGoogleSheetsConfigured) return;
    
    setIsLoading(true);
    try {
      const [requests, usersList] = await Promise.all([
        googleSheetsService.getBookingRequests(),
        googleSheetsService.getUsers()
      ]);
      
      setBookingRequests(requests);
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data from Google Sheets",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await googleSheetsService.updateBookingRequest(requestId, { 
        status: 'approved',
        paymentDate: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        validTill: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 6 months from now
      });
      
      await loadData(); // Reload data
      
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
      await googleSheetsService.updateBookingRequest(requestId, { status: 'rejected' });
      await loadData(); // Reload data
      
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
      const user = users.find(u => u.id === userId);
      if (!user) return;
      
      await googleSheetsService.updateUser(userId, { isActive: !user.isActive });
      await loadData(); // Reload data
      
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
    // Mock file upload - in real implementation, you'd upload to cloud storage
    // and store the URL in the spreadsheet
    toast({
      title: "Screenshot Uploaded",
      description: "Payment screenshot has been uploaded successfully.",
    });
  };

  const stats = {
    totalRequests: bookingRequests.length,
    pendingRequests: bookingRequests.filter(r => r.status === 'pending').length,
    approvedRequests: bookingRequests.filter(r => r.status === 'approved').length,
    rejectedRequests: bookingRequests.filter(r => r.status === 'rejected').length
  };

  // Show configuration if Google Sheets is not set up
  if (currentView === 'config' || !isGoogleSheetsConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="header-gradient shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-black/50 border border-slate-600">
                  <span className="text-white font-bold text-lg">CL</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Admin Dashboard - Setup</h1>
                  <p className="text-slate-400">Configure Google Sheets Integration</p>
                </div>
              </div>
              <div className="flex gap-2">
                {isGoogleSheetsConfigured && (
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentView('dashboard')}
                    className="border-slate-600 bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white hover:border-slate-500 shadow-lg shadow-black/50"
                  >
                    Back to Dashboard
                  </Button>
                )}
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

        <div className="max-w-7xl mx-auto px-6 py-8">
          <GoogleSheetsConfig onConfigured={(configured) => {
            setIsGoogleSheetsConfigured(configured);
            if (configured) {
              setCurrentView('dashboard');
              loadData();
            }
          }} />
        </div>
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
                <span className="text-white font-bold text-lg">CL</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-slate-400">Booking Management System</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('config')}
                className="border-slate-600 bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white hover:border-slate-500 shadow-lg shadow-black/50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Config
              </Button>
              <Button 
                variant="outline" 
                onClick={loadData}
                disabled={isLoading}
                className="border-slate-600 bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white hover:border-slate-500 shadow-lg shadow-black/50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
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

        {/* ... keep existing code (Request Management Table and User Management Table sections) */}
        
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
