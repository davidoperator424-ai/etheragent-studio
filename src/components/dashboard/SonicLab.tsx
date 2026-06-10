import React, { useState } from 'react';
import { Radio, Sparkles, Zap, Music, Loader2, Waves } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SonicLab() {
  const [isCompiling, setIsCompiling] = useState(false);
  const [chatStep, setChatStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleCompile = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      setChatStep(2);
    }, 2500);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full overflow-y-auto md:overflow-hidden pb-28 md:pb-0">

      {/* LEFT PANEL - Chat */}
      <div className="w-full md:flex-1 bg-zinc-950/40 backdrop-blur-md border border-white/5 rounded-[2rem] flex flex-col shadow-2xl overflow-hidden relative order-2 md:order-1 min-h-[60vh] md:min-h-0">

        <header className="h-20 border-b border-white/5 bg-zinc-900/20 backdrop-blur-md flex items-center px-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
                <Waves className="text-emerald-400" size={24} />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Sonic Lab</h2>
              <p className="text-emerald-400 font-mono text-[10px] tracking-widest uppercase">Neural Audio Engine</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <Sparkles size={12} className="text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">Active Session</span>
          </div>
        </header>

        <div className="flex-1 p-6 flex flex-col">
          <div className="glass-panel p-5 rounded-2xl rounded-tl-sm w-[90%] mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-zinc-500">SYSTEM &bull; NEURAL ENGINE</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Guion B2B analizado. He configurado la síntesis vocal con un tono persuasivo y m&uacute;sica de fondo lo-fi corporativa. &iquest;Inicio la compilaci&oacute;n del master de audio?
            </p>
          </div>

          <div className="bg-emerald-900/20 border border-emerald-500/20 p-5 rounded-2xl rounded-tr-sm w-[85%] self-end mb-4">
            <p className="text-sm text-emerald-100 leading-relaxed">
              Adelante. Aseg&uacute;rate de que la mezcla no sature en dispositivos m&oacute;viles.
            </p>
          </div>

          {chatStep === 2 && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5 rounded-2xl rounded-tl-sm w-[90%] mb-4 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
               <p className="text-sm text-white leading-relaxed font-medium">
                 Masterizaci&oacute;n completada a -14 LUFS. Tienes el render de audio en el reproductor a tu derecha. Presiona <span className="text-emerald-400 font-mono text-xs border border-emerald-500/50 px-1 rounded bg-emerald-500/10">[BROADCAST]</span> para publicarlo.
               </p>
             </motion.div>
          )}

          <div className="mt-auto grid grid-cols-2 gap-3">
            <button onClick={handleCompile} disabled={isCompiling || chatStep === 2} className="glass-panel hover:bg-zinc-800/60 p-3 rounded-xl flex items-center gap-3 text-xs text-zinc-300 transition-all active:scale-95">
              {isCompiling ? <Loader2 size={16} className="text-emerald-400 animate-spin" /> : <Zap size={16} className="text-emerald-400" />}
              Sintetizar Audio
            </button>
            <button className="glass-panel p-3 rounded-xl flex items-center gap-3 text-xs text-zinc-500 cursor-not-allowed">
              <Music size={16} className="text-zinc-600" /> Cambiar BGM
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Audio Player */}
      <div className="w-full md:w-80 xl:w-96 flex flex-col justify-center py-4 md:py-8 pr-0 md:pr-4 order-1 md:order-2">
        <div className="text-center mb-6">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Live Sonic Preview</span>
        </div>

        <div className="relative w-full aspect-[9/19] bg-black border-[12px] border-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col justify-center items-center group">
          <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
            <div className="w-24 h-full bg-zinc-900 rounded-b-xl" />
          </div>

          <div className="w-32 h-32 rounded-full bg-emerald-500/10 border-4 border-emerald-500/30 flex items-center justify-center mb-8 relative">
             {chatStep === 2 && isPlaying && (
               <span className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-50"></span>
             )}
             <Radio size={48} className={chatStep === 2 && isPlaying ? "text-emerald-400 animate-pulse" : "text-emerald-400/50"} />
          </div>
          <h2 className="text-xl font-bold mb-1 text-white">Campa&ntilde;a B2B Q4</h2>
          <p className="text-sm text-zinc-400 mb-8">Neural Voice &bull; Premium</p>

          <div className="w-full mt-auto px-6">
            <div className="h-1 bg-zinc-800 rounded-full mb-6 overflow-hidden">
              <div className={`h-full bg-emerald-500 transition-all ${isPlaying ? 'w-full' : 'w-0'}`} style={{ transitionDuration: '30s' }} />
            </div>
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={chatStep === 1}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                  chatStep === 2
                    ? 'bg-emerald-500 text-black shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:bg-emerald-400'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {isPlaying ? (
                  <span className="w-4 h-4 bg-black rounded-sm" />
                ) : (
                  <div className="w-0 h-0 border-y-8 border-y-transparent border-l-[14px] border-l-black ml-1" />
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          className={`mt-6 w-full py-4 rounded-xl font-black font-mono tracking-widest transition-all duration-300 active:scale-95 ${
            chatStep === 2
              ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]'
              : 'bg-zinc-900 text-zinc-600 border border-white/5 cursor-not-allowed'
          }`}
        >
          [ BROADCAST TO SPOTIFY ]
        </button>
      </div>
    </div>
  );
}
