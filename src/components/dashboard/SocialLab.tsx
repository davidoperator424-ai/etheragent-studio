import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Sparkles, Zap, Loader2, Upload, Video, Image as ImageIcon, Film, Heart, MessageCircle, Share2, MoreHorizontal, UserCircle2, Bookmark, Send, Play, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useAuth } from '@/contexts/AuthContext';


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let currentAudio: HTMLAudioElement | null = null;
let currentTimeout: NodeJS.Timeout | null = null;

const stopCurrentAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (currentTimeout) {
    clearTimeout(currentTimeout);
    currentTimeout = null;
  }
};

const playMatrixAudio = async (scriptId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('system_scripts')
      .select('audio_url')
      .eq('id', scriptId)
      .maybeSingle();

    if (error || !data || !data.audio_url) {
      console.warn(`Audio '${scriptId}' no encontrado en Matrix - Continuando en silencio...`);
      return false;
    }

    return new Promise((resolve) => {
      const audio = new Audio(data.audio_url);
      audio.volume = 0.8;
      currentAudio = audio;

      audio.onended = () => {
        currentAudio = null;
        resolve(true);
      };

      audio.onerror = (e) => {
        console.error(`Error reproduciendo '${scriptId}':`, e);
        currentAudio = null;
        resolve(false);
      };

      audio.play().catch(e => {
        console.warn(`Autoplay bloqueado para '${scriptId}':`, e);
        resolve(false);
      });
    });
  } catch (error) {
    console.error("Error crítico en playMatrixAudio:", error);
    return false;
  }
};

const playSupabaseAudio = (fileName: string, abortSignal?: { aborted: boolean }): Promise<void> => {
  return new Promise((resolve) => {
    if (abortSignal?.aborted) {
      resolve();
      return;
    }

    const baseUrl = "https://njhifpbnrbbhbmwgedtz.supabase.co/storage/v1/object/public/system-audio/";
    const premiumFileName = fileName.includes('_premium') 
      ? fileName 
      : fileName.replace('.mp3', '_premium.mp3');
    const timestamp = new Date().getTime();
    
    currentTimeout = setTimeout(() => {
      resolve();
    }, 15000);

    try {
      const audio = new Audio(`${baseUrl}${premiumFileName}?t=${timestamp}`);
      audio.volume = 0.8;
      currentAudio = audio;
      
      audio.onended = () => {
        currentAudio = null;
        if (currentTimeout) {
          clearTimeout(currentTimeout);
          currentTimeout = null;
        }
        resolve();
      };

      audio.onerror = () => {
        console.warn(`Audio ${premiumFileName} no encontrado - continuando coreografía...`);
        currentAudio = null;
        if (currentTimeout) {
          clearTimeout(currentTimeout);
          currentTimeout = null;
        }
        resolve();
      };

      audio.play().catch(() => {
        resolve();
      });
    } catch {
      console.warn(`Audio ${premiumFileName} no disponible - continuando...`);
      if (currentTimeout) {
        clearTimeout(currentTimeout);
        currentTimeout = null;
      }
      resolve();
    }
  });
};

const valeriaMsg1 = "🎙️ Analizando activo crudo... Extrayendo transcripción del audio:\n\nPAVO 1: 'Hermano... mi agencia de marketing me está desplumando.'\nPAVO 2: 'Eso es porque sigues contratando humanos, Roberto.'\nPAVO 1: 'Yo los despedí a todos ayer. Ahora uso EtherAgent.'\nPAVO 2: 'Resultados puros. Cero excusas. Salud.'";

const valeriaMsg2 = "⚡ Adaptando para TikTok/Reels. Aplicando cortes de alta retención, inyectando música Phonk de fondo y generando subtítulos con estética 'Apple Noir'.";

const valeriaMsg3 = "✅ Campaña Cero lista. Despliegue orgánico optimizado. Costo: 0 Tokens. Dale Play al activo final a tu derecha.";

