import React from 'react';
import { useVoice } from '@/context/VoiceContext';

export default function LanguageSelector() {
  const { selectLanguage } = useVoice();

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in-up w-full">
      <h2 className="text-lg md:text-xl font-bold text-white mb-6 text-center">Choose your preferred language</h2>
      <div className="flex flex-col gap-3 w-full px-4">
        <button 
          onClick={() => selectLanguage('English')}
          className="bg-slate-800/50 hover:bg-indigo-600/50 border border-slate-700 hover:border-indigo-500 transition-all py-4 px-6 rounded-2xl text-white font-bold tracking-wide"
        >
          English
        </button>
        <button 
          onClick={() => selectLanguage('Hindi')}
          className="bg-slate-800/50 hover:bg-indigo-600/50 border border-slate-700 hover:border-indigo-500 transition-all py-4 px-6 rounded-2xl text-white font-bold tracking-wide"
        >
          Hindi / हिंदी
        </button>
        <button 
          onClick={() => selectLanguage('Tamil')}
          className="bg-slate-800/50 hover:bg-indigo-600/50 border border-slate-700 hover:border-indigo-500 transition-all py-4 px-6 rounded-2xl text-white font-bold tracking-wide"
        >
          Tamil / தமிழ்
        </button>
        <button 
          onClick={() => selectLanguage('Kannada')}
          className="bg-slate-800/50 hover:bg-indigo-600/50 border border-slate-700 hover:border-indigo-500 transition-all py-4 px-6 rounded-2xl text-white font-bold tracking-wide"
        >
          Kannada / ಕನ್ನಡ
        </button>
      </div>
    </div>
  );
}
