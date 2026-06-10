import { useLocation, useNavigate } from 'react-router-dom';
import {
  Terminal, Smartphone, MonitorPlay, Film, Play, Crown, Volume2,
  Cpu, FolderKanban, Palette, Settings2, Radar, Share2, Brain
} from 'lucide-react';
import { useDemoScript } from '@/hooks/useDemoScript';
import { useCampaignStore } from '@/store/useCampaignStore';
import TokenTelemetry from '@/components/dashboard/TokenTelemetry';
import { useAuth } from '@/contexts/AuthContext';

// 🟢 MÓDULOS PÚBLICOS (visibles para todos los usuarios autenticados)
const PUBLIC_LAB_LINKS = [
  { name: 'Nexus Brain', path: '/dashboard/nexus-brain', icon: Brain },
  { name: 'Social Lab', path: '/dashboard/social', icon: Smartphone },
  { name: 'Virtual OOH', path: '/dashboard/ooh', icon: MonitorPlay },
  { name: 'Commercial Lab', path: '/dashboard/commercial-lab', icon: Film },
  { name: 'Task Replay', path: '/dashboard/executive-demo', icon: Play },
];

// 🟢 MÓDULOS ADMINISTRATIVOS (SOLO para davicho4522@gmail.com)
const ADMIN_LAB_LINKS = [
  { name: 'Community Lab', path: '/dashboard/community', icon: Radar },
  { name: 'Omnichannel', path: '/dashboard/publisher', icon: Share2 }
];

// 🟢 MÓDULOS PREMIUM
const PREMIUM_LINKS = [
  { name: 'Subscription', path: '/dashboard/subscription', icon: Crown }
];

// 🟢 MÓDULOS DEL SISTEMA - Separados por acceso
const PUBLIC_SYSTEM_LINKS = [
  { name: 'Configuración', path: '/settings', icon: Settings2 }
];

// 🟢 MÓDULOS DEL SISTEMA ADMIN (SOLO para davicho4522@gmail.com)
const ADMIN_SYSTEM_LINKS = [
  { name: 'Visual Matrix', path: '/dashboard/visual-matrix', icon: Palette }
];

export default function SpatialSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { runFullDemo, isDemoRunning, currentStep } = useDemoScript();
  const workspace = useCampaignStore((state) => state.workspace);
  const ceoCommand = useCampaignStore((state) => state.ceoCommand);
  const { user } = useAuth();

  const isAdmin = user?.email === 'davicho4522@gmail.com';

  const workspaceName = ceoCommand ? (ceoCommand.length > 15 ? ceoCommand.substring(0, 15) + '...' : ceoCommand) : 'Active Workspace';

  // Combinar enlaces según el rol
  const allLabLinks = [...PUBLIC_LAB_LINKS, ...(isAdmin ? ADMIN_LAB_LINKS : [])];
  const allSystemLinks = [...(isAdmin ? ADMIN_SYSTEM_LINKS : []), ...PUBLIC_SYSTEM_LINKS];

  return (
    <nav className="relative z-20 w-20 lg:w-64 h-screen p-4 flex flex-col gap-4">
      <div className="flex-1 bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-3 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-y-auto no-scrollbar">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-4 border-b border-white/5 mb-4 shrink-0">
          <div
            onClick={() => !isDemoRunning && runFullDemo({ navigate })}
            className="cursor-pointer group flex items-center gap-2"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all ${isDemoRunning ? 'border-2 border-orange-500 animate-spin' : 'bg-gradient-to-br from-emerald-400 to-cyan-500'}`}>
              <Cpu size={16} className="text-black" />
            </div>
            <span className="hidden lg:block ml-3 font-bold text-white tracking-widest text-sm">
              {isDemoRunning ? currentStep : <><span className="font-light">ETHER</span><span className="opacity-50 group-hover:opacity-100 transition-opacity">OS</span></>}
            </span>
          </div>
        </div>

        {workspace && (
          <div className="mb-6 animate-in fade-in slide-in-from-left-4 duration-500 shrink-0">
            <div className="px-4 py-3 mx-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl relative overflow-hidden group hover:border-emerald-500/40 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/social')}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl -mr-8 -mt-8" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <FolderKanban className="text-emerald-400" size={16} />
                </div>
                <div className="hidden lg:flex flex-col">
                  <span className="text-[10px] text-emerald-500 font-mono tracking-widest uppercase mb-0.5">Workspace</span>
                  <span className="text-sm font-semibold text-white capitalize truncate max-w-[110px]">{workspaceName}</span>
                </div>
                <div className="absolute right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)] lg:hidden" />
              </div>
            </div>
          </div>
        )}

        {/* Renderizado de The Labs */}
        <div className="mb-4 shrink-0">
          <span className="hidden lg:block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4 px-4">The Labs</span>
          <div className="flex flex-col gap-2">
            {allLabLinks.map((link) => {
              const Icon = link.icon;
              // 🔴 LA CORRECCIÓN DEL ENRUTAMIENTO (Mata el bug del Social Lab iluminado)
              const isActive = location.pathname === link.path || (link.path === '/dashboard/nexus-brain' && location.pathname === '/dashboard');

              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path === '/dashboard/nexus-brain' && location.pathname === '/dashboard' ? '/dashboard' : link.path)}
                  className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3 rounded-xl transition-all duration-300 ${isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                >
                  <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-zinc-500'} />
                  <span className="font-bold text-sm hidden lg:block text-left flex-1">{link.name}</span>
                  {isActive && (
                    <div className="hidden lg:block ml-auto w-1.5 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Premium */}
        <div className="mb-4 shrink-0">
          <span className="hidden lg:block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4 px-4">Premium</span>
          <div className="flex flex-col gap-2">
            {PREMIUM_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3 rounded-xl transition-all duration-300 ${isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                >
                  <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-zinc-500'} />
                  <span className="font-bold text-sm hidden lg:block text-left flex-1">{link.name}</span>
                  {isActive && (
                    <div className="hidden lg:block ml-auto w-1.5 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 mb-4 lg:px-2 flex justify-center lg:justify-start shrink-0">
          <TokenTelemetry />
        </div>

        {/* System */}
        <div className="mt-auto shrink-0">
          <div className="flex flex-col gap-2">
            {allSystemLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3 rounded-xl transition-all duration-300 ${isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                >
                  <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-zinc-500'} />
                  <span className="font-bold text-sm hidden lg:block text-left flex-1">{link.name}</span>
                  {isActive && (
                    <div className="hidden lg:block ml-auto w-1.5 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
