import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface TextInputProps {
  onCapture: (text: string) => void;
  onCancel: () => void;
}

export default function TextInput({ onCapture, onCancel }: TextInputProps) {
  const [text, setText] = useState('');

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
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Describe Scene</h2>
          <button onClick={onCancel} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5">
            <X className="w-5 h-5"/>
          </button>
        </div>
        
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. My kid ate something weird from under the sink, it's a blue bottle..."
          className="w-full h-48 bg-black/30 border border-white/10 rounded-2xl p-5 text-white font-medium focus:outline-none focus:border-primary/50 focus:shadow-[0_0_30px_rgba(59,130,246,0.15)] resize-none placeholder-gray-500 transition-all leading-relaxed"
        />

        <div className="flex justify-end gap-3 pt-2">
          <button 
            onClick={onCancel}
            className="px-6 py-3 rounded-xl text-[15px] font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent"
          >
            Cancel
          </button>
          <button 
            onClick={() => text.trim() && onCapture(text.trim())}
            disabled={!text.trim()}
            className="px-8 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl text-[15px] font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_5px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_10px_30px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 active:translate-y-0"
          >
            Analyze
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
