
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { User, Smartphone, Lock, Eye, EyeOff } from "lucide-react";

interface SignupExtraFieldsProps {
  fullName: string;
  setFullName: (v: string) => void;
  mobile: string;
  setMobile: (v: string) => void;
  loading: boolean;
  password: string;
  setPassword: (v: string) => void;
  errors: {
    fullName?: string;
    mobile?: string;
  };
}

const SignupExtraFields: React.FC<SignupExtraFieldsProps> = ({
  fullName,
  setFullName,
  mobile,
  setMobile,
  loading,
  password,
  setPassword,
  errors
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div>
        <label className="text-sm text-slate-300 font-medium">
          Full Name <span className="text-red-400">*</span>
        </label>
        <div className="mt-1 relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            type="text"
            className="pl-10 h-12 text-base bg-slate-800 border-slate-600 text-white uppercase"
            placeholder="ENTER YOUR FULL NAME"
            value={fullName}
            onChange={e => setFullName(e.target.value.toUpperCase())}
            autoComplete="name"
            required
            disabled={loading}
          />
        </div>
        {errors.fullName && (
          <div className="text-sm text-red-400 mt-1">{errors.fullName}</div>
        )}
      </div>

      <div>
        <label className="text-sm text-slate-300 font-medium">
          Mobile <span className="text-red-400">*</span>
        </label>
        <div className="mt-1 relative">
          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            type="tel"
            className="pl-10 h-12 text-base bg-slate-800 border-slate-600 text-white"
            placeholder="Enter your 10-digit mobile number"
            value={mobile}
            onChange={e => {
              // Only allow digits
              const raw = e.target.value.replace(/\D/g, "");
              setMobile(raw);
            }}
            autoComplete="tel"
            required
            pattern="[6-9]{1}[0-9]{9}"
            disabled={loading}
            maxLength={10}
          />
        </div>
        {errors.mobile && (
          <div className="text-sm text-red-400 mt-1">{errors.mobile}</div>
        )}
      </div>

      <div>
        <label className="text-sm text-slate-300 font-medium">
          Password <span className="text-red-400">*</span>
        </label>
        <div className="mt-1 relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            type={showPassword ? "text" : "password"}
            className="pl-10 pr-10 h-12 text-base bg-slate-800 border-slate-600 text-white"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
            autoComplete="new-password"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 bg-transparent p-0 m-0 border-0"
            tabIndex={-1}
            onClick={() => setShowPassword(prev => !prev)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </>
  );
};

export default SignupExtraFields;
