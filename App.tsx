import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import { View, Product, Sale, AppConfig, SaleItem } from './types';
import { DEFAULT_PRODUCTS } from './constants';
import { fetchInventoryFromSheet, syncInventoryToSheet, syncSaleToSheet } from './services/sheetService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [config, setConfig] = useState<AppConfig>({
    useGoogleSheets: false,
    googleScriptUrl: ''
  });
  
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    const savedSales = localStorage.getItem('sales');
    const savedConfig = localStorage.getItem('config');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(DEFAULT_PRODUCTS);
    }

    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }
    
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
    }
  }, []);

  // Persistence Effects
  useEffect(() => {
    if (products.length > 0) localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (sales.length > 0) localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('config', JSON.stringify(config));
  }, [config]);


  // Sheet Operations
  const handleFetchFromSheet = async (urlOverride?: string) => {
    const url = urlOverride || config.googleScriptUrl;
    if (!url) {
      alert("Please configure the Google Sheet URL in Settings first.");
      return;
    }
    
    setIsSyncing(true);
    try {
      const remoteProducts = await fetchInventoryFromSheet(url);
      if (remoteProducts && remoteProducts.length > 0) {
        setProducts(remoteProducts);
        alert(`Successfully synced ${remoteProducts.length} items from Sheet.`);
      } else {
        alert("Connected to Sheet, but found no products. If this is a new sheet, try 'Save to Cloud' first.");
      }
    } catch (error) {
      alert("Failed to sync: " + error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncInventory = async (newProducts: Product[]) => {
    if (config.useGoogleSheets && config.googleScriptUrl) {
      setIsSyncing(true);
      await syncInventoryToSheet(config.googleScriptUrl, newProducts);
      setIsSyncing(false);
    }
  };

  // Manual trigger for saving entire list
  const handleManualSaveToSheet = async () => {
    if (!config.useGoogleSheets || !config.googleScriptUrl) {
      alert("Please configure Google Sheets in Settings first.");
      return;
    }
    setIsSyncing(true);
    const success = await syncInventoryToSheet(config.googleScriptUrl, products);
    setIsSyncing(false);
    if (success) {
      alert("Inventory successfully saved to Google Sheet.");
    } else {
      alert("Save failed. Check console for details.");
    }
  };

  // Handlers
  const handleAddProduct = (product: Product) => {
    const newProducts = [...products, product];
    setProducts(newProducts);
    syncInventory(newProducts);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const newProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setProducts(newProducts);
    syncInventory(newProducts);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const newProducts = products.filter(p => p.id !== id);
      setProducts(newProducts);
      syncInventory(newProducts);
    }
  };

  const handleCheckout = async (items: SaleItem[], total: number) => {
    const newSale: Sale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items,
      totalAmount: total
    };

    const newSales = [newSale, ...sales];
    setSales(newSales);

    // Decrease Stock
    const newProducts = products.map(p => {
      const saleItem = items.find(i => i.productId === p.id);
      if (saleItem) {
        return { ...p, stock: Math.max(0, p.stock - saleItem.quantity) };
      }
      return p;
    });
    setProducts(newProducts);

    // Sync to Sheet
    if (config.useGoogleSheets && config.googleScriptUrl) {
      // We don't block the UI for this
      setIsSyncing(true);
      await syncSaleToSheet(config.googleScriptUrl, newSale, newProducts);
      setIsSyncing(false);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard products={products} sales={sales} />;
      case View.INVENTORY:
        return (
          <Inventory 
            products={products} 
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onLoadFromSheet={() => handleFetchFromSheet()}
            onSaveToSheet={handleManualSaveToSheet}
          />
        );
      case View.POS:
        return <POS products={products} onCheckout={handleCheckout} />;
      case View.AI_INSIGHTS:
        return <AIAssistant products={products} sales={sales} />;
      case View.SETTINGS:
        return (
          <Settings 
            config={config} 
            onUpdateConfig={setConfig} 
            onTestConnection={() => handleFetchFromSheet()} 
          />
        );
      default:
        return <Dashboard products={products} sales={sales} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 ml-64 p-8 overflow-x-hidden relative">
        {/* Sync Indicator */}
        {isSyncing && (
          <div className="fixed top-4 right-4 z-50 bg-white shadow-lg border border-primary/20 text-primary px-4 py-2 rounded-full flex items-center gap-2 animate-in slide-in-from-top-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Syncing with Google Sheets...</span>
          </div>
        )}
        
        {renderView()}
      </main>
    </div>
  );
};

export default App;