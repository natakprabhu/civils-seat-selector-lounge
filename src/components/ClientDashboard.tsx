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

// All booking/seat change logic removed, UI only. Dummy data everywhere.

interface ClientDashboardProps {
  userMobile: string;
  onLogout: () => void;
}

// Step 1: Add the right types
type BookingStatus = 'not_applied' | 'pending' | 'approved';
type PaymentStatus = 'pending' | 'approved';

// If you have a BookingData interface elsewhere, adjust it similarly
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

// Step 2: Ensure dummy booking uses the correct types
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

const ClientDashboard: React.FC<ClientDashboardProps> = ({ userMobile, onLogout }) => {
  const { user } = useAuth();
  const { seats, loading: seatsLoading } = useSeats();
  const [profile] = useState<{ full_name?: string; email?: string; mobile?: string } | null>({ full_name: 'User Name', email: 'user@email.com', mobile: '9876543210' });
  const [currentView, setCurrentView] = useState<'dashboard' | 'seat-change' | 'transactions' | 'edit-profile' | 'my-booking' | 'extend-booking' | 'all-transactions' | 'notice-board'>('dashboard');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userBooking, setUserBooking] = useState<BookingData>(DUMMY_BOOKING);
  const [waitlistPosition] = useState(0);
  const [hasPendingSeatChange] = useState(false);

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

  if (seatsLoading) {
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
        {/* Waitlist */}
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
            <SeatSelection seats={seats} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
