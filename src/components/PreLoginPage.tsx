
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

  // Sample credentials
  const sampleCredentials = [
    { mobile: '9999999999', role: 'admin' as const },
    { mobile: '8888888888', role: 'staff' as const },
    { mobile: '7777777777', role: 'client' as const }
  ];

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
      const credentials = sampleCredentials.find(cred => cred.mobile === mobile);
      const userType = credentials ? credentials.role : 'client';
      onLogin(mobile, userType);
      setIsLoading(false);
    }, 1000);
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Mobile Number</label>
              <Input
                type="tel"
                placeholder="Enter Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="h-12 text-lg bg-slate-800 border-slate-600 text-white focus:border-cyan-500 focus:ring-cyan-500"
                disabled={showOtpInput}
              />
            </div>
            
            {showOtpInput && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Enter OTP</label>
                <div className="flex justify-center">
                  <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-12 text-lg bg-slate-800 border-slate-600 text-white font-bold" />
                      <InputOTPSlot index={1} className="w-12 h-12 text-lg bg-slate-800 border-slate-600 text-white font-bold" />
                      <InputOTPSlot index={2} className="w-12 h-12 text-lg bg-slate-800 border-slate-600 text-white font-bold" />
                      <InputOTPSlot index={3} className="w-12 h-12 text-lg bg-slate-800 border-slate-600 text-white font-bold" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
            )}
            
            <Button
              onClick={showOtpInput ? handleVerifyOtp : handleSendOtp}
              className="w-full h-12 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white text-lg font-semibold shadow-lg border border-slate-600"
              disabled={isLoading || !mobile || (showOtpInput && otp.length !== 4)}
            >
              <Phone className="w-5 h-5 mr-2" />
              {isLoading ? 'Processing...' : showOtpInput ? 'Verify OTP' : 'Send OTP'}
            </Button>
            
            {showOtpInput && (
              <p className="text-sm text-slate-400 text-center">
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
