import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';
import { Phone } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";

const AuthPage: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const { sendOtp, verifyOtp, loading } = useAuth();

  const validateMobileNumber = (number: string) => {
    // Remove spaces/special chars
    const cleanNumber = number.replace(/\D/g, '');
    return cleanNumber.length === 10;
  };

  const handleSendOtp = async () => {
    if (!mobile) {
      toast({ title: "Error", description: "Please enter a mobile number", variant: "destructive" });
      return;
    }

    if (!validateMobileNumber(mobile)) {
      toast({ title: "Invalid Mobile Number", description: "Please enter a valid 10-digit mobile number", variant: "destructive" });
      return;
    }

    const result = await sendOtp(mobile);
    if (result.error) {
      toast({ title: "Send OTP Failed", description: result.error, variant: "destructive" });
      return;
    }

    setShowOtpInput(true);
    toast({ title: "OTP Sent", description: `OTP sent to ${mobile}` });
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 4 && otp.length !== 6) {
      toast({ title: "Error", description: "Please enter a valid OTP", variant: "destructive" });
      return;
    }

    const result = await verifyOtp(mobile, otp);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      return;
    }
    toast({ title: "Success", description: `Welcome! You're logged in.` });
    setOtp("");
    setShowOtpInput(false);
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setMobile(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-slate-600">
              <img 
                src="/lovable-uploads/84938183-4aaf-4db7-ab36-6b13bd214f25.png" 
                alt="अध्ययन Library Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              अध्ययन Library
            </CardTitle>
            <p className="text-slate-400 text-lg mt-2">UPSC Library Management</p>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={e => e.preventDefault()} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit Mobile Number"
                    value={mobile}
                    onChange={handleMobileChange}
                    className="pl-10 h-12 text-lg bg-slate-800 border-slate-600 text-white focus:border-cyan-500 focus:ring-cyan-500"
                    disabled={showOtpInput}
                    maxLength={10}
                  />
                </div>
                {mobile && !validateMobileNumber(mobile) && (
                  <p className="text-sm text-red-400">Please enter a valid 10-digit mobile number</p>
                )}
              </div>
              
              {showOtpInput && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Enter OTP</label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="w-12 h-12 text-lg bg-slate-800 border-slate-600 text-white font-bold" />
                        <InputOTPSlot index={1} className="w-12 h-12 text-lg bg-slate-800 border-slate-600 text-white font-bold" />
                        <InputOTPSlot index={2} className="w-12 h-12 text-lg bg-slate-800 border-slate-600 text-white font-bold" />
                        <InputOTPSlot index={3} className="w-12 h-12 text-lg bg-slate-800 border-slate-600 text-white font-bold" />
                        <InputOTPSlot index={4} className="w-12 h-12 text-lg bg-slate-800 border-slate-600 text-white font-bold" />
                        <InputOTPSlot index={5} className="w-12 h-12 text-lg bg-slate-800 border-slate-600 text-white font-bold" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
              )}
              
              <Button
                type="button"
                onClick={showOtpInput ? handleVerifyOtp : handleSendOtp}
                className="w-full h-12 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white text-lg font-semibold shadow-lg border border-slate-600"
                disabled={loading || !mobile || !validateMobileNumber(mobile) || (showOtpInput && (otp.length !== 4 && otp.length !== 6))}
              >
                <Phone className="w-5 h-5 mr-2" />
                {loading ? 'Processing...' : showOtpInput ? 'Verify OTP' : 'Send OTP'}
              </Button>
              
              {showOtpInput && (
                <p className="text-sm text-slate-400 text-center">
                  OTP sent to {mobile}. Enter the code you received.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
