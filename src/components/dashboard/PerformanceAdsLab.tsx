import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Target, Send, CheckCircle2, Sparkles, Play, Pause,
  TrendingUp, DollarSign, MousePointer, BarChart3,
  Smartphone, Heart, MessageCircle, Share2, MoreHorizontal, Loader2, Brain
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { useVoiceStore } from '@/store/useVoiceStore';
import { useAuth } from '@/contexts/AuthContext';

const AGENT_INFO = {
  name: "Performance AI",
  role: "ROAS & Conversion Architect",
  avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
  status: "Online"
};

type Message = { id: string; sender: 'ai' | 'user'; text: string; hasWidget?: boolean };

interface CampaignRecord {
  id: string;
  target_url: string;
  detected_sector: string;
  strategy_score: number;
  campaign_data: any;
  created_at: string;
}

interface AIVoiceBubbleProps {
  message: Message;
  isPlaying: boolean;
  onTogglePlay: (id: string) => void;
}

function AIVoiceBubble({ message, isPlaying, onTogglePlay }: AIVoiceBubbleProps) {
  return (
    <div className="max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm bg-white/10 text-zinc-200 rounded-bl-sm border border-white/5">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onTogglePlay(message.id)}
          className="mt-0.5 w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors flex-shrink-0"
        >
          {isPlaying ? (
            <Pause size={12} className="text-black" />
          ) : (
            <Play size={12} className="text-black ml-0.5" />
          )}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">
              {isPlaying ? 'Speaking...' : 'Voice Model ID'}
            </span>
            {isPlaying && (
              <div className="flex items-center gap-0.5 h-3">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 rounded-full bg-emerald-400"
                    animate={{ height: [4, Math.random() * 10 + 4, 4] }}
                    transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="text-zinc-200 leading-relaxed">{message.text}</p>
        </div>
      </div>
    </div>
  );
}

interface PerformanceAdsLabProps {
  isDemoMode?: boolean;
}

export default function PerformanceAdsLab({ isDemoMode: propDemoMode = false }: PerformanceAdsLabProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isDemo = propDemoMode || location.state?.isDemo === true;
  
  const { metrics, isLoading: metricsLoading } = usePerformanceMetrics();
  const setWorkspace = useCampaignStore(state => state.setWorkspace);
  const [campaign, setCampaign] = useState<CampaignRecord | null>(null);
  const [adUrl, setAdUrl] = useState<string | null>(null);
  const [assetLoading, setAssetLoading] = useState(true);
  const { speak, stopSpeaking, isSpeaking } = useVoiceStore();

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

  useEffect(() => {
    const fetchAsset = async () => {
      const { data } = await supabase
        .from('visual_assets')
        .select('url')
        .eq('id', 'kaelen_ads_retargeting')
        .single();
        
      if (data?.url) {
        setAdUrl(data.url);
      }
      setAssetLoading(false);
    };
    fetchAsset();
  }, []);

  useEffect(() => {
    if (isDemo) {
      const kaelenWelcome = "Bienvenido al Performance Lab. Soy tu arquitecto de conversiones. Aquí optimizaremos tu ROAS con precisión quirúrgica. ¿Listo para inyectar presupuesto?";
      
      window.speechSynthesis.onvoiceschanged = () => speak(kaelenWelcome, "viktor");
      if (window.speechSynthesis.getVoices().length > 0) speak(kaelenWelcome, "viktor");
    }
    return () => stopSpeaking();
  }, [isDemo]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Asset visual recibido desde Nexus. El A/B test predictivo indica que combinar esta imagen estática con un Voiceover sintético dinámico reducirá nuestro CPA en un 42%. ¿Procedo con la inyección de voz?"
    },
    {
      id: '2',
      sender: 'user',
      text: "Inyecta la voz de autoridad B2B y genera el Ad de LinkedIn."
    },
    {
      id: '3',
      sender: 'ai',
      text: "Renderizando... He sobrepuesto la pista de voz sintética sobre el asset. El Ad patrocinado está listo para despliegue. Revisa la telemetría y el Voiceover a tu derecha.",
      hasWidget: true
    }
  ]);

  useEffect(() => {
    if (campaignData?.hook) {
      setMessages(prev => [
        {
          id: '0',
          sender: 'ai',
          text: `Detectando Hook de alto impacto: "${campaignData.hook}". Generando variaciones para LinkedIn Ads con un enfoque en el sector ${campaignData.detected_sector || 'B2B'}.`
        },
        ...prev
      ]);
    }
  }, [campaignData]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // GHOST IN THE MACHINE: isDemoMode auto-pilot
  useEffect(() => {
    if (!isDemo) return;

    const demoOrder = `Inyecta ${formatCurrency(metrics.budget || 150000)} en LinkedIn y Meta Ads. Sincroniza assets creativos. Objetivo: CPA ${metrics.cpa || '-42%'}.`;
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      setInputValue(demoOrder.slice(0, charIndex + 1));
      charIndex++;
      if (charIndex >= demoOrder.length) {
        clearInterval(typeInterval);
        setTimeout(() => {
          setInputValue('');
          const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: demoOrder };
          setMessages(prev => [...prev, newUserMsg]);
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              sender: 'ai',
              text: "Copy B2B optimizado. He generado 3 variantes de headline con CTAs de alta conversión. El Voiceover está configurado con tono de autoridad ejecutiva. Campaña activa y facturando.",
              hasWidget: true
            }]);
          }, 1200);
        }, 400);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [isDemo]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isTyping]);

  const togglePlay = (messageId: string) => {
    if (playingMessageId === messageId) {
      setPlayingMessageId(null);
    } else {
      setPlayingMessageId(messageId);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Copy B2B optimizado. He generado 3 variantes de headline con CTAs de alta conversión. El Voiceover está configurado con tono de autoridad ejecutiva. ¿Genero las variantes para A/B testing?",
        hasWidget: true
      }]);
    }, 1800);
  };

  const hasContent = messages.some(m => m.hasWidget) || !!adUrl;

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full overflow-y-auto md:overflow-hidden pb-32 md:pb-0">
      <div className="w-full md:flex-1 bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden relative order-2 md:order-1 min-h-[60vh] md:min-h-0">
        <div className="h-20 border-b border-white/5 bg-white/5 flex items-center px-6 justify-between backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={AGENT_INFO.avatar} alt="Agent" className="w-10 h-10 rounded-full object-cover border border-emerald-500/50" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            </div>
            <div>
              <h2 className="text-white font-bold flex items-center gap-2">
                {AGENT_INFO.name} <CheckCircle2 size={14} className="text-emerald-500" />
              </h2>
              <p className="text-xs text-zinc-400 font-mono">{AGENT_INFO.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {campaign && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <Brain size={12} className="text-emerald-500" />
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{new URL(campaign.target_url).hostname}</span>
              </div>
            )}
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <Sparkles size={12} className="text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">Active Session</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' ? (
                  <AIVoiceBubble
                    message={msg}
                    isPlaying={playingMessageId === msg.id}
                    onTogglePlay={togglePlay}
                  />
                ) : (
                  <div className={`max-w-[80%] rounded-[1.5rem] px-5 py-3 text-sm ${msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-sm'
                    : 'bg-white/10 text-zinc-200 rounded-bl-sm border border-white/5'
                    }`}>
                    {msg.text}
                  </div>
                )}
              </motion.div>
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-white/5 rounded-full px-5 py-4 flex items-center gap-1.5 border border-white/5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-transparent border-t border-white/5">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Dicta instrucciones a Kaelen..."
              className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:bg-white/10 transition-all rounded-full py-4 pl-6 pr-14 text-white text-sm outline-none placeholder:text-zinc-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-2 p-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 text-black rounded-full transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* ─── RIGHT: iPhone Mockup ─── */}
      <div className="w-full md:w-80 xl:w-96 flex flex-col justify-center py-4 md:py-8 pr-0 md:pr-4 order-1 md:order-2">
        <div className="text-center mb-6">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Live Spatial Preview</span>
        </div>

        <div className="relative w-full aspect-[9/19] bg-zinc-950 border-[12px] border-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col group">
          {/* Dynamic Island */}
          <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
            <div className="w-24 h-full bg-zinc-900 rounded-b-xl" />
          </div>

          {hasContent ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-zinc-950 flex flex-col">
              {/* Mobile Status Bar */}
              <div className="pt-8 px-4 pb-2 bg-zinc-950 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-medium">9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-2 border border-zinc-600 rounded-sm relative">
                    <div className="absolute inset-0.5 bg-zinc-700 rounded-[1px]" />
                  </div>
                </div>
              </div>

              {/* LinkedIn Mobile Header */}
              <div className="px-3 py-2 flex items-center gap-2 border-b border-zinc-800">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-white font-bold text-[10px]">EA</span>
                </div>
                <div className="flex-1">
                  <p className="text-zinc-100 text-xs font-semibold">EtherAgent Studio</p>
                  <p className="text-zinc-400 text-[10px]">12,450 followers • Promoted</p>
                </div>
                <MoreHorizontal size={16} className="text-zinc-400" />
              </div>

              {/* Ad Copy */}
              <div className="px-3 py-2">
                <p className="text-zinc-200 text-xs leading-relaxed line-clamp-4">
                  🚀 <span className="font-semibold">{campaignData?.hook || 'The Death of Traditional Video Production'}</span><br />
                  {campaignData?.narrative_body || 'Stop spending $50K on video shoots. EtherAgent OS compiles AI campaigns in minutes.'}
                  {' '}<span className="text-emerald-600 font-medium">{campaignData?.call_to_action || 'Book your demo today.'}</span>
                </p>
              </div>

              {/* Ad Image with Voice Player */}
              <div className="relative flex-1 min-h-0">
                {assetLoading ? (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                  </div>
                ) : adUrl ? (
                  adUrl.includes('.mp4') ? (
                    <video src={adUrl} autoPlay loop muted className="w-full h-full object-cover" />
                  ) : (
                    <img src={adUrl} alt="Ad Retargeting" className="w-full h-full object-cover opacity-90" />
                  )
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop"
                    className="w-full h-full object-cover opacity-90"
                    alt="Server Infrastructure"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Voice Player Overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-black/70 backdrop-blur-md rounded-lg p-2 border border-white/10">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsAdPlaying(!isAdPlaying)}
                        className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors flex-shrink-0"
                      >
                        {isAdPlaying ? (
                          <Pause size={14} className="text-white" />
                        ) : (
                          <Play size={14} className="text-white ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1 flex items-center gap-0.5 h-6">
                        {[...Array(14)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-emerald-400 rounded-full"
                            animate={{
                              height: isAdPlaying ? [4, Math.random() * 18 + 4, 4] : 4,
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: isAdPlaying ? Infinity : 0,
                              delay: i * 0.05,
                              ease: "easeInOut"
                            }}
                            style={{ opacity: isAdPlaying ? 0.9 : 0.4 }}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[9px] text-white/60 mt-1 font-mono">Synthetic Voiceover • B2B Authority</p>
                  </div>
                </div>
              </div>

              {/* Engagement Bar */}
              <div className="px-3 py-2 bg-zinc-950 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <TrendingUp size={14} className="text-zinc-500" />
                      <span className="text-zinc-400 text-[10px] font-medium">1,247</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MousePointer size={14} className="text-zinc-500" />
                      <span className="text-zinc-400 text-[10px] font-medium">89</span>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                    {campaignData?.call_to_action ? 'Learn More' : 'Book Demo'}
                  </button>
                </div>
              </div>

              {/* Telemetry Footer inside phone */}
              <div className="px-3 py-2 bg-zinc-900 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    <BarChart3 size={10} className="text-emerald-400" />
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">Campaign Telemetry</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 text-[8px] font-mono rounded-full border border-emerald-500/30 animate-pulse">
                    LIVE SYNC
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-900 rounded-lg p-2 border border-zinc-800">
                    <div className="flex items-center gap-1 mb-0.5">
                      <DollarSign size={10} className="text-emerald-500" />
                      <span className="text-[8px] text-zinc-400 font-mono uppercase">Est. CPA</span>
                    </div>
                    {metricsLoading ? (
                      <div className="h-4 w-12 bg-zinc-800 rounded animate-pulse my-0.5" />
                    ) : (
                      <p className="text-sm font-bold text-zinc-100">{metrics.cpa}</p>
                    )}
                    <p className="text-[8px] text-emerald-500">vs. benchmark</p>
                  </div>
                  <div className="bg-zinc-900 rounded-lg p-2 border border-zinc-800">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Target size={10} className="text-emerald-400" />
                      <span className="text-[8px] text-zinc-400 font-mono uppercase">ROAS</span>
                    </div>
                    {metricsLoading ? (
                      <div className="h-4 w-12 bg-zinc-800 rounded animate-pulse my-0.5" />
                    ) : (
                      <p className="text-sm font-bold text-zinc-100">{metrics.roas}</p>
                    )}
                    <p className="text-[8px] text-emerald-500">vs. avg</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center px-6">
              <Smartphone size={32} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-xs font-mono">Esperando compilación para previsualización...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
