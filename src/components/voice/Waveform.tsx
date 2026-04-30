import React from 'react';
import { useVoice } from '@/context/VoiceContext';

export default function Waveform() {
  const { callState } = useVoice();
  
  if (callState !== 'recording') return null;

  return (
    <div className="flex items-center justify-center gap-1.5 h-16 mt-4">
      {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
        <div 
          key={bar}
          className="w-1.5 bg-indigo-500 rounded-full animate-wave"
          style={{ 
            animationDelay: `${bar * 0.1}s`,
            height: '20%' // Base height, animation will scale it
          }}
        ></div>
      ))}
    </div>
  );
}
