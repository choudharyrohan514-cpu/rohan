export interface Product {
  id: string;
  name: string;
  category: string;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  minStockLevel: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  priceAtSale: number;
}

export interface Sale {
  id: string;
  date: string; // ISO String
  totalAmount: number;
  items: SaleItem[];
}

export interface AppConfig {
  useGoogleSheets: boolean;
  googleScriptUrl: string; // URL of the deployed Google Apps Script Web App
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  POS = 'POS',
  AI_INSIGHTS = 'AI_INSIGHTS',
  SETTINGS = 'SETTINGS'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}