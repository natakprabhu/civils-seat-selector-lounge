
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

  const getRowLetter = () => seatNumber.charAt(0);
  
  const getSeatShape = () => {
    const rowLetter = getRowLetter();
    
    switch (rowLetter) {
      case 'A':
      case 'C':
      case 'E':
        // Flipped shape - rounded bottom instead of top
        return 'rounded-b-lg rounded-t-sm';
      case 'B':
      case 'D':
      case 'F':
      default:
        // Standard shape - rounded top
        return 'rounded-t-lg rounded-b-sm';
    }
  };

  return (
    <div
      className={cn(
        'w-14 h-14 relative flex items-center justify-center font-bold text-xs transition-all duration-200 cursor-pointer shadow-lg border-2 border-gray-300',
        'before:content-[""] before:absolute before:bottom-0 before:left-1 before:right-1 before:h-1 before:bg-gray-400 before:rounded-sm',
        'after:content-[""] after:absolute after:top-2 after:left-1 after:right-1 after:h-8 after:rounded-lg after:border-2 after:border-gray-200',
        getSeatShape(),
        getStatusColor(),
        disabled && 'cursor-not-allowed opacity-50'
      )}
      onClick={!disabled && status === 'vacant' ? onClick : undefined}
      style={{
        background: status === 'vacant' ? 'linear-gradient(135deg, #10b981, #059669)' :
                   status === 'booked' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                   status === 'pending' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                   status === 'selected' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' :
                   '#9ca3af'
      }}
    >
      <span className="relative z-10 drop-shadow-sm">{seatNumber}</span>
    </div>
  );
};

export default SeatIcon;
