
import React from 'react';
import { ColorPreset } from '../types';

interface ColorPickerProps {
  selectedColor: string;
  savedColors: string[];
  onChange: (color: string) => void;
  onSaveColor: (color: string) => void;
  onDeleteColor: (color: string) => void;
}

declare global {
  interface Window {
    EyeDropper: any;
  }
}

const PRESETS: ColorPreset[] = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Light Blue', hex: '#0ea5e9' },
  { name: 'Dark Blue', hex: '#1e3a8a' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Cyan', hex: '#22d3ee' },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  selectedColor, 
  savedColors,
  onChange, 
  onSaveColor,
  onDeleteColor 
}) => {
  
  const handleEyeDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        onChange(result.sRGBHex);
      } catch (e) {
        console.log('EyeDropper cancelled');
      }
    } else {
      alert('EyeDropper não suportado neste navegador.');
    }
  };

  const isColorSaved = savedColors.some(c => c.toLowerCase() === selectedColor.toLowerCase());

  return (
    <div className="space-y-6">
      {/* PRESET COLORS */}
      <div className="space-y-3">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
          CORES PADRÃO
        </label>
        <div className="flex flex-wrap gap-2.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.hex}
              onClick={() => onChange(preset.hex)}
              className={`w-5 h-5 rounded-full transition-all duration-300 border ${
                selectedColor.toLowerCase() === preset.hex.toLowerCase() 
                  ? 'border-white ring-2 ring-[#0ea5e9] ring-offset-2 ring-offset-black scale-110' 
                  : 'border-white/10 hover:scale-110 hover:border-white/30'
              }`}
              style={{ backgroundColor: preset.hex }}
              title={preset.name}
            />
          ))}
        </div>
      </div>

      {/* SAVED COLORS */}
      {savedColors.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
            CORES SALVAS
          </label>
          <div className="flex flex-wrap gap-2.5">
            {savedColors.map((color) => (
              <div key={color} className="relative group">
                <button
                  onClick={() => onChange(color)}
                  className={`w-5 h-5 rounded-full transition-all duration-300 border ${
                    selectedColor.toLowerCase() === color.toLowerCase() 
                      ? 'border-white ring-2 ring-[#0ea5e9] ring-offset-2 ring-offset-black scale-110' 
                      : 'border-white/10 hover:scale-110 hover:border-white/30'
                  }`}
                  style={{ backgroundColor: color }}
                />
                <button 
                  onClick={() => onDeleteColor(color)}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-black"
                >
                  <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOM COLOR */}
      <div className="space-y-3">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
          COR PERSONALIZADA (HEX)
        </label>
        
        {/* EyeDropper White Button */}
        <button
          onClick={handleEyeDropper}
          className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-gray-100 text-black text-[10px] font-black uppercase tracking-[0.15em] py-3 rounded-2xl transition-all active:scale-[0.98] shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          CAPTURA DE COR
        </button>

        {/* Hex Input Area */}
        <div className="flex items-center gap-3 bg-black p-3 rounded-2xl border border-[#1a1a1a]">
          <div className="flex-1 flex items-center font-mono text-[11px] font-bold px-1">
            <span className="text-gray-700 mr-2">#</span>
            <input
              type="text"
              value={selectedColor.replace('#', '').toUpperCase()}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
                if (val.length <= 6) onChange(`#${val}`);
              }}
              className="bg-transparent text-white uppercase focus:outline-none w-full tracking-[0.1em]"
              placeholder="000000"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {/* Save Button */}
            <button
              onClick={() => onSaveColor(selectedColor)}
              disabled={isColorSaved}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isColorSaved 
                ? 'text-gray-700 cursor-not-allowed' 
                : 'text-[#0ea5e9] hover:bg-[#0ea5e9]/10'
              }`}
              title="Salvar esta cor"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Color Preview/Input */}
            <div className="relative group">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 rounded-lg border-none p-0 cursor-pointer bg-transparent absolute inset-0 opacity-0 z-10"
              />
              <div 
                className="w-8 h-8 rounded-lg border border-white/20 shadow-inner group-hover:scale-105 transition-transform"
                style={{ backgroundColor: selectedColor }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
