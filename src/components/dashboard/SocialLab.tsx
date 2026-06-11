import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Sparkles, Zap, Loader2, Upload, Video, Image as ImageIcon, Heart, MessageCircle, Share2, MoreHorizontal, UserCircle2, Bookmark, Send, Play, ArrowRight, Brain, Copy, Eye, Clapperboard, CheckCircle2, X, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaignStore, SelectedVideoMeta } from '@/store/useCampaignStore';
import { CampaignWorkspace } from '@/lib/geminiService';
import { toast } from 'sonner';

interface CampaignAsset {
  type: string;
  duration: string;
  hook: string;
  narrative_body?: string;
  voiceover_script: string;
  visual_description: string;
  on_screen_text: string[];
  music_background: string;
  sound_effects: string;
  call_to_action: string;
  emotional_tone: string;
  pacing_notes: string;
  video_url?: string;
  thumbnail_url?: string;
}

type CampaignDataPayload = CampaignWorkspace & {
  detected_sector?: string;
  strategy_score?: number;
  angles?: string[];
  creative_rationale?: string;
  assets?: CampaignAsset[];
  audience?: { persona: string; psychographics: string; pain_points: string; desires: string; };
  youtube_seo?: { video_title: string; video_description: string; hashtags: string[]; };
  thumbnail_idea?: string;
  video_url?: string;
};

interface CampaignRecord {
  id: string;
  target_url: string;
  detected_sector: string;
  strategy_score: number;
  campaign_data: CampaignDataPayload;
  created_at: string;
}

function parseVisualSections(markdown: string) {
  const sections: { label: string; time: string; lines: string[] }[] = [];
  const lines = markdown.split('\n');
  let current: { label: string; time: string; lines: string[] } | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    const headerMatch = line.match(/^(HOOK|DESARROLLO|OUTRO\s*\/?\s*BUCLE)\s*\(([^)]+)\)/i);
    if (headerMatch) {
      if (current) sections.push(current);
      current = { label: headerMatch[1], time: headerMatch[2], lines: [] };
    } else if (current) {
      current.lines.push(line || ' ');
    }
  }
  if (current) sections.push(current);
  return sections;
}

function buildMasterPrompt(asset: CampaignAsset): string {
  const lines = [
    `## ${asset.type} (${asset.duration}s)`,
    '',
    `### Hook`,
    asset.hook,
    '',
    `### Voiceover`,
    asset.voiceover_script,
    '',
    `### Visual Description`,
    asset.visual_description,
    '',
    `### Textos en pantalla`,
    asset.on_screen_text.map(t => `- "${t}"`).join('\n'),
    '',
    `### Background Music`,
    asset.music_background,
    '',
    `### Sound Effects`,
    asset.sound_effects,
    '',
    `### Call to Action`,
    asset.call_to_action,
    '',
    `### Emotional Tone`,
    asset.emotional_tone,
    '',
    `### Pacing`,
    asset.pacing_notes,
  ];
  return lines.join('\n');
}

