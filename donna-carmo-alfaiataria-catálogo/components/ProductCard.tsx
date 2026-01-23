
import React, { useState } from 'react';
import { Product } from '../types';
import { HeartIcon } from './Icons';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  isWholesale: boolean;
  isEditMode?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, isWholesale, isEditMode, onEdit, onDelete }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const mainImage = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop';

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm active:shadow-md md:hover:shadow-xl transition-all duration-300 border border-stone-100 h-full">
      <div 
        className="relative aspect-[3/4] overflow-hidden cursor-pointer bg-stone-100"
        onClick={onClick}
      >
        <img 
          src={mainImage} 
          alt={product.name} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-105"
        />
        
        {/* Favorito Otimizado para Mobile */}
        {!isEditMode && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className={`absolute top-2 right-2 md:top-4 md:right-4 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-white/70 text-stone-600'}`}
          >
            <HeartIcon className="w-4 h-4 md:w-5 md:h-5" filled={isFavorite} />
          </button>
        )}

        {isEditMode && (
          <div className="absolute top-2 right-2 md:top-4 md:right-4 flex gap-1 md:gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="p-2 rounded-lg bg-white/90 text-stone-900 shadow-md active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="p-2 rounded-lg bg-red-500 text-white shadow-md active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 12m-4.74 0-.34-12m14.12 3.333c.39.043.77.086 1.15.127m-18.3 0c.38-.041.76-.084 1.15-.127m21.185-1.991c.513.053.917.484.917 1.006v.67c0 .512-.404.953-.917 1.006m-18.35 0c-.513-.053-.917-.484-.917-1.006v-.67c0 .512.404.953.917-1.006m18.35 0V10.5c0-.512-.404-.953-.917-1.006A48.667 48.667 0 0 0 7.5 8.125m12.75 0a48.474 48.474 0 0 0-5.25-.125m-4.5 0c-1.833 0-3.664.053-5.485.158m15.809 0a48.354 48.354 0 0 0-4.474-1.062m-9.961 0a48.354 48.354 0 0 0-4.474 1.062m4.474-1.062V4.5c0-1.104.896-2 2-2h4.5c1.104 0 2 .896 2 2v1.583m-9.75 0a48.304 48.304 0 0 0 9.75 0" />
              </svg>
            </button>
          </div>
        )}

        <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4 flex opacity-0 md:group-hover:opacity-100 transition-opacity">
           <div className="bg-white/90 backdrop-blur-sm w-full py-2 rounded-xl text-[9px] font-bold text-stone-900 uppercase text-center shadow-lg">
             Ver Detalhes
           </div>
        </div>
      </div>

      <div className="p-3 md:p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">{product.category}</p>
          <p className="text-[8px] text-stone-300 font-mono hidden sm:block">{product.ref}</p>
        </div>
        
        <h3 className="text-sm md:text-base font-serif text-stone-800 mb-2 line-clamp-1">
          {product.name}
        </h3>

        <div className="mt-auto pt-2 border-t border-stone-50 flex items-center justify-between">
          <div>
            <p className="text-sm md:text-lg font-bold text-stone-900">
              R$ {(product.wholesalePrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[7px] md:text-[9px] text-stone-400 uppercase font-bold tracking-wider">Atacado</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
