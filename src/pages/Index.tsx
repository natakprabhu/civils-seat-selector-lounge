
import React, { useState } from 'react';
import PreLoginPage from '@/components/PreLoginPage';
import ClientDashboard from '@/components/ClientDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import StaffDashboard from '@/components/StaffDashboard';

const Index = () => {
  const [user, setUser] = useState<{
    mobile: string;
    userType: 'client' | 'admin' | 'staff';
  } | null>(null);

  const handleLogin = (mobile: string, userType: 'client' | 'admin' | 'staff') => {
    setUser({ mobile, userType });
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <PreLoginPage onLogin={handleLogin} />;
  }

  switch (user.userType) {
    case 'admin':
      return <AdminDashboard onLogout={handleLogout} />;
    case 'staff':
      return <StaffDashboard onLogout={handleLogout} />;
    case 'client':
    default:
      return <ClientDashboard userMobile={user.mobile} onLogout={handleLogout} />;
  }
};

export default Index;
