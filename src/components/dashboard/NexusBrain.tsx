import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, ChevronLeft, ChevronRight, Globe, Sparkles, Video,
  Copy, Zap, Eye, Loader2, History, Plus, Trash2, Send,
  Clapperboard, CheckCircle2, Target, Hash, Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaignStore } from '@/store/useCampaignStore';
import { CampaignWorkspace, generateWorkspaceCampaign } from '@/lib/geminiService';
import { toast } from 'sonner';

interface ScanRecord {
  id: string;
  target_url: string;
  detected_sector: string;
  strategy_score: number;
  campaign_data: CampaignWorkspace & {
    assets?: any[];
    audience?: any;
    creative_rationale?: string;
    youtube_seo?: any;
    thumbnail_idea?: string;
    ab_testing_suggestions?: any[];
    angles?: string[];
    detected_sector?: string;
    strategy_score?: number;
  };
  created_at: string;
}

function extractNarrative(data: ScanRecord['campaign_data']) {
  if (data.hook && data.narrative_body) {
    return {
      mission_id: data.mission_id || `M-${data.detected_sector || 'GEN'}-${Date.now().toString(36)}`,
      hook: data.hook,
      narrative_body: data.narrative_body,
      on_screen_text: data.on_screen_text || [],
      call_to_action: data.call_to_action || '',
      visual_description: data.visual_description || '',
    };
  }
  if (data.assets && data.assets.length > 0) {
    const first = data.assets[0];
    return {
      mission_id: `LEGACY-${Date.now().toString(36)}`,
      hook: first.hook || '',
      narrative_body: data.creative_rationale || first.voiceover_script || '',
      on_screen_text: first.on_screen_text || [],
      call_to_action: first.call_to_action || '',
      visual_description: first.visual_description || '',
    };
  }
  return null;
}

