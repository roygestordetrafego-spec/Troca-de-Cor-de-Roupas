
export const CategoryDefaults = {
  ALL: 'Todos',
  DRESSES: 'Vestidos',
  TOPS: 'Blusas',
  PANTS: 'Calças',
  SETS: 'Conjuntos',
  SKIRTS: 'Saias'
} as const;

export type Category = string;

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  ref: string;
  wholesalePrice: number;
  sizes: string[];
  fabric: string;
  description: string;
  images: string[];
  videoUrl: string;
  reviews?: Review[];
}
