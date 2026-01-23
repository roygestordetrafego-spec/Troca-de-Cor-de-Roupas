
import React, { useState, useRef, useEffect } from 'react';
import { Product, Category, CategoryDefaults } from '../types';
import { XIcon, PlayIcon } from './Icons';

interface ProductFormModalProps {
  product: Product | null;
  availableCategories: Category[];
  isSaving?: boolean;
  onSave: (product: Product) => void;
  onClose: () => void;
}

const NEW_CAT_OPTION = "___ADD_NEW___";
const STANDARD_SIZES = ['P', 'M', 'G', 'GG', 'G1', 'G2', 'G3', '34', '36', '38', '40', '42', '44', '46', '48'];

const resizeImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
      }
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
  });
};

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, availableCategories, isSaving, onSave, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [formData, setFormData] = useState<Partial<Product>>(() => {
    if (product) return { ...product };
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      category: availableCategories[0] || CategoryDefaults.DRESSES,
      ref: 'MOD-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
      wholesalePrice: 0,
      sizes: ['P', 'M', 'G'],
      fabric: '',
      description: '',
      images: [],
      videoUrl: '',
      reviews: []
    };
  });

  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
  };

  const handleDragEnter = (idx: number) => {
    dragOverItem.current = idx;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newImages = [...(formData.images || [])];
    const draggedItemContent = newImages[dragItem.current];
    newImages.splice(dragItem.current, 1);
    newImages.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handlePriceChange = (value: string) => {
    const numericValue = Number(value.replace(/\D/g, '')) / 100;
    setFormData(prev => ({ ...prev, wholesalePrice: numericValue }));
  };

  const toggleSize = (size: string) => {
    const current = formData.sizes || [];
    setFormData({ ...formData, sizes: current.includes(size) ? current.filter(s => s !== size) : [...current, size] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    if (!formData.images || formData.images.length === 0) {
      alert('Por favor, adicione pelo menos uma foto principal.');
      return;
    }

    const finalCategory = isAddingNewCategory ? newCategoryName.trim() : formData.category;
    if (isAddingNewCategory && !newCategoryName.trim()) {
      alert('Por favor, informe o nome da nova categoria.');
      return;
    }

    if (!finalCategory) {
      alert('Por favor, selecione ou crie uma categoria.');
      return;
    }

    onSave({ ...formData, category: finalCategory } as Product);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const newImages = await Promise.all(files.map(f => new Promise<string>((res) => {
        const r = new FileReader(); 
        r.readAsDataURL(f); 
        r.onload = async () => {
          const original = r.result as string;
          const optimized = await resizeImage(original);
          res(optimized);
        };
      })));
      
      setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }));
    } catch (err) {
      alert("Erro ao processar imagens.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === NEW_CAT_OPTION) {
      setIsAddingNewCategory(true);
      setFormData({...formData, category: ''});
    } else {
      setIsAddingNewCategory(false);
      setFormData({...formData, category: val});
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-stone-50 w-full max-w-5xl h-[95vh] md:h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col no-scrollbar relative border-t md:border-t-0 border-stone-200">
        
        <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-stone-200 px-6 py-5 z-20 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">{product ? 'Editar' : 'Cadastrar'} Produto</h2>
            <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">Gestor de Atacado</p>
          </div>
          <button onClick={onClose} disabled={isSaving} className="p-3 bg-stone-100 rounded-full active:scale-90 transition-all disabled:opacity-50">
            <XIcon className="w-5 h-5 text-stone-900" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-900 border-l-4 border-stone-900 pl-3">Informações Principais</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-stone-400 mb-2">Nome Comercial</label>
                    <input type="text" required className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-stone-900/10 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Vestido Midi Seda Elegance" />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-stone-400 mb-2">Categoria no Catálogo</label>
                    <div className="space-y-3">
                      <select 
                        required={!isAddingNewCategory}
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-stone-900/10 transition-all appearance-none cursor-pointer"
                        value={isAddingNewCategory ? NEW_CAT_OPTION : formData.category}
                        onChange={handleCategoryChange}
                      >
                        {availableCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value={NEW_CAT_OPTION} className="font-bold text-stone-900">+ Adicionar Nova Categoria...</option>
                      </select>

                      {isAddingNewCategory && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                           <div className="flex gap-2">
                             <input 
                               type="text" 
                               required 
                               autoFocus
                               className="flex-grow bg-white border border-stone-900/20 rounded-xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-stone-900/10" 
                               placeholder="Digite o nome da nova categoria"
                               value={newCategoryName}
                               onChange={e => setNewCategoryName(e.target.value)}
                             />
                             <button 
                               type="button"
                               onClick={() => { setIsAddingNewCategory(false); setNewCategoryName(''); }}
                               className="px-4 text-[9px] font-bold uppercase text-stone-400"
                             >
                               Cancelar
                             </button>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-stone-400 mb-2">Preço Atacado</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        required 
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-4 text-sm font-bold text-stone-900" 
                        value={formatCurrency(formData.wholesalePrice)} 
                        onChange={e => handlePriceChange(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-stone-400 mb-2">Referência</label>
                      <input type="text" required className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-4 text-sm font-mono" value={formData.ref} onChange={e => setFormData({...formData, ref: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-stone-400 mb-2">Tecido / Composição</label>
                    <input type="text" className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-4 text-sm" value={formData.fabric} onChange={e => setFormData({...formData, fabric: e.target.value})} placeholder="Ex: Seda Italiana com Elastano" />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase text-stone-400 mb-4">Grade de Tamanhos</label>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_SIZES.map(size => (
                      <button key={size} type="button" onClick={() => toggleSize(size)} className={`min-w-[48px] h-12 flex items-center justify-center rounded-xl border text-[11px] font-bold transition-all active:scale-95 ${formData.sizes?.includes(size) ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-white text-stone-400 border-stone-100'}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-900 border-l-4 border-stone-900 pl-3 mb-6">Descrição Detalhada</h3>
                <textarea className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-4 text-sm outline-none min-h-[120px] resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Descreva o caimento, detalhes e diferenciais..." />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-900 border-l-4 border-stone-900 pl-3">Galeria de Fotos</h3>
                  <span className="text-[8px] font-bold text-stone-400 uppercase">Arraste para reordenar</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {formData.images?.map((img, idx) => (
                    <div 
                      key={idx} 
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragEnter={() => handleDragEnter(idx)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className="relative aspect-square rounded-xl overflow-hidden border border-stone-100 bg-stone-50 cursor-grab active:cursor-grabbing group animate-fade-in"
                    >
                      <img src={img} className="w-full h-full object-cover" loading="lazy" />
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, images: formData.images?.filter((_, i) => i !== idx)})} 
                        className="absolute top-1 right-1 bg-red-500/90 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    disabled={isProcessing || isSaving}
                    onClick={() => fileInputRef.current?.click()} 
                    className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-xl text-stone-300 active:bg-stone-100 transition-all hover:border-stone-400 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="text-2xl font-light">+</span>
                        <span className="text-[8px] font-bold uppercase">Foto</span>
                      </>
                    )}
                  </button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
              </div>

              <div className="bg-stone-900 p-6 rounded-2xl shadow-xl space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white border-l-4 border-white pl-3">Vídeo de Caimento (Vertical)</h3>
                {formData.videoUrl ? (
                   <div className="relative aspect-[9/16] max-h-[300px] mx-auto rounded-xl overflow-hidden bg-black border border-white/10 group">
                     <video src={formData.videoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                     <button type="button" disabled={isSaving} onClick={() => setFormData({...formData, videoUrl: ''})} className="absolute top-3 right-3 bg-red-500 text-white p-2.5 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50">
                       <XIcon className="w-4 h-4" />
                     </button>
                   </div>
                ) : (
                  <button type="button" disabled={isSaving} onClick={() => videoFileInputRef.current?.click()} className="w-full aspect-video border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-white/40 active:bg-white/5 transition-all disabled:opacity-50">
                    <PlayIcon className="w-8 h-8 mb-3" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Enviar Vídeo MP4</span>
                  </button>
                )}
                <input type="file" ref={videoFileInputRef} className="hidden" accept="video/mp4" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.readAsDataURL(file as Blob);
                  reader.onload = () => setFormData({...formData, videoUrl: reader.result as string});
                }} />
              </div>
            </div>
          </div>
          
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-xl border-t border-stone-200 z-30 md:static md:bg-transparent md:border-0 md:p-0 flex gap-4">
            <button type="button" disabled={isSaving} onClick={onClose} className="flex-1 py-5 bg-stone-100 text-stone-500 rounded-2xl font-bold uppercase tracking-widest text-xs active:bg-stone-200 transition-colors disabled:opacity-50">
              Descartar
            </button>
            <button type="submit" disabled={isSaving} className="flex-[2] py-5 bg-stone-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all disabled:bg-stone-700 flex items-center justify-center gap-2">
              {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isSaving ? 'Salvando...' : (product ? 'Salvar Alterações' : 'Publicar Catálogo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
