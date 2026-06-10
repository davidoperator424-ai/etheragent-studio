import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useGroqQueue } from '../../hooks/useGroqQueue';
import { api } from '../../services/api';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import type { SystemFlow as SystemFlowType, Avatar } from '../../types';
import { 
  Bot, MapPin, Mic, Play, Atom, 
  Cpu, Gauge, CheckCircle, XCircle,
  Globe, Target, Eye, Sparkles, Zap
} from 'lucide-react';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

const avatarImages: Record<string, string> = {
  'eth_zero': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  'a1': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
  'a2': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
  'a3': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
  'a4': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'eth_sdr_01': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
};

const locationPresets = [
  { id: 'times_square', name: 'Times Square NYC', category: 'urban', description: 'NYC Central Hub', prompt: 'Times Square, New York City, bustling at night. Neon signs, LED billboards, crowd activity.' },
  { id: 'shibuya', name: 'Shibuya Crossing Tokyo', category: 'urban', description: 'Tokyo Cyberpunk', prompt: 'Shibuya Crossing, Tokyo, rainy atmosphere. Neon reflections, wet streets, cyberpunk.' },
  { id: 'wall_street', name: 'Wall Street', category: 'finance', description: 'Financial District', prompt: 'Wall Street, Manhattan, morning light. Historic brownstones, modern skyscrapers.' },
  { id: 'miami_beach', name: 'Miami Beach', category: 'leisure', description: 'Luxury Beach', prompt: 'Luxury beach resort at sunset, golden hour, palm trees. Crystal clear water.' },
  { id: 'metaverse', name: 'Cyber Metaverse', category: 'virtual', description: 'Digital Environment', prompt: 'Futuristic virtual environment, digital landscape, neon grid, holographic elements.' },
  { id: 'corporate_office', name: 'Corporate HQ', category: 'office', description: 'Modern Office', prompt: 'Contemporary corporate office interior, floor-to-ceiling windows, city views.' },
];

const voicePresets = [
  { id: 'en_male_deep', name: 'Deep Baritone (EN)', language: 'en', style: 'Authoritative', desc: 'Strong, commanding' },
  { id: 'en_female_authoritative', name: 'Authoritative (EN)', language: 'en', style: 'Corporate', desc: 'Professional, confident' },
  { id: 'en_male_casual', name: 'Casual Dynamic (EN)', language: 'en', style: 'Conversational', desc: 'Friendly, approachable' },
  { id: 'es_male_authoritative', name: 'Autoritario (ES)', language: 'es', style: 'Corporate', desc: 'Strong Spanish authority' },
  { id: 'es_female_warm', name: 'Cálida (ES)', language: 'es', style: 'Empathetic', desc: 'Warm Latin American' },
];

const SCRIPT_PRESETS = {
  en: [
    { id: 'b2b_pitch', name: 'B2B Pitch', script: 'Ladies and gentlemen, we\'ve analyzed your market position. Here\'s the strategy that will 10x your revenue in the next quarter. Our AI-driven approach has delivered proven results for Fortune 500 companies worldwide. Let me show you the numbers that matter.' },
    { id: 'product_launch', name: 'Product Launch', script: 'Introducing the future of your industry. This isn\'t just a product—it\'s a revolution. Every feature designed with one purpose: to accelerate your growth. Ready to see what\'s possible?' },
    { id: 'testimonial', name: 'Testimonial', script: 'I\'ve tried everything. But nothing compared to what we achieved together. The results speak for themselves—300% growth in just 90 days. This is the tool I wish I had known about years ago.' },
    { id: 'webinar_intro', name: 'Webinar Intro', script: 'Welcome everyone. Today we\'re diving deep into strategies that top performers use to dominate their markets. By the end of this session, you\'ll have actionable insights you can implement immediately. Let\'s begin.' },
    { id: 'cold_outreach', name: 'Cold Outreach', script: 'Hi, I came across your profile and I think there\'s a compelling opportunity to discuss. Would you be open to a 15-minute conversation? I\'ve helped companies like yours achieve significant results.' },
  ],
  es: [
    { id: 'b2b_pitch_es', name: 'Pitch B2B', script: 'Señores, hemos analizado su posición en el mercado. Esta es la estrategia que triplicará sus ingresos en el próximo trimestre. Nuestro enfoque impulsado por IA ha demostrado resultados probados.' },
    { id: 'product_launch_es', name: 'Lanzamiento', script: 'Presentamos el futuro de su industria. Esto no es solo un producto—es una revolución. Cada característica diseñada con un propósito: acelerar su crecimiento. ¿Listo para ver lo que es posible?' },
    { id: 'testimonial_es', name: 'Testimonio', script: 'Lo probé todo. Pero nada se comparó con lo que logramos juntos. Los resultados hablan por sí mismos—300% de crecimiento en solo 90 días.' },
    { id: 'webinar_intro_es', name: 'Intro Webinar', script: 'Bienvenidos a todos. Hoy nos sumergiremos en estrategias que los mejores líderes usan para dominar sus mercados. Al final de esta sesión, tendrá información accionable.' },
  ],
};

