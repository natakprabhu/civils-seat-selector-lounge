import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface BookingFormProps {
  selectedSeat: string;
  onSubmitBooking: (bookingData: any) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ selectedSeat, onSubmitBooking }) => {
  const { userProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: userProfile?.full_name || '',
    mobile: userProfile?.mobile || '',
    email: userProfile?.email || '',
    duration: ''
  });

  // If userProfile changes, update state.
  React.useEffect(() => {
    setFormData({
      name: userProfile?.full_name || '',
      mobile: userProfile?.mobile || '',
      email: userProfile?.email || '',
      duration: ''
    });
    // eslint-disable-next-line
  }, [userProfile, selectedSeat]);

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.duration) {
      newErrors.duration = 'Duration is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onSubmitBooking({
        ...formData,
        seatNumber: selectedSeat,
        status: 'waiting_for_approval',
        submittedAt: new Date().toISOString()
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Complete Your Booking</CardTitle>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg inline-block mt-2">
            Seat {selectedSeat}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full Name *</label>
              <Input
                type="text"
                value={formData.name}
                readOnly
                disabled
                className="h-11 opacity-70 bg-slate-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Mobile Number *</label>
              <Input
                type="tel"
                value={formData.mobile}
                readOnly
                disabled
                className="h-11 opacity-70 bg-slate-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address *</label>
              <Input
                type="email"
                value={formData.email}
                readOnly
                disabled
                className="h-11 opacity-70 bg-slate-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Duration *</label>
              <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                <SelectTrigger className={`h-11`}>
                  <SelectValue placeholder="Select subscription duration" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {month} Month{month > 1 ? 's' : ''} - ₹{month * 2500}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.duration && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.duration}
                </p>
              )}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important Notice:</p>
                  <p>Your booking request will be sent for admin approval. You will be notified once approved.</p>
                  <p className="mt-2">For any queries, contact admin via WhatsApp.</p>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting Request...' : 'Submit Booking Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingForm;
