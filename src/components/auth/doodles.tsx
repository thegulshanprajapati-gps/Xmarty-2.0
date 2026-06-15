"use client";

import React from 'react';

export function LearningDoodles({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="bgGrad" x1="0" x2="1">
          <stop offset="0%" stopColor="hsl(var(--primary) / 0.06)" />
          <stop offset="100%" stopColor="hsl(var(--accent) / 0.04)" />
        </linearGradient>
      </defs>

      <rect width="100%" height="100%" fill="url(#bgGrad)" />

      <g stroke="hsl(var(--primary))" strokeWidth="1.6" fill="none" opacity="0.14">
        <g transform="translate(80,80) scale(1)">
          <path d="M10 80 q40 -60 80 0" strokeLinecap="round" />
          <circle cx="60" cy="30" r="14" />
        </g>
        <g transform="translate(180,160) scale(1)">
          <rect x="0" y="0" width="38" height="26" rx="3" />
          <path d="M0 6 h38" />
        </g>
        <g transform="translate(340,40) scale(1)">
          <path d="M0 0 l24 16 l-24 16 z" />
        </g>
        <g transform="translate(520,120) scale(1)">
          <path d="M10 10 c20 -10 40 -10 60 0" />
          <circle cx="25" cy="10" r="4" />
        </g>
        <g transform="translate(420,320) scale(1)">
          <rect x="0" y="0" width="64" height="42" rx="6" />
          <path d="M8 14 v14" />
          <path d="M56 14 v14" />
        </g>
        <g transform="translate(110,320) scale(1)">
          <path d="M0 24 q12 -20 24 0 q12 -20 24 0" />
        </g>
      </g>

      <g stroke="hsl(var(--primary))" strokeWidth="1.2" fill="none" opacity="0.06">
        <path d="M700 10 q-40 60 -80 20 q-40 -40 -80 20" />
        <circle cx="720" cy="80" r="18" />
      </g>
    </svg>
  );
}

export default LearningDoodles;
