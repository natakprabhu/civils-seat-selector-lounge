
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { User, Smartphone, Lock } from "lucide-react";

interface SignupExtraFieldsProps {
  fullName: string;
  setFullName: (v: string) => void;
  mobile: string;
  setMobile: (v: string) => void;
  loading: boolean;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  errors: {
    fullName?: string;
    mobile?: string;
    passwordMatch?: string;
  };
}

const SignupExtraFields: React.FC<SignupExtraFieldsProps> = ({
  fullName,
  setFullName,
  mobile,
  setMobile,
  loading,
  confirmPassword,
  setConfirmPassword,
  password,
  setPassword,
  errors
}) => (
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
          type="password"
          className="pl-10 h-12 text-base bg-slate-800 border-slate-600 text-white"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading}
        />
      </div>
    </div>
    <div>
      <label className="text-sm text-slate-300 font-medium">
        Confirm Password <span className="text-red-400">*</span>
      </label>
      <div className="mt-1 relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          type="password"
          className="pl-10 h-12 text-base bg-slate-800 border-slate-600 text-white"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading}
        />
      </div>
      {errors.passwordMatch && (
        <div className="text-sm text-red-400 mt-1">{errors.passwordMatch}</div>
      )}
    </div>
  </>
);

export default SignupExtraFields;

