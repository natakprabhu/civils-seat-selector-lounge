
import React from "react";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

interface PasswordInputProps {
  password: string;
  setPassword: (v: string) => void;
  loading: boolean;
  mode: "login" | "signup" | "forgot";
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  password,
  setPassword,
  loading,
  mode,
}) => {
  if (mode === "forgot") return null;
  return (
    <div>
      <label className="text-sm text-slate-300 font-medium">Password</label>
      <div className="mt-1 relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          type="password"
          className="pl-10 h-12 text-base bg-slate-800 border-slate-600 text-white"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={6}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default PasswordInput;
