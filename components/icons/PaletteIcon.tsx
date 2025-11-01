
import React from 'react';

const PaletteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
    <circle cx="10.5" cy="17.5" r=".5" fill="currentColor"></circle>
    <circle cx="6.5" cy="13.5" r=".5" fill="currentColor"></circle>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.668 0-.475-.19-.895-.485-1.172l-.995-.995c-.29-.29-.61-.485-.995-.485h-1.33c-.385 0-.705-.19-.995-.485l-.995-.995c-.29-.29-.485-.61-.485-.995v-1.33c0-.385.19-.705.485-.995l.995-.995c.29-.29.61-.485.995-.485h1.33c.385 0 .705.19.995.485l.995.995c.29.29.485.61.485.995v1.33c0 .385-.19.705-.485.995l-.995.995c-.29-.29-.61-.485-.995-.485h-1.33c-.385 0-.705-.19-.995-.485l-.995-.995c-.29-.29-.485-.61-.485-.995V12c0-3.31 2.69-6 6-6s6 2.69 6 6c0 2.21-1.2 4.16-3 5.19"></path>
  </svg>
);

export default PaletteIcon;
