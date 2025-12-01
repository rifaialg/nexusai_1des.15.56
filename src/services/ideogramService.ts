import axios from 'axios';
import { IdeogramInput, IdeogramTaskResponse, IdeogramStatusResponse } from '../types/ideogram';

const API_BASE_URL = 'https://api.kie.ai/api/v1/jobs';

export const ideogramService = {
  /**
   * Membuat tugas generasi gambar Ideogram v3
   */
  createTask: async (apiKey: string, input: IdeogramInput): Promise<string> => {
    try {
      const response = await axios.post<IdeogramTaskResponse>(
        `${API_BASE_URL}/createTask`,
        {
          model: 'ideogram/v3-text-to-image', // Update Model Name
          input: {
            prompt: input.prompt,
            image_size: input.image_size,
            style: input.style,
            rendering_speed: input.rendering_speed,
            expand_prompt: input.expand_prompt,
            num_images: "1",
            negative_prompt: input.negative_prompt || ""
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
        throw new Error(response.data.msg || 'Gagal membuat tugas gambar');
      }

      return response.data.data.taskId;
    } catch (error: any) {
      console.error("Ideogram Create Task Error:", error);
      const errorMsg = error.response?.data?.msg || error.message || 'Network error';
      throw new Error(errorMsg);
    }
  },

  /**
   * Mengecek status tugas
   */
  getTaskStatus: async (apiKey: string, taskId: string): Promise<IdeogramStatusResponse['data']> => {
    try {
      const response = await axios.get<IdeogramStatusResponse>(
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

      // Parse resultJson jika berupa string (Kie AI sering mengembalikan stringified JSON)
      if (data.state === 'success' && typeof data.resultJson === 'string') {
        try {
          const parsed = JSON.parse(data.resultJson);
          // Normalize resultUrls location
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
      console.error("Ideogram Status Error:", error);
      throw error;
    }
  }
};
