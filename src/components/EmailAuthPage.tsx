import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, Loader2, User, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SignupExtraFields from "./auth/SignupExtraFields";
import EmailInput from "./auth/EmailInput";
import PasswordInput from "./auth/PasswordInput";
import SwitchAuthModeLinks from "./auth/SwitchAuthModeLinks";

type Mode = "login" | "signup" | "forgot";

const EmailAuthPage: React.FC<{ onAuth: () => void }> = ({ onAuth }) => {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);

  // For local field errors (useful for registration client-side errors)
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    mobile?: string;
  }>({});

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

  // Main submit handler (with new signup logic)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setErrorText(null);
    setFieldErrors({});

    if (mode === "signup") {
      let errors: { fullName?: string; mobile?: string } = {};

      if (!fullName.trim()) {
        errors.fullName = "Full name is required.";
      }
      if (!/^[A-Z ]{2,}$/.test(fullName.trim())) {
        errors.fullName = "Full name must be in uppercase letters.";
      }
      if (!mobile.trim()) {
        errors.mobile = "Mobile is required.";
      }
      if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
        errors.mobile = "Please enter a valid 10-digit mobile number.";
      }
      if (!password || password.length < 6) {
        errors.fullName = errors.fullName ?? ""; // Just to trigger error display if password is too short
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/",
            data: {
              full_name: fullName.trim(),
              mobile: mobile.trim(),
            },
          },
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

  // Reset password, confirmPassword, field errors, and messages on mode change
  React.useEffect(() => {
    setMessage("");
    setPassword("");
    setErrorText(null);
    setFieldErrors({});
    if (mode === "signup") {
      setFullName("");
      setMobile("");
    }
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
              {mode === "signup" && (
                <>
                  <EmailInput email={email} setEmail={setEmail} loading={loading} />
                  <SignupExtraFields
                    fullName={fullName}
                    setFullName={setFullName}
                    mobile={mobile}
                    setMobile={setMobile}
                    loading={loading}
                    password={password}
                    setPassword={setPassword}
                    errors={fieldErrors}
                  />
                </>
              )}
              {mode !== "signup" && (
                <>
                  <EmailInput email={email} setEmail={setEmail} loading={loading} />
                  <PasswordInput
                    password={password}
                    setPassword={setPassword}
                    loading={loading}
                    mode={mode}
                  />
                </>
              )}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white text-lg font-semibold shadow-lg border border-slate-600"
                disabled={
                  loading ||
                  !email ||
                  (mode === "login" && !password) ||
                  (mode === "signup" &&
                    (!fullName ||
                      !/^[A-Z ]{2,}$/.test(fullName) ||
                      !mobile ||
                      !/^[6-9]\d{9}$/.test(mobile) ||
                      !password ||
                      password.length < 6))
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
            <SwitchAuthModeLinks mode={mode} setMode={setMode} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailAuthPage;
