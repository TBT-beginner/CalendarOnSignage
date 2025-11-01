import React from 'react';

const PaletteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24"
    height="24"
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10c0 .928-.128 1.828-.369 2.684" />
    <path d="M18.5 3A3.5 3.5 0 0 0 15 6.5c0 .9.362 1.728.946 2.316" />
    <path d="M9.5 3A3.5 3.5 0 0 0 6 6.5c0 .9.362 1.728.946 2.316" />
    <path d="M18 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" />
  </svg>
);

export default PaletteIcon;