
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// You may want a prop for showId. Here we use a placeholder UUID for demo.
const DEMO_SHOW_ID = "61559e4a-63b6-49ae-bdb4-17b046d3534f";

interface BookingDetailsDialogProps {
  seatId: string;
  onClose: () => void;
  myUserId: string;
  showId?: string;
}

const BookingDetailsDialog: React.FC<BookingDetailsDialogProps> = ({
  seatId,
  onClose,
  myUserId,
  showId // optional, fallback to DEMO_SHOW_ID if not provided
}) => {
  const [profile, setProfile] = useState<{ full_name: string; email: string; mobile: string } | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', duration: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!myUserId) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, mobile")
        .eq("id", myUserId)
        .maybeSingle();
      if (!error && data) {
        setProfile(data);
        setForm({
          name: data.full_name || "",
          email: data.email || "",
          phone: data.mobile || "",
          duration: ""
        });
      }
    }
    fetchProfile();
  }, [myUserId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.duration) {
      toast({ title: "Error", description: "Please fill all the fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    // Insert booking into Supabase DB
    try {
      // Use the provided or fallback showId
      const finalShowId = showId || DEMO_SHOW_ID;

      const { error } = await supabase
        .from("seat_bookings")
        .insert({
          seat_id: seatId,
          show_id: finalShowId,
          user_id: myUserId,
          payment_reference: null,
        });

      if (error) {
        toast({ title: "Booking failed", description: error.message || "Could not submit booking", variant: "destructive" });
        setSubmitting(false);
        return;
      }

      toast({
        title: "Booking request submitted!",
        description: `Seat ${seatId} booking requested. You will be notified once approved.`
      });
      setSubmitting(false);
      onClose();
    } catch (err: any) {
      toast({
        title: "Unexpected error",
        description: err?.message || "Could not complete booking.",
        variant: "destructive"
      });
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4 mt-2" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
            <Input id="email" name="email" value={form.email} required type="email" disabled />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="phone">Phone</label>
            <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required type="tel" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <Select
              value={form.duration}
              onValueChange={(value) => setForm((prev) => ({ ...prev, duration: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <SelectItem key={month} value={month.toString()}>
                    {month} Month{month > 1 ? "s" : ""} - ₹{month * 2500}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="mt-2 w-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Confirm Booking"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsDialog;
