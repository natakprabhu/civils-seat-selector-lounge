import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility to check if input is a plausible email.
 */
function isEmail(str: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}
/**
 * Utility to check if input is a plausible E.164 phone (starts with +, 10-15 digits)
 */
function isE164Phone(str: string) {
  return /^\+[1-9]\d{9,14}$/.test(str);
}

/**
 * Unified auth page with both flows
 */
const UnifiedAuthPage: React.FC = () => {
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false); // SMS OTP step
  const [otp, setOtp] = useState("");

  // Tracks if this is login or register per channel
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);

  // Helper error storage
  const [formError, setFormError] = useState<string | null>(null);

  // Remove doesEmailExist/doesPhoneExist; Basic Email Flow:
  const handleContinueWithEmail = async () => {
    setFormError(null);
    if (!isEmail(email)) {
      setFormError("Please enter a valid Email.");
      return;
    }
    if (!(password && password.length >= 6)) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);

    try {
      // Try login first (signInWithPassword)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInData.user) {
        toast({ title: "Login successful", description: "Welcome back!" });
        setLoading(false);
        return;
      }

      if (signInError) {
        // If user not found, fallback to registration
        if (
          signInError.message.includes("Invalid login credentials") ||
          signInError.message.includes("Invalid login")
        ) {
          // Try registering this email
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin + "/",
            },
          });
          if (signUpError) {
            setFormError(signUpError.message);
            setLoading(false);
            return;
          }
          if (signUpData.user) {
            toast({
              title: "Registration successful",
              description: "Check your email to confirm your account.",
            });
            setLoading(false);
            return;
          }
          setFormError("Unexpected error during sign up.");
          setLoading(false);
          return;
        }
        if (signInError.message.includes("Email not confirmed")) {
          setFormError("Email not confirmed. Please check your inbox.");
          setLoading(false);
          return;
        }
        setFormError(signInError.message);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      setFormError("Unknown error: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  // SMS OTP Flow
  const handleContinueWithSms = async () => {
    setFormError(null);
    if (!isE164Phone(phone)) {
      setFormError("Phone must be in E.164 format (e.g. +919876543210)");
      return;
    }
    setLoading(true);

    try {
      // First, try as registration
      const { error: regErr } = await supabase.auth.signInWithOtp({
        phone,
        options: { shouldCreateUser: true },
      });
      if (!regErr) {
        setOtpStep(true);
        toast({
          title: "OTP Sent",
          description: `An OTP has been sent to ${phone}.`,
        });
        setLoading(false); // Allow user to enter OTP immediately
        return;
      }
      // If already registered (duplicate), now try as login
      if (
        regErr.message.toLowerCase().includes("already registered") ||
        regErr.message.toLowerCase().includes("already exists") ||
        regErr.message.toLowerCase().includes("user already exists") ||
        regErr.message.toLowerCase().includes("user already registered")
      ) {
        const { error: loginErr } = await supabase.auth.signInWithOtp({
          phone,
          options: { shouldCreateUser: false },
        });
        if (!loginErr) {
          setOtpStep(true);
          toast({
            title: "OTP Sent",
            description: `An OTP has been sent to ${phone}.`,
          });
        } else {
          setFormError(loginErr.message);
        }
        setLoading(false);
        return;
      }
      // If any other error, show it
      setFormError(regErr.message);
      setLoading(false);
    } catch (err: any) {
      setFormError("Unknown error: " + (err?.message || err));
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setFormError(null);
    if (!otp || otp.length < 4) {
      setFormError("Please enter a valid OTP.");
      return;
    }
    setLoading(true);
    try {
      // Always use type: "sms"
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });
      if (error) {
        setFormError(error.message);
        setLoading(false);
        return;
      }
      if (data.user || data.session) {
        toast({
          title: "Phone Verified",
          description: "Login successful.",
        });
        setOtpStep(false);
        setOtp("");
        setLoading(false);
        return;
      }
      setFormError("Unknown error verifying OTP.");
    } catch (err: any) {
      setFormError("Unknown error: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 to-slate-800/95">
          <CardHeader className="text-center pt-8 pb-4">
            <CardTitle className="text-3xl font-bold">Sign Up or Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 px-8 pb-8">
            <form onSubmit={e => e.preventDefault()}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-slate-300">
                  Email address
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white mb-4"
                  disabled={loading || otpStep}
                  placeholder="you@email.com"
                />

                <label className="block text-sm font-medium mb-1 text-slate-300">
                  Password
                </label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white mb-4"
                  disabled={loading || otpStep}
                  minLength={6}
                  placeholder="Password"
                />

                <Button
                  type="button"
                  className="w-full mt-2"
                  onClick={handleContinueWithEmail}
                  disabled={loading || otpStep || !email || !isEmail(email) || !password}
                >
                  {loading ? "Processing..." : "Continue with Email"}
                </Button>
              </div>
              <div>
                <hr className="my-6 border-slate-700" />
                <label className="block text-sm font-medium mb-1 text-slate-300">
                  Phone number (+country code)
                </label>
                <Input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value.trim())}
                  className="bg-slate-800 border-slate-600 text-white mb-4"
                  disabled={loading || otpStep}
                  placeholder="+919876543210"
                />

                {otpStep ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-slate-300">Enter OTP</label>
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="w-10 h-12 bg-slate-800 border-slate-600 text-white text-2xl font-bold" />
                        <InputOTPSlot index={1} className="w-10 h-12 bg-slate-800 border-slate-600 text-white text-2xl font-bold" />
                        <InputOTPSlot index={2} className="w-10 h-12 bg-slate-800 border-slate-600 text-white text-2xl font-bold" />
                        <InputOTPSlot index={3} className="w-10 h-12 bg-slate-800 border-slate-600 text-white text-2xl font-bold" />
                        <InputOTPSlot index={4} className="w-10 h-12 bg-slate-800 border-slate-600 text-white text-2xl font-bold" />
                        <InputOTPSlot index={5} className="w-10 h-12 bg-slate-800 border-slate-600 text-white text-2xl font-bold" />
                      </InputOTPGroup>
                    </InputOTP>
                    <Button
                      type="button"
                      className="w-full mt-2"
                      onClick={handleVerifyOtp}
                      disabled={loading || !otp || otp.length < 4}
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleContinueWithSms}
                    disabled={loading || !phone || !isE164Phone(phone)}
                  >
                    {loading ? "Processing..." : "Continue with SMS OTP"}
                  </Button>
                )}
              </div>
              {formError && (
                <div className="text-red-400 text-center mt-4">{formError}</div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnifiedAuthPage;
