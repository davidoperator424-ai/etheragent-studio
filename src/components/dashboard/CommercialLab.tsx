import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaignStore } from '@/store/useCampaignStore';
import { Sparkles, Zap, Loader2, Upload, Film, Play, ArrowRight, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface CampaignRecord {
  id: string;
  target_url: string;
  detected_sector: string;
  strategy_score: number;
  campaign_data: any;
  created_at: string;
}

export default function CommercialLab() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { balance } = useTokenBalance();
    const { user } = useAuth();
    const setWorkspace = useCampaignStore(state => state.setWorkspace);
    const [campaign, setCampaign] = useState<CampaignRecord | null>(null);
    const [assetUrl, setAssetUrl] = useState<string | null>(null);
    const [isVideo, setIsVideo] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const fetchCampaign = async () => {
          if (!user) return;
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
            if (data) {
              setCampaign(data as CampaignRecord);
              setWorkspace(data.campaign_data);
            }
          } catch (err) {
            console.error('Error fetching campaign:', err);
          }
        };
        fetchCampaign();
    }, [searchParams, user, setWorkspace]);

    useEffect(() => {
        const fetchAsset = async () => {
            const { data } = await supabase
                .from('visual_assets')
                .select('id, url')
                .in('id', ['commercial_new_video', 'commercial_new_image']);

            if (data && data.length > 0) {
                const videoAsset = data.find(item => item.id === 'commercial_new_video');
                const imgAsset = data.find(item => item.id === 'commercial_new_image');

                if (videoAsset) {
                    setAssetUrl(videoAsset.url);
                    setIsVideo(true);
                } else if (imgAsset) {
                    setAssetUrl(imgAsset.url);
                    setIsVideo(false);
                }
            }
            setLoading(false);
        };
        fetchAsset();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;
            setUploading(true);

            const isVid = file.type.includes('video');
            const assetId = isVid ? 'commercial_new_video' : 'commercial_new_image';
            const fileExt = file.name.split('.').pop();
            const fileName = `${assetId}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage.from('visual-assets').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('visual-assets').getPublicUrl(fileName);
            await supabase.from('visual_assets').upsert({ id: assetId, url: publicUrl, updated_at: new Date() });

            setAssetUrl(publicUrl);
            setIsVideo(isVid);
        } catch (error) {
            console.error('Error subiendo asset:', error);
            alert('Error al subir el archivo.');
        } finally {
            setUploading(false);
        }
    };

    const campaignData = campaign?.campaign_data;

    return (
        <div className="flex flex-col xl:flex-row min-h-screen w-full bg-[#050505] text-white p-3 sm:p-4 md:p-8 gap-4 sm:gap-8 pb-32 overflow-x-hidden overflow-y-auto">

            {/* LEFT PANEL: Commercial Studio */}
            <div className="flex-1 flex flex-col max-w-3xl">
                <header className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-full border-2 border-emerald-500/50 flex items-center justify-center bg-zinc-900">
                            <Film className="text-emerald-400" size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Commercial Studio</h2>
                            <p className="text-emerald-400 font-mono text-xs tracking-widest uppercase">
                                Cinematic Asset Pipeline &bull; Active Session
                            </p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-3xl p-8 flex flex-col relative overflow-visible shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-emerald-400" />
                            <span className="text-emerald-400 text-[10px] font-mono tracking-widest uppercase">Nodo: Commercial Studio</span>
                        </div>
                        {campaign && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                            <Brain size={12} className="text-zinc-500" />
                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{new URL(campaign.target_url).hostname}</span>
                          </div>
                        )}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel p-6 rounded-2xl rounded-tl-sm w-[95%] mb-6 border-white/10"
                    >
                        <p className="text-zinc-300 text-sm font-medium mb-3 flex items-center gap-2">
                            <Sparkles size={14} className="text-emerald-400" />
                            Estrategia de Visualizaci&oacute;n Neural
                        </p>
                        <div className="p-4 bg-black/60 border border-emerald-500/20 rounded-lg font-mono text-xs text-emerald-400 leading-relaxed italic">
                            {campaignData?.creative_rationale || "Sube un activo visual para distribuirlo en formato Streaming y TV conectada. El pipeline ajusta color HDR y masteriza audio espacial automáticamente."}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-2xl rounded-tr-sm w-[90%] self-end mb-6"
                    >
                        <p className="text-sm text-indigo-100/80 leading-relaxed font-medium">
                            {campaignData?.narrative_body || "Aplicando corrección de color cinematográfica. Mejorando rango dinámico (HDR) y masterizando audio espacial para reproducción en redes."}
                        </p>
                    </motion.div>

                    {campaignData?.hook && (
                      <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="glass-panel p-6 rounded-2xl rounded-tl-sm w-[90%] mb-6 border-emerald-500/20"
                      >
                          <p className="text-emerald-500 text-[10px] font-mono tracking-widest uppercase mb-2">Cinematic Hook</p>
                          <p className="text-lg text-white leading-tight font-black italic">
                              "{campaignData.hook}"
                          </p>
                      </motion.div>
                    )}

                    <div className="mt-auto">
                        <div className="glass-panel p-4 rounded-xl flex items-center gap-4 bg-white/5 border-white/10">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                <Zap size={18} className="text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-white">Pipeline de Renderizado</p>
                                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">HDR Cinema Master &bull; Spatial Audio v4</p>
                            </div>
                            <label className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                <input type="file" accept="image/*,video/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
                                {uploading ? 'PROCESANDO...' : 'SUBIR ACTIVO'}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Phone Preview */}
            <div className="w-full xl:w-[420px] shrink-0 flex flex-col items-center pt-8">

                <div className="w-[280px] sm:w-[300px] md:w-[340px] flex justify-between items-center mb-6 px-2">
                    <h3 className="text-sm font-mono tracking-widest uppercase text-zinc-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Ad Preview
                    </h3>
                </div>

                <div className="relative w-[280px] sm:w-[300px] md:w-[340px] h-[560px] sm:h-[640px] md:h-[720px] bg-black border-[6px] sm:border-[8px] border-[#1c1c1e] rounded-[2.5rem] sm:rounded-[3.5rem] shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col shrink-0 group">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-50"></div>

                    <div className="flex-1 relative bg-zinc-900 w-full h-full">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-400" size={40} /></div>
                        ) : assetUrl ? (
                            <div className="relative w-full h-full bg-zinc-950 overflow-hidden z-40 rounded-xl border border-zinc-800">
                                {isVideo ? (
                                    <video
                                        ref={videoRef}
                                        src={assetUrl}
                                        muted={!hasUserInteracted}
                                        playsInline
                                        className="absolute inset-0 w-full h-full object-cover z-0"
                                    />
                                ) : (
                                    <img src={assetUrl} alt="Commercial" className="absolute inset-0 w-full h-full object-cover z-10" />
                                )}
                                {isVideo && (
                                    <>
                                        <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>
                                        {!hasUserInteracted && (
                                            <div
                                                className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
                                                onClick={() => {
                                                    setHasUserInteracted(true);
                                                    if (videoRef.current) {
                                                        videoRef.current.muted = false;
                                                        videoRef.current.play();
                                                    }
                                                }}
                                            >
                                                <div className="relative group">
                                                    <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping group-hover:bg-emerald-500/50 transition-all"></div>
                                                    <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-emerald-500/20 backdrop-blur-xl border border-emerald-400/50 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-110 transition-transform">
                                                        <Play fill="currentColor" className="w-8 h-8 ml-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 p-8">
                                <div className="text-center space-y-4">
                                    <Film size={48} className="text-zinc-800 mx-auto" />
                                    <p className="text-zinc-600 text-sm font-mono">Sube un asset para previsualizar</p>
                                </div>
                            </div>
                        )}

                        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-[8px] font-mono text-emerald-400 px-2 py-1 rounded z-20">
                            NODE_ACTIVE_COMMERCIAL
                        </div>
                    </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-6 w-[280px] sm:w-[300px] md:w-[340px]">
                    <button
                        onClick={() => {
                            if (!balance.isInfinite && balance.computeTokens <= 0) {
                                navigate('/dashboard/subscription');
                            }
                        }}
                        className="w-full relative group overflow-hidden rounded-xl p-[1px]"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 rounded-xl opacity-70 group-hover:opacity-100 animate-pulse transition-opacity"></span>
                        <div className="relative px-6 py-4 bg-zinc-950 rounded-xl flex items-center justify-between transition-all group-hover:bg-zinc-900">
                            <div className="flex flex-col text-left">
                                <span className="text-white font-bold text-sm">Crear Campa&ntilde;a Premium</span>
                                <span className="text-zinc-500 text-[11px] font-mono">Requiere Compute Tokens</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 group-hover:scale-110 transition-transform">
                                <ArrowRight className="w-4 h-4 text-emerald-400" />
                            </div>
                        </div>
                    </button>
                </div>

                <button className="mt-4 sm:mt-6 w-[280px] sm:w-[300px] md:w-[340px] py-3 sm:py-4 rounded-xl font-black font-mono text-xs sm:text-sm tracking-widest transition-all duration-300 bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-95">
                    [ DEPLOY TO NETWORKS ]
                </button>
            </div>
        </div>
    );
}
