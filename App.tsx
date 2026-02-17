import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import { View, Product, Sale, AppConfig, SaleItem } from './types';
import { DEFAULT_PRODUCTS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  
  // App State - In a real app with Sheets, we'd fetch this on load
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [config, setConfig] = useState<AppConfig>({
    useGoogleSheets: false,
    googleScriptUrl: ''
  });

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
      setConfig(JSON.parse(savedConfig));
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


  // Handlers
  const handleAddProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleCheckout = (items: SaleItem[], total: number) => {
    const newSale: Sale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items,
      totalAmount: total
    };

    setSales(prev => [newSale, ...prev]);

    // Decrease Stock
    setProducts(prev => prev.map(p => {
      const saleItem = items.find(i => i.productId === p.id);
      if (saleItem) {
        return { ...p, stock: Math.max(0, p.stock - saleItem.quantity) };
      }
      return p;
    }));
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
          />
        );
      case View.POS:
        return <POS products={products} onCheckout={handleCheckout} />;
      case View.AI_INSIGHTS:
        return <AIAssistant products={products} sales={sales} />;
      case View.SETTINGS:
        return <Settings config={config} onUpdateConfig={setConfig} />;
      default:
        return <Dashboard products={products} sales={sales} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 ml-64 p-8 overflow-x-hidden">
        {renderView()}
      </main>
    </div>
  );
};

export default App;