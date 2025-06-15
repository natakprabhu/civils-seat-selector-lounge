
import React from "react";
import { Input } from "@/components/ui/input";
import { User, Smartphone } from "lucide-react";

interface SignupExtraFieldsProps {
  fullName: string;
  setFullName: (v: string) => void;
  mobile: string;
  setMobile: (v: string) => void;
  loading: boolean;
}

const SignupExtraFields: React.FC<SignupExtraFieldsProps> = ({
  fullName,
  setFullName,
  mobile,
  setMobile,
  loading,
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
          className="pl-10 h-12 text-base bg-slate-800 border-slate-600 text-white"
          placeholder="Enter your full name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          autoComplete="name"
          required
          disabled={loading}
        />
      </div>
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
          onChange={e => setMobile(e.target.value)}
          autoComplete="tel"
          required
          pattern="[6-9]{1}[0-9]{9}"
          disabled={loading}
          maxLength={10}
        />
      </div>
    </div>
  </>
);

export default SignupExtraFields;
