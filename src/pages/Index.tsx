
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

// Dummy authentication simulation (replace with your actual auth as needed)
const useFakeAuth = () => {
  const [isAuthenticated, setAuthenticated] = useState(true);
  return {
    isAuthenticated,
    login: () => setAuthenticated(true),
    logout: () => setAuthenticated(false),
  };
};

const DummyHomepage = ({ onLogout }: { onLogout: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
    <div className="w-full max-w-xl bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Welcome, Demo User</h1>
        <Button onClick={onLogout}>Logout</Button>
      </div>
      <div className="mb-6">
        <div className="text-slate-200 font-semibold">Your Seat</div>
        <div className="text-white bg-slate-900 rounded-lg mt-1 px-4 py-3 border border-slate-700 text-xl font-bold">
          E3
        </div>
      </div>
      <div className="mb-6">
        <div className="text-slate-200 font-semibold">Booking Details</div>
        <div className="text-slate-100 bg-slate-900 rounded-lg mt-1 px-4 py-3 border border-slate-700">
          <div>
            From: <span className="font-bold">2025-06-01</span>
          </div>
          <div>
            To: <span className="font-bold">2025-12-01</span>
          </div>
          <div>
            Status: <span className="font-bold text-green-400">Approved</span>
          </div>
        </div>
      </div>
      <div>
        <div className="text-slate-200 font-semibold mb-2">Recent Notices</div>
        <div className="bg-yellow-100 text-yellow-900 px-4 py-2 rounded mb-2">
          <div className="font-bold">Library Maintenance</div>
          <div>
            There will be a power shutdown on 16th June from 10AM to 2PM.
          </div>
        </div>
        <div className="bg-blue-100 text-blue-900 px-4 py-2 rounded">
          <div className="font-bold">Welcome to the Civil's Lounge</div>
          <div>You can always reach out to staff for issues!</div>
        </div>
      </div>
    </div>
  </div>
);

const Index = () => {
  // Replace useFakeAuth with your authentication hook if needed
  const { isAuthenticated, login, logout } = useFakeAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="bg-slate-900 px-8 py-12 rounded-xl shadow-xl">
          <h2 className="text-white text-2xl mb-4 font-bold">Login to Civils Lounge</h2>
          <Button className="w-full" onClick={login}>Login (Demo)</Button>
        </div>
      </div>
    );
  }

  // Show demo (previous homepage) after login
  return <DummyHomepage onLogout={logout} />;
};

export default Index;
