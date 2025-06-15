
// Dummy Staff Dashboard UI, all data is static and hard-coded

import React from "react";
import { Button } from "@/components/ui/button";

const StaffDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Staff Dashboard</h2>
          <Button onClick={onLogout}>Logout</Button>
        </div>
        <div className="mb-6">
          <div className="text-slate-200 font-semibold mb-1">Active Users</div>
          <div className="bg-blue-500/90 text-white px-6 py-4 text-3xl rounded font-bold shadow">15</div>
        </div>
        <div>
          <div className="text-slate-200 font-semibold mb-1">Seats to be Cleaned</div>
          <div className="bg-yellow-200 text-yellow-900 px-6 py-3 rounded font-semibold shadow">F3, F4</div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
