
import React, { useState, useEffect } from 'react';
import { db } from '../store';
import { AccountType, TransportVoucher, Currency } from '../types';
import { Save, ArrowLeft, Bus, MapPin, User, Hash, Calculator, RefreshCw, AlertTriangle } from 'lucide-react';

interface TransportVoucherEntryProps {
  onComplete: () => void;
  onBack: () => void;
  initialData?: TransportVoucher | null;
  editingData?: TransportVoucher | null;
}

const TransportVoucherEntry: React.FC<TransportVoucherEntryProps> = ({ onComplete, onBack, initialData, editingData }) => {
  const isEdit = !!editingData;
  // Fixed: getCustomers does not accept arguments
  const customers = db.getCustomers();
  const accounts = db.getAccounts();
  const settings = db.getSettings();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerId: '',
    transportType: 'Bus',
    route: '',
    vehicleNo: '',
    driverName: '',
    tripDate: new Date().toISOString().split('T')[0],
    quantity: 1,
    rate: 0,
    currency: 'PKR' as Currency,
    roe: 1,
    narration: ''
  });

  useEffect(() => {
    const dataToLoad = editingData || initialData;
    if (dataToLoad) {
      setFormData({
        date: isEdit ? dataToLoad.date : new Date().toISOString().split('T')[0],
        customerId: dataToLoad.customer_id,
        transportType: dataToLoad.transport_type,
        route: dataToLoad.route,
        vehicleNo: dataToLoad.vehicle_no || '',
        driverName: dataToLoad.driver_name || '',
        tripDate: dataToLoad.trip_date,
        quantity: dataToLoad.quantity,
        rate: dataToLoad.total_amount / dataToLoad.roe / dataToLoad.quantity,
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

  const amountInSelectedCurrency = formData.quantity * formData.rate;
  const totalPKR = amountInSelectedCurrency * formData.roe;

  const handleSave = () => {
    if (!formData.customerId || totalPKR <= 0 || !formData.route) {
      alert("Please enter all required fields.");
      return;
    }

    const receivableAcc = accounts.find(a => a.type === AccountType.RECEIVABLE);
    const incomeAcc = accounts.find(a => a.id === 'acc-8' || a.type === AccountType.INCOME);

    if (!receivableAcc || !incomeAcc) {
      alert("Required accounts missing.");
      return;
    }

    const entries = [
      { account_id: receivableAcc.id, contact_id: formData.customerId, debit: totalPKR, credit: 0 },
      { account_id: incomeAcc.id, debit: 0, credit: totalPKR },
    ];

    const payload = {
      date: formData.date,
      customer_id: formData.customerId,
      transport_type: formData.transportType,
      route: formData.route,
      vehicle_no: formData.vehicleNo,
      driver_name: formData.driverName,
      trip_date: formData.tripDate,
      quantity: formData.quantity,
      rate: formData.rate,
      total_amount: totalPKR,
      currency: formData.currency,
      roe: formData.roe,
      narration: formData.narration || `${formData.transportType} service for ${formData.route} trip.`
    };

    // Fixed: calling updateTransportVoucher and addTransportVoucher which are now implemented in Store
    if (isEdit) {
      db.updateTransportVoucher(editingData!.id, payload, entries);
    } else {
      db.addTransportVoucher(payload, entries);
    }

    onComplete();
  };

  const inputClass = "w-full border-slate-200 rounded-xl py-2.5 px-4 focus:ring-slate-900 transition-all text-sm bg-white";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5";

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {isEdit && (
         <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800 font-bold text-sm">
            <AlertTriangle size={20}/>
            Warning: Editing this record will update ledger postings immediately.
         </div>
      )}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 px-8 py-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <Bus className="text-emerald-400" /> {isEdit ? 'Edit' : (initialData ? 'Clone' : 'New')} Transport Bill
              </h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Multi-Currency Transaction Engine</p>
            </div>
          </div>
          <div className="bg-slate-800 p-3 rounded-2xl border border-white/5">
             <p className={labelClass + " text-emerald-300"}>Voucher Date</p>
             <input type="date" className="bg-transparent border-none text-white text-sm font-bold p-0 focus:ring-0" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 space-y-8">
              <section>
                 <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                   <User size={16} className="text-emerald-500" /> Service Information
                 </h3>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                       <label className={labelClass}>Customer Account (Receivable)</label>
                       <select className={inputClass} value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                          <option value="">Select Customer</option>
                          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className={labelClass}>Transport Type</label>
                       <select className={inputClass} value={formData.transportType} onChange={e => setFormData({...formData, transportType: e.target.value})}>
                          <option value="Bus">Bus</option>
                          <option value="Coaster">Coaster</option>
                          <option value="Hiace">Hiace</option>
                          <option value="Car">Car</option>
                          <option value="Van">Van</option>
                          <option value="Airport Transfer">Airport Transfer</option>
                          <option value="Other">Other</option>
                       </select>
                    </div>
                    <div>
                       <label className={labelClass}>Trip Date</label>
                       <input type="date" className={inputClass} value={formData.tripDate} onChange={e => setFormData({...formData, tripDate: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                       <label className={labelClass}>Route (From - To)</label>
                       <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input type="text" placeholder="e.g. Airport to Hotel, Makkah to Madinah..." className={inputClass + " pl-10"} value={formData.route} onChange={e => setFormData({...formData, route: e.target.value})} />
                       </div>
                    </div>
                 </div>
              </section>

              <section>
                 <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                   <Hash size={16} className="text-blue-500" /> Vehicle & Driver
                 </h3>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className={labelClass}>Vehicle No</label>
                       <input type="text" placeholder="Plate Number" className={inputClass} value={formData.vehicleNo} onChange={e => setFormData({...formData, vehicleNo: e.target.value})} />
                    </div>
                    <div>
                       <label className={labelClass}>Driver Name</label>
                       <input type="text" placeholder="Full Name" className={inputClass} value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} />
                    </div>
                 </div>
              </section>

              <section>
                 <label className={labelClass}>Trip Narration</label>
                 <textarea className={inputClass + " h-24"} placeholder="Add additional details about this service..." value={formData.narration} onChange={e => setFormData({...formData, narration: e.target.value})}></textarea>
              </section>
           </div>

           <div className="space-y-6">
              <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
                 <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                   <Calculator size={16} className="text-emerald-500" /> Commercials
                 </h3>
                 
                 <div className="flex gap-2">
                    {['PKR', 'SAR'].map(cur => (
                      <button 
                        key={cur}
                        onClick={() => handleCurrencyChange(cur as Currency)}
                        className={`flex-1 py-2 rounded-lg text-xs font-black transition-all border ${formData.currency === cur ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}
                      >
                        {cur}
                      </button>
                    ))}
                 </div>

                 <div>
                    <label className={labelClass}>Quantity (Trips)</label>
                    <input type="number" className={inputClass} value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                 </div>
                 
                 <div>
                    <label className={labelClass}>Rate (per {formData.currency})</label>
                    <input type="number" className={inputClass + " font-bold"} value={formData.rate || ''} onChange={e => setFormData({...formData, rate: Number(e.target.value)})} />
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
              </section>

              <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-4 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                    <RefreshCw size={80} />
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Total ({formData.currency})</span>
                    <span className="text-white">{amountInSelectedCurrency.toLocaleString()} {formData.currency}</span>
                 </div>
                 <div className="pt-2">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Functional Amount</p>
                    <div className="flex justify-between items-end">
                       <span className="text-3xl font-black text-emerald-400">Rs. {totalPKR.toLocaleString()}</span>
                       <span className="text-[10px] font-bold text-slate-500 mb-1">PKR</span>
                    </div>
                 </div>
                 <div className="pt-4">
                    <button 
                      onClick={handleSave}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2"
                    >
                      <Save size={18} /> {isEdit ? 'Update Bill' : 'Post Bill to Ledger'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TransportVoucherEntry;
