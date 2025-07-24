import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSeats } from '@/hooks/useSeats';
import { useAuth } from "@/hooks/useAuth";
import { 
  LogOut, User, Clock, Check, IndianRupee,
  History, Edit, MapPin, Users, ChevronDown, Plus,
  AlertCircle, ArrowRight, Bell
} from 'lucide-react';

import SeatSelection from './SeatSelection';
import NoticeBoard from './NoticeBoard';
import MyBookingDetails from './MyBookingDetails';
import EditProfile from './EditProfile';
import AllTransactions from './AllTransactions';
import ExtendBooking from './ExtendBooking';
import SeatChangeRequest from './SeatChangeRequest';
import TransactionHistory from './TransactionHistory';

interface ClientDashboardProps {
  userMobile: string;
  onLogout: () => void;
}

type BookingStatus = 'not_applied' | 'pending' | 'approved';
type PaymentStatus = 'pending' | 'approved';

interface BookingData {
  seatNumber: string;
  name: string;
  mobile: string;
  email: string;
  duration: string;
  status: BookingStatus;
  submittedAt: string;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  validTill: string;
  remainingDays: number;
  startDate: string;
  planDetails: string;
  fromTime: string;
  toTime: string;
}

const DUMMY_BOOKING: BookingData = {
  seatNumber: 'A1',
  name: 'User Name',
  mobile: '9876543210',
  email: 'user@email.com',
  duration: '1 Month',
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
};

import { supabase } from "@/integrations/supabase/client";
import BookingDialog from './BookingDialog';
import { toast } from '@/hooks/use-toast';

