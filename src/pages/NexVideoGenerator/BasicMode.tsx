import React, { useState, useEffect, useMemo } from 'react';
import { 
  VideoSettings, GenerationType, ImageUploadState, EstimationData,
  ImageScene 
} from '../../types/basicMode';
import { ImageUploadSection } from '../../components/nexvideo/ImageUploadSection';
import { MultiImageSceneGenerator } from '../../components/nexvideo/MultiImageSceneGenerator';
import { Input } from '../../components/ui/Input';
import { EnhancedTextArea } from '../../components/ui/EnhancedTextArea'; 
import { GlossySelect } from '../../components/ui/GlossyControls';
import { LocationSelector } from '../../components/nexvideo/LocationSelector';
import { VideoObjectiveSelector } from '../../components/nexvideo/VideoObjectiveSelector';
import { MultiSceneGenerator } from '../../components/nexvideo/MultiSceneGenerator'; 
import { 
  Type, Image as ImageIcon, Clock, Coins, 
  AlertCircle, Layers
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface BasicModeProps {
  onSettingsChange: (settings: any) => void;
}

export const BasicMode: React.FC<BasicModeProps> = ({ onSettingsChange }) => {
  // --- STATE MANAGEMENT ---
  const [genType, setGenType] = useState<GenerationType>('text-to-video');
  const [isMultiScene, setIsMultiScene] = useState(false); 
  
  // Single/Dual Image State
  const [imageState, setImageState] = useState<ImageUploadState>({
    mode: 'single',
    slots: {
      slotA: { id: 'a', file: null, previewUrl: null, label: 'Primary' },
      slotB: { id: 'b', file: null, previewUrl: null, label: 'Secondary' }
    }
  });

  // Multi-Image Scene State
  const [imageScenes, setImageScenes] = useState<ImageScene[]>([]);

  const [settings, setSettings] = useState<VideoSettings>({
    productName: '',
    brand: '',
    category: 'Skincare',
    objective: 'Awareness',
    platform: 'TikTok',
    aspectRatio: '9:16',
    duration: '10',
    description: '',
    model: 'sora-2-text-to-video',
    resolution: '1080p',
    isSequel: false,
    autoBlend: true,
    location: '',
    videoObjective: 'general',
    promoType: 'soft_selling',
    // Clean Mode, Dynamic Motion, CTA, Placement removed as they are now system-enforced
  });

  // --- ESTIMATION LOGIC ---
  const estimation = useMemo<EstimationData>(() => {
    let multiplier = isMultiScene ? (genType === 'image-to-video' ? Math.max(imageScenes.length, 1) : 3) : 1; 
    let baseTime = parseInt(settings.duration) * 8 * multiplier;
    let baseCost = parseInt(settings.duration) * 10 * multiplier;

    if (settings.resolution === '4K') {
      baseTime *= 1.5;
      baseCost *= 2;
    } else if (settings.resolution === '720p') {
      baseTime *= 0.8;
      baseCost *= 0.8;
    }

    return {
      time: Math.round(baseTime),
      cost: Math.round(baseCost)
    };
  }, [settings.duration, settings.resolution, settings.model, isMultiScene, genType, imageScenes.length]);

  // --- EFFECTS ---
  useEffect(() => {
    const isCurrentText = settings.model.includes('text-to-video');
    const isCurrentImage = settings.model.includes('image-to-video');

    if (genType === 'text-to-video' && !isCurrentText) {
      setSettings(prev => ({ ...prev, model: 'sora-2-text-to-video' }));
    } else if (genType === 'image-to-video' && !isCurrentImage) {
      setSettings(prev => ({ ...prev, model: 'sora-2-image-to-video' }));
    }
  }, [genType, settings.model]);

  useEffect(() => {
    const assets = [];
    if (genType === 'image-to-video') {
      if (isMultiScene) {
        if (imageScenes.length > 0 && imageScenes[0].previewUrl) {
            assets.push(imageScenes[0].previewUrl);
        }
      } else {
        if (imageState.slots.slotA.previewUrl) assets.push(imageState.slots.slotA.previewUrl); 
        if (imageState.slots.slotB.previewUrl) assets.push(imageState.slots.slotB.previewUrl);
      }
    }

    onSettingsChange({
      ...settings,
      mode: 'basic',
      genType,
      assets,
      estimation,
      isMultiScene,
      imageScenes: isMultiScene && genType === 'image-to-video' ? imageScenes : undefined,
    });
  }, [settings, genType, imageState, estimation, onSettingsChange, isMultiScene, imageScenes]);

  // --- HANDLERS ---
  const handleChange = (field: keyof VideoSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (genType === 'image-to-video') {
      if (isMultiScene) {
        return imageScenes.length > 0 && !!imageScenes[0].file;
      } else {
        if (!imageState.slots.slotA.file) return false;
      }
    }
    if (!settings.description && !settings.location && genType === 'text-to-video' && !isMultiScene) return false;
    return true;
  };

  const isValid = validateForm();

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* 1. Product Info */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-px bg-white/20"/> Identitas Produk
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Nama Produk" 
            placeholder="Contoh: Glow Serum" 
            value={settings.productName}
            onChange={(e) => handleChange('productName', e.target.value)}
          />
          <Input 
            label="Nama Brand" 
            placeholder="Contoh: Nexus Beauty"
            value={settings.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
          />
        </div>
      </section>

      {/* 2. Generation Type */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
          <span className="w-4 h-px bg-white/20"/> Metode Generasi
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setGenType('text-to-video')}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group overflow-hidden",
              genType === 'text-to-video' 
                ? "border-neon-purple bg-neon-purple/5 shadow-[0_0_20px_rgba(124,58,237,0.2)]" 
                : "border-white/10 bg-[#151520] hover:border-white/30 opacity-70 hover:opacity-100"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              genType === 'text-to-video' ? "bg-neon-purple/20 text-neon-purple" : "bg-white/5 text-white/40"
            )}>
              <Type className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-white">Text to Video</span>
          </button>

          <button
            onClick={() => setGenType('image-to-video')}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group overflow-hidden",
              genType === 'image-to-video' 
                ? "border-neon-blue bg-neon-blue/5 shadow-[0_0_20px_rgba(6,182,212,0.2)]" 
                : "border-white/10 bg-[#151520] hover:border-white/30 opacity-70 hover:opacity-100"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              genType === 'image-to-video' ? "bg-neon-blue/20 text-neon-blue" : "bg-white/5 text-white/40"
            )}>
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-white">Image to Video</span>
          </button>
        </div>

        {/* Image Upload Area (Conditional) */}
        {genType === 'image-to-video' && !isMultiScene && (
          <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <ImageUploadSection 
              uploadState={imageState} 
              onStateChange={setImageState} 
            />
          </div>
        )}

        {/* Toggle Multi-Scene */}
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 mt-4">
            <button
              onClick={() => setIsMultiScene(false)}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                !isMultiScene ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
              )}
            >
              <Type className="w-3 h-3" /> Single Shot
            </button>
            <button
              onClick={() => setIsMultiScene(true)}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                isMultiScene ? "bg-neon-purple text-white shadow-glow-purple" : "text-white/40 hover:text-white"
              )}
            >
              <Layers className="w-3 h-3" /> Multi-Scene Story
            </button>
        </div>
      </section>

      {/* 3. Video Settings */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
          <span className="w-4 h-px bg-white/20"/> Configuration
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <GlossySelect 
            label="AI Model"
            value={settings.model}
            onChange={(e) => handleChange('model', e.target.value)}
            className="font-bold text-neon-teal"
          >
            {genType === 'text-to-video' ? (
              <>
                <option value="sora-2-text-to-video">Sora 2 (Standard)</option>
                <option value="grok-imagine/text-to-video">Grok Imagine (New)</option>
              </>
            ) : (
              <>
                <option value="sora-2-image-to-video">Sora 2 (Image Motion)</option>
                <option value="grok-imagine/image-to-video">Grok Imagine (Image Motion)</option>
              </>
            )}
          </GlossySelect>

          <GlossySelect 
            label="Aspect Ratio"
            value={settings.aspectRatio}
            onChange={(e) => handleChange('aspectRatio', e.target.value)}
          >
            <option value="9:16">9:16 (Vertical)</option>
            <option value="16:9">16:9 (Horizontal)</option>
            <option value="1:1">1:1 (Square)</option>
          </GlossySelect>

          <GlossySelect 
            label="Duration"
            value={settings.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
          >
            <option value="5">5 Seconds</option>
            <option value="10">10 Seconds</option>
            <option value="15">15 Seconds</option>
          </GlossySelect>

          <GlossySelect 
            label="Resolution"
            value={settings.resolution}
            onChange={(e) => handleChange('resolution', e.target.value)}
          >
            <option value="720p">720p (HD)</option>
            <option value="1080p">1080p (FHD)</option>
          </GlossySelect>
        </div>
      </section>

      {/* 4. Description & Context (MAIN LOGIC) */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-px bg-white/20"/> {genType === 'image-to-video' ? 'Motion Prompt' : 'Video Description'}
          </h3>
          
          <LocationSelector 
            selectedLocation={settings.location}
            onSelect={(loc) => handleChange('location', loc)}
          />
        </div>

        {/* Video Objective Selector */}
        <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
          <VideoObjectiveSelector 
            selectedObjective={settings.videoObjective || 'general'}
            selectedPromoType={settings.promoType}
            onObjectiveChange={(obj) => handleChange('videoObjective', obj)}
            onPromoTypeChange={(type) => handleChange('promoType', type)}
          />
        </div>

        {/* --- CONDITIONAL INPUT RENDERING --- */}
        
        {/* CASE 1: IMAGE-TO-VIDEO MULTI-SCENE */}
        {genType === 'image-to-video' && isMultiScene ? (
           <MultiImageSceneGenerator 
              onScenesChange={setImageScenes}
              locationContext={settings.location}
              objectiveContext={settings.videoObjective}
              promoTypeContext={settings.promoType}
              brandContext={settings.brand}
              productContext={settings.productName}
           />
        ) : 
        
        /* CASE 2: TEXT-TO-VIDEO MULTI-SCENE */
        genType === 'text-to-video' && isMultiScene ? (
          <MultiSceneGenerator 
            onPromptsChange={(prompts) => {
              handleChange('description', prompts.join('\n\n--- NEXT SCENE ---\n\n'));
            }}
            locationContext={settings.location}
            objectiveContext={settings.videoObjective}
            promoTypeContext={settings.promoType}
            brandContext={settings.brand}
            productContext={settings.productName}
          />
        ) : 
        
        /* CASE 3: SINGLE SHOT (TEXT OR IMAGE) */
        (
          <EnhancedTextArea 
            placeholder={genType === 'image-to-video' 
              ? "Deskripsikan bagaimana gambar harus bergerak (contoh: Kamera zoom in, subjek tersenyum)..." 
              : "Deskripsikan adegan, karakter, dan aksi secara detail..."}
            value={settings.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="min-h-[120px] text-sm"
            label="Prompt"
            // Passing contexts for AI Enhancement
            locationContext={settings.location} 
            objectiveContext={settings.videoObjective}
            promoTypeContext={settings.promoType}
            brandContext={settings.brand}
            productContext={settings.productName}
            
            onEnhance={(newPrompt) => handleChange('description', newPrompt)}
          />
        )}
      </section>

      {/* 5. Estimation Panel */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Clock className="w-4 h-4 text-neon-blue" />
            <span>~{estimation.time}s</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span>{estimation.cost} Credits</span>
          </div>
        </div>
        <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">
          {settings.model.replace(/-/g, ' ')}
        </div>
      </div>

      <div className="pt-2">
        {!isValid && (
          <div className="mb-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
            <AlertCircle className="w-4 h-4" />
            {genType === 'image-to-video' 
              ? "Mohon upload gambar yang diperlukan." 
              : "Mohon isi deskripsi atau pilih lokasi."}
          </div>
        )}
      </div>
    </div>
  );
};
