
import React from 'react';
import { cn } from '@/lib/utils';

interface SeatIconProps {
  seatNumber: string;
  status: 'vacant' | 'booked' | 'pending' | 'selected';
  onClick?: () => void;
  disabled?: boolean;
}

const SeatIcon: React.FC<SeatIconProps> = ({ seatNumber, status, onClick, disabled }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'vacant':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'booked':
        return 'bg-red-500 text-white cursor-not-allowed';
      case 'pending':
        return 'bg-yellow-500 text-white cursor-not-allowed';
      case 'selected':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-300 text-gray-600';
    }
  };

  return (
    <div
      className={cn(
        'w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-sm transition-all duration-200 cursor-pointer shadow-md',
        getStatusColor(),
        disabled && 'cursor-not-allowed opacity-50'
      )}
      onClick={!disabled && status === 'vacant' ? onClick : undefined}
    >
      {seatNumber}
    </div>
  );
};

export default SeatIcon;
