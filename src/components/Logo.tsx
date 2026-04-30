import React from 'react';

export default function Logo({ className = "w-10 h-10", withText = true }: { className?: string, withText?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* The Shield/User/Lock Icon */}
      <div className="relative w-full h-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-600 p-2 rounded-2xl shadow-lg transition-transform hover:scale-105 duration-300">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.1)"/>
          <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
          <path d="M16 16.5c0-1.5-1.5-3.5-4-3.5s-4 2-4 3.5V18h8v-1.5z" fill="currentColor"/>
          <rect x="10" y="14" width="4" height="5" rx="1" fill="#fff" stroke="currentColor" strokeWidth="1"/>
          <path d="M12 16v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      
      {/* Text Part */}
      {withText && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-950 to-purple-800 text-transparent bg-clip-text tracking-tight leading-none">
            Sahaay
          </span>
          <div className="flex items-center gap-1 mt-1">
            <div className="h-[1px] w-6 bg-indigo-200"></div>
            <span className="text-[0.55rem] font-bold text-indigo-800 tracking-widest uppercase leading-none">
              Safe. Secure. Support.
            </span>
            <div className="h-[1px] w-6 bg-indigo-200"></div>
          </div>
        </div>
      )}
    </div>
  );
}
