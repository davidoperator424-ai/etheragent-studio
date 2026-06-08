import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Plus, History, BarChart, Users, Settings, LogOut, Play, Copy, 
  Download, Zap, CheckCircle2, AlertCircle, Video, Lock, Loader2, 
  Sparkles, ChevronRight, Volume2, Pause, Eye, Brain, ChevronLeft, 
  Mic, Clapperboard, Globe, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import GlassCard from '@/components/GlassCard';

// --- TYPES ---
interface Asset {
  type: string;
  duration: string;
  hook: string;
  voiceover_script: string;
  visual_description: string;
  on_screen_text: string[];
  music_background: string;
  sound_effects: string;
  call_to_action: string;
  emotional_tone: string;
  pacing_notes: string;
}

interface CampaignData {
  detected_sector: string;
  strategy_score: number;
  angles: string[];
  audience: {
    persona: string;
    psychographics: string;
    pain_points: string;
    desires: string;
  };
  creative_rationale: string;
  assets: Asset[];
  youtube_seo: {
    video_title: string;
    video_description: string;
    hashtags: string[];
  };
  thumbnail_idea: string;
  ab_testing_suggestions: {
    variation_name: string;
    difference: string;
    expected_impact: string;
    psychological_principle: string;
  }[];
}

interface ScanRecord {
  id: string;
  target_url: string;
  detected_sector: string;
  strategy_score: number;
  campaign_data: CampaignData;
  created_at: string;
}

// --- COMPONENTS ---

const VideoPlayerSimulator = ({ asset, isPlaying, progress }: { asset: Asset, isPlaying: boolean, progress: number }) => {
  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 group shadow-2xl">
      {/* Overlay info */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <span className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest">
          {asset.duration}
        </span>
        <span className="px-2 py-1 bg-indigo-500/80 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest">
          {asset.type}
        </span>
      </div>

      {/* Visual content simulator */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-black">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('/noise.svg')]" />
        
        <div className="relative z-10 flex flex-col items-center gap-4 p-8 text-center">
          <Clapperboard className="w-12 h-12 text-indigo-400 opacity-50 mb-4" />
          <h3 className="text-xl font-bold text-white/90 leading-tight">
            Visual Simulation
          </h3>
          <p className="text-sm text-white/50 max-w-xs italic">
            {asset.visual_description.substring(0, 80)}...
          </p>
        </div>

        {/* Text on screen overlay */}
        <div className="absolute bottom-12 inset-x-0 flex items-center justify-center px-8">
           <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-black px-6 py-3 rounded-none font-black text-2xl uppercase tracking-tighter italic transform -skew-x-12 shadow-[8px_8px_0px_rgba(79,70,229,0.5)]"
           >
             {asset.on_screen_text?.[0] || asset.hook}
           </motion.div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 z-30">
        <motion.div 
          className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20 transition-all opacity-0 group-hover:opacity-100">
           <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-xl">
             <Play className="fill-current ml-1" />
           </div>
        </div>
      )}
    </div>
  );
};

