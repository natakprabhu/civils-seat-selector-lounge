
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SignupPage({ onSignupSuccess }: { onSignupSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"signup" | "verify_email">("signup");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`; // must be allowlisted in Supabase Email Auth redirect settings

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl }
    });

    setLoading(false);

    if (error) {
      toast({ title: "Signup Error", description: error.message, variant: "destructive" });
    } else {
      setStep("verify_email");
      toast({
        title: "Check Your Email",
        description: "A confirmation link was sent. Click it to activate your account.",
      });
      onSignupSuccess?.();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 to-slate-800/95">
          <CardHeader className="text-center pt-8 pb-4">
            <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            {step === "signup" && (
              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Email</label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Password</label>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing up..." : "Sign Up"}
                </Button>
              </form>
            )}
            {step === "verify_email" && (
              <div className="text-center space-y-4">
                <p className="text-lg text-slate-200 font-medium">
                  Please confirm your email address.
                </p>
                <p className="text-slate-400">
                  We've sent a confirmation link to <span className="font-bold">{email}</span>.<br />
                  Check your inbox/spam and click the link to activate your account. <br />
                  After confirming, log in to continue.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
