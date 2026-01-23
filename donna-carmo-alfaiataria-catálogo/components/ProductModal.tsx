
import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types';
import { XIcon, CheckIcon, PlayIcon, DownloadIcon } from './Icons';
import ReviewSection from './ReviewSection';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  isWholesale: boolean;
  isEditMode?: boolean;
  onDelete?: () => void;
  onAddReview?: (productId: string, review: Omit<Review, 'id' | 'date'>) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, isWholesale, isEditMode, onDelete, onAddReview }) => {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleDownload = async () => {
    const mediaUrl = isPlayingVideo ? product.videoUrl : selectedImage;
    if (!mediaUrl) return;

    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const extension = isPlayingVideo ? 'mp4' : 'jpg';
      link.download = `${product.name.replace(/\s+/g, '-').toLowerCase()}-${product.ref}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback para URLs diretas se o fetch falhar (CORS)
      const link = document.createElement('a');
      link.href = mediaUrl;
      link.download = `media-${product.ref}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white w-full max-w-6xl md:max-h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col no-scrollbar h-[92vh] md:h-auto">
        {/* Close Button Mobile Handle */}
        <div className="md:hidden flex justify-center py-4 sticky top-0 bg-white z-20" onClick={onClose}>
          <div className="w-12 h-1.5 bg-stone-200 rounded-full" />
        </div>

        <button 
          onClick={onClose}
          className="hidden md:flex absolute top-6 right-6 z-30 p-2.5 bg-white/90 backdrop-blur shadow-md rounded-full hover:bg-white active:scale-90 transition-all"
        >
          <XIcon className="w-6 h-6 text-stone-900" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Media Section */}
          <div className="w-full md:w-1/2 bg-stone-100 flex flex-col relative group/media">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-200">
              {isPlayingVideo && product.videoUrl ? (
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                   <video 
                     src={product.videoUrl} 
                     className="w-full h-full object-cover" 
                     autoPlay 
                     loop 
                     controls 
                     playsInline 
                   />
                   <button 
                     onClick={() => setIsPlayingVideo(false)} 
                     className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-stone-900/50 hover:bg-stone-900/70 backdrop-blur-xl text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 transition-all active:scale-95 shadow-lg"
                   >
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                     </svg>
                     Voltar para Fotos
                   </button>
                </div>
              ) : (
                <img src={selectedImage} alt={product.name} className="w-full h-full object-cover animate-fade-in" />
              )}

              {/* Download Button Overlay */}
              <button 
                onClick={handleDownload}
                className="absolute bottom-4 right-4 p-3.5 bg-white/90 backdrop-blur-md text-stone-900 rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover/media:opacity-100 transition-all active:scale-90 z-10 border border-stone-200/50"
                title="Baixar mídia"
              >
                <DownloadIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex gap-3 overflow-x-auto no-scrollbar bg-white border-t border-stone-50 snap-x">
              {product.videoUrl && (
                <button 
                  onClick={() => setIsPlayingVideo(true)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all relative snap-start shadow-sm ${isPlayingVideo ? 'border-stone-900 scale-95 shadow-inner' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <div className="absolute inset-0 bg-stone-900/20 z-10" />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <PlayIcon className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-stone-900/80 text-[8px] text-white text-center py-1 font-bold uppercase tracking-tighter z-30">Vídeo</div>
                  <video src={product.videoUrl} className="w-full h-full object-cover" muted />
                </button>
              )}
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setSelectedImage(img); setIsPlayingVideo(false); }}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all snap-start shadow-sm ${selectedImage === img && !isPlayingVideo ? 'border-stone-900 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col">
            <div className="mb-8">
              <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-bold mb-3">{product.category}</p>
              <h2 className="text-3xl md:text-5xl font-serif text-stone-900 leading-tight mb-5">{product.name}</h2>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <p className="text-3xl font-bold text-stone-900">
                  R$ {(product.wholesalePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="bg-stone-100 text-stone-600 text-[9px] px-3.5 py-1.5 rounded-lg uppercase font-bold tracking-widest border border-stone-200 shadow-sm">Atacado</span>
              </div>

              <p className="text-stone-500 text-sm leading-relaxed border-l-2 border-stone-100 pl-5 italic">{product.description}</p>
            </div>

            <div className="space-y-8">
              {/* Grades */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-stone-900 rounded-full" />
                  Grade Disponível
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[54px] h-14 flex items-center justify-center rounded-xl border text-sm font-bold transition-all active:scale-90 ${selectedSize === size ? 'bg-stone-900 text-white border-stone-900 shadow-xl' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-900 hover:text-stone-900 shadow-sm'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Informações Extras */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 hover:bg-white transition-colors">
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold mb-1.5">Composição</p>
                  <p className="text-xs font-semibold text-stone-900">{product.fabric}</p>
                </div>
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 hover:bg-white transition-colors">
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold mb-1.5">Ref. do Item</p>
                  <p className="text-xs font-mono font-bold text-stone-900">{product.ref}</p>
                </div>
              </div>
            </div>

            {/* Avaliações */}
            <div className="mt-12">
              <ReviewSection reviews={product.reviews || []} onAddReview={(r) => onAddReview?.(product.id, r)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
