import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string, title?: string }> = ({ 
  children, 
  className = "", 
  title 
}) => (
  <div className={`bg-white rounded-xl border border-gray-100 card-shadow p-6 flex flex-col ${className}`}>
    {title && <h3 className="text-lg font-bold text-gray-900 mb-4 shrink-0">{title}</h3>}
    <div className="flex-1 w-full h-full min-h-[10px]">{children}</div>
  </div>
);
