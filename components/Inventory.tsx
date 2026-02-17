import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Search, Trash2, Edit2, Save, X, CloudDownload, CloudUpload } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface InventoryProps {
  products: Product[];
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onLoadFromSheet: () => void;
  onSaveToSheet: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ 
  products, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  onLoadFromSheet,
  onSaveToSheet 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: CATEGORIES[0],
    wholesalePrice: 0,
    retailPrice: 0,
    stock: 0,
    minStockLevel: 10
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: CATEGORIES[0],
        wholesalePrice: 0,
        retailPrice: 0,
        stock: 0,
        minStockLevel: 10
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.wholesalePrice) return;

    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...formData } as Product);
    } else {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        ...formData as Omit<Product, 'id'>
      };
      onAddProduct(newProduct);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
          <p className="text-slate-500">Track stock levels and pricing.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={onLoadFromSheet}
            className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm text-sm"
            title="Download data from Google Sheet (Overwrites local)"
          >
            <CloudDownload className="w-4 h-4" />
            <span className="hidden sm:inline">Load from Cloud</span>
            <span className="sm:hidden">Load</span>
          </button>
           <button 
            onClick={onSaveToSheet}
            className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-green-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm text-sm"
            title="Upload local data to Google Sheet"
          >
            <CloudUpload className="w-4 h-4" />
            <span className="hidden sm:inline">Save to Cloud</span>
            <span className="sm:hidden">Save</span>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-semibold text-slate-600 text-sm">Product Name</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Category</th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Wholesale (₹)</th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Retail (₹)</th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-center">Stock</th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{product.name}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{product.category}</span>
                  </td>
                  <td className="p-4 text-slate-600 text-right">₹{product.wholesalePrice}</td>
                  <td className="p-4 text-slate-600 text-right">₹{product.retailPrice}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock <= product.minStockLevel ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {product.stock} Units
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => handleOpenModal(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Stock Qty</label>
                   <input
                    required
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Wholesale Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.wholesalePrice}
                      onChange={e => setFormData({...formData, wholesalePrice: Number(e.target.value)})}
                      className="w-full pl-7 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Retail Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.retailPrice}
                      onChange={e => setFormData({...formData, retailPrice: Number(e.target.value)})}
                      className="w-full pl-7 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm flex justify-center items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;