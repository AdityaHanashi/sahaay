"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function LandingPage() {
  const router = useRouter();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Logo appears
    const t1 = setTimeout(() => setStage(1), 300);
    // Stage 2: Logo expands, text appears
    const t2 = setTimeout(() => setStage(2), 1200);
    // Stage 3: Secondary text appears
    const t3 = setTimeout(() => setStage(3), 2000);
    // Redirect
    const t4 = setTimeout(() => {
      setStage(4); // fade out
      setTimeout(() => router.push("/home"), 600);
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [router]);

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white overflow-hidden transition-opacity duration-700 ${stage === 4 ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        
        {/* Logo Container */}
        <div className={`transition-all duration-1000 ease-out flex items-center justify-center
          ${stage === 0 ? 'scale-0 opacity-0 blur-md translate-y-10' : ''}
          ${stage >= 1 ? 'scale-100 opacity-100 blur-0 translate-y-0' : ''}
        `}>
          <div className="relative">
            {/* The glow effect behind logo */}
            <div className={`absolute inset-0 bg-white/20 blur-xl rounded-full transition-opacity duration-1000 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`}></div>
            <Logo className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl relative z-10" withText={false} />
          </div>
        </div>

        {/* Text Reveal */}
        <div className="flex flex-col items-center overflow-hidden">
          <h1 className={`text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-purple-200 text-transparent bg-clip-text transition-all duration-1000 ease-[cubic-bezier(0.2,1,0.2,1)]
            ${stage < 2 ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
          `}>
            Sahaay
          </h1>
          
          <div className="overflow-hidden mt-3">
            <p className={`text-indigo-200 text-lg md:text-xl font-medium tracking-widest uppercase transition-all duration-700 delay-300 ease-out
              ${stage < 3 ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
            `}>
              Safe. Secure. Support.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