export default function SocialLab() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const selectedVideo = useCampaignStore(state => state.selectedVideo);

  const [campaign, setCampaign] = useState<CampaignRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAssetIndex, setActiveAssetIndex] = useState(0);
  const [videoStarted, setVideoStarted] = useState(false);

  useEffect(() => {
    // Reset video state when switching assets
    setVideoStarted(false);
  }, [activeAssetIndex]);
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [videoFormat, setVideoFormat] = useState<'reel' | 'feed' | 'story'>('reel');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setWorkspace = useCampaignStore(state => state.setWorkspace);
  const setSelectedVideo = useCampaignStore(state => state.setSelectedVideo);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!user) { setLoading(false); return; }
      const campaignId = searchParams.get('campaign');
      try {
        let data, error;
        if (campaignId) {
          const res = await supabase.from('nexus_youtube_ads').select('*').eq('id', campaignId).single();
          data = res.data;
          error = res.error;
        } else {
          const res = await supabase.from('nexus_youtube_ads').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
          data = res.data;
          error = res.error;
        }
        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setCampaign(data as CampaignRecord);
          // Sync with store for other components
          setWorkspace(data.campaign_data);
        }
      } catch (err) {
        console.error('Error fetching campaign:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [searchParams, user, setWorkspace]);

  // Detectar si es el nuevo formato B2B o el antiguo
  const campaignData = campaign?.campaign_data as CampaignDataPayload;
  const isNewFormat = !!campaignData?.hook;

  // Construir el asset base unificando ambas estructuras
  const baseAsset = isNewFormat ? {
    type: 'B2B Strategy',
    duration: '30-60',
    on_screen_text: campaignData.on_screen_text || [],
    visual_description: campaignData.visual_description,
    call_to_action: campaignData.call_to_action,
    hook: campaignData.hook,
    narrative_body: campaignData.narrative_body,
    voiceover_script: campaignData.narrative_body, // Reutilizamos narrativa como voiceover
    music_background: 'Ambient Tech / Corporate Modern',
    sound_effects: 'UI Clicks, Digital Swish',
    emotional_tone: 'Professional & Innovative',
    pacing_notes: 'Dynamic & Precise',
    video_url: null,
    thumbnail_url: null
  } : campaignData?.assets?.[activeAssetIndex];

  // Override video_url if an asset was selected from the VisualMatrix
  const currentAsset = baseAsset ? {
    ...baseAsset,
    video_url: selectedVideo?.url || baseAsset.video_url,
    thumbnail_url: selectedVideo?.thumbnail || baseAsset.thumbnail_url
  } : null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const handleCopyMaster = () => {
    if (!currentAsset) return;
    const prompt = buildMasterPrompt(currentAsset);
    handleCopy(prompt, 'Prompt Maestro');
  };

  const uploadVideo = useCallback(async (file: File) => {
    if (!campaign || !currentAsset || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'mp4';
      const timestamp = Date.now();
      const safeType = (currentAsset.type || 'video').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `social/${campaign.id}/${safeType}_${timestamp}_${safeName}`;

      // 1. Upload to campaign_assets (primary) with fallback to visual-assets
      const { error: uploadError } = await supabase.storage
        .from('campaign_assets')
        .upload(filePath, file);

      let publicUrl: string;
      if (uploadError) {
        if (uploadError.message?.includes('bucket') || uploadError.message?.includes('not found')) {
          const legacyPath = `social_${campaign.id}_${timestamp}.${ext}`;
          const { error: legacyError } = await supabase.storage
            .from('visual-assets')
            .upload(legacyPath, file);
          if (legacyError) {
            if (legacyError.message?.includes('policy') || legacyError.message?.includes('row-level')) {
              throw new Error('Permiso denegado. Asegúrate de estar autenticado.');
            }
            throw legacyError;
          }
          publicUrl = supabase.storage.from('visual-assets').getPublicUrl(legacyPath).data.publicUrl;
        } else {
          throw uploadError;
        }
      } else {
        publicUrl = supabase.storage.from('campaign_assets').getPublicUrl(filePath).data.publicUrl;
      }

      // 2. Build metadata and save to visual_assets table
      const assetId = `social_${campaign.id}_${safeType}_${timestamp}`;
      const meta: SelectedVideoMeta = {
        url: publicUrl,
        thumbnail: publicUrl,
        assetId,
        assetType: 'uploaded',
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      };

      await supabase.from('visual_assets').upsert({
        id: assetId,
        url: publicUrl,
        user_id: user.id,
        campaign_id: campaign.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        asset_type: 'uploaded',
        thumbnail_url: publicUrl,
        bucket_path: filePath,
        updated_at: new Date(),
      });

      // 3. Bridge to Zustand so phone mockup renders immediately
      setSelectedVideo(meta);

      // 4. Also persist video_url into campaign (graceful if RLS blocks)
      let updatedCampaignData;
      if (isNewFormat) {
        updatedCampaignData = { ...campaign.campaign_data, video_url: publicUrl };
      } else {
        const updatedAssets = (campaign.campaign_data as any).assets.map((a: any, i: number) =>
          i === activeAssetIndex ? { ...a, video_url: publicUrl } : a
        );
        updatedCampaignData = { ...campaign.campaign_data, assets: updatedAssets };
      }

      const { error: updateError } = await supabase
        .from('nexus_youtube_ads')
        .update({ campaign_data: updatedCampaignData })
        .eq('id', campaign.id);

      if (updateError) {
        console.warn('nexus_youtube_ads update skipped (RLS or network):', updateError.message);
      } else {
        setCampaign({ ...campaign, campaign_data: updatedCampaignData as any });
      }

      toast.success('Video subido y listo en tu campaña');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir video';
      console.error('Upload error:', message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }, [campaign, currentAsset, activeAssetIndex, user, isNewFormat, setSelectedVideo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadVideo(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      uploadVideo(file);
    } else {
      toast.error('Solo se permiten archivos de video');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const sections = currentAsset ? parseVisualSections(currentAsset.visual_description) : [];

  const sectionColors: Record<string, string> = {
    'HOOK': 'border-l-emerald-500 bg-emerald-500/5',
    'DESARROLLO': 'border-l-indigo-500 bg-indigo-500/5',
    'OUTRO': 'border-l-amber-500 bg-amber-500/5',
    'OUTRO / BUCLE': 'border-l-amber-500 bg-amber-500/5',
  };

  const sectionLabels: Record<string, string> = {
    'HOOK': 'HOOK',
    'DESARROLLO': 'DESARROLLO',
    'OUTRO': 'OUTRO / BUCLE',
    'OUTRO / BUCLE': 'OUTRO / BUCLE',
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
          <Loader2 className="w-16 h-16 text-emerald-400 animate-spin relative z-10" />
        </div>
        <p className="text-emerald-400/80 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">Cargando Social Lab...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8 text-center px-4">
        <div className="w-24 h-24 rounded-3xl bg-zinc-900/60 border border-white/10 flex items-center justify-center">
          <Brain className="w-12 h-12 text-zinc-700" />
        </div>
        <div className="space-y-3 max-w-md">
          <h2 className="text-2xl font-black text-white tracking-tight">Sin Campaña Activa</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Inicia una ingestión en el Nexus Brain para generar tu primera campaña. Los datos fluirán automáticamente aquí.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/nexus-brain')}
          className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-3"
        >
          <Brain size={18} /> Ir al Nexus Brain <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const data = campaign.campaign_data;

  const TikTokReelOverlay = () => (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 bg-gradient-to-b from-black/40 via-transparent to-black/60 pt-10">
      <div className="flex justify-between items-start mt-2">
        <span className="text-white font-bold text-lg drop-shadow-md">Para ti</span>
        <div className="w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur rounded-full"><Sparkles size={16} className="text-white" /></div>
      </div>
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col gap-2 max-w-[70%]">
          <div className="flex items-center gap-2">
            <UserCircle2 size={24} className="text-white" />
            <span className="text-white font-bold drop-shadow-md">@EtherAgent</span>
          </div>
          <p className="text-white text-sm drop-shadow-md line-clamp-2">{currentAsset?.hook || 'Campaña AI generada'}</p>
        </div>
        <div className="flex flex-col items-center gap-5 pb-2">
          {[{ icon: Heart, count: '1.2M' }, { icon: MessageCircle, count: '45K' }, { icon: Bookmark, count: '8K' }, { icon: Share2, count: '11K' }].map(({ icon: Icon, count }) => (
            <div key={count} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center"><Icon size={20} className="text-white" fill="white" /></div>
              <span className="text-white text-xs drop-shadow-md">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col xl:flex-row min-h-screen w-full bg-[#050505] text-white p-3 sm:p-4 md:p-8 gap-4 sm:gap-8 pb-32 overflow-x-hidden overflow-y-auto">

      {/* ── LEFT PANEL: Structured Prompt Display ── */}
      <div className="flex-1 flex flex-col max-w-3xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full border-2 border-emerald-500/50 flex items-center justify-center bg-zinc-900">
              <span className="font-black text-2xl text-emerald-500">N</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Neural Strategy Engine</h2>
              <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase">B2B Campaign Director • AI Core</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              {data.detected_sector}
            </span>
            <span className="text-zinc-500 font-mono text-xs">{data.strategy_score}/100</span>
          </div>
        </header>

        <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col relative shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-500" />
              <span className="text-emerald-500 text-[10px] font-mono tracking-widest uppercase">Campaña: {new URL(campaign.target_url).hostname}</span>
            </div>
            {currentAsset && (
              <button
                onClick={handleCopyMaster}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                <Clapperboard size={14} /> Copiar Prompt Maestro
              </button>
            )}
          </div>

          {/* Format Tabs - Solo se muestran si no es el nuevo formato o si hay múltiples assets */}
          {!isNewFormat && data.assets && data.assets.length > 0 && (
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest shrink-0">Formatos:</span>
              {data.assets.map((asset: CampaignAsset, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveAssetIndex(i)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase transition-all active:scale-95 shrink-0 ${
                    activeAssetIndex === i
                      ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 border border-white/5'
                  }`}
                >
                  {asset.type} ({asset.duration}s)
                </button>
              ))}
            </div>
          )}

          {/* Hook & Narrative Body (New Format) or Marketing Angles (Legacy) */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/50 backdrop-blur-md border border-white/5 p-5 rounded-2xl w-full mb-5">
            {isNewFormat ? (
              <div className="space-y-4">
                <div>
                  <p className="text-emerald-500 text-[10px] font-mono tracking-widest uppercase mb-2 flex items-center gap-2">
                    <Zap size={12} /> Gancho de Alto Impacto
                  </p>
                  <blockquote className="border-l-2 border-emerald-500/30 pl-4 py-1 italic text-zinc-200 font-medium">
                    "{currentAsset?.hook}"
                  </blockquote>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase mb-2">Narrativa de Campaña</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {currentAsset?.narrative_body}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-zinc-300 text-sm font-medium mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-500" /> Ángulos de Marketing
                </p>
                <div className="p-3 bg-black/60 border border-emerald-500/20 rounded-lg font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap">
                  {data.angles?.map((angle: string, i: number) => `${i + 1}. ${angle}`).join('\n') || 'Sin ángulos detectados'}
                </div>
              </>
            )}
          </motion.div>

          {/* Visual Description / Prompt Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/50 border border-white/5 p-5 rounded-2xl w-full mb-5 group relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-zinc-300 text-sm font-medium flex items-center gap-2">
                <Video size={14} className="text-indigo-400" /> Estrategia Creativa Procesada
              </p>
              <button 
                onClick={() => currentAsset && handleCopy(currentAsset.visual_description, 'Visual Description')}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white"
                title="Copiar Prompt"
              >
                <Copy size={14} />
              </button>
            </div>
            <div className="p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-xs text-zinc-400 leading-relaxed max-h-[250px] overflow-y-auto custom-scrollbar">
              {currentAsset?.visual_description || 'Procesando prompt visual...'}
            </div>
          </motion.div>

          {/* Structured Visual Description (Only for Legacy if it matches the format) */}
          {!isNewFormat && currentAsset && sections.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mb-5">
              {sections.map((section, i) => (
                <div
                  key={i}
                  className={`border-l-4 ${sectionColors[sectionLabels[section.label]] || 'border-l-zinc-600 bg-zinc-900/30'} rounded-r-xl p-4`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                      section.label === 'HOOK' ? 'text-emerald-400' :
                      section.label === 'DESARROLLO' ? 'text-indigo-400' : 'text-amber-400'
                    }`}>
                      {sectionLabels[section.label] || section.label}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-600">({section.time})</span>
                  </div>
                  {section.lines.map((line, j) => {
                    const visualMatch = line.match(/^-\s*(?:🎥\s*)?Visual:\s*(.+)/i);
                    const textMatch = line.match(/^-\s*(?:✏️\s*)?Texto(?:\s*en\s*pantalla)?:\s*(?:\[)?(.+?)(?:\])?$/i);
                    const sfxMatch = line.match(/^-\s*(?:🔊\s*)?SFX:\s*(.+)/i);
                    const voiceoverMatch = line.match(/^-\s*(?:🎙️\s*)?Voiceover:\s*"(.+)"\s*$/i);
                    const musicMatch = line.match(/^-\s*(?:🎵\s*)?Music:\s*(.+)/i);
                    const ctaMatch = line.match(/^-\s*(?:👉\s*)?CTA:\s*(.+)/i);
                    const hookMatch = line.match(/^-\s*Hook:\s*(.+)/i);

                    if (visualMatch) {
                      return (
                        <p key={j} className="text-xs text-zinc-200 leading-relaxed mb-1.5 pl-0">
                          <span className="text-emerald-500 font-mono text-[10px] uppercase tracking-wider mr-2">🎬 Visual:</span>
                          {visualMatch[1]}
                        </p>
                      );
                    }
                    if (textMatch) {
                      return (
                        <p key={j} className="text-xs text-indigo-300 leading-relaxed mb-1.5 pl-0">
                          <span className="text-indigo-400 font-mono text-[10px] uppercase tracking-wider mr-2">📝 Texto:</span>
                          "{textMatch[1]}"
                        </p>
                      );
                    }
                    if (sfxMatch) {
                      return (
                        <p key={j} className="text-xs text-amber-300/80 leading-relaxed mb-1.5 pl-0">
                          <span className="text-amber-400 font-mono text-[10px] uppercase tracking-wider mr-2">🔊 SFX:</span>
                          {sfxMatch[1]}
                        </p>
                      );
                    }
                    if (voiceoverMatch) {
                      return (
                        <p key={j} className="text-xs text-zinc-300 italic leading-relaxed mb-1.5 pl-0 border-l-2 border-zinc-700 pl-3 ml-1">
                          <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider block mb-0.5">🎙️ Voiceover</span>
                          "{voiceoverMatch[1]}"
                        </p>
                      );
                    }
                    if (ctaMatch) {
                      return (
                        <p key={j} className="text-xs text-emerald-300 font-bold leading-relaxed mb-1.5 pl-0">
                          <span className="text-emerald-400 font-mono text-[10px] uppercase tracking-wider mr-2">👉 CTA:</span>
                          {ctaMatch[1]}
                        </p>
                      );
                    }
                    if (musicMatch) {
                      return (
                        <p key={j} className="text-xs text-violet-300/80 leading-relaxed mb-1.5 pl-0">
                          <span className="text-violet-400 font-mono text-[10px] uppercase tracking-wider mr-2">🎵 Música:</span>
                          {musicMatch[1]}
                        </p>
                      );
                    }
                    if (hookMatch) {
                      return (
                        <p key={j} className="text-xs text-pink-300/80 font-medium leading-relaxed mb-1.5 pl-0">
                          <span className="text-pink-400 font-mono text-[10px] uppercase tracking-wider mr-2">🪝 Hook:</span>
                          {hookMatch[1]}
                        </p>
                      );
                    }
                    if (line.trim()) {
                      return (
                        <p key={j} className="text-xs text-zinc-400 leading-relaxed mb-1 pl-0">
                          {line}
                        </p>
                      );
                    }
                    return <div key={j} className="h-1" />;
                  })}
                </div>
              ))}
            </motion.div>
          )}

          {/* Asset Details Grid */}
          {currentAsset && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl w-full mb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">Tono Emocional</h5>
                    <p className="text-xs text-zinc-300 capitalize">{currentAsset.emotional_tone}</p>
                  </div>
                  <div>
                    <h5 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">Pacing / Ritmo</h5>
                    <p className="text-xs text-zinc-300">{currentAsset.pacing_notes}</p>
                  </div>
                  <div>
                    <h5 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">Call to Action</h5>
                    <p className="text-xs text-emerald-400 font-bold">{currentAsset.call_to_action}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">Background Audio</h5>
                    <p className="text-xs text-zinc-300">{currentAsset.music_background}</p>
                  </div>
                  {currentAsset.on_screen_text?.length > 0 && (
                    <div>
                      <h5 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">Textos Destacados</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {currentAsset.on_screen_text.map((t: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] text-indigo-300 font-mono">"{t}"</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Copy buttons */}
          {currentAsset && (
            <div className="flex gap-3">
              <button onClick={handleCopyMaster} className="flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95">
                <Clapperboard size={14} /> Copiar Prompt Maestro
              </button>
              <button onClick={() => handleCopy(currentAsset.visual_description, 'Prompt Visual')} className="flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all active:scale-95">
                <Eye size={14} className="text-emerald-400" /> Copiar Visual
              </button>
            </div>
          )}



          {/* Audience Insights */}
          {data.audience && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-zinc-900/50 border border-white/5 p-5 rounded-2xl w-full mt-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <UserCircle2 size={16} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-zinc-200 text-sm font-semibold mb-1">Target Persona: {data.audience.persona}</p>
                  <p className="text-xs text-zinc-500 italic leading-relaxed">"{data.audience.psychographics}"</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Phone Preview + Upload ── */}
      <div className="w-full xl:w-[420px] shrink-0 flex flex-col items-center pt-2">

        <div className="w-[280px] sm:w-[300px] md:w-[340px] flex p-1 bg-[#111] rounded-xl border border-white/10 mb-4">
          <button onClick={() => setMediaType('video')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] text-xs font-bold rounded-lg transition-all active:scale-95 ${mediaType === 'video' ? 'bg-emerald-500/20 text-emerald-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Video size={14} /> VIDEO
          </button>
          <button onClick={() => setMediaType('image')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] text-xs font-bold rounded-lg transition-all active:scale-95 ${mediaType === 'image' ? 'bg-emerald-500/20 text-emerald-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <ImageIcon size={14} /> IMAGE
          </button>
        </div>

        <div className="w-[280px] sm:w-[300px] md:w-[340px] flex gap-1.5 mb-4">
          {(['reel', 'feed', 'story'] as const).map(fmt => (
            <button key={fmt} onClick={() => setVideoFormat(fmt)} className={`px-3 py-2 min-h-[40px] sm:min-h-[32px] rounded-md text-[10px] font-mono uppercase transition-all active:scale-95 ${videoFormat === fmt ? 'bg-emerald-500 text-black font-bold' : 'bg-[#111] text-zinc-500 border border-white/5 hover:bg-zinc-800'}`}>
              {fmt}
            </button>
          ))}
        </div>

        {/* Phone Frame with Video Player */}
        <div className="relative w-[280px] sm:w-[300px] md:w-[340px] h-[560px] sm:h-[640px] md:h-[720px] bg-black border-[6px] sm:border-[8px] border-[#1c1c1e] rounded-[2.5rem] sm:rounded-[3.5rem] shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col shrink-0">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-50" />

          <div className="flex-1 relative w-full h-full bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {currentAsset?.video_url ? (
                <div key="video-container" className="absolute inset-0 w-full h-full">
                  {!videoStarted && (currentAsset.thumbnail_url || currentAsset.video_url) && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 z-20"
                    >
                      <img 
                        src={currentAsset.thumbnail_url || currentAsset.video_url} 
                        className="w-full h-full object-cover"
                        alt="Video thumbnail"
                        onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000')}
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setVideoStarted(true)}
                          className="w-20 h-20 rounded-full bg-emerald-500/80 backdrop-blur-md flex items-center justify-center text-black shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                        >
                          <Play size={32} className="ml-1" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                  <video
                    key={currentAsset.video_url}
                    src={currentAsset.video_url}
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    controls={videoStarted}
                    autoPlay={videoStarted}
                    onPlay={() => setVideoStarted(true)}
                    loop
                    playsInline
                  />

                  {/* ── On-Screen Text Overlays (Shorts/Reels Style) ── */}
                  {videoStarted && currentAsset.on_screen_text.length > 0 && (
                    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center">
                      <AnimatePresence>
                        {currentAsset.on_screen_text.map((text, i) => {
                          const positions = [
                            { top: '18%' },
                            { top: '45%' },
                            { top: '68%' },
                          ];
                          const pos = positions[i] || { top: `${35 + i * 15}%` };
                          return (
                            <motion.div
                              key={`ost-${i}`}
                              initial={{ opacity: 0, y: 40, scale: 0.85 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -30, scale: 0.85 }}
                              transition={{
                                delay: i * 2.5,
                                duration: 0.6,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              className="absolute w-full flex justify-center px-6"
                              style={pos}
                            >
                              <span
                                className="inline-block bg-zinc-900/60 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl text-white font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-tight leading-none shadow-2xl text-center max-w-[90%]"
                                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.5)' }}
                              >
                                {text}
                              </span>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                >
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/20 via-indigo-500/10 to-transparent" />
                    <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-gradient-to-tl from-indigo-500/20 to-transparent blur-2xl" />
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-4 max-w-[80%]">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
                      <Sparkles className="w-8 h-8 text-emerald-400" />
                    </div>

                    {currentAsset?.on_screen_text?.[0] && (
                      <motion.div
                        key={activeAssetIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white text-black px-5 py-2.5 rounded-none font-black text-lg uppercase tracking-tighter italic transform -skew-x-6 shadow-[6px_6px_0px_rgba(16,185,129,0.5)] mb-3"
                      >
                        {currentAsset.on_screen_text[0]}
                      </motion.div>
                    )}

                    <p className="text-xs text-zinc-400 leading-relaxed italic line-clamp-4">
                      {currentAsset?.visual_description?.substring(0, 120) || 'Simulación visual de campaña'}...
                    </p>

                    {currentAsset?.call_to_action && (
                      <div className="mt-3 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                        <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">{currentAsset.call_to_action}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {videoFormat === 'reel' && !currentAsset?.video_url && <TikTokReelOverlay />}

            {currentAsset?.video_url && (
              <div className="absolute top-8 left-0 w-full flex justify-center z-30 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-full text-[10px] text-emerald-300 font-mono tracking-widest uppercase shadow-lg flex items-center gap-1.5">
                    <CheckCircle2 size={10} /> Video Renderizado
                  </span>
                  {selectedVideo?.assetType && (
                    <span className={`px-3 py-1.5 backdrop-blur-md border rounded-full text-[9px] font-mono tracking-widest uppercase shadow-lg ${
                      selectedVideo.assetType === 'ai_generated'
                        ? 'bg-indigo-500/20 border-indigo-400/30 text-indigo-300'
                        : 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                    }`}>
                      🤖 {selectedVideo.assetType === 'ai_generated' ? 'Fal.ai' : 'Manual'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {!currentAsset?.video_url && (
              <div className="absolute top-8 left-0 w-full flex justify-center z-30 pointer-events-none">
                <span className="px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-full text-[10px] text-emerald-300 font-mono tracking-widest uppercase shadow-lg">
                  Campaña Activa
                </span>
              </div>
            )}

            <div className="absolute bottom-24 left-4 flex flex-col gap-2 z-40 pointer-events-none">
              {['TikTok', 'IG Reels', 'YT Shorts'].map((platform, i) => (
                <motion.div key={platform} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.5 }} className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-zinc-800 rounded-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
                  <span className="text-[10px] text-white font-mono">{platform}: LIVE</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── UPLOAD DROPZONE ── */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 w-[280px] sm:w-[300px] md:w-[340px] border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
              : 'border-zinc-700 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileChange}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="text-emerald-400 animate-spin" />
              <span className="text-xs text-zinc-400 font-mono">Subiendo video...</span>
            </div>
          ) : currentAsset?.video_url ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 size={24} className="text-emerald-500" />
              <span className="text-xs text-emerald-400 font-mono">Video subido</span>
              <span className="text-[10px] text-zinc-600">Click para reemplazar</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FileUp size={24} className="text-zinc-500 group-hover:text-zinc-300" />
              <span className="text-xs text-zinc-400 font-mono">Sube tu MP4 renderizado</span>
              <span className="text-[10px] text-zinc-600">Drag & drop o click para seleccionar</span>
            </div>
          )}
        </div>

        {/* SEO / Hashtags */}
        {data.youtube_seo && (
          <div className="mt-4 border-t border-white/10 pt-4 w-[280px] sm:w-[300px] md:w-[340px]">
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">YouTube SEO</h4>
            <p className="text-sm font-bold text-white mb-2 line-clamp-2">{data.youtube_seo.video_title}</p>
            <div className="flex flex-wrap gap-1.5">
              {data.youtube_seo.hashtags?.map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] text-zinc-400">{tag}</span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/dashboard/nexus-brain')}
          className="mt-6 w-[280px] sm:w-[300px] md:w-[340px] relative group overflow-hidden rounded-xl p-[1px]"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity" />
          <div className="relative px-6 py-4 bg-zinc-950 rounded-xl flex items-center justify-between transition-all group-hover:bg-zinc-900">
            <div className="flex flex-col text-left">
              <span className="text-white font-bold text-sm">Nueva Campaña</span>
              <span className="text-zinc-500 text-[11px] font-mono">Volver al Nexus Brain</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 group-hover:scale-110 transition-transform">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
