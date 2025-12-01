export type GenerationType = 'text-to-video' | 'image-to-video';
export type UploadMode = 'single' | 'primary_secondary' | 'front_back';
export type VideoModel = 
  | 'sora-2-text-to-video' 
  | 'sora-2-image-to-video' 
  | 'veo-3.1'
  | 'grok-imagine/text-to-video'
  | 'grok-imagine/image-to-video';

export type Resolution = '480p' | '720p' | '1080p' | '4K';

export type VideoObjective = 'general' | 'promo' | 'education' | 'entertainment';
export type PromoType = 'awareness' | 'soft_selling' | 'hard_selling';

export interface ImageSlot {
  id: string;
  file: File | null;
  previewUrl: string | null;
  label: string;
}

export interface ImageUploadState {
  mode: UploadMode;
  slots: {
    slotA: ImageSlot;
    slotB: ImageSlot;
  };
}

export interface ImageScene {
  id: string;
  file: File | null;
  previewUrl: string | null;
  prompt: string;
}

export interface VideoSettings {
  productName: string;
  brand: string;
  category: string;
  objective: string;
  platform: string;
  aspectRatio: string;
  duration: string;
  description: string;
  model: VideoModel;
  resolution: Resolution;
  isSequel: boolean;
  autoBlend: boolean;
  location?: string;
  
  // Structured Fields
  videoObjective?: VideoObjective;
  promoType?: PromoType;
  
  // Multi-Scene Data
  imageScenes?: ImageScene[];
}

export interface EstimationData {
  time: number; // seconds
  cost: number; // credits
}
