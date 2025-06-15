
import React from "react";

// Match these to SeatIcon's color treatment
const LEGEND = [
  {
    label: "Vacant",
    colorClass: "bg-green-500",
    gradient: "linear-gradient(135deg, #10b981, #059669)"
  },
  {
    label: "Booked",
    colorClass: "bg-red-500",
    gradient: "linear-gradient(135deg, #ef4444, #dc2626)"
  },
  {
    label: "On Hold",
    colorClass: "bg-yellow-500",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)"
  },
  {
    label: "Selected",
    colorClass: "bg-blue-600",
    gradient: "linear-gradient(135deg, #2563eb, #1d4ed8)"
  },
];

const SeatStatusLegend: React.FC = () => (
  <div className="flex flex-wrap gap-4 items-center justify-center mb-4">
    {LEGEND.map(({ label, colorClass, gradient }) => (
      <div key={label} className="flex items-center gap-2">
        <span
          className={`inline-block w-6 h-6 rounded-md border border-gray-300 shadow`}
          style={{ background: gradient }}
        />
        <span className="text-sm text-slate-300">{label}</span>
      </div>
    ))}
  </div>
);

export default SeatStatusLegend;
