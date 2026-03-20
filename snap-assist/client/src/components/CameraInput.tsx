import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface CameraInputProps {
  onCapture: (base64Image: string) => void;
  onCancel: () => void;
}

export default function CameraInput({ onCapture, onCancel }: CameraInputProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Failed to access camera. Please check permissions.");
        console.error(err);
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Data = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(base64Data);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#030712] flex flex-col items-center justify-center p-0 m-0"
    >
      {error ? (
        <div className="text-danger p-8 glass-card border-danger/30 text-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <p className="font-medium text-lg mb-6">{error}</p>
          <button onClick={onCancel} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-semibold text-white">Go Back</button>
        </div>
      ) : (
        <div className="w-full h-full relative overflow-hidden flex flex-col justify-end">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-1000"
            onLoadedData={(e) => (e.currentTarget.style.opacity = '1')}
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Overlay gradient for camera controls to stand out */}
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-10"></div>

          <div className="w-full flex justify-center items-center gap-14 px-6 pb-12 z-20">
            <button 
              onClick={onCancel}
              className="w-14 h-14 rounded-full bg-black/40 border border-white/20 flex items-center justify-center backdrop-blur-xl text-white hover:bg-white/10 transition-colors shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <button 
              onClick={handleCapture}
              className="w-[88px] h-[88px] rounded-full border-[6px] border-white/80 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.3)] bg-black/10 backdrop-blur-sm group"
            >
              <div className="w-[66px] h-[66px] rounded-full bg-white group-hover:bg-gray-200 transition-colors shadow-inner"></div>
            </button>
            <div className="w-14 h-14"></div> {/* Balance flexbox */}
          </div>
          
          {/* Viewfinder brackets purely for aesthetics */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-white/10 rounded-[2.5rem] pointer-events-none z-10">
             <div className="absolute top-[-2px] left-[-2px] w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-[2.5rem]"></div>
             <div className="absolute top-[-2px] right-[-2px] w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-[2.5rem]"></div>
             <div className="absolute bottom-[-2px] left-[-2px] w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-[2.5rem]"></div>
             <div className="absolute bottom-[-2px] right-[-2px] w-12 h-12 border-b-4 border-r-4 border-white rounded-br-[2.5rem]"></div>
             
             {/* Center reticle */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pb-0.5">
               +
             </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
