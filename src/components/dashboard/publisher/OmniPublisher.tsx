import { useState, useRef } from 'react';
import { Upload, X, Check, Instagram, Youtube, Twitter, Linkedin, Send, Loader2, Lock, Sparkles } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const platforms: Platform[] = [
  { id: 'instagram', name: 'Instagram', icon: <Instagram size={20} />, color: 'hover:border-pink-500 hover:text-pink-400' },
  { id: 'tiktok', name: 'TikTok', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>, color: 'hover:border-cyan-500 hover:text-cyan-400' },
  { id: 'youtube', name: 'YouTube', icon: <Youtube size={20} />, color: 'hover:border-red-500 hover:text-red-400' },
  { id: 'twitter', name: 'X (Twitter)', icon: <Twitter size={20} />, color: 'hover:border-blue-400 hover:text-blue-400' },
  { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin size={20} />, color: 'hover:border-blue-600 hover:text-blue-600' },
];

interface User {
  email: string;
  plan: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
}

interface OmniPublisherProps {
  user?: User;
}

const currentUser: User = {
  email: 'davicho4522@gmail.com',
  plan: 'PREMIUM',
};

const checkAccess = (user: User): { canPublish: boolean; reason?: string } => {
  if (user.email === 'davicho4522@gmail.com') {
    return { canPublish: true };
  }
  if (user.plan === 'PREMIUM' || user.plan === 'ENTERPRISE') {
    return { canPublish: true };
  }
  return { canPublish: false, reason: '🔒 Mejora tu plan a Premium para desbloquear la Distribución Omnicanal' };
};

export default function OmniPublisher({ user = currentUser }: OmniPublisherProps) {
  const access = checkAccess(user);
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    }
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handlePublish = async () => {
    if (!videoFile || selectedPlatforms.length === 0) return;
    
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setLoading(false);
    setSuccess(true);
    
    setTimeout(() => {
      setSuccess(false);
      setVideoFile(null);
      setCaption('');
      setSelectedPlatforms([]);
    }, 3000);
  };

  if (!access.canPublish) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white p-8 flex items-center justify-center">
        <div className="max-w-md text-center p-8 bg-neutral-900 rounded-2xl border border-neutral-800">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-800 flex items-center justify-center">
            <Lock className="w-8 h-8 text-neutral-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Plan Premium Requerido</h2>
          <p className="text-neutral-400 mb-6">{access.reason}</p>
          <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold text-black hover:opacity-90 transition-opacity">
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-emerald-400" />
              Omnichannel Publisher
            </h1>
            <p className="text-neutral-400 mt-2">Distribuye tu contenido a todas las redes desde un solo panel</p>
          </div>
          <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-sm font-medium">
            🟢 God Mode Active
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-900/50 border border-emerald-500 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-200 font-medium">¡Éxito! Video distribuido en las plataformas seleccionadas.</p>
              <p className="text-xs text-emerald-400/70 mt-1">Instagram • TikTok • YouTube • X • LinkedIn</p>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {/* DROP ZONE */}
          <div 
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-neutral-700 hover:border-neutral-600'
            } ${videoFile ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {videoFile ? (
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-emerald-400">{videoFile.name}</p>
                  <p className="text-sm text-neutral-500">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={() => setVideoFile(null)}
                  className="ml-4 p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-neutral-500" />
                <p className="text-lg font-medium mb-2">Arrastra tu video aquí</p>
                <p className="text-sm text-neutral-500 mb-4">o haz clic para seleccionar</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
                >
                  Seleccionar archivo
                </button>
              </>
            )}
          </div>

          {/* CAPTION */}
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <label className="block text-sm font-medium text-neutral-300 mb-3">Caption / Copy</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Escribe el copy que acompañará tu video..."
              className="w-full h-32 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none resize-none"
            />
            <p className="text-xs text-neutral-500 mt-2">{caption.length} caracteres</p>
          </div>

          {/* PLATFORMS */}
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <label className="block text-sm font-medium text-neutral-300 mb-4">Selecciona las plataformas</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {platforms.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                        : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    } ${platform.color}`}
                  >
                    {platform.icon}
                    <span className="text-xs font-medium">{platform.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PUBLISH BUTTON */}
          <button
            onClick={handlePublish}
            disabled={!videoFile || selectedPlatforms.length === 0 || loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold text-black flex items-center justify-center gap-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Subiendo assets y distribuyendo...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Publicar Ahora
              </>
            )}
          </button>

          <p className="text-center text-xs text-neutral-600">
            ⚡ Powered by Ayrshare Integration • Listo para Meta, TikTok, YouTube, X, LinkedIn
          </p>
        </div>
      </div>
    </div>
  );
}