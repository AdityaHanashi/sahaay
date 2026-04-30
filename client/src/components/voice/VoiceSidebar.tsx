"use client";

import React, { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useVoice } from "@/context/VoiceContext";
import LanguageSelector from "./LanguageSelector";
import MicButton from "./MicButton";
import Waveform from "./Waveform";
import ChatBubble from "./ChatBubble";

export default function VoiceSidebar() {
  const { isCalling, callState, endCall, errorMsg, messages } = useVoice();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic for the sidebar container
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, callState]);

  if (!isCalling) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-slate-950/60 backdrop-blur-2xl shadow-2xl z-[1000] flex flex-col border-l border-white/20 animate-slide-in-right overflow-hidden">
      {/* Revolving Background Gradient */}
      <div className="absolute -inset-[100%] opacity-30 blur-[80px] pointer-events-none animate-[spin_20s_linear_infinite] bg-[conic-gradient(from_0deg,#312e81,#581c87,#312e81)]" />
      
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Icon icon="lucide:bot" className="text-indigo-400 text-lg" />
            </div>
            <div>
              <h3 className="font-bold tracking-tight text-white">Sahaay Assistant</h3>
              <p className="text-[10px] opacity-70 uppercase font-black tracking-widest text-indigo-300">
                {callState === 'recording' ? 'Listening...' : 'Live Chat'}
              </p>
            </div>
          </div>
          <button onClick={endCall} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400">
            <Icon icon="lucide:x" className="text-xl" />
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="m-4 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm animate-fade-in-up flex items-center">
            <Icon icon="lucide:alert-triangle" className="mr-2 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Area: Scrollable Chat and Language Selection */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto no-scrollbar flex flex-col p-4"
        >
          <div className="flex-1 flex flex-col justify-end min-h-full">
             <ChatBubble />
             
             {callState === 'language_selection' && (
               <div className="mt-8 animate-fade-in-up">
                 <LanguageSelector />
               </div>
             )}
          </div>
        </div>

        {/* Footer: Mic Controls */}
        {callState !== 'language_selection' && (
          <div className="p-6 bg-slate-950/80 backdrop-blur-md border-t border-white/10 flex flex-col items-center shrink-0">
            <Waveform />
            <div className="mt-4 w-full">
              <MicButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
