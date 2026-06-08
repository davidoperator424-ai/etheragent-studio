import React, { useState } from 'react';
import { CheckCircle2, Shield, Users, Cpu, ArrowRight, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from '@/lib/supabaseClient';

const initialOptions = {
    clientId: (import.meta.env.VITE_PAYPAL_CLIENT_ID || "test").trim(),
    currency: "USD",
    intent: "capture",
};

const PLANS = [
  {
    id: 'solo', name: 'SOLO OPERATOR', badge: 'ENTRY NODE', priceMonthly: 197, priceAnnual: 157,
    desc: 'Despliegue táctico para marcas individuales y creadores de alto volumen.',
    color: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500/30',
    agents: '2 Agentes Activos (Valeria & Kaelen)',
    features: [
      '1,500 Compute Tokens / mes',
      'Gestión de 1 Marca / Entidad',
      'Generación de Video Social (Reels/TikTok)',
      'Voces Neuronales Estándar',
      'Soporte Asíncrono'
    ]
  },
  {
    id: 'swarm', name: 'AGENCY SWARM', badge: 'MOST POPULAR', priceMonthly: 497, priceAnnual: 397,
    desc: 'El enjambre completo. Orquestación omnicanal para agencias y marcas en escala.',
    color: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500/50', glow: 'shadow-[0_0_40px_rgba(59,130,246,0.15)]',
    agents: 'Los 4 Agentes (Full Swarm Access)',
    features: [
      '5,000 Compute Tokens / mes',
      'Gestión de hasta 5 Marcas (Multi-tenant)',
      'Acceso a Spatial OOH & Commercial VSLs',
      'Clonación de Voces Premium (Azure)',
      'Telemetría en Tiempo Real',
      'Soporte Prioritario 24/7'
    ], popular: true
  },
  {
    id: 'nexus', name: 'ENTERPRISE NEXUS', badge: 'UNLIMITED', priceMonthly: 1297, priceAnnual: 997,
    desc: 'Infraestructura dedicada. Dominio absoluto del ecosistema digital.',
    color: 'text-purple-500', bg: 'bg-purple-500', border: 'border-purple-500/30',
    agents: 'Enjambre Ilimitado + Custom AI',
    features: [
      '20,000 Compute Tokens / mes',
      'Marcas y Espacios Ilimitados',
      'Entrenamiento con Data Propia (CRM/Shopify)',
      'Renderizado Prioritario (GPU Cluster)',
      'Acceso a API de EtherAgent',
      'Ingeniero de Éxito Dedicado'
    ]
  }
];

export default function SubscriptionPlans() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getCurrentPrice = (plan: typeof PLANS[0]) => {
    return isAnnual ? plan.priceAnnual : plan.priceMonthly;
  };

  const saveSubscription = async (orderId: string, planId: string, amount: number, payerName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('subscriptions').insert({
        user_id: user?.id || 'anonymous',
        plan_id: planId,
        order_id: orderId,
        amount: amount,
        currency: 'USD',
        status: 'active',
        billing_cycle: isAnnual ? 'annual' : 'monthly',
        payer_name: payerName,
        payment_method: 'paypal'
      });

      if (error) {
        console.error('Error guardando suscripción:', error);
      }
    } catch (err) {
      console.error('Error en saveSubscription:', err);
    }
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="min-h-screen w-full bg-[#050505] text-white p-4 md:p-8 flex flex-col items-center pb-32">
        
        <div className="max-w-4xl text-center mt-12 mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Cpu className="text-zinc-500" size={16} />
            <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Neural Infrastructure Allocation</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
            Escala tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500">Fuerza Laboral</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
            No estás comprando software, estás contratando una agencia de marketing impulsada por IA que trabaja 24/7 sin latencia.
          </p>
        </div>

        <div className="flex items-center gap-4 mb-16 bg-[#0a0a0c] p-2 rounded-2xl border border-white/5 shadow-2xl">
          <span className={`text-sm font-bold transition-colors ${!isAnnual ? 'text-white' : 'text-zinc-500'}`}>Mensual</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-16 h-8 bg-[#111] rounded-full relative flex items-center px-1 border border-white/10 transition-colors focus:outline-none"
          >
            <motion.div 
              className="w-6 h-6 bg-white rounded-full"
              animate={{ x: isAnnual ? 32 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm font-bold transition-colors flex items-center gap-2 ${isAnnual ? 'text-white' : 'text-zinc-500'}`}>
            Anual <span className="bg-emerald-500/20 text-emerald-500 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">Ahorra 20%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl w-full">
          {PLANS.map((plan) => {
            const currentPrice = getCurrentPrice(plan);
            const isCheckingOut = checkoutPlan === plan.id;

            return (
              <div 
                key={plan.id}
                className={`relative bg-[#0a0a0c] rounded-3xl p-8 flex flex-col border transition-all duration-300 hover:-translate-y-2
                  ${plan.popular ? `border-blue-500/50 ${plan.glow}` : 'border-white/5 hover:border-white/20'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                    La Elección del CEO
                  </div>
                )}

                <div className="mb-8">
                  <span className={`${plan.color} font-mono text-[10px] uppercase tracking-widest mb-2 block`}>
                    [{plan.badge}]
                  </span>
                  <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                  <p className="text-zinc-500 text-sm min-h-[40px]">{plan.desc}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black tracking-tighter">
                      ${currentPrice}
                    </span>
                    <span className="text-zinc-500 text-sm mb-1">/mes</span>
                  </div>
                  {isAnnual && (
                    <p className="text-emerald-500 text-xs font-mono">Facturado anualmente (${plan.priceAnnual * 12})</p>
                  )}
                </div>

                <div className={`p-4 rounded-xl mb-8 border ${plan.border} ${plan.bg.replace('bg-', 'bg-').concat('/10')}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={16} className={plan.color} />
                    <span className={`text-xs font-bold ${plan.color}`}>Fuerza Operativa</span>
                  </div>
                  <span className="text-sm font-medium text-white">{plan.agents}</span>
                </div>

                <ul className="flex flex-col gap-4 mb-10 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-zinc-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto min-h-[50px]">
                  <AnimatePresence mode="wait">
                    {!isCheckingOut ? (
                      <motion.button 
                        key="btn"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setCheckoutPlan(plan.id)}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2
                          ${plan.popular ? 'bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-white text-black hover:bg-zinc-200'}
                        `}
                      >
                        Desplegar Nodo <ArrowRight size={14} />
                      </motion.button>
                    ) : (
                      <motion.div key="paypal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-2">
                        <button onClick={() => setCheckoutPlan(null)} className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-500 hover:text-white mb-2 py-1">
                          <X size={14} /> Cancelar Operación
                        </button>
                        <div className="rounded-xl overflow-hidden bg-white p-1">
                          <PayPalButtons 
                            style={{ layout: "vertical", color: "black", shape: "rect", label: "checkout" }}
                            createOrder={(data, actions) => {
                              return actions.order.create({
                                intent: "CAPTURE",
                                purchase_units: [{ amount: { currency_code: "USD", value: currentPrice.toString() } }]
                              });
                            }}
                            onApprove={async (data, actions) => {
                              setIsProcessing(true);
                              const details = await actions.order!.capture();
                              const payerName = details.payer?.name?.given_name || 'Cliente';
                              
                              await saveSubscription(
                                data.orderID || '',
                                plan.id,
                                currentPrice,
                                payerName
                              );
                              
                              setIsProcessing(false);
                              alert(`Transacción completada por ${payerName}. ¡Nodo Activado!`);
                              setCheckoutPlan(null);
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 flex flex-col items-center text-center opacity-60">
          <Shield className="text-zinc-500 mb-4" size={24} />
          <p className="text-sm text-zinc-400">Encriptación Militar • Infraestructura Cloud Aislada • Cancela cuando quieras</p>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
