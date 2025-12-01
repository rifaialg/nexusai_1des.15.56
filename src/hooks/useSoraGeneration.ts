import { useState, useRef, useCallback, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import { soraService } from '../services/soraService';
import { KieSoraInput, SoraGenerationState } from '../types/sora';

const POLLING_INTERVAL = 4000; // 4 seconds

export const useSoraGeneration = () => {
  const { getKey, toast } = useAI();
  const [state, setState] = useState<SoraGenerationState>({
    status: 'idle',
    taskId: null,
    resultUrl: null,
    progress: 0,
    error: null
  });

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const pollStatus = useCallback(async (taskId: string, apiKey: string) => {
    try {
      const data = await soraService.getTaskStatus(apiKey, taskId);
      
      console.log('Sora Polling Status:', data.state, data);

      if (data.state === 'success') {
        stopPolling();
        // Extract URL from resultUrls array or resultJson
        const videoUrl = data.resultUrls?.[0] || data.resultJson?.video_url;
        
        if (videoUrl) {
          setState(prev => ({
            ...prev,
            status: 'success',
            resultUrl: videoUrl,
            progress: 100
          }));
          toast.show('Video successfully generated!', 'success');
        } else {
          throw new Error('Video generated but no URL found in response');
        }
      } else if (data.state === 'fail') {
        stopPolling();
        const errorMsg = data.failReason || 'Generation failed on server side.';
        setState(prev => ({ ...prev, status: 'error', error: errorMsg }));
        toast.show(errorMsg, 'error');
      } else {
        // Still waiting or processing
        setState(prev => ({
          ...prev,
          status: 'polling',
          progress: data.progress || (data.state === 'processing' ? 50 : 10)
        }));
      }
    } catch (error: any) {
      // Don't stop polling immediately on network blips, but maybe count errors?
      // For now, we'll just log and keep trying unless it's a fatal auth error
      console.error('Polling error:', error);
      if (error.message.includes('401') || error.message.includes('403')) {
        stopPolling();
        setState(prev => ({ ...prev, status: 'error', error: 'Authentication failed during polling.' }));
      }
    }
  }, [stopPolling, toast]);

  const generateVideo = useCallback(async (input: KieSoraInput) => {
    const apiKey = getKey('sora');
    if (!apiKey) {
      const msg = 'SORA API Key is missing. Please configure it in Settings.';
      toast.show(msg, 'error');
      setState(prev => ({ ...prev, status: 'error', error: msg }));
      return;
    }

    // Reset State
    setState({
      status: 'creating',
      taskId: null,
      resultUrl: null,
      progress: 0,
      error: null
    });

    try {
      // 1. Create Task
      const taskId = await soraService.createTask(apiKey, input);
      
      setState(prev => ({
        ...prev,
        status: 'polling',
        taskId: taskId,
        progress: 5
      }));

      // 2. Start Polling
      pollingRef.current = setInterval(() => {
        pollStatus(taskId, apiKey);
      }, POLLING_INTERVAL);

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message
      }));
      toast.show(error.message, 'error');
    }
  }, [getKey, pollStatus, toast]);

  return {
    ...state,
    generateVideo,
    reset: () => setState({ status: 'idle', taskId: null, resultUrl: null, progress: 0, error: null })
  };
};
