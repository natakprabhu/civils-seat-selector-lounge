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
  Activity,
  TrendingUp,
  Shield,
  ArrowRight,
  Plus,
  AlertCircle
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

const createSeatsData = () => {
  const seats = [];
  
  // Left section seats
  const leftSeats = [
    'A1', 'A2',
    'B1', 'B2', 'B3', 'B4',
    'C1', 'C2', 'C3', 'C4',
    'D1', 'D2', 'D3', 'D4',
    'E1', 'E2', 'E3', 'E4',
    'F1', 'F2', 'F3', 'F4'
  ];
  
  // Right section seats
  const rightSeats = [
    'A5', 'A6', 'A7',
    'B5', 'B6', 'B7',
    'C5', 'C6', 'C7',
    'D5', 'D6', 'D7',
    'E5', 'E6', 'E7',
    'F5', 'F6', 'F7',
    'G5', 'G6', 'G7',
    'H5', 'H6', 'H7',
    'I5', 'I6', 'I7',
    'J5', 'J6', 'J7'
  ];
  
  const allSeatNumbers = [...leftSeats, ...rightSeats];
  
  // Create seat objects with some randomly booked seats
  const bookedSeats = ['B2', 'C3', 'D7', 'F1', 'H6'];
  const waitingSeats = ['A1', 'E5'];
  
  allSeatNumbers.forEach((seatNumber, index) => {
    let status: 'vacant' | 'booked' | 'waiting_for_approval' = 'vacant';
    if (bookedSeats.includes(seatNumber)) status = 'booked';
    if (waitingSeats.includes(seatNumber)) status = 'waiting_for_approval';
    
    seats.push({
      id: `seat-${seatNumber}`,
      number: seatNumber,
      status
    });
  });
  
  return seats;
};

const ClientDashboard: React.FC<ClientDashboardProps> = ({ userMobile, onLogout }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'seat-change' | 'transactions' | 'edit-profile' | 'booking-success' | 'my-booking' | 'extend-booking' | 'all-transactions'>('dashboard');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [seats] = useState(() => createSeatsData());
  const [waitlistPosition] = useState(3); // Mock waitlist position
  const [hasPendingSeatChange, setHasPendingSeatChange] = useState(false);

  // Mock user data with enhanced booking details
  const [userBooking, setUserBooking] = useState<BookingData>({
    seatNumber: 'A5',
    name: 'Rahul Sharma',
    mobile: userMobile,
    email: 'rahul@email.com',
    duration: '6',
    status: 'approved',
    submittedAt: '2024-01-15T10:30:00Z',
    paymentStatus: 'approved',
    paidAmount: 15000,
    paidOn: '2024-01-16',
    paymentMethod: 'online',
    validTill: '2024-07-16',
    remainingDays: 45,
    startDate: '2024-01-16',
    planDetails: '6 Month Plan',
    fromTime: '9:00 AM',
    toTime: '9:00 PM'
  });

  // Mock last transaction only
  const lastTransaction = {
    id: 1,
    date: '2024-01-16',
    type: 'Seat Booking',
    amount: 15000,
    status: userBooking.paymentStatus === 'approved' ? 'Paid' : 'Waiting for confirmation',
    description: 'Seat A5 - 6 months'
  };

  const [bookingFormData, setBookingFormData] = useState({
    name: '',
    email: '',
    duration: '',
    seatId: ''
  });

  // Calculate seat statistics
  const totalSeats = seats.length;
  const availableSeats = seats.filter(s => s.status === 'vacant').length;
  const onHoldSeats = seats.filter(s => s.status === 'waiting_for_approval').length;

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (seat && seat.status === 'vacant') {
      setSelectedSeat(seat.number);
      setBookingFormData({
        ...bookingFormData,
        seatId: seat.number
      });
      setShowBookingModal(true);
    }
  };

  const handleBookingSubmit = async () => {
    try {
      console.log('Submitting booking request:', bookingFormData);
      
      setShowBookingModal(false);
      setCurrentView('booking-success');
      setBookingFormData({ name: '', email: '', duration: '', seatId: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
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
                <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
                <p className="text-slate-400">Welcome back! Mobile: {userMobile}</p>
              </div>
            </div>
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

        {/* Section 2: Status Cards - Enhanced with start date and plan details */}
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
              <Activity className="w-5 h-5 text-slate-500 mt-2" />
            </CardContent>
          </Card>
          
          <Card className="dashboard-card h-40">
            <CardContent className="p-4 flex flex-col justify-center text-center h-full">
              <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Allocated Seat</p>
              {userBooking.status === 'approved' ? (
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
              <TrendingUp className="w-5 h-5 text-slate-500 mt-1" />
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
                {userBooking.paymentStatus === 'approved' ? 'Paid' : 'Waiting for confirmation'}
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

        {/* Section 3: My Booking Details - Last transaction only with View All button */}
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
            <div className="p-4 bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-lg border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center border border-slate-600">
                    <Receipt className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{lastTransaction.type}</p>
                    <p className="text-sm text-slate-400">{lastTransaction.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <IndianRupee className="w-3 h-3 text-white" />
                    <span className="font-semibold text-white">{lastTransaction.amount}</span>
                  </div>
                  <Badge 
                    variant={lastTransaction.status === 'Paid' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {lastTransaction.status}
                  </Badge>
                </div>
              </div>
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
              selectedSeat={selectedSeat ? seats.find(s => s.number === selectedSeat)?.id || null : null}
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
            {/* Show seat image placeholder */}
            <div className="w-full h-32 bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg flex items-center justify-center border border-slate-600">
              <p className="text-slate-300 font-medium">Seat {bookingFormData.seatId} Image</p>
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
                value={`Seat ${bookingFormData.seatId}`}
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
