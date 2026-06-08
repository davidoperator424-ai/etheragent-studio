import React, { useState, useEffect } from 'react';
import { Settings, Save, X, Briefcase, Target, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

interface BrandSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BrandSettingsModal({ isOpen, onClose }: BrandSettingsModalProps) {
  const [brandName, setBrandName] = useState('');
  const [brandNiche, setBrandNiche] = useState('');
  const [brandTone, setBrandTone] = useState('directo');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadBrandInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('profiles')
        .select('brand_name, brand_niche, brand_tone')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setBrandName(data.brand_name || '');
        setBrandNiche(data.brand_niche || '');
        setBrandTone(data.brand_tone || 'directo');
      }
    };

    if (isOpen) {
      loadBrandInfo();
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          brand_name: brandName,
          brand_niche: brandNiche,
          brand_tone: brandTone
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error saving brand:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const tones = [
    { value: 'directo', label: 'Directo y Profesional' },
    { value: 'agresivo', label: 'Agresivo y Transgresor' },
    { value: 'divertido', label: 'Divertido y Casual' },
    { value: 'corporativo', label: 'Corporativo y Serio' },
    { value: 'inspirador', label: 'Inspirador y Motivacional' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0a0a0c] border border-emerald-500/30 rounded-3xl p-8 shadow-[0_0_80px_rgba(16,185,129,0.2)] overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
                <Settings size={20} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Configuración de Marca</h2>
                <p className="text-zinc-500 text-xs">Personaliza tu identidad</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Brand Name */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                <Briefcase size={14} /> Nombre de la Marca
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Ej: CyberSneakers"
                className="w-full bg-zinc-900/50 border border-zinc-700/50 focus:border-emerald-500 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Brand Niche */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                <Target size={14} /> Nicho / Industria
              </label>
              <input
                type="text"
                value={brandNiche}
                onChange={(e) => setBrandNiche(e.target.value)}
                placeholder="Ej: Calzado Urbano, Tech, NFT..."
                className="w-full bg-zinc-900/50 border border-zinc-700/50 focus:border-emerald-500 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Brand Tone */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                <MessageSquare size={14} /> Tono de Comunicación
              </label>
              <select
                value={brandTone}
                onChange={(e) => setBrandTone(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-700/50 focus:border-emerald-500 rounded-xl px-4 py-3 text-white focus:outline-none transition-colors"
              >
                {tones.map((tone) => (
                  <option key={tone.value} value={tone.value} className="bg-zinc-900">
                    {tone.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${
                saved 
                  ? 'bg-emerald-500 text-black' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black'
              }`}
            >
              {isSaving ? (
                <>Guardando...</>
              ) : saved ? (
                <>✓ Configuración Guardada</>
              ) : (
                <><Save size={16} /> Guardar Configuración</>
              )}
            </button>
          </div>

          <p className="text-zinc-600 text-[10px] text-center mt-4">
            Esta información se injectará en cada respuesta de IA para personalizar el contenido
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
