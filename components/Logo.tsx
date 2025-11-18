
import React from 'react';

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = React.memo((props) => (
  <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
    <defs>
      <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
    </defs>
    
    {/* Abstract Mortarboard Base */}
    <path d="M20 8L4 16L20 24L36 16L20 8Z" fill="url(#logo-grad)" />
    <path d="M36 16V26C36 26 32 28 20 28" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Central 'Brain/Circuit' Node */}
    <circle cx="20" cy="16" r="3" fill="#FFF" fillOpacity="0.9" />
    <path d="M20 16V24" stroke="#FFF" strokeWidth="1.5" strokeOpacity="0.5" />
    
    {/* Tassel / Data Stream */}
    <path d="M32 14V22" stroke="url(#logo-grad)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    <circle cx="32" cy="24" r="1.5" fill="url(#logo-grad)" />
  </svg>
));
