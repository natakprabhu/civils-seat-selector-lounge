
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, IndianRupee, Clock } from 'lucide-react';

interface ExtendBookingProps {
  currentBooking: {
    seatNumber: string;
    validTill: string;
    paidAmount: number;
  };
  onBack: () => void;
  onExtend: (months: number, amount: number) => void;
}

const ExtendBooking: React.FC<ExtendBookingProps> = ({ 
  currentBooking, 
  onBack, 
  onExtend 
}) => {
  const [selectedMonths, setSelectedMonths] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthlyRate = 2500;
  const calculateAmount = (months: number) => months * monthlyRate;

  const handleExtend = async () => {
    if (!selectedMonths) {
      toast({
        title: "Error",
        description: "Please select extension duration",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const months = parseInt(selectedMonths);
      const amount = calculateAmount(months);
      
      setTimeout(() => {
        onExtend(months, amount);
        toast({
          title: "Extension Request Submitted",
          description: `Your booking extension request for ${months} month${months > 1 ? 's' : ''} has been submitted.`,
        });
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit extension request.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            onClick={onBack}
            className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-white">Extend Booking</h1>
        </div>

        <div className="space-y-6">
          {/* Current Booking Info */}
          <Card className="dashboard-card">
            <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Current Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Seat Number</p>
                  <p className="text-xl font-bold text-white">{currentBooking.seatNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Current End Date</p>
                  <p className="text-lg text-white">{currentBooking.validTill}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Last Payment</p>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4 text-green-400" />
                    <span className="text-lg font-bold text-green-400">{currentBooking.paidAmount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extension Options */}
          <Card className="dashboard-card">
            <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
              <CardTitle className="text-xl font-bold text-white">Select Extension Duration</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-3 block">Extension Duration</label>
                  <Select value={selectedMonths} onValueChange={setSelectedMonths}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Select extension duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <SelectItem key={month} value={month.toString()} className="text-white hover:bg-slate-700">
                          {month} Month{month > 1 ? 's' : ''} - ₹{calculateAmount(month)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedMonths && (
                  <div className="p-4 bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-lg border border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">Extension Summary</p>
                        <p className="text-sm text-slate-400">
                          Extend by {selectedMonths} month{parseInt(selectedMonths) > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-5 h-5 text-green-400" />
                          <span className="text-xl font-bold text-green-400">
                            {calculateAmount(parseInt(selectedMonths))}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">Total Amount</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleExtend}
                  disabled={isSubmitting || !selectedMonths}
                  className="w-full bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Submitting Extension Request...' : 'Submit Extension Request'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExtendBooking;
