
import React, { useState, useRef, useEffect } from 'react';

interface ImageWorkspaceProps {
  originalImage: string | null;
  currentImage: string | null;
  isProcessing: boolean;
  onUploadClick?: () => void;
}

export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({ 
  originalImage, 
  currentImage, 
  isProcessing,
  onUploadClick
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset zoom when image changes
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [originalImage]);

  if (!originalImage) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-black p-10 text-center">
        <div className="w-24 h-24 bg-white/[0.03] rounded-3xl flex items-center justify-center mb-8 border border-white/5">
          <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <h2 className="text-xl font-bold text-white uppercase tracking-[0.3em] mb-3">AWAITING SOURCE</h2>
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] max-w-xs mb-10 leading-loose">
          Upload a fashion asset to initialize the 4K render engine
        </p>
        <button 
          onClick={onUploadClick}
          className="bg-white text-black px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-gray-100 transition-all active:scale-95 shadow-2xl"
        >
          UPLOAD ASSET
        </button>
      </div>
    );
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.0015;
    const newScale = Math.min(Math.max(scale - e.deltaY * zoomSpeed, 0.5), 8);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTranslate({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const displayImage = showOriginal ? originalImage : (currentImage || originalImage);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Visual Workspace Border matching screenshot */}
      <div className="absolute inset-4 sm:inset-10 border-2 border-[#0ea5e9]/40 rounded-sm pointer-events-none z-10"></div>

      {/* Draggable and Zoomable Image Container */}
      <div 
        className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`
        }}
      >
        <img 
          ref={imageRef}
          src={displayImage} 
          alt="Work in Progress" 
          className="max-w-[85%] max-h-[85%] object-contain select-none shadow-[0_0_150px_rgba(0,0,0,1)]"
          draggable={false}
        />
      </div>

      {/* Comparison Toggle */}
      {currentImage && (
        <div className="absolute top-12 right-12 z-20">
          <button
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onMouseLeave={() => setShowOriginal(false)}
            className="bg-black/60 backdrop-blur-xl border border-white/10 text-[9px] font-bold text-white/80 uppercase tracking-widest px-6 py-3 rounded-xl active:scale-95 transition-all hover:bg-black/80 hover:text-white"
          >
            HOLD FOR ORIGINAL
          </button>
        </div>
      )}

      {/* Rendering Badge */}
      <div className="absolute bottom-12 left-12 z-20 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/5 px-6 py-3 rounded-full flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse"></div>
           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">REALTIME 4K RENDER ENGINE</span>
        </div>
      </div>

      {/* Zoom Controls Overlay (Informational) */}
      <div className="absolute bottom-12 right-12 z-20 pointer-events-none opacity-40">
        <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">WHEEL TO ZOOM • DRAG TO PAN</p>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 border-[3px] border-[#0ea5e9]/10 border-t-[#0ea5e9] rounded-full animate-spin mb-8"></div>
          <p className="text-white font-bold uppercase tracking-[0.4em] text-[10px] animate-pulse">RECONSTRUCTING SCENE</p>
          <p className="text-gray-500 text-[9px] uppercase tracking-[0.2em] mt-3">Synthesizing 4K Neural Detail</p>
        </div>
      )}
    </div>
  );
};
