import React, { useMemo } from 'react';
import { Product, Sale } from '../types';
import { DollarSign, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; color: string }> = ({
  title,
  value,
  icon: Icon,
  color,
}) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ products, sales }) => {
  
  const stats = useMemo(() => {
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.wholesalePrice * p.stock), 0);
    const totalSalesRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
    const lowStockCount = products.filter(p => p.stock <= p.minStockLevel).length;
    const totalItems = products.reduce((acc, p) => acc + p.stock, 0);

    return { totalInventoryValue, totalSalesRevenue, lowStockCount, totalItems };
  }, [products, sales]);

  // Prepare Chart Data
  const salesData = useMemo(() => {
    // Group sales by date (last 7 days)
    const last7Days = new Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const daySales = sales.filter(s => s.date.startsWith(date));
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: daySales.reduce((sum, s) => sum + s.totalAmount, 0),
        orders: daySales.length
      };
    });
  }, [sales]);

  const stockData = useMemo(() => {
    return products.slice(0, 8).map(p => ({
      name: p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name,
      stock: p.stock
    }));
  }, [products]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Store Overview</h2>
          <p className="text-slate-500">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                {new Date().toLocaleDateString()}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalSalesRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Inventory Value" 
          value={`₹${stats.totalInventoryValue.toLocaleString()}`} 
          icon={Package} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Total Items in Stock" 
          value={stats.totalItems.toLocaleString()} 
          icon={TrendingUp} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={stats.lowStockCount.toString()} 
          icon={AlertTriangle} 
          color={stats.lowStockCount > 0 ? "bg-rose-500" : "bg-slate-400"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Weekly Sales Revenue</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [`₹${val}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Stock Levels (Top Items)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="stock" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;