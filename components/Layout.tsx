
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { db } from '../store';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Hotel,
  Bus,
  Menu,
  X,
  Moon,
  Minimize2,
  Maximize2,
  ShieldAlert,
  Plane,
  FileBadge,
  LogOut,
  User,
  Settings,
  Ticket,
  RefreshCw
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isCompact: boolean;
  setIsCompact: (compact: boolean) => void;
  userEmail?: string;
  isSyncing?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activePage, 
  setActivePage,
  theme,
  setTheme,
  isCompact,
  setIsCompact,
  userEmail,
  isSyncing
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const settings = db.getSettings();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'vouchers', label: 'Journal Vouchers', icon: <FileText size={20} /> },
    { id: 'receipts', label: 'Receipt Vouchers', icon: <Ticket size={20} /> },
    { id: 'tickets', label: 'Air Tickets', icon: <Plane size={20} /> },
    { id: 'visas', label: 'Visa Processing', icon: <FileBadge size={20} /> },
    { id: 'hotel-vouchers', label: 'Hotel Bookings', icon: <Hotel size={20} /> },
    { id: 'transport-vouchers', label: 'Transport Bills', icon: <Bus size={20} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
    { id: 'vendors', label: 'Vendors', icon: <Truck size={20} /> },
    { id: 'accounts', label: 'Chart of Accounts', icon: <BookOpen size={20} /> },
    { id: 'reports', label: 'Reports & AI', icon: <BarChart3 size={20} /> },
    { id: 'cpanel', label: 'Control Panel', icon: <Settings size={20} /> },
    { id: 'security', label: 'Security & Audit', icon: <ShieldAlert size={20} /> },
  ];

  const handleNavClick = (id: string) => {
    setActivePage(id);
    setIsSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans antialiased theme-transition">
      {(isSidebarOpen) && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 transform no-print
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${!isCompact ? 'lg:translate-x-0 lg:static lg:inset-0' : ''}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.logoBase64 ? (
               <div className="w-10 h-10 bg-white rounded-xl overflow-hidden shadow-lg border border-white/10">
                 <img src={settings.logoBase64} className="w-full h-full object-contain p-1" alt="Logo" />
               </div>
            ) : (
               <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-900/20">
                 <Plane size={24} className="text-white" />
               </div>
            )}
            <span className="font-black text-lg tracking-tight uppercase">{settings.appName}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {isSyncing && (
          <div className="mx-6 mb-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
             <RefreshCw size={12} className="text-emerald-400 animate-spin" />
             <span className="text-[9px] font-black uppercase text-emerald-400">Syncing Database...</span>
          </div>
        )}

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                (activePage === item.id || 
                 (item.id === 'hotel-vouchers' && (activePage === 'hotel-voucher-new' || activePage === 'hotel-voucher-view')) || 
                 (item.id === 'receipts' && activePage === 'receipt-new') ||
                 (item.id === 'tickets' && (activePage === 'ticket-new')) ||
                 (item.id === 'visas' && (activePage === 'visa-new')) ||
                 (item.id === 'transport-vouchers' && activePage === 'transport-voucher-new'))
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40 font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 font-medium'
              }`}
            >
              {item.icon}
              <span className="text-sm uppercase tracking-wider text-[10px] font-black">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 bg-slate-950/50 mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 mb-3">
            <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
              <User size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Operator</p>
              <p className="text-[10px] font-bold text-white truncate">{userEmail}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>

        <div className="p-6 border-t border-slate-800 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{settings.appName} Core v4.1</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative flex flex-col min-w-0 theme-transition">
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3 flex justify-between items-center no-print shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors ${!isCompact ? 'lg:hidden' : 'block'}`}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[150px] sm:max-w-none">
              {activePage === 'cpanel' ? 'Control Panel' : activePage.split('-').join(' ')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
               <button 
                 onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                 className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-slate-800 text-yellow-400 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <Moon size={16} />
               </button>
               <button 
                 onClick={() => setIsCompact(!isCompact)}
                 className={`p-2 rounded-xl transition-all ${isCompact ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {isCompact ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
               </button>
            </div>
          </div>
        </header>

        <div className={`${isCompact ? 'p-3 lg:p-6' : 'p-4 lg:p-10'} min-w-0 flex-1 transition-all duration-300`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;