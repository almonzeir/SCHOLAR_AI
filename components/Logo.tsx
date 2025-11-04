import React from 'react';

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 75" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <radialGradient id="orange-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style={{ stopColor: '#ffc876', stopOpacity: 1 }} />
        <stop offset="60%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#c2410c', stopOpacity: 1 }} />
      </radialGradient>
    </defs>

    {/* Tassel */}
    <line x1="85" y1="25" x2="85" y2="45" stroke="#111827" strokeWidth="2" />
    <path d="M 82 45 Q 85 50 88 45 Q 85 52 82 45" fill="#111827" />

    {/* Cap body */}
    <path d="M 15 40 L 50 65 L 85 40 L 50 50 Z" fill="#111827" />

    {/* Mortarboard */}
    <path d="M 50 10 L 95 25 L 50 40 L 5 25 Z" fill="#000" />

    {/* More detailed circuit board pattern with glow */}
    <g fill="none" stroke="url(#orange-glow)" strokeWidth="1.5" strokeLinecap="round" filter="url(#glow)">
        {/* Centerpiece */}
        <path d="M 50 15 v 5" />
        <path d="M 50 35 v -5" />
        
        {/* Main branches from center */}
        <path d="M 50 20 c -7 0 -8 4 -15 4" />
        <path d="M 50 20 c 7 0 8 4 15 4" />
        <path d="M 50 30 c -7 0 -8 -4 -15 -4" />
        <path d="M 50 30 c 7 0 8 -4 15 -4" />

        {/* Left side branches */}
        <path d="M 35 24 c -5 0 -6 -3 -10 -3" />
        <path d="M 35 26 c -5 0 -6 3 -10 3" />
        <path d="M 25 21 v -3" />
        <path d="M 25 29 v 3" />
        <path d="M 20 23 h -5" />

        {/* Right side branches */}
        <path d="M 65 24 c 5 0 6 -3 10 -3" />
        <path d="M 65 26 c 5 0 6 3 10 3" />
        <path d="M 75 21 v -3" />
        <path d="M 75 29 v 3" />
        <path d="M 80 23 h 5" />

        {/* Inner details */}
        <path d="M 40 25.5 c -2 0 -3 2 -3 4" />
        <path d="M 60 25.5 c 2 0 3 2 3 4" />

        {/* Nodes (circles) */}
        <circle cx="50" cy="15" r="1.5" stroke="none" fill="url(#orange-glow)" />
        <circle cx="50" cy="20" r="1" stroke="none" fill="url(#orange-glow)" />
        <circle cx="50" cy="30" r="1" stroke="none" fill="url(#orange-glow)" />
        <circle cx="50" cy="35" r="1.5" stroke="none" fill="url(#orange-glow)" />
        <circle cx="35" cy="24" r="1" stroke="none" fill="url(#orange-glow)" />
        <circle cx="65" cy="24" r="1" stroke="none" fill="url(#orange-glow)" />
        <circle cx="35" cy="26" r="1" stroke="none" fill="url(#orange-glow)" />
        <circle cx="65" cy="26" r="1" stroke="none" fill="url(#orange-glow)" />
        <circle cx="25" cy="21" r="1" stroke="none" fill="url(#orange-glow)" />
        <circle cx="75" cy="21" r="1" stroke="none" fill="url(#orange-glow)" />
        <circle cx="25" cy="29" r="1" stroke="none" fill="url(#orange-glow)" />
        <circle cx="75" cy="29" r="1" stroke="none" fill="url(#orange-glow)" />
    </g>
  </svg>
);
