import { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command, BrainCircuit, Users, Video, BarChart3, DollarSign, LayoutTemplate, Zap, Wifi, WifiOff, Globe, Loader2, Smartphone, MonitorPlay, Home
} from 'lucide-react';
import type { ViewId, Avatar } from '@/types';
import { API_STATUS } from '@/services/api';
import SpatialSidebar from '@/components/layout/SpatialSidebar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import AITokenManager from '@/components/AITokenManager';

interface WindowWithGtag extends Window {
  gtag?: (...args: unknown[]) => void;
}

const SystemSpaces = lazy(() => import('@/components/dashboard/SystemSpaces'));
const IntelligenceEngine = lazy(() => import('@/components/dashboard/IntelligenceEngine'));
const Intelligence = lazy(() => import('@/components/dashboard/Intelligence'));
const InfluencerRoster = lazy(() => import('@/components/dashboard/InfluencerRoster'));
const BroadcasterLab = lazy(() => import('@/components/dashboard/BroadcasterLab'));
const TemplateVault = lazy(() => import('@/components/dashboard/TemplateVault'));
const ActiveTelemetry = lazy(() => import('@/components/dashboard/ActiveTelemetry'));
const PricingPlans = lazy(() => import('@/components/dashboard/PricingPlans'));
const DeploymentSequence = lazy(() => import('@/components/dashboard/DeploymentSequence'));
const GlobalExchange = lazy(() => import('@/components/dashboard/GlobalExchange'));
const NexusIntelligence = lazy(() => import('@/components/dashboard/NexusIntelligence'));
const NexusDashboard = lazy(() => import('@/components/dashboard/NexusDashboard'));
const SocialLab = lazy(() => import('@/components/dashboard/SocialLab'));
const VirtualOOHLab = lazy(() => import('@/components/dashboard/VirtualOOHLab'));
const PerformanceAdsLab = lazy(() => import('@/components/dashboard/PerformanceAdsLab'));
const VisualAssetMatrix = lazy(() => import('@/components/dashboard/VisualAssetMatrix'));
const SonicLab = lazy(() => import('@/components/dashboard/SonicLab'));
const StudioLab = lazy(() => import('@/components/dashboard/StudioLab'));
const CommercialLab = lazy(() => import('@/components/dashboard/CommercialLab'));
const ExecutiveDemo = lazy(() => import('@/components/dashboard/ExecutiveDemo'));
const SubscriptionPlans = lazy(() => import('@/components/dashboard/SubscriptionPlans'));
const CommunityLab = lazy(() => import('@/components/dashboard/CommunityLab'));
const NexusBrain = lazy(() => import('@/components/dashboard/NexusBrain'));
const OmniPublisher = lazy(() => import('@/components/dashboard/publisher/OmniPublisher'));

const EtherAgentWelcome = lazy(() => import('@/components/dashboard/EtherAgentWelcome'));

const STORAGE_KEY = 'etheragent_navigation';

interface StoredNavigation {
  lastPath: string;
  lastVisit: number;
  selectedAvatar?: { id: string; name: string };
  selectedCategory: string;
}

const ComponentLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <Loader2 className="animate-spin text-emerald-400" size={32} />
  </div>
);

const navItems: { id: ViewId; path: string; icon: React.ReactNode; label: string; sub: string }[] = [
  { id: 'home', path: '/dashboard', icon: <Home size={18} />, label: 'Hub', sub: 'Command Central' },
  { id: 'nexus', path: '/dashboard/nexus', icon: <BrainCircuit size={18} />, label: 'Nexus', sub: 'Brand Ingestion' },
  { id: 'social', path: '/dashboard/social', icon: <Smartphone size={18} />, label: 'Social Lab', sub: 'AI Campaign Studio' },
];

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

const trackAnalytics = (path: string) => {
  const windowWithGtag = window as WindowWithGtag;
  if (GA_MEASUREMENT_ID && windowWithGtag.gtag) {
    windowWithGtag.gtag('event', 'page_view', {
      page_path: path,
      page_title: document.title
    });
  }
  console.log('[Analytics] Page view:', path);
};

const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  const windowWithGtag = window as WindowWithGtag;
  if (GA_MEASUREMENT_ID && windowWithGtag.gtag) {
    windowWithGtag.gtag('event', eventName, params);
  }
  console.log('[Analytics] Event:', eventName, params);
};

export { trackEvent };

const saveNavigation = (data: StoredNavigation) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save navigation state:', e);
  }
};

const loadNavigation = (): StoredNavigation | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.warn('Could not load navigation state:', e);
    return null;
  }
};



const DesktopSidebar = ({ pathname }: { pathname: string }) => {
  const navigate = useNavigate();

  return (
    <SpatialSidebar />
  );
};

