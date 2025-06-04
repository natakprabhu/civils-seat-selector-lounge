import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import SeatSelection from './SeatSelection';
import BookingForm from './BookingForm';
import BookingSuccess from './BookingSuccess';
import ReceiptGenerator from './ReceiptGenerator';
import PaymentHistory from './PaymentHistory';
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
  Fingerprint
} from 'lucide-react';

interface ClientDashboardProps {
  userMobile: string;
  onLogout: () => void;
}

type BookingStep = 'seat-selection' | 'booking-form' | 'booking-success';

interface BookingData {
  seatNumber: string;
  name: string;
  mobile: string;
  email: string;
  duration: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  paymentStatus: 'pending' | 'approved';
  paidAmount?: number;
  paidOn?: string;
  paymentMethod?: 'cash' | 'online';
}

// Mock seat data
const mockSeats = Array.from({ length: 60 }, (_, i) => ({
  id: `seat-${i + 1}`,
  number: `${String.fromCharCode(65 + Math.floor(i / 12))}${(i % 12) + 1}`,
  status: Math.random() > 0.7 ? 'booked' : 'vacant' as 'vacant' | 'booked' | 'waiting_for_approval'
}));

const ClientDashboard: React.FC<ClientDashboardProps> = ({ userMobile, onLogout }) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('seat-selection');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  // Mock user data - in real app this would come from backend
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
    paymentMethod: 'online'
  });

  // Mock biometric status
  const biometricEnrolled = true;

  const handleSeatSelect = (seatId: string) => {
    const seat = mockSeats.find(s => s.id === seatId);
    if (seat) {
      setSelectedSeat(seat.number);
      setCurrentStep('booking-form');
    }
  };

  const handleConfirmSelection = () => {
    setCurrentStep('booking-form');
  };

  const handleBookingSubmit = (bookingData: any) => {
    setUserBooking({
      ...bookingData,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      paymentStatus: 'pending'
    });
    setCurrentStep('booking-success');
    toast({
      title: "Booking Submitted",
      description: "Your seat booking request has been submitted successfully.",
    });
  };

  const handleNewBooking = () => {
    setCurrentStep('seat-selection');
    setSelectedSeat('');
  };

  const handleBackToDashboard = () => {
    setCurrentStep('seat-selection');
  };

  if (showPaymentHistory) {
    return <PaymentHistory onBack={() => setShowPaymentHistory(false)} userMobile={userMobile} />;
  }

  if (showReceipt && userBooking.paymentStatus === 'approved') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="space-y-4">
          <ReceiptGenerator booking={{
            id: '1',
            name: userBooking.name,
            mobile: userBooking.mobile,
            email: userBooking.email,
            seatNumber: userBooking.seatNumber,
            duration: userBooking.duration,
            paidAmount: userBooking.paidAmount || 0,
            paidOn: userBooking.paidOn || ''
          }} />
          <Button onClick={() => setShowReceipt(false)} className="w-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowPaymentHistory(true)}
                className="border-slate-300"
              >
                <History className="w-4 h-4 mr-2" />
                Payment History
              </Button>
              <Button variant="outline" onClick={onLogout} className="border-slate-300">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Status Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Booking Status</p>
                  <Badge 
                    variant={
                      userBooking.status === 'approved' ? 'default' : 
                      userBooking.status === 'rejected' ? 'destructive' : 'secondary'
                    }
                    className="mt-1"
                  >
                    {userBooking.status.charAt(0).toUpperCase() + userBooking.status.slice(1)}
                  </Badge>
                </div>
                <User className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Payment Status</p>
                  <Badge 
                    variant={userBooking.paymentStatus === 'approved' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {userBooking.paymentStatus === 'approved' ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
                <IndianRupee className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Biometric Status</p>
                  <Badge 
                    variant={biometricEnrolled ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {biometricEnrolled ? 'Enrolled' : 'Not Enrolled'}
                  </Badge>
                </div>
                <Fingerprint className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Current Seat</p>
                  {userBooking.status === 'approved' && userBooking.paymentStatus === 'approved' ? (
                    <p className="text-2xl font-bold text-yellow-900">{userBooking.seatNumber}</p>
                  ) : (
                    <p className="text-sm text-yellow-900">Not Assigned</p>
                  )}
                </div>
                <Calendar className="w-10 h-10 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Booking Details */}
        {userBooking && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader className="border-b border-slate-200 bg-slate-50">
              <CardTitle className="text-xl font-bold text-slate-800">Current Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Name</p>
                  <p className="font-semibold text-slate-800">{userBooking.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Contact</p>
                  <p className="text-sm text-slate-800">{userBooking.mobile}</p>
                  <p className="text-xs text-slate-500">{userBooking.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Seat & Duration</p>
                  <p className="font-semibold text-slate-800">
                    {userBooking.status === 'approved' && userBooking.paymentStatus === 'approved' 
                      ? `Seat ${userBooking.seatNumber}` 
                      : 'Pending Assignment'}
                  </p>
                  <p className="text-xs text-slate-500">{userBooking.duration} months</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Payment Details</p>
                  {userBooking.paymentStatus === 'approved' && userBooking.paidAmount ? (
                    <div>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 text-green-600" />
                        <span className="font-semibold text-green-600">{userBooking.paidAmount}</span>
                      </div>
                      <p className="text-xs text-slate-500">Paid on: {userBooking.paidOn}</p>
                      <p className="text-xs text-slate-500 capitalize">{userBooking.paymentMethod}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-yellow-600">Payment Pending</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Actions</p>
                  <div className="flex flex-col gap-2">
                    {userBooking.paymentStatus === 'approved' && userBooking.paidAmount && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setShowReceipt(true)}
                        className="text-xs"
                      >
                        <Receipt className="w-3 h-3 mr-1" />
                        Receipt
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleNewBooking}
                      className="text-xs"
                    >
                      New Booking
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Process */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-200 bg-slate-50">
            <CardTitle className="text-xl font-bold text-slate-800">
              {currentStep === 'seat-selection' && 'Select Your Seat'}
              {currentStep === 'booking-form' && 'Complete Your Booking'}
              {currentStep === 'booking-success' && 'Booking Submitted'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {currentStep === 'seat-selection' && (
              <SeatSelection 
                seats={mockSeats}
                selectedSeat={selectedSeat ? mockSeats.find(s => s.number === selectedSeat)?.id || null : null}
                onSeatSelect={handleSeatSelect}
                onConfirmSelection={handleConfirmSelection}
              />
            )}
            {currentStep === 'booking-form' && (
              <BookingForm
                selectedSeat={selectedSeat}
                onSubmitBooking={handleBookingSubmit}
              />
            )}
            {currentStep === 'booking-success' && (
              <BookingSuccess onBackToDashboard={handleBackToDashboard} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
