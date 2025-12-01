export type SceneRole = 'Hook' | 'Problem' | 'Agitation' | 'Solution' | 'Demo' | 'Proof' | 'Before' | 'After' | 'CTA' | 'Filler';

export type ShotType = 'Close-up' | 'Medium shot' | 'Wide shot' | 'Extreme close-up' | 'Over-the-shoulder' | 'POV' | 'Product-only';

export type CameraMove = 'Static' | 'Slow pan' | 'Slow zoom-in' | 'Zoom-out' | 'Tracking/Dolly' | 'Handheld';

export interface StoryboardScene {
  id: string;
  role: SceneRole;
  duration: number;
  shotType: ShotType;
  camera: CameraMove;
  visual: string;
  caption: string;
  vo: string;
  emotion: string;
  productVisible: boolean;
  productPlacement?: string;
  isExpanded?: boolean;
}

export interface StoryboardSettings {
  title: string;
  productName: string;
  platform: string;
  targetDuration: number;
  aspectRatio: string;
  style: string;
  mood: string;
  salesApproach: string;
}
