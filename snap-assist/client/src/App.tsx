import { useState } from 'react';
import { Camera, Mic, UploadCloud, Type, AlertCircle, X, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraInput from './components/CameraInput';
import VoiceInput from './components/VoiceInput';
import TextInput from './components/TextInput';
import UploadInput from './components/UploadInput';

type InputModal = 'camera' | 'voice' | 'upload' | 'text' | null;

interface AnalysisResult {
  priorityBadge: string;
  priorityBadgeColor: 'red' | 'yellow' | 'blue';
  title: string;
  summary: string;
  actionSteps: { title: string; detail: string }[];
  quickAction: { label: string; intent: string };
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'HOME' | 'PROCESSING' | 'RESULT'>('HOME');
  const [activeModal, setActiveModal] = useState<InputModal>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (data: string, type: 'text' | 'image' | 'voice' | 'upload') => {
    setActiveModal(null);
    setActiveScreen('PROCESSING');
    setError(null);

    try {
      const payload: any = { type };
      
      if (type === 'text' || type === 'voice') {
        payload.text = data;
      } else if (type === 'image' || type === 'upload') {
        payload.imageBase64 = data;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Analysis failed or server unavailable');
      }

      const parsedResult: AnalysisResult = await res.json();
      setResult(parsedResult);
      setActiveScreen('RESULT');
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
      setActiveScreen('HOME');
    }
  };

  const getBadgeColorClass = (color: string) => {
    switch(color) {
      case 'red': return 'bg-danger/10 text-danger border-danger/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'yellow': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]';
      case 'blue': return 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
      default: return 'bg-gray-500/10 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative flex flex-col justify-center p-6 h-full flex-1">
      
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-primary/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-accent/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-72 h-72 bg-secondary/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-10">
        <div className="max-w-md mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight text-white">
              SnapAssist
            </h1>
          </div>
          
          {activeScreen !== 'HOME' && (
            <button 
              onClick={() => {
                setActiveScreen('HOME');
                setResult(null);
              }}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors bg-white/5 py-2 px-4 rounded-full border border-white/10"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="w-full flex-1 flex flex-col justify-center relative z-10 pt-20 pb-10">
        
        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-0 left-0 right-0 bg-danger/20 text-white p-4 rounded-2xl border border-danger/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] z-40 text-sm flex items-start gap-3 backdrop-blur-xl"
            >
              <AlertCircle className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
              <div className="flex-1 font-medium">{error}</div>
              <button onClick={() => setError(null)} className="opacity-70 hover:opacity-100"><X className="w-5 h-5"/></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- FRONT PAGE --- */}
        {activeScreen === 'HOME' && !activeModal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center w-full"
          >
            <h2 className="text-4xl font-display font-bold mb-3 text-white">How can I help?</h2>
            <p className="text-gray-400 font-medium mb-10 text-lg">Point, snap, or speak to get instant guidance.</p>
            
            <div className="grid grid-cols-2 gap-4 w-full">
              <button onClick={() => setActiveModal('camera')} className="glass-button">
                <div className="icon-ring text-primary border-primary/20 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <Camera className="w-8 h-8" />
                </div>
                <span className="font-display font-semibold text-[15px] text-gray-200 group-hover:text-white transition-colors z-10">Take Photo</span>
              </button>
              
              <button onClick={() => setActiveModal('voice')} className="glass-button">
                <div className="icon-ring text-secondary border-secondary/20 group-hover:border-secondary/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <Mic className="w-8 h-8" />
                </div>
                <span className="font-display font-semibold text-[15px] text-gray-200 group-hover:text-white transition-colors z-10">Voice Note</span>
              </button>

              <button onClick={() => setActiveModal('upload')} className="glass-button">
                <div className="icon-ring text-accent border-accent/20 group-hover:border-accent/50 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <span className="font-display font-semibold text-[15px] text-gray-200 group-hover:text-white transition-colors z-10">Upload File</span>
              </button>

              <button onClick={() => setActiveModal('text')} className="glass-button">
                <div className="icon-ring text-gray-400 border-gray-400/20 group-hover:border-gray-400/50 group-hover:shadow-[0_0_20px_rgba(156,163,175,0.3)]">
                  <Type className="w-7 h-7" />
                </div>
                <span className="font-display font-semibold text-[15px] text-gray-200 group-hover:text-white transition-colors z-10">Type Text</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* --- MODALS --- */}
        <AnimatePresence>
          {activeModal === 'camera' && <CameraInput onCapture={(data) => handleCapture(data, 'image')} onCancel={() => setActiveModal(null)} />}
          {activeModal === 'voice' && <VoiceInput onCapture={(data) => handleCapture(data, 'voice')} onCancel={() => setActiveModal(null)} />}
          {activeModal === 'text' && <TextInput onCapture={(data) => handleCapture(data, 'text')} onCancel={() => setActiveModal(null)} />}
          {activeModal === 'upload' && <UploadInput onCapture={(data) => handleCapture(data, 'upload')} onCancel={() => setActiveModal(null)} />}
        </AnimatePresence>

        {/* --- PROCESSING SCREEN --- */}
        {activeScreen === 'PROCESSING' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center gap-8 py-20 w-full"
          >
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_4s_linear_infinite]"></div>
              <div className="absolute inset-2 rounded-full border-t border-l border-primary/50 animate-[spin_3s_linear_infinite_reverse]"></div>
              <div className="absolute inset-4 rounded-full border-r border-b border-accent/50 animate-[spin_2s_ease-in-out_infinite]"></div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse-glow shadow-[0_0_40px_rgba(59,130,246,0.5)] flex items-center justify-center">
                <Activity className="w-8 h-8 text-white absolute" />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-display font-bold text-gradient mb-2 animate-pulse-glow">Analyzing Scene...</h3>
              <p className="text-gray-400 text-sm">Gemini is processing multimodal context.</p>
            </div>
          </motion.div>
        )}

        {/* --- RESULT SCREEN --- */}
        {activeScreen === 'RESULT' && result && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full glass-card hide-scrollbar overflow-y-auto max-h-[85vh] block border-t-4" 
            style={{ borderTopColor: result.priorityBadgeColor === 'red' ? '#EF4444' : result.priorityBadgeColor === 'yellow' ? '#EAB308' : '#3B82F6' }}
          >
            
            <div className="flex justify-between items-center mb-6">
              <span className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider border flex items-center gap-2 ${getBadgeColorClass(result.priorityBadgeColor)}`}>
                <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                {result.priorityBadge}
              </span>
              <span className="text-gray-400 text-xs font-medium">Just now</span>
            </div>
            
            <h3 className="text-2xl font-display font-bold mb-3 text-white leading-tight">{result.title}</h3>
            <p className="text-base text-gray-300 mb-8 leading-relaxed opacity-90">{result.summary}</p>

            <div className="space-y-4 mb-8">
              {result.actionSteps.map((step, idx) => (
                <div key={idx} className="p-5 bg-black/20 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors group">
                  <div className="flex items-start gap-4 mb-2">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-sm font-bold text-gray-300 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-[15px] text-white mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {result.quickAction && (
              <a 
                href={result.quickAction.intent}
                className="w-full py-5 text-white rounded-2xl font-display font-bold transition-all mb-4 flex items-center justify-center gap-3 text-lg hover:-translate-y-1 active:translate-y-0 relative overflow-hidden group"
                style={{ backgroundColor: result.priorityBadgeColor === 'red' ? '#EF4444' : result.priorityBadgeColor === 'yellow' ? '#EAB308' : '#3B82F6', boxShadow: `0 10px 30px ${result.priorityBadgeColor === 'red' ? 'rgba(239,68,68,0.3)' : result.priorityBadgeColor === 'yellow' ? 'rgba(234,179,8,0.3)' : 'rgba(59,130,246,0.3)'}` }}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span>{result.quickAction.label}</span>
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </a>
            )}
            
            <button 
              onClick={() => {
                setActiveScreen('HOME');
                setResult(null);
              }}
              className="w-full py-4 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-2xl font-medium transition-colors border border-transparent hover:border-white/10 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Done
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
