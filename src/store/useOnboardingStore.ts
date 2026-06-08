import { create } from 'zustand';

export type OnboardingPhase = 'idle' | 'phase1_dashboard' | 'phase2_matrices' | 'phase3_social' | 'completed';

interface OnboardingState {
  phase: OnboardingPhase;
  isFirstLogin: boolean;
  hasSeenOnboarding: boolean;
  isPlaying: boolean;
  progress: number;
  startOnboarding: () => void;
  setPhase: (phase: OnboardingPhase) => void;
  setProgress: (progress: number) => void;
  completeOnboarding: () => void;
  checkAndStartOnboarding: () => void;
  skipOnboarding: () => void;
}

const ONBOARDING_KEY = 'etheragent_onboarding_seen';

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  phase: 'idle',
  isFirstLogin: true,
  hasSeenOnboarding: false,
  isPlaying: false,
  progress: 0,

  startOnboarding: () => {
    set({ 
      isPlaying: true, 
      phase: 'phase1_dashboard',
      hasSeenOnboarding: true 
    });
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) {
      console.warn('Could not save onboarding state');
    }
  },

  setPhase: (phase) => set({ phase }),
  
  setProgress: (progress) => set({ progress }),

  completeOnboarding: () => {
    set({ 
      phase: 'completed', 
      isPlaying: false,
      progress: 100 
    });
  },

  checkAndStartOnboarding: () => {
    try {
      const seen = localStorage.getItem(ONBOARDING_KEY);
      const hasSeen = seen === 'true';
      set({ 
        hasSeenOnboarding: hasSeen,
        isFirstLogin: !hasSeen
      });
    } catch (e) {
      set({ hasSeenOnboarding: false, isFirstLogin: true });
    }
  },

  skipOnboarding: () => {
    set({ 
      isPlaying: false, 
      phase: 'completed',
      hasSeenOnboarding: true 
    });
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) {
      console.warn('Could not save onboarding state');
    }
  }
}));
