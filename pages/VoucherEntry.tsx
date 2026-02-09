
import React, { useState, useEffect } from 'react';
import { db } from '../store';
import { VoucherType, Voucher, Currency } from '../types';
import { Trash2, Plus, Save, AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react';

interface EntryRow {
  account_id: string;
  contact_id?: string;
  debit: number;
  credit: number;
}

interface VoucherEntryProps {
  onComplete: () => void;
  initialData?: Voucher | null;
  editingData?: Voucher | null;
}

const VoucherEntry: React.FC<VoucherEntryProps> = ({ onComplete, initialData, editingData }) => {
  const isEdit = !!editingData;
  const accounts = db.getAccounts();
  const settings = db.getSettings();
  const parties = [...db.getCustomers(false), ...db.getVendors(false)];

  const [type, setType] = useState<VoucherType>(VoucherType.CASH);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState<Currency>('PKR');
  const [roe, setROE] = useState(1);
  const [description, setDescription] = useState('');
  const [entries, setEntries] = useState<EntryRow[]>([
    { account_id: '', debit: 0, credit: 0 },
    { account_id: '', debit: 0, credit: 0 },
  ]);

  useEffect(() => {
    const dataToLoad = editingData || initialData;
    if (dataToLoad) {
      setType(dataToLoad.type);
      setDate(isEdit ? dataToLoad.date : new Date().toISOString().split('T')[0]);
      setCurrency(dataToLoad.currency);
      setROE(dataToLoad.roe);
      setDescription(dataToLoad.description);
      setEntries(dataToLoad.entries.map(e => ({
        account_id: e.account_id,
        contact_id: e.contact_id,
        debit: e.debit / dataToLoad.roe,
        credit: e.credit / dataToLoad.roe
      })));
    }
  }, [initialData, editingData]);

  const handleCurrencyChange = (cur: Currency) => {
    setCurrency(cur);
    setROE(cur === 'SAR' ? settings.defaultROE : 1);
  };

  const totalDebit = entries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const totalPKR = totalDebit * roe;

  const handleAddRow = () => {
    setEntries([...entries, { account_id: '', debit: 0, credit: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const handleEntryChange = (index: number, field: keyof EntryRow, value: any) => {
    const newEntries = [...entries];
    // @ts-ignore
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

  const handleSave = () => {
    if (!isBalanced) return;

    const prefix = type.charAt(0).toUpperCase();
    const payload = {
      date,
      type,
      description,
      total_amount: totalPKR,
      currency,
      roe,
      entries: entries.map(e => ({
        id: `entry-${Math.random()}`,
        voucher_id: '',
        account_id: e.account_id,
        contact_id: e.contact_id,
        debit: e.debit * roe,
        credit: e.credit * roe
      }))
    };

    if (isEdit) {
      db.updateVoucher(editingData!.id, payload);
    } else {
      db.addVoucher({
        ...payload,
        voucher_no: `${prefix}V-${Date.now().toString().slice(-6)}`
      });
    }

    onComplete();
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {isEdit && (
         <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800 font-bold text-sm">
            <AlertTriangle size={20}/>
            Editing Mode: Updating this voucher will replace all associated ledger entries.
         </div>
      )}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 px-8 py-8 text-white flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-tight">{isEdit ? 'Edit' : (initialData ? 'Clone' : 'New')} Ledger Entry</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Universal Double-Entry Accounting System</p>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-slate-800 p-3 rounded-2xl border border-white/5 space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Voucher Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent border-none text-white text-sm font-bold p-0 focus:ring-0 block" />
             </div>
             <div className="bg-slate-800 p-3 rounded-2xl border border-white/5 space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as VoucherType)} className="bg-transparent border-none text-white text-sm font-bold p-0 focus:ring-0 block uppercase">
                   {Object.values(VoucherType).filter(v => v !== VoucherType.OPENING).map(v => <option key={v} value={v} className="text-slate-900">{v}</option>)}
                </select>
             </div>
             <div className="bg-slate-800 p-3 rounded-2xl border border-white/5 space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Currency</label>
                <select value={currency} onChange={(e) => handleCurrencyChange(e.target.value as Currency)} className="bg-transparent border-none text-white text-sm font-bold p-0 focus:ring-0 block uppercase">
                   <option value="PKR" className="text-slate-900">PKR</option>
                   <option value="SAR" className="text-slate-900">SAR</option>
                </select>
             </div>
             {currency === 'SAR' && (
               <div className="bg-slate-800 p-3 rounded-2xl border border-white/5 space-y-1 animate-in slide-in-from-right-2">
                  <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Exchange ROE</label>
                  <input type="number" value={roe} onChange={e => setROE(Number(e.target.value))} className="bg-transparent border-none text-white text-sm font-bold p-0 focus:ring-0 block w-20" />
               </div>
             )}
          </div>
        </div>

        <div className="p-10 space-y-10">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Transaction Narration</label>
            <textarea 
              className="w-full border-slate-200 rounded-2xl focus:ring-slate-900 focus:border-slate-900 p-5 bg-slate-50 text-sm font-medium"
              rows={2}
              placeholder="Provide a detailed description of this entry..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
            <table className="w-full">
              <thead>
                 <tr className="bg-slate-50 border-b border-slate-100 text-left">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ledger Account</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Party Integration</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Debit ({currency})</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Credit ({currency})</th>
                    <th className="px-6 py-4 text-center"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {entries.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-4 w-1/3">
                      <select 
                        className="w-full border-slate-200 rounded-xl text-sm font-medium bg-white"
                        value={entry.account_id}
                        onChange={(e) => handleEntryChange(idx, 'account_id', e.target.value)}
                      >
                        <option value="">Select Account</option>
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.title} ({acc.type})</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-4 w-1/4">
                      <select 
                        className="w-full border-slate-200 rounded-xl text-sm font-medium bg-white"
                        value={entry.contact_id || ''}
                        onChange={(e) => handleEntryChange(idx, 'contact_id', e.target.value)}
                      >
                        <option value="">N/A (General Line)</option>
                        {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <input 
                        type="number" 
                        className="w-full text-right border-slate-200 rounded-xl text-sm font-black bg-white"
                        value={entry.debit || ''}
                        placeholder="0.00"
                        onChange={(e) => handleEntryChange(idx, 'debit', Number(e.target.value))}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input 
                        type="number" 
                        className="w-full text-right border-slate-200 rounded-xl text-sm font-black bg-white"
                        value={entry.credit || ''}
                        placeholder="0.00"
                        onChange={(e) => handleEntryChange(idx, 'credit', Number(e.target.value))}
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => handleRemoveRow(idx)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <div className="flex gap-12">
               <button 
                 onClick={handleAddRow}
                 className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
               >
                 <Plus size={16} /> Add Entry Line
               </button>
               <div className="flex gap-10 border-l border-slate-200 pl-10">
                  <div className="text-center">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Debit ({currency})</p>
                     <p className="text-lg font-black text-slate-900">{totalDebit.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Credit ({currency})</p>
                     <p className="text-lg font-black text-slate-900">{totalCredit.toLocaleString()}</p>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="text-right border-r border-slate-200 pr-6">
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Posting Total (PKR)</p>
                  <p className="text-2xl font-black text-slate-900">Rs. {totalPKR.toLocaleString()}</p>
               </div>

              {!isBalanced && totalDebit > 0 && (
                <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <AlertCircle size={18} /> Mismatch
                </div>
              )}
              
              <button 
                disabled={!isBalanced}
                onClick={handleSave}
                className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all ${
                  isBalanced 
                    ? 'bg-slate-900 text-white hover:bg-slate-800' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Save size={18} /> {isEdit ? 'Update Voucher' : 'Save & Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherEntry;
