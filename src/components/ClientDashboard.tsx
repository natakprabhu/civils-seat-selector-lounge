import React, { useState, useEffect } from 'react';
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();
        setProfile(data || null);
      }
    };
    fetchProfile();
  }, [user]);

  const [currentView, setCurrentView] = useState<'dashboard' | 'seat-change' | 'transactions' | 'edit-profile' | 'booking-success' | 'my-booking' | 'extend-booking' | 'all-transactions' | 'notice-board'>('dashboard');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Use real Supabase data
  const { seats, loading: seatsLoading } = useSeats();
  const { createBooking } = useBookings();
  
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

  // Calculate seat statistics using real data
  const totalSeats = seats.length;
  const availableSeats = seats.filter(s => s.status === 'vacant').length;
  const onHoldSeats = seats.filter(s => s.status === 'on_hold').length;

  const handleSeatClick = (seatId: string) => {
    console.log('Seat clicked:', seatId);
    const seat = seats.find(s => s.id === seatId);
    if (seat && seat.status === 'vacant') {
      setSelectedSeat(seat.seat_number);
      setBookingFormData({
        ...bookingFormData,
        seatId: seat.id
      });
      setShowBookingModal(true);
    } else {
      console.log('Seat not available or not found:', seat);
    }
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
                <p className="text-slate-400">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}! Mobile: {userMobile}</p>
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
            <SeatSelection 
              seats={seats}
              selectedSeat={selectedSeat ? seats.find(s => s.seat_number === selectedSeat)?.id || null : null}
              onSeatSelect={handleSeatClick}
              onConfirmSelection={() => {}}
            />
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
              <p className="text-slate-300 font-medium">Seat {selectedSeat} Image</p>
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
                value={`Seat ${selectedSeat}`}
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
