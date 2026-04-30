"use client";

import React from "react";
import { useVoice } from "@/context/VoiceContext";

interface VoiceTriggerButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function VoiceTriggerButton({ children, className }: VoiceTriggerButtonProps) {
  const { startCall, isCalling } = useVoice();

  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        startCall();
      }}
      disabled={isCalling}
      className={`${className || ""} ${isCalling ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}
