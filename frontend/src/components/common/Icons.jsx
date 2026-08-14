import React from 'react';

// Geometric Brand Mark inspired by the Stanza references (connected traffic flow / node curve)
export const BrandLogo = ({ size = 28, color = "#F97316" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 28C12 19.1634 19.1634 12 28 12V6C15.8497 6 6 15.8497 6 28H12Z" 
      fill={color} 
    />
    <path 
      d="M20 28C20 23.5817 23.5817 20 28 20V15C20.8203 15 15 20.8203 15 28H20Z" 
      fill={color} 
      fillOpacity="0.8"
    />
    <circle cx="28" cy="28" r="4" fill={color} />
  </svg>
);

export const StarSparkle = ({ size = 18, color = "#FAD7BD" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" 
      fill={color} 
    />
  </svg>
);
