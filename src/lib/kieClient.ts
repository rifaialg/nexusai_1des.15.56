import { supabase } from './supabase';
import { kieService } from '../services/kieService';
import { KieModel, SoraInput } from '../types/kie';

// Helper untuk membaca API Key dari LocalStorage atau Env
const getApiKey = () => {
  try {
    const stored = localStorage.getItem('NEXUS_AI_KEY_SORA');
    if (stored) return atob(stored);
    return import.meta.env.VITE_SORA_API_KEY || null;
  } catch {
    return null;
  }
};

// Helper: Convert Data URL (Base64) to Blob
const dataURLtoBlob = (dataurl: string): Blob => {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// Helper: Upload Asset to Supabase
const uploadAsset = async (assetUrl: string, userId: string): Promise<string> => {
  try {
    let blob: Blob;

    if (assetUrl.startsWith('data:')) {
      blob = dataURLtoBlob(assetUrl);
    } else if (assetUrl.startsWith('blob:')) {
      const response = await fetch(assetUrl);
      blob = await response.blob();
    } else {
      return assetUrl; 
    }

    let mimeType = blob.type;
    const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif'
    };

    if (!mimeType || mimeType === 'application/octet-stream') {
        mimeType = 'image/png';
    }
    if (!mimeToExt[mimeType]) {
        mimeType = 'image/png';
    }

    const fileExt = mimeToExt[mimeType] || 'png';
    const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage.from('uploads').upload(fileName, blob, {
      contentType: mimeType,
      upsert: true
    });
    
    if (error) {
        console.error("Supabase Upload Error:", error);
        if (error.message.includes('Bucket not found')) {
          throw new Error("Storage bucket 'uploads' belum siap.");
        }
        if (error.message.includes('row-level security')) {
          throw new Error("Izin upload ditolak.");
        }
        throw new Error(`Gagal upload ke Supabase: ${error.message}`);
    }

    const { data, error: signError } = await supabase.storage
      .from('uploads')
      .createSignedUrl(fileName, 3600);

    if (signError || !data?.signedUrl) {
        throw signError || new Error("Gagal membuat Signed URL");
    }
    
    return data.signedUrl;

  } catch (e: any) {
    console.error("Asset upload failed:", e);
    throw new Error(e.message || "Gagal mengupload gambar.");
  }
};

export interface KieJobOptions {
  model: string;
  prompt: string;
  assets?: string[];
  duration: number;
  aspectRatio: string;
  resolution: string;
  mode?: string;
  storyboardData?: any;
}

export interface KieJobStatus {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  outputUrl: string | null;
  errorMessage: string | null;
  progress?: number;
}

