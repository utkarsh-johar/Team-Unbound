import React from 'react';

interface DemoBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ className = '', size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium bg-amber-100 text-amber-800 border border-amber-300 rounded-full select-none ${sizeClasses} ${className}`}
      title="This record is simulated sample data for demonstration purposes."
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500 animate-pulse"></span>
      Demo
    </span>
  );
};

export default DemoBadge;
