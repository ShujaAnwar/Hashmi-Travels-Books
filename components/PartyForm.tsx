
import React, { useState, useEffect } from 'react';
import { Customer, Vendor, OpeningBalanceType } from '../types';
import { X, Save, ShieldCheck } from 'lucide-react';

interface PartyFormProps {
  type: 'Customer' | 'Vendor';
  initialData?: Customer | Vendor;
  onClose: () => void;
  onSave: (data: any) => void;
  isCompact?: boolean;
}

const PartyForm: React.FC<PartyFormProps> = ({ type, initialData, onClose, onSave, isCompact }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    opening_balance: 0,
    opening_balance_type: (type === 'Customer' ? 'Receivable' : 'Payable') as OpeningBalanceType,
    is_active: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        phone: initialData.phone,
        email: initialData.email,
        address: initialData.address,
        city: initialData.city,
        opening_balance: initialData.opening_balance,
        opening_balance_type: initialData.opening_balance_type,
        is_active: initialData.is_active
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Name is required");
      return;
    }
    onSave(formData);
  };

  const inputClass = `w-full border-slate-200 dark:border-slate-800 rounded-2xl px-5 focus:ring-emerald-500 transition-all font-medium bg-slate-50/50 dark:bg-slate-800 dark:text-white ${isCompact ? 'py-2.5 text-xs' : 'py-3.5 text-sm'}`;
  const labelClass = `block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 ${isCompact ? 'mb-1' : 'mb-2'}`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 transition-all duration-300">
      <div className={`bg-white dark:bg-slate-900 w-full sm:max-w-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom sm:slide-in-from-top-4 duration-300 flex flex-col rounded-t-[2.5rem] ${isCompact ? 'h-[85vh] sm:h-auto' : 'h-[95vh] sm:h-auto'}`}>
        <div className={`bg-slate-900 dark:bg-slate-950 px-8 text-white flex justify-between items-center shrink-0 ${isCompact ? 'py-5' : 'py-7'}`}>
          <div>
            <h3 className={`${isCompact ? 'text-lg' : 'text-xl'} font-black uppercase tracking-tight`}>{initialData ? 'Edit' : 'Add'} {type}</h3>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Unified Entity Master</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={`overflow-y-auto flex-1 scrollbar-hide ${isCompact ? 'p-6 lg:p-8' : 'p-6 lg:p-10'}`}>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${isCompact ? 'gap-4' : 'gap-6 lg:gap-8'}`}>
            <div className="md:col-span-2">
              <label className={labelClass}>{type} Corporate Name *</label>
              <input type="text" required className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Legal Business Title" />
            </div>
            
            <div>
              <label className={labelClass}>Direct Phone</label>
              <input type="tel" className={inputClass} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Ph / Mobile" />
            </div>

            <div>
              <label className={labelClass}>Email (Billing)</label>
              <input type="email" className={inputClass} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="finance@neemtree.com" />
            </div>

            <div>
              <label className={labelClass}>Operational City</label>
              <input type="text" className={inputClass} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="e.g. Karachi" />
            </div>

            <div>
               <label className={labelClass}>Lifecycle Status</label>
               <select className={inputClass} value={formData.is_active ? 'true' : 'false'} onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})}>
                 <option value="true">Active & Visible</option>
                 <option value="false">Inactive / Restricted</option>
               </select>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Registered Address</label>
              <input type="text" className={inputClass} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Office address details" />
            </div>

            <div className={`bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] md:col-span-2 border border-slate-100 dark:border-slate-800 shadow-inner ${isCompact ? 'p-5' : 'p-6 lg:p-8'}`}>
               <div className={`flex items-center gap-3 ${isCompact ? 'mb-4' : 'mb-6'}`}>
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck size={isCompact ? 16 : 20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Financial Opening Setup</span>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Initial Balance (PKR)</label>
                    <input type="number" className={`${inputClass} bg-white dark:bg-slate-900 font-black text-base`} value={formData.opening_balance} onChange={e => setFormData({...formData, opening_balance: Number(e.target.value)})} disabled={!!initialData} />
                  </div>
                  <div>
                    <label className={labelClass}>Ledger Side</label>
                    <select className={`${inputClass} bg-white dark:bg-slate-900 font-bold`} value={formData.opening_balance_type} onChange={e => setFormData({...formData, opening_balance_type: e.target.value as OpeningBalanceType})} disabled={!!initialData}>
                      {type === 'Customer' ? (
                        <>
                          <option value="Receivable">Debit (Receivable)</option>
                          <option value="Payable">Credit (Advance)</option>
                        </>
                      ) : (
                        <>
                          <option value="Payable">Credit (Payable)</option>
                          <option value="Advance">Debit (Advance Payment)</option>
                        </>
                      )}
                    </select>
                  </div>
               </div>
            </div>
          </div>

          <div className={`flex flex-col-reverse sm:flex-row gap-3 ${isCompact ? 'mt-8' : 'mt-12'}`}>
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:opacity-80 transition-all">Cancel</button>
            <button type="submit" className="flex-1 bg-slate-900 dark:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl hover:opacity-90 transition-all">
              <Save size={16} /> Save Entity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartyForm;
