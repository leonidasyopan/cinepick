
import React from 'react';

export const ImdbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 22"
    fill="currentColor"
    className={className}
    role="img"
    aria-label="IMDb logo"
  >
    <rect width="100%" height="100%" rx="4" fill="#f5c518" />
    <path fill="#000000" d="M6,5h4v12H6V5z M13.5,5H15l3.5,6l3.5-6H24v12h-3V8.5l-2,4L17,17h-0.5l-2-4.5V17h-3V5z M29,5h5.5c2,0,3.5,1.5,3.5,3.5S36.5,12,34.5,12H32v5h-3V5z M32,9h2c0.5,0,1-0.5,1-1s-0.5-1-1-1h-2V9z" />
  </svg>
);
