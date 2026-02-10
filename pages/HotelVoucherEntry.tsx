
import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../store';
import { AccountType, HotelVoucher, Currency } from '../types';
import { Save, Calendar, Bed, Users, TrendingUp, Globe, Truck, MapPin, RefreshCw, AlertTriangle, ArrowLeft, Hash, DollarSign } from 'lucide-react';

interface HotelVoucherEntryProps {
  onComplete: () => void;
  initialData?: HotelVoucher | null;
  editingData?: HotelVoucher | null;
  isCompact?: boolean;
}

const HOTEL_OPTIONS = [
  "Abraj Al Bait – Fairmont Makkah", "Abraj Al Bait – Raffles Makkah", "Abraj Al Bait – Swissôtel Makkah", 
  "Abraj Al Bait – Swissôtel Al Maqam", "Abraj Al Bait – Pullman Zamzam", "Dar Al Tawhid InterContinental", 
  "Makkah Clock Royal Tower – Fairmont", "Jabal Omar Hyatt Regency", "Jabal Omar Conrad Makkah", 
  "Jabal Omar DoubleTree by Hilton", "Jabal Omar Marriott", "Jabal Omar Address Makkah", 
  "Hilton Suites Makkah", "Makkah Hilton Hotel", "Anjum Hotel Makkah", "Al Ghufran Safwah Hotel", 
  "Safwah Royale Orchid", "Conrad Jabal Omar", "Address Jabal Omar", "Sheraton Makkah Jabal Al Kaaba", 
  "Le Méridien Towers Makkah", "Emaar Grand Hotel", "Emaar Al Manar", "Emaar Andalusia", "Emaar Elite Al Khalil", 
  "Emaar Elite Al Maabda", "Elaf Ajyad Hotel", "Elaf Al Mashaeer", "Elaf Bakkah Hotel", 
  "Al Kiswah Towers Hotel", "Violet Hotel Makkah", "Borj Al Deafah", "Al Massa Grand Hotel", 
  "Manar Al Tawhid Hotel", "Al Marwa Rayhaan by Rotana", "Al Safwah Tower Hotel", 
  "Al Shohada Hotel", "Nawazi Ajyad Hotel", "Nawazi Watheer Hotel", "Jabal Omar Hilton Convention",
  "Al Kiswah Hotel (Standard Blocks)", "Al Ebaa Hotel", "Al Olayan Ajyad", "Al Fajr Al Badea", 
  "Al Fajr Al Khalil", "Al Fajr Al Manar", "Rehab Al Khalil Hotel", "Al Shohada Ajyad", 
  "Rayyana Ajyad Hotel", "Nada Al Deafah", "Al Rawda Al Aqeeq", "Al Qimmah Hotel", 
  "Al Noor Hotel", "Makarem Mina Hotel", "Al Aseel Ajyad",
  "Anwar Al Madinah Mövenpick", "Madinah Hilton", "Pullman Zamzam Madinah", "InterContinental Dar Al Iman", 
  "InterContinental Dar Al Hijra", "Bosphorus Hotel Madinah", "Taiba Front Hotel", "Al Aqeeq Madinah Hotel", 
  "Sofitel Shahd Al Madinah", "Millennium Taiba Madinah", "Crowne Plaza Madinah", "Oberoi Madinah",
  "Dallah Taibah Hotel", "Elaf Taiba Hotel", "Elaf Al Taqwa Hotel", "Zowar International Hotel", 
  "Shaza Al Madina", "Province Al Sham Hotel", "Grand Plaza Al Madina", "Al Ansar Golden Tulip", 
  "Al Ansar New Palace", "Madinah Seasons Hotel", "Concorde Al Khair Hotel", "Al Haram Hotel Madinah",
  "Zowar Al Saqifah Hotel", "Zowar Al Madina", "Al Mukhtara International", "Al Eiman Taiba", 
  "Al Eiman Ohud", "Al Eiman Al Qibla", "Al Manakha Rotana", "Al Salam Hotel", "Al Saha Hotel", 
  "Al Nokhba Royal", "Sidra Al Madina Hotel", "Dar Al Naeem Hotel"
];

