import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Globe, Activity, Terminal, Smartphone, MonitorPlay, Headphones, Film, PlayCircle, Loader2, TerminalSquare } from 'lucide-react';
import { useVoice } from '@/context/GlobalVoiceContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CampaignArchive from '@/components/CampaignArchive';
import { getCachedResponse, setCachedResponse, clearAICache } from '@/lib/aiCache';
import { RotateCcw, Bell, BellOff } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

// ─── SUB-COMPONENTE AISLADO: Evita que el Command Hub completo se re-renderice por cada letra ───
const TypewriterText = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isDone, setIsDone] = useState(false);

    useEffect(() => {
        setDisplayedText('');
        setIsDone(false);
        let currentIndex = 0;

        if (!text) return;

        // 15ms por carácter = velocidad hacker ultrarrápida pero legible
        const typingInterval = setInterval(() => {
            currentIndex++;
            setDisplayedText(text.slice(0, currentIndex));

            if (currentIndex >= text.length) {
                clearInterval(typingInterval);
                setIsDone(true);
            }
        }, 15);

        return () => clearInterval(typingInterval);
    }, [text]);

    return (
        <span className="relative">
            {displayedText}
            {/* Cursor emisivo verde de terminal — brilla en pantallas OLED */}
            {!isDone && (
                <span className="inline-block w-2 h-4 md:h-5 ml-1 bg-emerald-500 animate-[pulse_0.8s_ease-in-out_infinite] align-middle shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            )}
        </span>
    );
};

// EL ARSENAL COMPLETO (Desde Nexus hasta Replay)
const LAB_MODULES = [
    {
        title: "Escanear topología de marca",
        lab: "Nexus",
        icon: Terminal,
        color: "emerald",
        route: "/dashboard/nexus"
    },
    {
        title: "Generar bumper viral para TikTok",
        lab: "Social Lab",
        icon: Smartphone,
        color: "emerald",
        route: "/dashboard/social"
    },
    {
        title: "Desplegar valla 8K en Metaverso",
        lab: "Virtual OOH",
        icon: MonitorPlay,
        color: "amber",
        route: "/dashboard/ooh"
    },
    {
        title: "Crear cuña radial sintética",
        lab: "Sonic Lab",
        icon: Headphones,
        color: "orange",
        route: "/dashboard/sonic"
    },
    {
        title: "Inyectar presupuesto en Meta Ads",
        lab: "Performance",
        icon: Activity,
        color: "violet",
        route: "/ads"
    },
    {
        title: "Renderizar comercial cinemático",
        lab: "Commercial",
        icon: Film,
        color: "cyan",
        route: "/commercial-matrix"
    },
    {
        title: "Iniciar Orquestación Multi-Agente",
        lab: "Task Replay",
        icon: PlayCircle,
        color: "emerald",
        route: "/replay",
        fullWidth: true
    }
];

interface WelcomeProps {
    isDemoMode?: boolean;
}

export default function EtherAgentWelcome({ isDemoMode = false }: WelcomeProps) {
    const [prompt, setPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const { isListening, startListening, stopListening, transcript } = useVoice();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { permission, requestPermission } = useNotifications();

    // LA LÓGICA DEL FANTASMA (Auto-escritura en demo)
    useEffect(() => {
        if (isDemoMode) {
            setPrompt('');
            setIsProcessing(false);

            const masterCommand = "Desplegar infraestructura omnicanal completa para EtherAI Labs...";
            let i = 0;

            const typing = setInterval(() => {
                setPrompt(masterCommand.slice(0, i));
                i++;

                if (i > masterCommand.length) {
                    clearInterval(typing);
                    setTimeout(() => setIsProcessing(true), 600);
                }
            }, 50);

            return () => clearInterval(typing);
        }
    }, [isDemoMode]);

    // ENVÍO DIRECTO DESDE LAS TARJETAS (Latencia Cero)
    const handleCardClick = async (moduleText: string, route: string) => {
        setIsProcessing(true);
        setPrompt(moduleText);

        await new Promise(resolve => setTimeout(resolve, 600));
        navigate(route, { state: { incomingPrompt: moduleText } });
    };

    const handleClearMemory = () => {
        clearAICache();
        setAiResponse("Memoria local purgada. Estoy listo para procesar nuevos flujos de datos, Davicho. 🦅");
    };

    // ENVÍO DESDE LA BARRA DE TEXTO/VOZ (Enrutamiento inteligente o Consulta LLM)
    const handleCommandSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const textToProcess = isListening ? transcript : prompt;
        if (!textToProcess.trim()) return;

        // Comandos locales "Hard-coded" de navegación
        const lowerText = textToProcess.toLowerCase();
        let isLocalCommand = false;
        let targetRoute = '/dashboard/nexus';

        if (lowerText.includes('meta ads') || lowerText.includes('performance') || lowerText.includes('presupuesto')) { targetRoute = '/dashboard/ads'; isLocalCommand = true; }
        else if (lowerText.includes('tiktok') || lowerText.includes('social') || lowerText.includes('bumper')) { targetRoute = '/dashboard/social'; isLocalCommand = true; }
        else if (lowerText.includes('radio') || lowerText.includes('spotify') || lowerText.includes('cuña')) { targetRoute = '/dashboard/sonic'; isLocalCommand = true; }
        else if (lowerText.includes('valla') || lowerText.includes('metaverso') || lowerText.includes('ooh')) { targetRoute = '/dashboard/ooh'; isLocalCommand = true; }
        else if (lowerText.includes('comercial') || lowerText.includes('cinemático') || lowerText.includes('render')) { targetRoute = '/dashboard/commercial-matrix'; isLocalCommand = true; }
        else if (lowerText.includes('replay') || lowerText.includes('orquestación') || lowerText.includes('agentes')) { targetRoute = '/dashboard/replay'; isLocalCommand = true; }

        if (isLocalCommand) {
            setIsProcessing(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            navigate(targetRoute, { state: { incomingPrompt: textToProcess } });
            return;
        }

        // Si no es un comando de navegación local y el usuario está autenticado,
        // asume una consulta para LLM.
        if (!user) return;

        setIsThinking(true);
        setAiResponse('');

        // --- EL ESCUDO DE AHORRO ---
        const cached = getCachedResponse(textToProcess);
        if (cached) {
            console.log("⚡ Marcus: Respuesta recuperada del cache local (0 tokens usados)");
            // Simulamos un pequeño delay de "pensamiento" para no romper la UX
            setTimeout(() => {
                setAiResponse(cached);
                setIsThinking(false);
                setPrompt('');
                if (isListening) stopListening();
            }, 500);
            return; // Salimos de la función, no hay llamada a la API
        }

        try {
            const res = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: textToProcess,
                    userId: user.id
                })
            });

            const data = await res.json();
            if (data.response) {
                setAiResponse(data.response);
                // GUARDAMOS EN CACHE PARA LA PRÓXIMA VEZ
                setCachedResponse(textToProcess, data.response);
            } else {
                setAiResponse("ERROR: Ruptura en el enlace cognitivo con Groq.");
            }
        } catch (error) {
            setAiResponse("ERROR CRÍTICO: Imposible contactar al endpoint seguro.");
        } finally {
            setIsThinking(false);
            setPrompt('');
            if (isListening) {
                stopListening();
            }
        }
    };

    const displayValue = isListening ? transcript : prompt;

    return (
        // CONTENEDOR RAÍZ: Altura completa, scroll habilitado, padding inferior para no pisar el TabBar
        <div className="relative w-full h-full bg-[#030303] flex flex-col overflow-y-auto overflow-x-hidden selection:bg-emerald-500/30 pb-32">

            {/* CAPA DE PROFUNDIDAD */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* CONTENIDO SCROLLABLE (Avatar + Módulos + Archivo + Respuesta IA) */}
            <div className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-10 md:pt-16 flex flex-col items-center flex-1 relative z-10">

                {/* EL AVATAR DEL CEO */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className={`relative w-24 h-24 md:w-32 md:h-32 mb-6 rounded-full border-2 p-1 transition-all duration-500 ${isProcessing ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]' : 'border-white/10'
                        }`}
                >
                    <div className="absolute inset-0 rounded-full overflow-hidden bg-zinc-900">
                        <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
                            alt="CEO Node"
                            className="w-full h-full object-cover opacity-80"
                        />
                    </div>
                    {isProcessing && (
                        <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] animate-[spin_3s_linear_infinite]">
                            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="50 150" strokeLinecap="round" />
                        </svg>
                    )}
                    {isListening && (
                        <div className="absolute inset-0 border-[3px] border-emerald-500 rounded-full animate-ping opacity-30" />
                    )}
                </motion.div>

                {/* TÍTULO Y NOTIFICACIONES */}
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-10 relative flex flex-col items-center">
                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-widest mb-2 uppercase">
                        EtherAgent <span className="text-emerald-500">OS</span>
                    </h1>
                    <p className="text-zinc-500 font-mono text-xs md:text-sm tracking-[0.2em] uppercase mb-4">
                        Terminal de Comando En Línea
                    </p>

                    {/* NOTIFICACIONES SWITCH */}
                    <button
                        onClick={requestPermission}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${permission === 'granted'
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                : 'border-orange-500/30 bg-orange-500/10 text-orange-400 animate-pulse'
                            }`}
                    >
                        {permission === 'granted' ? <Bell size={14} /> : <BellOff size={14} />}
                        <span className="text-[10px] font-mono tracking-widest uppercase">
                            {permission === 'granted' ? 'Link Activo' : 'Activar Alertas'}
                        </span>
                    </button>
                </motion.div>

                {/* GRID BENTO DE ACCIONES RÁPIDAS (Todos los laboratorios) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl pb-10 md:pb-0"
                >
                    {LAB_MODULES.map((mod, index) => {
                        const Icon = mod.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => handleCardClick(mod.title, mod.route)}
                                disabled={isProcessing}
                                className={`group relative flex items-center gap-4 text-left bg-zinc-950 hover:bg-zinc-900/80 border border-white/5 hover:border-${mod.color}-500/30 p-4 rounded-2xl transition-all duration-300 overflow-hidden ${mod.fullWidth ? 'md:col-span-2 md:w-2/3 md:mx-auto justify-center' : ''}`}
                            >
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${mod.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5' :
                                    mod.color === 'amber' ? 'bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/5' :
                                        mod.color === 'orange' ? 'bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/5' :
                                            mod.color === 'violet' ? 'bg-gradient-to-r from-violet-500/0 via-violet-500/0 to-violet-500/5' :
                                                'bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/5'
                                    }`} />

                                <div className={`w-10 h-10 shrink-0 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center transition-colors ${mod.color === 'emerald' ? 'group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30' :
                                    mod.color === 'amber' ? 'group-hover:bg-amber-500/10 group-hover:border-amber-500/30' :
                                        mod.color === 'orange' ? 'group-hover:bg-orange-500/10 group-hover:border-orange-500/30' :
                                            mod.color === 'violet' ? 'group-hover:bg-violet-500/10 group-hover:border-violet-500/30' :
                                                'group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30'
                                    }`}>
                                    <Icon size={18} className={`text-zinc-500 ${mod.color === 'emerald' ? 'group-hover:text-emerald-400' :
                                        mod.color === 'amber' ? 'group-hover:text-amber-400' :
                                            mod.color === 'orange' ? 'group-hover:text-orange-400' :
                                                mod.color === 'violet' ? 'group-hover:text-violet-400' :
                                                    'group-hover:text-cyan-400'
                                        }`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-zinc-300 text-sm font-medium truncate group-hover:text-white transition-colors">{mod.title}</p>
                                    <p className={`text-[10px] font-mono uppercase tracking-widest mt-1 ${mod.color === 'emerald' ? 'group-hover:text-emerald-500/70 text-zinc-600' :
                                        mod.color === 'amber' ? 'group-hover:text-amber-500/70 text-zinc-600' :
                                            mod.color === 'orange' ? 'group-hover:text-orange-500/70 text-zinc-600' :
                                                mod.color === 'violet' ? 'group-hover:text-violet-500/70 text-zinc-600' :
                                                    'group-hover:text-cyan-500/70 text-zinc-600'
                                        }`}>MÓDULO: {mod.lab}</p>
                                </div>
                            </button>
                        );
                    })}
                </motion.div>

                {/* ========================================================= */}
                {/* INYECCIÓN DEL ARCHIVO B2B (Solo visible si no es Demo) */}
                {/* ========================================================= */}
                {!isDemoMode && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="w-full max-w-4xl mt-10 md:mt-12 mb-8"
                    >
                        <CampaignArchive />
                    </motion.div>
                )}

                {/* EL VISOR DE RESPUESTA DE LA IA (Con Typing Effect) */}
                <AnimatePresence>
                    {(isThinking || aiResponse) && !isDemoMode && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="w-full max-w-3xl mx-auto px-4 md:px-6 mb-8 relative z-20"
                        >
                            <div className="bg-zinc-900/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                                    <TerminalSquare size={16} className="text-emerald-500" />
                                    <span className="text-emerald-500 font-mono text-xs tracking-widest uppercase font-bold">Respuesta de Marcus (LLaMA-3)</span>
                                </div>

                                {isThinking ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                                        <p className="text-zinc-500 font-mono text-sm animate-pulse">Analizando flujos de datos en PostgreSQL...</p>
                                    </div>
                                ) : (
                                    <p className="text-white text-sm md:text-base leading-relaxed whitespace-pre-wrap font-mono relative">
                                        <TypewriterText text={aiResponse} />
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* LA BARRA DE COMANDOS (Fijada estilo iOS Spotlight) */}
            {/* Fixed en móvil para que siempre esté sobre el scroll, respetando el MobileTabBar */}
            <div className="fixed md:absolute bottom-[90px] md:bottom-10 left-0 right-0 px-4 md:px-6 z-50 pointer-events-none">
                <form onSubmit={handleCommandSubmit} className="max-w-3xl mx-auto relative flex items-center shadow-[0_30px_60px_rgba(0,0,0,0.8)] pointer-events-auto">

                    <button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        disabled={isDemoMode || isThinking}
                        className="absolute left-2 p-3 transition-colors group disabled:opacity-50 z-20"
                    >
                        {isListening ? (
                            <div className="relative flex items-center justify-center">
                                <span className="absolute w-5 h-5 rounded-full bg-red-500 animate-ping opacity-60" />
                                <Mic size={20} className="text-red-500 relative z-10" />
                            </div>
                        ) : (
                            <Mic size={20} className="text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleClearMemory}
                        title="Limpiar memoria de Marcus"
                        disabled={isDemoMode || isThinking}
                        className="absolute left-[3.2rem] p-3 text-zinc-600 hover:text-red-400 transition-colors group disabled:opacity-50 z-20"
                    >
                        <RotateCcw size={18} className="group-active:rotate-[-180deg] transition-transform duration-500" />
                    </button>

                    <input
                        type="text"
                        value={displayValue}
                        readOnly={isDemoMode || isThinking || isListening}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isProcessing || isThinking}
                        placeholder={
                            isListening ? "Escuchando tus directivas..." :
                                isThinking ? "Procesando telemetría..." :
                                    "Comanda a Marcus (Ej: Resume mis campañas)..."
                        }
                        className={`w-full backdrop-blur-3xl rounded-2xl md:rounded-full py-4 pl-[6.5rem] pr-12 text-sm md:text-base outline-none transition-all shadow-inner disabled:opacity-50 ${isListening
                            ? 'bg-red-900/20 border border-red-500/50 text-red-200 focus:border-red-500'
                            : 'bg-zinc-900/90 border border-white/10 text-white focus:border-emerald-500/50 focus:bg-zinc-950'
                            }`}
                    />

                    <button
                        type="submit"
                        disabled={!displayValue.trim() || isThinking || isProcessing}
                        className={`absolute right-2 p-2 rounded-xl md:rounded-full transition-all flex items-center justify-center ${!displayValue.trim() || isThinking || isProcessing ? 'bg-zinc-800 text-zinc-600' : 'bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                            }`}
                    >
                        {isThinking ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={prompt ? 'ml-0.5' : ''} />}
                    </button>

                </form>
            </div>

        </div>
    );
}
