
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  BookOpen, 
  FileText, 
  BarChart3, 
  PlusCircle,
  LogOut,
  Hotel,
  Ticket,
  Bus,
  Menu,
  X,
  Plus,
  Sun,
  Moon,
  Minimize2,
  Maximize2,
  ShieldAlert,
  Plane,
  FileBadge
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isCompact: boolean;
  setIsCompact: (compact: boolean) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activePage, 
  setActivePage,
  theme,
  setTheme,
  isCompact,
  setIsCompact
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    { id: 'security', label: 'Security & Audit', icon: <ShieldAlert size={20} /> },
  ];

  const handleNavClick = (id: string) => {
    setActivePage(id);
    setIsSidebarOpen(false);
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
            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-900/20">
              <Plane size={24} className="text-white" />
            </div>
            <span className="font-black text-xl tracking-tight uppercase">TravelLedger</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

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
              <span className="text-sm uppercase tracking-wider text-[11px] font-black">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-rose-400 transition-colors font-bold text-sm uppercase tracking-widest text-[11px]">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
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
              {activePage.split('-').join(' ')}
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
