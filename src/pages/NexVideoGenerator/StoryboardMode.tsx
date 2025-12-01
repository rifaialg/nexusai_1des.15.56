import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Copy, ChevronDown, ChevronUp, 
  Video, Type, Mic, Clock, LayoutList, Sparkles, ArrowUp, ArrowDown
} from 'lucide-react';
import { HolographicCard } from '../../components/ui/HolographicCard';
import { NeonButton } from '../../components/ui/NeonButton';
import { GlowInput, GlowTextArea } from '../../components/ui/GlowInput';
import { GlossySelect, GlossyToggle } from '../../components/ui/GlossyControls';
import { Timeline } from '../../components/ui/Timeline';
import { StoryboardScene, StoryboardSettings, SceneRole, ShotType, CameraMove } from '../../types/storyboard';
import { cn } from '../../lib/utils';

interface StoryboardModeProps {
  onSettingsChange: (settings: any) => void;
}

const INITIAL_SCENE: StoryboardScene = {
  id: '1',
  role: 'Hook',
  duration: 3,
  shotType: 'Close-up',
  camera: 'Static',
  visual: '',
  caption: '',
  vo: '',
  emotion: 'Excited',
  productVisible: true,
  isExpanded: true
};

export const StoryboardMode: React.FC<StoryboardModeProps> = ({ onSettingsChange }) => {
  const [globalSettings, setGlobalSettings] = useState<StoryboardSettings>({
    title: '',
    productName: '',
    platform: 'TikTok',
    targetDuration: 15,
    aspectRatio: '9:16',
    style: 'Cinematic',
    mood: 'Warm',
    salesApproach: 'Soft Selling'
  });

  const [scenes, setScenes] = useState<StoryboardScene[]>([{ ...INITIAL_SCENE, id: Date.now().toString() }]);
  const totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0);

  useEffect(() => {
    const fullPrompt = buildStoryboardPrompt(globalSettings, scenes);
    onSettingsChange({
      mode: 'storyboard',
      model: 'sora-2-pro-storyboard-to-video', // Force Storyboard Model
      prompt: fullPrompt,
      storyboardData: { global: globalSettings, scenes },
      duration: globalSettings.targetDuration.toString(),
      aspectRatio: globalSettings.aspectRatio === '9:16' ? 'portrait' : 'landscape'
    });
  }, [globalSettings, scenes, onSettingsChange]);

  const updateScene = (id: string, updates: Partial<StoryboardScene>) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addScene = (role: SceneRole = 'Filler') => {
    const newScene = { ...INITIAL_SCENE, id: Date.now().toString(), role, duration: 3, isExpanded: true };
    setScenes(prev => [...prev, newScene]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      <div className="lg:col-span-7 space-y-6">
        <HolographicCard className="p-5 border-neon-purple/20">
          <div className="flex items-center gap-2 mb-4">
            <LayoutList className="w-5 h-5 text-neon-purple" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Global Settings</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <GlowInput placeholder="Campaign Name" value={globalSettings.title} onChange={(e) => setGlobalSettings({...globalSettings, title: e.target.value})} className="text-xs" />
            <GlowInput placeholder="Product Name" value={globalSettings.productName} onChange={(e) => setGlobalSettings({...globalSettings, productName: e.target.value})} className="text-xs" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <GlossySelect label="Platform" value={globalSettings.platform} onChange={(e) => setGlobalSettings({...globalSettings, platform: e.target.value})}>
              <option>TikTok</option>
              <option>Instagram Reels</option>
            </GlossySelect>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase">Duration (s)</label>
              <input type="number" value={globalSettings.targetDuration} onChange={(e) => setGlobalSettings({...globalSettings, targetDuration: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white outline-none focus:border-neon-teal" />
            </div>
            <GlossySelect label="Ratio" value={globalSettings.aspectRatio} onChange={(e) => setGlobalSettings({...globalSettings, aspectRatio: e.target.value})}>
              <option>9:16</option>
              <option>16:9</option>
            </GlossySelect>
          </div>
        </HolographicCard>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Scene List ({scenes.length})</h3>
            <span className={cn("text-xs font-mono font-bold", totalDuration > globalSettings.targetDuration ? "text-red-400" : "text-green-400")}>
              {totalDuration.toFixed(1)}s / {globalSettings.targetDuration}s
            </span>
          </div>

          {scenes.map((scene, index) => (
            <div key={scene.id} className="bg-surface border border-white/10 rounded-xl overflow-hidden transition-all hover:border-white/20">
              <div className="flex items-center gap-3 p-3 bg-white/5 cursor-pointer select-none" onClick={() => setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, isExpanded: !s.isExpanded } : s))}>
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">{index + 1}</div>
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">{scene.role}</span>
                  <span className="text-xs text-white/60 truncate max-w-[150px]">{scene.visual || 'No description'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded text-xs font-mono text-white/80"><Clock className="w-3 h-3" /> {scene.duration}s</div>
                  {scene.isExpanded ? <ChevronUp className="w-4 h-4 text-white/40"/> : <ChevronDown className="w-4 h-4 text-white/40"/>}
                </div>
              </div>

              {scene.isExpanded && (
                <div className="p-4 space-y-4 bg-black/20 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-4">
                    <GlossySelect label="Role" value={scene.role} onChange={(e) => updateScene(scene.id, { role: e.target.value as SceneRole })}>
                      {['Hook', 'Problem', 'Solution', 'CTA'].map(r => <option key={r} value={r}>{r}</option>)}
                    </GlossySelect>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/60">Duration (s)</label>
                      <input type="number" step="0.5" value={scene.duration} onChange={(e) => updateScene(scene.id, { duration: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white outline-none focus:border-neon-teal" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/60 flex items-center gap-1"><Video className="w-3 h-3"/> Visual Description</label>
                    <GlowTextArea value={scene.visual} onChange={(e) => updateScene(scene.id, { visual: e.target.value })} rows={2} className="text-xs" placeholder="What do we see?" />
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <NeonButton onClick={() => addScene('Filler')} className="flex-1 !py-2" variant="secondary"><Plus className="w-4 h-4" /> Add Scene</NeonButton>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <HolographicCard className="p-5 border-neon-blue/20">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-neon-blue" /> Timeline</h3>
          <Timeline scenes={scenes} totalDuration={totalDuration} targetDuration={globalSettings.targetDuration} />
        </HolographicCard>
      </div>
    </div>
  );
};

function buildStoryboardPrompt(settings: StoryboardSettings, scenes: StoryboardScene[]): string {
  let prompt = `Video Ad for ${settings.productName}. Style: ${settings.style}, Mood: ${settings.mood}. \n`;
  scenes.forEach((scene, idx) => {
    prompt += `Scene ${idx + 1} (${scene.role}): ${scene.visual}. `;
    if (scene.caption) prompt += `Text: "${scene.caption}". `;
    prompt += '\n';
  });
  return prompt;
}
