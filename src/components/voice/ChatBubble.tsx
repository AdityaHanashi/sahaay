import React, { useEffect, useRef } from 'react';
import { useVoice, Message } from '@/context/VoiceContext';

export default function ChatBubble() {
  const { messages } = useVoice();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 px-4 flex flex-col gap-4 max-h-[40vh] overflow-y-auto no-scrollbar pb-10">
      {messages.map((msg, idx) => (
        <div 
          key={idx} 
          className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
        >
          <div 
            className={`max-w-[80%] p-4 rounded-3xl ${
              msg.role === 'user' 
                ? 'bg-slate-700/80 text-white rounded-br-sm' 
                : 'bg-indigo-600/20 text-indigo-100 border border-indigo-500/30 rounded-bl-sm backdrop-blur-md'
            }`}
          >
            <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
