export type IdeogramImageSize = 'landscape_16_9' | 'portrait_16_9' | 'square_hd' | 'landscape_4_3' | 'portrait_4_3';

export type IdeogramStyle = 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'RENDER_3D' | 'ANIME';

export type IdeogramSpeed = 'BALANCED' | 'FAST' | 'QUALITY';

export interface IdeogramInput {
  prompt: string;
  image_size: IdeogramImageSize;
  style: IdeogramStyle;
  rendering_speed: IdeogramSpeed;
  expand_prompt: boolean;
  num_images: string;
  seed?: number;
  negative_prompt?: string;
}

export interface IdeogramTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface IdeogramStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    state: 'waiting' | 'processing' | 'success' | 'fail';
    progress?: number;
    resultUrls?: string[];
    resultJson?: string | { resultUrls: string[] }; // Bisa string JSON atau object
    failReason?: string;
  };
}