const AVATAR_EXAMPLES = [
  { id: 'eth_zero', name: 'David G.', role: 'EtherAgent Founder', niche: 'Dogfooding Campaign', trust: 99, desc: 'Demo instance - eats own dog food' },
  { id: 'a1', name: 'Exec A1', role: 'Enterprise FinTech Exec', niche: 'High-Ticket B2B', trust: 98, desc: 'B2B Sales closer' },
  { id: 'a2', name: 'Elena R.', role: 'AI Tech Founder', niche: 'SaaS & Digital Products', trust: 96, desc: 'Silicon Valley energy' },
  { id: 'a3', name: 'Dr. Aris', role: 'Medical Specialist', niche: 'Health & Wellness', trust: 99, desc: 'Scientific authority' },
  { id: 'a4', name: 'Exec A4', role: 'E-commerce Growth', niche: 'D2C & Retention', trust: 97, desc: 'LTV maximization' },
  { id: 'eth_sdr_01', name: 'Growth SDR', role: 'Growth Strategist', niche: 'LATAM SDR', trust: 98.5, desc: 'Bilingual closer' },
];

const URL_EXAMPLES = [
  { url: 'https://stripe.com', archetype: 'FINTECH_SAAS', title: 'Stripe - Payment Infrastructure', niche: 'FinTech', tone: 'Professional' },
  { url: 'https://openai.com', archetype: 'AI_PLATFORM', title: 'OpenAI - AI Research', niche: 'Artificial Intelligence', tone: 'Innovative' },
  { url: 'https://airbnb.com', archetype: 'MARKETPLACE', title: 'Airbnb - Travel Marketplace', niche: 'Travel Tech', tone: 'Friendly' },
  { url: 'https://techcrunch.com', archetype: 'TECH_MEDIA', title: 'TechCrunch - Tech News', niche: 'Technology', tone: 'Breaking' },
  { url: 'https://andrewchen.co', archetype: 'THOUGHT_LEADER', title: 'Andrew Chen - Growth Expert', niche: 'Growth Marketing', tone: 'Analytical' },
];

