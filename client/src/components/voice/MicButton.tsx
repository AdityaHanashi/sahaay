import React from 'react';
import { Icon } from '@iconify/react';
import { useVoice } from '@/context/VoiceContext';

export default function MicButton() {
  const { callState, startRecording, stopRecording, endCall } = useVoice();

  const isRecording = callState === 'recording';
  const isProcessing = callState === 'processing';
  const isResponse = callState === 'response';

  const handleClick = () => {
    if (callState === 'idle' || callState === 'response') {
      startRecording();
    } else if (callState === 'recording') {
      stopRecording();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center relative w-full">
        <div className="relative">
          {/* Glow effect */}
          {isRecording && (
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse scale-150"></div>
          )}
          
          <button 
            onClick={handleClick}
            disabled={isProcessing}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_40px_rgba(79,70,229,0.3)]
              ${isRecording ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-[0_0_60px_rgba(239,68,68,0.5)]' : 
                isProcessing ? 'bg-indigo-900 cursor-not-allowed opacity-80' : 
                isResponse ? 'bg-indigo-600 hover:bg-indigo-500' :
                'bg-slate-800 hover:bg-slate-700 border border-slate-600'
              }
            `}
          >
            {isProcessing ? (
              <Icon icon="lucide:loader-2" className="text-4xl text-white animate-spin" />
            ) : isRecording ? (
              <Icon icon="lucide:square" className="text-3xl text-white" />
            ) : (
              <Icon icon="lucide:mic" className="text-4xl text-white" />
            )}
          </button>
        </div>

      <div className="mt-8 text-center text-slate-300 font-medium tracking-wide">
        {callState === 'idle' && "Tap to speak"}
        {callState === 'recording' && "Listening..."}
        {callState === 'processing' && "Thinking..."}
        {callState === 'response' && "Assistant is speaking..."}
      </div>

      {/* Prominent End Call Button */}
      <button 
        onClick={endCall}
        className="mt-8 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center gap-3 text-red-500 transition-all shadow-lg hover:shadow-red-500/20 group"
        title="End Call"
      >
        <Icon icon="lucide:phone-off" className="text-xl group-hover:scale-110 transition-transform" />
        <span className="font-bold text-xs tracking-[0.2em] uppercase">End Call</span>
      </button>

    </div>
  );
}
