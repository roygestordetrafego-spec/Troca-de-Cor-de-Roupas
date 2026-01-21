import React, { useState, useRef, useEffect } from 'react';

interface PrintLayoutProps {
  originalImage: string | null;
  currentImage: string | null;
  targetObject: string;
  targetColor: string;
  onClose: () => void;
}

interface DraggableItem {
  id: string;
  x: number;
  y: number;
  scale: number;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({
  originalImage,
  currentImage,
  targetObject,
  targetColor,
  onClose
}) => {
  // Initial positions roughly laid out on an A4 (approx 794px width)
  const [items, setItems] = useState<Record<string, DraggableItem>>({
    original: { id: 'original', x: 50, y: 120, scale: 1 },
    generated: { id: 'generated', x: 400, y: 120, scale: 1 },
    details: { id: 'details', x: 50, y: 500, scale: 1 }, // Scale unused for details, but kept for type consistency
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveId(id);
    const item = items[id];
    setDragOffset({
      x: e.clientX - item.x,
      y: e.clientY - item.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeId && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Calculate new position relative to container
      // We subtract container.left/top because position is absolute inside the relative container
      // However, since we are calculating delta based on clientX, we just need to subtract the offset
      
      // Simpler approach: 
      // newX = currentMouseX - dragOffsetX
      // We don't strictly need container bounds unless we want to constrain it, 
      // but for free-form, simple subtraction works if we account for the initial offset.
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      setItems(prev => ({
        ...prev,
        [activeId]: { ...prev[activeId], x: newX, y: newY }
      }));
    }
  };

  const handleMouseUp = () => {
    setActiveId(null);
  };

  const handleScaleChange = (delta: number) => {
    if (activeId && (activeId === 'original' || activeId === 'generated')) {
      setItems(prev => ({
        ...prev,
        [activeId]: { 
          ...prev[activeId], 
          scale: Math.max(0.2, Math.min(3, prev[activeId].scale + delta)) 
        }
      }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
      {/* Toolbar - Hidden when printing */}
      <div className="h-16 bg-[#121212] border-b border-[#222] flex items-center justify-between px-6 shrink-0 no-print">
        <h2 className="text-white font-semibold">Tech Pack View</h2>
        
        <div className="flex items-center gap-4">
           {activeId && (activeId === 'original' || activeId === 'generated') && (
             <div className="flex items-center gap-2 bg-[#2a2a2a] px-3 py-1.5 rounded-lg mr-4">
               <span className="text-xs text-gray-400">Resize Selected:</span>
               <button 
                onClick={() => handleScaleChange(-0.1)}
                className="w-6 h-6 flex items-center justify-center bg-[#3a3a3a] rounded hover:bg-[#4a4a4a]"
               >-</button>
               <button 
                onClick={() => handleScaleChange(0.1)}
                className="w-6 h-6 flex items-center justify-center bg-[#3a3a3a] rounded hover:bg-[#4a4a4a]"
               >+</button>
             </div>
           )}

           <button 
             onClick={handlePrint}
             className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
             Print
           </button>
           <button 
             onClick={onClose}
             className="text-gray-400 hover:text-white px-4 py-2"
           >
             Close
           </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        className="flex-1 overflow-auto bg-gray-900 p-8 flex justify-center cursor-default"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* A4 Container - 210mm x 297mm approx 794px x 1123px at 96dpi */}
        <div 
          id="print-container"
          ref={containerRef}
          className="bg-white text-black relative shadow-2xl overflow-hidden print:shadow-none print:m-0 print:w-full print:h-full"
          style={{ width: '794px', height: '1123px', minWidth: '794px', minHeight: '1123px' }}
        >
          {/* Header (Fixed) */}
          <div className="absolute top-0 left-0 w-full h-24 border-b-2 border-black p-6 flex items-center justify-between pointer-events-none select-none">
             <div>
               <h1 className="text-2xl font-bold uppercase tracking-widest">Donna Carmo</h1>
               <p className="text-sm text-gray-500">Design Specification & Tech Pack</p>
             </div>
             <div className="text-right">
               <p className="text-xs font-mono text-gray-400">DATE: {new Date().toLocaleDateString()}</p>
               <p className="text-xs font-mono text-gray-400">REF: {Math.floor(Math.random() * 10000)}</p>
             </div>
          </div>

          {/* Original Image Draggable */}
          {originalImage && (
            <div 
              className={`absolute cursor-move group ${activeId === 'original' ? 'z-20 ring-2 ring-brand-500 ring-offset-2' : 'z-10'}`}
              style={{ 
                left: items.original.x, 
                top: items.original.y,
                transform: `scale(${items.original.scale})`,
                transformOrigin: 'top left'
              }}
              onMouseDown={(e) => handleMouseDown(e, 'original')}
            >
              <div className="bg-gray-100 p-2 shadow-sm border border-gray-200">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 select-none text-center">Reference</p>
                <img 
                  src={originalImage} 
                  alt="Original" 
                  className="max-w-[300px] pointer-events-none select-none block" 
                />
              </div>
            </div>
          )}

          {/* Generated Image Draggable */}
          {currentImage && (
             <div 
             className={`absolute cursor-move group ${activeId === 'generated' ? 'z-20 ring-2 ring-brand-500 ring-offset-2' : 'z-10'}`}
             style={{ 
               left: items.generated.x, 
               top: items.generated.y,
               transform: `scale(${items.generated.scale})`,
               transformOrigin: 'top left'
             }}
             onMouseDown={(e) => handleMouseDown(e, 'generated')}
           >
             <div className="bg-white p-2 shadow-sm border border-gray-200">
                <p className="text-[10px] uppercase font-bold text-brand-600 mb-1 select-none text-center">AI Sketch / Render</p>
               <img 
                 src={currentImage} 
                 alt="Generated" 
                 className="max-w-[300px] pointer-events-none select-none block" 
               />
             </div>
           </div>
          )}

          {/* Details Draggable */}
          <div 
             className={`absolute cursor-move ${activeId === 'details' ? 'z-20 ring-1 ring-brand-500' : 'z-10'}`}
             style={{ left: items.details.x, top: items.details.y }}
             onMouseDown={(e) => handleMouseDown(e, 'details')}
          >
            <div className="w-80 border-2 border-black bg-white p-4">
              <h3 className="font-bold border-b border-black pb-2 mb-3 uppercase text-sm">Specification Details</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 font-bold">TARGET OBJECT</p>
                  <p className="font-medium capitalize">{targetObject || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 font-bold">COLOR CODE</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-4 h-4 border border-gray-300 shadow-sm"
                      style={{ backgroundColor: targetColor }}
                    />
                    <span className="font-mono">{targetColor}</span>
                  </div>
                </div>

                <div className="col-span-2 mt-2">
                   <p className="text-xs text-gray-500 font-bold mb-1">NOTES</p>
                   <div className="h-20 border border-gray-300 border-dashed rounded bg-gray-50 p-2">
                      <p className="text-xs text-gray-400 italic">Add manufacturing notes here...</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer (Fixed) */}
          <div className="absolute bottom-0 left-0 w-full h-12 border-t border-gray-300 flex items-center justify-center pointer-events-none select-none">
             <p className="text-[10px] text-gray-400">DONNA CARMO AI • Generated Layout</p>
          </div>

        </div>
      </div>
    </div>
  );
};
