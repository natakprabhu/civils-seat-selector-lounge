
import { useState } from 'react';

// Minimal Seat type for UI only
export interface Seat {
  id: string;
  seat_number: string;
  section: string;
  row_number: string;
  status: 'vacant' | 'booked' | 'maintenance' | 'on_hold';
  monthly_rate: number;
}

export const useSeats = () => {
  // Dummy hardcoded data for demo/UI usage
  const [seats] = useState<Seat[]>([
    { id: '1', seat_number: 'A1', section: 'Main', row_number: '1', status: 'vacant', monthly_rate: 2500 },
    { id: '2', seat_number: 'A2', section: 'Main', row_number: '1', status: 'booked', monthly_rate: 2500 },
    { id: '3', seat_number: 'B1', section: 'Main', row_number: '2', status: 'maintenance', monthly_rate: 2500 },
    { id: '4', seat_number: 'C1', section: 'East', row_number: '3', status: 'on_hold', monthly_rate: 2500 },
  ]);
  const loading = false;

  // All actions and Supabase logic removed
  return {
    seats,
    loading,
    // stubs, not used
    lockSeat: async () => ({ error: { message: 'Not implemented' } }),
    releaseSeatLock: async () => ({ error: { message: 'Not implemented' } }),
    refetch: () => {},
  };
};
