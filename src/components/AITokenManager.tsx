import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Shield, Key, Check } from 'lucide-react';
import { useTokenStore } from '@/store/useTokenStore';

export default function AITokenManager() {
  const [isOpen, setIsOpen] = useState(false);
  const { tokens, setToken } = useTokenStore();
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const handleSaveToken = (key: any, value: string) => {
    setToken(key, value);
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 2000);
  };

  const tokenList = [
    { key: 'openai', label: 'OpenAI (GPT-4o)', placeholder: 'sk-...' },
    { key: 'anthropic', label: 'Anthropic (Claude)', placeholder: 'sk-ant-...' },
    { key: 'groq', label: 'Groq (Llama-3)', placeholder: 'gsk_...' },
    { key: 'gemini', label: 'Google Gemini', placeholder: 'AIza...' },
    { key: 'fal', label: 'Fal.ai (Flux/Sora)', placeholder: '...' },
  ];

  return (
    <div className="fixed top-4 left-4 z-[100] font-sans antialiased">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-zinc-950/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all shadow-2xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Settings size={18} className={isOpen ? 'rotate-90' : 'rotate-0'} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className="absolute top-12 left-0 w-80 bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-zinc-500" />
                <h3 className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">Token Matrix</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-6">
              {tokenList.map((item) => (
                <div key={item.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{item.label}</label>
                    {savedKey === item.key && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-emerald-500 font-mono">SAVED</motion.span>
                    )}
                  </div>
                  <div className="relative group">
                    <Key size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" />
                    <input
                      type="password"
                      placeholder={item.placeholder}
                      value={tokens[item.key as keyof typeof tokens] || ''}
                      onChange={(e) => handleSaveToken(item.key, e.target.value)}
                      className="w-full bg-black/50 border border-white/5 focus:border-white/20 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder:text-zinc-700 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-[10px] text-zinc-600 font-medium">
                Tokens are stored locally in your browser session.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
