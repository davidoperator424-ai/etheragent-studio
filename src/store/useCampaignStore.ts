import { create } from 'zustand';
import { CampaignMatrix } from '../lib/groqService';
import { CampaignWorkspace } from '../lib/geminiService';

interface CampaignState {
  targetUrl: string;
  ceoCommand: string;
  matrix: CampaignMatrix | null;
  workspace: CampaignWorkspace | null;
  selectedVideo: { url: string; thumbnail: string } | null;
  setInputs: (url: string, command: string) => void;
  setMatrix: (matrix: CampaignMatrix) => void;
  setWorkspace: (ws: CampaignWorkspace) => void;
  setSelectedVideo: (video: { url: string; thumbnail: string } | null) => void;
  reset: () => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  targetUrl: '',
  ceoCommand: '',
  matrix: null,
  workspace: null,
  selectedVideo: null,

  setInputs: (url, command) => set({ targetUrl: url, ceoCommand: command }),
  setMatrix: (matrix) => set({ matrix }),
  setWorkspace: (ws) => set({ workspace: ws }),
  setSelectedVideo: (video) => set({ selectedVideo: video }),
  reset: () => set({ targetUrl: '', ceoCommand: '', matrix: null, workspace: null, selectedVideo: null }),
}));
