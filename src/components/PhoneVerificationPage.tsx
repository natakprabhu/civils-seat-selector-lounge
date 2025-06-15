
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function PhoneVerificationPage({
  onPhoneVerified,
  user,
}: {
  onPhoneVerified: () => void;
  user: any;
}) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"enter_phone" | "enter_otp">("enter_phone");
  const [loading, setLoading] = useState(false);

  // Supabase expects E.164 format (+91...), enforce this in input/validation.
  const validatePhone = (n: string) =>
    /^\+[1-9]\d{1,14}$/.test(n);

  const sendPhoneChangeOtp = async () => {
    if (!validatePhone(phone)) {
      toast({
        title: "Invalid phone number",
        description:
          "Enter a valid phone number with country code (e.g. +919876543210)",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    // Use Supabase's updateUser for phone with OTP
    const { error } = await supabase.auth.updateUser({ phone });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setStep("enter_otp");
      toast({
        title: "OTP Sent",
        description: `SMS OTP sent to ${phone}. Check your phone!`,
      });
    }
  };

  const verifyPhoneOtp = async () => {
    if (!otp || otp.length < 4) {
      toast({ title: "Error", description: "Enter the OTP code sent to your phone.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "phone_change", // required for verifying phone change (see docs)
    });
    setLoading(false);
    if (error) {
      toast({ title: "OTP Verification Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Phone Verified",
        description: "Your phone is now verified!",
      });
      onPhoneVerified?.();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 to-slate-800/95">
          <CardHeader className="text-center pt-8 pb-4">
            <CardTitle className="text-2xl font-bold">
              {step === "enter_phone" ? "Add Phone Number" : "Verify Phone OTP"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            {step === "enter_phone" && (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendPhoneChangeOtp();
                }}
              >
                <label className="block text-sm font-medium mb-1 text-slate-300">
                  Phone Number (+country code)
                </label>
                <Input
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  disabled={loading}
                  type="tel"
                  required
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending OTP…" : "Send OTP"}
                </Button>
              </form>
            )}
            {step === "enter_otp" && (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  verifyPhoneOtp();
                }}
              >
                <label className="block text-sm font-medium mb-1 text-slate-300">Enter OTP</label>
                <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-10 h-12 bg-slate-800 border-slate-600 text-white text-2xl font-bold" />
                    <InputOTPSlot index={1} className="w-10 h-12 bg-slate-800 border-slate-600 text-white text-2xl font-bold" />
                    <InputOTPSlot index={2} className="w-10 h-12 bg-slate-800 border-slate-600 text-white text-2xl font-bold" />
                    <InputOTPSlot index={3} className="w-10 h-12 bg-slate-800 border-slate-600 text-white text-2xl font-bold" />
                    <InputOTPSlot index={4} className="w-10 h-12 bg-slate-800 border-slate-600 text-white text-2xl font-bold" />
                    <InputOTPSlot index={5} className="w-10 h-12 bg-slate-800 border-slate-600 text-white text-2xl font-bold" />
                  </InputOTPGroup>
                </InputOTP>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verifying…" : "Verify OTP"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
