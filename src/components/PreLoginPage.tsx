
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    // Simulate OTP sending
    setTimeout(() => {
      setShowOtpInput(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = () => {
    setIsLoading(true);
    // Simulate OTP verification and determine user type
    setTimeout(() => {
      // For demo: admin (9999999999), staff (8888888888), others (client)
      let userType: 'client' | 'admin' | 'staff' = 'client';
      if (mobile === '9999999999') userType = 'admin';
      else if (mobile === '8888888888') userType = 'staff';
      
      onLogin(mobile, userType);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">CL</span>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">Civils Lounge</CardTitle>
          <p className="text-gray-600">UPSC Library Management</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="tel"
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="text-center text-lg"
              disabled={showOtpInput}
            />
          </div>
          
          {showOtpInput && (
            <div>
              <Input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="text-center text-lg"
                maxLength={6}
              />
            </div>
          )}
          
          <Button
            onClick={showOtpInput ? handleVerifyOtp : handleSendOtp}
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
            disabled={isLoading || !mobile}
          >
            <Phone className="w-5 h-5 mr-2" />
            {isLoading ? 'Processing...' : showOtpInput ? 'Verify OTP' : 'Login via OTP'}
          </Button>
          
          {showOtpInput && (
            <p className="text-sm text-gray-600 text-center">
              OTP sent to {mobile}. Demo: Use any 6-digit code.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PreLoginPage;
