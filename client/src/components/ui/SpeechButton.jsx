import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { speakSTEMContent, stopSpeech, isSpeechSupported } from '../../services/speechService';

export const SpeechButton = ({ 
  text, 
  size = 'sm', 
  label = 'Read aloud',
  className = '' 
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const supported = isSpeechSupported();

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  if (!supported) return null;

  const handleToggleSpeech = (e) => {
    e.stopPropagation();

    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakSTEMContent(text, {
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleSpeech}
      aria-label={isSpeaking ? `Stop reading aloud` : label}
      aria-pressed={isSpeaking}
      title={isSpeaking ? 'Stop reading' : label}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
        isSpeaking
          ? 'bg-indigo-600 text-white shadow-glow-primary animate-pulse'
          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
      } ${className}`}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-3.5 h-3.5 shrink-0" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-cyan-400" />
          <span>Listen</span>
        </>
      )}
    </button>
  );
};
