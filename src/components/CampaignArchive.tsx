import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaignHistory } from '@/hooks/useCampaignHistory';
import { useNexusHistory } from '@/hooks/useNexusHistory';
import { Database, Loader2, ExternalLink, Activity, CheckCircle2, Rocket, Brain, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CampaignArchive() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'deployments' | 'nexus'>('nexus');
    const { campaigns: deployments, isLoading: deploymentsLoading } = useCampaignHistory();
    const { campaigns: nexusCampaigns, isLoading: nexusLoading } = useNexusHistory();

    const isLoading = deploymentsLoading || nexusLoading;

    if (isLoading) {
        return (
            <div className="w-full p-12 flex flex-col items-center justify-center bg-zinc-950/50 rounded-3xl border border-white/5">
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin relative z-10" />
                </div>
                <p className="text-zinc-500 font-mono text-[10px] tracking-[0.3em] uppercase mt-6 animate-pulse">
                    Desencriptando Archivo Neural...
                </p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Tab Switcher */}
            <div className="flex p-1 bg-zinc-900/60 border border-white/5 rounded-2xl w-fit self-center">
                <button
                    onClick={() => setActiveTab('nexus')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'nexus' 
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    <Brain size={14} /> ESTRATEGIAS NEXUS
                </button>
                <button
                    onClick={() => setActiveTab('deployments')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'deployments' 
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    <Rocket size={14} /> DESPLIEGUES ACTIVOS
                </button>
            </div>

            <div className="w-full bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 bg-black/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Database className="text-emerald-500 w-5 h-5" />
                        <h3 className="text-white font-bold tracking-widest uppercase text-sm">
                            {activeTab === 'nexus' ? 'Archivo de Inteligencia Creativa' : 'Registro de Despliegues'}
                        </h3>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-3 py-1 rounded-full border border-emerald-500/20">
                        {activeTab === 'nexus' ? nexusCampaigns.length : deployments.length} REGISTROS
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === 'nexus' ? (
                            <motion.table 
                                key="nexus-table"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full text-left border-collapse"
                            >
                                <thead>
                                    <tr className="bg-zinc-950/80 border-b border-white/5 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                        <th className="p-5 font-medium">Estrategia / Target</th>
                                        <th className="p-5 font-medium">Sector Detectado</th>
                                        <th className="p-5 font-medium">Neural Score</th>
                                        <th className="p-5 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {nexusCampaigns.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center">
                                                <Brain className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                                                <p className="text-zinc-500 font-mono text-xs">Sin estrategias generadas. Inicia en Nexus Brain.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        nexusCampaigns.map((camp) => (
                                            <tr key={camp.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="p-5">
                                                    <p className="text-white font-bold text-sm mb-1">{new URL(camp.target_url).hostname}</p>
                                                    <p className="text-zinc-600 font-mono text-[9px] truncate max-w-[200px]">{camp.id}</p>
                                                </td>
                                                <td className="p-5">
                                                    <span className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                                                        {camp.detected_sector || 'General'}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${camp.strategy_score}%` }} />
                                                        </div>
                                                        <span className="text-zinc-400 font-mono text-xs">{camp.strategy_score}/100</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-right">
                                                    <button 
                                                        onClick={() => navigate(`/dashboard/social?campaign=${camp.id}`)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-emerald-500 text-zinc-400 hover:text-black border border-white/10 hover:border-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 group/btn"
                                                    >
                                                        Abrir Lab <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </motion.table>
                        ) : (
                            <motion.table 
                                key="deploy-table"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full text-left border-collapse"
                            >
                                <thead>
                                    <tr className="bg-zinc-950/80 border-b border-white/5 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                        <th className="p-5 font-medium">Identificador de Campaña</th>
                                        <th className="p-5 font-medium">Target URL</th>
                                        <th className="p-5 font-medium">Estado</th>
                                        <th className="p-5 font-medium">Capital / ROAS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {deployments.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center">
                                                <Rocket className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                                                <p className="text-zinc-500 font-mono text-xs">Sin despliegues activos registrados.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        deployments.map((camp) => (
                                            <tr key={camp.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="p-5">
                                                    <p className="text-white font-bold text-sm mb-1">{camp.title}</p>
                                                    <p className="text-zinc-600 font-mono text-[9px] truncate max-w-[150px]">{camp.id}</p>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-zinc-400 text-xs truncate max-w-[150px]">{camp.target_url}</span>
                                                        <ExternalLink size={12} className="text-zinc-600 group-hover:text-emerald-500 transition-colors cursor-pointer" />
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${camp.status === 'deployed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                            camp.status === 'compiling' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                                'bg-zinc-800 text-zinc-400 border-zinc-700'
                                                        }`}>
                                                        {camp.status === 'deployed' ? <CheckCircle2 size={10} /> : <Activity size={10} />}
                                                        {camp.status.toUpperCase()}
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <p className="text-white text-sm font-bold">
                                                        ${camp.budget_allocated?.toLocaleString() || 0}
                                                    </p>
                                                    <p className="text-emerald-500 font-mono text-[10px]">
                                                        ROAS: {camp.metrics?.roas || 'N/A'}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </motion.table>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
