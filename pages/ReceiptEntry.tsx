
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
        amount: dataToLoad.amount / dataToLoad.roe,
        currency: dataToLoad.currency,
        roe: dataToLoad.roe,
        narration: dataToLoad.narration
      });
    }
  }, [initialData, editingData]);

  const handleCurrencyChange = (cur: Currency) => {
    setFormData({
      ...formData,
      currency: cur,
      roe: cur === 'SAR' ? settings.defaultROE : 1
    });
  };

  const totalPKR = formData.amount * formData.roe;

  const handleSave = () => {
    if (!formData.targetAccountId || totalPKR <= 0) {
      alert("Please enter a valid account and amount.");
      return;
    }

    if (formData.type === 'Customer' && !formData.customerId) {
      alert("Please select a customer.");
      return;
    }

    if (formData.type === 'Vendor' && !formData.vendorId) {
      alert("Please select a vendor.");
      return;
    }

    let creditAccountId = '';
    const receivableAcc = allAccounts.find(a => a.type === AccountType.RECEIVABLE);
    const payableAcc = allAccounts.find(a => a.type === AccountType.PAYABLE);
    const incomeAcc = allAccounts.find(a => a.id === 'acc-3' || a.type === AccountType.INCOME);

    if (formData.type === 'Customer') creditAccountId = receivableAcc?.id || '';
    else if (formData.type === 'Vendor') creditAccountId = payableAcc?.id || '';
    else creditAccountId = incomeAcc?.id || '';

    const partyId = formData.type === 'Customer' ? formData.customerId : (formData.type === 'Vendor' ? formData.vendorId : undefined);
    
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
      narration: formData.narration || `${formData.type} receipt received in ${formData.currency} on ${formData.date}`
    };

    if (isEdit) {
      db.updateReceipt(editingData!.id, payload, entries);
    } else {
      db.addReceipt(payload, entries);
    }

    onComplete();
  };

  const inputClass = "w-full border-slate-200 rounded-xl py-3 px-4 focus:ring-slate-900 transition-all text-sm bg-white";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {isEdit && (
         <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800 font-bold text-sm">
            <AlertTriangle size={20}/>
            Warning: Editing this receipt will update the associated ledger entries.
         </div>
      )}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 px-8 py-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <Wallet className="text-sky-400" /> {isEdit ? 'Edit' : (initialData ? 'Clone' : 'New')} Receipt
              </h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Multi-Currency Payment Collection</p>
            </div>
          </div>
          <div className="bg-slate-800 p-3 rounded-2xl border border-white/5">
             <p className={labelClass + " text-sky-300"}>Receipt Date</p>
             <input type="date" className="bg-transparent border-none text-white text-sm font-bold p-0 focus:ring-0" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-6">
             <section>
               <label className={labelClass}>Receipt Source</label>
               <div className="grid grid-cols-3 gap-2">
                 {['Customer', 'Vendor', 'Other'].map(t => (
                   <button 
                     key={t}
                     onClick={() => setFormData({...formData, type: t as ReceiptSourceType})}
                     className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.type === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-white'}`}
                   >
                     {t}
                   </button>
                 ))}
               </div>
             </section>

             {formData.type === 'Customer' && (
               <section className="animate-in fade-in slide-in-from-left-2">
                 <label className={labelClass}>Select Customer</label>
                 <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <select className={inputClass + " pl-12"} value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                     <option value="">Choose Customer</option>
                     {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 </div>
               </section>
             )}

             {formData.type === 'Vendor' && (
               <section className="animate-in fade-in slide-in-from-left-2">
                 <label className={labelClass}>Select Vendor</label>
                 <div className="relative">
                   <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <select className={inputClass + " pl-12"} value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})}>
                     <option value="">Choose Vendor</option>
                     {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                   </select>
                 </div>
               </section>
             )}

             <section>
               <label className={labelClass}>Deposit To (Cash / Bank)</label>
               <select className={inputClass} value={formData.targetAccountId} onChange={e => setFormData({...formData, targetAccountId: e.target.value})}>
                 <option value="">Select Account</option>
                 {cashBankAccounts.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
               </select>
             </section>

             <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <label className={labelClass}>Narration / Notes</label>
                <textarea 
                  className={inputClass + " h-24 bg-white border-slate-100"} 
                  placeholder="Enter cheque # or invoice reference..."
                  value={formData.narration}
                  onChange={e => setFormData({...formData, narration: e.target.value})}
                ></textarea>
             </section>
           </div>

           <div className="space-y-6">
             <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
               <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Amount & Currency</h4>
                  <div className="flex gap-1">
                    {['PKR', 'SAR'].map(cur => (
                      <button 
                        key={cur}
                        onClick={() => handleCurrencyChange(cur as Currency)}
                        className={`px-3 py-1 rounded-md text-[10px] font-black transition-all border ${formData.currency === cur ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}
                      >
                        {cur}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Amount in {formData.currency}</label>
                    <input 
                      type="number" 
                      className={inputClass + " text-2xl font-black"} 
                      placeholder="0.00"
                      value={formData.amount || ''}
                      onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                    />
                  </div>

                  {formData.currency === 'SAR' && (
                    <div className="animate-in slide-in-from-top-2">
                       <label className={labelClass}>Rate of Exchange (ROE)</label>
                       <div className="relative">
                          <input type="number" className={inputClass + " text-emerald-600 font-black"} value={formData.roe} onChange={e => setFormData({...formData, roe: Number(e.target.value)})} />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">PKR/SAR</div>
                       </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-200">
                     <p className={labelClass + " text-emerald-600"}>Converted Total (PKR)</p>
                     <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">Rs. {totalPKR.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-slate-400">PKR</span>
                     </div>
                  </div>
               </div>
             </section>

             <button 
               onClick={handleSave}
               className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-2xl transition-all"
             >
               <Save size={20} /> {isEdit ? 'Update Receipt' : 'Save Receipt & Post'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptEntry;
