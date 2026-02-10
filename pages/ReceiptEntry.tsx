
import React, { useState, useEffect } from 'react';
import { db } from '../store';
import { ReceiptSourceType, AccountType, Receipt, Currency } from '../types';
import { Save, ArrowLeft, Wallet, Hash, RefreshCcw, DollarSign } from 'lucide-react';

interface ReceiptEntryProps {
  onComplete: () => void;
  onBack: () => void;
  initialData?: Receipt | null;
  editingData?: Receipt | null;
}

const ReceiptEntry: React.FC<ReceiptEntryProps> = ({ onComplete, onBack, initialData, editingData }) => {
  const isEdit = !!editingData;
  const isClone = !!initialData;
  const customers = db.getCustomers();
  const vendors = db.getVendors();
  const accounts = db.getAccounts();
  const settings = db.getSettings();
  const cashBankAccounts = accounts.filter(a => a.type === AccountType.CASH || a.type === AccountType.BANK);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Customer' as ReceiptSourceType,
    customerId: '',
    vendorId: '',
    targetAccountId: cashBankAccounts[0]?.id || '',
    amount: 0,
    currency: 'PKR' as Currency,
    roe: settings.defaultROE || 1,
    narration: ''
  });

  useEffect(() => {
    const data = editingData || initialData;
    if (data) {
      setFormData({
        date: isEdit ? data.date : new Date().toISOString().split('T')[0],
        type: data.type,
        customerId: data.customer_id || '',
        vendorId: data.vendor_id || '',
        targetAccountId: data.account_id,
        amount: data.currency === 'PKR' ? data.amount : (data.amount / (data.roe || 1)),
        currency: data.currency,
        roe: data.roe || (data.currency === 'SAR' ? settings.defaultROE : 1),
        narration: isClone ? `Cloned Receipt: ${data.narration}` : data.narration
      });
    }
  }, [initialData, editingData]);

  const totalPKR = formData.currency === 'PKR' ? formData.amount : (formData.amount * formData.roe);

  const handleSave = () => {
    if (!formData.targetAccountId || totalPKR <= 0 || (!formData.customerId && formData.type === 'Customer') || (!formData.vendorId && formData.type === 'Vendor')) {
      alert("Please fill all required fields correctly.");
      return;
    }

    const partyId = formData.type === 'Customer' ? formData.customerId : formData.vendorId;
    const receivableAcc = accounts.find(a => a.type === AccountType.RECEIVABLE);
    const payableAcc = accounts.find(a => a.type === AccountType.PAYABLE);

    let offsetAccountId = '';
    if (formData.type === 'Customer') offsetAccountId = receivableAcc?.id || '';
    else if (formData.type === 'Vendor') offsetAccountId = payableAcc?.id || '';

    if (!offsetAccountId) {
      alert("System Configuration Error: Receivable/Payable accounts not found in Chart of Accounts.");
      return;
    }

    // Double Entry Impact:
    // Debit Bank/Cash (Asset Increases)
    // Credit Customer/Vendor (Asset/Liability Decreases - reducing outstanding)
    const entries = [
      { account_id: formData.targetAccountId, debit: totalPKR, credit: 0 },
      { account_id: offsetAccountId, contact_id: partyId, debit: 0, credit: totalPKR },
    ];

    const payload = {
      date: formData.date,
      type: formData.type,
      customer_id: formData.customerId || null,
      vendor_id: formData.vendorId || null,
      account_id: formData.targetAccountId,
      amount: totalPKR,
      currency: formData.currency,
      roe: formData.roe,
      narration: formData.narration || `${formData.type} receipt posted to ${db.getAccount(formData.targetAccountId)?.title}`
    };

    if (isEdit) {
       db.updateVoucher(editingData!.voucher_id, {
         date: formData.date, description: payload.narration, total_amount: totalPKR, entries
       });
       // Sync local receipts state manually or reload
    } else {
       db.addReceipt(payload, entries);
    }
    onComplete();
  };

  const labelClass = "block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1";
  const inputClass = "w-full border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-5 focus:ring-emerald-500 transition-all text-sm font-medium bg-slate-50/50 dark:bg-slate-800 dark:text-white";

  return (
    <div className="max-w-4xl mx-auto pb-12 px-2 sm:px-0">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-slate-900 dark:bg-slate-950 px-8 py-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ArrowLeft size={20} /></button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <Wallet className="text-sky-400" /> {isEdit ? 'Edit' : (isClone ? 'Clone' : 'New')} Receipt
              </h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Direct Ledger Settlement</p>
            </div>
          </div>
          <div className="bg-slate-800 p-3 rounded-2xl border border-white/5">
             <p className={labelClass + " text-sky-300 ml-0"}>Posting Date</p>
             <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-transparent border-none text-white text-sm font-bold p-0 focus:ring-0 w-32" />
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-8">
             <section>
               <label className={labelClass}>Source Entity Type</label>
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                  {['Customer', 'Vendor'].map(t => (
                    <button key={t} onClick={() => setFormData({...formData, type: t as any, customerId: '', vendorId: ''})} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === t ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400'}`}>{t}s</button>
                  ))}
               </div>
             </section>

             <section>
                <label className={labelClass}>Select {formData.type} Account</label>
                <select className={inputClass} value={formData.type === 'Customer' ? formData.customerId : formData.vendorId} onChange={e => setFormData({...formData, customerId: formData.type === 'Customer' ? e.target.value : '', vendorId: formData.type === 'Vendor' ? e.target.value : ''})}>
                   <option value="">Choose Ledger Account...</option>
                   {formData.type === 'Customer' ? customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
             </section>

             <section>
                <label className={labelClass}>Deposit Into (Bank/Cash)</label>
                <select className={inputClass} value={formData.targetAccountId} onChange={e => setFormData({...formData, targetAccountId: e.target.value})}>
                   {cashBankAccounts.map(a => <option key={a.id} value={a.id}>{a.title} ({a.type})</option>)}
                </select>
             </section>

             <section>
               <label className={labelClass}>Transaction Narration</label>
               <textarea className={inputClass + " h-24"} placeholder="Payment details, Cheque #, or reference..." value={formData.narration} onChange={e => setFormData({...formData, narration: e.target.value})} />
             </section>
           </div>

           <div className="space-y-8">
              <section className="bg-slate-950 rounded-[2.5rem] p-8 text-white space-y-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full -translate-y-16 translate-x-16 transition-transform group-hover:scale-125"></div>
                 
                 <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className={labelClass + " text-slate-500"}>Currency</label>
                          <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white font-bold focus:ring-sky-500" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value as any, roe: e.target.value === 'PKR' ? 1 : settings.defaultROE})}>
                             <option value="PKR" className="text-slate-900">PKR</option>
                             <option value="SAR" className="text-slate-900">SAR</option>
                             <option value="USD" className="text-slate-900">USD</option>
                          </select>
                       </div>
                       <div>
                          <label className={labelClass + " text-slate-500"}>Amount ({formData.currency})</label>
                          <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white font-black text-lg focus:ring-sky-500" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                       </div>
                    </div>

                    {formData.currency !== 'PKR' && (
                       <div className="animate-in slide-in-from-top-2">
                          <label className={labelClass + " text-slate-500"}>Rate of Exchange (ROE)</label>
                          <input type="number" step="0.01" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-emerald-400 font-black focus:ring-sky-500" value={formData.roe} onChange={e => setFormData({...formData, roe: Number(e.target.value)})} />
                       </div>
                    )}

                    <div className="pt-8 border-t border-white/5 text-center">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Impact on Party Ledger (PKR)</p>
                       <div className="flex items-center justify-center gap-3">
                          <RefreshCcw size={20} className="text-sky-500 opacity-50" />
                          <h4 className="text-4xl font-black text-white">Rs. {totalPKR.toLocaleString()}</h4>
                       </div>
                       <p className="text-[9px] font-bold text-sky-400/60 uppercase mt-4 italic">* Balance will be REDUCED (Credited) by this amount.</p>
                    </div>
                 </div>

                 <button onClick={handleSave} className="w-full bg-sky-600 hover:bg-sky-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-sky-900/40 flex items-center justify-center gap-3 relative z-10">
                    <Save size={20} /> Save & Reduce Balance
                 </button>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptEntry;