const AssetCard = ({ asset }: { asset: Asset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const handleTogglePlay = () => {
    if (!synth) return;

    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      setProgress(0);
    } else {
      const utterance = new SpeechSynthesisUtterance(asset.voiceover_script);
      utterance.lang = 'es-ES';

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(100);
        setTimeout(() => setProgress(0), 1000);
      };

      const duration = parseInt(asset.duration.replace('s', '')) * 1000 || 15000;
      const startTime = Date.now();

      const updateProgress = () => {
        if (!synth.speaking) return;
        const elapsed = Date.now() - startTime;
        const p = Math.min((elapsed / duration) * 100, 100);
        setProgress(p);
        if (p < 100) requestAnimationFrame(updateProgress);
      };

      synth.speak(utterance);
      requestAnimationFrame(updateProgress);
    }
  };

  useEffect(() => {
    return () => synth?.cancel();
  }, [synth]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Left: Video Simulator & Visuals */}
      <div className="space-y-6">
        <div onClick={handleTogglePlay} className="cursor-pointer">
          <VideoPlayerSimulator asset={asset} isPlaying={isPlaying} progress={progress} />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <GlassCard className="p-5 border-white/5 bg-zinc-900/40">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-indigo-400 mb-3 flex items-center gap-2">
              <Zap size={12} /> The Hook (First 3s)
            </h4>
            <p className="text-sm font-medium text-white italic leading-relaxed">
              "{asset.hook}"
            </p>
          </GlassCard>

          <GlassCard className="p-5 border-white/5 bg-zinc-900/40">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 mb-3 flex items-center gap-2">
              <Eye size={12} /> Visual Prompt (AI Ready)
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {asset.visual_description}
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Right: Details & Scripts */}
      <div className="space-y-6">
        <div className="bg-zinc-950/50 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Volume2 size={14} className="text-indigo-400" /> Voiceover Script
            </h4>
            <div className="flex gap-2">
               <button onClick={handleTogglePlay} className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
               </button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-serif italic italic-light">
              {asset.voiceover_script}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Audio & SFX</h5>
              <p className="text-[11px] text-zinc-300 leading-snug">{asset.music_background}</p>
            </div>
            <div>
              <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">CTA</h5>
              <p className="text-[11px] text-zinc-300 leading-snug font-bold text-indigo-400">{asset.call_to_action}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Tone</h5>
              <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] text-indigo-400 font-bold uppercase">
                {asset.emotional_tone}
              </span>
            </div>
            <div>
              <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Pacing</h5>
              <p className="text-[11px] text-zinc-300 leading-snug">{asset.pacing_notes}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4">
          <button 
            onClick={() => handleCopyText(asset.visual_description, 'Prompt')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <Sparkles size={14} className="text-emerald-400" /> Prompt Visual
          </button>
          <button 
            onClick={() => handleCopyText(asset.voiceover_script, 'Guion')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <Mic size={14} className="text-indigo-400" /> Voiceover
          </button>
        </div>
      </div>
    </div>
  );
};

