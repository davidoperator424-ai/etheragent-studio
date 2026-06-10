import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useTokenStore } from '@/store/useTokenStore';
import { useCampaignStore } from '@/store/useCampaignStore';
import {
  Upload, Loader2, CheckCircle2, Image as ImageIcon,
  Target, Globe, Activity, DollarSign, Layout,
  MonitorPlay, Film, Smartphone, Zap, Play, ShieldAlert,
  Sparkles, AlertCircle, Video
} from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/GlassCard';

// ── Fal.ai Configuration (parametrizable) ──
const FAL_AI_MODEL = 'fal-ai/luma-dream-machine';

const MISSION_ASSETS = {
  ecommerce: [
    { id: 'demo_ecommerce_hub', agent: 'Marcus', title: 'Brand Core', type: 'Logo/Static', duration: 'Static', icon: Layout },
    { id: 'demo_ecommerce_social', agent: 'Valeria', title: 'Viral Asset', type: 'Video 9:16', duration: '15s', icon: Smartphone },
    { id: 'demo_ecommerce_ooh', agent: 'Viktor', title: 'Spatial Ad', type: 'Video 21:9', duration: '10s', icon: MonitorPlay },
    { id: 'demo_ecommerce_commercial', agent: 'Kaelen', title: 'VSL Spot', type: 'Video 16:9', duration: '30s', icon: Film }
  ],
  saas: [
    { id: 'demo_saas_hub', agent: 'Marcus', title: 'Brand Core', type: 'Static UI', duration: 'Static', icon: Layout },
    { id: 'demo_saas_social', agent: 'Valeria', title: 'Viral Asset', type: 'Video 9:16', duration: '12s', icon: Smartphone },
    { id: 'demo_saas_ooh', agent: 'Viktor', title: 'Spatial Ad', type: 'Video 16:9', duration: '15s', icon: MonitorPlay },
    { id: 'demo_saas_commercial', agent: 'Kaelen', title: 'VSL Spot', type: 'Video 16:9', duration: '45s', icon: Film }
  ],
  fintech: [
    { id: 'demo_fintech_hub', agent: 'Marcus', title: 'Brand Core', type: 'Static Card', duration: 'Static', icon: Layout },
    { id: 'demo_fintech_social', agent: 'Valeria', title: 'Viral Asset', type: 'Video 9:16', duration: '10s', icon: Smartphone },
    { id: 'demo_fintech_ooh', agent: 'Viktor', title: 'Spatial Ad', type: 'Video 21:9', duration: '12s', icon: MonitorPlay },
    { id: 'demo_fintech_commercial', agent: 'Kaelen', title: 'VSL Spot', type: 'Video 16:9', duration: '20s', icon: Film }
  ],
  web3: [
    { id: 'demo_web3_hub', agent: 'Marcus', title: 'Brand Core', type: 'Static 3D', duration: 'Static', icon: Layout },
    { id: 'demo_web3_social', agent: 'Valeria', title: 'Viral Asset', type: 'Video 9:16', duration: '08s', icon: Smartphone },
    { id: 'demo_web3_ooh', agent: 'Viktor', title: 'Spatial Ad', type: 'Video 16:9', duration: '10s', icon: MonitorPlay },
    { id: 'demo_web3_commercial', agent: 'Kaelen', title: 'VSL Spot', type: 'Video 16:9', duration: '60s', icon: Film }
  ]
};