export default function SocialLab() {
  const navigate = useNavigate();
  const { balance } = useTokenBalance();
  const { user } = useAuth();
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [videoFormat, setVideoFormat] = useState<'reel' | 'feed' | 'story'>('reel');
  const [imageFormat, setImageFormat] = useState<'post' | 'story' | 'banner'>('post');
  const [campaignAsset, setCampaignAsset] = useState<any>(null);

  const [assets, setAssets] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [chatStep, setChatStep] = useState(1);

  const [demoState, setDemoState] = useState<'idle' | 'typing1' | 'typing2' | 'finished'>('idle');
  const [mobileView, setMobileView] = useState<'idle' | 'rendering' | 'final_deployed'>('idle');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string, typing?: boolean}[]>([]);
  const isDemoAborted = useRef(false);

  useEffect(() => {
    const savedCampaign = sessionStorage.getItem('current_campaign');
    if (savedCampaign) {
      try {
        const parsed = JSON.parse(savedCampaign);
        const socialScene = parsed.escenas.find((e: any) => e.tipo === 'social');
        if (socialScene) {
          setCampaignAsset(socialScene);
          setMobileView('final_deployed');
          setDemoState('finished');
          setChatMessages([
            { role: 'assistant', content: "🤖 [MARCUS]: Transfiriendo datos a Valeria. Campaña activa detectada.", typing: false },
            { role: 'assistant', content: "✅ Activo visual cargado desde Command Hub. El gancho visual está listo. ¿Deseas renderizar el video premium?", typing: false }
          ]);
        }
      } catch (e) {
        console.error('Error parseando campaign:', e);
      }
    }
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const getActiveAssetId = () => mediaType === 'video' ? `social_video_${videoFormat}` : `social_image_${imageFormat}`;
  const activeAssetId = getActiveAssetId();
  const currentAssetUrl = assets[activeAssetId];

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('visual_assets')
        .select('id, url')
        .in('id', [
          'social_video_reel', 'social_video_feed', 'social_video_story',
          'social_image_post', 'social_image_story', 'social_image_banner'
        ]);
        
      if (data) {
        const loadedAssets: Record<string, string> = {};
        data.forEach(item => loadedAssets[item.id] = item.url);
        setAssets(loadedAssets);
      }
      setLoading(false);
    };
    fetchAssets();
  }, []);

  // Estado siempre inicia en 'reel' - sin lógica de detección de desktop

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${activeAssetId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('visual-assets').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('visual-assets').getPublicUrl(fileName);
      await supabase.from('visual_assets').upsert({ id: activeAssetId, url: publicUrl, updated_at: new Date() });

      setAssets(prev => ({ ...prev, [activeAssetId]: publicUrl }));
    } catch (error) {
      console.error('Error subiendo asset:', error);
      alert('Error al subir el archivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleCompile = () => {
    setIsCompiling(true);
    setTimeout(() => { setIsCompiling(false); setChatStep(2); }, 2500);
  };

  const handleSkipDemo = useCallback(() => {
    isDemoAborted.current = true;
    stopCurrentAudio();
    setMobileView('final_deployed');
    setDemoState('finished');
    
    setChatMessages([
      { role: 'assistant', content: valeriaMsg1, typing: false },
      { role: 'user', content: 'Procede, Valeria. Adapta para TikTok.' },
      { role: 'assistant', content: valeriaMsg2, typing: false },
      { role: 'assistant', content: valeriaMsg3, typing: false }
    ]);
  }, []);

  const runDemoChoreography = useCallback(async () => {
    isDemoAborted.current = false;
    setDemoState('typing1');
    setMobileView('rendering');
    
    // 1. MARCUS SALUDA AL USUARIO
    setChatMessages([{ role: 'assistant', content: "🤖 [MARCUS]: Saludos, David. Iniciando secuencia de orquestación para Campaña Cero. Transfiriendo control del activo a Valeria para optimización viral.", typing: true }]);
    await sleep(3000);
    if (isDemoAborted.current) return;
    
    setChatMessages(prev => prev.map(m => m.typing ? { ...m, typing: false } : m));
    await playMatrixAudio('ch_welcome'); // Marcus audio
    if (isDemoAborted.current) return;
    
    await sleep(1500);
    if (isDemoAborted.current) return;

    // 2. VALERIA TOMA EL CONTROL
    setChatMessages(prev => [...prev, { role: 'assistant', content: valeriaMsg1, typing: true }]);
    await sleep(3000);
    if (isDemoAborted.current) return;
    
    setChatMessages(prev => prev.map(m => m.typing ? { ...m, typing: false } : m));
    await playMatrixAudio('tr_social'); // Valeria audio
    if (isDemoAborted.current) return;
    
    await sleep(2000);
    if (isDemoAborted.current) return;

    setChatMessages(prev => [...prev, { role: 'user', content: 'Procede, Valeria. Adapta para TikTok.' }]);
    await sleep(1000);
    if (isDemoAborted.current) return;

    // 3. VALERIA PROCESA
    setMobileView('rendering');
    if (!isDemoAborted.current) await playMatrixAudio('tr_ecommerce_social');
    if (isDemoAborted.current) return;

    await sleep(3000);
    if (isDemoAborted.current) return;

    // 4. VALERIA FINALIZA
    setMobileView('final_deployed');
    setChatMessages(prev => [...prev, { role: 'assistant', content: valeriaMsg2, typing: true }]);
    await sleep(3000);
    if (isDemoAborted.current) return;

    setChatMessages(prev => prev.map(m => m.typing ? { ...m, typing: false } : m));
    await sleep(2000);
    if (isDemoAborted.current) return;

    setChatMessages(prev => [...prev, { role: 'assistant', content: valeriaMsg3, typing: false }]);
    await sleep(2000);
    if (isDemoAborted.current) return;
    
    setDemoState('finished');
  }, []);

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
          <p className="text-white text-sm drop-shadow-md line-clamp-2">Dominando el algoritmo. 🚀 #AI #Marketing</p>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur w-fit px-2 py-1 rounded-full mt-1">
             <span className="text-white text-xs">🎵 Sonido Original - EtherAgent</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-5 pb-2">
          <div className="flex flex-col items-center gap-1"><div className="w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center"><Heart size={20} className="text-white" fill="white" /></div><span className="text-white text-xs drop-shadow-md">1.2M</span></div>
          <div className="flex flex-col items-center gap-1"><div className="w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center"><MessageCircle size={20} className="text-white" fill="white" /></div><span className="text-white text-xs drop-shadow-md">45K</span></div>
          <div className="flex flex-col items-center gap-1"><div className="w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center"><Bookmark size={20} className="text-white" fill="white" /></div><span className="text-white text-xs drop-shadow-md">8K</span></div>
          <div className="flex flex-col items-center gap-1"><div className="w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center"><Share2 size={20} className="text-white" fill="white" /></div><span className="text-white text-xs drop-shadow-md">11K</span></div>
        </div>
      </div>
    </div>
  );

  const InstagramStoryOverlay = () => (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between bg-gradient-to-b from-black/50 via-transparent to-black/50 pt-8 px-4 pb-6">
      <div className="flex gap-1 mt-2 mb-4">
        <div className="h-0.5 bg-white/40 flex-1 rounded-full overflow-hidden"><div className="h-full bg-white w-2/3" /></div>
        <div className="h-0.5 bg-white/40 flex-1 rounded-full" />
        <div className="h-0.5 bg-white/40 flex-1 rounded-full" />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <UserCircle2 size={32} className="text-white" />
          <span className="text-white font-bold text-sm drop-shadow-md">etheragent.ai <span className="text-white/70 font-normal ml-1">2h</span></span>
        </div>
        <MoreHorizontal size={20} className="text-white" />
      </div>
      <div className="mt-auto flex items-center gap-3">
        <div className="flex-1 h-10 border border-white/50 rounded-full flex items-center px-4 backdrop-blur-sm">
          <span className="text-white/80 text-sm">Enviar mensaje...</span>
        </div>
        <Heart size={24} className="text-white" />
        <Send size={24} className="text-white" />
      </div>
    </div>
  );

  const InstagramPostOverlay = () => (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between pt-10">
      <div className="h-14 flex items-center justify-between px-3 w-full z-30 relative shrink-0">
         <div className="flex items-center gap-2">
           <UserCircle2 size={30} className="text-white" />
           <span className="text-white font-bold text-sm">etheragent.ai</span>
         </div>
         <MoreHorizontal size={20} className="text-white" />
      </div>
      
      <div className="flex-1 w-full"></div>

      <div className="px-3 py-4 flex flex-col gap-2 w-full z-30 relative shrink-0 pb-8 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex justify-between items-center mb-1">
          <div className="flex gap-4">
             <Heart size={24} className="text-white" />
             <MessageCircle size={24} className="text-white" />
             <Send size={24} className="text-white" />
          </div>
          <Bookmark size={24} className="text-white" />
        </div>
        <span className="text-white font-bold text-sm">8,492 Me gusta</span>
        <p className="text-white text-sm line-clamp-2"><span className="font-bold mr-2">etheragent.ai</span>Transformando el ecosistema B2B a velocidad luz.</p>
        <span className="text-white/60 text-[10px] mt-1">HACE 2 HORAS</span>
      </div>
    </div>
  );

  const LinkedInBannerOverlay = () => (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col pt-10">
       <div className="h-12 flex items-center px-4 shrink-0 bg-white/90 backdrop-blur">
         <div className="w-6 h-6 bg-[#0a66c2] rounded text-white flex items-center justify-center font-bold text-xs">in</div>
         <div className="ml-4 w-40 h-6 bg-zinc-200 rounded flex items-center px-2"><span className="text-zinc-400 text-xs">Buscar...</span></div>
       </div>
       
       <div className="flex-1 p-3 flex flex-col pt-4 overflow-hidden">
          <div className="w-full rounded-lg overflow-hidden flex flex-col border border-zinc-200 bg-white">
            <div className="p-3 flex items-start gap-2">
               <UserCircle2 size={36} className="text-zinc-400 shrink-0" />
               <div className="flex flex-col">
                 <span className="font-bold text-sm text-black leading-tight">EtherAgent Inc.</span>
                 <span className="text-[10px] text-zinc-500 leading-tight">1.2M seguidores</span>
                 <span className="text-[10px] text-zinc-400 flex items-center gap-1">Promocionado</span>
               </div>
            </div>
            
            <div className="w-full aspect-[16/9]"></div> 
            
            <div className="p-3 flex justify-between items-center border-t border-zinc-200">
              <div className="flex flex-col">
                 <span className="text-xs font-bold text-[#0a66c2] line-clamp-1">Descubre el futuro B2B</span>
                 <span className="text-[10px] text-zinc-500">etheragent.com</span>
              </div>
            </div>
            <div className="px-4 py-2 flex justify-between border-t border-zinc-200">
               <span className="text-xs text-zinc-600 font-bold flex items-center gap-1"><Heart size={14} className="text-zinc-500" /> Recomendar</span>
               <span className="text-xs text-zinc-600 font-bold flex items-center gap-1"><MessageCircle size={14} className="text-zinc-500" /> Comentar</span>
            </div>
         </div>
      </div>
    </div>
  );

  const renderUIOverlay = () => {
    if (!currentAssetUrl) return null;
    
    if (mediaType === 'video') {
      if (videoFormat === 'reel') return <TikTokReelOverlay />;
      if (videoFormat === 'story') return <InstagramStoryOverlay />;
      if (videoFormat === 'feed') return <InstagramPostOverlay />;
    }
    
    if (mediaType === 'image') {
      if (imageFormat === 'story') return <InstagramStoryOverlay />;
      if (imageFormat === 'post') return <InstagramPostOverlay />;
      if (imageFormat === 'banner') return <LinkedInBannerOverlay />;
    }
    
    return null;
  };

  return (
    <div className="flex flex-col xl:flex-row min-h-screen w-full bg-[#050505] text-white p-3 sm:p-4 md:p-8 gap-4 sm:gap-8 pb-32 overflow-x-hidden overflow-y-auto">
      
      <div className="flex-1 flex flex-col max-w-3xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full border-2 border-emerald-500/50 flex items-center justify-center bg-zinc-900">
               <span className="font-black text-2xl text-white">V</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Valeria M.</h2>
              <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase">Lead Growth Hacker • Active Session</p>
            </div>
          </div>
        </header>

        <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-3xl p-8 flex flex-col relative shadow-2xl">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles size={16} className="text-emerald-500" />
            <span className="text-emerald-500 text-[10px] font-mono tracking-widest uppercase">Nodo: Viral Dynamics</span>
          </div>

          <AnimatePresence>
            {chatMessages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-zinc-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl ${msg.role === 'user' ? 'rounded-tr-sm w-[85%] self-end mb-6 border-emerald-500/20' : 'rounded-tl-sm w-[90%] mb-6'} ${msg.typing ? 'border-emerald-500/30' : ''}`}
              >
                {msg.role === 'assistant' && msg.content.includes('PAVO') ? (
                  <>
                    <p className="text-zinc-300 text-sm font-medium mb-3 flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-500" />
                      Transcripción y Análisis de Activo
                    </p>
                    <div className="p-2 sm:p-3 bg-black/60 border border-emerald-500/20 rounded-lg font-mono text-[10px] sm:text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {msg.content.replace('🎙️ Analizando activo crudo... Extrayendo transcripción del audio:\n\n', '')}
                    </div>
                  </>
                ) : (
                  <p className="text-base text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                    {msg.typing && <span className="inline-flex ml-1"><span className="animate-pulse">▊</span></span>}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {demoState === 'idle' && chatMessages.length === 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl rounded-tl-sm w-[90%] mb-6"
              >
                <p className="text-zinc-300 text-sm font-medium mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-500" />
                  Transcripción y Análisis de Activo
                </p>
                <div className="p-2 sm:p-3 bg-black/60 border border-emerald-500/20 rounded-lg font-mono text-[10px] sm:text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                  PAVO 1: 'Hermano... mi agencia de marketing me está desplumando.'
                  PAVO 2: 'Eso es porque sigues contratando humanos, Roberto.'
                  PAVO 1: 'Yo los despedí a todos ayer. Ahora uso EtherAgent.'
                  PAVO 2: 'Resultados puros. Cero excusas. Salud.'
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-emerald-900/20 border border-emerald-500/20 p-6 rounded-2xl rounded-tr-sm w-[85%] self-end mb-6"
              >
                <p className="text-base text-emerald-100 leading-relaxed">
                  ⚡ Adaptando para TikTok/Reels. Aplicando cortes de alta retención, inyectando música Phonk de fondo y generando subtítulos con estética 'Apple Noir'.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-zinc-900/50 border border-emerald-500/30 p-6 rounded-2xl rounded-tl-sm w-[90%] mb-6"
              >
                <p className="text-base text-white leading-relaxed font-medium">
                  ✅ Campaña Cero lista. Despliegue orgánico optimizado. Dale Play al activo a tu derecha.
                </p>
              </motion.div>
            </>
          )}

          {chatStep === 2 && demoState === 'finished' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/50 border border-emerald-500/30 p-6 rounded-2xl rounded-tl-sm w-[90%] mb-6">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
               <p className="text-base text-white leading-relaxed font-medium">
                 Kinesia y parámetros visuales nativos compilados. Verifica la previsualización en el dispositivo a tu derecha.
               </p>
             </motion.div>
          )}

          <div className="mt-auto grid grid-cols-2 gap-4">
            <button onClick={runDemoChoreography} disabled={demoState !== 'idle'} className="bg-[#111] hover:bg-zinc-800 border border-white/5 p-4 rounded-xl flex items-center justify-center gap-3 text-sm font-bold text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {demoState !== 'idle' ? <Loader2 size={18} className="text-emerald-500 animate-spin" /> : <Sparkles size={18} className="text-emerald-500" />} {demoState === 'idle' ? 'Iniciar Demo' : 'Demo Activa...'}
            </button>
            <button onClick={handleCompile} disabled={isCompiling || chatStep === 2} className="bg-[#111] hover:bg-zinc-800 border border-white/5 p-4 rounded-xl flex items-center justify-center gap-3 text-sm font-bold text-zinc-300 transition-colors">
              {isCompiling ? <Loader2 size={18} className="text-emerald-500 animate-spin" /> : <Zap size={18} className="text-emerald-500" />} Compilar Assets
            </button>
          </div>
        </div>
      </div>

      <div className="w-full xl:w-[420px] shrink-0 flex flex-col items-center pt-2">
        
        {demoState !== 'idle' && demoState !== 'finished' && (
          <button 
            onClick={handleSkipDemo}
            className="fixed top-6 right-6 z-[9999] px-6 py-3 bg-red-600/90 backdrop-blur-xl border-2 border-red-400 rounded-full text-sm font-bold text-white shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:scale-110 hover:bg-red-500 transition-all flex items-center gap-2 cursor-pointer animate-pulse"
            style={{ zIndex: 99999 }}
          >
            ⏭ SALTAR DEMO
          </button>
        )}

        <div className="w-[280px] sm:w-[300px] md:w-[340px] flex p-1 bg-[#111] rounded-xl border border-white/10 mb-4">
          <button onClick={() => setMediaType('video')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] text-xs font-bold rounded-lg transition-all active:scale-95 ${mediaType === 'video' ? 'bg-emerald-500/20 text-emerald-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Video size={14} /> VIDEO VECTORS
          </button>
          <button onClick={() => setMediaType('image')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] text-xs font-bold rounded-lg transition-all active:scale-95 ${mediaType === 'image' ? 'bg-emerald-500/20 text-emerald-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <ImageIcon size={14} /> STATIC VECTORS
          </button>
        </div>

        <div className="w-[280px] sm:w-[300px] md:w-[340px] flex justify-between items-center mb-6">
          <div className="flex gap-1.5 sm:gap-2">
            {mediaType === 'video' ? (
              <>
                <button onClick={() => setVideoFormat('reel')} className={`px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-[32px] rounded-md text-[10px] sm:text-[10px] font-mono uppercase transition-all active:scale-95 ${videoFormat === 'reel' ? 'bg-emerald-500 text-black font-bold' : 'bg-[#111] text-zinc-500 border border-white/5 hover:bg-zinc-800'}`}>Reel</button>
                <button onClick={() => setVideoFormat('feed')} className={`px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-[32px] rounded-md text-[10px] sm:text-[10px] font-mono uppercase transition-all active:scale-95 ${videoFormat === 'feed' ? 'bg-emerald-500 text-black font-bold' : 'bg-[#111] text-zinc-500 border border-white/5 hover:bg-zinc-800'}`}>Feed</button>
                <button onClick={() => setVideoFormat('story')} className={`px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-[32px] rounded-md text-[10px] sm:text-[10px] font-mono uppercase transition-all active:scale-95 ${videoFormat === 'story' ? 'bg-emerald-500 text-black font-bold' : 'bg-[#111] text-zinc-500 border border-white/5 hover:bg-zinc-800'}`}>Story</button>
              </>
            ) : (
              <>
                <button onClick={() => setImageFormat('post')} className={`px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-[32px] rounded-md text-[10px] sm:text-[10px] font-mono uppercase transition-all active:scale-95 ${imageFormat === 'post' ? 'bg-emerald-500 text-black font-bold' : 'bg-[#111] text-zinc-500 border border-white/5 hover:bg-zinc-800'}`}>Post</button>
                <button onClick={() => setImageFormat('story')} className={`px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-[32px] rounded-md text-[10px] sm:text-[10px] font-mono uppercase transition-all active:scale-95 ${imageFormat === 'story' ? 'bg-emerald-500 text-black font-bold' : 'bg-[#111] text-zinc-500 border border-white/5 hover:bg-zinc-800'}`}>Story</button>
                <button onClick={() => setImageFormat('banner')} className={`px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-[32px] rounded-md text-[10px] sm:text-[10px] font-mono uppercase transition-all active:scale-95 ${imageFormat === 'banner' ? 'bg-emerald-500 text-black font-bold' : 'bg-[#111] text-zinc-500 border border-white/5 hover:bg-zinc-800'}`}>Banner</button>
              </>
            )}
          </div>
          
          {user?.email === 'davicho4522@gmail.com' && (
          <div className="relative">
            <input type="file" accept={mediaType === 'video' ? "video/*" : "image/*"} onChange={handleFileUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <button className="flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 w-8 h-8 rounded-lg hover:bg-emerald-500/20 transition-colors">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            </button>
          </div>
          )}
        </div>

        <div className="relative w-[280px] sm:w-[300px] md:w-[340px] h-[560px] sm:h-[640px] md:h-[720px] bg-black border-[6px] sm:border-[8px] border-[#1c1c1e] rounded-[2.5rem] sm:rounded-[3.5rem] shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col shrink-0">
          
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-50"></div>

          <AnimatePresence>
            {mobileView === 'rendering' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 z-50 rounded-[2.5rem]"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                  <Loader2 className="w-12 h-12 text-emerald-400 animate-spin relative z-10" />
                </div>
                <p className="mt-6 text-emerald-400/80 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">
                  Procesando Neural
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {(mobileView === 'idle' || mobileView === 'final_deployed') && (
            <div className="flex-1 relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
              {loading ? (
                <Loader2 className="animate-spin text-emerald-500" size={40} />
              ) : currentAssetUrl ? (
                <>
                  {mediaType === 'video' ? (
                    <motion.div 
                      key="view-final"
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className={`relative mx-auto overflow-hidden shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] ${
                        videoFormat === 'reel' || videoFormat === 'story'
                          ? 'w-[300px] sm:w-[320px] md:w-[340px] aspect-[9/19] rounded-[2.5rem] sm:rounded-[3rem] border-[6px] sm:border-[8px] border-zinc-900 bg-black'
                          : 'w-full max-w-[800px] aspect-video md:aspect-[4/3] rounded-2xl border border-zinc-800'
                      }`}
                    >
                      <video 
                        ref={videoRef}
                        src={currentAssetUrl} 
                        muted={!hasUserInteracted}
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      />
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
                          {!hasUserInteracted && (
                            <div className="relative group">
                              <div className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping group-hover:bg-emerald-500/60 transition-all duration-500"></div>
                              <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-emerald-500/30 backdrop-blur-xl border-2 border-emerald-400 text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.6)] transition-transform duration-300 group-hover:scale-110 active:scale-95">
                                <Play fill="currentColor" className="w-10 h-10 ml-1.5" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="absolute top-8 left-0 w-full flex justify-center z-30 pointer-events-none">
                          <span className="px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-full text-[10px] text-emerald-300 font-mono tracking-widest uppercase shadow-lg">
                            Asset Listo
                          </span>
                        </div>
                      </motion.div>
                  ) : (
                    <img src={currentAssetUrl} alt="Social Asset" className={`absolute inset-0 w-full h-full z-10 object-contain bg-black`} />
                  )}

                  <AnimatePresence>
                    {!hasUserInteracted && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                        className="absolute inset-0 flex items-center justify-center z-30 cursor-pointer"
                        onClick={() => {
                          setHasUserInteracted(true);
                          if (videoRef.current) {
                            videoRef.current.muted = false;
                            videoRef.current.currentTime = 0;
                            videoRef.current.play();
                          }
                        }}
                      >
                        <div className="relative group">
                          <div className="absolute inset-0 rounded-full bg-emerald-500/50 animate-ping group-hover:bg-emerald-400/60" />
                          <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-emerald-500/30 backdrop-blur-xl border-2 border-emerald-400 text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.6)] transition-transform hover:scale-110 active:scale-95">
                            <Play fill="currentColor" className="w-10 h-10 ml-1.5" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {hasUserInteracted && (
                    <div className="absolute bottom-24 left-4 flex flex-col gap-2 z-40 pointer-events-none">
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-zinc-800 rounded-lg flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-white font-mono">TikTok: LIVE</span>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }} className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-zinc-800 rounded-lg flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <span className="text-[10px] text-white font-mono">IG Reels: LIVE</span>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.5 }} className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-zinc-800 rounded-lg flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '1s' }} />
                        <span className="text-[10px] text-white font-mono">YT Shorts: LIVE</span>
                      </motion.div>
                    </div>
                  )}
                  
                  {renderUIOverlay()}
                </>
              ) : campaignAsset ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="relative w-full h-full"
                >
                  <img 
                    src={campaignAsset.imageUrl} 
                    alt="Social Asset" 
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-10">
                    <p className="text-white text-sm font-medium">"{campaignAsset.copy}"</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <button 
                      onClick={() => {
                        if (!balance.isInfinite && balance.computeTokens <= 0) {
                          navigate('/dashboard/subscription');
                        } else {
                          console.log('Premium campaign play action');
                        }
                      }}
                      className="w-20 h-20 rounded-full bg-emerald-500/20 backdrop-blur-xl border border-emerald-400/50 flex items-center justify-center text-emerald-400 group hover:scale-110 transition-transform"
                    >
                      <Play className="w-8 h-8 ml-1 group-hover:animate-pulse" fill="currentColor" />
                    </button>
                  </div>
                  <div className="absolute top-8 left-0 w-full flex justify-center z-30 pointer-events-none">
                    <span className="px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-full text-[10px] text-emerald-300 font-mono tracking-widest uppercase shadow-lg">
                      Campaña Activa
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className={`relative mx-auto overflow-hidden shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] ${
                    videoFormat === 'reel' || videoFormat === 'story'
                      ? 'w-[300px] sm:w-[320px] md:w-[340px] aspect-[9/19] rounded-[2.5rem] sm:rounded-[3rem] border-[6px] sm:border-[8px] border-zinc-900 bg-black'
                      : 'w-full max-w-[800px] aspect-video md:aspect-[4/3] rounded-2xl border border-zinc-800'
                  }`}
                >
                  <video 
                    ref={videoRef}
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />
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
                        <div className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping group-hover:bg-emerald-500/60 transition-all duration-500"></div>
                        <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-emerald-500/30 backdrop-blur-xl border-2 border-emerald-400 text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.6)] transition-transform duration-300 group-hover:scale-110 active:scale-95">
                          <Play fill="currentColor" className="w-10 h-10 ml-1.5" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-8 left-0 w-full flex justify-center z-30 pointer-events-none">
                      <span className="px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-full text-[10px] text-emerald-300 font-mono tracking-widest uppercase shadow-lg">
                        Asset Listo
                      </span>
                    </div>
                  </motion.div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-white/10 pt-6 w-[280px] sm:w-[300px] md:w-[340px]">
          <button 
            onClick={() => {
              if (!balance.isInfinite && balance.computeTokens <= 0) {
                navigate('/dashboard/subscription');
              } else {
                console.log("Iniciando creación de campaña...");
              }
            }}
            className="w-full relative group overflow-hidden rounded-xl p-[1px]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 rounded-xl opacity-70 group-hover:opacity-100 animate-pulse transition-opacity"></span>
            <div className="relative px-6 py-4 bg-zinc-950 rounded-xl flex items-center justify-between transition-all group-hover:bg-zinc-900">
              <div className="flex flex-col text-left">
                <span className="text-white font-bold text-sm">Crear Campaña Premium</span>
                <span className="text-zinc-500 text-[11px] font-mono">Requiere Compute Tokens</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 group-hover:scale-110 transition-transform">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </button>
        </div>

        <button className={`mt-4 sm:mt-6 w-[280px] sm:w-[300px] md:w-[340px] py-3 sm:py-4 rounded-xl font-black font-mono text-xs sm:text-sm tracking-widest transition-all duration-300 ${chatStep === 2 ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-zinc-900 text-zinc-600 border border-white/5 cursor-not-allowed'}`}>
          [ DEPLOY TO NETWORKS ]
        </button>
      </div>
    </div>
  );
}
