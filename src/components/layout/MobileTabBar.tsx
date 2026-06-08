import React from 'react';
import { Home, Smartphone, Monitor, Tv } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function MobileTabBar() {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => {
        const currentPath = location.pathname;
        return currentPath === path || currentPath.startsWith(path + '/');
    };

    const tabs = [
        { 
            icon: Home, 
            route: '/dashboard/hub', 
            label: 'Hub',
            activeColor: 'text-emerald-400',
            activeBg: 'bg-emerald-500/20'
        },
        { 
            icon: Smartphone, 
            route: '/dashboard/social', 
            label: 'Social',
            activeColor: 'text-emerald-400',
            activeBg: 'bg-emerald-500/20'
        },
        { 
            icon: Monitor, 
            route: '/dashboard/ooh', 
            label: 'OOH',
            activeColor: 'text-orange-400',
            activeBg: 'bg-orange-500/20'
        },
        { 
            icon: Tv, 
            route: '/dashboard/commercial', 
            label: 'TV',
            activeColor: 'text-purple-400',
            activeBg: 'bg-purple-500/20'
        },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-zinc-950/80 backdrop-blur-2xl border-t border-white/10 px-2 pt-2 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-around items-center h-14">
                {tabs.map((tab) => {
                    const active = isActive(tab.route);
                    const Icon = tab.icon;
                    
                    return (
                        <button 
                            key={tab.route}
                            onClick={() => navigate(tab.route)}
                            className={`flex flex-col items-center justify-center w-16 h-full space-y-1 active:scale-90 transition-all duration-200 ${active ? `${tab.activeColor} scale-110` : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <div className={`relative p-2 rounded-xl transition-colors ${active ? `${tab.activeBg} ${tab.activeColor}` : ''}`}>
                                <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
                                {active && <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${tab.activeColor.replace('text-', 'bg-')}`} />}
                            </div>
                            <span className={`text-[10px] font-medium tracking-wide ${active ? tab.activeColor : 'text-zinc-500'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
