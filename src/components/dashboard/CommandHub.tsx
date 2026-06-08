import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Terminal, Globe, Send, Loader2, 
  CheckCircle2, AlertCircle, BarChart3, Fingerprint, Search, Cpu, Sparkles, Play, ArrowRight, Smartphone, Monitor, Tv
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import GlassCard from '@/components/GlassCard';
import CyberButton from '@/components/CyberButton';

type ScrapingState = 'idle' | 'scraping' | 'processing' | 'completed' | 'failed';

interface AgentStatus {
  id: string;
  name: string;
  role: string;
  avatar: string;
  message: string;
  state: ScrapingState;
}

const AGENTS: Record<string, AgentStatus> = {
  analyst: {
    id: 'analyst',
    name: 'Analista X',
    role: 'Data Extraction Specialist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    message: 'Interceptando paquetes de datos. Inyectando sondas de scraping...',
    state: 'scraping'
  },
  marcus: {
    id: 'marcus',
    name: 'Marcus V.',
    role: 'Director de Estrategia',
    avatar: 'https://njhifpbnrbbhbmwgedtz.supabase.co/storage/v1/object/public/visual-assets/marcus_static_linkedin-1773153064862.jpg',
    message: 'Datos ingeridos. Calculando vectores de conversión y tono de marca...',
    state: 'processing'
  }
};

