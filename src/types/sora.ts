export type SoraAspectRatio = 'portrait' | 'landscape' | 'square';
export type SoraDuration = '10' | '15';

export interface KieSoraInput {
  prompt: string;
  image_urls: string[]; // Wajib array string untuk Image-to-Video
  aspect_ratio: SoraAspectRatio;
  n_frames: SoraDuration;
  remove_watermark: boolean;
}

export interface KieSoraRequest {
  model: string;
  input: KieSoraInput;
  callBackUrl?: string;
}

export interface KieSoraTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface KieSoraRecordInfoResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    state: 'waiting' | 'processing' | 'success' | 'fail';
    progress?: number;
    resultUrls?: string[];
    resultJson?: {
      video_url?: string;
      cover_url?: string;
      resultUrls?: string[]; // Handle nested structure
      [key: string]: any;
    };
    failReason?: string; // Beberapa endpoint menggunakan ini
    failMsg?: string;    // Dokumentasi resmi menggunakan ini
  };
}

export interface SoraGenerationState {
  status: 'idle' | 'creating' | 'uploading' | 'polling' | 'success' | 'error';
  taskId: string | null;
  resultUrl: string | null;
  progress: number;
  error: string | null;
}

export interface VideoHistoryItem {
  id: string;
  prompt: string;
  videoUrl: string;
  thumbnailUrl?: string;
  timestamp: number;
  aspectRatio: SoraAspectRatio;
  style: string;
}
