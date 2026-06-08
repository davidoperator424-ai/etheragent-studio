import React from 'react';
import { Lock, Zap, Crown, Cpu, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0a0a0c] border border-emerald-500/30 rounded-3xl p-8 shadow-[0_0_80px_rgba(16,185,129,0.2)] overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-400" />

          <div className="w-20 h-20 mx-auto bg-emerald-500/10 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mb-6 relative">
            <Crown size={36} className="text-emerald-400" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <Lock size={12} className="text-black" />
            </div>
          </div>

          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-[10px] font-black uppercase tracking-widest mb-4">
              Versión Gratuita
            </span>
            <h2 className="text-2xl font-bold text-white text-center mb-2 tracking-tight">
              Asignación Neural Requerida
            </h2>
            <p className="text-zinc-400 text-center mb-8 text-sm leading-relaxed">
              Has agotado tu capacidad de prueba. Para desplegar agentes 24/7 y dominar tu mercado sin latencia, necesitas escalar tu Fuerza Operativa.
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Cpu size={18} className="text-emerald-400" />
              <span className="text-sm text-zinc-300">1,500 Compute Tokens mensuales</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Zap size={18} className="text-emerald-400" />
              <span className="text-sm text-zinc-300">2 Agentes Activos (Valeria & Kaelen)</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Sparkles size={18} className="text-emerald-400" />
              <span className="text-sm text-zinc-300">Generación de Video Social (9:16)</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                onClose();
                navigate('/dashboard/subscription');
              }}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            >
              <span>Activar Nodo: SOLO OPERATOR</span>
              <span className="opacity-60 text-sm font-mono ml-2">[$157/mo]</span>
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Ver todos los Nodos de Infraestructura
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
