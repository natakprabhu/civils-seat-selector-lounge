import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import SeatSelection from './SeatSelection';
import SeatChangeRequest from './SeatChangeRequest';
import TransactionHistory from './TransactionHistory';
import EditProfile from './EditProfile';
import BookingSuccess from './BookingSuccess';
import ExtendBooking from './ExtendBooking';
import MyBookingDetails from './MyBookingDetails';
import AllTransactions from './AllTransactions';
import NoticeBoard from './NoticeBoard';
import { useSeats } from '@/hooks/useSeats';
import { useBookings } from '@/hooks/useBookings';
import { 
  LogOut, 
  User, 
  Calendar, 
  Clock, 
  Check, 
  X,
  IndianRupee,
  Receipt,
  History,
  Edit,
  Download,
  MapPin,
  Users,
  ChevronDown,
  Plus,
  AlertCircle,
  ArrowRight,
  Bell
} from 'lucide-react';
import { ToastAction } from '@/components/ui/toast';

interface ClientDashboardProps {
  userMobile: string;
  onLogout: () => void;
}

interface BookingData {
  seatNumber: string;
  name: string;
  mobile: string;
  email: string;
  duration: string;
  status: 'not_applied' | 'pending' | 'approved';
  submittedAt: string;
  paymentStatus: 'pending' | 'approved';
  paidAmount?: number;
  paidOn?: string;
  paymentMethod?: 'cash' | 'online';
  validTill?: string;
  remainingDays?: number;
  startDate?: string;
  planDetails?: string;
  fromTime?: string;
  toTime?: string;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ userMobile, onLogout }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'seat-change' | 'transactions' | 'edit-profile' | 'booking-success' | 'my-booking' | 'extend-booking' | 'all-transactions' | 'notice-board'>('dashboard');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Use real Supabase data
  const { seats, loading: seatsLoading, lockSeat } = useSeats();
  const { createBooking, bookings, rejectBooking, refetch: refetchBookings } = useBookings(); // get rejectBooking
  
  const [waitlistPosition] = useState(0);
  const [hasPendingSeatChange, setHasPendingSeatChange] = useState(false);

  // Reset user booking data since all data is cleared
  const [userBooking, setUserBooking] = useState<BookingData>({
    seatNumber: '',
    name: 'User Name',
    mobile: userMobile,
    email: 'user@email.com',
    duration: '',
    status: 'not_applied',
    submittedAt: '',
    paymentStatus: 'pending',
    paidAmount: 0,
    validTill: '',
    remainingDays: 0,
    startDate: '',
    planDetails: '',
    fromTime: '9:00 AM',
    toTime: '9:00 PM'
  });

  const [bookingFormData, setBookingFormData] = useState({
    name: '',
    email: '',
    duration: '',
    seatId: ''
  });

  // Check if user has active/pending booking
  const hasActiveOrPendingBooking =
    userBooking.status === "approved" ||
    userBooking.status === "pending";

  // Calculate seat statistics using real data
  const totalSeats = seats.length;
  const availableSeats = seats.filter(s => s.status === 'vacant').length;
  const onHoldSeats = seats.filter(s => s.status === 'on_hold').length;

  const [selectedSeatId, setSelectedSeatId] = useState<string>('');
  const [locking, setLocking] = useState(false);

  const handleSeatClick = async (seatId: string) => {
    if (hasActiveOrPendingBooking) {
      toast({
        title: "One Booking Allowed",
        description:
          "You already have an active or pending seat booking. Please contact admin to approve/cancel or cancel your request from 'My Booking' section.",
        variant: "destructive",
        action: (
          <ToastAction altText="Go to My Booking" onClick={() => setCurrentView("my-booking")}>
            Go to My Booking
          </ToastAction>
        ),
      });
      return;
    }

    const seat = seats.find((s) => s.id === seatId);
    if (!seat || seat.status !== "vacant") {
      toast({
        title: "Seat Unavailable",
        description: "This seat is not available for booking.",
        variant: "destructive",
      });
      return;
    }

    setLocking(true);
    const { error } = await lockSeat(seatId);
    setLocking(false);

    if (error) {
      toast({
        title: "Error Locking Seat",
        description: error.message || "Failed to place a lock. Try another seat.",
        variant: "destructive",
      });
      return;
    }

    setSelectedSeatId(seatId);
    setBookingFormData({
      ...bookingFormData,
      seatId: seatId,
    });
  };

  const handleConfirmSeat = () => {
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async () => {
    try {
      if (!bookingFormData.name.trim() || !bookingFormData.email.trim() || !bookingFormData.duration) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      console.log('Submitting booking request:', bookingFormData);
      
      const durationMonths = parseInt(bookingFormData.duration);
      const totalAmount = durationMonths * 2500; // ₹2500 per month

      const { error } = await createBooking(bookingFormData.seatId, durationMonths, totalAmount);
      
      if (error) {
        throw error;
      }
      
      setShowBookingModal(false);
      setCurrentView('booking-success');
      setBookingFormData({ name: '', email: '', duration: '', seatId: '' });
      
      toast({
        title: "Booking Request Submitted",
        description: "Your seat booking request has been submitted successfully. Please wait for admin approval.",
      });
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRequestSeatChange = () => {
    if (hasPendingSeatChange) {
      toast({
        title: "Pending Request",
        description: "You already have a pending seat change request. Please wait for approval or cancel the existing request.",
        variant: "destructive"
      });
      return;
    }
    setCurrentView('seat-change');
  };

  const handleSeatChangeSubmit = (newSeat: string) => {
    setHasPendingSeatChange(true);
    setCurrentView('dashboard');
  };

  const handleExtendBooking = (months: number, amount: number) => {
    setCurrentView('dashboard');
  };

  const handleProfileSave = (profile: { name: string; email: string }) => {
    setUserBooking(prev => ({ ...prev, name: profile.name, email: profile.email }));
    setCurrentView('dashboard');
  };

  // Helper to sync userBooking with current Supabase bookings (simplified: reset status if not found)
  const reloadBookingStatus = async () => {
    await refetchBookings();
    // Find the user's latest booking (pending or approved)
    const myBooking = bookings.find(
      (b) => ['pending', 'approved'].includes(b.status)
    );
    if (!myBooking) {
      // No active or pending booking: reset UI with allowed types
      setUserBooking((prev) => ({
        ...prev,
        status: 'not_applied',
        seatNumber: '',
        planDetails: '',
        submittedAt: '',
        validTill: '',
        remainingDays: 0,
        startDate: '',
        paidAmount: 0,
        paymentStatus: 'pending',
        paidOn: undefined,
        paymentMethod: undefined,
      }));
    } else {
      // Map booking data to our state model, avoid unknown status
      setUserBooking((prev) => ({
        ...prev,
        seatNumber: myBooking.seat?.seat_number || '',
        name: myBooking.profile?.full_name || prev.name,
        email: myBooking.profile?.email || prev.email,
        mobile: myBooking.profile?.mobile || prev.mobile,
        duration: myBooking.duration_months ? `${myBooking.duration_months}` : '',
        status:
          myBooking.status === 'pending'
            ? 'pending'
            : myBooking.status === 'approved'
            ? 'approved'
            : 'not_applied',
        submittedAt: myBooking.requested_at,
        paymentStatus: 'pending', // Not tracked here
        paidAmount: undefined,
        paidOn: undefined,
        paymentMethod: undefined,
        validTill: '',    // No end_date available on BookingRequest
        remainingDays: undefined,
        startDate: '',    // No start_date available on BookingRequest
        planDetails: myBooking.duration_months
          ? `${myBooking.duration_months} Month${myBooking.duration_months > 1 ? 's' : ''}`
          : '',
      }));
    }
  };

  // Cancel active/pending request handler
  const handleCancelRequest = async () => {
    try {
      // Find only the pending booking (waiting for approval)
      const myBooking = bookings.find((b) => b.status === 'pending');
      if (!myBooking) return;
      const { error } = await rejectBooking(myBooking.id);
      if (error) throw error;
      toast({
        title: "Booking Cancelled",
        description: "Your seat booking request has been cancelled.",
      });
      await reloadBookingStatus();
    } catch (error: any) {
      toast({
        title: "Error Cancelling Request",
        description: error.message || "Could not cancel request. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Render different views
  if (currentView === 'seat-change') {
    return (
      <SeatChangeRequest
        currentSeat={userBooking.seatNumber}
        onBack={() => setCurrentView('dashboard')}
        onSubmitChange={handleSeatChangeSubmit}
      />
    );
  }

  if (currentView === 'transactions') {
    return (
      <TransactionHistory
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'all-transactions') {
    return (
      <AllTransactions
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'edit-profile') {
    return (
      <EditProfile
        userProfile={{
          name: userBooking.name,
          email: userBooking.email,
          mobile: userBooking.mobile
        }}
        onBack={() => setCurrentView('dashboard')}
        onSave={handleProfileSave}
      />
    );
  }

  if (currentView === 'booking-success') {
    return (
      <BookingSuccess
        seatNumber={selectedSeat}
        onBackToDashboard={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'my-booking') {
    return (
      <MyBookingDetails
        userBooking={userBooking}
        onBack={() => setCurrentView('dashboard')}
        onViewTransactions={() => setCurrentView('all-transactions')}
        onCancelRequest={handleCancelRequest}
      />
    );
  }

  if (currentView === 'extend-booking') {
    return (
      <ExtendBooking
        currentBooking={userBooking}
        onBack={() => setCurrentView('dashboard')}
        onExtend={handleExtendBooking}
      />
    );
  }

  if (currentView === 'notice-board') {
    return (
      <NoticeBoard
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (seatsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading seats...</div>
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
                  src="/lovable-uploads/84938183-4aaf-4db7-ab36-6b13bd214f25.png" 
                  alt="अध्ययन Library Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">अध्ययन Library</h1>
                <p className="text-slate-400">Welcome back! Mobile: {userMobile}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('notice-board')}
                className="border-slate-600 bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white hover:border-slate-500 shadow-lg shadow-black/50"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notice Board
              </Button>
              <div className="relative">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="border-slate-600 bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white hover:border-slate-500 shadow-lg shadow-black/50"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700/50 z-50">
                    <div className="p-4 border-b border-slate-700/50">
                      <p className="font-semibold text-white">{userBooking.name}</p>
                      <p className="text-sm text-slate-400">{userBooking.email}</p>
                    </div>
                    <div className="p-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-white hover:bg-slate-800/50" 
                        onClick={() => {
                          setCurrentView('edit-profile');
                          setShowUserDropdown(false);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-white hover:bg-slate-800/50" 
                        onClick={() => {
                          setCurrentView('all-transactions');
                          setShowUserDropdown(false);
                        }}
                      >
                        <History className="w-4 h-4 mr-2" />
                        Payment History
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-white hover:bg-slate-800/50"
                        onClick={() => {
                          setCurrentView('my-booking');
                          setShowUserDropdown(false);
                        }}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        My Booking
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-slate-800/50" onClick={onLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Waitlist Info - Show at top if user has waitlist position */}
        {waitlistPosition > 0 && userBooking.status !== 'approved' && (
          <Card className="dashboard-card border-orange-500/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="font-semibold text-white">Waitlist Position</p>
                  <p className="text-sm text-slate-400">You are #{waitlistPosition} in the waitlist for seat allocation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 1: Condensed Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Seats</p>
                <p className="text-2xl font-bold text-white">{totalSeats}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-slate-700/30 to-slate-900/30 rounded-lg flex items-center justify-center border border-slate-600">
                <Users className="w-6 h-6 text-slate-300" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Available</p>
                <p className="text-2xl font-bold text-white">{availableSeats}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-slate-700/30 to-slate-900/30 rounded-lg flex items-center justify-center border border-slate-600">
                <Check className="w-6 h-6 text-slate-300" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">On Hold</p>
                <p className="text-2xl font-bold text-white">{onHoldSeats}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-slate-700/30 to-slate-900/30 rounded-lg flex items-center justify-center border border-slate-600">
                <Clock className="w-6 h-6 text-slate-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Status Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="dashboard-card h-40">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
              <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Current Status</p>
              <Badge 
                variant={
                  userBooking.status === 'approved' ? 'default' : 
                  userBooking.status === 'pending' ? 'secondary' : 'destructive'
                }
                className="mb-2"
              >
                {userBooking.status === 'not_applied' ? 'Not Applied' :
                 userBooking.status === 'pending' ? 'Pending' : 'Active'}
              </Badge>
              {userBooking.status === 'approved' && (
                <div className="text-center">
                  <p className="text-xs text-slate-400">Started: {userBooking.startDate}</p>
                  <p className="text-xs text-cyan-300 font-medium">{userBooking.planDetails}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="dashboard-card h-40">
            <CardContent className="p-4 flex flex-col justify-center text-center h-full">
              <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Allocated Seat</p>
              {userBooking.status === 'approved' && userBooking.seatNumber ? (
                <div>
                  <p className="text-lg font-bold text-white mb-1">{userBooking.seatNumber}</p>
                  <p className="text-xs text-slate-400 mb-2">Valid till: {userBooking.validTill}</p>
                  <Button 
                    size="sm" 
                    onClick={handleRequestSeatChange} 
                    className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
                    disabled={hasPendingSeatChange}
                  >
                    {hasPendingSeatChange ? 'Request Pending' : 'Request Change'}
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-400 mb-2">Not Assigned</p>
                  <MapPin className="w-5 h-5 text-slate-500 mx-auto" />
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="dashboard-card h-40">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
              <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Days Remaining</p>
              <p className="text-2xl font-bold text-white mb-1">
                {userBooking.remainingDays || 0}
              </p>
              {userBooking.status === 'approved' && (
                <Button 
                  size="sm" 
                  onClick={() => setCurrentView('extend-booking')}
                  className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600 mt-2"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Extend
                </Button>
              )}
            </CardContent>
          </Card>
          
          <Card className="dashboard-card h-40">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
              <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Last Payment</p>
              <div className="flex items-center gap-1 mb-1">
                <IndianRupee className="w-4 h-4 text-green-400" />
                <span className="text-lg font-bold text-green-400">{userBooking.paidAmount || 0}</span>
              </div>
              <Badge 
                variant={userBooking.paymentStatus === 'approved' ? 'default' : 'secondary'}
                className="text-xs mb-2"
              >
                {userBooking.paymentStatus === 'approved' ? 'Paid' : 'No payments yet'}
              </Badge>
              <Button 
                size="sm" 
                onClick={() => setCurrentView('all-transactions')}
                className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
              >
                All Transactions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Section 3: My Booking Details - Show message if no transactions */}
        <Card className="dashboard-card">
          <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <CardTitle className="text-xl font-bold text-white flex items-center justify-between">
              My Booking Details
              <Button 
                size="sm" 
                onClick={() => setCurrentView('all-transactions')} 
                className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No booking details yet. Book a seat to get started!</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Live Seat Map */}
        <Card className="dashboard-card">
          <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <CardTitle className="text-xl font-bold text-white">Live Seat Map</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <SeatSelection 
                  seats={seats}
                  selectedSeat={selectedSeatId}
                  onSeatSelect={handleSeatClick}
                  showConfirmButton={false}  // Do not show the button inside SeatSelection
                  onConfirmSelection={handleConfirmSeat}
                  locking={locking}
                />
                {/* Confirm Seat button always appears just below the seat layout */}
                {selectedSeatId && (
                  <div className="rounded-xl bg-slate-800/80 p-6 border border-slate-700/60 shadow-2xl flex flex-col items-center mt-6 w-full max-w-lg mx-auto">
                    <h3 className="text-lg font-bold text-white mb-2">Confirm Your Seat</h3>
                    <div className="text-slate-300 mb-4">
                      You have selected <span className="font-semibold text-cyan-300">Seat {seats.find(s => s.id === selectedSeatId)?.seat_number}</span>.
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold"
                      onClick={handleConfirmSeat}
                      disabled={locking}
                    >
                      {locking ? "Locking Seat..." : "Confirm Seat"}
                    </Button>
                  </div>
                )}
              </div>
              {/* Remove the confirm seat sidebar/column for desktop */}
              {/* <div className="w-full md:w-1/3 mt-4 md:mt-0 flex flex-col items-center">
                ...
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Request Modal with Dark Theme */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-md bg-slate-900 border border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-slate-300">Booking Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="w-full h-32 bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg flex items-center justify-center border border-slate-600">
              <p className="text-slate-300 font-medium">Seat {
                seats.find(s => s.id === selectedSeatId)?.seat_number || ""
              } Image</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-300">Name</label>
              <Input
                value={bookingFormData.name}
                onChange={(e) => setBookingFormData({...bookingFormData, name: e.target.value})}
                placeholder="Enter your full name"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Email</label>
              <Input
                type="email"
                value={bookingFormData.email}
                onChange={(e) => setBookingFormData({...bookingFormData, email: e.target.value})}
                placeholder="Enter your email"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Duration</label>
              <Select value={bookingFormData.duration} onValueChange={(value) => setBookingFormData({...bookingFormData, duration: value})}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()} className="text-white hover:bg-slate-700">
                      {month} Month{month > 1 ? 's' : ''} - ₹{month * 2500}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Selected Seat</label>
              <Input
                value={`Seat ${seats.find(s => s.id === selectedSeatId)?.seat_number || ''}`}
                readOnly
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Mobile (Locked)</label>
              <Input
                value={userMobile}
                readOnly
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleBookingSubmit} 
                className="flex-1 bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
              >
                Confirm Seat & Submit
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowBookingModal(false)} 
                className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboard;
