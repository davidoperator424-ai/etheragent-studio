import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AITokens {
  openai?: string;
  anthropic?: string;
  groq?: string;
  gemini?: string;
  fal?: string;
}

interface TokenState {
  tokens: AITokens;
  setToken: (key: keyof AITokens, value: string) => void;
  clearTokens: () => void;
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set) => ({
      tokens: {},
      setToken: (key, value) => 
        set((state) => ({ 
          tokens: { ...state.tokens, [key]: value } 
        })),
      clearTokens: () => set({ tokens: {} }),
    }),
    {
      name: 'ai-tokens-storage',
    }
  )
);
