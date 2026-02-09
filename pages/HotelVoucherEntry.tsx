
import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../store';
import { AccountType, HotelVoucher, Currency } from '../types';
import { Save, Calendar, Bed, Users, TrendingUp, Globe, Truck, MapPin, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';

interface HotelVoucherEntryProps {
  onComplete: () => void;
  initialData?: HotelVoucher | null;
  editingData?: HotelVoucher | null;
}

const HotelVoucherEntry: React.FC<HotelVoucherEntryProps> = ({ onComplete, initialData, editingData }) => {
  const isEdit = !!editingData;
  const customers = db.getCustomers(false);
  const vendors = db.getVendors(false);
  const accounts = db.getAccounts();
  const settings = db.getSettings();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    optionDate: '',
    customerId: '',
    vendorId: '',
    paxName: '',
    hotelName: '',
    country: '',
    city: '',
    destination: '',
    confirmationNo: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    rooms: 1,
    roomType: 'TRIPLE',
    meal: 'NONE',
    adults: 3,
    children: 0,
    currency: 'PKR' as Currency,
    roe: 1,
    remarks: ''
  });

  const [finances, setFinances] = useState({
    salePricePKR: 0,
    buyPricePKR: 0,
    saleRateSAR: 0,
    saleRateUSD: 0,
  });

  useEffect(() => {
    const dataToLoad = editingData || initialData;
    if (dataToLoad) {
      setFormData({
        ...formData,
        date: isEdit ? dataToLoad.date : new Date().toISOString().split('T')[0],
        optionDate: dataToLoad.option_date || '',
        customerId: dataToLoad.customer_id,
        vendorId: dataToLoad.vendor_id,
        paxName: dataToLoad.pax_name,
        hotelName: dataToLoad.hotel_name,
        country: dataToLoad.country,
        city: dataToLoad.city,
        destination: dataToLoad.destination || '',
        confirmationNo: dataToLoad.confirmation_no || '',
        checkIn: dataToLoad.check_in,
        checkOut: dataToLoad.check_out,
        rooms: dataToLoad.rooms,
        roomType: dataToLoad.room_type,
        meal: dataToLoad.meal,
        adults: dataToLoad.adults,
        children: dataToLoad.children,
        currency: dataToLoad.currency || 'PKR',
        roe: dataToLoad.roe || 1
      });
      const units = dataToLoad.rooms * dataToLoad.nights;
      setFinances({
        salePricePKR: dataToLoad.sale_price_pkr / units,
        buyPricePKR: dataToLoad.buy_price_pkr / units,
        saleRateSAR: (dataToLoad.sale_rate_sar || 0),
        saleRateUSD: (dataToLoad.sale_rate_usd || 0),
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

  const nights = useMemo(() => {
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [formData.checkIn, formData.checkOut]);

  const units = formData.rooms * nights;
  const totalSalePKR = (formData.currency === 'PKR' ? finances.salePricePKR * units : (finances.saleRateSAR * units * formData.roe));
  const totalBuyPKR = finances.buyPricePKR * units;
  const profit = totalSalePKR - totalBuyPKR;

  const handleSave = () => {
    if (!formData.customerId || !formData.vendorId || !formData.paxName || !formData.hotelName) {
      alert("Please enter all required fields.");
      return;
    }
    const receivableAcc = accounts.find(a => a.type === AccountType.RECEIVABLE);
    const payableAcc = accounts.find(a => a.type === AccountType.PAYABLE);
    const incomeAcc = accounts.find(a => a.type === AccountType.INCOME);
    if (!receivableAcc || !payableAcc || !incomeAcc) { alert("Accounting setup incomplete."); return; }

    const entries = [
      { account_id: receivableAcc.id, contact_id: formData.customerId, debit: totalSalePKR, credit: 0 },
      { account_id: payableAcc.id, contact_id: formData.vendorId, debit: 0, credit: totalBuyPKR },
      { account_id: incomeAcc.id, debit: 0, credit: profit },
    ];

    const payload = {
      date: formData.date, customer_id: formData.customerId, vendor_id: formData.vendorId, pax_name: formData.paxName, hotel_name: formData.hotelName, country: formData.country, city: formData.city, destination: formData.destination || formData.city, confirmation_no: formData.confirmationNo || formData.country, option_date: formData.optionDate, check_in: formData.checkIn, check_out: formData.checkOut, nights, rooms: formData.rooms, room_type: formData.roomType, meal: formData.meal, adults: formData.adults, children: formData.children, sale_price_pkr: totalSalePKR, buy_price_pkr: totalBuyPKR, sale_rate_sar: finances.saleRateSAR, sale_total_sar: finances.saleRateSAR * units, sale_rate_usd: finances.saleRateUSD, sale_total_usd: finances.saleRateUSD * units, currency: formData.currency, roe: formData.roe, profit
    };

    if (isEdit) db.updateHotelVoucher(editingData!.id, payload, entries);
    else db.addHotelVoucher(payload, entries);
    onComplete();
  };

  const inputClass = "w-full border-slate-200 rounded-2xl py-3 px-5 focus:ring-slate-900 transition-all text-sm font-medium bg-slate-50/50";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="max-w-6xl mx-auto pb-12 px-2 sm:px-0">
      {isEdit && (
         <div className="mb-6 bg-amber-50 border border-amber-200 p-5 rounded-[2rem] flex items-center gap-4 text-amber-800 font-bold text-xs sm:text-sm">
            <AlertTriangle size={24} className="shrink-0" />
            <span>Management Warning: Editing this record will automatically adjust all associated ledger balances in the system.</span>
         </div>
      )}
      
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/5 border border-slate-100 overflow-hidden">
        {/* Responsive Header */}
        <div className="bg-slate-900 px-6 sm:px-10 py-8 text-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
             <button onClick={onComplete} className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"><ArrowLeft size={20}/></button>
             <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Bed className="text-blue-400 shrink-0" /> {isEdit ? 'Update' : (initialData ? 'Clone' : 'New')} Booking
                </h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Multi-Currency Transaction Portal</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
             <div className="bg-slate-800 p-4 rounded-2xl border border-white/5 space-y-1 flex-1 sm:flex-none">
                <p className={labelClass + " text-blue-300 ml-0"}>Post Date</p>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-transparent border-none text-white text-sm font-bold focus:ring-0 p-0 block w-full" />
             </div>
             <div className="bg-slate-800 p-4 rounded-2xl border border-white/5 space-y-1 flex-1 sm:flex-none">
                <p className={labelClass + " text-emerald-300 ml-0"}>Currency</p>
                <select value={formData.currency} onChange={e => handleCurrencyChange(e.target.value as Currency)} className="bg-transparent border-none text-white text-sm font-bold focus:ring-0 p-0 block w-full uppercase">
                   <option value="PKR" className="text-slate-900">PKR</option>
                   <option value="SAR" className="text-slate-900">SAR</option>
                </select>
             </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-10">
            {/* Guest & Entity Section */}
            <section>
              <h3 className="text-xs font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Account & Passenger
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Customer (Debit)</label>
                  <select value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className={inputClass}>
                    <option value="">Choose Party</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Supplier (Credit)</label>
                  <select value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})} className={inputClass}>
                    <option value="">Choose Supplier</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Lead Passenger Full Name</label>
                  <input type="text" className={inputClass} value={formData.paxName} onChange={e => setFormData({...formData, paxName: e.target.value})} placeholder="Lead guest name as per passport" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Hotel Property Name</label>
                  <input type="text" className={inputClass} value={formData.hotelName} onChange={e => setFormData({...formData, hotelName: e.target.value})} placeholder="e.g. Hilton Suites Makkah" />
                </div>
              </div>
            </section>

            {/* Stay Details Section */}
            <section>
              <h3 className="text-xs font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Stay Schedule
              </h3>
              <div className="bg-slate-50 p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                  <div className="space-y-2">
                    <label className={labelClass}>Check-In</label>
                    <input type="date" className={inputClass + " bg-white"} value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} />
                  </div>
                  <div className="hidden sm:flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200">
                     <p className="text-[8px] font-black text-slate-400 uppercase">Duration</p>
                     <p className="text-xl font-black text-blue-600">{nights}N</p>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Check-Out</label>
                    <input type="date" className={inputClass + " bg-white"} value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-10">
            {/* Financials Section */}
            <section>
              <h3 className="text-xs font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Commercial Rates
              </h3>
              <div className="space-y-5">
                {formData.currency === 'PKR' ? (
                  <div className="bg-emerald-50 p-6 sm:p-8 rounded-[2rem] border border-emerald-100 relative overflow-hidden group animate-in slide-in-from-right-4 duration-300">
                    <div className="absolute top-4 right-8 text-emerald-600 font-black text-2xl opacity-10 uppercase tracking-tighter">PKR MODE</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-2">
                          <label className={labelClass + " text-emerald-700"}>Sale Price / Night</label>
                          <input type="number" className={inputClass + " bg-white font-black"} value={finances.salePricePKR || ''} onChange={e => setFinances({...finances, salePricePKR: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                          <label className={labelClass + " text-emerald-700"}>Buy Cost / Night</label>
                          <input type="number" className={inputClass + " bg-white font-black"} value={finances.buyPricePKR || ''} onChange={e => setFinances({...finances, buyPricePKR: Number(e.target.value)})} />
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-sky-50 p-6 sm:p-8 rounded-[2rem] border border-sky-100 relative overflow-hidden animate-in slide-in-from-right-4 duration-300">
                    <div className="absolute top-4 right-8 text-sky-600 font-black text-2xl opacity-10 uppercase tracking-tighter">SAR MODE</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-2">
                          <label className={labelClass + " text-sky-700"}>SAR Rate / Night</label>
                          <input type="number" className={inputClass + " bg-white font-black"} value={finances.saleRateSAR || ''} onChange={e => setFinances({...finances, saleRateSAR: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                          <label className={labelClass + " text-sky-700"}>Exchange ROE</label>
                          <input type="number" className={inputClass + " bg-white font-black text-emerald-600"} value={formData.roe} onChange={e => setFormData({...formData, roe: Number(e.target.value)})} />
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                           <label className={labelClass + " text-sky-700"}>Net PKR Cost (Supplier Payable)</label>
                           <input type="number" className={inputClass + " bg-white font-black text-rose-600"} value={finances.buyPricePKR || ''} onChange={e => setFinances({...finances, buyPricePKR: Number(e.target.value)})} />
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Posting Summary Card */}
            <section className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 text-white space-y-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-20 translate-x-20 transition-transform group-hover:scale-125"></div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Receivables</p>
                    <p className="text-xl font-black text-emerald-400">Rs. {totalSalePKR.toLocaleString()}</p>
                  </div>
                  <TrendingUp size={24} className="text-emerald-500 mb-2 opacity-50" />
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Supplier Payables</p>
                    <p className="text-xl font-black text-rose-400">Rs. {totalBuyPKR.toLocaleString()}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-black text-sky-400 uppercase tracking-[0.2em] text-[10px]">Projected Functional Margin</span>
                  </div>
                  <span className="text-4xl sm:text-5xl font-black text-white">Rs. {profit.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSave}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm transition-all shadow-2xl shadow-blue-900/40 flex items-center justify-center gap-3 active:scale-95"
                >
                  <Save size={20} /> {isEdit ? 'Confirm Update' : 'Finalize & Post'}
                </button>
                <p className="text-center text-[9px] text-slate-500 font-black uppercase mt-5 tracking-[0.3em] opacity-50">
                  Dual Ledger Entry in PKR Functional Currency
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelVoucherEntry;
