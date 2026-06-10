import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, BarChart3, Globe, Loader2, Database, ScanLine, BrainCircuit } from 'lucide-react';
import { useCampaignStore } from '@/store/useCampaignStore';
import { generateWorkspaceCampaign } from '@/lib/geminiService';

interface NexusDashboardProps {
  isDemoMode?: boolean;
}

export default function NexusDashboard({ isDemoMode = false }: NexusDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [url, setUrl] = useState('https://etheragent.studio');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [isGeneratingWorkspace, setIsGeneratingWorkspace] = useState(false);

  const setWorkspace = useCampaignStore((state) => state.setWorkspace);
  const ceoCommand = useCampaignStore((state) => state.ceoCommand);

  useEffect(() => {
    // Check if we came from Nexus Brain with the intention to create a workspace
    const state = location.state as { mode?: string; query?: string; autoStart?: boolean } | null;

    if (state?.mode === 'create_workspace' && state?.query) {
      setUrl(state.query);
      generateBrandWorkspace(state.query);
      return;
    }

    if (isDemoMode || state?.autoStart) {
      const startDelay = setTimeout(() => {
        handleScan();
      }, 500);
      return () => clearTimeout(startDelay);
    }
  }, [location.state, isDemoMode]);

  const generateBrandWorkspace = async (query: string) => {
    setIsGeneratingWorkspace(true);

    try {
      // Llamamos a nuestro Cerebro Gemini Service
      const workspaceData = await generateWorkspaceCampaign(query);

      if (workspaceData) {
        setWorkspace(workspaceData);
        // Simulate artificial delay for dramatic effect if it resolved too fast
        setTimeout(() => {
          setIsGeneratingWorkspace(false);
          navigate('/dashboard/social'); // Inyectar directamente en el Lab
        }, 3000);
      } else {
        throw new Error("Fallo al generar workspace");
      }
    } catch (error) {
      console.error("Error generating workspace:", error);
      setIsGeneratingWorkspace(false);
    }
  };

  const handleScan = () => {
    if (!url.trim()) return;
    setIsScanning(true);
    setScanComplete(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);

      setTimeout(() => {
        navigate('/dashboard/replay', { state: { autoStart: true } });
      }, 2000);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-black text-white px-4 py-12 md:p-12">

      {/* Contenedor Principal (iOS Style Card) */}
      <div className="bg-[#0a0a0c] border border-white/5 w-full max-w-4xl p-6 md:p-16 rounded-[2rem] shadow-2xl relative overflow-hidden">

        {/* Fondo sutil */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />

        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-emerald-500 text-[10px] md:text-xs font-mono tracking-widest uppercase">Nexus Network Active</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">NEXUS <span className="text-zinc-600">INTEL</span></h1>
        </div>

        {/* Barra de Búsqueda Interactiva */}
        <div className="bg-[#1c1c1e] border border-white/10 p-2 md:p-3 rounded-2xl flex flex-col md:flex-row items-center gap-4 mb-12 w-full max-w-2xl shadow-inner transition-all focus-within:border-emerald-500/50">
          <div className="flex w-full items-center gap-3 px-2">
            <Globe className="text-zinc-500 shrink-0" size={20} />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Ingresa la URL de la marca..."
              disabled={isScanning || isGeneratingWorkspace}
              className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleScan}
            disabled={isScanning || isGeneratingWorkspace || !url.trim()}
            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold font-mono text-xs px-8 py-3 md:py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isScanning || isGeneratingWorkspace ? (
              <><Loader2 size={16} className="animate-spin" /> EXTRALLENDO DATOS...</>
            ) : (
              <><ScanLine size={16} /> INICIAR ESCANEO</>
            )}
          </button>
        </div>

        {/* Área de Resultados Dinámica */}
        <div className="min-h-[120px]">
          {isGeneratingWorkspace ? (
            <div className="flex flex-col items-center justify-center text-emerald-500 space-y-4 animate-in fade-in">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                <BrainCircuit size={40} className="relative z-10 animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="font-mono text-sm tracking-widest uppercase text-white">Sintetizando ADN de {url}...</p>
                <p className="font-mono text-[10px] text-zinc-500">Gemini Engine procesando directrices de campaña.</p>
              </div>
            </div>
          ) : isScanning ? (
            // Pantalla de Carga Clásica
            <div className="flex flex-col items-center justify-center text-zinc-500 space-y-4 animate-pulse">
              <Database size={32} className="text-emerald-500/50" />
              <p className="font-mono text-xs tracking-widest uppercase">Analizando topología y arquetipos de {url}...</p>
            </div>
          ) : scanComplete ? (
            // Resultados Exitosos
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-[#1c1c1e] border border-emerald-500/20 p-6 md:p-8 rounded-2xl flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="relative z-10">
                  <p className="text-emerald-500 text-[10px] md:text-xs font-mono tracking-widest uppercase mb-2">Brand Safety Rating</p>
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">98<span className="text-2xl text-zinc-500">%</span></h2>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-emerald-500/10 flex items-center justify-center relative z-10 border border-emerald-500/20">
                  <ShieldCheck className="text-emerald-500" size={24} />
                </div>
              </div>

              <div className="bg-[#1c1c1e] border border-blue-500/20 p-6 md:p-8 rounded-2xl flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="relative z-10">
                  <p className="text-blue-500 text-[10px] md:text-xs font-mono tracking-widest uppercase mb-2">Market Reach Potential</p>
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Global</h2>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-500/10 flex items-center justify-center relative z-10 border border-blue-500/20">
                  <BarChart3 className="text-blue-500" size={24} />
                </div>
              </div>
            </div>
          ) : (
            // Estado Inicial Vacío
            <div className="flex items-center justify-center h-full text-zinc-700 font-mono text-xs uppercase tracking-widest">
              Esperando Comando Organizacional...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
