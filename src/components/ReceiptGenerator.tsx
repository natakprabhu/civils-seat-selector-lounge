
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer } from 'lucide-react';

interface ReceiptProps {
  booking: {
    id: string;
    name: string;
    mobile: string;
    email: string;
    seatNumber: string;
    duration: string;
    paidAmount: number;
    paidOn: string;
  };
}

const ReceiptGenerator: React.FC<ReceiptProps> = ({ booking }) => {
  const handleDownload = () => {
    const receiptContent = `
      CIVILS LOUNGE - PAYMENT RECEIPT
      ================================
      
      Receipt ID: ${booking.id}
      Date: ${new Date().toLocaleDateString()}
      
      Student Details:
      Name: ${booking.name}
      Mobile: ${booking.mobile}
      Email: ${booking.email}
      
      Booking Details:
      Seat Number: ${booking.seatNumber}
      Duration: ${booking.duration} months
      Amount Paid: ₹${booking.paidAmount}
      Paid On: ${booking.paidOn}
      
      Thank you for choosing Civils Lounge!
      ================================
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${booking.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .details { margin: 20px 0; }
              .footer { margin-top: 30px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>CIVILS LOUNGE</h1>
              <h2>Payment Receipt</h2>
            </div>
            <div class="details">
              <p><strong>Receipt ID:</strong> ${booking.id}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <br>
              <p><strong>Name:</strong> ${booking.name}</p>
              <p><strong>Mobile:</strong> ${booking.mobile}</p>
              <p><strong>Email:</strong> ${booking.email}</p>
              <br>
              <p><strong>Seat Number:</strong> ${booking.seatNumber}</p>
              <p><strong>Duration:</strong> ${booking.duration} months</p>
              <p><strong>Amount Paid:</strong> ₹${booking.paidAmount}</p>
              <p><strong>Paid On:</strong> ${booking.paidOn}</p>
            </div>
            <div class="footer">
              <p>Thank you for choosing Civils Lounge!</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-green-700">Receipt Available</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Your payment has been confirmed</p>
          <p className="font-semibold">Amount: ₹{booking.paidAmount}</p>
          <p className="text-xs text-gray-500">Paid on: {booking.paidOn}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownload} className="flex-1" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptGenerator;
