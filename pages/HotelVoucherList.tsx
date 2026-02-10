
import React, { useState, useMemo } from 'react';
import { db } from '../store';
import { Search, Filter, Printer, Eye, ExternalLink, Copy, Edit3, Plus, Hotel, MapPin, Globe, Hash } from 'lucide-react';

const HotelVoucherList: React.FC<{ 
  isCompact: boolean,
  onNew: () => void, 
  onView: (id: string, variant: 'PKR' | 'SAR' | 'USD' | 'BOOKING') => void,
  onClone: (id: string) => void,
  onEdit: (id: string) => void
}> = ({ isCompact, onNew, onView, onClone, onEdit }) => {
  // Set fromDate to a much earlier default to catch all existing DB records
  const [fromDate, setFromDate] = useState('2020-01-01');
  const [toDate, setToDate] = useState('2030-12-31');
  const [searchTerm, setSearchTerm] = useState('');

  const hotelVouchers = db.getHotelVouchers();

  const filteredVouchers = useMemo(() => {
    return hotelVouchers.filter(v => {
      const matchesSearch = 
        v.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.pax_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.hotel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.city && v.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.country && v.country.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Use string comparison for ISO dates (YYYY-MM-DD) which is more reliable than new Date()
      const matchesDate = v.date >= fromDate && v.date <= toDate;

      return matchesSearch && matchesDate;
    }).reverse();
  }, [hotelVouchers, fromDate, toDate, searchTerm]);

  return (
    <div className={`${isCompact ? 'space-y-3' : 'space-y-6'}`}>
      {/* Header & Filters */}
      <div className={`flex flex-col xl:flex-row justify-between items-stretch xl:items-end gap-4`}>
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-end gap-4 ${isCompact ? 'p-4' : 'p-5 lg:p-7'}`}>
          <div className="flex-1">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Universal Search</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Passenger, Hotel, City or Country..." 
                className={`w-full pl-11 pr-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-emerald-500 transition-all font-medium dark:text-white ${isCompact ? 'py-1.5 text-xs' : 'py-2.5 text-sm'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex gap-3">
            <div className="flex-1 sm:w-40">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">From</label>
              <input type="date" className={`w-full px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white ${isCompact ? 'py-1.5 text-[10px]' : 'py-2.5 text-xs'}`} value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="flex-1 sm:w-40">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">To</label>
              <input type="date" className={`w-full px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white ${isCompact ? 'py-1.5 text-[10px]' : 'py-2.5 text-xs'}`} value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
          </div>
          <button className={`bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-slate-200 transition-all ${isCompact ? 'px-4 py-2' : 'px-6 py-3.5'}`}>
            <Filter size={14} /> Filter
          </button>
        </div>

        <button 
          onClick={onNew}
          className={`bg-slate-900 dark:bg-emerald-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-slate-900/10 ${isCompact ? 'px-6 py-3' : 'px-10 py-5'}`}
        >
          <Plus size={18} /> New Hotel Booking
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-800 text-white uppercase text-[9px] font-black tracking-widest">
                <th className={`px-6 sticky left-0 bg-slate-900 dark:bg-slate-800 z-10 ${isCompact ? 'py-3' : 'py-5'}`}>Ref ID / Date</th>
                <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Customer Entity</th>
                <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Guest & Hotel Details</th>
                <th className={`px-6 text-center ${isCompact ? 'py-3' : 'py-5'}`}>Loc / Rooms</th>
                <th className={`px-6 text-right ${isCompact ? 'py-3' : 'py-5'}`}>PKR Total</th>
                <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Quick Print</th>
                <th className={`px-6 text-right sticky right-0 bg-slate-900 dark:bg-slate-800 z-10 ${isCompact ? 'py-3' : 'py-5'}`}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredVouchers.map((v) => {
                const customer = db.getCustomer(v.customer_id);
                return (
                  <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className={`px-6 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 z-10 ${isCompact ? 'py-2' : 'py-4'}`}>
                      <div className={`font-black text-slate-900 dark:text-slate-100 tracking-tight ${isCompact ? 'text-xs' : 'text-sm'}`}>{v.id}</div>
                      <div className={`font-bold uppercase tracking-wide text-slate-400 ${isCompact ? 'text-[8px]' : 'text-[9px]'}`}>{v.date}</div>
                    </td>
                    <td className={`px-6 ${isCompact ? 'py-2' : 'py-4'}`}>
                       <div className={`font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter ${isCompact ? 'text-[10px]' : 'text-xs'}`}>{customer?.name}</div>
                    </td>
                    <td className={`px-6 ${isCompact ? 'py-2' : 'py-4'}`}>
                      <div className={`font-black uppercase text-slate-800 dark:text-slate-200 truncate max-w-[250px] ${isCompact ? 'text-[10px]' : 'text-xs'}`}>{v.pax_name} @ {v.hotel_name}</div>
                      <div className={`text-slate-500 font-bold uppercase tracking-wide mt-0.5 ${isCompact ? 'text-[8px]' : 'text-[9px]'}`}>{v.check_in} — {v.check_out} ({v.nights}N)</div>
                    </td>
                    <td className={`px-6 text-center ${isCompact ? 'py-2' : 'py-4'}`}>
                       <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1.5 text-slate-500 font-black uppercase text-[8px] tracking-widest">
                             <MapPin size={10} className="text-blue-500" /> {v.city || '—'} / {v.country || '—'}
                          </div>
                          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Hash size={10}/> {v.rooms || 1} Rooms
                          </span>
                       </div>
                    </td>
                    <td className={`px-6 text-right ${isCompact ? 'py-2' : 'py-4'}`}>
                       <div className={`font-black text-slate-900 dark:text-slate-100 ${isCompact ? 'text-xs' : 'text-sm'}`}>Rs. {v.sale_price_pkr.toLocaleString()}</div>
                    </td>
                    <td className={`px-6 ${isCompact ? 'py-2' : 'py-4'}`}>
                      <div className="flex gap-1">
                        <button onClick={() => onView(v.id, 'BOOKING')} className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 rounded-lg hover:bg-amber-600 hover:text-white transition-all" title="View Booking Voucher"><Eye size={14}/></button>
                        <button onClick={() => onView(v.id, 'PKR')} className="p-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-500 rounded-lg hover:bg-sky-600 hover:text-white transition-all" title="Print PKR Invoice"><Hotel size={14}/></button>
                        <button onClick={() => onView(v.id, 'SAR')} className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-500 rounded-lg hover:bg-emerald-600 hover:text-white transition-all" title="View SAR Voucher"><ExternalLink size={14}/></button>
                      </div>
                    </td>
                    <td className={`px-6 text-right sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 z-10 border-l border-slate-50 dark:border-slate-800 ${isCompact ? 'py-2' : 'py-4'}`}>
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => onEdit(v.id)} className={`bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm ${isCompact ? 'p-1.5' : 'p-2.5'}`}><Edit3 size={14}/></button>
                        <button onClick={() => onClone(v.id)} className={`bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm ${isCompact ? 'p-1.5' : 'p-2.5'}`}><Copy size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredVouchers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <p className="font-black uppercase tracking-[0.2em] opacity-30">No Hotel Records Found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HotelVoucherList;
