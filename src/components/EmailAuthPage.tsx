import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Mode = "login" | "signup" | "forgot";

const EmailAuthPage: React.FC<{ onAuth: () => void }> = ({ onAuth }) => {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);

  // Helper: handle auth result & show toasts and user feedback
  const handleAuthResult = ({ error }: { error: any }) => {
    if (error) {
      // Show clearer error if not verified
      if (
        (error.message || "").toLowerCase().includes("email not confirmed") ||
        (error.message || "").toLowerCase().includes("user has not confirmed their email address")
      ) {
        setErrorText("You must verify your email before logging in. Please check your inbox (and spam folder) for the verification email.");
      } else {
        setErrorText(error.message);
      }
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      if (mode === "signup") {
        setMessage("Verification email sent! Check your inbox to verify your account.");
      } else if (mode === "forgot") {
        setMessage("Password reset email sent. Check your inbox.");
      } else {
        // Login successful: show toast, not inline message
        toast({
          title: "Success",
          description: "Login successful.",
        });
        onAuth();
      }
      if (mode !== "login") setErrorText(null);
    }
  };

  // Main submit handler (no OTP, standard flows)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setErrorText(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        // Use Supabase's built-in email verification (emailRedirectTo REQUIRED)
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/" },
        });
        handleAuthResult({ error });
        if (!error) {
          setMode("login");
        }
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
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

  // Reset password field and messages on mode change
  React.useEffect(() => {
    setMessage("");
    setPassword("");
    setErrorText(null);
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
            {/* Show inline success message, if any */}
            {message && (
              <div className="mb-3">
                <div className="bg-green-600/90 text-white px-4 py-2 rounded-md text-center shadow font-medium text-base">
                  {message}
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white text-lg font-semibold shadow-lg border border-slate-600"
                disabled={
                  loading ||
                  !email ||
                  (mode !== "forgot" && !password)
                }
              >
                {loading && <Loader2 className="animate-spin mr-2" />}
                {mode === "login"
                  ? "Log in"
                  : mode === "signup"
                  ? "Create account"
                  : "Send reset link"}
              </Button>
            </form>
            {errorText && (
              <div className="text-sm text-center text-red-400">
                {errorText}
              </div>
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
                    onClick={() => setMode("login")}
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
