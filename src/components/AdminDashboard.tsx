
// Dummy Admin Dashboard UI, all data is static and hard-coded

import React from "react";
import { Button } from "@/components/ui/button";

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-900 rounded-xl px-8 py-8 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
          <Button onClick={onLogout}>Logout</Button>
        </div>
        <div className="mb-6">
          <div className="text-slate-200 font-semibold mb-1">Total Bookings</div>
          <div className="bg-green-500/90 text-white px-6 py-5 text-4xl rounded font-bold shadow">27</div>
        </div>
        <div className="mb-6">
          <div className="text-slate-200 font-semibold mb-1">Pending Approvals</div>
          <div className="bg-yellow-500/90 text-black px-6 py-4 text-xl rounded font-semibold shadow">3</div>
        </div>
        <div>
          <div className="text-slate-200 font-semibold mb-1">Issues Reported</div>
          <div className="bg-red-500/80 text-white px-6 py-3 rounded font-bold shadow">1 - Main AC not working</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
