export interface EditHistory {
  original: string;
  current: string;
  history: string[]; // Stack of base64 images
  currentIndex: number;
}

export interface ProcessingState {
  isLoading: boolean;
  statusMessage: string;
  error: string | null;
}

export interface ColorPreset {
  name: string;
  hex: string;
}

export enum ToolMode {
  RECOLOR = 'RECOLOR',
  REMOVE_BG = 'REMOVE_BG',
  CUSTOM = 'CUSTOM',
  VIDEO = 'VIDEO'
}