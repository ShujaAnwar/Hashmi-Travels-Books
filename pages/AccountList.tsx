
import React, { useState, useMemo } from 'react';
import { db } from '../store';
import { Account } from '../types';
import { Search, Plus, Edit2, Trash2, BookOpen, Filter, AlertCircle, LayoutList } from 'lucide-react';
import AccountForm from '../components/AccountForm';

const AccountList: React.FC<{ isCompact: boolean, onViewLedger: (id: string) => void }> = ({ isCompact, onViewLedger }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);

  const accounts = db.getAccounts();

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => 
      acc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      acc.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accounts, searchTerm]);

  const handleSave = (data: any) => {
    if (editingAccount) {
      db.updateAccount(editingAccount.id, data);
    } else {
      db.addAccount(data);
    }
    setIsFormOpen(false);
    setEditingAccount(undefined);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this account from the ledger? This cannot be undone.")) {
      try {
        db.deleteAccount(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className={`${isCompact ? 'space-y-4' : 'space-y-6'}`}>
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 no-print">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
           <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Search by account title or classification..." 
               className={`w-full pl-11 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-emerald-500 shadow-sm font-medium dark:text-white ${isCompact ? 'py-1.5 text-xs' : 'py-2.5 text-sm'}`}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
        <button 
          onClick={() => { setEditingAccount(undefined); setIsFormOpen(true); }}
          className={`bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-slate-900/10 ${isCompact ? 'px-4 py-2' : 'px-8 py-3'}`}
        >
          <Plus size={16} /> New Account
        </button>
      </div>

      {/* Main Registry */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-800 text-white uppercase text-[9px] font-black tracking-widest sticky top-0 z-20">
                <th className={`px-8 ${isCompact ? 'py-3' : 'py-5'}`}>Ledger Account Title</th>
                <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Classification</th>
                <th className={`px-6 text-right ${isCompact ? 'py-3' : 'py-5'}`}>Current Balance (PKR)</th>
                <th className={`px-8 text-right ${isCompact ? 'py-3' : 'py-5'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAccounts.map(acc => {
                const balance = db.getAccountLedger(acc.id).closingBalance;
                return (
                  <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className={`px-8 ${isCompact ? 'py-2.5' : 'py-5'}`}>
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500">
                          <BookOpen size={14} />
                        </div>
                        <span className={`font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight ${isCompact ? 'text-[10px]' : 'text-xs'}`}>{acc.title}</span>
                      </div>
                    </td>
                    <td className={`px-6 ${isCompact ? 'py-2.5' : 'py-5'}`}>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest">{acc.type}</span>
                    </td>
                    <td className={`px-6 text-right ${isCompact ? 'py-2.5' : 'py-5'}`}>
                      <div className={`font-black ${isCompact ? 'text-xs' : 'text-sm'} ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        Rs. {Math.abs(balance).toLocaleString()}
                        <span className="text-[8px] ml-1 opacity-40">{balance >= 0 ? 'Dr' : 'Cr'}</span>
                      </div>
                    </td>
                    <td className={`px-8 text-right ${isCompact ? 'py-2.5' : 'py-5'}`}>
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => onViewLedger(acc.id)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-blue-600 hover:text-white rounded-lg transition-all" title="View Ledger"><LayoutList size={14} /></button>
                         <button onClick={() => { setEditingAccount(acc); setIsFormOpen(true); }} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-900 hover:text-white rounded-lg transition-all" title="Edit Account"><Edit2 size={14} /></button>
                         <button onClick={() => handleDelete(acc.id)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-600 hover:text-white rounded-lg transition-all" title="Delete Account"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center opacity-10">
                      <BookOpen size={48} className="mb-4" />
                      <p className="text-sm font-black uppercase tracking-widest">No Accounts Defined</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <AccountForm 
          isCompact={isCompact}
          initialData={editingAccount} 
          onClose={() => { setIsFormOpen(false); setEditingAccount(undefined); }} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};

export default AccountList;
