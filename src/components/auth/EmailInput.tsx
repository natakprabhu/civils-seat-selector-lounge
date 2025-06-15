
import React from "react";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

interface EmailInputProps {
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
}

const EmailInput: React.FC<EmailInputProps> = ({ email, setEmail, loading }) => (
  <div>
    <label className="text-sm text-slate-300 font-medium">Email</label>
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
);

export default EmailInput;
