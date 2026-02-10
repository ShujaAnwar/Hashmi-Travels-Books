
import React, { useState, useEffect } from 'react';
import { db } from '../store';
import { ReceiptSourceType, AccountType, Receipt, Currency } from '../types';
import { Save, ArrowLeft, Wallet, User, UserCheck, Info, RefreshCw, AlertTriangle } from 'lucide-react';

interface ReceiptEntryProps {
  onComplete: () => void;
  onBack: () => void;
  initialData?: Receipt | null;
  editingData?: Receipt | null;
}

const ReceiptEntry: React.FC<ReceiptEntryProps> = ({ onComplete, onBack, initialData, editingData }) => {
  const isEdit = !!editingData;
  const customers = db.getCustomers(false);
  const vendors = db.getVendors(false);
  const allAccounts = db.getAccounts();
  const settings = db.getSettings();
  const cashBankAccounts = allAccounts.filter(a => a.type === AccountType.CASH || a.type === AccountType.BANK);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Customer' as ReceiptSourceType,
    customerId: '',
    vendorId: '',
    targetAccountId: cashBankAccounts[0]?.id || '',
    amount: 0,
    currency: 'PKR' as Currency,
    roe: 1,
    narration: ''
  });

  useEffect(() => {
    const dataToLoad = editingData || initialData;
    if (dataToLoad) {
      setFormData({
        date: isEdit ? dataToLoad.date : new Date().toISOString().split('T')[0],
        type: dataToLoad.type,
        customerId: dataToLoad.customer_id || '',
        vendorId: dataToLoad.vendor_id || '',
        targetAccountId: dataToLoad.account_id,
        amount: dataToLoad.currency === 'PKR' ? dataToLoad.amount : (dataToLoad.amount / (dataToLoad.roe || 1)),
        currency: dataToLoad.currency || 'PKR',
        roe: dataToLoad.roe || 1,
        narration: dataToLoad.narration
      });
    }
  }, [initialData, editingData]);

  const handleCurrencyChange = (cur: Currency) => {
    setFormData({
      ...formData,
      currency: cur,
      roe: cur === 'PKR' ? 1 : (settings.defaultROE || 83.5)
    });
  };

  // Functional calculation
  const totalPKR = formData.currency === 'PKR' ? formData.amount : (formData.amount * formData.roe);

  const handleSave = () => {
    if (!formData.targetAccountId || totalPKR <= 0) {
      alert("Please enter a valid account and amount.");
      return;
    }

    const partyId = formData.type === 'Customer' ? formData.customerId : (formData.type === 'Vendor' ? formData.vendorId : undefined);
    const receivableAcc = allAccounts.find(a => a.type === AccountType.RECEIVABLE);
    const payableAcc = allAccounts.find(a => a.type === AccountType.PAYABLE);
    const incomeAcc = allAccounts.find(a => a.type === AccountType.INCOME);

    let creditAccountId = '';
    if (formData.type === 'Customer') creditAccountId = receivableAcc?.id || '';
    else if (formData.type === 'Vendor') creditAccountId = payableAcc?.id || '';
    else creditAccountId = incomeAcc?.id || '';

    const entries = [
      { account_id: formData.targetAccountId, debit: totalPKR, credit: 0 },
      { account_id: creditAccountId, contact_id: partyId, debit: 0, credit: totalPKR },
    ];

    const payload = {
      date: formData.date,
      type: formData.type,
      customer_id: formData.customerId || undefined,
      vendor_id: formData.vendorId || undefined,
      account_id: formData.targetAccountId,
      amount: totalPKR,
      currency: formData.currency,
      roe: formData.roe,
      narration: formData.narration || `${formData.type} receipt received in ${formData.currency}`
    };

    if (isEdit) db.updateReceipt(editingData!.id, payload, entries);
    else db.addReceipt(payload, entries);

    onComplete();
  };

  const inputClass = "w-full border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 focus:ring-slate-900 transition-all text-sm font-bold bg-white dark:bg-slate-900 dark:text-white";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="bg-slate-900 px-8 py-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={24} /></button>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <Wallet className="text-sky-400" /> {isEdit ? 'Edit' : 'New'} Receipt
              </h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Universal Payment Registry</p>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="bg-slate-800 p-3 rounded-xl border border-white/5">
                <p className={labelClass + " text-sky-300"}>Date</p>
                <input type="date" className="bg-transparent border-none text-white text-sm font-bold p-0 focus:ring-0" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
             </div>
             <div className="bg-slate-800 p-3 rounded-xl border border-white/5">
                <p className={labelClass + " text-emerald-300"}>Currency</p>
                <select className="bg-transparent border-none text-white text-sm font-bold p-0 focus:ring-0 uppercase" value={formData.currency} onChange={e => handleCurrencyChange(e.target.value as Currency)}>
                   <option value="PKR" className="text-slate-900">PKR</option>
                   <option value="SAR" className="text-slate-900">SAR</option>
                </select>
             </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-6">
             <section>
               <label className={labelClass}>Source Type</label>
               <div className="grid grid-cols-3 gap-2">
                 {['Customer', 'Vendor', 'Other'].map(t => (
                   <button 
                     key={t}
                     onClick={() => setFormData({...formData, type: t as ReceiptSourceType})}
                     className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.type === t ? 'bg-slate-900 text-white dark:bg-emerald-600' : 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:border-slate-700'}`}
                   >
                     {t}
                   </button>
                 ))}
               </div>
             </section>

             {formData.type === 'Customer' && (
               <section>
                 <label className={labelClass}>Account</label>
                 <select className={inputClass} value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                   <option value="">Select Customer</option>
                   {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               </section>
             )}

             {formData.type === 'Vendor' && (
               <section>
                 <label className={labelClass}>Account</label>
                 <select className={inputClass} value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})}>
                   <option value="">Select Vendor</option>
                   {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                 </select>
               </section>
             )}

             <section>
               <label className={labelClass}>Deposit To</label>
               <select className={inputClass} value={formData.targetAccountId} onChange={e => setFormData({...formData, targetAccountId: e.target.value})}>
                 <option value="">Select Cash/Bank Account</option>
                 {cashBankAccounts.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
               </select>
             </section>
           </div>

           <div className="space-y-6">
             <section className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700">
               <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Amount in {formData.currency}</label>
                    <input 
                      type="number" 
                      className={inputClass + " text-2xl font-black dark:bg-slate-800"} 
                      placeholder="0.00"
                      value={formData.amount || ''}
                      onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                    />
                  </div>

                  {formData.currency !== 'PKR' && (
                    <div className="animate-in slide-in-from-top-2">
                       <label className={labelClass + " text-emerald-500"}>Rate of Exchange (ROE)</label>
                       <input type="number" step="0.01" className={inputClass + " text-emerald-600 text-xl dark:bg-slate-800"} value={formData.roe} onChange={e => setFormData({...formData, roe: Number(e.target.value)})} />
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                     <p className={labelClass + " text-emerald-600"}>Equivalent PKR Posting</p>
                     <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">Rs. {totalPKR.toLocaleString()}</span>
                     </div>
                  </div>
               </div>
             </section>

             <button 
               onClick={handleSave}
               className="w-full bg-slate-900 dark:bg-emerald-600 hover:opacity-90 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-2xl transition-all"
             >
               <Save size={20} /> Save & Post Receipt
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptEntry;
