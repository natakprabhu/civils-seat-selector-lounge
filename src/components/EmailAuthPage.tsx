
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type View = "login" | "signup" | "forgot";

const EmailAuthPage: React.FC<{ onAuthSuccess?: () => void }> = ({ onAuthSuccess }) => {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Handles login or signup
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (password.length < 6 && view !== "forgot") {
      setFormError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      if (view === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          setFormError(
            error.message === "Email not confirmed"
              ? "Please confirm your email. Check your inbox!"
              : error.message
          );
        } else if (data.user) {
          toast({ title: "Welcome!", description: "Login successful!" });
          onAuthSuccess?.();
        } else {
          setFormError("Invalid login or unknown error.");
        }
      } else if (view === "signup") {
        const redirectUrl = `${window.location.origin}/`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl }
        });
        if (error) {
          setFormError(error.message);
        } else if (data.user) {
          toast({
            title: "Check your email",
            description: "A confirmation link was sent. Please verify to continue."
          });
          setView("login");
        } else {
          setFormError("Unable to register. Please try again.");
        }
      }
    } catch (err: any) {
      setFormError("Unexpected error: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Handles forgot password flow
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      if (error) {
        setFormError(error.message);
      } else {
        toast({
          title: "Check your email",
          description: "Password reset link sent. Check inbox/spam!"
        });
        setView("login");
      }
    } catch (err: any) {
      setFormError("Unexpected error: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 to-slate-800/95">
          <CardHeader className="text-center pt-8 pb-4">
            <CardTitle className="text-3xl font-bold">
              {view === "login" ? "Log in" : view === "signup" ? "Create your account" : "Forgot password?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={view === "forgot" ? handleReset : handleAuth} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Email</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  autoFocus
                  disabled={loading}
                  placeholder="you@email.com"
                />
              </div>
              {/* Don't show password input in forgot password view */}
              {view !== "forgot" && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Password</label>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                    disabled={loading}
                    placeholder="Your password"
                  />
                </div>
              )}
              {formError && <div className="text-red-400 text-center mt-2">{formError}</div>}

              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading
                  ? view === "forgot"
                    ? "Sending link..."
                    : view === "signup"
                      ? "Creating account..."
                      : "Logging in..."
                  : view === "forgot"
                    ? "Send password reset link"
                    : view === "signup"
                      ? "Sign up"
                      : "Log in"}
              </Button>
            </form>

            {/* Links for changing view */}
            {view === "login" && (
              <div className="flex flex-col items-center space-y-2">
                <button
                  type="button"
                  className="text-blue-400 hover:underline text-sm"
                  onClick={() => setView("forgot")}
                  disabled={loading}
                >
                  Forgot password?
                </button>
                <span className="text-slate-400 text-sm">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-400 hover:underline"
                    onClick={() => setView("signup")}
                    disabled={loading}
                  >
                    Create your account
                  </button>
                </span>
              </div>
            )}
            {view === "signup" && (
              <div className="flex flex-col items-center space-y-2">
                <span className="text-slate-400 text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-400 hover:underline"
                    onClick={() => setView("login")}
                    disabled={loading}
                  >
                    Log in
                  </button>
                </span>
              </div>
            )}
            {view === "forgot" && (
              <div className="flex flex-col items-center space-y-2">
                <span className="text-slate-400 text-sm">
                  Remembered?{" "}
                  <button
                    type="button"
                    className="text-blue-400 hover:underline"
                    onClick={() => setView("login")}
                    disabled={loading}
                  >
                    Back to log in
                  </button>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailAuthPage;
