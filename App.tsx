
import React, { useState, useRef, useEffect } from 'react';
import { ColorPicker } from './components/ColorPicker';
import { ImageWorkspace } from './components/ImageWorkspace';
import { ToolMode, ProcessingState } from './types';
import { editImageWithGemini, generateVideoWithGemini } from './services/geminiService';
import { PrintLayout } from './components/PrintLayout';

const TARGET_PRESETS = [
  { label: 'VESTIDO', value: 'Dress' },
  { label: 'CAMISA', value: 'Shirt' },
  { label: 'CALÇA', value: 'Pants' },
  { label: 'BOLSA', value: 'Bag' },
  { label: 'CABELO', value: 'Hair' },
  { label: 'ACESSÓRIO', value: 'Accessory' },
  { label: 'PELE', value: 'Skin' },
  { label: 'ROSTO', value: 'Face' },
  { label: 'FUNDO', value: 'Background' }
];

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showPrintLayout, setShowPrintLayout] = useState(false);
  
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isLoading: false,
    statusMessage: '',
    error: null
  });

  const [toolMode, setToolMode] = useState<ToolMode>(ToolMode.RECOLOR);
  const [targetObject, setTargetObject] = useState<string>('Dress');
  const [targetColor, setTargetColor] = useState<string>('#000000'); 
  
  const [savedColors, setSavedColors] = useState<string[]>(() => {
    const stored = localStorage.getItem('donnacarmos_saved_colors');
    return stored ? JSON.parse(stored) : [];
  });

  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [videoPrompt, setVideoPrompt] = useState<string>('High quality fashion video, 4k cinematic lighting');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('donnacarmos_saved_colors', JSON.stringify(savedColors));
  }, [savedColors]);

  const currentImage = historyIndex >= 0 ? history[historyIndex] : originalImage;
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImage(result);
        setHistory([]);
        setHistoryIndex(-1);
        setGeneratedVideoUrl(null);
        setProcessingState({ isLoading: false, statusMessage: '', error: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveColor = (color: string) => {
    if (!savedColors.some(c => c.toLowerCase() === color.toLowerCase())) {
      setSavedColors([color, ...savedColors]);
    }
  };

  const handleDeleteColor = (color: string) => {
    setSavedColors(savedColors.filter(c => c !== color));
  };

  const addToHistory = (newImage: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newImage);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => canUndo && setHistoryIndex(prev => prev - 1);
  const handleRedo = () => canRedo && setHistoryIndex(prev => prev + 1);

  const handleDownload = () => {
    const contentToDownload = generatedVideoUrl || currentImage;
    if (!contentToDownload) return;
    const link = document.createElement('a');
    link.href = contentToDownload;
    link.download = `donnacarmos_${Date.now()}.${generatedVideoUrl ? 'mp4' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatErrorMessage = (error: any): string => {
    if (typeof error === 'string') {
      try {
        const parsed = JSON.parse(error);
        if (parsed.error && parsed.error.message) {
          return parsed.error.message;
        }
      } catch (e) {
        return error;
      }
    }
    return error?.message || "Ocorreu um erro inesperado.";
  };

  const handleApply = async () => {
    if (toolMode === ToolMode.VIDEO) {
      setProcessingState({ isLoading: true, statusMessage: 'Gerando vídeo...', error: null });
      try {
        const videoUrl = await generateVideoWithGemini(videoPrompt, currentImage || undefined);
        setGeneratedVideoUrl(videoUrl);
        setProcessingState({ isLoading: false, statusMessage: 'Sucesso', error: null });
      } catch (err: any) {
        setProcessingState({ isLoading: false, statusMessage: '', error: formatErrorMessage(err.message) });
      }
      return;
    }

    if (!currentImage && !originalImage) return;

    setProcessingState({ isLoading: true, statusMessage: 'Processando Render 4K...', error: null });

    try {
      const sourceImage = currentImage || originalImage;
      if (!sourceImage) throw new Error("Sem imagem de origem");
      const prompt = toolMode === ToolMode.REMOVE_BG ? "Remove background" : 
                    toolMode === ToolMode.CUSTOM ? customPrompt :
                    `Recolor ${targetObject} to hex ${targetColor}. Maintain realistic textures and light. High fashion photography style.`;
      
      const newImageBase64 = await editImageWithGemini(sourceImage, prompt);
      addToHistory(newImageBase64);
      setGeneratedVideoUrl(null); 
      setProcessingState({ isLoading: false, statusMessage: 'Sucesso', error: null });
    } catch (err: any) {
      setProcessingState({ isLoading: false, statusMessage: '', error: formatErrorMessage(err.message) });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden font-sans">
      
      {showPrintLayout && (
        <PrintLayout 
          originalImage={originalImage}
          currentImage={currentImage || null}
          targetObject={targetObject}
          targetColor={targetColor}
          onClose={() => setShowPrintLayout(false)}
        />
      )}

      {/* Header */}
      <header className="h-16 border-b border-[#111] bg-black flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 bg-[#0ea5e9] rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
           </div>
           <div>
             <h1 className="text-sm font-bold tracking-tight text-white leading-none uppercase">DONNA CARMO STUDIO</h1>
             <p className="text-[9px] text-[#0ea5e9] tracking-[0.2em] uppercase font-bold mt-0.5">AI FASHION ENGINE</p>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 bg-[#0a0a0a] px-3.5 py-1.5 rounded-full border border-white/5">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">4K MODE ACTIVE</span>
           </div>

           <div className="flex items-center gap-5 text-gray-600">
             <button onClick={handleUndo} disabled={!canUndo} className="hover:text-white disabled:opacity-20 transition-colors">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
             </button>
             <button onClick={handleRedo} disabled={!canRedo} className="hover:text-white disabled:opacity-20 transition-colors">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"></path></svg>
             </button>
           </div>

           <div className="w-px h-6 bg-[#222]"></div>
           
           <div className="flex items-center gap-2">
             <button 
               onClick={() => setShowPrintLayout(true)}
               disabled={!currentImage}
               className="bg-[#111] hover:bg-[#1a1a1a] text-gray-400 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] flex items-center gap-2 transition-all border border-white/5 disabled:opacity-20"
             >
               TECH PACK
             </button>

             <button 
               onClick={() => fileInputRef.current?.click()}
               className="bg-[#111] hover:bg-[#1a1a1a] text-gray-300 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] flex items-center gap-2.5 transition-all border border-white/5"
             >
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12"></path></svg>
               TROCAR
             </button>

             <button 
               onClick={handleDownload}
               disabled={!currentImage && !generatedVideoUrl}
               className="bg-[#222] hover:bg-[#2a2a2a] text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] flex items-center gap-2.5 transition-all disabled:opacity-30 border border-white/5"
             >
               EXPORTAR
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
             </button>
           </div>
        </div>
      </header>

      <main className="flex-1 flex flex-row overflow-hidden">
        
        <aside className="w-[380px] bg-[#050505] border-r border-[#1a1a1a] flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            <div className="space-y-3">
              <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">IMAGEM DE ENTRADA</h2>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-28 rounded-2xl border border-dashed border-[#222] relative overflow-hidden group flex items-center justify-center bg-black/40 hover:bg-black/60 transition-all"
              >
                {originalImage && (
                  <img src={originalImage} className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" alt="Preview" />
                )}
                <div className="relative z-10 flex flex-col items-center gap-2.5 text-white/50 group-hover:text-white">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em]">TROCAR IMAGEM</span>
                </div>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
            </div>

            <div className="space-y-3">
              <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">FERRAMENTAS</h2>
              <div className="grid grid-cols-2 gap-1.5 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] p-1.5">
                 {[
                   { id: ToolMode.RECOLOR, label: 'TROCAR COR' },
                   { id: ToolMode.REMOVE_BG, label: 'REMOVER FUNDO' },
                   { id: ToolMode.CUSTOM, label: 'PROMPT' },
                   { id: ToolMode.VIDEO, label: 'VÍDEO AI' }
                 ].map((tool) => (
                   <button
                    key={tool.id}
                    onClick={() => setToolMode(tool.id)}
                    className={`py-3 text-[9px] font-bold uppercase tracking-[0.15em] transition-all rounded-xl ${
                      toolMode === tool.id ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-gray-500 hover:text-white'
                    }`}
                   >
                     {tool.label}
                   </button>
                 ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">ÁREA ALVO</h2>
              <div className="grid grid-cols-3 gap-2">
                {TARGET_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setTargetObject(preset.value)}
                    className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.1em] border transition-all ${
                      targetObject === preset.value 
                      ? 'bg-[#0ea5e9] text-white border-transparent shadow-[0_4px_20px_rgba(14,165,233,0.3)]' 
                      : 'bg-black text-gray-600 border-[#1a1a1a] hover:border-gray-500'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <ColorPicker 
              selectedColor={targetColor} 
              savedColors={savedColors}
              onChange={setTargetColor} 
              onSaveColor={handleSaveColor}
              onDeleteColor={handleDeleteColor}
            />

            <button 
              onClick={handleApply}
              disabled={!originalImage && toolMode !== ToolMode.VIDEO}
              className={`w-full py-4.5 mt-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 disabled:opacity-20 ${
                processingState.isLoading ? 'bg-[#0ea5e9]/50' : 'bg-[#0ea5e9] hover:bg-[#0284c7] shadow-[0_8px_30px_rgba(14,165,233,0.25)]'
              }`}
            >
              {processingState.isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : null}
              {toolMode === ToolMode.VIDEO ? 'GERAR VÍDEO' : 'PROCESSAR RENDER 4K'}
            </button>
          </div>
        </aside>

        <section className="flex-1 relative bg-black flex flex-col items-center justify-center p-10 overflow-hidden">
           {generatedVideoUrl ? (
             <div className="w-full h-full max-w-5xl flex items-center justify-center">
               <div className="w-full h-full rounded-3xl overflow-hidden border border-[#0ea5e9]/30 shadow-2xl relative group">
                 <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-full object-contain bg-black" />
                 <button onClick={() => setGeneratedVideoUrl(null)} className="absolute top-6 right-6 p-2.5 bg-black/60 rounded-full hover:bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
               </div>
             </div>
           ) : (
             <ImageWorkspace 
               originalImage={originalImage} 
               currentImage={currentImage || null} 
               isProcessing={processingState.isLoading}
               onUploadClick={() => fileInputRef.current?.click()}
             />
           )}
        </section>
      </main>

      {processingState.error && (
        <div className="fixed bottom-10 right-10 z-50 animate-fade-in max-w-sm">
           <div className="bg-[#1a0505] border border-red-500/40 p-5 rounded-2xl shadow-2xl flex items-start gap-4 backdrop-blur-md">
              <div className="shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">!</div>
              <div>
                <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Erro de Processamento</p>
                <p className="text-[11px] text-red-200/80 leading-relaxed">
                  {processingState.error}
                </p>
                <div className="flex gap-4 mt-3">
                  <button 
                    onClick={() => setProcessingState({ ...processingState, error: null })}
                    className="text-[9px] font-bold text-[#0ea5e9] hover:underline uppercase tracking-widest"
                  >Fechar</button>
                  <button 
                    onClick={() => {
                      setProcessingState({ ...processingState, error: null });
                      handleApply();
                    }}
                    className="text-[9px] font-bold text-white/50 hover:text-white uppercase tracking-widest"
                  >Tentar Novamente</button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
