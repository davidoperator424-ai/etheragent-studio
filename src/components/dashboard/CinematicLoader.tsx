import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Database, Zap, Activity, Globe, Lock, Layers, Headphones, Eye } from 'lucide-react';

interface CinematicLoaderProps {
  isVisible: boolean;
  phase?: 'phase1' | 'phase2' | 'phase3' | 'phase4';
  progress?: number;
}

const commandLogs = [
  { icon: Lock, text: '[SYS] Validando credenciales de acceso...' },
  { icon: Database, text: '[DB] Conectando a Neural Matrix Cluster...' },
  { icon: Zap, text: '[API] Inicializando ElevenLabs Engine...' },
  { icon: Headphones, text: '[AUDIO] Sintetizando frecuencias vocales v2.4...' },
  { icon: Layers, text: '[VISUAL] Renderizando texturas 8K HDR...' },
  { icon: Eye, text: '[KAELEN] Ajustando iluminación volumétrica...' },
  { icon: Globe, text: '[GEO] Calculando geolocalización target...' },
  { icon: Activity, text: '[NEURAL] Ensamblando red neuronal de cierre...' },
  { icon: Cpu, text: '[SYS] Compilando Blueprint Final...' },
];

const progressBars = [
  { id: 'audio', label: 'Audio Matrix Synthesis', speed: 0.8 },
  { id: 'visual', label: 'Visual Matrix Rendering', speed: 0.5 },
  { id: 'neural', label: 'Neural Assembly', speed: 0.3 },
];

export default function CinematicLoader({ isVisible, phase = 'phase4', progress = 0 }: CinematicLoaderProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [barProgress, setBarProgress] = useState({ audio: 0, visual: 0, neural: 0 });
  const [displayProgress, setDisplayProgress] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) {
      setLogs([]);
      setBarProgress({ audio: 0, visual: 0, neural: 0 });
      setDisplayProgress(0);
      return;
    }

    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < commandLogs.length) {
        setLogs(prev => [...prev, commandLogs[logIndex].text]);
        logIndex++;
      }
    }, 400);

    return () => clearInterval(logInterval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setBarProgress(prev => ({
        audio: Math.min(prev.audio + (Math.random() * 15 + 5), 100),
        visual: Math.min(prev.visual + (Math.random() * 10 + 3), 100),
        neural: Math.min(prev.neural + (Math.random() * 8 + 2), 100),
      }));
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const targetProgress = phase === 'phase1' ? 30 : phase === 'phase2' ? 60 : phase === 'phase3' ? 85 : progress;
    const increment = targetProgress > displayProgress ? 1 : 0;
    
    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        if (prev >= 99) return 99;
        const next = prev + increment + Math.random() * 2;
        return Math.min(Math.floor(next), targetProgress);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, phase, progress]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const getPhaseLabel = () => {
    switch (phase) {
      case 'phase1': return 'GENERATING VIRAL HOOKS';
      case 'phase2': return 'RENDERING VISUAL MATRIX';
      case 'phase3': return 'SYNTHESIZING AUDIO';
      case 'phase4': return 'ASSEMBLING BLUEPRINT';
      default: return 'EXECUTING MATRIX';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.15)_0%,_rgba(0,0,0,1)_70%)]" />
          
          <div className="relative z-10 w-full max-w-6xl mx-auto px-8 grid grid-cols-12 gap-8">
            <div className="col-span-7 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Cpu className="text-emerald-400" size={24} />
                </motion.div>
                <span className="text-emerald-400 font-mono text-sm tracking-widest">
                  ETHERAGENT OS // NEURAL ENGINE
                </span>
              </div>

              <div className="bg-black/60 border border-emerald-500/20 rounded-lg p-4 flex-1 font-mono text-xs">
                <div ref={logRef} className="h-[300px] overflow-y-auto space-y-1">
                  {logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-emerald-500/80"
                    >
                      <span className="text-emerald-600">$</span> {log}
                    </motion.div>
                  ))}
                  <motion.div
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-emerald-400"
                  >
                    <span className="text-emerald-600">$</span> _
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="col-span-5 flex flex-col justify-center">
              <div className="space-y-6">
                {progressBars.map((bar) => (
                  <div key={bar.id}>
                    <div className="flex justify-between mb-2">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                        {bar.label}
                      </span>
                      <span className="text-emerald-400 font-mono text-xs">
                        {Math.round(barProgress[bar.id as keyof typeof barProgress])}%
                      </span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barProgress[bar.id as keyof typeof barProgress]}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                      />
                    </div>
                  </div>
                ))}

                <div className="mt-12 text-center">
                  <motion.div
                    key={displayProgress}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-8xl font-black text-emerald-400 font-mono"
                  >
                    {displayProgress}
                    <span className="text-4xl text-emerald-600">%</span>
                  </motion.div>
                  <p className="text-zinc-500 font-mono text-xs mt-4 tracking-[0.3em]">
                    {getPhaseLabel()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 text-zinc-600 font-mono text-[10px]">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              SISTEMA OPERATIVO // MODO MILITAR
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
