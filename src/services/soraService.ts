import axios from 'axios';
import { 
  KieSoraInput, 
  KieSoraTaskResponse, 
  KieSoraRecordInfoResponse 
} from '../types/sora';

const API_BASE_URL = 'https://api.kie.ai/api/v1/jobs';

export const soraService = {
  /**
   * Creates a new video generation task (Sora 2 Image To Video)
   */
  createTask: async (apiKey: string, input: KieSoraInput): Promise<string> => {
    try {
      // Validasi Input Sesuai Dokumentasi
      if (!input.image_urls || input.image_urls.length === 0) {
        throw new Error("Image URL is required for Sora 2 Image-to-Video");
      }

      const response = await axios.post<KieSoraTaskResponse>(
        `${API_BASE_URL}/createTask`,
        {
          model: 'sora-2-image-to-video', // Updated Model Name
          input: {
            prompt: input.prompt,
            image_urls: input.image_urls,
            aspect_ratio: input.aspect_ratio,
            n_frames: input.n_frames,
            remove_watermark: input.remove_watermark
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code !== 200 || !response.data.data?.taskId) {
        throw new Error(response.data.msg || 'Gagal membuat tugas video');
      }

      return response.data.data.taskId;
    } catch (error: any) {
      console.error("Sora Create Task Error:", error);
      const errorMsg = error.response?.data?.msg || error.response?.data?.message || error.message || 'Network error during task creation';
      throw new Error(errorMsg);
    }
  },

  /**
   * Checks the status of a running task
   */
  getTaskStatus: async (apiKey: string, taskId: string): Promise<KieSoraRecordInfoResponse['data']> => {
    try {
      const response = await axios.get<KieSoraRecordInfoResponse>(
        `${API_BASE_URL}/recordInfo`,
        {
          params: { taskId },
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.msg || 'Gagal mengambil status tugas');
      }

      const data = response.data.data;

      // Normalisasi Fail Reason (API kadang pakai failMsg, kadang failReason)
      if (data.state === 'fail') {
        data.failReason = data.failMsg || data.failReason || "Unknown error from server";
      }

      // Parsing resultJson string if necessary
      if (data.state === 'success' && typeof data.resultJson === 'string') {
        try {
          const parsed = JSON.parse(data.resultJson);
          // Normalize structure: ensure resultUrls is available at top level of data object if possible
          if (parsed.resultUrls) {
            data.resultUrls = parsed.resultUrls;
          }
          data.resultJson = parsed;
        } catch (e) {
          console.error("Failed to parse resultJson string:", data.resultJson);
        }
      }

      return data;
    } catch (error: any) {
      console.error("Sora Status Check Error:", error);
      const errorMsg = error.response?.data?.msg || error.message || 'Network error during status check';
      throw new Error(errorMsg);
    }
  }
};
