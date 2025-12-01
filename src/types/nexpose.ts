export interface ProductImage {
  id: string;
  base64: string;
  mimeType: string;
  file: File;
}

export interface GeneratedResult {
  id: string;
  title: string;
  prompt: string;
  imageUrl?: string;
  status: 'waiting' | 'loading' | 'completed' | 'failed';
  error?: string;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export interface AnalysisResponse {
  title: string;
  prompt: string;
}

export interface GeminiContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}
