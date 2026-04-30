"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useVoice } from "@/context/VoiceContext";

export default function VoiceAssistant() {
  const { isCalling, callState, startCall, endCall } = useVoice();
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);

  useEffect(() => {
    if (hasAutoTriggered) return;

    const timeout = setTimeout(() => {
      startCall(true);
      setHasAutoTriggered(true);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [hasAutoTriggered, startCall]);

  if (!isCalling) return null;

  // We return null here to hide the custom visual UI, 
  // allowing the native Retell WebCall widget to handle the interface.
  return null;
}
