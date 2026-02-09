
import React, { useState, useMemo } from 'react';
import { db } from '../store';
import { Customer } from '../types';
import { Search, Printer, UserPlus, Edit2, Trash2, LayoutList, CheckCircle2, XCircle, Copy, Filter } from 'lucide-react';
import PartyForm from '../components/PartyForm';

const CustomerList: React.FC<{ 
  isCompact: boolean,
  onViewLedger: (id: string) => void,
  onPrintLedger: (id: string) => void
}> = ({ isCompact, onViewLedger, onPrintLedger }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);

  const customers = db.getCustomers();

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           c.customer_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || 
                           (statusFilter === 'ACTIVE' && c.is_active) || 
                           (statusFilter === 'INACTIVE' && !c.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  const handleSave = (data: any) => {
    if (editingCustomer && !editingCustomer.id.startsWith('new_clone_')) {
      db.updateCustomer(editingCustomer.id, data);
    } else {
      db.addCustomer(data);
    }
    setIsFormOpen(false);
    setEditingCustomer(undefined);
  };

  const handleClone = (customer: Customer) => {
    const clone: any = { ...customer, id: 'new_clone_' + Date.now(), customer_code: '', opening_balance: 0 };
    setEditingCustomer(clone);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this corporate account?")) {
      try { db.deleteCustomer(id); } catch (err: any) { alert(err.message); }
    }
  };

  return (
    <div className={`${isCompact ? 'space-y-4' : 'space-y-6'}`}>
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 no-print">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
           <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Corporate Search..." 
               className={`w-full pl-11 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-emerald-500 shadow-sm font-medium dark:text-white ${isCompact ? 'py-1.5 text-xs' : 'py-2.5 text-sm'}`}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <select 
             className={`px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest shadow-sm focus:ring-emerald-500 ${isCompact ? 'py-1.5' : 'py-2.5'}`}
             value={statusFilter}
             onChange={e => setStatusFilter(e.target.value as any)}
           >
             <option value="ALL">All States</option>
             <option value="ACTIVE">Active Only</option>
             <option value="INACTIVE">Inactive Only</option>
           </select>
        </div>
        <div className="flex gap-2">
           <button onClick={() => window.print()} className={`flex-1 sm:flex-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${isCompact ? 'px-4 py-2' : 'px-6 py-3'}`}>
              <Printer size={14} /> <span className="hidden sm:inline">Export</span>
           </button>
           <button 
             onClick={() => { setEditingCustomer(undefined); setIsFormOpen(true); }}
             className={`flex-1 sm:flex-none bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-slate-900/10 ${isCompact ? 'px-4 py-2' : 'px-8 py-3'}`}
           >
             <UserPlus size={16} /> New Entity
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-800 text-white uppercase text-[9px] font-black tracking-widest">
                <th className={`px-6 sticky left-0 bg-slate-900 dark:bg-slate-800 z-10 ${isCompact ? 'py-2' : 'py-3'}`}>Code</th>
                <th className={`px-6 ${isCompact ? 'py-2' : 'py-3'}`}>Corporate Title</th>
                <th className={`px-6 ${isCompact ? 'py-2' : 'py-3'}`}>Communication</th>
                <th className={`px-6 text-right ${isCompact ? 'py-2' : 'py-3'}`}>Balance (PKR)</th>
                <th className={`px-6 text-center ${isCompact ? 'py-2' : 'py-3'}`}>Status</th>
                <th className={`px-6 text-right sticky right-0 bg-slate-900 dark:bg-slate-800 z-10 border-l border-slate-800 ${isCompact ? 'py-2' : 'py-3'}`}>Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.map(c => {
                const ledger = db.getPartyLedger(c.id, 'Customer');
                return (
                  <tr key={c.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group ${!c.is_active ? 'opacity-50' : ''}`}>
                    <td className={`px-6 font-black text-blue-600 dark:text-blue-400 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 z-10 ${isCompact ? 'py-1.5 text-[10px]' : 'py-3 text-xs'}`}>{c.customer_code}</td>
                    <td className={`px-6 ${isCompact ? 'py-1.5' : 'py-3'}`}>
                      <div className={`font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>{c.name}</div>
                      <div className={`text-slate-400 font-bold uppercase tracking-wide truncate max-w-[180px] mt-0.5 ${isCompact ? 'text-[7px]' : 'text-[9px]'}`}>{c.address || c.city}</div>
                    </td>
                    <td className={`px-6 ${isCompact ? 'py-1.5' : 'py-3'}`}>
                      <div className={`font-bold text-slate-700 dark:text-slate-300 ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>{c.phone}</div>
                      <div className={`text-slate-400 dark:text-slate-500 font-medium lowercase truncate max-w-[150px] ${isCompact ? 'text-[8px]' : 'text-[10px]'}`}>{c.email}</div>
                    </td>
                    <td className={`px-6 text-right ${isCompact ? 'py-1.5' : 'py-3'}`}>
                      <div className={`font-black ${isCompact ? 'text-[10px]' : 'text-sm'} ${ledger.closingBalance >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'}`}>
                        {Math.abs(ledger.closingBalance).toLocaleString()}
                        <span className="text-[7px] ml-1 opacity-40">{ledger.closingBalance >= 0 ? 'DR' : 'CR'}</span>
                      </div>
                    </td>
                    <td className={`px-6 text-center ${isCompact ? 'py-1.5' : 'py-3'}`}>
                      {c.is_active ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-xl text-[7px] font-black uppercase tracking-widest">Active</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded-xl text-[7px] font-black uppercase tracking-widest">Inactive</span>
                      )}
                    </td>
                    <td className={`px-6 text-right sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 z-10 border-l border-slate-50 dark:border-slate-800 ${isCompact ? 'py-1.5' : 'py-3'}`}>
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => onViewLedger(c.id)} className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-blue-600 hover:text-white rounded transition-all"><LayoutList size={12} /></button>
                         <button onClick={() => { setEditingCustomer(c); setIsFormOpen(true); }} className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-900 hover:text-white rounded transition-all"><Edit2 size={12} /></button>
                         <button onClick={() => handleClone(c)} className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-sky-600 hover:text-white rounded transition-all"><Copy size={12} /></button>
                         <button onClick={() => handleDelete(c.id)} className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-600 hover:text-white rounded transition-all"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <PartyForm 
          isCompact={isCompact}
          type="Customer" 
          initialData={editingCustomer} 
          onClose={() => { setIsFormOpen(false); setEditingCustomer(undefined); }} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};

export default CustomerList;
