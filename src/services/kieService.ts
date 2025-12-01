import axios from 'axios';
import { 
  VeoRequest, 
  SoraRequest, 
  KieTaskResponse, 
  KieRecordInfoResponse,
  KieModel
} from '../types/kie';

const API_BASE_URL = 'https://api.kie.ai/api/v1';

export const kieService = {
  /**
   * Generate video using Veo 3.1
   */
  generateVeo: async (apiKey: string, params: Omit<VeoRequest, 'model'>): Promise<string> => {
    try {
      const response = await axios.post<KieTaskResponse>(
        `${API_BASE_URL}/veo/generate`,
        {
          model: 'veo-3.1',
          ...params
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code !== 200 || !response.data.data?.taskId) {
        throw new Error(response.data.msg || 'Gagal membuat tugas Veo');
      }

      return response.data.data.taskId;
    } catch (error: any) {
      console.error("Veo Generate Error:", error);
      throw new Error(error.response?.data?.msg || error.message || 'Network error');
    }
  },

  /**
   * Generate video using Sora 2 / Sora 2 Pro
   */
  generateSora: async (apiKey: string, model: string, input: SoraRequest['input']): Promise<string> => {
    try {
      const response = await axios.post<KieTaskResponse>(
        `${API_BASE_URL}/jobs/createTask`,
        {
          model,
          input
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code !== 200 || !response.data.data?.taskId) {
        throw new Error(response.data.msg || `Gagal membuat tugas ${model}`);
      }

      return response.data.data.taskId;
    } catch (error: any) {
      console.error("Sora Generate Error:", error);
      throw new Error(error.response?.data?.msg || error.message || 'Network error');
    }
  },

  /**
   * Poll Task Status (Universal for Veo & Sora)
   */
  getTaskStatus: async (apiKey: string, taskId: string): Promise<KieRecordInfoResponse['data']> => {
    try {
      const response = await axios.get<KieRecordInfoResponse>(
        `${API_BASE_URL}/jobs/recordInfo`,
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

      // Normalisasi Data Result
      if (data.state === 'success' && typeof data.resultJson === 'string') {
        try {
          const parsed = JSON.parse(data.resultJson);
          data.resultJson = parsed;
          if (parsed.resultUrls) data.resultUrls = parsed.resultUrls;
          if (parsed.video_url) data.resultUrls = [parsed.video_url];
        } catch (e) {
          console.error("Failed to parse resultJson:", data.resultJson);
        }
      }

      return data;
    } catch (error: any) {
      console.error("Status Check Error:", error);
      throw new Error(error.response?.data?.msg || error.message || 'Network error');
    }
  }
};
