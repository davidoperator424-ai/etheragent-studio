import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, Activity, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            if (isLogin) {
                // INICIO DE SESIÓN
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                // Si es exitoso, enviamos al usuario al Nexus Brain
                navigate('/dashboard/nexus-brain');
            } else {
                // REGISTRO DE NUEVO NODO
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: 'CEO', // Asignamos un nombre base
                        }
                    }
                });
                if (error) throw error;

                if (data.session) {
                    navigate('/dashboard/nexus-brain');
                } else {
                    setErrorMsg('Revisa tu correo para verificar la cuenta. (Depende de tu config en Supabase)');
                }
            }
        } catch (error: any) {
            console.error('Error de autenticación:', error.message);
            setErrorMsg(error.message === 'Invalid login credentials' ? 'Credenciales biométricas denegadas.' : error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // CONTENEDOR RAÍZ: Full screen real para móvil y escritorio
        <div className="relative w-full h-[100dvh] bg-[#030303] flex items-center justify-center overflow-hidden selection:bg-emerald-500/30 px-4">

            {/* FONDO HOLOGRÁFICO B2B */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* LA TARJETA DE CRISTAL (Glassmorphism) */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md bg-zinc-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
                {/* HEADER: Branding de EtherAgent */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-16 h-16 bg-zinc-950 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                        <Globe className="text-emerald-500 relative z-10 w-8 h-8 animate-[spin_10s_linear_infinite]" />
                        <Activity className="text-emerald-400 absolute w-4 h-4 z-20" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                        EtherAgent <span className="text-emerald-500">OS</span>
                    </h1>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">
                        Central Command Neural Link
                    </p>
                </div>

                {/* ALERTA DE ERROR */}
                <AnimatePresence>
                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 overflow-hidden"
                        >
                            <ShieldCheck className="text-red-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-red-400 text-sm font-mono leading-relaxed">{errorMsg}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* FORMULARIO DE INYECCIÓN DE DATOS */}
                <form onSubmit={handleAuth} className="flex flex-col gap-5">

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Identidad de red (Email)"
                            className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-emerald-500/50 focus:bg-zinc-900 transition-all shadow-inner"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Llave criptográfica (Password)"
                            className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-emerald-500/50 focus:bg-zinc-900 transition-all shadow-inner"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !email || !password}
                        className={`mt-4 w-full py-4 rounded-xl font-bold tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] active:scale-[0.98] ${isLoading || !email || !password ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-emerald-500 text-black hover:bg-emerald-400'
                            }`}
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? 'INICIAR ENLACE' : 'CREAR INSTANCIA')}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>

                </form>

                {/* TOGGLE MODO (Login / Registro) */}
                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
                        className="text-zinc-500 hover:text-white font-mono text-xs transition-colors"
                    >
                        {isLogin ? '> ¿Nuevo en la red? Generar credenciales' : '> ¿Ya tienes acceso? Iniciar enlace neuronal'}
                    </button>
                </div>

            </motion.div>

        </div>
    );
}
