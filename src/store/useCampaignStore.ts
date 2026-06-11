import { create } from 'zustand';
import { CampaignMatrix } from '../lib/groqService';
import { CampaignWorkspace } from '../lib/geminiService';

export interface SelectedVideoMeta {
  url: string;
  thumbnail: string;
  assetId?: string;
  assetType?: 'uploaded' | 'ai_generated';
  visualPrompt?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

interface CampaignState {
  targetUrl: string;
  ceoCommand: string;
  matrix: CampaignMatrix | null;
  workspace: CampaignWorkspace | null;
  selectedVideo: SelectedVideoMeta | null;
  setInputs: (url: string, command: string) => void;
  setMatrix: (matrix: CampaignMatrix) => void;
  setWorkspace: (ws: CampaignWorkspace) => void;
  setSelectedVideo: (video: SelectedVideoMeta | null) => void;
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
