"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface AiData {
  issueTitle: string;
  description: string;
  department: string;
}

export interface Message {
  role: "ai" | "user";
  content: string;
  timestamp?: string;
}

interface VoiceContextType {
  aiData: AiData | null;
  setAiData: (data: AiData | null) => void;
  isCalling: boolean;
  callState: "idle" | "recording" | "processing" | "response" | "language_selection";
  messages: Message[];
  language: string;
  startCall: (isAutoTrigger?: boolean) => void;
  endCall: () => void;
  selectLanguage: (lang: string) => void;
  startRecording: () => void;
  stopRecording: () => void;
  errorMsg: string | null;
  showIdlePrompt: boolean;
  dismissIdlePrompt: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [aiData, setAiData] = useState<AiData | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callState, setCallState] = useState<"idle" | "recording" | "processing" | "response" | "language_selection">("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showIdlePrompt, setShowIdlePrompt] = useState(false);
  const recognitionRef = useRef<any>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoOpenTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Idle Timer Logic
  useEffect(() => {
    const resetTimer = () => {
      if (isCalling) return; // Don't trigger if already in call
      setShowIdlePrompt(false);
      
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);

      idleTimerRef.current = setTimeout(() => {
        if (!isCalling && !sessionStorage.getItem("sahaay_voice_dismissed")) {
          setShowIdlePrompt(true);
          
          autoOpenTimerRef.current = setTimeout(() => {
            setShowIdlePrompt(false);
            startCall(true);
          }, 2000);
        }
      }, 10000); // 10 seconds
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("scroll", resetTimer);

    resetTimer(); // Init

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keypress", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);
    };
  }, [isCalling]);

  // Pre-load voices to ensure they are available when speak() is called
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.getVoices();
    }
  }, []);

  const callStateRef = useRef(callState);
  const isProcessingRef = useRef(false);
  const isCompletedRef = useRef(false);

  useEffect(() => {
    callStateRef.current = callState;
    if (callState !== 'processing') {
       isProcessingRef.current = false;
    }
  }, [callState]);

  // Create a ref for the latest handleUserTranscript to avoid stale closures
  const handleUserTranscriptRef = useRef<any>(null);
  
  // Update the ref on every render
  useEffect(() => {
    handleUserTranscriptRef.current = handleUserTranscript;
  });

  // Initialize SpeechRecognition (Run ONLY once)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition && !recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = async (event: any) => {
          isProcessingRef.current = true;
          const transcript = event.results[0][0].transcript;
          if (handleUserTranscriptRef.current) {
            handleUserTranscriptRef.current(transcript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          if (event.error === 'not-allowed') {
             setErrorMsg("Please allow microphone access to use the voice assistant.");
          } else if (event.error === 'no-speech') {
             setErrorMsg("I didn't catch that. Please ensure you are speaking loud and clear in the selected language.");
             setTimeout(() => setErrorMsg(null), 6000);
          } else if (event.error === 'network') {
             setErrorMsg("Network error with speech recognition. Please check your connection.");
             setTimeout(() => setErrorMsg(null), 6000);
          }
          
          if (callStateRef.current === 'recording') {
            setCallState("idle");
          }
        };

        recognitionRef.current.onend = () => {
           if (callStateRef.current === 'recording' && !isProcessingRef.current) {
             // If it ended automatically without result, go back to idle
             setCallState("idle");
           }
        };
      }
    }
  }, []); // Empty dependency array so it only initializes once

  // Update language for recognition
  useEffect(() => {
    if (recognitionRef.current && language) {
       if (language === 'Hindi') recognitionRef.current.lang = 'hi-IN';
       else if (language === 'Tamil') recognitionRef.current.lang = 'ta-IN';
       else if (language === 'Kannada') recognitionRef.current.lang = 'kn-IN';
       else recognitionRef.current.lang = 'en-US';
    }
  }, [language]);

  const startCall = (isAutoTrigger = false) => {
    if (isCalling) return;
    
    // Ensure idle timer doesn't trigger again in this session
    sessionStorage.setItem("sahaay_voice_dismissed", "true");
    
    setIsCalling(true);
    setErrorMsg(null);
    isCompletedRef.current = false;
    if (!language) {
      setCallState("language_selection");
      const msg = "Hello, I am Sahaay. Please choose your language.";
      setMessages([{ role: "ai", content: msg, timestamp: new Date().toISOString() }]);
      speak(msg, false);
    } else {
      setCallState("idle");
    }
  };

  const endCall = async () => {
    setIsCalling(false);
    setCallState("idle");
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    window.speechSynthesis.cancel();
    
    // Save to database if cancelled manually and the user had already started speaking
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length > 0 && !isCompletedRef.current) {
      try {
        const transcript = userMessages.map(m => m.content).join('\n');
        const fallbackId = Math.floor(1000 + Math.random() * 9000).toString();
        await addDoc(collection(db, "complaints"), {
          complaintId: "CANC-" + fallbackId,
          issueTitle: "Abandoned Voice Report",
          area: "Unknown Area",
          status: "Rejected",
          description: "User cancelled the call before finishing. Partial Transcript:\n" + transcript,
          createdAt: serverTimestamp(),
          source: "Voice Assistant (Cancelled)",
          language: language || "Unknown"
        });
        console.log("Abandoned call saved to Firebase");
      } catch (err) {
        console.error("Failed to save abandoned call", err);
      }
    }
    
    // Fully wipe the session memory so the next call starts completely fresh
    setLanguage("");
    setMessages([]);
  };

  const selectLanguage = (lang: string) => {
    setLanguage(lang);
    setCallState("idle");
    
    // Play language confirmation and start flow
    let msg = "You are safe. You can stay anonymous. Please tell me your problem.";
    if (lang === 'Hindi') msg = "आप सुरक्षित हैं। आप अनाम रह सकते हैं। कृपया मुझे अपनी समस्या बताएं।";
    else if (lang === 'Tamil') msg = "நீங்கள் பாதுகாப்பாக உள்ளீர்கள். நீங்கள் அநாமதேயமாக இருக்கலாம். தயவுசெய்து உங்கள் பிரச்சினையை சொல்லுங்கள்.";
    else if (lang === 'Kannada') msg = "ನೀವು ಸುರಕ್ಷಿತವಾಗಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ತಿಳಿಸಿ.";
    
    setMessages(prev => [...prev, { role: "ai", content: msg, timestamp: new Date().toISOString() }]);
    setCallState("response");
    speak(msg, true); // true = autoListen after speaking
  };

  const startRecording = async () => {
    setErrorMsg(null);
    try {
      // Check permissions
      await navigator.mediaDevices.getUserMedia({ audio: true });
      window.speechSynthesis.cancel(); // Stop any ongoing AI speech
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setCallState("recording");
      } else {
        setErrorMsg("Speech recognition is not supported in your browser.");
      }
    } catch (err) {
      console.error("Mic access denied", err);
      setErrorMsg("Please allow microphone access to use the voice assistant.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && callState === 'recording') {
      recognitionRef.current.stop();
      // Do not set callState here. onresult will set it to "processing" if there is speech,
      // and onend will set it to "idle" if there is no speech.
    }
  };

  const handleUserTranscript = async (transcript: string) => {
    const newMessages = [...messages, { role: "user" as const, content: transcript, timestamp: new Date().toISOString() }];
    setMessages(newMessages);
    setCallState("processing");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const res = await fetch("/api/voice-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, language }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await res.json();
      if (data.reply) {
        const aiMessage = { role: "ai" as const, content: data.reply, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, aiMessage]);
        setCallState("response");
        
        // Save to Firebase if the conversation is ending and we have report data
        if (data.isEnd && data.reportData) {
          try {
            isCompletedRef.current = true;
            await addDoc(collection(db, "complaints"), {
              complaintId: data.reportData.id,
              issueTitle: data.reportData.summary,
              area: data.reportData.area || "Unknown Area",
              department: data.reportData.department || "General",
              userName: data.reportData.name || "Anonymous",
              status: "Submitted",
              description: "Voice Report Transcript:\n" + data.reportData.transcript,
              createdAt: serverTimestamp(),
              source: "Voice Assistant",
              language: language
            });
            console.log("Voice report saved to Firebase successfully");
          } catch (firebaseErr) {
            console.error("Error saving to Firebase:", firebaseErr);
          }
        }

        // If data.isEnd is true, do not auto-listen, and pass isFinal = true to auto-close
        speak(data.reply, !data.isEnd, data.isEnd);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("No reply from AI.");
      }
    } catch (err) {
      console.error("Failed to fetch AI response", err);
      setErrorMsg("Network error. Please try again.");
      setCallState("idle");
    }
  };

  const speak = (text: string, autoListen = false, isFinal = false) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      let langCode = 'en-US';
      if (language === 'Hindi') langCode = 'hi-IN';
      else if (language === 'Tamil') langCode = 'ta-IN';
      else if (language === 'Kannada') langCode = 'kn-IN';
      
      utterance.lang = langCode;

      // Select female voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        let selectedVoice = voices.find(voice => voice.lang.includes(langCode) && (voice.name.toLowerCase().includes('google') || voice.name.toLowerCase().includes('female')));
        if (!selectedVoice) {
           selectedVoice = voices.find(voice => voice.lang.includes(langCode));
        }
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onend = () => {
        if (autoListen) {
           startRecording();
        } else if (isFinal) {
           endCall();
        } else {
           setCallState(prev => prev === 'language_selection' ? 'language_selection' : 'idle');
        }
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        if (autoListen) startRecording();
        else setCallState(prev => prev === 'language_selection' ? 'language_selection' : 'idle');
      }, 2000);
    }
  };

  const dismissIdlePrompt = () => {
    setShowIdlePrompt(false);
    sessionStorage.setItem("sahaay_voice_dismissed", "true");
    if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);
  };

  return (
    <VoiceContext.Provider value={{ 
      aiData, setAiData, isCalling, callState, messages, language, 
      startCall, endCall, selectLanguage, startRecording, stopRecording, errorMsg,
      showIdlePrompt, dismissIdlePrompt
    }}>
      {children}
    </VoiceContext.Provider>
  );
}

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) throw new Error("useVoice must be used within a VoiceProvider");
  return context;
};

