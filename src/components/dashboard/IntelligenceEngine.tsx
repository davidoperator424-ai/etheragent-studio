import React, { useState } from 'react';
import { Command, Sparkles, Lock, Play, CreditCard, Wand2, CheckCircle2, Download, Eye, Loader2, Video, Image as ImageIcon, Zap, ChevronRight, X, Crown } from 'lucide-react';
import { api, ApiError } from '../../services/api';
import GlassCard from '../GlassCard';
import { useToast } from '../../hooks/use-toast';

type StudioPhase = 'input' | 'generating' | 'image-ready' | 'paywall' | 'rendering' | 'complete';

interface GeneratedAvatar {
  prompt: string;
  imageUrl: string;
  seed: number;
}

export default function IntelligenceEngine() {
  const [prompt, setPrompt] = useState('');
  const [phase, setPhase] = useState<StudioPhase>('input');
  const [generatedAvatar, setGeneratedAvatar] = useState<GeneratedAvatar | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const [script, setScript] = useState('');
  const { toast } = useToast();

  const generateAvatar = async () => {
    if (!prompt.trim() || phase === 'generating') return;

    setPhase('generating');
    setGeneratedAvatar(null);

    try {
      const result = await api.generateAvatarImage(prompt);
      setGeneratedAvatar({
        prompt,
        imageUrl: result.imageUrl,
        seed: result.seed
      });
      setPhase('image-ready');
      toast({
        title: "Avatar generado",
        description: "Tu Neural Avatar está listo para previsualización",
        variant: "default",
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Error al generar avatar';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      console.error("Error generating avatar:", error);
      setPhase('input');
    }
  };

  const handleUnlockVideo = () => {
    setPhase('paywall');
  };

  const handlePayment = async () => {
    if (!generatedAvatar) return;

    try {
      const { url } = await api.createVideoCheckoutSession(
        generatedAvatar.prompt,
        script || 'Hola, soy tu asistente virtual.',
        generatedAvatar.seed,
        generatedAvatar.imageUrl
      );

      if (url.startsWith('/')) {
        window.location.href = url;
      } else {
        window.location.href = url;
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Error al iniciar pago';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateAvatar();
    }
  };

  const resetStudio = () => {
    setPrompt('');
    setPhase('input');
    setGeneratedAvatar(null);
    setRenderProgress(0);
    setScript('');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 text-violet-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
          <Sparkles size={12} /> Neural Casting Studio
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
              EtherClaw
            </h1>
            <p className="text-white/50 mt-3 text-lg">Convierte tu idea en un avatar speaking.</p>
          </div>
          {phase !== 'input' && (
            <button
              onClick={resetStudio}
              className="flex items-center gap-2 px-4 py-2 glass-panel rounded-xl text-white/60 hover:text-white transition-colors"
            >
              <Sparkles size={18} />
              <span className="text-sm">Nuevo Avatar</span>
            </button>
          )}
        </div>
      </header>

      {phase === 'input' && (
        <div className="max-w-3xl mx-auto">
          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
            <div className="relative flex items-center">
              <div className="absolute left-6 text-white/30">
                <Wand2 size={24} />
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={false}
                rows={3}
                className="w-full glass-panel rounded-[28px] py-6 pl-16 pr-44 text-lg font-medium focus:outline-none focus:border-violet-500/50 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                placeholder="Describe tu avatar: Clínica de Estética en Miami, doctora premium, bata blanca..."
              />
              <button
                onClick={generateAvatar}
                disabled={!prompt.trim()}
                className="absolute right-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-[20px] hover:scale-105 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
              >
                {false ? (
                  <><Loader2 className="animate-spin" size={20} /> Generando...</>
                ) : (
                  <><Sparkles size={20} /> Generar</>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🏥', label: 'Healthcare', example: 'Médico boutique en Madrid' },
              { icon: '💼', label: 'Professional', example: 'Abogado corporativo' },
              { icon: '🛒', label: 'E-Commerce', example: 'Tienda de sneakers' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => setPrompt(item.example)}
                className="glass-panel rounded-2xl p-5 text-left hover:bg-white/10 transition-all group"
              >
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <p className="text-white/80 font-semibold">{item.label}</p>
                <p className="text-white/40 text-sm mt-1 group-hover:text-white/60 transition-colors">{item.example}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'generating' && (
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-pulse opacity-40" />
            <div className="relative w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center">
              <Wand2 size={48} className="text-white animate-bounce" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">EtherClaw está creando tu avatar</h3>
          <p className="text-white/50">Combinando {prompt.split(' ').slice(0, 3).join(' ')}...</p>
        </div>
      )}

      {phase === 'image-ready' && generatedAvatar && (
        <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
          <div className="glass-panel rounded-[32px] p-1 overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black rounded-[30px] overflow-hidden">
              <img
                src={generatedAvatar.imageUrl}
                alt="Generated Avatar"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={12} className="inline mr-1" /> Imagen Generada
                  </span>
                  <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-white/60 text-xs">
                    Seed: {generatedAvatar.seed}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">"{generatedAvatar.prompt}"</h3>
                <p className="text-white/50 text-sm">Tu Neural Avatar está listo para previsualización</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <ImageIcon className="text-emerald-400" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold">Preview Image</h4>
                  <p className="text-white/40 text-sm">Incluido gratis</p>
                </div>
              </div>
              <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 flex items-center justify-center gap-2 cursor-not-allowed">
                <Eye size={18} />
                <span>Ver imagen</span>
              </button>
            </div>

            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-violet-500/10 rounded-xl">
                    <Video className="text-violet-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold flex items-center gap-2">
                      Speaking Video
                      <Lock size={14} className="text-amber-400" />
                    </h4>
                    <p className="text-white/40 text-sm">Requiere upgrade</p>
                  </div>
                </div>
                <button
                  onClick={handleUnlockVideo}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-violet-500/25"
                >
                  <Play size={18} />
                  <span>Desbloquear Video</span>
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-xs">$49</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'paywall' && generatedAvatar && (
        <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
          <div className="glass-panel rounded-[32px] p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10" />
            <div className="absolute top-0 right-0 p-20 bg-gradient-to-bl from-amber-500/10 to-transparent blur-3xl" />

            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Crown size={40} className="text-white" />
              </div>

              <h3 className="text-3xl font-bold text-white mb-2">Desbloquea tu Speaking Avatar</h3>
              <p className="text-white/50 mb-8">El video incluye voz sincronizada con lip-sync AI</p>

              <div className="bg-black/40 rounded-2xl p-6 mb-8 text-left">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <div>
                    <p className="text-white font-bold text-lg">Video Production</p>
                    <p className="text-white/40 text-sm">40 segundos de video + voz</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">$49</p>
                    <p className="text-white/40 text-sm">one-time</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    'Video 1080p HD',
                    'Voz TTS premium (High Fidelity)',
                    'Lip-sync AI incluido',
                    'Entrega en 20 minutos',
                    'Descarga en MP4'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/70">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
                  placeholder="Escribe el script que dirá tu avatar..."
                />

                <button
                  onClick={handlePayment}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-violet-500/25"
                >
                  <CreditCard size={20} />
                  <span>Pagar $49 y renderizar</span>
                </button>

                <p className="text-white/30 text-xs">
                  Procesado por Stripe. Sin suscripción.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'rendering' && (
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-white/10" />
              <circle
                cx="64" cy="64" r="56"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={351}
                strokeDashoffset={351 - (351 * renderProgress) / 100}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={32} className="text-violet-400" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">EtherClaw está renderizando</h3>
          <p className="text-white/50 mb-8">ETA: ~20 minutos</p>

          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
              style={{ width: `${renderProgress}%` }}
            />
          </div>
          <p className="text-white/40 text-sm mt-4">{Math.round(renderProgress)}%</p>
        </div>
      )}

      {phase === 'complete' && (
        <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
          <div className="glass-panel rounded-[32px] p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-violet-600/10" />
            <div className="absolute top-0 right-0 p-20 bg-gradient-to-bl from-emerald-500/10 to-transparent blur-3xl" />

            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
                <CheckCircle2 size={48} className="text-white" />
              </div>

              <h3 className="text-3xl font-bold text-white mb-2">¡Avatar en producción!</h3>
              <p className="text-white/50 mb-8">Tu video estará listo en 20 minutos</p>

              <div className="bg-black/40 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={generatedAvatar?.imageUrl}
                    alt="Avatar"
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="text-left">
                    <p className="text-white font-bold">{generatedAvatar?.prompt}</p>
                    <p className="text-white/40 text-sm">Video + Voz listos</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  className="flex-1 py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <Download size={20} />
                  <span>Descargar cuando listo</span>
                </button>
                <button
                  onClick={resetStudio}
                  className="px-6 py-4 glass-panel rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                >
                  <ChevronRight size={20} />
                  <span>Otro</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