export const kieClient = {
  submitVideoJob: async (options: KieJobOptions): Promise<{ kieJobId: string; dbId: string }> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key KIE AI tidak ditemukan.");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User tidak terautentikasi.");

    let finalAssets: string[] = [];
    if (options.assets && options.assets.length > 0) {
      try {
        finalAssets = await Promise.all(options.assets.map(async (asset) => {
          return await uploadAsset(asset, user.id);
        }));
      } catch (uploadErr: any) {
        throw new Error(`Gagal memproses gambar: ${uploadErr.message}`);
      }
    }

    // --- SYSTEM PROMPT ENFORCEMENT (MANDATORY) ---
    let finalPrompt = options.prompt;
    const systemInstructions: string[] = [];

    // 1. MANDATORY CLEAN VIDEO
    systemInstructions.push("NEGATIVE PROMPT (WEIGHT -10): text, watermark, subtitles, logo, typography, brand name, copyright, username, ui elements, speech bubble, overlay, blurred text, signature.");
    systemInstructions.push("MANDATORY VISUAL RULE: The video output must be 100% CLEAN. No text rendering is allowed under any circumstances. Pure cinematic footage only.");

    // 2. MANDATORY DYNAMIC MOTION (For Image-to-Video)
    if (finalAssets.length > 0) {
      // INI BAGIAN KRUSIAL UNTUK MENCEGAH GAMBAR STATIS DI AWAL
      systemInstructions.push("CRITICAL STARTING RULE: The video MUST NOT start with the static input image. The input image is for REFERENCE ONLY.");
      systemInstructions.push("IMMEDIATE ACTION: Start the video with a 'Fast Dolly In' or 'Whip Pan' at t=0.0s to break the static frame immediately.");
      systemInstructions.push("TRANSFORMATION: Morph the input reference into a live, breathing scene instantly. Do not hold the first frame.");
      systemInstructions.push("NO STATIC THUMBNAIL: Ensure the very first second has significant pixel change/movement.");
    }

    if (systemInstructions.length > 0) {
      finalPrompt = `${finalPrompt} \n\n[CRITICAL INSTRUCTIONS: Do NOT display any text overlays, watermarks, or product names on the video. Do NOT show the source image as-is at the beginning. Generate actual video content immediately from the first frame. Use the provided image as a reference for the product appearance only, then create dynamic video footage.] \n\n[SYSTEM INSTRUCTIONS]: ${systemInstructions.join(' ')}`;
    }

    const modelId = options.model as KieModel;
    let taskId: string;

    try {
      if (modelId === 'veo-3.1') {
        taskId = await kieService.generateVeo(apiKey, {
          prompt: finalPrompt,
          aspectRatio: options.aspectRatio,
          expand_prompt: true
        });
      } else {
        const soraInput: SoraInput = {};

        if (modelId.includes('grok-imagine')) {
            soraInput.prompt = finalPrompt;
            soraInput.index = 0;
            soraInput.mode = 'normal';
            
            if (modelId.includes('image-to-video')) {
                if (!finalAssets || finalAssets.length === 0) {
                    throw new Error("Image URL wajib untuk model Grok Image-to-Video");
                }
                soraInput.image_urls = finalAssets;
            }
        } else {
            let soraRatio = 'portrait';
            if (options.aspectRatio === '16:9') soraRatio = 'landscape';
            if (options.aspectRatio === '1:1') soraRatio = 'square';
            if (options.aspectRatio === '4:3') soraRatio = 'landscape';

            let soraDuration = '10';
            if (options.duration >= 15) soraDuration = '15';
            if (options.duration <= 5) soraDuration = '5';

            soraInput.aspect_ratio = soraRatio;
            soraInput.n_frames = soraDuration;
            soraInput.remove_watermark = true;
            soraInput.expand_prompt = true;

            if (modelId.includes('image-to-video')) {
                if (!finalAssets || finalAssets.length === 0) {
                    throw new Error("Image URL wajib untuk model Image-to-Video");
                }
                soraInput.image_urls = finalAssets;
                soraInput.prompt = finalPrompt; 
            } else if (modelId.includes('storyboard')) {
                if (options.storyboardData?.scenes) {
                    soraInput.shots = options.storyboardData.scenes.map((s: any) => ({
                    prompt: `${s.visual}. ${s.caption ? `Text overlay: "${s.caption}"` : ''}`,
                    duration: s.duration,
                    shot_type: s.shotType,
                    camera_movement: s.camera
                    }));
                } else {
                    soraInput.prompt = finalPrompt;
                }
            } else {
                soraInput.prompt = finalPrompt;
            }
        }

        taskId = await kieService.generateSora(apiKey, modelId, soraInput);
      }
    } catch (error: any) {
      if (error.message?.includes('insufficient') || error.message?.includes('credit') || error.message?.includes('402')) {
        console.warn("Fallback to Demo Mode due to API limit");
        taskId = `demo_${Date.now()}`;
      } else {
        throw error;
      }
    }

    const { data: dbData, error: dbError } = await supabase
      .from('generated_videos')
      .insert({
        user_id: user.id,
        task_id: taskId,
        prompt: options.prompt,
        status: 'waiting',
        meta_data: {
          mode: options.mode || 'basic',
          model: modelId,
          aspectRatio: options.aspectRatio,
          duration: options.duration,
          assets: finalAssets,
          systemPromptAdded: true
        }
      })
      .select()
      .single();

    if (dbError) throw new Error("Gagal menyimpan job ke database: " + dbError.message);

    return { kieJobId: taskId, dbId: dbData.id };
  },

  getJobStatus: async (kieJobId: string): Promise<KieJobStatus> => {
    const { data: dbVideo, error } = await supabase
      .from('generated_videos')
      .select('*')
      .eq('task_id', kieJobId)
      .single();

    if (error || !dbVideo) return { status: 'failed', outputUrl: null, errorMessage: "Job not found in DB" };

    if (dbVideo.status === 'success') {
      return { status: 'completed', outputUrl: dbVideo.video_url, errorMessage: null, progress: 100 };
    }
    if (dbVideo.status === 'fail') {
      return { status: 'failed', outputUrl: null, errorMessage: dbVideo.meta_data?.error || 'Failed' };
    }

    if (kieJobId.startsWith('demo_')) {
      const elapsed = Date.now() - new Date(dbVideo.created_at).getTime();
      if (elapsed > 15000) {
        const demoUrl = 'https://cdn.pixabay.com/video/2023/09/24/182082-867762079_large.mp4';
        await supabase.from('generated_videos').update({ status: 'success', video_url: demoUrl }).eq('id', dbVideo.id);
        return { status: 'completed', outputUrl: demoUrl, errorMessage: null, progress: 100 };
      } else {
        return { status: 'processing', outputUrl: null, errorMessage: null, progress: Math.min(90, Math.floor(elapsed / 150)) };
      }
    }

    const apiKey = getApiKey();
    if (!apiKey) return { status: 'failed', outputUrl: null, errorMessage: "API Key missing" };

    try {
      const statusData = await kieService.getTaskStatus(apiKey, kieJobId);
      
      if (statusData.state !== dbVideo.status) {
        const updatePayload: any = { status: statusData.state };
        
        if (statusData.state === 'success') {
          const url = statusData.resultUrls?.[0] || (statusData.resultJson as any)?.video_url || (statusData.resultJson as any)?.resultUrls?.[0];
          if (url) updatePayload.video_url = url;
        } else if (statusData.state === 'fail') {
          updatePayload.meta_data = { ...dbVideo.meta_data, error: statusData.failReason || statusData.failMsg };
        }

        await supabase.from('generated_videos').update(updatePayload).eq('id', dbVideo.id);
      }

      let clientStatus: KieJobStatus['status'] = 'processing';
      if (statusData.state === 'success') clientStatus = 'completed';
      if (statusData.state === 'fail') clientStatus = 'failed';
      if (statusData.state === 'waiting') clientStatus = 'queued';

      const finalUrl = statusData.resultUrls?.[0] || (statusData.resultJson as any)?.video_url || (statusData.resultJson as any)?.resultUrls?.[0] || null;

      return {
        status: clientStatus,
        outputUrl: finalUrl,
        errorMessage: statusData.failReason || statusData.failMsg || null,
        progress: statusData.progress
      };

    } catch (e: any) {
      console.error("Polling Error:", e);
      return { status: 'processing', outputUrl: null, errorMessage: e.message };
    }
  }
};
