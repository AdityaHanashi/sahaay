"use client";

import React from 'react';
import { useVoice } from '@/context/VoiceContext';
import { Icon } from '@iconify/react';

export default function VoiceWidget() {
  const { isCalling, showIdlePrompt, dismissIdlePrompt, startCall } = useVoice();

  if (isCalling) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center justify-end gap-3 pointer-events-none">
      
      {/* Expanded Idle Prompt */}
      {showIdlePrompt && (
        <div className="bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 rounded-2xl p-4 flex items-center gap-4 animate-slide-in-right pointer-events-auto">
          <div>
            <h4 className="text-white font-bold mb-0.5">Need help?</h4>
            <p className="text-slate-400 text-xs">Sahaay Assistant is here...</p>
          </div>
          <button 
            onClick={dismissIdlePrompt}
            className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 transition-colors"
          >
            <Icon icon="lucide:x" className="text-xs" />
          </button>
        </div>
      )}

      {/* Persistent Floating Circle */}
      <button 
        onClick={() => startCall(false)}
        className="relative w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-110 pointer-events-auto group"
      >
        <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-20"></div>
        <Icon icon="lucide:mic" className="text-2xl group-hover:scale-110 transition-transform" />
      </button>
      
    </div>
  );
}
