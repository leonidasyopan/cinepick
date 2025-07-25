import React from 'react';

export const BaseStreamingIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 text-black font-bold text-xs overflow-hidden">
        {children}
    </div>
);
