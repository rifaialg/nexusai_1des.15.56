import React, { useState, useEffect } from 'react';
import { 
  User, Palette, Type, Layers, Sparkles, Video, Image as ImageIcon, Film
} from 'lucide-react';
import { HolographicCard } from '../../components/ui/HolographicCard';
import { GlossySelect } from '../../components/ui/GlossyControls';
import { GlowInput } from '../../components/ui/GlowInput';
import { EnhancedTextArea } from '../../components/ui/EnhancedTextArea'; // Updated Import
import { cn } from '../../lib/utils';

interface ProModeProps {
  onSettingsChange: (settings: any) => void;
}

type ProModel = 'sora-2-pro-text-to-video' | 'sora-2-pro-image-to-video' | 'veo-3.1';

export const ProMode: React.FC<ProModeProps> = ({ onSettingsChange }) => {
  const [formData, setFormData] = useState({
    videoType: 'organic',
    gender: 'female',
    ageRange: 'teen',
    focusArea: 'face',
    ethnicity: 'asian',
    hijab: 'no',
    emotion: 'happy',
    showBeforeAfter: false,
    beforeCondition: '',
    afterResult: '',
    salesApproach: 'soft_selling',
    category: 'Skincare',
    videoStyle: 'cinematic',
    primaryColor: '#7C3AED',
    sceneMood: 'warm',
    location: 'indoor_bedroom',
    lighting: 'golden_hour',
    usp: '',
    cta: '',
    language: 'indonesia',
    textStyle: 'subtitles',
    
    // AI Settings
    model: 'sora-2-pro-text-to-video' as ProModel,
    duration: '10',
    resolution: '1080p'
  });

  useEffect(() => {
    const builtPrompt = buildProPrompt(formData);
    onSettingsChange({
      ...formData,
      prompt: builtPrompt
    });
  }, [formData, onSettingsChange]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper untuk komponen selektor model
  const ModelCard = ({ 
    id, 
    label, 
    subLabel, 
    icon: Icon 
  }: { 
    id: ProModel, 
    label: string, 
    subLabel: string, 
    icon: any 
  }) => (
    <button
      onClick={() => handleChange('model', id)}
      className={cn(
        "relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 group overflow-hidden min-h-[100px]",
        formData.model === id
          ? "bg-neon-teal/10 border-neon-teal text-white shadow-[0_0_15px_rgba(0,243,255,0.2)]" 
          : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-transform duration-300",
        formData.model === id ? "bg-neon-teal/20 text-neon-teal scale-110" : "bg-white/10 group-hover:scale-110"
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-xs font-bold">{label}</span>
      <span className="text-[10px] opacity-60 mt-1">{subLabel}</span>
      
      {/* Active Indicator */}
      {formData.model === id && (
        <div className="absolute inset-0 border-2 border-neon-teal rounded-xl pointer-events-none" />
      )}
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Model Selection - Refactored to Visual Selector */}
      <HolographicCard className="p-5 border-neon-teal/20 bg-neon-teal/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neon-teal" /> AI Engine (Pro)
          </h3>
          <span className="text-[10px] bg-neon-teal/20 text-neon-teal px-2 py-0.5 rounded border border-neon-teal/30 font-bold">
            High Quality
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <ModelCard 
            id="sora-2-pro-text-to-video" 
            label="Sora 2 Pro" 
            subLabel="Text to Video"
            icon={Type}
          />
          <ModelCard 
            id="sora-2-pro-image-to-video" 
            label="Sora 2 Pro" 
            subLabel="Image Motion"
            icon={ImageIcon}
          />
          <ModelCard 
            id="veo-3.1" 
            label="Veo 3.1" 
            subLabel="Realistic 1080p"
            icon={Film}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
          <GlossySelect 
            label="Duration"
            value={formData.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
          >
            <option value="5">5s (Short)</option>
            <option value="10">10s (Standard)</option>
            <option value="15">15s (Extended)</option>
          </GlossySelect>
          
          <GlossySelect 
            label="Resolution"
            value={formData.resolution}
            onChange={(e) => handleChange('resolution', e.target.value)}
          >
            <option value="1080p">1080p (FHD)</option>
            <option value="4K">4K (UHD)</option>
          </GlossySelect>
        </div>
      </HolographicCard>

      {/* A. Video Type */}
      <HolographicCard className="p-5 border-neon-purple/20">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-neon-purple" /> Video Type
        </h3>
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
          {['organic', 'ads_compliant', 'ads_unrestricted'].map(type => (
            <button
              key={type}
              onClick={() => handleChange('videoType', type)}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize",
                formData.videoType === type 
                  ? "bg-neon-purple text-white shadow-lg" 
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </HolographicCard>

      {/* B. Model & Persona */}
      <HolographicCard className="p-5 border-neon-blue/20">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-neon-blue" /> Model & Persona
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <GlossySelect label="Gender" value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="mixed">Mixed</option>
            <option value="none">No Human</option>
          </GlossySelect>
          <GlossySelect label="Age" value={formData.ageRange} onChange={(e) => handleChange('ageRange', e.target.value)}>
            <option value="teen">Teenager</option>
            <option value="young_adult">Young Adult</option>
            <option value="adult">Adult</option>
          </GlossySelect>
        </div>
      </HolographicCard>

      {/* F. Visuals */}
      <HolographicCard className="p-5 border-neon-teal/20">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-neon-teal" /> Visuals & Mood
        </h3>
        <div className="grid grid-cols-2 gap-4">
           <GlossySelect label="Lighting" value={formData.lighting} onChange={(e) => handleChange('lighting', e.target.value)}>
             <option value="soft_natural">Soft Natural</option>
             <option value="golden_hour">Golden Hour</option>
             <option value="studio">Studio</option>
             <option value="cinematic">Cinematic</option>
           </GlossySelect>
           <GlossySelect label="Location" value={formData.location} onChange={(e) => handleChange('location', e.target.value)}>
             <option value="indoor_bedroom">Bedroom</option>
             <option value="living_room">Living Room</option>
             <option value="outdoor_park">Park</option>
             <option value="cafe">Cafe</option>
           </GlossySelect>
        </div>
      </HolographicCard>

      {/* G. Script */}
      <HolographicCard className="p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Type className="w-4 h-4 text-pink-400" /> Script & Message
        </h3>
        <div className="space-y-4">
          <EnhancedTextArea 
            placeholder="Key Message / USP (Use Magic Wand to Expand)"
            value={formData.usp}
            onChange={(e) => handleChange('usp', e.target.value)}
            rows={2}
            className="text-xs"
            label="USP"
          />
          <GlowInput 
            placeholder="Call to Action"
            value={formData.cta}
            onChange={(e) => handleChange('cta', e.target.value)}
            className="text-xs"
          />
        </div>
      </HolographicCard>

    </div>
  );
};

function buildProPrompt(data: any): string {
  const parts = [];
  parts.push(`${data.videoStyle} video for ${data.category} product.`);
  if (data.gender !== 'none') {
    let persona = `Featuring a ${data.ageRange} ${data.ethnicity} ${data.gender}`;
    if (data.hijab === 'yes') persona += " wearing hijab";
    persona += `, emotion: ${data.emotion}.`;
    parts.push(persona);
  }
  parts.push(`Setting: ${data.location.replace('_', ' ')}, lighting: ${data.lighting.replace('_', ' ')}.`);
  if (data.usp) parts.push(`Highlight: ${data.usp}.`);
  if (data.cta) parts.push(`CTA: ${data.cta}.`);
  return parts.join(' ');
}
