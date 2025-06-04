
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Phone } from 'lucide-react';

interface PreLoginPageProps {
  onLogin: (mobile: string, userType: 'client' | 'admin' | 'staff') => void;
}

const PreLoginPage: React.FC<PreLoginPageProps> = ({ onLogin }) => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = () => {
    setIsLoading(true);
    setTimeout(() => {
      setShowOtpInput(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = () => {
    setIsLoading(true);
    setTimeout(() => {
      let userType: 'client' | 'admin' | 'staff' = 'client';
      if (mobile === '9873579556') userType = 'admin';
      else if (mobile === '8888888888') userType = 'staff';
      
      onLogin(mobile, userType);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white font-bold text-2xl">CL</span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
              Civils Lounge
            </CardTitle>
            <p className="text-slate-600 text-lg mt-2">UPSC Library Management</p>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Mobile Number</label>
              <Input
                type="tel"
                placeholder="Enter Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="h-12 text-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={showOtpInput}
              />
            </div>
            
            {showOtpInput && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Enter OTP</label>
                <div className="flex justify-center">
                  <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                      <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                      <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                      <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
            )}
            
            <Button
              onClick={showOtpInput ? handleVerifyOtp : handleSendOtp}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-lg font-semibold shadow-lg"
              disabled={isLoading || !mobile || (showOtpInput && otp.length !== 4)}
            >
              <Phone className="w-5 h-5 mr-2" />
              {isLoading ? 'Processing...' : showOtpInput ? 'Verify OTP' : 'Send OTP'}
            </Button>
            
            {showOtpInput && (
              <p className="text-sm text-slate-600 text-center">
                OTP sent to {mobile}. Demo: Use any 4-digit code.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreLoginPage;
