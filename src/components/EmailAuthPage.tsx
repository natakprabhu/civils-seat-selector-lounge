import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOtpRegistration } from "@/hooks/useOtpRegistration";

type Mode = "login" | "signup" | "forgot";

const EmailAuthPage: React.FC<{ onAuth: () => void }> = ({ onAuth }) => {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Add OTP registration hook/logic for signup
  const {
    step,
    loading: otpLoading,
    signupError,
    registerWithOtp,
    validateOtpAndRegister,
    reset: resetOtpFlow,
  } = useOtpRegistration();

  // Repurpose signup mode to use OTP flow
  const [otpInput, setOtpInput] = useState("");

  // Helper: handle auth result & show toasts
  const handleAuthResult = ({ error }: { error: any }) => {
    if (error) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description:
          mode === "signup"
            ? "Signup link sent! Check your email to verify."
            : mode === "forgot"
            ? "Password reset email sent. Check your inbox."
            : "Login successful.",
      });
      if (mode === "login") {
        onAuth(); // trigger reload/app state
      }
      if (mode !== "login") setMessage("Check your inbox for further instructions.");
    }
  };

  // New submit handler, splits between login/forgot/otp-signup sub-flows
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signup") {
      if (step === "form") {
        // Send OTP
        await registerWithOtp(email, password);
      } else if (step === "otp") {
        // Validate OTP and register
        const success = await validateOtpAndRegister(email, password, otpInput);
        if (success) {
          toast({
            title: "Registration successful",
            description: "You can now log in with your credentials.",
          });
          setMode("login");
          resetOtpFlow();
        }
      }
      return;
    }

    setMessage("");
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        handleAuthResult({ error });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/",
          },
        });
        handleAuthResult({ error });
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/auth",
        });
        handleAuthResult({ error });
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form fields on mode switch
  React.useEffect(() => {
    setMessage("");
    setPassword("");
  }, [mode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="w-full max-w-md mx-auto">
        <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-slate-700/70 shadow-xl">
          <CardHeader className="flex flex-col items-center pt-10 pb-6">
            <img
              src="/lovable-uploads/84938183-4aaf-4db7-ab36-6b13bd214f25.png"
              alt="Logo"
              className="w-16 h-16 mb-4 rounded-xl bg-slate-800"
            />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              Welcome to अध्ययन Library
            </CardTitle>
            <p className="text-slate-400">Sign in with your email account</p>
          </CardHeader>
          <CardContent className="space-y-5 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && step === "otp" ? (
                <>
                  <div>
                    <label className="text-sm text-slate-300 font-medium">
                      Enter the OTP sent to your email
                    </label>
                    <Input
                      type="text"
                      className="pl-3 h-12 text-base bg-slate-800 border-slate-600 text-white tracking-widest text-center"
                      placeholder="Enter OTP"
                      value={otpInput}
                      onChange={e => setOtpInput(e.target.value)}
                      required
                      disabled={loading || otpLoading}
                      maxLength={6}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-slate-300 font-medium">
                      Email
                    </label>
                    <div className="mt-1 relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        type="email"
                        className="pl-10 h-12 text-base bg-slate-800 border-slate-600 text-white"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  {mode !== "forgot" && (
                    <div>
                      <label className="text-sm text-slate-300 font-medium">
                        Password
                      </label>
                      <div className="mt-1 relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          type="password"
                          className="pl-10 h-12 text-base bg-slate-800 border-slate-600 text-white"
                          placeholder="Enter your password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          autoComplete={
                            mode === "login"
                              ? "current-password"
                              : "new-password"
                          }
                          required
                          minLength={6}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white text-lg font-semibold shadow-lg border border-slate-600"
                disabled={
                  loading ||
                  !email ||
                  (mode !== "forgot" && !password) ||
                  (mode === "signup" && step === "otp" && !otpInput)
                }
              >
                {loading && <Loader2 className="animate-spin mr-2" />}
                {mode === "login"
                  ? "Log in"
                  : mode === "signup"
                  ? step === "otp"
                    ? "Validate OTP & Register"
                    : "Create account"
                  : "Send reset link"}
              </Button>
            </form>
            {signupError && (
              <div className="text-sm text-center text-red-400">
                {signupError}
              </div>
            )}
            {message && (
              <div className="text-sm text-center text-green-400">{message}</div>
            )}
            <div className="flex flex-col items-center gap-1">
              {mode === "login" && (
                <>
                  <button
                    className="text-sm text-blue-400 hover:underline"
                    type="button"
                    onClick={() => setMode("forgot")}
                  >
                    Forgot password?
                  </button>
                  <div className="text-sm text-slate-400 mt-2">
                    Don't have an account?{" "}
                    <button
                      className="text-blue-400 hover:underline"
                      type="button"
                      onClick={() => setMode("signup")}
                    >
                      Create your account
                    </button>
                  </div>
                </>
              )}
              {mode === "signup" && (
                <div className="text-sm text-slate-400 mt-2">
                  Already have an account?{" "}
                  <button
                    className="text-blue-400 hover:underline"
                    type="button"
                    onClick={() => {
                      setMode("login");
                      resetOtpFlow();
                    }}
                  >
                    Log in
                  </button>
                </div>
              )}
              {mode === "forgot" && (
                <div className="text-sm text-slate-400 mt-2">
                  Remembered?{" "}
                  <button
                    className="text-blue-400 hover:underline"
                    type="button"
                    onClick={() => setMode("login")}
                  >
                    Back to login
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailAuthPage;
