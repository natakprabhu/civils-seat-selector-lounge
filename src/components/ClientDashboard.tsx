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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
  const [profile, setProfile] = useState<{ full_name?: string; email?: string; mobile?: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, email, mobile")
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
  const { seats, loading: seatsLoading, refetch: refetchSeats } = useSeats();
  const { bookings, createBooking, refetch: refetchBookings } = useBookings();
  
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

  // Calculate current booking and seat statistics using real-time database data
  const totalSeats = seats.length;

  // On Hold: booking rows where status is 'pending'
  const onHoldBookings = bookings.filter(b => b.status === 'pending');
  const onHold = onHoldBookings.length;

  // Booked: seats that are marked as 'booked' either by seat status or by an approved booking
  const bookedSeatsSet = new Set(
    // Seats from main table that have status "booked"
    seats.filter(s => s.status === 'booked').map(s => s.id)
  );
  bookings.forEach(b => {
    if (b.status === 'approved') {
      bookedSeatsSet.add(b.seat_id);
    }
  });
  const booked = bookedSeatsSet.size;

  // Available: totalSeats - onHold (pending bookings) - booked
  const availableSeats = totalSeats - onHold - booked;

  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [bookingFormDuration, setBookingFormDuration] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  // Only allow booking if the user has NO pending/approved booking
  const hasActiveBooking = bookings.some(
    b =>
      b.user_id === user?.id &&
      (b.status === 'pending' || b.status === 'approved')
  );

  // When a seat is selected, don’t open the modal! Only do so when confirm button is clicked
  const handleSeatSelect = (seatId: string) => {
    setSelectedSeatId(seatId);
  };
  const handleConfirmSelection = () => {
    setShowBookingModal(true);
  };
  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedSeatId(null);
    setBookingFormDuration('');
  };

  // Booking submit
  const handleBookingFormSubmit = async () => {
    if (!selectedSeatId || !bookingFormDuration || !user?.id) return;
    setIsBookingSubmitting(true);
    try {
      const durationMonths = parseInt(bookingFormDuration);

      // Step 2: Create booking
      const seat = seats.find(s => s.id === selectedSeatId);
      if (!seat) throw new Error('Seat not found');
      const totalAmount = durationMonths * seat.monthly_rate;

      const { error: bookingError } = await createBooking(
        selectedSeatId,
        durationMonths,
        totalAmount
      );
      if (bookingError) {
        const errMsg =
          typeof bookingError === 'string'
            ? bookingError
            : bookingError.message
              ? bookingError.message
              : JSON.stringify(bookingError);

        toast({
          title: "Error",
          description: errMsg || "Failed to book seat.",
          variant: "destructive"
        });
        setIsBookingSubmitting(false);
        return;
      }
      setShowBookingModal(false);
      setSelectedSeatId(null);
      setBookingFormDuration('');
      await refetchSeats();
      await refetchBookings();

      toast({
        title: "Booking Request Submitted",
        description: "Your seat booking request has been submitted for approval.",
      });
    } catch (error: any) {
      // Always show error in a human readable way
      const errMsg =
        typeof error === 'string'
          ? error
          : error?.message
            ? error.message
            : JSON.stringify(error);

      toast({
        title: "Error",
        description: errMsg || "Failed to book seat.",
        variant: "destructive"
      });
    }
    setIsBookingSubmitting(false);
  };

  // User cancels their pending booking
  const handleUserCancelBooking = async () => {
    // Find my pending booking
    const myPending = bookings.find(
      b => b.user_id === user?.id && b.status === 'pending'
    );
    if (!myPending) return;

    // Release lock and cancel booking
    await supabase
      .from('seat_bookings')
      .update({ status: 'cancelled' })
      .eq('id', myPending.id);
    await refetchSeats();
    await refetchBookings();

    setShowBookingModal(false);
    setSelectedSeatId(null);
    setBookingFormDuration('');
    toast({
      title: "Booking Request Cancelled",
      description: "Your booking request and seat lock has been cancelled.",
    });
  };

  // Show in My Booking Details if booking was cancelled due to expiry
  const showExpiredMsg = bookings.some(
    b => b.user_id === user?.id && b.status === 'cancelled'
  );

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

  // Find current user's latest booking (pending/approved)
  const myBooking = bookings.find(
    b => b.user_id === user?.id && (b.status === "pending" || b.status === "approved")
  );

  // Set up userBooking object for MyBookingDetails:
  useEffect(() => {
    if (myBooking) {
      setUserBooking({
        seatNumber: "", // Remove: myBooking.seat?.seat_number
        name: profile?.full_name || "User Name",
        mobile: profile?.mobile || userMobile,
        email: profile?.email || "",
        duration: myBooking.duration_months ? `${myBooking.duration_months} Month${myBooking.duration_months > 1 ? "s" : ""}` : "",
        status: myBooking.status as "not_applied" | "pending" | "approved",
        submittedAt: myBooking.requested_at
          ? new Date(myBooking.requested_at).toLocaleString()
          : "",
        paymentStatus: 'pending',
        paidAmount: 0,
        validTill: "",
        remainingDays: 0,
        startDate: "",
        planDetails: "",
        fromTime: "9:00 AM",
        toTime: "9:00 PM"
      });
    }
    // If no booking, clear details
    else {
      setUserBooking({
        seatNumber: "",
        name: profile?.full_name || "User Name",
        mobile: profile?.mobile || userMobile,
        email: profile?.email || "",
        duration: "",
        status: "not_applied",
        submittedAt: "",
        paymentStatus: 'pending',
        paidAmount: 0,
        validTill: "",
        remainingDays: 0,
        startDate: "",
        planDetails: "",
        fromTime: "9:00 AM",
        toTime: "9:00 PM"
      });
    }
  }, [myBooking, profile, userMobile]);

  const [userTransactions, setUserTransactions] = useState<
    Array<{
      id: string;
      type: 'New Booking' | 'Change Request';
      seatNumber?: string;
      section?: string;
      duration?: number;
      totalAmount?: number;
      status: string;
      requestedAt: string;
      description?: string;
    }>
  >([]);

  useEffect(() => {
    const fetchUserTransactions = async () => {
      if (!user?.id) {
        setUserTransactions([]);
        return;
      }

      // Fetch seat bookings for user
      const { data: bookings } = await supabase
        .from('seat_bookings')
        .select(`
          id, seat_id, duration_months, total_amount, status, requested_at, seat:seats(seat_number, section)
        `)
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });

      // Map to transaction format
      const formattedBookings =
        (bookings || []).map(b => ({
          id: b.id,
          type: 'New Booking' as const,
          seatNumber: b.seat?.seat_number,
          section: b.seat?.section,
          duration: b.duration_months,
          totalAmount: b.total_amount,
          status: b.status,
          requestedAt: b.requested_at,
        }));

      // Fetch seat change requests for user
      const { data: changes } = await supabase
        .from('seat_change_requests')
        .select(`
          id, new_seat_id, status, requested_at, reason, fee_amount, new_seat:seats(seat_number, section)
        `)
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });

      // Map to transaction format
      const formattedChanges =
        (changes || []).map(c => ({
          id: c.id,
          type: 'Change Request' as const,
          seatNumber: c.new_seat?.seat_number,
          section: c.new_seat?.section,
          duration: undefined,
          totalAmount: c.fee_amount,
          status: c.status,
          requestedAt: c.requested_at,
          description: c.reason,
        }));

      // Combine and sort by requestedAt descending
      const allTransactions = [...formattedBookings, ...formattedChanges]
        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

      setUserTransactions(allTransactions);
    };

    fetchUserTransactions();
  }, [user?.id]);

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

  // State for confirmation dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [transactionToCancel, setTransactionToCancel] = useState<string | null>(null);

  // Delete transaction logic
  const handleConfirmCancelBooking = async () => {
    if (!transactionToCancel) return;
    try {
      // Update booking by id only: set status to 'cancelled'
      const { error } = await supabase
        .from('seat_bookings')
        .update({ status: 'cancelled' })
        .eq('id', transactionToCancel);

      if (error) throw error;
      setUserTransactions(prev =>
        prev.filter(txn => txn.id !== transactionToCancel)
      );
      toast({
        title: "Booking Cancelled",
        description: "Your booking request has been cancelled.",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking.",
        variant: "destructive"
      });
    } finally {
      setShowCancelDialog(false);
      setTransactionToCancel(null);
      // Optionally refetchBookings();
    }
  };

  // Booking timer mini-component
  const BookingTimer: React.FC<{ requestedAt: string, label?: string }> = ({ requestedAt, label = "min left before fresh booking" }) => {
    const [timeLeft, setTimeLeft] = React.useState<number>(0);

    React.useEffect(() => {
      if (!requestedAt) return;
      const requested = new Date(requestedAt).getTime();
      const expiresAt = requested + 60 * 60 * 1000; // 1 hour after requested
      const tick = () => {
        const now = Date.now();
        setTimeLeft(Math.max(0, Math.floor((expiresAt - now) / 1000)));
      };
      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }, [requestedAt]);

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    if (timeLeft <= 0) return null;
    return (
      <span className="px-3 py-1 bg-yellow-700 text-yellow-100 font-mono text-xs rounded">
        {mins}:{secs.toString().padStart(2, '0')} {label}
      </span>
    );
  };

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

  // New: Helper function to decide if booking is still allowed (< 30min)
  function isTransactionWithinThirtyMinutes(requestedAt: string) {
    if (!requestedAt) return false;
    const requestedMs = new Date(requestedAt).getTime();
    const nowMs = Date.now();
    return nowMs - requestedMs <= 30 * 60 * 1000; // 30 min in ms
  }

  const filteredUserTransactions = userTransactions.filter(
    txn =>
      (!txn.requestedAt || isTransactionWithinThirtyMinutes(txn.requestedAt)) ||
      txn.status !== "pending"
  );

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
                <p
                  data-lov-id="src/components/ClientDashboard.tsx:312:16"
                  data-lov-name="p"
                  data-component-path="src/components/ClientDashboard.tsx"
                  data-component-line="312"
                  data-component-file="ClientDashboard.tsx"
                  data-component-name="p"
                  data-component-content='{"text":"Welcome back ! Mobile:","className":"text-slate-400"}'
                  className="text-slate-400"
                >
                  {`WELCOME ${(profile?.full_name || 'USER').toUpperCase()}`}
                </p>
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

        {/* Section 3: My Booking Details - Now shows booking & seat change transactions */}
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
                <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No booking or seat change details yet. Book a seat to get started!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredUserTransactions.map((txn, idx) => {
                  const showTimer = txn.status === "pending" && txn.requestedAt;

                  return (
                    <div key={txn.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mr-2
                          ${txn.type === 'New Booking' ? 'bg-blue-800 text-blue-200' : 'bg-violet-800 text-violet-200'}
                        `}>
                          {txn.type}
                        </span>
                        <span className="text-sm text-white font-medium">
                          {txn.type === "New Booking" ? (
                            <>
                              {txn.seatNumber ? `Seat ${txn.seatNumber}` : 'No seat'}{txn.section ? ` (${txn.section})` : ''} •{" "}
                              {txn.duration ? `${txn.duration} month${txn.duration > 1 ? 's' : ''}` : ''}
                            </>
                          ) : (
                            <>
                              Change to {txn.seatNumber ? `Seat ${txn.seatNumber}` : 'new seat'}{txn.section ? ` (${txn.section})` : ''} 
                              {txn.description ? <> • <span className="italic">{txn.description}</span></> : null}
                            </>
                          )}
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
                        {/* Countdown Timer for pending bookings */}
                        {showTimer && (
                          <BookingTimer requestedAt={txn.requestedAt} />
                        )}
                        {/* Cancel Booking Button for pending bookings in time */}
                        {txn.type === "New Booking" && txn.status === "pending" && showTimer && (
                          <AlertDialog open={showCancelDialog && transactionToCancel === txn.id} onOpenChange={(open) => {
                            setShowCancelDialog(open);
                            if (!open) setTransactionToCancel(null);
                          }}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="ml-2"
                                onClick={() => {
                                  setTransactionToCancel(txn.id);
                                  setShowCancelDialog(true);
                                }}
                              >
                                Cancel Booking
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. Do you want to cancel this booking?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Close</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={handleConfirmCancelBooking}
                                >
                                  Yes, Cancel
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  )
                })}
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
              selectedSeat={selectedSeatId}
              onSeatSelect={handleSeatSelect}
              onConfirmSelection={handleConfirmSelection}
              bookingInProgress={hasActiveBooking}
              bookings={bookings}
              userId={user?.id}
            />
            {hasActiveBooking && (
              <p className="mt-4 text-yellow-300 text-sm">
                You already have a pending or approved booking. You cannot book another seat until your existing request is processed.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Form Modal */}
      <Dialog open={showBookingModal} onOpenChange={handleCloseBookingModal}>
        <DialogContent className="max-w-md bg-slate-900 border border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-slate-300">Booking Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Locked for 1hr message */}
            <div className="w-full h-16 bg-gradient-to-br from-amber-700 to-yellow-800 rounded-lg flex items-center justify-center border border-amber-400 text-yellow-200 shadow">
              <span>Your selected seat will be locked for 1 hour.</span>
            </div>
            {/* Profile Details auto-filled */}
            <div>
              <label className="text-sm font-medium text-slate-300">Full Name</label>
              <input
                value={profile?.full_name || ''}
                className="bg-slate-700 border-slate-600 text-white w-full px-3 py-2 rounded"
                readOnly
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Email</label>
              <input
                value={profile?.email || ''}
                className="bg-slate-700 border-slate-600 text-white w-full px-3 py-2 rounded"
                readOnly
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Mobile</label>
              <input
                value={profile?.mobile || ''}
                className="bg-slate-700 border-slate-600 text-white w-full px-3 py-2 rounded"
                readOnly
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Duration</label>
              <select
                value={bookingFormDuration}
                onChange={e => setBookingFormDuration(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white w-full px-3 py-2 rounded"
              >
                <option value="">Select duration</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{month} Month{month > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleBookingFormSubmit}
                className="flex-1 bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white border border-slate-600"
                disabled={isBookingSubmitting || !bookingFormDuration}
              >
                {isBookingSubmitting ? 'Submitting...' : 'Confirm & Submit'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCloseBookingModal}
                className="bg-gradient-to-b from-slate-700 to-slate-900 text-white border border-slate-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Show expired/cancelled info in dashboard or modal */}
      {showExpiredMsg && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-10 z-40 bg-yellow-900 text-yellow-200 px-4 py-3 rounded-lg shadow-lg border border-yellow-500">
          Your previous booking was automatically cancelled due to timeout or admin rejection.
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
