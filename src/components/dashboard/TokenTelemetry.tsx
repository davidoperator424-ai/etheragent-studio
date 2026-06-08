import React from 'react';
import { Cpu, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTokenBalance } from '@/hooks/useTokenBalance';

export default function TokenTelemetry() {
  const navigate = useNavigate();
  const { balance, isLoading } = useTokenBalance();
  
  if (isLoading) return null;

  const { computeTokens: usedTokens, totalTokens, planName, isInfinite } = balance;
  const percentage = isInfinite ? 0 : (usedTokens / totalTokens) * 100;
  
  const progressColor = isInfinite ? 'bg-indigo-500' : percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-orange-500' : 'bg-emerald-500';
  const glowColor = isInfinite ? 'shadow-[0_0_10px_rgba(99,102,241,0.5)]' : percentage > 90 ? 'shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'shadow-[0_0_10px_rgba(16,185,129,0.3)]';

  return (
    <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-4 w-full relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="flex justify-between items-center mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-zinc-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Compute Tokens</span>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-wider ${isInfinite ? 'text-indigo-400 bg-indigo-500/10' : 'text-blue-500 bg-blue-500/10'} px-2 py-0.5 rounded-full`}>
          {planName}
        </span>
      </div>

      <div className="flex items-end justify-between mb-2 relative z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-white leading-none">
            {isInfinite ? '∞' : usedTokens.toLocaleString()}
          </span>
          {!isInfinite && (
            <span className="text-xs font-bold text-zinc-600">/ {totalTokens.toLocaleString()}</span>
          )}
        </div>
        {!isInfinite && (
          <span className={`text-xs font-bold ${percentage > 90 ? 'text-red-500' : 'text-emerald-500'}`}>
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>

      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3 relative z-10">
        <div 
          className={`h-full ${progressColor} ${glowColor} transition-all duration-1000 ease-out`}
          style={{ width: isInfinite ? '100%' : `${percentage}%` }}
        />
      </div>

      <button 
        onClick={() => navigate('/dashboard/subscription')}
        className="w-full py-2 bg-[#111] hover:bg-zinc-800 border border-white/5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-zinc-300 transition-colors relative z-10"
      >
        <Zap size={12} className={isInfinite ? 'text-indigo-400' : 'text-emerald-500'} />
        {isInfinite ? 'Advanced Settings' : 'Aumentar Capacidad'}
      </button>
    </div>
  );
}
