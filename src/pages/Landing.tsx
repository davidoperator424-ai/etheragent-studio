import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Mic, Terminal, Smartphone, MonitorPlay, Film, Sparkles, Heart, MessageCircle, Share2, UserCircle2, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Landing() {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  
  const [landingVideos, setLandingVideos] = useState({
    social: "https://cdn.coverr.co/videos/coverr-a-person-scrolling-on-a-smartphone-2921/1080p.mp4", 
    ooh: "https://cdn.coverr.co/videos/coverr-cyberpunk-city-at-night-8643/1080p.mp4",
    commercial: "https://cdn.coverr.co/videos/coverr-server-room-2751/1080p.mp4"
  });

  useEffect(() => {
    const fetchLandingAssets = async () => {
      const { data } = await supabase
        .from('visual_assets')
        .select('id, url')
        .in('id', ['landing_social', 'landing_ooh', 'landing_commercial']);
      
      if (data) {
        const newVideos = { ...landingVideos };
        data.forEach(asset => {
          if (asset.id === 'landing_social') newVideos.social = asset.url;
          if (asset.id === 'landing_ooh') newVideos.ooh = asset.url;
          if (asset.id === 'landing_commercial') newVideos.commercial = asset.url;
        });
        setLandingVideos(newVideos);
      }
    };
    fetchLandingAssets();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const text = "> Ejecutando protocolo 'NeuroBoost'.\n> Target: $1.2M MRR.\n> Compilando vectores de campaña...\n> Transfiriendo a Social Lab.";
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(text.slice(0, i));
      i++;
      if (i > text.length) i = 0;
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflowY = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.overflowY = 'auto';
    document.body.style.height = 'auto';

    return () => {
      document.documentElement.style.overflowY = '';
      document.documentElement.style.height = '';
      document.body.style.overflowY = '';
      document.body.style.height = '';
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-emerald-500/30">
      
      <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 backdrop-blur-md bg-[#050505]/50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <Sparkles size={16} className="text-black" />
          </div>
          <span className="font-black tracking-tighter text-xl">EtherAgent<span className="text-zinc-500">.OS</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Login</button>
          <button onClick={() => navigate('/dashboard/executive-demo')} className="px-5 py-2 bg-white text-black rounded-full text-sm font-black transition-transform hover:scale-105">
            Ver Demo
          </button>
        </div>
      </nav>

      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/15 blur-[150px] rounded-full pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-20 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111] border border-white/10 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-300">Inteligencia Artificial Desplegada</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-[90px] font-black tracking-tighter leading-[1.05] mb-6">
            Tu Agencia de Marketing.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">Comandada por Voz.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Habla. El sistema compila el video, despliega el anuncio y optimiza el presupuesto. Latencia cero.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/dashboard/executive-demo')} className="flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest text-xs transition-transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              <Play size={16} className="fill-black" /> Iniciar Task Replay
            </button>
            <button onClick={() => navigate('/dashboard/subscription')} className="flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-transparent border border-white/20 text-white rounded-full font-bold uppercase tracking-widest text-xs transition-colors hover:bg-white/5">
              Ver Planes de Acceso <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
        
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50">
          <span className="text-[9px] font-mono uppercase tracking-widest mb-2">Ver Flujo Operativo</span>
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
        </motion.div>
      </section>

      <section className="relative w-full max-w-7xl mx-auto px-4 py-24 flex flex-col gap-32">
        
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30"><Terminal className="text-blue-500" size={24} /></div>
            <h2 className="text-3xl md:text-5xl font-black">1. El Cerebro Central</h2>
            <p className="text-blue-500 font-mono text-xs uppercase tracking-widest">Marcus V. • Command Hub</p>
            <p className="text-zinc-400 text-lg leading-relaxed">No necesitas redactar prompts complejos. Dicta tu objetivo financiero y el Hub orquestará la topología de la campaña, enviando vectores de datos a cada laboratorio especializado.</p>
          </div>
          <div className="flex-1 w-full">
            <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-4 shadow-[0_0_50px_rgba(59,130,246,0.1)] w-full aspect-video flex flex-col">
              <div className="flex gap-2 mb-4"><div className="w-3 h-3 rounded-full bg-red-500"/><div className="w-3 h-3 rounded-full bg-yellow-500"/><div className="w-3 h-3 rounded-full bg-green-500"/></div>
              <pre className="text-blue-400 font-mono text-sm whitespace-pre-wrap">{typedText}<span className="animate-pulse">_</span></pre>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30"><Smartphone className="text-emerald-500" size={24} /></div>
            <h2 className="text-3xl md:text-5xl font-black">2. Dominio Viral</h2>
            <p className="text-emerald-500 font-mono text-xs uppercase tracking-widest">Valeria M. • Social Lab</p>
            <p className="text-zinc-400 text-lg leading-relaxed">Sintetización de hooks, edición de ritmo rápido y overlays nativos de TikTok e Instagram. Diseñado milimétricamente para hackear el algoritmo y aplastar el Costo por Clic.</p>
          </div>
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-[280px] h-[580px] bg-black border-[6px] border-[#1c1c1e] rounded-[3rem] shadow-[0_0_80px_rgba(16,185,129,0.15)] overflow-hidden group">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-50" />
              
              <video 
                src={landingVideos.social}
                autoPlay 
                loop 
                muted={isMuted} 
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
              />

              <button 
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className="absolute top-10 right-4 z-50 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
              >
                {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-emerald-400" />}
              </button>

              <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 bg-gradient-to-b from-black/20 via-transparent to-black/80 pt-10">
                <div className="mt-2"><span className="text-white font-bold text-lg drop-shadow-md">Para ti</span></div>
                <div className="flex justify-between items-end mb-4">
                  <div className="flex flex-col gap-2 max-w-[70%]">
                    <span className="text-white font-bold drop-shadow-md">@EtherAgent</span>
                    <p className="text-white text-sm leading-tight drop-shadow-md">Hackeando la atención. 🦃 #Viral</p>
                  </div>
                  <div className="flex flex-col items-center gap-5 pb-2">
                    <div className="w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center"><Heart size={20} className="text-white" fill="white" /></div>
                    <div className="w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center"><MessageCircle size={20} className="text-white" fill="white" /></div>
                  </div>
                </div>
              </div>
              <motion.div initial={{ top: '0%' }} animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3, ease: 'linear', repeat: Infinity }} className="absolute left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_20px_#10b981] z-30 opacity-70 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
              <MonitorPlay className="text-orange-500" size={24} />
            </div>
            <h2 className="text-3xl md:text-5xl font-black">3. Omnipresencia Espacial</h2>
            <p className="text-orange-500 font-mono text-xs uppercase tracking-widest">Viktor S. • Spatial Architect (FOOH & DOOH)</p>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Domina el mundo físico y el metaverso simultáneamente. Desde hologramas CGI virales (Fake Out-Of-Home) que rompen el internet, hasta renders 21:9 inyectados en circuitos de vallas digitales reales alrededor del mundo.
            </p>
          </div>
          <div className="flex-1 w-full">
            <div className="relative w-full aspect-[21/9] bg-black border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(249,115,22,0.1)] overflow-hidden flex items-center justify-center group">
              
              <video 
                src={landingVideos.ooh}
                autoPlay 
                loop 
                muted 
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay pointer-events-none" />
              <div className="z-10 bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest">Nodo Neo-Shibuya Desplegado</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30"><Film className="text-purple-500" size={24} /></div>
            <h2 className="text-3xl md:text-5xl font-black">4. Escala Comercial</h2>
            <p className="text-purple-500 font-mono text-xs uppercase tracking-widest">Kaelen R. • Conversion Lab</p>
            <p className="text-zinc-400 text-lg leading-relaxed">El cierre maestro. Creación de Video Sales Letters (VSLs) cinemáticos para retargeting de alto impacto. Transformamos el tráfico en ingresos predecibles.</p>
          </div>
          <div className="flex-1 w-full">
            <div className="relative w-full aspect-video bg-black border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden flex items-center justify-center group cursor-pointer">
              <video 
                src={landingVideos.commercial}
                autoPlay 
                loop 
                muted 
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)] z-10 transition-transform group-hover:scale-110">
                <Play className="fill-white text-white ml-1" size={24} />
              </div>
            </div>
          </div>
        </motion.div>

      </section>

      <section className="py-32 px-4 border-t border-white/5 bg-[#0a0a0c] text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <Mic size={48} className="mx-auto mb-8 text-emerald-500" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">La era de contratar humanos ha terminado.</h2>
          <button onClick={() => navigate('/dashboard/subscription')} className="flex items-center justify-center gap-3 w-full md:w-auto mx-auto px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-105">
            Desplegar Infraestructura <ArrowRight size={18} />
          </button>
        </div>
      </section>

    </div>
  );
}