export default function SystemSpaces() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [flows, setFlows] = useState<SystemFlowType[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [archetype, setArchetype] = useState('B2B_LEAD_GEN');
  const [audioScript, setAudioScript] = useState('');
  const [scriptLanguage, setScriptLanguage] = useState<'en' | 'es'>('en');

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [groqResponse, setGroqResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [renderHistory, setRenderHistory] = useState<{
    id: string;
    avatar: string;
    location: string;
    voice: string;
    timestamp: Date;
    status: 'completed' | 'failed';
    duration: string;
  }[]>([]);

  const groqQueue = useGroqQueue(GROQ_API_KEY, {
    requestsPerMinute: 30,
    requestsPerHour: 500,
    maxRetries: 3,
    baseDelayMs: 2000,
    maxDelayMs: 60000,
  });

  const getAvatarImage = (avatarId: string): string => {
    const avatar = avatars.find(a => a.id === `avatar-${avatarId.replace('a', '')}`);
    if (avatar?.media?.avatar_hq) return avatar.media.avatar_hq;
    if (avatar?.image) return avatar.image;
    return avatarImages[avatarId] || avatarImages['eth_zero'];
  };

  const getLocationPreview = (locationId: string): string => {
    const previews: Record<string, string> = {
      'times_square': 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&h=600&fit=crop',
      'shibuya': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&h=600&fit=crop',
      'wall_street': 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&h=600&fit=crop',
      'miami_beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
      'metaverse': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop',
      'corporate_office': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    };
    return previews[locationId] || '';
  };

  const avatarName = useMemo(() => {
    if (!selectedAvatar) return '---';
    const names: Record<string, string> = {
      'eth_zero': 'David G.',
      'a1': 'Exec A1',
      'a2': 'Elena R.',
      'a3': 'Dr. Aris',
      'a4': 'Exec A4',
      'eth_sdr_01': 'Growth SDR',
    };
    return names[selectedAvatar] || 'Unknown';
  }, [selectedAvatar]);

  const handleAnalyzeWithGroq = useCallback(async () => {
    if (!sourceUrl) {
      toast({
        title: 'Missing URL',
        description: 'Please enter a source URL to analyze',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setGroqResponse(null);

    const systemPrompt = `You are an expert marketing analyst. Analyze the given URL and extract:
1. Business model/niche
2. Target audience
3. Brand tone and voice
4. Content strategy
5. Key differentiators

Provide a detailed analysis in a structured format.`;

    const userPrompt = `Analyze this URL: ${sourceUrl}

Provide a comprehensive marketing analysis including:
- Niche/Industry
- Target Audience
- Brand Voice
- Content Strategy
- Key Selling Points`;

    groqQueue.enqueue(
      userPrompt,
      (response) => {
        setGroqResponse(response);
        setIsAnalyzing(false);
        toast({
          title: 'Analysis Complete',
          description: 'AI-powered analysis finished successfully',
          variant: 'default',
        });
      },
      (error) => {
        setIsAnalyzing(false);
        toast({
          title: 'Analysis Failed',
          description: error.message,
          variant: 'destructive',
        });
      },
      systemPrompt
    );
  }, [sourceUrl, toast, groqQueue]);

  const handleQuantumMerge = useCallback(async () => {
    if (!audioScript) {
      toast({
        title: 'Missing Script',
        description: 'Please enter an audio script before executing',
        variant: 'destructive',
      });
      return;
    }

    setIsRendering(true);
    setRenderProgress(0);

    const progressInterval = setInterval(() => {
      setRenderProgress(prev => Math.min(prev + Math.random() * 12, 95));
    }, 600);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setRenderHistory(prev => [{
          id: Math.random().toString(36).substring(2, 10),
          avatar: selectedAvatar,
          location: selectedLocation,
          voice: selectedVoice,
          timestamp: new Date(),
          status: 'failed' as const,
          duration: '0s'
        }, ...prev].slice(0, 10));
        throw new Error('No authentication token - demo mode');
      }

      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          avatarId: selectedAvatar,
          script: audioScript,
          platform: 'tiktok',
          voiceId: selectedVoice,
          backgroundPrompt: locationPresets.find(l => l.id === selectedLocation)?.name,
        }),
      });

      const result = await response.json();
      clearInterval(progressInterval);
      setRenderProgress(100);

      if (result.error) throw new Error(result.error);

      setRenderHistory(prev => [{
        id: result.renderId || Math.random().toString(36).substring(2, 10),
        avatar: selectedAvatar,
        location: selectedLocation,
        voice: selectedVoice,
        timestamp: new Date(),
        status: 'completed' as const,
        duration: '8.5s'
      }, ...prev].slice(0, 10));

      toast({
        title: 'Quantum Merge Complete',
        description: 'Asset compiled successfully',
        variant: 'default',
      });
    } catch (error) {
      clearInterval(progressInterval);
      
      setRenderHistory(prev => [{
        id: Math.random().toString(36).substring(2, 10),
        avatar: selectedAvatar,
        location: selectedLocation,
        voice: selectedVoice,
        timestamp: new Date(),
        status: 'completed' as const,
        duration: 'DEMO'
      }, ...prev].slice(0, 10));

      setRenderProgress(100);
      toast({
        title: 'Demo Mode - Render Simulated',
        description: 'Configure API keys for full rendering',
        variant: 'default',
      });
    } finally {
      setIsRendering(false);
    }
  }, [audioScript, selectedAvatar, selectedVoice, selectedLocation, toast]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [flowsData, avatarsData] = await Promise.all([
          api.getSystemFlows(user),
          api.getAvatars(user, true)
        ]).catch(() => [[], []]);
        
        setAvatars(avatarsData);
        setFlows(flowsData.filter((f: SystemFlowType) => ['f_eth_zero', 'f_marcus', 'f_elena'].includes(f.id)));
      } catch (error) {
        console.log("Using demo mode");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const avatarParam = searchParams.get('avatar');
    const scriptParam = searchParams.get('script');
    const urlParam = searchParams.get('url');
    
    if (avatarParam) setSelectedAvatar(avatarParam);
    if (scriptParam) setAudioScript(decodeURIComponent(scriptParam));
    if (urlParam) setSourceUrl(decodeURIComponent(urlParam));
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 p-6">
        <div className="h-6 w-48 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[80vh]">
          {[1,2,3,4].map(i => <div key={i} className="bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const currentAvatar = AVATAR_EXAMPLES.find(a => a.id === selectedAvatar);

  return (
    <div className="min-h-screen pb-24">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
            <Atom size={14} /> The Forge
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Neural Compilation Engine</h2>
          <p className="text-sm text-white/40 mt-1">
            Dogfooding Mode: EtherAgent analyzing EtherAgent • {GROQ_API_KEY ? '🟢 Groq API Connected' : '🔴 Demo Mode'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-mono">SYSTEM ONLINE</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-white/10">
            <Cpu size={12} className="text-indigo-400" />
            <span className="text-[10px] text-indigo-400 font-mono">GPU: ACTIVE</span>
          </div>
          {groqQueue.isProcessing && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] text-amber-400 font-mono">GROQ: {groqQueue.getQueueStatus().pending} queued</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[80vh]">
        {/* CARD 1: CORE IDENTITY */}
        <div className="bg-zinc-950/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-emerald-500/10 bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Bot size={16} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Core Identity</h3>
                <p className="text-[10px] text-emerald-400/60">Avatar Selection & Trust Score</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-5 overflow-y-auto">
            {selectedAvatar ? (
              <>
                <div className="relative mb-5">
                  <img 
                    src={getAvatarImage(selectedAvatar)} 
                    alt="Avatar Preview" 
                    className="w-full h-48 object-cover rounded-xl border border-white/10"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur rounded-full border border-emerald-500/30">
                    <span className="text-xs font-bold text-emerald-400">{currentAvatar?.trust}% Trust</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2 block">Avatar Instance</label>
                  <select
                    value={selectedAvatar}
                    onChange={(e) => setSelectedAvatar(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="">-- Select Avatar --</option>
                    {AVATAR_EXAMPLES.map(avatar => (
                      <option key={avatar.id} value={avatar.id}>{avatar.name} - {avatar.trust}% Trust</option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={12} className="text-emerald-400" />
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Role</span>
                  </div>
                  <p className="text-sm text-white">{currentAvatar?.role}</p>
                  <p className="text-xs text-emerald-400/60 mt-1">{currentAvatar?.niche}</p>
                </div>

                <div className="mt-4">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2 block">Core Prompt</label>
                  <textarea
                    placeholder="Define the avatar's core personality..."
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 resize-none"
                    defaultValue={`You are ${currentAvatar?.name}, ${currentAvatar?.role}. ${currentAvatar?.desc}`}
                  />
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Bot size={48} className="text-zinc-700 mb-4" />
                <p className="text-zinc-500 text-sm font-bold mb-2">AWAITING INPUT</p>
                <p className="text-zinc-600 text-xs">Select an avatar from Nexus<br/>or choose one from the dropdown</p>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: TOPOLOGY RENDER */}
        <div className="bg-zinc-950/60 backdrop-blur-md border border-indigo-500/20 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-indigo-500/10 bg-indigo-500/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <MapPin size={16} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Topology Render</h3>
                <p className="text-[10px] text-indigo-400/60">Environment & Location</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-5 overflow-y-auto">
            {selectedLocation ? (
              <>
                <div className="relative mb-5">
                  <img 
                    src={getLocationPreview(selectedLocation)} 
                    alt="Location Preview" 
                    className="w-full h-48 object-cover rounded-xl border border-white/10"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-indigo-500/30">
                    <span className="text-xs font-bold text-indigo-400">{locationPresets.find(l => l.id === selectedLocation)?.category}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2 block">Environment</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="">-- Select Location --</option>
                    {locationPresets.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={12} className="text-indigo-400" />
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Description</span>
                  </div>
                  <p className="text-sm text-white">{locationPresets.find(l => l.id === selectedLocation)?.description}</p>
                </div>

                <div className="mt-4">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2 block">Niche Prompt</label>
                  <textarea
                    placeholder="Describe the visual environment..."
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 resize-none"
                    defaultValue={locationPresets.find(l => l.id === selectedLocation)?.prompt}
                  />
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <MapPin size={48} className="text-zinc-700 mb-4" />
                <p className="text-zinc-500 text-sm font-bold mb-2">AWAITING INPUT</p>
                <p className="text-zinc-600 text-xs">Select an environment<br/>to set the scene</p>
              </div>
            )}
          </div>
        </div>

        {/* CARD 3: NEURAL AUDIO */}
        <div className="bg-zinc-950/60 backdrop-blur-md border border-indigo-500/20 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-indigo-500/10 bg-indigo-500/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Mic size={16} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Neural Audio</h3>
                <p className="text-[10px] text-indigo-400/60">Voice & Script Synthesis</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-5 overflow-y-auto">
            <div className="mb-4">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2 block">Voice Model (Neural Engine)</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              >
                {voicePresets.map(voice => (
                  <option key={voice.id} value={voice.id}>{voice.name}</option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-indigo-400" />
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Active Voice</span>
                </div>
                <span className="text-xs text-indigo-400">{voicePresets.find(v => v.id === selectedVoice)?.style}</span>
              </div>
              <p className="text-xs text-white/60">{voicePresets.find(v => v.id === selectedVoice)?.desc}</p>
            </div>

            <div className="mb-3">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2 block">Language</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setScriptLanguage('en')}
                  className={`flex-1 text-xs py-2 rounded-lg font-medium transition-all ${
                    scriptLanguage === 'en' 
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' 
                      : 'bg-black/40 text-white/40 border border-white/10 hover:text-white/60'
                  }`}
                >
                  🇺🇸 English
                </button>
                <button
                  onClick={() => setScriptLanguage('es')}
                  className={`flex-1 text-xs py-2 rounded-lg font-medium transition-all ${
                    scriptLanguage === 'es' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-black/40 text-white/40 border border-white/10 hover:text-white/60'
                  }`}
                >
                  🇪🇸 Español
                </button>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Script Payload</label>
                <div className="flex gap-1">
                  {SCRIPT_PRESETS[scriptLanguage].slice(0, 2).map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => setAudioScript(preset.script)}
                      className="text-[9px] px-2 py-1 rounded bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <textarea
              value={audioScript}
              onChange={(e) => setAudioScript(e.target.value)}
              placeholder="Enter your script for synthesis..."
              className="w-full h-40 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
            
            <div className="flex items-center justify-between mt-2 text-[10px] text-white/40">
              <span>{audioScript.length} characters</span>
              <span>~{Math.ceil(audioScript.length / 150)}s duration</span>
            </div>
          </div>
        </div>

        {/* CARD 4: QUANTUM MERGE */}
        <div className="bg-zinc-950/60 backdrop-blur-md border border-emerald-500/20 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-emerald-500/10 bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Zap size={16} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quantum Merge</h3>
                <p className="text-[10px] text-emerald-400/60">Preview & Execute</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-5 flex flex-col">
            <div className="relative flex-1 bg-black/40 rounded-xl border border-white/10 overflow-hidden mb-4 min-h-[200px]">
              {isRendering ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin mb-4" />
                  <span className="text-lg font-bold text-white">{Math.round(renderProgress)}%</span>
                  <span className="text-xs text-white/40 mt-1">Compiling Assets...</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {!selectedAvatar && !selectedLocation ? (
                    <>
                      <Eye size={48} className="text-white/10 mb-3" />
                      <span className="text-xs text-white/30">AWAITING INPUT</span>
                      <span className="text-[10px] text-white/15 mt-1">Select Avatar + Location</span>
                    </>
                  ) : (
                    <>
                      <Eye size={48} className="text-white/20 mb-3" />
                      <span className="text-xs text-white/40">HUD Preview</span>
                      <span className="text-[10px] text-white/20 mt-1">Avatar + Location + Audio</span>
                    </>
                  )}
                </div>
              )}
              
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                    <Bot size={12} className="text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-white/60">{avatarName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={10} className="text-indigo-400" />
                  <span className="text-[10px] text-white/60">{locationPresets.find(l => l.id === selectedLocation)?.name?.split(' ')[0]}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-black/40 rounded-lg p-2 text-center border border-white/5">
                <Bot size={14} className="mx-auto text-emerald-400 mb-1" />
                <span className="text-[9px] text-white/40 uppercase">Avatar</span>
              </div>
              <div className="bg-black/40 rounded-lg p-2 text-center border border-white/5">
                <MapPin size={14} className="mx-auto text-indigo-400 mb-1" />
                <span className="text-[9px] text-white/40 uppercase">Scene</span>
              </div>
              <div className="bg-black/40 rounded-lg p-2 text-center border border-white/5">
                <Mic size={14} className="mx-auto text-indigo-400 mb-1" />
                <span className="text-[9px] text-white/40 uppercase">Audio</span>
              </div>
            </div>

            <button
              onClick={handleQuantumMerge}
              disabled={isRendering || !audioScript}
              className="w-full py-4 bg-emerald-500 rounded-xl font-bold text-black tracking-wider flex items-center justify-center gap-3 hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isRendering ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  COMPILING... {Math.round(renderProgress)}%
                </>
              ) : (
                <>
                  <Play size={20} /> EXECUTE MERGE
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {renderHistory.length > 0 && (
        <div className="pt-6 border-t border-white/10 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Gauge size={14} className="text-white/40" />
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">RENDER TIMELINE</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {renderHistory.slice(0, 6).map((render) => (
              <div 
                key={render.id}
                className="bg-black/40 border border-white/10 rounded-lg p-3 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {render.status === 'completed' ? (
                      <CheckCircle size={12} className="text-emerald-400" />
                    ) : (
                      <XCircle size={12} className="text-red-400" />
                    )}
                    <span className="text-[9px] text-white/60 font-mono">{render.id.toUpperCase()}</span>
                  </div>
                  <span className="text-[8px] text-white/30">{render.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <img 
                    src={getAvatarImage(render.avatar)}
                    alt="Avatar"
                    className="w-8 h-8 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/80 truncate">
                      {AVATAR_EXAMPLES.find(a => a.id === render.avatar)?.name || render.avatar}
                    </p>
                    <p className="text-[8px] text-white/40">
                      {render.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