const ClientDashboard: React.FC<ClientDashboardProps> = ({ userMobile, onLogout }) => {
  const { user } = useAuth();
  const { seats, loading: seatsLoading } = useSeats();
  const [profile, setProfile] = useState<{ full_name?: string; email?: string; mobile?: string } | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'seat-change' | 'transactions' | 'edit-profile' | 'my-booking' | 'extend-booking' | 'all-transactions' | 'notice-board'>('dashboard');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userBooking, setUserBooking] = useState<BookingData>(DUMMY_BOOKING);
  const [waitlistPosition] = useState(0);
  const [hasPendingSeatChange] = useState(false);

  const [bookings, setBookings] = React.useState<{ seat_id: string, status: "pending" | "approved" | "cancelled", user_id: string, subscription_end_date?: string }[]>([]);
  const [seatHolds, setSeatHolds] = React.useState<{ seat_id: string, expires_at: string, user_id: string }[]>([]);
  const [bookingsLoading, setBookingsLoading] = React.useState(true);
  const [selectedSeat, setSelectedSeat] = React.useState<string | null>(null);
  const [showDialog, setShowDialog] = React.useState(false);
  const [formLoading, setFormLoading] = React.useState(false);

  const userId = user?.id;
  const userEmail = user?.email || userMobile;

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email, mobile')
          .eq('id', user.id)
          .single();
        if (data) {
          setProfile(data);
          console.log("[Profile Fetch] user.id:", user.id);
          console.log("[Profile Fetch] Full profile data:", data);
        } else {
          console.warn("[Profile Fetch] No profile data for user.id:", user.id);
        }
        if (error) {
          console.error("[Profile Fetch] Error:", error);
        }
      } else {
        console.warn("[Profile Fetch] No user.id found, cannot fetch profile");
      }
    };
    fetchProfile();

    const fetchBookingsAndHolds = async () => {
      setBookingsLoading(true);
      
      // Cleanup expired holds and bookings first
      await supabase.rpc('cleanup_expired_holds_and_bookings');
      
      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("seat_bookings")
        .select("seat_id, status, user_id, subscription_end_date")
        .in("status", ["pending", "approved"]);
      
      // Fetch active seat holds
      const { data: holdsData, error: holdsError } = await supabase
        .from("seat_holds")
        .select("seat_id, expires_at, user_id")
        .gt("expires_at", new Date().toISOString());
      
      setBookingsLoading(false);
      
      if (bookingsData) {
        const filtered = bookingsData.filter(
          (b: any) => b.status === "pending" || b.status === "approved"
        ).map(
          (b: any) => ({
            ...b,
            status: b.status as "pending" | "approved" | "cancelled"
          })
        );
        setBookings(filtered);
        console.log("[Fetch Bookings] All bookings:", filtered);
      } else {
        setBookings([]);
      }
      
      if (holdsData) {
        setSeatHolds(holdsData);
        console.log("[Fetch Seat Holds] Active holds:", holdsData);
      } else {
        setSeatHolds([]);
      }
      
      if (bookingsError) {
        console.error("[Fetch Bookings] Error:", bookingsError);
      }
      if (holdsError) {
        console.error("[Fetch Seat Holds] Error:", holdsError);
      }
    };
    fetchBookingsAndHolds();
  }, [user]);

  // Check if user has ANY active booking (pending or approved) in seat_bookings table
  const userActiveBooking = bookings.some(
    (b) => (b.user_id === userId) && (b.status === "pending" || b.status === "approved")
  );

  console.log("[User Active Booking Check] userId:", userId);
  console.log("[User Active Booking Check] userActiveBooking:", userActiveBooking);
  console.log("[User Active Booking Check] User's bookings:", bookings.filter(b => b.user_id === userId));

  const handleSeatSelect = (seat: string) => {
    // Only allow seat selection if user doesn't have ANY active booking
    if (!userActiveBooking) {
      setSelectedSeat(seat);
      setShowDialog(true);
    } else {
      toast({
        title: 'Booking Restriction',
        description: 'You already have an active booking in seat_bookings table. Please wait for it to be processed or contact admin.',
        variant: 'destructive'
      });
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setSelectedSeat(null);
  };

  const handleBookingSubmit = async (details: { name: string; email: string; mobile: string; seatNumber: string; duration: number }) => {
    setFormLoading(true);
    const seat = seats.find(s => s.seat_number === details.seatNumber);
    if (!seat || !user) {
      setFormLoading(false);
      toast({
        title: 'Error',
        description: 'Could not find selected seat in system.',
        variant: 'destructive'
      });
      return;
    }

    console.log("[Booking Submit] user object:", user);
    console.log("[Booking Submit] user.id for insert:", user.id);
    
    // Calculate subscription end date (duration in months from now)
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + details.duration);
    
    console.log("[Booking Submit] Booking payload:", {
      user_id: user.id,
      seat_id: seat.id,
      duration_months: details.duration,
      status: "pending",
      subscription_end_date: subscriptionEndDate.toISOString()
    });

    // Create booking and seat hold in a transaction-like manner
    const { error: bookingError } = await supabase.from("seat_bookings").insert({
      user_id: user.id,
      seat_id: seat.id,
      duration_months: details.duration,
      status: "pending",
      subscription_end_date: subscriptionEndDate.toISOString()
    });

    if (!bookingError) {
      // Create seat hold with 30-minute expiry
      const lockExpiry = new Date();
      lockExpiry.setMinutes(lockExpiry.getMinutes() + 30);
      
      const { error: holdError } = await supabase.from("seat_holds").insert({
        user_id: user.id,
        seat_id: seat.id,
        show_id: 'default',
        expires_at: lockExpiry.toISOString()
      });

      if (holdError) {
        console.error("[Seat Hold] Insert error:", holdError);
      }
    }
    
    setFormLoading(false);
    if (!bookingError) {
      // Refresh bookings and holds to update the seat map
      const { data: newBookings } = await supabase
        .from("seat_bookings")
        .select("seat_id, status, user_id, subscription_end_date")
        .in("status", ["pending", "approved"]);

      const { data: newHolds } = await supabase
        .from("seat_holds")
        .select("seat_id, expires_at, user_id")
        .gt("expires_at", new Date().toISOString());

      if (newBookings) {
        const filtered = newBookings.filter(
          (b: any) => b.status === "pending" || b.status === "approved"
        ).map(
          (b: any) => ({
            ...b,
            status: b.status as "pending" | "approved" | "cancelled"
          })
        );
        setBookings(filtered);
      }
      
      if (newHolds) {
        setSeatHolds(newHolds);
      }
      
      setShowDialog(false);
      setSelectedSeat(null);
      toast({
        title: 'Booking Requested',
        description: 'Your booking has been logged with a 30-minute hold. The seat will appear as pending (yellow) on the map and you cannot make another booking until this is processed by admin.',
        variant: 'default'
      });
    } else {
      toast({
        title: 'Error',
        description: bookingError.message || 'Failed to request booking.',
        variant: 'destructive'
      });
      console.error("[Booking Submit] Insert error:", bookingError);
    }
  };

  // Dummy stats calculation
  const totalSeats = seats.length;
  const onHold = seats.filter(s => s.status === 'on_hold').length;
  const booked = seats.filter(s => s.status === 'booked').length;
  const availableSeats = totalSeats - onHold - booked;

  // Dummy transaction data
  const [userTransactions] = useState([
    {
      id: "1",
      type: 'New Booking' as const,
      seatNumber: 'A1',
      section: 'Main',
      duration: 1,
      totalAmount: 2500,
      status: "pending",
      requestedAt: new Date().toISOString()
    }
  ]);
  const filteredUserTransactions = userTransactions;

  // Render states for different views as before, but all logic is dummy and no booking
  if (currentView === 'seat-change') {
    return (
      <SeatChangeRequest
        currentSeat={userBooking.seatNumber}
        onBack={() => setCurrentView('dashboard')}
        onSubmitChange={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'transactions') {
    return <TransactionHistory onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'all-transactions') {
    return <AllTransactions onBack={() => setCurrentView('dashboard')} />;
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
        onSave={profile => setUserBooking(prev => ({ ...prev, name: profile.name, email: profile.email }))}
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
        onExtend={() => setCurrentView('dashboard')}
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

  if (seatsLoading || bookingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading seats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Header */}
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
                <p className="text-slate-400">{`WELCOME ${(profile?.full_name || 'USER').toUpperCase()}`}</p>
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
        {/* Show restriction message if user has active booking */}
        {userActiveBooking && (
          <Card className="dashboard-card border-orange-500/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="font-semibold text-white">Booking Restriction</p>
                  <p className="text-sm text-slate-400">You have an active booking in seat_bookings table. You cannot make another booking until this one is processed by admin.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 1: Stats Cards */}
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
                <p className="text-2xl font-bold text-white">{onHold}</p>
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
                    onClick={() => setCurrentView('seat-change')} 
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
        {/* Section 3: My Booking Details */}
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
            {filteredUserTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No booking or seat change details yet. Book a seat to get started!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredUserTransactions.map((txn, idx) => (
                  <div key={txn.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mr-2
                        ${txn.type === 'New Booking' ? 'bg-blue-800 text-blue-200' : 'bg-violet-800 text-violet-200'}
                      `}>
                        {txn.type}
                      </span>
                      <span className="text-sm text-white font-medium">
                        {txn.type === "New Booking"
                          ? `Seat ${txn.seatNumber} (${txn.section}) • ${txn.duration} month`
                          : `Change to ${txn.seatNumber} (${txn.section})`}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm">
                      <span className="text-slate-400">
                        {txn.requestedAt ? new Date(txn.requestedAt).toLocaleString() : ""}
                      </span>
                      <Badge
                        variant={
                          txn.status === 'approved' ? 'default'
                          : txn.status === 'pending' ? 'secondary'
                          : 'destructive'
                        }
                      >
                        {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4 text-green-400" />
                        {txn.totalAmount ? txn.totalAmount : 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              bookings={bookings}
        seatHolds={seatHolds.map(hold => ({
          seat_id: hold.seat_id,
          lock_expiry: hold.expires_at,
          user_id: hold.user_id
        }))}
              userActiveBooking={userActiveBooking}
              selectedSeat={selectedSeat}
              onSeatSelect={handleSeatSelect}
              currentUserId={userId}
            />
            <BookingDialog
              open={showDialog}
              onClose={handleDialogClose}
              onSubmit={handleBookingSubmit}
              seatNumber={selectedSeat || ""}
              loading={formLoading}
              name={profile?.full_name || ""}
              email={profile?.email || ""}
              mobile={profile?.mobile || ""}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
