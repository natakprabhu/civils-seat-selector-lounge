
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProfileSetupModalProps {
  open: boolean;
  initialMobile: string;
  onSubmit: (name: string, email: string) => Promise<{ error: any }>;
}

const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  open,
  initialMobile,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name.trim() || name.length < 2) {
      setErrorMsg('Please enter a valid name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    const result = await onSubmit(name, email);
    setSubmitting(false);
    if (result.error) {
      setErrorMsg(result.error);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <Input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              placeholder="Enter your email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mobile Number</label>
            <Input
              type="tel"
              value={initialMobile}
              disabled
              className="opacity-70"
            />
          </div>
          {errorMsg && (
            <p className="text-red-600 text-sm">{errorMsg}</p>
          )}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSetupModal;
