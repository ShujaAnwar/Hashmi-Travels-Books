
import React, { useState, useEffect } from 'react';
import { Account, AccountType } from '../types';
import { X, Save, BookOpen } from 'lucide-react';

interface AccountFormProps {
  initialData?: Account;
  onClose: () => void;
  onSave: (data: any) => void;
  isCompact?: boolean;
}

const AccountForm: React.FC<AccountFormProps> = ({ initialData, onClose, onSave, isCompact }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: AccountType.EXPENSE as AccountType
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        type: initialData.type
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert("Account title is required");
      return;
    }
    onSave(formData);
  };

  const inputClass = `w-full border-slate-200 dark:border-slate-800 rounded-2xl px-5 focus:ring-emerald-500 transition-all font-medium bg-slate-50/50 dark:bg-slate-800 dark:text-white ${isCompact ? 'py-2.5 text-xs' : 'py-3.5 text-sm'}`;
  const labelClass = `block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 ${isCompact ? 'mb-1' : 'mb-2'}`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
      <div className={`bg-white dark:bg-slate-900 w-full sm:max-w-md sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom sm:slide-in-from-top-4 duration-300 flex flex-col rounded-t-[2.5rem]`}>
        <div className={`bg-slate-900 dark:bg-slate-950 px-8 text-white flex justify-between items-center shrink-0 ${isCompact ? 'py-5' : 'py-7'}`}>
          <div>
            <h3 className={`${isCompact ? 'text-lg' : 'text-xl'} font-black uppercase tracking-tight`}>{initialData ? 'Edit' : 'Add'} Account</h3>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Chart of Accounts Registry</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={`p-8 space-y-6`}>
          <div>
            <label className={labelClass}>Account Title *</label>
            <div className="relative">
               <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input type="text" required className={`${inputClass} pl-12`} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Utility Bills, Bank Charges" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Accounting Classification</label>
            <select className={inputClass} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as AccountType})}>
              {Object.values(AccountType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <p className="text-[9px] font-bold text-slate-400 mt-2 ml-1 leading-relaxed">
              Selection determines how this account impacts the Balance Sheet and P&L reports.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:opacity-80 transition-all">Cancel</button>
            <button type="submit" className="flex-1 bg-slate-900 dark:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl hover:opacity-90 transition-all">
              <Save size={16} /> Save Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;
