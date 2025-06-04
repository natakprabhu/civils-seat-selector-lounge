
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, IndianRupee, Calendar, CreditCard, Banknote } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  method: 'cash' | 'upi';
  date: string;
  duration: number; // in months
  validFrom: string;
  validUntil: string;
  status: 'active' | 'expired' | 'upcoming';
}

interface PaymentHistoryProps {
  onBack: () => void;
  userMobile: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ onBack, userMobile }) => {
  // Mock payment data - in real app this would come from backend
  const payments: Payment[] = [
    {
      id: '1',
      amount: 3000,
      method: 'upi',
      date: '2024-01-15',
      duration: 1,
      validFrom: '2024-01-15',
      validUntil: '2024-02-15',
      status: 'expired'
    },
    {
      id: '2',
      amount: 5000,
      method: 'cash',
      date: '2024-02-10',
      duration: 2,
      validFrom: '2024-02-15',
      validUntil: '2024-04-15',
      status: 'active'
    },
    {
      id: '3',
      amount: 6000,
      method: 'upi',
      date: '2024-04-10',
      duration: 3,
      validFrom: '2024-04-15',
      validUntil: '2024-07-15',
      status: 'upcoming'
    }
  ];

  const getTotalAmount = () => payments.reduce((sum, payment) => sum + payment.amount, 0);
  const getActiveValidityPeriod = () => {
    const activePayment = payments.find(p => p.status === 'active');
    const upcomingPayment = payments.find(p => p.status === 'upcoming');
    
    if (activePayment) {
      return {
        from: activePayment.validFrom,
        until: upcomingPayment ? upcomingPayment.validUntil : activePayment.validUntil
      };
    }
    return null;
  };

  const validityPeriod = getActiveValidityPeriod();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Payment History</h1>
            <p className="text-slate-600">Mobile: {userMobile}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Paid</p>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-5 h-5 text-green-600" />
                    <p className="text-2xl font-bold text-green-900">{getTotalAmount()}</p>
                  </div>
                </div>
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Current Validity</p>
                  {validityPeriod ? (
                    <p className="text-sm font-semibold text-blue-900">
                      {new Date(validityPeriod.from).toLocaleDateString()} - {new Date(validityPeriod.until).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-sm text-blue-900">No active validity</p>
                  )}
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Payments</p>
                  <p className="text-2xl font-bold text-purple-900">{payments.length}</p>
                </div>
                <Banknote className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-200 bg-slate-50">
            <CardTitle className="text-xl font-bold text-slate-800">All Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {payments.map((payment, index) => (
                <div key={payment.id} className={`p-6 ${index !== payments.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Amount</p>
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-600">{payment.amount}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Payment Method</p>
                          <div className="flex items-center gap-2">
                            {payment.method === 'upi' ? (
                              <CreditCard className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Banknote className="w-4 h-4 text-green-600" />
                            )}
                            <span className="text-sm font-medium capitalize">{payment.method}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Duration & Validity</p>
                          <p className="text-sm font-semibold">{payment.duration} month{payment.duration > 1 ? 's' : ''}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(payment.validFrom).toLocaleDateString()} - {new Date(payment.validUntil).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Status & Date</p>
                          <Badge 
                            variant={
                              payment.status === 'active' ? 'default' : 
                              payment.status === 'upcoming' ? 'secondary' : 'outline'
                            }
                            className="mb-1"
                          >
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                          <p className="text-xs text-slate-500">Paid: {new Date(payment.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentHistory;
