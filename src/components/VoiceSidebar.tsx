"use client";

import React, { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useVoice } from "@/context/VoiceContext";

export default function VoiceSidebar() {
  const { isCalling, messages, callState, endCall } = useVoice();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isCalling) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-[1000] flex flex-col border-l border-slate-200 animate-slide-in-right">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <Icon icon="lucide:mic" className="text-xl" />
          </div>
          <div>
            <h3 className="font-bold tracking-tight">AI Voice Assistant</h3>
            <p className="text-xs opacity-80 uppercase font-black tracking-widest">Live Conversation</p>
          </div>
        </div>
        <button onClick={endCall} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Icon icon="lucide:x" className="text-2xl" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-fade-in-up`}
          >
            <div className={`flex items-center gap-2 mb-1 px-1`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {msg.role === "ai" ? "Assistant" : "You"}
                </span>
            </div>
            <div 
              className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                msg.role === "user" 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {callState === "processing" && (
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs animate-pulse">
                <Icon icon="lucide:loader-2" className="animate-spin text-lg" />
                Processing your request...
            </div>
        )}
      </div>

      {/* Footer / Controls */}
      <div className="p-6 bg-white border-t border-slate-100">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Status: {callState === "listening" ? "Listening..." : "Connected"}</span>
            <div className="flex gap-1">
                {[1,2,3].map(i => (
                    <div key={i} className={`w-1 h-3 bg-indigo-400 rounded-full animate-bounce`} style={{animationDelay: `${i * 0.1}s`}}></div>
                ))}
            </div>
          </div>
          <button 
            onClick={endCall}
            className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <Icon icon="lucide:phone-off" className="text-xl" />
            END CONVERSATION
          </button>
        </div>
      </div>
    </div>
  );
}