const PageTransition = ({ children, location }: { children: React.ReactNode; location: string }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={location}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

const DashboardLayout = ({ children, location }: { children: React.ReactNode; location: string }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-black text-white font-sans overflow-hidden">
      <AITokenManager />
      {/* FONDO ESPACIAL GLOBAL */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {!isMobile && <DesktopSidebar pathname={location} />}
      <main className="flex-1 min-h-[100dvh] overflow-y-scroll overflow-x-hidden relative z-10 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:p-10 pb-28 md:pb-10">
          <Suspense fallback={<ComponentLoader />}>
            <PageTransition location={location}>
              {children}
            </PageTransition>
          </Suspense>
        </div>
      </main>
      <MobileTabBar />
    </div>
  );
};

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_EMAIL = 'davicho4522@gmail.com';

const AdminRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (user?.email !== ADMIN_EMAIL) {
    return <Navigate to="/dashboard/nexus-brain" replace />;
  }
  
  return <>{children}</>;
};

export default function Index() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = loadNavigation();
    if (stored) {
      if (stored.selectedAvatar) {
        setSelectedAvatar(stored.selectedAvatar as Avatar);
      }
      setSelectedCategory(stored.selectedCategory);
    }
    setIsHydrated(true);
    trackAnalytics(location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveNavigation({
      lastPath: location.pathname,
      lastVisit: Date.now(),
      selectedAvatar: selectedAvatar ?? undefined,
      selectedCategory
    });
  }, [location.pathname, selectedAvatar, selectedCategory, isHydrated]);

  const handleSelectAvatar = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    trackAnalytics('/broadcaster');
    navigate('/dashboard/broadcaster');
  };

  return (
    <DashboardLayout location={location.pathname}>
      <Routes>
        <Route path="/" element={<ProtectedRoute><EtherAgentWelcome /></ProtectedRoute>} />
        <Route path="hub" element={<Navigate to="/dashboard/nexus-brain" replace />} />
        <Route path="nexus" element={<ProtectedRoute><NexusDashboard /></ProtectedRoute>} />
        <Route path="social" element={<ProtectedRoute><SocialLab /></ProtectedRoute>} />
        <Route path="ooh" element={<ProtectedRoute><VirtualOOHLab /></ProtectedRoute>} />
        <Route path="ads" element={<ProtectedRoute><PerformanceAdsLab /></ProtectedRoute>} />
        <Route path="spaces" element={<ProtectedRoute><SystemSpaces /></ProtectedRoute>} />
        <Route path="engine" element={<ProtectedRoute><Intelligence /></ProtectedRoute>} />
        <Route path="intelligence" element={<ProtectedRoute><Intelligence /></ProtectedRoute>} />
        <Route path="influencers" element={<ProtectedRoute><InfluencerRoster selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} onSelectAvatar={handleSelectAvatar} /></ProtectedRoute>} />
        <Route path="broadcaster" element={<ProtectedRoute><BroadcasterLab selectedAvatar={selectedAvatar} /></ProtectedRoute>} />
        <Route path="templates" element={<ProtectedRoute><TemplateVault /></ProtectedRoute>} />
        <Route path="telemetry" element={<ProtectedRoute><ActiveTelemetry /></ProtectedRoute>} />
        <Route path="pricing" element={<ProtectedRoute><PricingPlans /></ProtectedRoute>} />
        <Route path="deployment" element={<ProtectedRoute><DeploymentSequence /></ProtectedRoute>} />
        <Route path="exchange" element={<ProtectedRoute><GlobalExchange /></ProtectedRoute>} />
        <Route path="visual-matrix" element={<ProtectedRoute><AdminRouteGuard><VisualAssetMatrix /></AdminRouteGuard></ProtectedRoute>} />
        <Route path="sonic" element={<ProtectedRoute><SonicLab /></ProtectedRoute>} />
        <Route path="studio-lab" element={<ProtectedRoute><StudioLab /></ProtectedRoute>} />
        <Route path="commercial-lab" element={<ProtectedRoute><CommercialLab /></ProtectedRoute>} />
        <Route path="nexus-brain" element={<ProtectedRoute><NexusBrain /></ProtectedRoute>} />
        <Route path="executive-demo" element={<ProtectedRoute><ExecutiveDemo /></ProtectedRoute>} />
        <Route path="subscription" element={<ProtectedRoute><SubscriptionPlans /></ProtectedRoute>} />
        <Route path="community" element={<ProtectedRoute><AdminRouteGuard><CommunityLab /></AdminRouteGuard></ProtectedRoute>} />
        <Route path="publisher" element={<ProtectedRoute><AdminRouteGuard><OmniPublisher /></AdminRouteGuard></ProtectedRoute>} />
      </Routes>
    </DashboardLayout>
  );
}
