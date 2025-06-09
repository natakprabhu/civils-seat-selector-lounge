
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Calendar, IndianRupee, MapPin, Clock, Download } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  time: string;
  type: 'booking' | 'extension' | 'seat_change';
  transactionName: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  receiptNumber?: string;
  seatNumber?: string;
}

interface AllTransactionsProps {
  onBack: () => void;
}

const AllTransactions: React.FC<AllTransactionsProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced mock transaction data
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      date: '2024-01-16',
      time: '10:30 AM',
      type: 'booking',
      transactionName: 'Seat Booking - 6 Month Plan',
      amount: 15000,
      status: 'completed',
      receiptNumber: 'REC-2024-001',
      seatNumber: 'A5'
    },
    {
      id: '2',
      date: '2024-01-10',
      time: '2:15 PM',
      type: 'seat_change',
      transactionName: 'Seat Change Request Fee',
      amount: 500,
      status: 'pending',
      receiptNumber: 'REC-2024-002',
      seatNumber: 'A3 → A5'
    },
    {
      id: '3',
      date: '2023-12-15',
      time: '11:45 AM',
      type: 'extension',
      transactionName: 'Plan Extension - 3 Months',
      amount: 7500,
      status: 'completed',
      receiptNumber: 'REC-2023-045'
    },
    {
      id: '4',
      date: '2023-12-01',
      time: '9:20 AM',
      type: 'booking',
      transactionName: 'Initial Seat Booking',
      amount: 12000,
      status: 'cancelled',
      receiptNumber: 'REC-2023-040'
    }
  ]);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.transactionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.seatNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4" />;
      case 'extension':
        return <Clock className="w-4 h-4" />;
      case 'seat_change':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const handleDownloadReceipt = (receiptNumber: string) => {
    console.log('Downloading receipt:', receiptNumber);
    // Mock download functionality
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            onClick={onBack}
            className="bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg shadow-black/50 border border-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">All Transactions</h1>
        </div>

        <Card className="dashboard-card">
          <CardHeader className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-xl font-bold text-white">
                Transaction History
              </CardTitle>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  {searchTerm ? 'No transactions found matching your search.' : 'No transactions yet.'}
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-lg border border-slate-700/50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center border border-slate-600 mt-1">
                              {getTypeIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{transaction.transactionName}</p>
                              <p className="text-sm text-slate-400">{transaction.receiptNumber}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-slate-400">Date & Time</p>
                            <p className="text-white">{transaction.date}</p>
                            <p className="text-sm text-slate-400">{transaction.time}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-slate-400">Amount</p>
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-4 h-4 text-white" />
                              <span className="font-semibold text-white">{transaction.amount}</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-slate-400">Status</p>
                            <Badge variant={getStatusColor(transaction.status)} className="text-xs">
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-end">
                            {transaction.receiptNumber && transaction.status === 'completed' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDownloadReceipt(transaction.receiptNumber!)}
                                className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Receipt
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AllTransactions;
