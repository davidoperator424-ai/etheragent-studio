import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import {
  Sparkles, Instagram, Smartphone, Linkedin, Eye, Film,
  Heart, MessageCircle, Share2, Play, CheckCircle2, X, Search, Vault, Crown, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import type { Avatar } from '../../types';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  selectedAvatar: Avatar | null;
}

interface CampaignRecord {
  id: string;
  target_url: string;
  detected_sector: string;
  strategy_score: number;
  campaign_data: any;
  created_at: string;
}

const platforms = [
  { id: 'Instagram', icon: <Instagram size={20} />, color: 'from-purple-500 to-pink-500' },
  { id: 'TikTok', icon: <Smartphone size={20} />, color: 'from-cyan-400 to-red-400' },
  { id: 'LinkedIn', icon: <Linkedin size={20} />, color: 'from-blue-600 to-blue-800' },
];

export default function BroadcasterLab({ selectedAvatar }: Props) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [campaign, setCampaign] = useState<CampaignRecord | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [activeAvatar, setActiveAvatar] = useState<Avatar | null>(null);
  const [activePlatform, setActivePlatform] = useState('Instagram');
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [videoLang, setVideoLang] = useState<'es' | 'en'>('es');
  const [isPlayingRealVideo, setIsPlayingRealVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const { toast } = useToast();

  const setWorkspace = useCampaignStore(state => state.setWorkspace);

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

  const campaignData = campaign?.campaign_data;
  const isNewFormat = !!campaignData?.hook;
  const campaignScript = isNewFormat 
    ? (campaignData.narrative_body || campaignData.hook)
    : (campaignData?.assets?.[0]?.voiceover_script || "La ineficiencia es el mayor coste de cualquier startup B2B. EtherAgent OS no es software, es tu nuevo C-Suite autónomo.");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast({
        title: "Pago confirmado",
        description: "EtherClaw está renderizando tu video. Estará listo en ~20 minutos.",
        variant: "default",
      });
      window.history.replaceState({}, '', '/broadcaster');
    }
  }, [toast]);

  useEffect(() => {
    setIsPlayingRealVideo(false);
    setVideoError(false);
  }, [activeAvatar?.id]);

  const handleVideoError = () => {
    setVideoError(true);
    setIsPlayingRealVideo(false);
  };

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        setIsLoading(true);
        const data = await api.getAvatars(user, true);
        setAvatars(data);
        if (selectedAvatar) {
          setActiveAvatar(selectedAvatar);
        } else if (data.length > 0) {
          setActiveAvatar(data[0]);
        }
      } catch (error) {
        console.error("Error fetching avatars:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvatars();

    const interval = setInterval(() => {
      api.getAvatars(user, true).then((data) => {
        setAvatars(data);
        if (activeAvatar) {
          const updated = data.find(a => a.id === activeAvatar.id);
          if (updated) setActiveAvatar(updated);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [user, selectedAvatar, activeAvatar]);

  const runRender = async () => {
    if (!activeAvatar || isRendering) return;

    const hasVideo = activeAvatar.videoUrl || activeAvatar.media?.video_preview_es || activeAvatar.media?.video_preview_en;
    
    if (hasVideo) {
      setIsPlayingRealVideo(true);
      return;
    }
    
    setIsRendering(true);
    setProgress(0);

    const visualInterval = setInterval(() => {
      setProgress(p => p < 90 ? p + Math.floor(Math.random() * 15) : p);
    }, 400);

    try {
      await api.renderVideo(
        activeAvatar.id,
        campaignScript,
        activePlatform
      );
      
      clearInterval(visualInterval);
      setProgress(100);
      
      setTimeout(() => {
        setIsRendering(false);
      }, 800);
      
    } catch (error) {
      clearInterval(visualInterval);
      setIsRendering(false);
      console.error("API Render failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-white/5 rounded-2xl" />
          <div className="h-10 w-64 bg-white/5 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="h-32 bg-white/5 rounded-[24px]" />
            <div className="h-48 bg-white/5 rounded-[24px]" />
          </div>
          <div className="h-[500px] bg-white/5 rounded-[40px]" />
        </div>
      </div>
    );
  }

  if (!isLoading && avatars.length === 0 && user && user.role !== 'admin') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
              <Sparkles size={14} /> Neural Synthesis API
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Broadcaster Lab</h2>
            <p className="text-sm text-white/40 mt-1">Casting neuronal y síntesis de video conectada a EtherClaw.</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-12 text-center border border-white/5"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
            <Vault size={40} className="text-violet-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Reproductor Bloqueado</h3>
          <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">
            Tu cuenta aún no tiene avatares activos. Adquiere tu primer plan para desbloquear el roster y generar videos con influencers sintéticos.
          </p>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-600 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Crown size={16} />
            Ver Planes de Suscripción
          </button>
        </motion.div>
      </div>
    );
  }

  if (!activeAvatar) {
    return (
      <div className="text-center py-20">
        <p className="text-white/40">No hay avatares disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles size={14} /> Neural Synthesis API
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Broadcaster Lab</h2>
          <p className="text-sm text-white/40 mt-1">Casting neuronal y síntesis de video conectada a EtherClaw.</p>
        </div>
        <div className="flex items-center gap-3">
          {campaign && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
              <Brain size={14} className="text-emerald-500" />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                Active Context: {new URL(campaign.target_url).hostname}
              </span>
            </div>
          )}
          <button 
            onClick={runRender}
            disabled={isRendering}
            className="px-6 py-3 bg-emerald-500 text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRendering ? 'Processing API...' : (videoError ? 'Video expiró - Sube uno nuevo' : (activeAvatar.videoUrl ? 'Previsualizar en Redes' : 'Render & Deploy'))}
            <Play size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="glass-card rounded-[24px] p-6 space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold flex items-center gap-2"><Eye size={12} /> Select Environment</p>
            <div className="grid grid-cols-3 gap-3">
              {platforms.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePlatform(p.id)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
                    activePlatform === p.id
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-black/20 border-white/5 text-white/40 hover:border-white/10'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                    {p.icon}
                  </div>
                  <span className="text-xs font-semibold">{p.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[24px] p-6 space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-4">AI Influencer Roster</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setActiveAvatar(avatar)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all min-w-[180px] text-left ${
                    activeAvatar.id === avatar.id 
                      ? 'bg-white/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                      : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <img 
                    src={avatar.image} 
                    alt={avatar.name} 
                    className={`w-12 h-12 rounded-xl object-cover border-2 transition-colors ${activeAvatar.id === avatar.id ? 'border-emerald-500' : 'border-transparent'}`}
                  />
                  <div>
                    <p className="text-sm font-bold text-white/90">{avatar.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">{avatar.role}</p>
                  </div>
                  {activeAvatar.id === avatar.id && <CheckCircle2 size={14} className="text-emerald-500 ml-auto" />}
                </button>
              ))}
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Script</p>
                {activeAvatar.id === 'eth_zero' ? (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">FOUNDER SCRIPT</span>
                ) : (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold uppercase tracking-widest">Neural Draft</span>
                )}
              </div>
              <p className="text-xs text-white/50 italic leading-relaxed">
                "{campaignScript}"
              </p>
            </div>
            <div className="flex gap-4 text-[10px] text-white/20">
              <span className="flex items-center gap-1"><Film size={10} className="text-emerald-400" /> Neural Sync</span>
              <span className="flex items-center gap-1"><Smartphone size={10} className="text-emerald-400" /> 9:16 Optimized</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-[320px] relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-[40px] blur-xl" />
            <div className="relative bg-black rounded-[40px] border-2 border-white/10 overflow-hidden shadow-2xl">
              <div className="h-8 bg-black flex items-center justify-center">
                <div className="w-20 h-5 bg-black rounded-b-2xl border border-white/10 border-t-0" />
              </div>

              <div className="relative aspect-[9/16]">
                {/* Selector de Idioma Flotante */}
                <div className="absolute top-4 right-4 z-20 flex bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/10">
                  <button 
                    onClick={() => setVideoLang('es')}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 ${
                      videoLang === 'es' ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    ES
                  </button>
                  <button 
                    onClick={() => setVideoLang('en')}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 ${
                      videoLang === 'en' ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                </div>

                {/* Etiqueta de Origen del Motor */}
                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-white/80 uppercase tracking-widest font-bold">
                    EtherClaw V3 Engine
                  </span>
                </div>

                {/* Video Player con soporte bilingüe */}
                {(isPlayingRealVideo && (activeAvatar.videoUrl || activeAvatar.media?.video_preview_es || activeAvatar.media?.video_preview_en)) ? (
                  <video 
                    key={`${activeAvatar.id}-${videoLang}`}
                    src={activeAvatar.videoUrl || (videoLang === 'es' ? activeAvatar.media?.video_preview_es : activeAvatar.media?.video_preview_en)} 
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                    onError={handleVideoError}
                  />
                ) : (
                  <>
                    <img src={activeAvatar.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </>
                )}

                {/* Gradiente inferior para legibilidad */}
                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

                {isPlayingRealVideo && (
                  <button
                    onClick={() => setIsPlayingRealVideo(false)}
                    className="absolute top-16 right-4 z-20 p-2 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}

                {isRendering && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 z-10">
                    <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">Neural Adaptation... {progress}%</span>
                  </div>
                )}

                {isPlayingRealVideo && activePlatform === 'Instagram' && (
                  <div className="absolute top-16 left-0 right-0 px-4 flex justify-between items-center z-10">
                    <div className="flex gap-3">
                      <span className="text-white text-[10px] font-bold">Para ti</span>
                      <span className="text-white/50 text-[10px]">Siguiendo</span>
                    </div>
                    <Search size={16} className="text-white" />
                  </div>
                )}

                {isPlayingRealVideo && activePlatform === 'TikTok' && (
                  <div className="absolute top-16 left-0 right-0 px-4 flex justify-center gap-6 z-10">
                    <span className="text-white/60 text-[10px] font-bold">Para ti</span>
                    <span className="text-white text-[10px] font-bold border-b-2 border-white">Siguiendo</span>
                    <span className="text-white/60 text-[10px] font-bold">Amigos</span>
                  </div>
                )}

                {isPlayingRealVideo && activePlatform === 'LinkedIn' && (
                  <div className="absolute top-0 left-0 right-0 p-3 bg-[#1B1F23]/90 flex justify-between items-center z-10">
                    <div className="flex gap-4">
                      <span className="text-white text-xs font-semibold">Inicio</span>
                      <span className="text-white/50 text-xs">Mi red</span>
                      <span className="text-white/50 text-xs">Publicaciones</span>
                      <span className="text-white/50 text-xs">Notificaciones</span>
                    </div>
                    <Search size={16} className="text-white" />
                  </div>
                )}

                {activePlatform === 'Instagram' && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 z-10">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-0.5">
                          <div className="w-full h-full rounded-full bg-black" />
                        </div>
                      </div>
                      <span className="text-white text-xs font-semibold">etheragent.ai</span>
                      <span className="text-white/40 text-[10px]">{isPlayingRealVideo ? 'Ahora' : '14h'}</span>
                    </div>
                    <p className="text-white text-[11px] line-clamp-2">
                      {campaignData?.hook || (isPlayingRealVideo 
                        ? "El futuro del marketing B2B es hoy #NeuralAgent #AIMarketing" 
                        : "El futuro de las agencias B2B es hoy. #NeuralAgent #B2B #AI")}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white/10 rounded-full px-3 py-2">
                        <span className="text-white/30 text-[10px]">Enviar mensaje...</span>
                      </div>
                      <Heart size={20} className="text-white" />
                      <Share2 size={20} className="text-white" />
                    </div>
                  </div>
                )}

                {activePlatform === 'TikTok' && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <div className="flex justify-between items-end">
                      <div className="space-y-2 flex-1 mr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">EA</span>
                          </div>
                          <span className="text-white text-xs font-bold">@EtherAgentOS</span>
                        </div>
                        <p className="text-white/70 text-[10px] line-clamp-3">
                          {campaignData?.hook || (isPlayingRealVideo 
                            ? "El futuro del marketing B2B es hoy #NeuralAgent #AIMarketing" 
                            : "El futuro de las agencias B2B es hoy. #NeuralAgent #B2B #AI")}
                        </p>
                        <div className="flex items-center gap-1">
                          <Play size={10} className="text-white/40" />
                          <span className="text-white/40 text-[10px]">Ver traducción</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                            <span className="text-white text-[10px]">🎵</span>
                            <span className="text-white text-[10px]">original sound - EtherAgent</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-4">
                        <div className="text-center">
                          <Heart size={24} className="text-white" />
                          <span className="text-white text-[10px]">42K</span>
                        </div>
                        <div className="text-center">
                          <MessageCircle size={24} className="text-white" />
                          <span className="text-white text-[10px]">892</span>
                        </div>
                        <Share2 size={24} className="text-white" />
                        <div className="w-8 h-8 border-2 border-white/30 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white/50 rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activePlatform === 'LinkedIn' && (
                  <div className={`absolute bottom-0 left-0 right-0 p-4 space-y-3 z-10 ${isPlayingRealVideo ? 'bg-[#1B1F23]/95' : 'bg-[#1B1F23]/90'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">in</div>
                      <div>
                        <p className="text-white text-xs font-bold">{activeAvatar.name}</p>
                        <p className="text-white/40 text-[10px]">{activeAvatar.role}</p>
                        <p className="text-white/30 text-[10px]">Promocionado • 🌐</p>
                      </div>
                      <button className="ml-auto px-3 py-1 border border-blue-400 text-blue-400 text-[10px] font-bold rounded-full">
                        Seguir
                      </button>
                    </div>
                    <p className="text-white/60 text-xs line-clamp-2">
                      {campaignData?.hook || (isPlayingRealVideo 
                        ? "El futuro del marketing B2B es hoy. EtherAgent OS - Tu C-Suite autónomo." 
                        : "Estamos eliminando el factor error en la prospección masiva. Únete a la lista de espera de EtherAgent OS.")}
                    </p>
                    {isPlayingRealVideo && (
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Heart size={14} className="text-white" />
                            <span className="text-white/60 text-[10px]">1.2K</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle size={14} className="text-white" />
                            <span className="text-white/60 text-[10px]">89</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 size={14} className="text-white" />
                            <span className="text-white/60 text-[10px]">234</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <span className="text-blue-400 text-xs font-semibold">Learn More</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
