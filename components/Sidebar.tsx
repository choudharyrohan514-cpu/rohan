import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Sparkles, Settings, Store } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const menuItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: View.INVENTORY, label: 'Inventory', icon: Package },
    { id: View.POS, label: 'Point of Sale', icon: ShoppingCart },
    { id: View.AI_INSIGHTS, label: 'AI Assistant', icon: Sparkles },
    { id: View.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-slate-200 flex flex-col fixed left-0 top-0 z-10 shadow-sm">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Store className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 text-lg leading-tight">WholesaleFlow</h1>
          <p className="text-xs text-slate-500">Store Manager</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-slate-700 font-medium">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;