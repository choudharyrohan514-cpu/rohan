import { Product } from './types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Basmati Rice (Premium)',
    category: 'Grains',
    wholesalePrice: 80,
    retailPrice: 110,
    stock: 500,
    minStockLevel: 50,
  },
  {
    id: '2',
    name: 'Sunflower Oil (1L)',
    category: 'Oils',
    wholesalePrice: 120,
    retailPrice: 150,
    stock: 100,
    minStockLevel: 20,
  },
  {
    id: '3',
    name: 'Wheat Flour (10kg)',
    category: 'Flour',
    wholesalePrice: 350,
    retailPrice: 420,
    stock: 40,
    minStockLevel: 10,
  },
  {
    id: '4',
    name: 'Toor Dal',
    category: 'Pulses',
    wholesalePrice: 90,
    retailPrice: 130,
    stock: 150,
    minStockLevel: 30,
  },
  {
    id: '5',
    name: 'Sugar',
    category: 'Sweeteners',
    wholesalePrice: 38,
    retailPrice: 45,
    stock: 200,
    minStockLevel: 50,
  },
];

export const CATEGORIES = [
  'Grains',
  'Oils',
  'Flour',
  'Pulses',
  'Spices',
  'Snacks',
  'Beverages',
  'Cleaning',
  'Personal Care',
  'Sweeteners'
];