const ResultView = ({ record, onBack }: { record: ScanRecord, onBack?: () => void }) => {
  const data = record.campaign_data;
  const [activeTab, setActiveTab] = useState(data.assets[0]?.type);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-20"
    >
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest mb-4">
              <ChevronLeft size={14} /> Back to history
            </button>
          )}
          <h2 className="text-3xl font-black text-white tracking-tighter">
            INTELLIGENCE REPORT
          </h2>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              {data.detected_sector}
            </span>
            <span className="text-zinc-500 text-xs font-mono">
              Target: {new URL(record.target_url).hostname}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Strategy Score</span>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-black text-white leading-none">{data.strategy_score}</span>
              <span className="text-xl font-bold text-zinc-700 leading-none">/100</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Brain className="text-indigo-400 relative z-10" size={32} />
          </div>
        </div>
      </div>

      {/* Audience persona */}
      <GlassCard className="p-8 border-white/10 bg-zinc-900/20 backdrop-blur-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Users size={120} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <Users size={14} /> Target Persona
            </h4>
            <h3 className="text-xl font-bold text-white">{data.audience.persona}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed italic">
              "{data.audience.psychographics}"
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Pain Points</h5>
              <p className="text-xs text-zinc-300 leading-relaxed">{data.audience.pain_points}</p>
            </div>
            <div className="space-y-2">
              <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Core Desires</h5>
              <p className="text-xs text-zinc-300 leading-relaxed">{data.audience.desires}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Creative Rationale */}
      <div className="space-y-6">
        <h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
           Creative Rationale
        </h4>
        <div className="columns-1 md:columns-2 gap-8 space-y-4 text-sm text-zinc-400 leading-relaxed font-serif">
          {data.creative_rationale.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>

      {/* Assets Tabs */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">
            Creative Assets Matrix
          </h4>
          <div className="flex gap-2">
            {data.assets.map(asset => (
              <button
                key={asset.type}
                onClick={() => setActiveTab(asset.type)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === asset.type 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {asset.type.replace('YouTube', '')}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {data.assets.map(asset => (
            activeTab === asset.type && (
              <motion.div
                key={asset.type}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AssetCard asset={asset} />
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* SEO & A/B Testing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard className="p-8 border-white/10 bg-zinc-950/40">
           <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">
             YouTube SEO Engine
           </h4>
           <div className="space-y-6">
             <div>
               <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">High CTR Title</h5>
               <p className="text-sm font-bold text-white">{data.youtube_seo.video_title}</p>
             </div>
             <div>
               <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Hashtag Strategy</h5>
               <div className="flex flex-wrap gap-2">
                 {data.youtube_seo.hashtags.map(tag => (
                   <span key={tag} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-zinc-400">
                     {tag}
                   </span>
                 ))}
               </div>
             </div>
             <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
               <h5 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Clapperboard size={12} /> Thumbnail Concept
               </h5>
               <p className="text-xs text-zinc-400 leading-relaxed italic">{data.thumbnail_idea}</p>
             </div>
           </div>
        </GlassCard>

        <GlassCard className="p-8 border-white/10 bg-zinc-950/40">
           <h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] mb-6">
             A/B Testing Experiments
           </h4>
           <div className="space-y-6">
             {data.ab_testing_suggestions.map((test, i) => (
               <div key={i} className="border-b border-white/5 last:border-0 pb-4 last:pb-0 space-y-2">
                 <div className="flex justify-between items-center">
                   <h5 className="text-xs font-bold text-white">{test.variation_name}</h5>
                   <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{test.expected_impact}</span>
                 </div>
                 <p className="text-[11px] text-zinc-400">{test.difference}</p>
                 <div className="flex items-center gap-2">
                   <span className="text-[8px] font-mono text-zinc-600 uppercase">Principle:</span>
                   <span className="text-[9px] text-emerald-500/80 font-medium italic">{test.psychological_principle}</span>
                 </div>
               </div>
             ))}
           </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

const HistoryView = ({ scans, onView, onDelete }: { scans: ScanRecord[], onView: (s: ScanRecord) => void, onDelete: (id: string) => void }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Campaign Archive</h2>
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{scans.length} Entries</span>
      </div>

      {scans.length === 0 ? (
        <div className="h-64 rounded-3xl border border-dashed border-white/10 flex flex-center items-center justify-center">
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scans.slice().reverse().map(scan => (
            <div
              key={scan.id}
              onClick={() => onView(scan)}
              className="p-6 border border-white/5 bg-zinc-900/40 rounded-2xl hover:bg-zinc-800/60 hover:border-indigo-500/30 transition-all group cursor-pointer backdrop-blur-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-black transition-all">
                  <Video size={18} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Score</span>
                  <span className="text-lg font-black text-white">{scan.strategy_score}</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{new URL(scan.target_url).hostname}</h3>
                <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-4">
                  {scan.detected_sector}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default function NexusBrain() {
  const { user } = useAuth();
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
      setScans(data);
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
      "Escribiendo guiones con timing...",
      "Generando prompts cinemáticos...",
      "Estructurando A/B Testing..."
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      setLoadingText(steps[stepIndex]);
      stepIndex = (stepIndex + 1) % steps.length;
    }, 2000);

    try {
      const { data, error } = await supabase.functions.invoke('nexus-brain', {
        body: { url }
      });

      if (error) throw error;

      // Persistence
      const { data: insertData, error: insertError } = await supabase
        .from('nexus_youtube_ads')
        .insert({
          user_id: user.id,
          target_url: url,
          detected_sector: data.detected_sector,
          strategy_score: data.strategy_score,
          campaign_data: data
        })
        .select()
        .single();

      if (insertError) throw insertError;

      clearInterval(interval);
      setCurrentResult(insertData);
      setScans(prev => [insertData, ...prev]);
      setView('result');
      toast.success('Análisis completado con éxito');
    } catch (error: any) {
      console.error(error);
      clearInterval(interval);
      toast.error(error.message || 'Error al procesar la campaña');
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
          <div className="w-32 h-32 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl animate-pulse" />
            <Brain className="text-indigo-400 w-16 h-16 animate-bounce" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_#10b981]">
            <Loader2 className="text-black animate-spin" size={16} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-white tracking-widest uppercase italic">NEXUS BRAIN ANALYZING</h3>
          <p className="text-indigo-400 font-mono text-[10px] uppercase tracking-[0.3em]">{loadingText}</p>
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
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'new' ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            New Engine
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'history' ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:text-white'}`}
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
                Viralize Any <span className="text-indigo-500">Digital Asset.</span>
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-lg mx-auto">
                Nuestro motor de IA extrae el ADN de tu marca, inyecta psicología de conversión y genera campañas completas para YouTube listas para producción.
              </p>
            </div>

            <form onSubmit={handleAnalyze} className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-3xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
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
                  className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-indigo-500/20"
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
          <ResultView 
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
