
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Accept profile details as props so they can be pre-filled and read-only
interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (details: { name: string; email: string; mobile: string; seatNumber: string; duration: number }) => void;
  seatNumber: string;
  loading?: boolean;
  name: string;
  email: string;
  mobile: string;
}

const BookingDialog: React.FC<BookingDialogProps> = ({
  open,
  onClose,
  onSubmit,
  seatNumber,
  loading = false,
  name,
  email,
  mobile
}) => {
  const [duration, setDuration] = useState(1);

  // Reset duration each time dialog opens
  useEffect(() => {
    if (open) setDuration(1);
  }, [open]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, mobile, seatNumber, duration });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Booking for Seat {seatNumber}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input placeholder="Full Name" value={name} readOnly required />
          <Input placeholder="Email" type="email" value={email} readOnly required />
          <Input placeholder="Mobile" value={mobile} readOnly required />
          <Input placeholder="Duration (Months)" type="number" min={1} max={12} value={duration} onChange={e => setDuration(Number(e.target.value))} required />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Submitting..." : "Confirm Booking"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
