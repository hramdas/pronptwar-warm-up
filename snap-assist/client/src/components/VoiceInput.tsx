import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, X, ChevronRight } from 'lucide-react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceInputProps {
  onCapture: (text: string) => void;
  onCancel: () => void;
}

export default function VoiceInput({ onCapture, onCancel }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Your browser does not support Voice Input. Please try Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          setTranscript(prev => prev + ' ' + event.results[i][0].transcript);
        }
      }
      if (finalTranscript) {
        setTranscript(prev => (prev + ' ' + finalTranscript).trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        setError(`Error: ${event.error}`);
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;
    return () => recognitionRef.current?.stop();
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setError(null);
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-end pb-12 p-6"
    >
       
      <button 
        onClick={onCancel}
        className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5 backdrop-blur-md"
      >
        <X className="w-6 h-6" />
      </button>

      {error ? (
        <div className="text-danger p-6 glass-card text-center mb-auto mt-auto w-full max-w-sm border-danger/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <p className="font-medium">{error}</p>
        </div>
      ) : (
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center w-full max-w-md gap-12 relative mt-20"
        >
            
            <div className="relative flex items-center justify-center group">
              {isRecording && (
                <div className="absolute inset-[-40px] rounded-full bg-danger/20 filter blur-[40px] animate-pulse-glow pointer-events-none"></div>
              )}
              
              <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-700 glass border-2 z-10
                ${isRecording ? 'shadow-[0_0_60px_rgba(239,68,68,0.6)] border-danger/50 bg-danger/10' : 'border-white/10 hover:border-white/30 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]'}`}
              >
                 <button 
                    onClick={toggleRecording}
                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95
                      ${isRecording ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-[0_10px_30px_rgba(239,68,68,0.5)]' : 'bg-surface text-gray-300 hover:text-white border border-white/5'}`}
                  >
                    <Mic className="w-12 h-12" />
                  </button>
              </div>
            </div>
            
            <p className="text-white text-lg font-display font-medium h-8 tracking-wide animate-pulse">
              {isRecording ? "Listening to your request..." : "Tap to start recording"}
            </p>

            <div className="w-full h-48 glass-card bg-black/40 border-t-2 border-t-white/10 p-6 overflow-y-auto text-left flex flex-col relative rounded-3xl">
               {transcript ? (
                 <p className="text-white text-xl leading-relaxed font-medium">{transcript}</p>
               ) : (
                 <div className="m-auto text-center opacity-40">
                   <p className="text-xl italic font-display">Waiting for audio...</p>
                 </div>
               )}
            </div>

            <button 
              onClick={() => transcript.trim() && onCapture(transcript.trim())}
              disabled={!transcript.trim() || isRecording}
              className="w-full py-5 text-white rounded-[2rem] font-display font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 group"
              style={{
                background: (!transcript.trim() || isRecording) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: (!transcript.trim() || isRecording) ? 'none' : '0 15px 30px rgba(16,185,129,0.3)'
              }}
            >
              Analyze Audio <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
        </motion.div>
      )}
    </motion.div>
  );
}
