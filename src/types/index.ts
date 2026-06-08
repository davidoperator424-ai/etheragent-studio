import type { ReactNode } from 'react';

export type ViewId = 'home' | 'nexus' | 'spaces' | 'engine' | 'influencers' | 'broadcaster' | 'templates' | 'telemetry' | 'pricing' | 'deployment' | 'exchange' | 'social' | 'sonic' | 'commercial' | 'community' | 'publisher';

export interface Avatar {
  id: string;
  name: string;
  role: string;
  image: string;
  category: string;
  price: string;
  trust: number;
  createdAt?: string;
  updatedAt?: string;
  status?: 'active' | 'inactive' | 'draft';
  isSynthetic?: boolean;
  promptConfig?: Record<string, unknown>;
  videoUrl?: string | null;
  media?: {
    avatar_hq?: string;
    video_preview_es?: string;
    video_preview_en?: string;
  };
}

export interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  metrics: {
    roi: string;
    time: string;
  };
  image: string;
  bestseller: boolean;
  includes: string[];
}

export interface FlowStep {
  id: string;
  title: string;
  titleEn: string;
  status: 'completed' | 'active' | 'pending';
  icon: ReactNode;
  description: string;
  descriptionEn: string;
  code?: string;
  output?: string[];
  details?: string[];
}

export interface MediaAssets {
  avatar_hq: string;
  video_preview_es: string;
  video_preview_en: string;
  video_full_es: string;
  video_full_en: string;
}

export interface SystemFlow {
  id: string;
  title: string;
  tag: string;
  headerLabel: string;
  icon: ReactNode;
  description: string;
  steps: FlowStep[];
  media?: MediaAssets;
}

export interface TelemetryData {
  revenue: number;
  dailyLeads: number;
  activeRentals: number;
  topAvatar: string;
  roas: number;
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: { monthly: number; annual: number };
  features: string[];
  isPopular?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
  purchases?: string[];
}

export interface CheckoutResponse {
  status: 'success' | 'failed';
  transactionId: string;
  invoiceUrl: string;
  message: string;
}

export type AgentTone = 'professional' | 'casual' | 'authoritative' | 'friendly' | 'humorous';
export type AgentUniverse = 'metaverse' | 'physical_indoor' | 'physical_outdoor' | 'space' | 'virtual';
export type AgentStatus = 'active' | 'paused' | 'training' | 'archived';
export type MemoryType = 'conversation' | 'fact' | 'preference' | 'feedback' | 'trend' | 'context';
export type ContentType = 'video' | 'text' | 'image' | 'audio';
export type ContentStatus = 'draft' | 'pending_approval' | 'published' | 'failed';

export interface AgentPersona {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  avatar_id?: string;
  system_prompt: string;
  tone: AgentTone;
  language: string;
  universe: AgentUniverse;
  niche: string;
  auto_post: boolean;
  post_frequency_hours: number;
  max_daily_posts: number;
  memory_enabled: boolean;
  memory_importance_threshold: number;
  status: AgentStatus;
  created_at: string;
  updated_at: string;
}

export interface AgentMemory {
  id: string;
  agent_id: string;
  content: string;
  memory_type: MemoryType;
  importance_score: number;
  source_type?: string;
  source_id?: string;
  created_at: string;
  last_accessed_at: string;
}

export interface AgentConversation {
  id: string;
  agent_id: string;
  user_id?: string;
  role: 'user' | 'assistant' | 'system';
  message: string;
  metadata: Record<string, unknown>;
  input_tokens?: number;
  output_tokens?: number;
  created_at: string;
}

export interface AgentSchedule {
  id: string;
  agent_id: string;
  cron_expression: string;
  timezone: string;
  content_prompt: string;
  platforms: string[];
  max_runs_per_day: number;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
}

export interface AgentContent {
  id: string;
  agent_id: string;
  content_type: ContentType;
  script?: string;
  generated_text?: string;
  video_url?: string;
  image_url?: string;
  platform?: string;
  platform_post_id?: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  model_used?: string;
  generation_time_ms?: number;
  status: ContentStatus;
  created_at: string;
  published_at?: string;
}

export interface AgentContextWindow {
  id: string;
  content: string;
  memory_type: MemoryType;
  importance_score: number;
}