export default function CommandHub() {
  const navigate = useNavigate();
  const { balance, isLoading: tokensLoading } = useTokenBalance();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<ScrapingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleScrape = async () => {
    if (!url.trim() || status !== 'idle') return;
    if (tokensLoading) return;
    
    if (!balance.isInfinite && balance.computeTokens <= 0) {
      navigate('/dashboard/subscription');
      return;
    }

    setStatus('scraping');
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), userId: user.id })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Error al iniciar el scraping');
      }

      const data = await response.json();
      setStatus('processing');
      
      // Fetch the completed campaign
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', data.campaignId)
        .single();

      if (campaign) {
        sessionStorage.setItem('current_campaign', JSON.stringify(campaign));
      }
      
      setStatus('completed');
      setTimeout(() => navigate('/dashboard/social'), 1500);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error de conexión con el Hub.');
      setStatus('idle');
    }
  };

  const handleStartDemo = () => {
    setIsDeploying(true);
    setTimeout(() => navigate('/dashboard/social'), 1500);
  };

  const getActiveAgent = () => {
    if (status === 'scraping') return AGENTS.analyst;
    if (status === 'processing') return AGENTS.marcus;
    if (status === 'completed') return AGENTS.marcus;
    return null;
  };

  const activeAgent = getActiveAgent();

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700">
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 🟢 PANEL IZQUIERDO: CONTROL & INPUT */}
        <div className="w-full lg:w-[450px] shrink-0 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-emerald-500 font-mono text-xs tracking-[0.2em] uppercase">
              <Fingerprint size={16} className="animate-pulse" />
              <span>Neural Link • Command Central</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Nexus <span className="text-emerald-500">Ingestion</span>
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
              Pega una URL de red social o sitio web. Mi infraestructura raspará el tono de marca y generará una campaña premium en segundos.
            </p>
          </div>

          <GlassCard className="p-6 border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/5 rounded-xl blur-xl group-focus-within:bg-emerald-500/10 transition-all duration-500" />
                <div className="relative flex items-center gap-3 bg-zinc-900/50 border border-white/10 rounded-xl p-4 focus-within:border-emerald-500/50 transition-all">
                  <Globe className="text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                    placeholder="https://instagram.com/marca..."
                    className="bg-transparent border-none outline-none text-white placeholder:text-zinc-600 w-full font-mono text-sm"
                    disabled={status !== 'idle'}
                  />
                </div>
              </div>

              <CyberButton 
                onClick={handleScrape}
                disabled={status !== 'idle' || !url.trim() || tokensLoading}
                className="w-full h-14 text-lg group"
                variant="primary"
              >
                {status === 'idle' ? (
                  <div className="flex items-center gap-2">
                    <span>Iniciar Ingestión</span>
                    <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="animate-pulse">Procesando Red Neuronal...</span>
                  </div>
                )}
              </CyberButton>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs font-mono bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Módulos Adicionales (Quick Actions) */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Audit Strategy', icon: Search },
              { label: 'Market Trends', icon: BarChart3 },
              { label: 'Agent Roster', icon: Cpu },
              { label: 'API Status', icon: Terminal },
            ].map((item) => (
              <button key={item.label} className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex flex-col gap-2 items-start group">
                <item.icon size={16} className="text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-400">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 🔵 PANEL DERECHO: INTELLIGENCE PREVIEW (AVATARES) */}
        <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center relative">
          <AnimatePresence mode="wait">
            {status === 'idle' ? (
              <motion.div 
                key="idle-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="text-center space-y-6"
              >
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center mx-auto">
                  <Sparkles size={32} className="text-zinc-800" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-zinc-600 font-mono text-sm tracking-widest uppercase">A la espera de directiva</h3>
                  <p className="text-zinc-800 text-xs">Inicia la ingestión de datos para activar la red de agentes.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="active-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-lg"
              >
                <GlassCard className="p-8 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-1000" />
                  
                  <div className="flex flex-col items-center gap-8 text-center relative z-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
                      <Avatar className="w-24 h-24 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                        <AvatarImage src={activeAgent?.avatar} />
                        <AvatarFallback className="bg-zinc-900"><Loader2 className="animate-spin" /></AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-black text-[10px] font-bold rounded-full uppercase tracking-tighter">
                        En Línea
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-white tracking-tight">{activeAgent?.name}</h2>
                        <p className="text-emerald-500 font-mono text-[10px] uppercase tracking-[0.2em]">{activeAgent?.role}</p>
                      </div>
                      
                      <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                        <p className="text-zinc-300 text-sm italic font-serif leading-relaxed">
                          "{activeAgent?.message}"
                        </p>
                      </div>

                      {/* Progress Bar Visual */}
                      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: status === 'completed' ? "100%" : "70%" }}
                          transition={{ duration: 2, repeat: status === 'completed' ? 0 : Infinity, repeatType: 'reverse' }}
                          className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                        />
                      </div>

                      <div className="flex items-center justify-center gap-4 pt-2">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          <span>Link Validado</span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                          <Loader2 size={12} className={status === 'scraping' ? 'animate-spin text-emerald-500' : (status === 'processing' || status === 'completed' || status === 'failed') ? 'text-emerald-500' : ''} />
                          <span>Scraping</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                          <Loader2 size={12} className={status === 'processing' ? 'animate-spin text-emerald-500' : status === 'completed' ? 'text-emerald-500' : ''} />
                          <span>Cognitive AI</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 🟢 HERO CARD (DEMO CERO) - MOVIDA AL FINAL PARA NO DISTRAER */}
      <div className="w-full max-w-4xl mx-auto relative group p-[1px] rounded-[2rem] overflow-hidden bg-gradient-to-b from-emerald-500/30 to-zinc-900/50 shadow-2xl shrink-0 mt-8">
        <div className="absolute inset-0 bg-emerald-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        <div className="relative bg-zinc-950/90 backdrop-blur-xl rounded-[2rem] p-6 lg:p-10 border border-white/5 flex flex-col items-center text-center">
          <div className="w-12 h-12 lg:w-14 lg:h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Play className="w-6 h-6 lg:w-7 lg:h-7 text-emerald-400 ml-1" fill="currentColor" />
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-3">Campaña Cero: <span className="text-emerald-400">Mafia Aviar</span></h2>
          <p className="text-zinc-400 text-xs sm:text-sm lg:text-base mb-6 lg:mb-8 max-w-2xl leading-relaxed px-2">
            ¿No tienes una URL lista? Observa cómo procesamos un activo crudo y lo desplegamos a través de Redes, Vallas 3D y TV en nuestra demo estrella.
          </p>
          <button onClick={handleStartDemo} disabled={isDeploying} className={`relative px-8 py-3 bg-emerald-500 text-zinc-950 font-bold text-sm lg:text-base rounded-full hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] group/btn active:scale-95 ${isDeploying ? 'opacity-70 cursor-wait' : ''}`}>
            <span className="relative z-10 flex items-center gap-2">
              {isDeploying ? 'TRANSFIRIENDO CONTROL...' : 'INICIAR DEMO CERO'} <ArrowRight className={`w-4 h-4 transition-transform ${isDeploying ? 'animate-pulse' : 'group-hover/btn:translate-x-1'}`} />
            </span>
          </button>
        </div>
      </div>

    </div>
  );
}