export default function VisualAssetMatrix() {
  const navigate = useNavigate();
  const [loadingIds, setLoadingIds] = useState<Record<string, string>>({});
  const [uploadedAssets, setUploadedAssets] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'ecommerce' | 'saas' | 'fintech' | 'web3'>('ecommerce');
  const [generatingAll, setGeneratingAll] = useState(false);
  const { tokens } = useTokenStore();
  const setSelectedVideo = useCampaignStore(state => state.setSelectedVideo);
  const workspace = useCampaignStore(state => state.workspace);
  const hasFalToken = !!tokens.fal;

  const visualPrompt = workspace?.visual_description || '';

  useEffect(() => {
    const checkExistingAssets = async () => {
      const { data } = await supabase.from('visual_assets').select('id, url').like('id', 'demo_%');
      if (data) {
        const uploaded: Record<string, string> = {};
        data.forEach(item => { if (item.url) uploaded[item.id] = item.url; });
        setUploadedAssets(uploaded);
      }
    };
    checkExistingAssets();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, assetId: string) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setLoadingIds(prev => ({ ...prev, [assetId]: 'uploading' }));

      const fileExt = file.name.split('.').pop();
      const fileName = `${assetId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('visual-assets').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('visual-assets').getPublicUrl(fileName);
      await supabase.from('visual_assets').upsert({ id: assetId, url: publicUrl, updated_at: new Date() });

      setUploadedAssets(prev => ({ ...prev, [assetId]: publicUrl }));
      toast.success('Asset subido correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al subir el asset visual.');
    } finally {
      setLoadingIds(prev => {
        const next = { ...prev };
        delete next[assetId];
        return next;
      });
    }
  };

  const handleFalGenerate = async (assetId: string) => {
    if (!hasFalToken) {
      toast.error('Configura un token de Fal.ai en el Token Manager primero');
      return;
    }
    if (!visualPrompt) {
      toast.error('No hay prompt visual disponible. Genera una campaña en el Nexus Brain primero.');
      return;
    }

    setLoadingIds(prev => ({ ...prev, [assetId]: 'generating' }));

    try {
      const response = await fetch(`https://fal.run/${FAL_AI_MODEL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${tokens.fal}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: visualPrompt,
          num_frames: 32,
          fps: 8,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => 'Unknown error');
        throw new Error(`Fal.ai API error (${response.status}): ${errBody}`);
      }

      const result = await response.json();
      const videoUrl = result.video?.url || result.output?.video_url || result.asset?.url || result.url;

      if (!videoUrl) {
        throw new Error('No video URL in Fal.ai response');
      }

      await supabase.from('visual_assets').upsert({
        id: assetId,
        url: videoUrl,
        updated_at: new Date(),
      });

      setUploadedAssets(prev => ({ ...prev, [assetId]: videoUrl }));
      toast.success('Video generado por IA exitosamente');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error generando video';
      console.error('Fal.ai generation error:', message);
      toast.error(message);
    } finally {
      setLoadingIds(prev => {
        const next = { ...prev };
        delete next[assetId];
        return next;
      });
    }
  };

  const handleGenerateAll = async () => {
    if (!hasFalToken) {
      toast.error('Configura un token de Fal.ai primero');
      return;
    }
    if (!visualPrompt) {
      toast.error('No hay prompt visual. Genera una campaña en el Nexus Brain.');
      return;
    }

    setGeneratingAll(true);
    const assetIds = MISSION_ASSETS[activeTab].map(a => a.id);
    let successCount = 0;

    for (const assetId of assetIds) {
      setLoadingIds(prev => ({ ...prev, [assetId]: 'generating' }));
      try {
        const response = await fetch(`https://fal.run/${FAL_AI_MODEL}`, {
          method: 'POST',
          headers: {
            'Authorization': `Key ${tokens.fal}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: visualPrompt,
            num_frames: 32,
            fps: 8,
          }),
        });

        if (!response.ok) continue;

        const result = await response.json();
        const videoUrl = result.video?.url || result.output?.video_url || result.asset?.url || result.url;

        if (videoUrl) {
          await supabase.from('visual_assets').upsert({
            id: assetId,
            url: videoUrl,
            updated_at: new Date(),
          });
          setUploadedAssets(prev => ({ ...prev, [assetId]: videoUrl }));
          successCount++;
        }
      } catch (e) {
        console.error(`Failed to generate ${assetId}:`, e);
      } finally {
        setLoadingIds(prev => {
          const next = { ...prev };
          delete next[assetId];
          return next;
        });
      }
    }

    setGeneratingAll(false);
    toast.success(`${successCount}/${assetIds.length} videos generados`);
  };

  const AssetCard = ({ asset }: { asset: any }) => {
    const assetUrl = uploadedAssets[asset.id];
    const isUploaded = !!assetUrl;
    const isVideo = assetUrl && (assetUrl.includes('.mp4') || assetUrl.includes('.mov') || assetUrl.includes('.webm'));
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const isLoading = loadingIds[asset.id] === 'generating';
    const isUploading = loadingIds[asset.id] === 'uploading';

    useEffect(() => {
      if (videoRef.current) {
        if (isHovered) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }
    }, [isHovered]);

    return (
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        className="group relative bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden aspect-[4/5] flex flex-col transition-all duration-500 hover:border-emerald-500/30 shadow-2xl"
      >
        <div className="absolute inset-0 z-0">
          {isLoading ? (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin relative z-10" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest animate-pulse">Generating AI Video...</span>
              <span className="text-[8px] font-mono text-zinc-600 max-w-[200px] text-center leading-relaxed px-4">
                &ldquo;{visualPrompt.substring(0, 80)}...&rdquo;
              </span>
            </div>
          ) : isUploaded ? (
            isVideo ? (
              <video
                ref={videoRef}
                src={assetUrl}
                muted
                loop
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <img
                src={assetUrl}
                alt={asset.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )
          ) : (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-white/5 flex items-center justify-center">
                <asset.icon className="text-zinc-600 w-8 h-8" />
              </div>
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Waiting for Deployment</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        </div>

        <div className="relative z-10 mt-auto p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.2em]">{asset.agent} &bull; {asset.type}</span>
            {isUploaded && <CheckCircle2 size={12} className="text-emerald-500" />}
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none">{asset.title}</h3>
        </div>

        <AnimatePresence>
          {isHovered && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 z-20 flex flex-col justify-end p-4 backdrop-blur-sm bg-black/20"
            >
              <div className="backdrop-blur-md bg-black/60 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-0.5">Duration</p>
                    <p className="text-xs font-bold text-white">{asset.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-0.5">Resolution</p>
                    <p className="text-xs font-bold text-white">1080p Native</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <label className="flex-1 bg-white text-black h-10 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-tighter cursor-pointer hover:bg-zinc-200 transition-colors">
                      <input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, asset.id)} disabled={isUploading} className="hidden" />
                      {isUploading ? <Loader2 size={14} className="animate-spin" /> : <><Upload size={14} /> Upload</>}
                    </label>
                    <button
                      onClick={() => {
                        if (isUploaded) {
                          setSelectedVideo({ url: assetUrl, thumbnail: assetUrl });
                          toast.success('Asset inyectado en el Social Lab');
                          navigate('/dashboard/social');
                        } else {
                          toast.error('Sube un archivo primero');
                        }
                      }}
                      className="flex-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 h-10 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-tighter hover:bg-emerald-500/30 transition-colors"
                    >
                      <Play size={14} fill="currentColor" /> Select
                    </button>
                  </div>
                  <button
                    onClick={() => handleFalGenerate(asset.id)}
                    disabled={!hasFalToken || !!loadingIds[asset.id]}
                    className={`w-full h-10 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-tighter transition-all active:scale-95 ${
                      hasFalToken
                        ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30'
                        : 'bg-zinc-800/50 border border-zinc-700 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    <Zap size={14} /> Generar Video por IA (Fal.ai)
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-6 sm:p-10 lg:p-16 pb-32">
      <div className="max-w-7xl mx-auto w-full">

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-3 h-3 rounded-full ${hasFalToken ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'} animate-pulse`} />
              <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em]">
                {hasFalToken ? 'FAL.AI GENERATOR ACTIVE' : 'LOCAL ENGINE ONLY • MISSING FAL TOKEN'}
              </span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase leading-[0.9] mb-6">
              Visual <span className="text-zinc-800 italic">Matrix</span>
            </h1>
            <p className="text-zinc-500 text-lg max-w-lg leading-relaxed">
              Gestión centralizada de activos visuales. Sincroniza videos nativos de alta fidelidad con el orquestador creativo.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2 bg-zinc-900/50 backdrop-blur-md border border-white/5 p-1.5 rounded-2xl">
              {[
                { id: 'ecommerce', label: 'E-Commerce', icon: Target },
                { id: 'saas', label: 'SaaS', icon: Globe },
                { id: 'fintech', label: 'Fintech', icon: Activity },
                { id: 'web3', label: 'Web3', icon: DollarSign }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold tracking-widest uppercase transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleGenerateAll}
              disabled={generatingAll || !hasFalToken}
              className={`w-full px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                hasFalToken
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
            >
              {generatingAll ? (
                <><Loader2 size={14} className="animate-spin" /> Generando todos...</>
              ) : (
                <><Zap size={14} /> Generar Todos con IA</>
              )}
            </button>
          </div>
        </header>

        {!visualPrompt && hasFalToken && (
          <div className="mb-8 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-3">
            <AlertCircle size={16} className="text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300/80 font-mono">
              No hay prompt visual disponible. Genera una campaña en el <button onClick={() => navigate('/dashboard/nexus-brain')} className="underline hover:text-amber-200">Nexus Brain</button> para habilitar la generación por IA.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {MISSION_ASSETS[activeTab].map(asset => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>

        <footer className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest">
              <ShieldAlert size={14} /> ENCRYPTION: AES-256
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest">
              <Zap size={14} /> LATENCY: 14MS
            </div>
          </div>
          <div className="text-[10px] font-mono tracking-[0.4em] uppercase">
            EtherAgent Studio // Visual Core v2.4
          </div>
        </footer>
      </div>
    </div>
  );
}
