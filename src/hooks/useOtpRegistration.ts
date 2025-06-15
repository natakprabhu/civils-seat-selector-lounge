import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useOtpRegistration() {
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Step 1: Start registration, trigger OTP send
  const registerWithOtp = async (email: string, password: string) => {
    setLoading(true);
    setSignupError(null);
    // Use absolute URL to Supabase edge function
    try {
      const response = await fetch(
        "https://llvujxdmzuyebkzuutqn.supabase.co/functions/v1/send-otp-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      if (response.ok) {
        setStep("otp");
        setLoading(false);
        return true;
      } else {
        let data;
        try {
          data = await response.json();
        } catch {
          data = { error: "Failed to get error details from server" };
        }
        setSignupError(data.error || "Failed to send OTP");
        setLoading(false);
        return false;
      }
    } catch (err: any) {
      setSignupError("Network error: " + (err?.message || "Unknown error"));
      setLoading(false);
      return false;
    }
  };

  // Step 2: Validate OTP, create user account if valid
  const validateOtpAndRegister = async (
    email: string,
    password: string,
    otp: string
  ) => {
    setLoading(true);
    setSignupError(null);
    // 1. Check pending_otps for this OTP
    const { data, error } = await supabase
      .from("pending_otps")
      .select("otp, expires_at")
      .eq("email", email)
      .maybeSingle();

    if (error || !data) {
      setSignupError("No OTP found for this email or error occurred.");
      setLoading(false);
      return false;
    }
    if (data.otp !== otp) {
      setSignupError("Invalid OTP");
      setLoading(false);
      return false;
    }
    if (new Date() > new Date(data.expires_at)) {
      setSignupError("OTP expired, please request a new one.");
      setLoading(false);
      return false;
    }

    // 2. Sign up user (will send a confirmation email but you can skip checking it)
    const { error: supaErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/",
      },
    });
    if (supaErr) {
      setSignupError(supaErr.message || "Signup failed");
      setLoading(false);
      return false;
    }

    // 3. Delete OTP after successful registration
    await supabase.from("pending_otps").delete().eq("email", email);

    setStep("success");
    setLoading(false);
    return true;
  };

  const reset = () => {
    setStep("form");
    setLoading(false);
    setSignupError(null);
  };

  return { step, loading, signupError, registerWithOtp, validateOtpAndRegister, reset };
}
