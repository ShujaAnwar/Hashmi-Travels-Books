
import React, { useState, useEffect } from 'react';
import { db } from '../store';
import { AccountType, TicketVoucher, Currency } from '../types';
import { Save, Plane, User, Globe, Calculator, AlertTriangle, ArrowLeft, TrendingUp, RefreshCw } from 'lucide-react';

interface TicketVoucherEntryProps {
  onComplete: () => void;
  initialData?: TicketVoucher | null;
  editingData?: TicketVoucher | null;
  isCompact?: boolean;
}

const TicketVoucherEntry: React.FC<TicketVoucherEntryProps> = ({ onComplete, initialData, editingData, isCompact }) => {
  const isEdit = !!editingData;
  const customers = db.getCustomers();
  const vendors = db.getVendors();
  const accounts = db.getAccounts();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerId: '',
    vendorId: '',
    paxName: '',
    airline: '',
    ticketNo: '',
    gdsPnr: '',
    sector: '',
    tripDate: new Date().toISOString().split('T')[0],
    baseFare: 0,
    taxes: 0,
    serviceFee: 0,
    buyCost: 0,
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
        airline: dataToLoad.airline,
        ticketNo: dataToLoad.ticket_no,
        gdsPnr: dataToLoad.gds_pnr,
        sector: dataToLoad.sector,
        tripDate: dataToLoad.trip_date,
        baseFare: dataToLoad.base_fare,
        taxes: dataToLoad.taxes,
        serviceFee: dataToLoad.service_fee,
        buyCost: dataToLoad.total_buy_pkr / dataToLoad.roe,
        currency: dataToLoad.currency,
        roe: dataToLoad.roe
      });
    }
  }, [initialData, editingData]);

  const totalSaleInCurrency = formData.baseFare + formData.taxes + formData.serviceFee;
  const totalSalePKR = totalSaleInCurrency * formData.roe;
  const totalBuyPKR = formData.buyCost * formData.roe;
  const profit = totalSalePKR - totalBuyPKR;

  const handleSave = async () => {
    if (!formData.customerId || !formData.vendorId || !formData.ticketNo) {
      alert("Please fill required fields (Customer, Vendor, Ticket No).");
      return;
    }

    setIsSaving(true);
    const receivableAcc = accounts.find(a => a.type === AccountType.RECEIVABLE);
    const payableAcc = accounts.find(a => a.type === AccountType.PAYABLE);
    const incomeAcc = accounts.find(a => a.id === 'acc-3' || a.type === AccountType.INCOME);

    if (!receivableAcc || !payableAcc || !incomeAcc) {
      alert("Accounting Chart incomplete.");
      setIsSaving(false);
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
      airline: formData.airline,
      ticket_no: formData.ticketNo,
      gds_pnr: formData.gdsPnr,
      sector: formData.sector,
      trip_date: formData.tripDate,
      base_fare: formData.baseFare,
      taxes: formData.taxes,
      service_fee: formData.serviceFee,
      total_sale_pkr: totalSalePKR,
      total_buy_pkr: totalBuyPKR,
      profit: profit,
      currency: formData.currency,
      roe: formData.roe
    };

    try {
      if (isEdit) await db.updateTicketVoucher(editingData!.id, payload, entries);
      else await db.addTicketVoucher(payload, entries);
      onComplete();
    } catch (err: any) {
      alert("Error saving ticket: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1";
  const inputClass = "w-full border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-5 focus:ring-emerald-500 transition-all text-sm font-medium bg-slate-50/50 dark:bg-slate-800 dark:text-white";

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="bg-slate-900 dark:bg-slate-950 px-10 py-8 text-white flex justify-between items-center">
           <div className="flex items-center gap-4">
              <button onClick={onComplete} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ArrowLeft size={20}/></button>
              <div>
                 <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                   <Plane className="text-emerald-400" /> {isEdit ? 'Update' : 'New'} Ticket Entry
                 </h2>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Air Ticketing Repository Core</p>
              </div>
           </div>
           <div className="flex gap-4">
              <div className="bg-slate-800 p-3 rounded-2xl border border-white/5 space-y-1">
                 <p className={labelClass + " text-blue-300 ml-0"}>Booking Date</p>
                 <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-transparent border-none text-white text-sm font-bold p-0 focus:ring-0 w-32" />
              </div>
           </div>
        </div>

        <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div className="space-y-8">
              <section>
                 <h3 className="text-xs font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Passenger & Airline
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                       <label className={labelClass}>Pax Full Name</label>
                       <input type="text" className={inputClass} value={formData.paxName} onChange={e => setFormData({...formData, paxName: e.target.value})} placeholder="AS PER PASSPORT" />
                    </div>
                    <div>
                       <label className={labelClass}>Airline Name</label>
                       <input type="text" className={inputClass} value={formData.airline} onChange={e => setFormData({...formData, airline: e.target.value})} placeholder="e.g. Qatar Airways" />
                    </div>
                    <div>
                       <label className={labelClass}>GDS PNR</label>
                       <input type="text" className={inputClass} value={formData.gdsPnr} onChange={e => setFormData({...formData, gdsPnr: e.target.value.toUpperCase()})} placeholder="XJ92KP" />
                    </div>
                    <div className="sm:col-span-2">
                       <label className={labelClass}>Ticket Number (E-Ticket)</label>
                       <input type="text" className={inputClass} value={formData.ticketNo} onChange={e => setFormData({...formData, ticketNo: e.target.value})} placeholder="157-1234567890" />
                    </div>
                 </div>
              </section>

              <section>
                 <h3 className="text-xs font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Route Details
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                       <label className={labelClass}>Sector (From-To)</label>
                       <input type="text" className={inputClass} value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})} placeholder="KHI-DOH-LHR" />
                    </div>
                    <div>
                       <label className={labelClass}>Travel Date</label>
                       <input type="date" className={inputClass} value={formData.tripDate} onChange={e => setFormData({...formData, tripDate: e.target.value})} />
                    </div>
                    <div>
                       <label className={labelClass}>Bill To (Customer)</label>
                       <select className={inputClass} value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                          <option value="">Select Customer</option>
                          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className={labelClass}>Supplier (Consolidator)</label>
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
                    <Calculator className="text-emerald-500" size={16} /> Commercial Breakup
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                       <label className={labelClass}>Base Fare</label>
                       <input type="number" className={inputClass + " bg-white dark:bg-slate-900"} value={formData.baseFare || ''} onChange={e => setFormData({...formData, baseFare: Number(e.target.value)})} />
                    </div>
                    <div>
                       <label className={labelClass}>Taxes</label>
                       <input type="number" className={inputClass + " bg-white dark:bg-slate-900"} value={formData.taxes || ''} onChange={e => setFormData({...formData, taxes: Number(e.target.value)})} />
                    </div>
                    <div>
                       <label className={labelClass}>Service Fee (Markup)</label>
                       <input type="number" className={inputClass + " bg-white dark:bg-slate-900"} value={formData.serviceFee || ''} onChange={e => setFormData({...formData, serviceFee: Number(e.target.value)})} />
                    </div>
                    <div>
                       <label className={labelClass}>Net Buy Cost</label>
                       <input type="number" className={inputClass + " bg-white dark:bg-slate-900 font-black text-rose-500"} value={formData.buyCost || ''} onChange={e => setFormData({...formData, buyCost: Number(e.target.value)})} />
                    </div>
                 </div>
              </section>

              <section className="bg-slate-900 dark:bg-emerald-950/20 rounded-[2rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 transition-transform group-hover:scale-125"></div>
                 
                 <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase">Gross Receivable</p>
                          <p className="text-2xl font-black text-emerald-400">Rs. {totalSalePKR.toLocaleString()}</p>
                       </div>
                       <TrendingUp className="text-emerald-500/50 mb-1" />
                    </div>
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase">Supplier Payable</p>
                          <p className="text-2xl font-black text-rose-400">Rs. {totalBuyPKR.toLocaleString()}</p>
                       </div>
                    </div>
                    <div>
                       <p className="text-[11px] font-black text-sky-400 uppercase tracking-widest mb-1">Ticket Profit Margin</p>
                       <h3 className="text-5xl font-black text-white">Rs. {profit.toLocaleString()}</h3>
                    </div>
                 </div>

                 <button 
                   onClick={handleSave}
                   disabled={isSaving}
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 relative z-10 disabled:opacity-50"
                 >
                    {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />} 
                    {isSaving ? 'Synchronizing...' : (isEdit ? 'Save Changes' : 'Confirm & Post Ticket')}
                 </button>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TicketVoucherEntry;
