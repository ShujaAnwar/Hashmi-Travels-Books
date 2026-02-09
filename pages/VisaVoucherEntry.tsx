
import React, { useState, useEffect } from 'react';
import { db } from '../store';
import { AccountType, VisaVoucher, VisaStatus, Currency } from '../types';
import { Save, FileBadge, User, Globe, Calculator, AlertTriangle, ArrowLeft, TrendingUp, Landmark } from 'lucide-react';

interface VisaVoucherEntryProps {
  onComplete: () => void;
  initialData?: VisaVoucher | null;
  editingData?: VisaVoucher | null;
  isCompact?: boolean;
}

const VisaVoucherEntry: React.FC<VisaVoucherEntryProps> = ({ onComplete, initialData, editingData, isCompact }) => {
  const isEdit = !!editingData;
  const customers = db.getCustomers(false);
  const vendors = db.getVendors(false);
  const accounts = db.getAccounts();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerId: '',
    vendorId: '',
    paxName: '',
    passportNo: '',
    visaType: 'Visit',
    country: '',
    submissionDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'Pending' as VisaStatus,
    salePricePKR: 0,
    buyPricePKR: 0,
    currency: 'PKR' as Currency,
    roe: 1
  });

  useEffect(() => {
    const dataToLoad = editingData || initialData;
    if (dataToLoad) {
      setFormData({
        date: isEdit ? dataToLoad.date : new Date().toISOString().split('T')[0],
        customerId: dataToLoad.customer_id,
        vendorId: dataToLoad.vendor_id,
        paxName: dataToLoad.pax_name,
        passportNo: dataToLoad.passport_no,
        visaType: dataToLoad.visa_type,
        country: dataToLoad.country,
        submissionDate: dataToLoad.submission_date,
        expiryDate: dataToLoad.expiry_date || '',
        status: dataToLoad.status,
        salePricePKR: dataToLoad.sale_price_pkr / dataToLoad.roe,
        buyPricePKR: dataToLoad.buy_price_pkr / dataToLoad.roe,
        currency: dataToLoad.currency,
        roe: dataToLoad.roe
      });
    }
  }, [initialData, editingData]);

  const totalSalePKR = formData.salePricePKR * formData.roe;
  const totalBuyPKR = formData.buyPricePKR * formData.roe;
  const profit = totalSalePKR - totalBuyPKR;

  const handleSave = () => {
    if (!formData.customerId || !formData.vendorId || !formData.paxName || !formData.country) {
      alert("Required: Customer, Vendor, Pax Name and Country.");
      return;
    }

    const receivableAcc = accounts.find(a => a.type === AccountType.RECEIVABLE);
    const payableAcc = accounts.find(a => a.type === AccountType.PAYABLE);
    const incomeAcc = accounts.find(a => a.type === AccountType.INCOME);

    if (!receivableAcc || !payableAcc || !incomeAcc) {
      alert("Accounting Chart incomplete.");
      return;
    }

    const entries = [
      { account_id: receivableAcc.id, contact_id: formData.customerId, debit: totalSalePKR, credit: 0 },
      { account_id: payableAcc.id, contact_id: formData.vendorId, debit: 0, credit: totalBuyPKR },
      { account_id: incomeAcc.id, debit: 0, credit: profit },
    ];

    const payload = {
      date: formData.date,
      customer_id: formData.customerId,
      vendor_id: formData.vendorId,
      pax_name: formData.paxName,
      passport_no: formData.passportNo,
      visa_type: formData.visaType,
      country: formData.country,
      submission_date: formData.submissionDate,
      expiry_date: formData.expiryDate || undefined,
      status: formData.status,
      sale_price_pkr: totalSalePKR,
      buy_price_pkr: totalBuyPKR,
      profit: profit,
      currency: formData.currency,
      roe: formData.roe
    };

    if (isEdit) db.updateVisaVoucher(editingData!.id, payload, entries);
    else db.addVisaVoucher(payload, entries);

    onComplete();
  };

  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1";
  const inputClass = "w-full border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-5 focus:ring-purple-500 transition-all text-sm font-medium bg-slate-50/50 dark:bg-slate-800 dark:text-white";

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="bg-slate-900 dark:bg-slate-950 px-10 py-8 text-white flex justify-between items-center">
           <div className="flex items-center gap-4">
              <button onClick={onComplete} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ArrowLeft size={20}/></button>
              <div>
                 <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                   <FileBadge className="text-purple-400" /> {isEdit ? 'Update' : 'New'} Visa Case
                 </h2>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Visa Processing & Compliance Core</p>
              </div>
           </div>
           <div className="flex gap-4">
              <div className="bg-slate-800 p-3 rounded-2xl border border-white/5 space-y-1">
                 <p className={labelClass + " text-purple-300 ml-0"}>Entry Date</p>
                 <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-transparent border-none text-white text-sm font-bold p-0 focus:ring-0 w-32" />
              </div>
           </div>
        </div>

        <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div className="space-y-8">
              <section>
                 <h3 className="text-xs font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div> Case Identity
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                       <label className={labelClass}>Passenger Full Name</label>
                       <input type="text" className={inputClass} value={formData.paxName} onChange={e => setFormData({...formData, paxName: e.target.value})} placeholder="FULL NAME AS PER PASSPORT" />
                    </div>
                    <div>
                       <label className={labelClass}>Passport Number</label>
                       <input type="text" className={inputClass} value={formData.passportNo} onChange={e => setFormData({...formData, passportNo: e.target.value.toUpperCase()})} placeholder="e.g. AB1234567" />
                    </div>
                    <div>
                       <label className={labelClass}>Processing Status</label>
                       <select className={inputClass} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as VisaStatus})}>
                          <option value="Pending">Pending</option>
                          <option value="Applied">Applied</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Delivered">Delivered</option>
                       </select>
                    </div>
                 </div>
              </section>

              <section>
                 <h3 className="text-xs font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    <Landmark className="text-purple-500" size={16} /> Destination & Timeline
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                       <label className={labelClass}>Destination Country</label>
                       <input type="text" className={inputClass} value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} placeholder="e.g. Saudi Arabia, UAE" />
                    </div>
                    <div>
                       <label className={labelClass}>Visa Type</label>
                       <input type="text" className={inputClass} value={formData.visaType} onChange={e => setFormData({...formData, visaType: e.target.value})} placeholder="Umrah / Visit / Work" />
                    </div>
                    <div>
                       <label className={labelClass}>Submission Date</label>
                       <input type="date" className={inputClass} value={formData.submissionDate} onChange={e => setFormData({...formData, submissionDate: e.target.value})} />
                    </div>
                    <div>
                       <label className={labelClass}>Expiry Date (Optional)</label>
                       <input type="date" className={inputClass} value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                    </div>
                    <div>
                       <label className={labelClass}>Debit (Customer)</label>
                       <select className={inputClass} value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                          <option value="">Select Customer</option>
                          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className={labelClass}>Credit (Vendor/Supplier)</label>
                       <select className={inputClass} value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})}>
                          <option value="">Select Vendor</option>
                          {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                       </select>
                    </div>
                 </div>
              </section>
           </div>

           <div className="space-y-8">
              <section className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                 <h3 className="text-xs font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    <Calculator className="text-purple-500" size={16} /> Ledger Values
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                       <label className={labelClass}>Customer Sale Price</label>
                       <input type="number" className={inputClass + " bg-white dark:bg-slate-900 font-black text-emerald-600"} value={formData.salePricePKR || ''} onChange={e => setFormData({...formData, salePricePKR: Number(e.target.value)})} />
                    </div>
                    <div>
                       <label className={labelClass}>Supplier Net Cost</label>
                       <input type="number" className={inputClass + " bg-white dark:bg-slate-900 font-black text-rose-500"} value={formData.buyPricePKR || ''} onChange={e => setFormData({...formData, buyPricePKR: Number(e.target.value)})} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={labelClass}>Currency ROE</label>
                        <div className="flex gap-4">
                           <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value as Currency})} className={inputClass + " flex-1 bg-white dark:bg-slate-900"}>
                              <option value="PKR">PKR</option>
                              <option value="SAR">SAR</option>
                              <option value="USD">USD</option>
                           </select>
                           <input type="number" step="0.01" className={inputClass + " flex-1 bg-white dark:bg-slate-900 font-black"} value={formData.roe} onChange={e => setFormData({...formData, roe: Number(e.target.value)})} />
                        </div>
                    </div>
                 </div>
              </section>

              <section className="bg-slate-900 dark:bg-purple-950/20 rounded-[2rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 transition-transform group-hover:scale-125"></div>
                 
                 <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gross Functional Sale</p>
                          <p className="text-2xl font-black text-emerald-400">Rs. {totalSalePKR.toLocaleString()}</p>
                       </div>
                       <TrendingUp className="text-emerald-500/50 mb-1" />
                    </div>
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Functional Buy Cost</p>
                          <p className="text-2xl font-black text-rose-400">Rs. {totalBuyPKR.toLocaleString()}</p>
                       </div>
                    </div>
                    <div>
                       <p className="text-[11px] font-black text-purple-400 uppercase tracking-widest mb-1">Service Profit Margin</p>
                       <h3 className="text-5xl font-black text-white">Rs. {profit.toLocaleString()}</h3>
                    </div>
                 </div>

                 <button 
                   onClick={handleSave}
                   className="w-full bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 relative z-10"
                 >
                    <Save size={20} /> {isEdit ? 'Update Case' : 'Confirm & Open Case'}
                 </button>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VisaVoucherEntry;
