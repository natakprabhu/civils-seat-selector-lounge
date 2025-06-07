
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
  ChevronDown
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
}

// Updated seat data to match the new layout
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
  const [currentView, setCurrentView] = useState<'dashboard' | 'seat-change' | 'transactions' | 'edit-profile' | 'booking-success'>('dashboard');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [seats] = useState(() => createSeatsData());
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data
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
    remainingDays: 45
  });

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
      // Mock API call
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

  const handleDownloadReceipt = () => {
    toast({
      title: "Receipt Downloaded",
      description: "Receipt has been downloaded successfully.",
    });
  };

  const handleRequestSeatChange = () => {
    setCurrentView('seat-change');
  };

  const handleSeatChangeSubmit = (newSeat: string) => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header with User Dropdown */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/30">
                <span className="text-white font-bold text-lg">CL</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Mobile: {userMobile}</p>
              </div>
            </div>
            <div className="relative">
              <Button 
                variant="outline" 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-50/50"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-card rounded-lg shadow-xl border border-cyan-400/30 shadow-cyan-500/10 z-50">
                  <div className="p-4 border-b border-cyan-400/20">
                    <p className="font-semibold">{userBooking.name}</p>
                    <p className="text-sm text-muted-foreground">{userBooking.email}</p>
                  </div>
                  <div className="p-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start hover:bg-cyan-50/50" 
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
                      className="w-full justify-start hover:bg-cyan-50/50" 
                      onClick={() => {
                        setCurrentView('transactions');
                        setShowUserDropdown(false);
                      }}
                    >
                      <History className="w-4 h-4 mr-2" />
                      Payment History
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-cyan-50/50">
                      <MapPin className="w-4 h-4 mr-2" />
                      My Booking
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-cyan-50/50" onClick={onLogout}>
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

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Section 1: Seat Statistics - More Condensed */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 border border-cyan-400/30 shadow-cyan-500/10">
            <CardContent className="p-4 h-24 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Seats</p>
                <p className="text-2xl font-bold text-foreground">{totalSeats}</p>
              </div>
              <Users className="w-8 h-8 text-cyan-500" />
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 border border-emerald-400/30 shadow-emerald-500/10">
            <CardContent className="p-4 h-24 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-foreground">{availableSeats}</p>
              </div>
              <Check className="w-8 h-8 text-emerald-500" />
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 border border-amber-400/30 shadow-amber-500/10">
            <CardContent className="p-4 h-24 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">On Hold</p>
                <p className="text-2xl font-bold text-foreground">{onHoldSeats}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Status Cards - More Condensed */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 border border-purple-400/30 shadow-purple-500/10">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground mb-2">Current Status</p>
                <Badge 
                  variant={
                    userBooking.status === 'approved' ? 'default' : 
                    userBooking.status === 'pending' ? 'secondary' : 'destructive'
                  }
                  className="mb-2"
                >
                  {userBooking.status === 'not_applied' ? 'Not Applied' :
                   userBooking.status === 'pending' ? 'Pending' : 'Approved'}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 border border-blue-400/30 shadow-blue-500/10">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground mb-2">Allocated Seat</p>
                {userBooking.status === 'approved' ? (
                  <div>
                    <p className="text-lg font-bold text-foreground">{userBooking.seatNumber}</p>
                    <p className="text-xs text-muted-foreground mb-2">Valid till: {userBooking.validTill}</p>
                    <Button size="sm" variant="outline" onClick={handleRequestSeatChange} className="border-blue-400/30">
                      Request Change
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not Assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 border border-rose-400/30 shadow-rose-500/10">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground mb-2">Days Remaining</p>
                <p className="text-2xl font-bold text-foreground">
                  {userBooking.remainingDays || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 border border-indigo-400/30 shadow-indigo-500/10">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground mb-2">Payment History</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setCurrentView('transactions')}
                  className="border-indigo-400/30"
                >
                  <History className="w-4 h-4 mr-1" />
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Booking Details */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 border border-cyan-400/30 shadow-cyan-500/10">
          <CardHeader className="border-b border-cyan-400/20 bg-gradient-to-r from-cyan-50/50 to-blue-50/50">
            <CardTitle className="text-xl font-bold text-foreground flex items-center justify-between">
              Booking Details
              <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)} className="border-cyan-400/30">
                <Edit className="w-4 h-4 mr-1" />
                {isEditing ? 'Save' : 'Edit'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Name</p>
                {isEditing ? (
                  <Input value={userBooking.name} onChange={(e) => setUserBooking({...userBooking, name: e.target.value})} />
                ) : (
                  <p className="font-semibold text-foreground">{userBooking.name}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Contact</p>
                <p className="text-sm text-foreground">{userBooking.mobile}</p>
                <p className="text-xs text-muted-foreground">(Non-editable)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                {isEditing ? (
                  <Input value={userBooking.email} onChange={(e) => setUserBooking({...userBooking, email: e.target.value})} />
                ) : (
                  <p className="text-sm text-foreground">{userBooking.email}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Seat ID</p>
                <p className="font-semibold text-foreground">{userBooking.seatNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="text-sm text-foreground">{userBooking.duration} months</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Info</p>
                <div className="flex items-center gap-1 mb-1">
                  <IndianRupee className="w-3 h-3 text-foreground" />
                  <span className="font-semibold text-foreground">{userBooking.paidAmount}</span>
                </div>
                <Badge variant={userBooking.paymentStatus === 'approved' ? 'default' : 'secondary'}>
                  {userBooking.paymentStatus === 'approved' ? 'Paid' : 'Pending'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Actions</p>
                {userBooking.status === 'approved' && userBooking.paymentStatus === 'approved' && (
                  <Button size="sm" variant="outline" onClick={handleDownloadReceipt}>
                    <Download className="w-3 h-3 mr-1" />
                    Receipt
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Live Seat Map */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 border border-emerald-400/30 shadow-emerald-500/10">
          <CardHeader className="border-b border-emerald-400/20 bg-gradient-to-r from-emerald-50/50 to-green-50/50">
            <CardTitle className="text-xl font-bold text-foreground">Live Seat Map</CardTitle>
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

      {/* Booking Request Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-md border border-cyan-400/30 shadow-cyan-500/20">
          <DialogHeader>
            <DialogTitle className="text-cyan-700">Booking Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Show seat image placeholder */}
            <div className="w-full h-32 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg flex items-center justify-center border border-cyan-400/30">
              <p className="text-cyan-600 font-medium">Seat {bookingFormData.seatId} Image</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                value={bookingFormData.name}
                onChange={(e) => setBookingFormData({...bookingFormData, name: e.target.value})}
                placeholder="Enter your full name"
                className="border-cyan-400/30 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={bookingFormData.email}
                onChange={(e) => setBookingFormData({...bookingFormData, email: e.target.value})}
                placeholder="Enter your email"
                className="border-cyan-400/30 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Duration</label>
              <Select value={bookingFormData.duration} onValueChange={(value) => setBookingFormData({...bookingFormData, duration: value})}>
                <SelectTrigger className="border-cyan-400/30 focus:border-cyan-500">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {month} Month{month > 1 ? 's' : ''} - ₹{month * 2500}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Selected Seat</label>
              <Input
                value={`Seat ${bookingFormData.seatId}`}
                readOnly
                className="bg-muted border-cyan-400/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Mobile (Locked)</label>
              <Input
                value={userMobile}
                readOnly
                className="bg-muted border-cyan-400/30"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBookingSubmit} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                Confirm Seat & Submit
              </Button>
              <Button variant="outline" onClick={() => setShowBookingModal(false)} className="border-cyan-400/30">
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
