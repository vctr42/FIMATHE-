
import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  extraInfo?: string;
}

export const Card: React.FC<CardProps> = ({ title, value, icon, color, extraInfo }) => {
  const valueColor = color ? color : 'text-gray-900';
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center">
        {icon && <div className="mr-4 text-blue-500">{icon}</div>}
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
          {extraInfo && <p className="text-xs text-gray-400 mt-1">{extraInfo}</p>}
        </div>
      </div>
    </div>
  );
};