const HotelVoucherEntry: React.FC<HotelVoucherEntryProps> = ({ onComplete, initialData, editingData, isCompact }) => {
  const isEdit = !!editingData;
  const customers = db.getCustomers();
  const vendors = db.getVendors();
  const accounts = db.getAccounts();
  const settings = db.getSettings();
  const [isSaving, setIsSaving] = useState(false);

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
    roe: settings.defaultROE || 83.5,
    remarks: ''
  });

  const [finances, setFinances] = useState({
    unitSale: 0,
    unitBuy: 0,
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
        country: dataToLoad.country || '',
        city: dataToLoad.city || '',
        destination: dataToLoad.destination || '',
        confirmationNo: dataToLoad.confirmation_no || '',
        checkIn: dataToLoad.check_in,
        checkOut: dataToLoad.check_out,
        rooms: dataToLoad.rooms || 1,
        roomType: dataToLoad.room_type,
        meal: dataToLoad.meal,
        adults: dataToLoad.adults,
        children: dataToLoad.children,
        currency: dataToLoad.currency || 'PKR',
        roe: dataToLoad.roe || settings.defaultROE
      });

      const units = (dataToLoad.rooms || 1) * dataToLoad.nights;
      setFinances({
        unitSale: dataToLoad.sale_price_pkr / (dataToLoad.currency === 'PKR' ? units : (units * (dataToLoad.roe || 1))),
        unitBuy: dataToLoad.buy_price_pkr / units,
      });
    }
  }, [initialData, editingData]);

  const handleCurrencyChange = (cur: Currency) => {
    setFormData({
      ...formData,
      currency: cur,
      roe: cur === 'PKR' ? 1 : settings.defaultROE
    });
  };

  const nights = useMemo(() => {
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [formData.checkIn, formData.checkOut]);

  const units = formData.rooms * nights;
  
  const totalSalePKR = formData.currency === 'PKR' 
    ? (finances.unitSale * units) 
    : (finances.unitSale * units * formData.roe);
    
  const totalBuyPKR = finances.unitBuy * units;
  const profit = totalSalePKR - totalBuyPKR;

  const handleSave = async () => {
    if (!formData.customerId || !formData.vendorId || !formData.paxName || !formData.hotelName) {
      alert("Please enter all required fields.");
      return;
    }
    
    setIsSaving(true);

    const receivableAcc = accounts.find(a => a.type === AccountType.RECEIVABLE);
    const payableAcc = accounts.find(a => a.type === AccountType.PAYABLE);
    const incomeAcc = accounts.find(a => a.id === 'acc-3' || a.type === AccountType.INCOME);
    
    if (!receivableAcc || !payableAcc || !incomeAcc) { 
      alert("Accounting setup incomplete. Check Chart of Accounts."); 
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
      hotel_name: formData.hotelName, 
      country: formData.country, 
      city: formData.city, 
      destination: formData.destination || formData.city, 
      confirmation_no: formData.confirmationNo, 
      option_date: formData.optionDate, 
      check_in: formData.checkIn, 
      check_out: formData.checkOut, 
      nights, 
      rooms: formData.rooms, 
      room_type: formData.roomType, 
      meal: formData.meal, 
      adults: formData.adults, 
      children: formData.children, 
      sale_price_pkr: totalSalePKR, 
      buy_price_pkr: totalBuyPKR, 
      sale_rate_sar: formData.currency === 'SAR' ? finances.unitSale : 0, 
      sale_total_sar: formData.currency === 'SAR' ? finances.unitSale * units : 0, 
      sale_rate_usd: formData.currency === 'USD' ? finances.unitSale : 0, 
      sale_total_usd: formData.currency === 'USD' ? finances.unitSale * units : 0, 
      currency: formData.currency, 
      roe: formData.roe, 
      profit
    };

    try {
      if (isEdit) {
        await db.updateHotelVoucher(editingData!.id, payload, entries);
      } else {
        await db.addHotelVoucher(payload, entries);
      }
      onComplete();
    } catch (err: any) {
      alert("Failed to save booking: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-5 focus:ring-slate-900 transition-all text-sm font-medium bg-slate-50/50 dark:bg-slate-800 dark:text-white";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="max-w-6xl mx-auto pb-12 px-2 sm:px-0">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/5 border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 px-6 sm:px-10 py-8 text-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
             <button onClick={onComplete} className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"><ArrowLeft size={20}/></button>
             <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Bed className="text-blue-400 shrink-0" /> {isEdit ? 'Edit' : 'New'} Booking
                </h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Multi-Currency Transaction Engine</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
             <div className="bg-slate-800 p-4 rounded-2xl border border-white/5 space-y-1">
                <p className={labelClass + " text-blue-300 ml-0"}>Post Date</p>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-transparent border-none text-white text-sm font-bold focus:ring-0 p-0 block w-full" />
             </div>
             <div className="bg-slate-800 p-4 rounded-2xl border border-white/5 space-y-1">
                <p className={labelClass + " text-emerald-300 ml-0"}>Currency</p>
                <select value={formData.currency} onChange={e => handleCurrencyChange(e.target.value as Currency)} className="bg-transparent border-none text-white text-sm font-bold focus:ring-0 p-0 block w-full uppercase">
                   <option value="PKR" className="text-slate-900">PKR</option>
                   <option value="SAR" className="text-slate-900">SAR</option>
                   <option value="USD" className="text-slate-900">USD</option>
                </select>
             </div>
             {formData.currency !== 'PKR' && (
               <div className="bg-slate-800 p-4 rounded-2xl border border-emerald-500/30 space-y-1 animate-in slide-in-from-right-2">
                  <p className={labelClass + " text-emerald-400 ml-0"}>Ex. Rate (ROE)</p>
                  <input type="number" step="0.01" value={formData.roe} onChange={e => setFormData({...formData, roe: Number(e.target.value)})} className="bg-transparent border-none text-white text-sm font-black focus:ring-0 p-0 block w-full" />
               </div>
             )}
          </div>
        </div>

        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-10">
            {/* Account & Location */}
            <section>
              <h3 className="text-xs font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Core Booking Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Customer</label>
                  <select value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className={inputClass}>
                    <option value="">Select Account</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Supplier</label>
                  <select value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})} className={inputClass}>
                    <option value="">Select Vendor</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Passenger Name</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" className={inputClass + " pl-12"} value={formData.paxName} onChange={e => setFormData({...formData, paxName: e.target.value})} placeholder="Lead Guest Name" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Hotel Property</label>
                  <div className="relative">
                    <Bed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      list="hotel-options"
                      className={inputClass + " pl-12"} 
                      value={formData.hotelName} 
                      onChange={e => setFormData({...formData, hotelName: e.target.value})} 
                      placeholder="Property Title (Makkah/Madina)" 
                    />
                    <datalist id="hotel-options">
                      {HOTEL_OPTIONS.map((hotel, index) => (
                        <option key={index} value={hotel} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" className={inputClass} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input type="text" className={inputClass} value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                </div>
              </div>
            </section>

            {/* Capacity */}
            <section>
              <h3 className="text-xs font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Capacity & Stay
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>Rooms</label>
                  <input type="number" min="1" className={inputClass} value={formData.rooms} onChange={e => setFormData({...formData, rooms: Number(e.target.value)})} />
                </div>
                <div>
                  <label className={labelClass}>Room Type</label>
                  <select className={inputClass} value={formData.roomType} onChange={e => setFormData({...formData, roomType: e.target.value})}>
                    <option value="SINGLE">SINGLE</option>
                    <option value="DOUBLE">DOUBLE</option>
                    <option value="TRIPLE">TRIPLE</option>
                    <option value="QUAD">QUAD</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Meal Plan</label>
                  <select className={inputClass} value={formData.meal} onChange={e => setFormData({...formData, meal: e.target.value})}>
                    <option value="NONE">RO</option>
                    <option value="BB">BB</option>
                    <option value="HB">HB</option>
                    <option value="FB">FB</option>
                  </select>
                </div>
                <div className="col-span-full grid grid-cols-2 gap-5">
                   <div>
                     <label className={labelClass}>Check-In</label>
                     <input type="date" className={inputClass} value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} />
                   </div>
                   <div>
                     <label className={labelClass}>Check-Out</label>
                     <input type="date" className={inputClass} value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} />
                   </div>
                </div>
              </div>
            </section>
          </div>

          {/* Financials */}
          <div className="space-y-10">
            <section className="bg-slate-950 rounded-[2.5rem] p-8 sm:p-10 text-white space-y-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full -translate-y-20 translate-x-20 transition-transform group-hover:scale-125"></div>
              
              <div className="space-y-6 relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Functional Financial Analysis</h4>
                
                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className={labelClass + " text-slate-500"}>Sale / Unit ({formData.currency})</label>
                      <input 
                        type="number" 
                        className="w-full bg-white/5 border-white/10 rounded-2xl py-4 px-5 text-white font-black text-xl focus:ring-emerald-500 transition-all" 
                        value={finances.unitSale || ''} 
                        onChange={e => setFinances({...finances, unitSale: Number(e.target.value)})}
                      />
                   </div>
                   <div>
                      <label className={labelClass + " text-slate-500"}>Cost / Unit (PKR)</label>
                      <input 
                        type="number" 
                        className="w-full bg-white/5 border-white/10 rounded-2xl py-4 px-5 text-rose-400 font-black text-xl focus:ring-emerald-500 transition-all" 
                        value={finances.unitBuy || ''} 
                        onChange={e => setFinances({...finances, unitBuy: Number(e.target.value)})}
                      />
                   </div>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-6">
                   <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gross Profit (PKR)</p>
                        <h4 className={`text-4xl font-black ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>Rs. {profit.toLocaleString()}</h4>
                      </div>
                      <TrendingUp size={40} className="text-emerald-500/20" />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl">
                         <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Total Receivable</p>
                         <p className="font-black text-sm text-emerald-400">Rs. {totalSalePKR.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl">
                         <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Total Payable</p>
                         <p className="font-black text-sm text-rose-400">Rs. {totalBuyPKR.toLocaleString()}</p>
                      </div>
                   </div>
                </div>
              </div>

              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-blue-900/40 flex items-center justify-center gap-3 active:scale-95 relative z-10 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />} 
                {isSaving ? 'Synchronizing...' : (isEdit ? 'Update Booking' : 'Post to Ledger')}
              </button>
            </section>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-around text-center">
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Duration</p>
                  <p className="font-black text-slate-900 dark:text-white">{nights} Nights</p>
               </div>
               <div className="w-[1px] bg-slate-200 dark:bg-slate-700"></div>
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Total Inventory</p>
                  <p className="font-black text-slate-900 dark:text-white">{units} Units</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelVoucherEntry;
