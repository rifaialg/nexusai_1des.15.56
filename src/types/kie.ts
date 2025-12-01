export type KieModel = 
  | 'veo-3.1'
  | 'sora-2-text-to-video'
  | 'sora-2-image-to-video'
  | 'sora-2-pro-text-to-video'
  | 'sora-2-pro-image-to-video'
  | 'sora-2-pro-storyboard-to-video'
  | 'grok-imagine/text-to-video'
  | 'grok-imagine/image-to-video';

export type KieAspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
export type KieDuration = '5' | '10' | '15';

// --- VEO SPECIFIC ---
export interface VeoRequest {
  model: 'veo-3.1';
  prompt: string;
  aspectRatio?: string; // e.g., "16:9"
  expand_prompt?: boolean;
  callBackUrl?: string;
  negative_prompt?: string;
}

// --- SORA SPECIFIC ---
export interface SoraShot {
  prompt: string;
  duration: number; // in seconds
  shot_type?: string; // e.g., "Close-up"
  camera_movement?: string; // e.g., "Pan right"
}

export interface SoraInput {
  prompt?: string;
  image_urls?: string[];
  aspect_ratio?: string; // "landscape", "portrait", "square"
  n_frames?: string; // "10", "15"
  remove_watermark?: boolean;
  shots?: SoraShot[]; // Khusus Storyboard
  expand_prompt?: boolean;
  
  // GROK Specific
  index?: number;
  mode?: string; // "normal"
}

export interface SoraRequest {
  model: string;
  input: SoraInput;
  callBackUrl?: string;
}

// --- RESPONSES ---
export interface KieTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface KieRecordInfoResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    state: 'waiting' | 'processing' | 'success' | 'fail';
    progress?: number;
    model?: string;
    resultUrls?: string[];
    resultJson?: string | { video_url?: string; resultUrls?: string[] };
    failReason?: string;
    failMsg?: string;
  };
}
