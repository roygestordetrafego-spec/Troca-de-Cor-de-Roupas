
import React, { useState, useMemo, useEffect } from 'react';
import { Category, Product, Review, CategoryDefaults } from './types';
import { INITIAL_CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from './constants';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import ProductFormModal from './components/ProductFormModal';
import AdminLoginModal from './components/AdminLoginModal';
import SettingsModal from './components/SettingsModal';
import { SearchIcon, LogoutIcon, CogIcon, InstagramIcon } from './components/Icons';

// --- Banco de Dados IndexedDB (Wrapper Minimalista) ---
const DB_NAME = 'DonnaCarmoDB';
const STORE_NAME = 'products';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveToDB = async (products: Product[]) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  for (const p of products) {
    await store.add(p);
  }
};

const loadFromDB = async (): Promise<Product[]> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
};

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>(CategoryDefaults.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const isWholesale = true;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [instagramLink, setInstagramLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const allCategories = useMemo(() => {
    const productCats = products.map(p => p.category);
    const combined = Array.from(new Set([...INITIAL_CATEGORIES, ...customCategories, ...productCats]));
    return combined.filter(c => c !== CategoryDefaults.ALL);
  }, [products, customCategories]);

  const filterCategories = useMemo(() => {
    return [CategoryDefaults.ALL, ...allCategories];
  }, [allCategories]);

  const loadSettings = () => {
    const savedInsta = localStorage.getItem('company_instagram');
    if (savedInsta) setInstagramLink(savedInsta);
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const dbProducts = await loadFromDB();
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
        } else {
          setProducts(INITIAL_PRODUCTS);
        }

        const savedCats = localStorage.getItem('chic_custom_categories');
        if (savedCats) {
          setCustomCategories(JSON.parse(savedCats));
        }
      } catch (e) {
        console.error("Erro ao carregar do IndexedDB:", e);
        setProducts(INITIAL_PRODUCTS);
      } finally {
        setIsLoaded(true);
      }
      
      if (sessionStorage.getItem('admin_authenticated') === 'true') {
        setIsLoggedIn(true);
      }
      loadSettings();
    };

    initializeApp();
    window.addEventListener('company_settings_updated', loadSettings);
    return () => window.removeEventListener('company_settings_updated', loadSettings);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('chic_custom_categories', JSON.stringify(customCategories));
    }
  }, [customCategories, isLoaded]);

  useEffect(() => {
    if (selectedProduct || isFormOpen || showLoginModal || showSettingsModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [selectedProduct, isFormOpen, showLoginModal, showSettingsModal]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (!product) return false;
      const matchesCategory = selectedCategory === CategoryDefaults.ALL || product.category === selectedCategory;
      const productName = product.name || '';
      const productRef = product.ref || '';
      return matchesCategory && (
        productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        productRef.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [products, selectedCategory, searchQuery]);

  const handleToggleAdmin = () => {
    if (isLoggedIn) setIsEditMode(!isEditMode);
    else setShowLoginModal(true);
  };

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsLoggedIn(true);
      setIsEditMode(true);
      setShowLoginModal(false);
      sessionStorage.setItem('admin_authenticated', 'true');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsEditMode(false);
    sessionStorage.removeItem('admin_authenticated');
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleSaveProduct = async (product: Product) => {
    setIsSaving(true);
    try {
      if (!INITIAL_CATEGORIES.includes(product.category) && !customCategories.includes(product.category)) {
        setCustomCategories(prev => [...prev, product.category]);
      }

      const newProducts = [...products];
      const index = newProducts.findIndex(p => p.id === product.id);
      
      if (index >= 0) {
        newProducts[index] = product;
      } else {
        newProducts.unshift(product);
      }
      
      await saveToDB(newProducts);
      setProducts(newProducts);
      setIsFormOpen(false);
    } catch (e) {
      console.error("Erro ao salvar produto:", e);
      alert("Erro ao salvar dados no banco do navegador.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto do catálogo?')) {
      try {
        const updatedProducts = products.filter(p => p.id !== id);
        await saveToDB(updatedProducts);
        setProducts(updatedProducts);
        if (selectedProduct?.id === id) setSelectedProduct(null);
      } catch (e) {
        alert("Erro ao excluir produto.");
      }
    }
  };

  const handleAddReview = async (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    };

    const updated = products.map(p => {
      if (p.id === productId) {
        const updatedProduct = { ...p, reviews: [...(p.reviews || []), newReview] };
        if (selectedProduct?.id === productId) setSelectedProduct(updatedProduct);
        return updatedProduct;
      }
      return p;
    });

    try {
      await saveToDB(updated);
      setProducts(updated);
    } catch (e) {
      console.error("Erro ao salvar avaliação:", e);
    }
  };

  const handleOpenInstagram = () => {
    if (instagramLink) {
      window.open(instagramLink, '_blank', 'noopener,noreferrer');
    } else {
      alert('Link do Instagram não configurado.');
    }
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
        <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Acessando Banco de Dados...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 uppercase tracking-tighter">
              Donna Carmo <span className="text-stone-400 font-light">Alfaiataria</span>
            </h1>

            <div className="flex items-center w-full md:w-auto gap-3">
              <div className="relative flex-grow md:w-80">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Nome ou Ref..."
                  className="w-full bg-stone-100/50 border-none rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-stone-900/10 transition-all outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-stone-200">
                <button 
                  onClick={handleOpenInstagram}
                  className="p-2.5 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-50 active:scale-95 transition-all"
                  title="Visite nosso Instagram"
                >
                  <InstagramIcon className="w-5 h-5" />
                </button>

                {isLoggedIn && (
                  <>
                    <button 
                      onClick={handleAddProduct}
                      className="hidden md:flex items-center gap-2 px-4 py-2 text-stone-900 hover:bg-stone-50 rounded-xl transition-all"
                    >
                      <span className="text-lg">+</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Novo Produto</span>
                    </button>
                    <button onClick={() => setShowSettingsModal(true)} className="p-2.5 rounded-xl text-stone-400 hover:bg-stone-50 active:scale-95 transition-all">
                      <CogIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button onClick={handleToggleAdmin} className={`p-2.5 rounded-xl transition-all active:scale-95 ${isEditMode ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-400 hover:bg-stone-50'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                  </svg>
                </button>
                {isLoggedIn && (
                  <button onClick={handleLogout} className="p-2.5 rounded-xl text-stone-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95">
                    <LogoutIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative border-t border-stone-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar snap-x touch-pan-x">
            {filterCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all snap-start ${selectedCategory === cat ? 'bg-stone-900 text-white shadow-md' : 'bg-white text-stone-400 border border-stone-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6 md:py-10">
        <div className="flex flex-col sm:flex-row justify-between items-baseline mb-8 gap-2">
          <h2 className="text-2xl font-serif text-stone-900">{selectedCategory}</h2>
          <p className="text-stone-400 text-xs uppercase tracking-widest">Exibindo {filteredProducts.length} itens no atacado</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {/* Card de Adição quando em Modo Edição */}
          {isEditMode && isLoggedIn && (
            <button 
              onClick={handleAddProduct}
              className="group relative flex flex-col items-center justify-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 hover:border-stone-400 transition-all p-8 min-h-[300px] animate-fade-in"
            >
              <div className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-stone-900 group-hover:text-white transition-all duration-300">
                <span className="text-3xl font-light">+</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 group-hover:text-stone-900 transition-colors">Novo Produto</p>
              <p className="text-[8px] text-stone-300 uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Adicionar ao catálogo</p>
            </button>
          )}

          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isWholesale={isWholesale}
              isEditMode={isEditMode && isLoggedIn}
              onEdit={() => { setEditingProduct(product); setIsFormOpen(true); }}
              onDelete={() => handleDeleteProduct(product.id)}
              onClick={() => setSelectedProduct(product)} 
            />
          ))}
        </div>

        {filteredProducts.length === 0 && !isEditMode && (
          <div className="py-20 text-center">
             <p className="text-stone-400 italic">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </main>

      {isEditMode && isLoggedIn && (
        <button 
          onClick={handleAddProduct}
          className="fixed bottom-6 right-6 md:hidden z-50 w-14 h-14 bg-stone-900 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}

      <footer className="bg-stone-900 text-stone-500 py-12 px-4 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div className="sm:col-span-2">
            <h3 className="text-white font-serif font-bold text-xl mb-4 uppercase">Donna Carmo Alfaiataria</h3>
            <p className="text-sm max-w-sm leading-relaxed">Excelência em moda feminina com caimento impecável para o mercado de atacado premium.</p>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Endereço</h4>
            <p className="text-sm">Rua: João Teodoro 1583 Brás São Paulo - SP CEP: 03009-000</p>
          </div>
        </div>
      </footer>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          isWholesale={isWholesale}
          isEditMode={isEditMode && isLoggedIn}
          onDelete={() => handleDeleteProduct(selectedProduct.id)}
          onClose={() => setSelectedProduct(null)}
          onAddReview={handleAddReview}
        />
      )}

      {isFormOpen && (
        <ProductFormModal 
          product={editingProduct} 
          isSaving={isSaving}
          availableCategories={allCategories}
          onSave={handleSaveProduct}
          onClose={() => setIsFormOpen(false)} 
        />
      )}

      {showLoginModal && (
        <AdminLoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />
      )}

      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  );
};

export default App;
