
import { Category, CategoryDefaults, Product } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  CategoryDefaults.ALL,
  CategoryDefaults.DRESSES,
  CategoryDefaults.TOPS,
  CategoryDefaults.PANTS,
  CategoryDefaults.SETS,
  CategoryDefaults.SKIRTS
];

const MOCK_REVIEWS = [
  { id: 'r1', userName: 'Mariana S.', rating: 5, comment: 'Tecido maravilhoso, caimento perfeito! Super recomendo.', date: '2024-03-15' },
  { id: 'r2', userName: 'Clara G.', rating: 4, comment: 'Muito bonito, apenas o tamanho P ficou um pouco justo.', date: '2024-03-10' }
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Vestido Midi Seda Elegance',
    category: CategoryDefaults.DRESSES,
    ref: 'MOD-2024-001',
    wholesalePrice: 159.00,
    sizes: ['P', 'M', 'G'],
    fabric: 'Seda Italiana com Elastano',
    description: 'Vestido midi com modelagem fluida, decote em V e acabamento refinado. Perfeito para eventos sociais.',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539008835279-4346745082a0?q=80&w=1000&auto=format&fit=crop'
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    reviews: MOCK_REVIEWS
  },
  {
    id: '2',
    name: 'Blusa Crepe Soft Touch',
    category: CategoryDefaults.TOPS,
    ref: 'MOD-2024-002',
    wholesalePrice: 65.00,
    sizes: ['P', 'M', 'G', 'GG'],
    fabric: 'Crepe Marrocain',
    description: 'Blusa básica com toque macio e excelente caimento. Ideal para compor looks de escritório.',
    images: [
      'https://images.unsplash.com/photo-1551163943-3f6a855d1153?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1564252629749-4952f864f1cc?q=80&w=1000&auto=format&fit=crop'
    ],
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    reviews: []
  },
  {
    id: '3',
    name: 'Calça Pantalona Alfaiataria',
    category: CategoryDefaults.PANTS,
    ref: 'MOD-2024-003',
    wholesalePrice: 110.00,
    sizes: ['36', '38', '40', '42', '44'],
    fabric: 'Gabardine Premium',
    description: 'Pantalona de cintura alta com corte impecável. Possui bolsos laterais e fechamento invisível.',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=80&w=1000&auto=format&fit=crop'
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    reviews: []
  }
];
