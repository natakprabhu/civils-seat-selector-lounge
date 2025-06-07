
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Download, Calendar, IndianRupee } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  receiptNumber?: string;
}

interface TransactionHistoryProps {
  onBack: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock transaction data
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      date: '2024-01-15',
      description: 'Seat Booking - 6 months',
      amount: 15000,
      status: 'completed',
      paymentMethod: 'Online',
      receiptNumber: 'REC-2024-001'
    },
    {
      id: '2',
      date: '2024-01-10',
      description: 'Seat Extension - 3 months',
      amount: 7500,
      status: 'completed',
      paymentMethod: 'Cash',
      receiptNumber: 'REC-2024-002'
    },
    {
      id: '3',
      date: '2024-01-05',
      description: 'Seat Change Fee',
      amount: 500,
      status: 'pending',
      paymentMethod: 'Online'
    }
  ]);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handleDownloadReceipt = (receiptNumber: string) => {
    console.log('Downloading receipt:', receiptNumber);
    // Mock download functionality
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Transaction History</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                All Transactions
              </CardTitle>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No transactions found matching your search.' : 'No transactions yet.'}
                </div>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4 bg-card">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-semibold">{transaction.date}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Description</p>
                            <p className="font-semibold">{transaction.description}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-4 h-4" />
                              <span className="font-semibold">{transaction.amount}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant={getStatusColor(transaction.status)}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="text-sm text-muted-foreground">
                          {transaction.paymentMethod}
                        </div>
                        {transaction.receiptNumber && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReceipt(transaction.receiptNumber!)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionHistory;
