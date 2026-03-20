import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, X } from 'lucide-react';

interface UploadInputProps {
  onCapture: (base64File: string) => void;
  onCancel: () => void;
}

export default function UploadInput({ onCapture, onCancel }: UploadInputProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onCapture(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-md glass-card flex flex-col gap-6 border-t-2 border-t-white/20"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Upload File</h2>
          <button onClick={onCancel} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5">
            <X className="w-5 h-5"/>
          </button>
        </div>
        
        <form 
          onDragEnter={onDrag} 
          onSubmit={(e) => e.preventDefault()}
          className={`relative h-72 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-300 group
            ${dragActive ? 'border-primary bg-primary/10 shadow-[0_0_50px_rgba(59,130,246,0.2)]' : 'border-white/20 bg-black/20 hover:border-white/40 hover:bg-white/5'}`}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*,.pdf" 
            className="hidden" 
            onChange={handleChange} 
          />
          
          <div className="flex flex-col items-center pointer-events-none p-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-surface border border-white/10 mb-6 transition-transform duration-500 shadow-xl ${dragActive ? 'scale-110 shadow-primary/30 border-primary/50' : 'group-hover:-translate-y-2'}`}>
              <UploadCloud className="w-10 h-10 text-gray-300 drop-shadow-md" />
            </div>
            <p className="font-display font-bold text-lg mb-2 text-white">Drop file to attach</p>
            <p className="text-sm text-gray-400">or click to browse your device</p>
          </div>

          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
          ></div>
        </form>

        <div className="flex justify-end pt-2">
          <button 
            onClick={onCancel}
            className="px-6 py-3 rounded-xl text-[15px] font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
