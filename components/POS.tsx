import React, { useState, useMemo } from 'react';
import { Product, SaleItem } from '../types';
import { Search, ShoppingCart, Plus, Minus, X, CreditCard } from 'lucide-react';

interface POSProps {
  products: Product[];
  onCheckout: (items: SaleItem[], total: number) => void;
}

const POS: React.FC<POSProps> = ({ products, onCheckout }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        // Check stock limit
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, quantity: 1, priceAtSale: product.retailPrice }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const product = products.find(p => p.id === productId);
          const newQty = item.quantity + delta;
          if (newQty < 1) return item;
          if (product && newQty > product.stock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.quantity * item.priceAtSale), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (confirm(`Confirm sale of ₹${cartTotal}?`)) {
      onCheckout(cart, cartTotal);
      setCart([]);
    }
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] -m-6 md:m-0 gap-6">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/50 rounded-2xl md:bg-transparent">
        <div className="mb-4 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Scan barcode or search item..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20 md:pb-0">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex flex-col h-full group ${
                  product.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'
                }`}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{product.category}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-bold text-primary">₹{product.retailPrice}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {product.stock > 0 ? `${product.stock} left` : 'Out'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white border border-slate-200 shadow-xl flex flex-col rounded-2xl overflow-hidden fixed right-0 top-0 h-full z-20 md:static md:h-auto md:z-auto">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Current Sale
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-800 truncate">{item.name}</h4>
                  <p className="text-sm text-slate-500">₹{item.priceAtSale} / unit</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-white rounded shadow-sm">
                    <Minus className="w-3 h-3 text-slate-600" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-white rounded shadow-sm">
                    <Plus className="w-3 h-3 text-slate-600" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">₹{item.quantity * item.priceAtSale}</p>
                  <button onClick={() => removeFromCart(item.productId)} className="text-xs text-red-500 hover:underline mt-1">
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4">
          <div className="flex justify-between items-center text-slate-600">
            <span>Subtotal</span>
            <span>₹{cartTotal}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Tax (0%)</span>
            <span>₹0</span>
          </div>
          <div className="flex justify-between items-center text-xl font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total</span>
            <span>₹{cartTotal}</span>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-transform active:scale-95 ${
              cart.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-primary hover:bg-blue-700 shadow-primary/30'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;