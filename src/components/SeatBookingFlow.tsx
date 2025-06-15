import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, IndianRupee, Calendar, CheckCircle } from 'lucide-react';
import BookingForm from './BookingForm';
import { useBookings } from '@/hooks/useBookings';
import { toast } from '@/hooks/use-toast';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface SeatBookingFlowProps {
  selectedSeat: any;
  onBack: () => void;
  onBookingComplete: () => void;
}

const SeatBookingFlow: React.FC<SeatBookingFlowProps> = ({
  selectedSeat,
  onBack,
  onBookingComplete
}) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string, email: string, mobile: string } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email, mobile")
          .eq("id", user.id)
          .maybeSingle();
        if (!error && data) {
          setProfile(data);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const { createBooking } = useBookings();

  const handleConfirmSelection = () => setShowBookingForm(true);

  const handleSubmitBooking = async (bookingData: any) => {
    const { error } = await createBooking(selectedSeat.id, selectedSeat.id);
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking request.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Booking Request Submitted",
        description: "Your booking request has been submitted for admin approval.",
      });
      onBookingComplete();
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading your profile...
      </div>
    );
  }

  if (showBookingForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={() => setShowBookingForm(false)}
              className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Seat Details
            </Button>
          </div>
          {/* User Details (read-only) */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">Your Details</h3>
            <div className="mb-2">
              <label className="block text-slate-400 text-sm">Full Name</label>
              <input className="bg-slate-900 border-none w-full text-white rounded px-3 py-2 mt-1" value={profile.full_name} disabled />
            </div>
            <div className="mb-2">
              <label className="block text-slate-400 text-sm">Email</label>
              <input className="bg-slate-900 border-none w-full text-white rounded px-3 py-2 mt-1 lowercase" value={profile.email} disabled />
            </div>
            <div>
              <label className="block text-slate-400 text-sm">Mobile</label>
              <input className="bg-slate-900 border-none w-full text-white rounded px-3 py-2 mt-1" value={profile.mobile} disabled />
            </div>
          </div>
          <BookingForm 
            selectedSeat={selectedSeat.seat_number}
            onSubmitBooking={handleSubmitBooking}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={onBack}
            className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Seat Selection
          </Button>
        </div>

        <Card className="dashboard-card">
          <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Seat Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg inline-block mb-4">
                <span className="font-bold text-lg">Seat {selectedSeat.seat_number}</span>
              </div>
              <Badge variant="default" className="bg-green-500">
                Available
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                <span className="text-slate-300">Section</span>
                <span className="text-white font-semibold">{selectedSeat.section}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                <span className="text-slate-300">Row</span>
                <span className="text-white font-semibold">{selectedSeat.row_number}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                <span className="text-slate-300">Monthly Rate</span>
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-semibold">{selectedSeat.monthly_rate}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Booking Process:</p>
                  <p>After confirming, you'll fill out your details and your request will be sent for admin approval.</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleConfirmSelection}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold shadow-lg"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirm Seat Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeatBookingFlow;