const BentoGridResult = ({ record, onBack }: { record: ScanRecord; onBack?: () => void }) => {
  const navigate = useNavigate();
  const setWorkspace = useCampaignStore(state => state.setWorkspace);
  const narrative = extractNarrative(record.campaign_data);

  if (!narrative) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-zinc-600 font-mono text-xs">Formato de campaña no reconocido</p>
      </div>
    );
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const handleSendToSocialLab = () => {
    setWorkspace({
      mission_id: narrative.mission_id,
      hook: narrative.hook,
      narrative_body: narrative.narrative_body,
      on_screen_text: narrative.on_screen_text,
      call_to_action: narrative.call_to_action,
      visual_description: narrative.visual_description,
    });
    navigate(`/dashboard/social?campaign=${record.id}`);
    toast.success('Narrativa enviada al Social Lab');
  };

  const sector = record.campaign_data.detected_sector || record.detected_sector || 'B2B Strategy';
  const score = record.campaign_data.strategy_score || record.strategy_score || 95;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest mb-4">
              <ChevronLeft size={14} /> Back to history
            </button>
          )}
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Zap size={10} className="inline mr-1 -mt-0.5" />{narrative.mission_id}
            </span>
            <span className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              {sector}
            </span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
            Intelligence Report
          </h2>
          <p className="text-zinc-500 text-xs font-mono">
            Target: {new URL(record.target_url).hostname}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Strategy Score</span>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-black text-white leading-none">{score}</span>
              <span className="text-xl font-bold text-zinc-700 leading-none">/100</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Brain className="text-emerald-400" size={28} />
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* The Hook — Wide */}
        <div className="md:col-span-7 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:border-emerald-500/20 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
            <Quote size={120} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.3em] font-bold">The Hook &bull; First 3 Seconds</span>
            </div>
            <p className="text-2xl md:text-3xl font-black text-white italic leading-tight tracking-tight">
              &ldquo;{narrative.hook}&rdquo;
            </p>
          </div>
        </div>

        {/* Mission Control — Small badge card */}
        <div className="md:col-span-5 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Mission Control</span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Target size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-mono text-emerald-400 font-bold">{narrative.mission_id}</p>
                <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Active Mission</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Format</span>
            <span className="text-sm font-bold text-white">Nativo &bull; Video B2B</span>
          </div>
        </div>

        {/* Narrative Body — Full width */}
        <div className="md:col-span-12 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-[0.3em] font-bold">Narrative Body</span>
            </div>
            <p className="text-sm md:text-base text-zinc-200 leading-relaxed">
              {narrative.narrative_body}
            </p>
          </div>
        </div>

        {/* Visual Direction Box */}
        <div className="md:col-span-7 bg-zinc-950/60 border border-white/10 rounded-2xl p-6 md:p-8 relative group hover:border-indigo-500/30 transition-colors">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-indigo-400" />
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-[0.3em] font-bold">Visual Direction</span>
              </div>
              <button
                onClick={() => handleCopy(narrative.visual_description, 'Visual prompt')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all text-[10px] font-mono"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-mono line-clamp-6">
              {narrative.visual_description}
            </p>
          </div>
        </div>

        {/* On-Screen Texts + CTA */}
        <div className="md:col-span-5 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6">
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <Hash size={12} /> On-Screen Texts
            </span>
            <div className="flex flex-wrap gap-2">
              {narrative.on_screen_text.length > 0 ? narrative.on_screen_text.map((text, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-[11px] font-bold text-white uppercase tracking-tight"
                >
                  {text}
                </span>
              )) : (
                <span className="text-[11px] text-zinc-600 italic">No on-screen texts defined</span>
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-white/5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] block mb-2">Call to Action</span>
            <span className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm font-bold text-emerald-400">
              {narrative.call_to_action || 'No CTA defined'}
            </span>
          </div>
        </div>
      </div>

      {/* Action: Send to Social Lab */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleSendToSocialLab}
          className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-sm rounded-xl transition-all active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-3"
        >
          <Send size={18} /> Enviar Narrativa a Social Lab <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};

const HistoryView = ({ scans, onView, onDelete }: { scans: ScanRecord[]; onView: (s: ScanRecord) => void; onDelete: (id: string) => void }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Campaign Archive</h2>
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{scans.length} Entries</span>
      </div>

      {scans.length === 0 ? (
        <div className="h-64 rounded-3xl border border-dashed border-white/10 flex items-center justify-center">
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scans.slice().reverse().map(scan => {
            const narrative = extractNarrative(scan.campaign_data);
            return (
              <div
                key={scan.id}
                onClick={() => onView(scan)}
                className="p-6 border border-white/5 bg-zinc-900/40 rounded-2xl hover:bg-zinc-800/60 hover:border-emerald-500/30 transition-all group cursor-pointer backdrop-blur-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                    <Video size={18} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Score</span>
                    <span className="text-lg font-black text-white">{scan.strategy_score || scan.campaign_data.strategy_score || 0}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{new URL(scan.target_url).hostname}</h3>
                  {narrative?.mission_id && (
                    <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
                      {narrative.mission_id}
                    </span>
                  )}
                  <span className="inline-block px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-2 ml-1">
                    {scan.detected_sector || scan.campaign_data.detected_sector || 'B2B'}
                  </span>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase">{new Date(scan.created_at).toLocaleDateString()}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(scan.id); }}
                      className="p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function NexusBrain() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const setWorkspace = useCampaignStore(state => state.setWorkspace);
  const [url, setUrl] = useState('');
  const [view, setView] = useState<'new' | 'history' | 'result'>('new');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [currentResult, setCurrentResult] = useState<ScanRecord | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('nexus_youtube_ads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setScans(data as ScanRecord[]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !user) return;

    setLoading(true);
    const steps = [
      "Extrayendo ADN de marca...",
      "Analizando psicología del consumidor...",
      "Diseñando ángulos creativos...",
      "Estructurando narrativa B2B...",
      "Generando prompts cinemáticos..."
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      setLoadingText(steps[stepIndex]);
      stepIndex = (stepIndex + 1) % steps.length;
    }, 2000);

    try {
      const data = await generateWorkspaceCampaign(url);
      if (!data) throw new Error("No se pudo generar la estrategia.");

      setWorkspace(data);

      const { data: insertData, error: insertError } = await supabase
        .from('nexus_youtube_ads')
        .insert({
          user_id: user.id,
          target_url: url,
          detected_sector: 'B2B Strategy',
          strategy_score: 95,
          campaign_data: data
        })
        .select()
        .single();

      if (insertError) throw insertError;

      clearInterval(interval);
      setCurrentResult(insertData as ScanRecord);
      setScans(prev => [insertData as ScanRecord, ...prev]);
      setView('result');
      toast.success('Análisis completado — Redirigiendo a Social Lab...');

      setTimeout(() => {
        navigate(`/dashboard/social?campaign=${insertData.id}`);
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al procesar la campaña';
      console.error('NexusBrain error:', message);
      clearInterval(interval);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('nexus_youtube_ads')
      .delete()
      .eq('id', id);

    if (!error) {
      setScans(prev => prev.filter(s => s.id !== id));
      toast.success('Campaña eliminada');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="relative">
          <div className="w-32 h-32 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl animate-pulse" />
            <Brain className="text-emerald-400 w-16 h-16 animate-bounce" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_#10b981]">
            <Loader2 className="text-black animate-spin" size={16} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-white tracking-widest uppercase italic">NEXUS BRAIN ANALYZING</h3>
          <p className="text-emerald-400 font-mono text-[10px] uppercase tracking-[0.3em]">{loadingText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white backdrop-blur-3xl shadow-2xl">
            <Video size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">Nexus Brain</h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">YouTube Ads Generation Engine</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView('new')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'new' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            New Engine
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'history' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            History
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'new' && (
          <motion.div
            key="new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-12"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">
                <Sparkles size={12} /> Next-Gen AI Marketing
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none italic uppercase">
                Viralize Any <span className="text-emerald-500">Digital Asset.</span>
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-lg mx-auto">
                Nuestro motor de IA extrae el ADN de tu marca, inyecta psicología de conversión y genera campañas completas para YouTube listas para producción.
              </p>
            </div>

            <form onSubmit={handleAnalyze} className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-3xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
              <div className="relative flex items-center bg-zinc-950 rounded-2xl border border-white/10 p-2 pl-6">
                <Globe className="text-zinc-700" size={20} />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://tu-marca.com o link de producto..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white px-4 py-4 text-lg placeholder-zinc-700 font-medium"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-emerald-500/20"
                >
                  Analyze <ChevronRight size={18} />
                </button>
              </div>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-12">
              {[
                { icon: <Plus size={16} />, label: "4 Formatos" },
                { icon: <Brain size={16} />, label: "AI Rationale" },
                { icon: <Sparkles size={16} />, label: "TTS Simulator" },
                { icon: <Zap size={16} />, label: "CTR Optimized" }
              ].map((item, i) => (
                <div key={i} className="px-4 py-3 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col items-center gap-2">
                  <div className="text-zinc-600">{item.icon}</div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'result' && currentResult && (
          <BentoGridResult
            key="result"
            record={currentResult}
            onBack={() => setView('history')}
          />
        )}

        {view === 'history' && (
          <HistoryView
            key="history"
            scans={scans}
            onView={(s) => { setCurrentResult(s); setView('result'); }}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
