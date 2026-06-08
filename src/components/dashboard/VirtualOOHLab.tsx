import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useVoiceStore } from '@/store/useVoiceStore';
import { useCampaignStore } from '@/store/useCampaignStore';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useAuth } from '@/contexts/AuthContext';
import { MonitorPlay, Sparkles, Zap, Loader2, Upload, Play, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VirtualOOHLab() {
  const location = useLocation();
  const navigate = useNavigate();
  const { balance } = useTokenBalance();
  const { user } = useAuth();
  const isDemo = location.state?.isDemo === true;
  const isFullDemo = location.state?.isFullDemo === true;
  const nextStep = location.state?.nextStep;

  const [billboardUrl, setBillboardUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [chatStep, setChatStep] = useState(1);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string, typing?: boolean}[]>([]);
  
  const valeriaMsg1 = "🏙️ Analizando geometría del activo 'Mafia Aviar'. Preparando adaptación para pantallas de gran formato (Times Square / Shibuya).";
  const valeriaMsg2 = "📐 Calculando perspectiva anamórfica 3D (Efecto 'Out of Box'). Extruyendo elementos de primer plano: Humo volumétrico y vasos de cristal para ilusión de profundidad.";
  const valeriaMsg3 = "✅ Renderizado volumétrico completado. Simulando tráfico peatonal. Impacto visual estimado: +450% de retención frente a vallas tradicionales. Presiona Play para visualizar.";

  const { speak, stopSpeaking, isSpeaking } = useVoiceStore();
  const workspace = useCampaignStore((state) => state.workspace);

  // Fetch inicial de Supabase
  useEffect(() => {
    const fetchAsset = async () => {
      const { data } = await supabase
        .from('visual_assets')
        .select('id, url')
        .in('id', ['viktor_ooh_billboard', 'viktor_ooh_video']);

      if (data && data.length > 0) {
        const videoAsset = data.find(item => item.id === 'viktor_ooh_video');
        const imgAsset = data.find(item => item.id === 'viktor_ooh_billboard');

        if (videoAsset) {
          setBillboardUrl(videoAsset.url);
          setIsVideo(true);
        } else if (imgAsset) {
          setBillboardUrl(imgAsset.url);
          setIsVideo(false);
        }
      }
      setLoading(false);
    };
    fetchAsset();
  }, []);

  // Demo mode voice
  useEffect(() => {
    if (isDemo) {
      const viktorWelcome = "Bienvenido al Virtual OOH Lab, CEO. Soy Viktor, tu arquitecto espacial. Desplegaremos tu marca en vallas panorámicas 8K y el Metaverso. ¿Preparado para dominar el mundo real?";

      window.speechSynthesis.onvoiceschanged = () => speak(viktorWelcome, "viktor");
      if (window.speechSynthesis.getVoices().length > 0) speak(viktorWelcome, "viktor");

      if (isFullDemo && nextStep === 3) {
        setTimeout(() => {
          speak("Último paso. Transfiriendo a Kaelen en Performance Ads. Optimizaremos el ROAS.", "viktor");
          setTimeout(() => {
            navigate('/dashboard/ads', { state: { isDemo: true, isFullDemo: true } });
          }, 4500);
        }, 6000);
      }
    }
    return () => stopSpeaking();
  }, [isDemo]);

  // Subida Directa
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setUploading(true);

      const isVid = file.type.includes('video');
      const assetId = isVid ? 'viktor_ooh_video' : 'viktor_ooh_billboard';
      const fileExt = file.name.split('.').pop();
      const fileName = `${assetId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('visual-assets').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('visual-assets').getPublicUrl(fileName);
      await supabase.from('visual_assets').upsert({ id: assetId, url: publicUrl, updated_at: new Date() });

      setBillboardUrl(publicUrl);
      setIsVideo(isVid);
    } catch (error) {
      console.error('Error subiendo asset:', error);
      alert('Error al subir el archivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleCompile = () => {
    setIsCompiling(true);
    setChatMessages([{ role: 'assistant', content: valeriaMsg1, typing: true }]);
    setTimeout(() => {
      setChatMessages(prev => prev.map(m => m.typing ? { ...m, typing: false } : m));
      setChatMessages(prev => [...prev, { role: 'assistant', content: valeriaMsg2, typing: true }]);
    }, 2500);
    setTimeout(() => {
      setChatMessages(prev => prev.map(m => m.typing ? { ...m, typing: false } : m));
      setChatMessages(prev => [...prev, { role: 'assistant', content: valeriaMsg3, typing: false }]);
      setIsCompiling(false);
      setChatStep(2);
    }, 5500);
  };

  return (
    <div className="flex flex-col xl:flex-row min-h-screen w-full bg-[#050505] text-white p-3 sm:p-4 md:p-8 gap-4 sm:gap-8 pb-32 overflow-x-hidden overflow-y-auto">

      {/* PANEL IZQUIERDO: Chat de Viktor */}
      <div className="flex-1 flex flex-col max-w-3xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full border-2 border-orange-500/50 flex items-center justify-center bg-zinc-900">
              <span className="font-black text-2xl text-white">V</span>
              {isDemo && isSpeaking && <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Viktor S.</h2>
              <p className="text-orange-500 font-mono text-xs tracking-widest uppercase">
                Spatial Architect • {isDemo ? 'Demo Activa' : 'Active Session'}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-3xl p-8 flex flex-col relative overflow-visible">
          <div className="flex items-start gap-2 mb-8">
            <Sparkles size={16} className="text-orange-500 mt-0.5 shrink-0" />
            <span className="text-orange-500 text-[10px] font-mono tracking-widest uppercase break-words pr-4">
              {workspace ? `Prompt Base: ${workspace.visual_vectors}` : "Nodo: Neo-Shibuya"}
            </span>
          </div>

          {chatMessages.length === 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl rounded-tl-sm w-[90%] mb-6"
              >
                <p className="text-zinc-300 text-sm font-medium mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-orange-500" />
                  Análisis de Activo Volumétrico
                </p>
                <div className="p-3 bg-black/60 border border-orange-500/20 rounded-lg font-mono text-xs text-orange-400 leading-relaxed whitespace-pre-wrap">
                  🏙️ Analizando geometría del activo 'Mafia Aviar'. Preparando adaptación para pantallas de gran formato (Times Square / Shibuya).
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-orange-900/20 border border-orange-500/20 p-6 rounded-2xl rounded-tr-sm w-[85%] self-end mb-6"
              >
                <p className="text-base text-orange-100 leading-relaxed">
                  📐 Calculando perspectiva anamórfica 3D (Efecto 'Out of Box'). Extruyendo elementos de primer plano: Humo volumétrico y vasos de cristal para ilusión de profundidad.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-zinc-900/50 border border-orange-500/30 p-6 rounded-2xl rounded-tl-sm w-[90%] mb-6"
              >
                <p className="text-base text-white leading-relaxed font-medium">
                  ✅ Renderizado volumétrico completado. Simulando tráfico peatonal. Impacto visual estimado: +450% de retención. Presiona Play para visualizar.
                </p>
              </motion.div>
            </>
          )}

          {chatMessages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-zinc-900/50 border border-white/10 p-6 rounded-2xl ${msg.role === 'user' ? 'rounded-tr-sm w-[85%] self-end mb-6 border-orange-500/20' : 'rounded-tl-sm w-[90%] mb-6'} ${msg.typing ? 'border-orange-500/30' : ''}`}
            >
              <p className="text-base text-zinc-300 leading-relaxed">
                {msg.content}
                {msg.typing && <span className="inline-flex ml-1"><span className="animate-pulse">▊</span></span>}
              </p>
            </motion.div>
          ))}

          {chatStep === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/50 border border-orange-500/30 p-6 rounded-2xl rounded-tl-sm w-[90%] mb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
              <p className="text-base text-white leading-relaxed font-medium">
                Despliegue holográfico activo. Verifica el panel físico a tu derecha.
              </p>
            </motion.div>
          )}

          <div className="mt-auto grid grid-cols-2 gap-4">
            <button onClick={handleCompile} disabled={isCompiling || chatStep === 2} className="bg-[#111] hover:bg-zinc-800 border border-white/5 p-4 rounded-xl flex items-center justify-center gap-3 text-sm font-bold text-zinc-300 transition-colors">
              {isCompiling ? <Loader2 size={18} className="text-orange-500 animate-spin" /> : <Zap size={18} className="text-orange-500" />} Encender Valla
            </button>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO: EL MÓVIL PERFECTO (Idéntico a Social Lab — 340x720) */}
      <div className="w-full xl:w-[420px] shrink-0 flex flex-col items-center pt-8">

        <div className="w-[280px] sm:w-[300px] md:w-[340px] flex justify-between items-center mb-6 px-2">
          <h3 className="text-sm font-mono tracking-widest uppercase text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Spatial Preview
          </h3>

          {user?.email === 'davicho4522@gmail.com' && (
          <div className="relative">
            <input type="file" accept="image/*,video/*" onChange={handleFileUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <button className="flex items-center gap-2 bg-orange-500/10 text-orange-500 border border-orange-500/30 px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold hover:bg-orange-500/20 transition-all active:scale-95">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {uploading ? 'Subiendo...' : 'Subir Asset'}
            </button>
          </div>
          )}
        </div>

        {/* EL MÓVIL ESTRICTO (340x720px) */}
        <div className="relative w-[280px] sm:w-[300px] md:w-[340px] h-[560px] sm:h-[640px] md:h-[720px] bg-black border-[6px] sm:border-[8px] border-[#1c1c1e] rounded-[2.5rem] sm:rounded-[3.5rem] shadow-[0_0_50px_rgba(249,115,22,0.15)] overflow-hidden flex flex-col shrink-0 group">

          {/* Notch del Celular */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-50"></div>

          <div className="flex-1 relative bg-zinc-900 w-full h-full">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
            ) : billboardUrl ? (
              <div className="relative w-full h-full bg-zinc-950 overflow-hidden z-40 rounded-xl border border-zinc-800">
                {isVideo ? (
                  <video 
                    ref={videoRef}
                    src={billboardUrl} 
                    muted={!hasUserInteracted}
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />
                ) : (
                  <img src={billboardUrl} alt="Billboard" className="absolute inset-0 w-full h-full object-cover z-10" />
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
              <div className="relative w-full h-full bg-zinc-950 overflow-hidden z-40 rounded-xl border border-zinc-800">
                <video 
                  ref={videoRef}
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>
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
                <div className="absolute top-8 left-0 w-full flex justify-center z-30 pointer-events-none">
                  <span className="px-4 py-1.5 bg-orange-500/20 backdrop-blur-md border border-orange-400/30 rounded-full text-[10px] text-orange-300 font-mono tracking-widest uppercase shadow-lg">
                    Asset Listo
                  </span>
                </div>
              </div>
            )}

            {/* Overlay sutil para OOH */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur text-[8px] font-mono text-orange-500 px-2 py-1 rounded z-20">
              NODE_ACTIVE_OOH
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-6 w-[280px] sm:w-[300px] md:w-[340px]">
          <button 
            onClick={() => {
              if (!balance.isInfinite && balance.computeTokens <= 0) {
                navigate('/dashboard/subscription');
              } else {
                console.log("Iniciando creación de campaña OOH...");
              }
            }}
            className="w-full relative group overflow-hidden rounded-xl p-[1px]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 rounded-xl opacity-70 group-hover:opacity-100 animate-pulse transition-opacity"></span>
            <div className="relative px-6 py-4 bg-zinc-950 rounded-xl flex items-center justify-between transition-all group-hover:bg-zinc-900">
              <div className="flex flex-col text-left">
                <span className="text-white font-bold text-sm">Crear Campaña Premium</span>
                <span className="text-zinc-500 text-[11px] font-mono">Requiere Compute Tokens</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/50 group-hover:scale-110 transition-transform">
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </div>
            </div>
          </button>
        </div>

        <button className={`mt-4 sm:mt-6 w-[280px] sm:w-[300px] md:w-[340px] py-3 sm:py-4 rounded-xl font-black font-mono text-xs sm:text-sm tracking-widest transition-all duration-300 ${chatStep === 2 ? 'bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_30px_rgba(249,115,22,0.3)]' : 'bg-zinc-900 text-zinc-600 border border-white/5 cursor-not-allowed'}`}>
          [ DEPLOY TO METAVERSE ]
        </button>
      </div>
    </div>
  );
}
