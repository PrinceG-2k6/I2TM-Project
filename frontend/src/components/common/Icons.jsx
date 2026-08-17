import React from 'react';

export const BrandLogo = ({ size = 28 }) => (
  <img 
    src="/logo.jpeg" 
    alt="Brand Logo" 
    style={{ width: size, height: size, objectFit: 'contain', borderRadius: '4px' }} 
  />
);

export const StarSparkle = ({ size = 18, color = "#FAD7BD" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" 
      fill={color} 
    />
  </svg>
);
