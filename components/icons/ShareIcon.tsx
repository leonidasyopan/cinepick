import React from 'react';

export const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 7a3 3 0 10-2.977-2.63l-2.94 1.47a3 3 0 100 4.319l2.94 1.47a3 3 0 10.895-1.789l-2.94-1.47a3.03 3.03 0 000-.74l2.94-1.47C10.456 6.68 11.19 7 12 7zm0-2a1 1 0 100-2 1 1 0 000 2zm0 8a1 1 0 100-2 1 1 0 000 2zM5 8a1 1 0 11-2 0 1 1 0 012 0z"
    />
  </svg>
);
