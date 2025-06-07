
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import SeatSelection from './SeatSelection';
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
  Fingerprint,
  Edit,
  Download,
  MapPin,
  Users,
  Timer,
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
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
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
      
      toast({
        title: "Request Submitted",
        description: "You will receive a payment link shortly. Contact: +91-9876543210",
      });
      
      setShowBookingModal(false);
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
    // Mock receipt download
    toast({
      title: "Receipt Downloaded",
      description: "Receipt has been downloaded successfully.",
    });
  };

  const handleRequestSeatChange = () => {
    toast({
      title: "Change Request Submitted",
      description: "Your seat change request has been submitted for admin approval.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with User Dropdown */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">CL</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Student Dashboard</h1>
                <p className="text-slate-600">Welcome back! Mobile: {userMobile}</p>
              </div>
            </div>
            <div className="relative">
              <Button 
                variant="outline" 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="border-slate-300"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                  <div className="p-4 border-b border-slate-200">
                    <p className="font-semibold">{userBooking.name}</p>
                    <p className="text-sm text-slate-600">{userBooking.email}</p>
                  </div>
                  <div className="p-2">
                    <Button variant="ghost" className="w-full justify-start">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setShowPaymentHistory(true)}>
                      <History className="w-4 h-4 mr-2" />
                      Payment History
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <MapPin className="w-4 h-4 mr-2" />
                      My Booking
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={onLogout}>
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
        {/* Section 1: Seat Statistics */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Seats</p>
                  <p className="text-3xl font-bold text-blue-900">{totalSeats}</p>
                </div>
                <Users className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Available</p>
                  <p className="text-3xl font-bold text-green-900">{availableSeats}</p>
                </div>
                <Check className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">On Hold</p>
                  <p className="text-3xl font-bold text-yellow-900">{onHoldSeats}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Status Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 mb-2">Current Status</p>
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
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 mb-2">Allocated Seat</p>
                {userBooking.status === 'approved' ? (
                  <div>
                    <p className="text-lg font-bold text-slate-800">{userBooking.seatNumber}</p>
                    <p className="text-xs text-slate-500 mb-2">Valid till: {userBooking.validTill}</p>
                    <Button size="sm" variant="outline" onClick={handleRequestSeatChange}>
                      Request Change
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Not Assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 mb-2">Days Remaining</p>
                <p className="text-2xl font-bold text-slate-800">
                  {userBooking.remainingDays || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 mb-2">Payment History</p>
                <Button size="sm" variant="outline" onClick={() => setShowPaymentHistory(true)}>
                  <History className="w-4 h-4 mr-1" />
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Booking Details */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-200 bg-slate-50">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center justify-between">
              Booking Details
              <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="w-4 h-4 mr-1" />
                {isEditing ? 'Save' : 'Edit'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Name</p>
                {isEditing ? (
                  <Input value={userBooking.name} onChange={(e) => setUserBooking({...userBooking, name: e.target.value})} />
                ) : (
                  <p className="font-semibold text-slate-800">{userBooking.name}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Contact</p>
                <p className="text-sm text-slate-800">{userBooking.mobile}</p>
                <p className="text-xs text-slate-500">(Non-editable)</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Email</p>
                {isEditing ? (
                  <Input value={userBooking.email} onChange={(e) => setUserBooking({...userBooking, email: e.target.value})} />
                ) : (
                  <p className="text-sm text-slate-800">{userBooking.email}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Seat ID</p>
                <p className="font-semibold text-slate-800">{userBooking.seatNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Duration</p>
                <p className="text-sm text-slate-800">{userBooking.duration} months</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Payment Info</p>
                <div className="flex items-center gap-1 mb-1">
                  <IndianRupee className="w-3 h-3 text-green-600" />
                  <span className="font-semibold text-green-600">{userBooking.paidAmount}</span>
                </div>
                <Badge variant={userBooking.paymentStatus === 'approved' ? 'default' : 'secondary'}>
                  {userBooking.paymentStatus === 'approved' ? 'Paid' : 'Pending'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Actions</p>
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
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-200 bg-slate-50">
            <CardTitle className="text-xl font-bold text-slate-800">Live Seat Map</CardTitle>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <Input
                value={bookingFormData.name}
                onChange={(e) => setBookingFormData({...bookingFormData, name: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                value={bookingFormData.email}
                onChange={(e) => setBookingFormData({...bookingFormData, email: e.target.value})}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Duration (months)</label>
              <Input
                type="number"
                value={bookingFormData.duration}
                onChange={(e) => setBookingFormData({...bookingFormData, duration: e.target.value})}
                placeholder="Enter duration in months"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Seat ID</label>
              <Input
                value={bookingFormData.seatId}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Mobile (Locked)</label>
              <Input
                value={userMobile}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBookingSubmit} className="flex-1">
                Submit Request
              </Button>
              <Button variant="outline" onClick={() => setShowBookingModal(false)}>
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
