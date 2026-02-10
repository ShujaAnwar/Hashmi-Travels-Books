
import React, { useState, useMemo } from 'react';
import { db } from '../store';
import { Search, Filter, Printer, Plane, ExternalLink, Copy, Edit3, Plus } from 'lucide-react';

const TicketVoucherList: React.FC<{ 
  isCompact: boolean,
  onNew: () => void, 
  onEdit: (id: string) => void,
  onClone: (id: string) => void
}> = ({ isCompact, onNew, onEdit, onClone }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('2024-01-01');
  const [toDate, setToDate] = useState('2026-12-31');

  const tickets = db.getTicketVouchers();

  const filtered = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = 
        t.ticket_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.pax_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.gds_pnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.airline.toLowerCase().includes(searchTerm.toLowerCase());
      
      const date = new Date(t.date);
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const matchesDate = date >= from && date <= to;

      return matchesSearch && matchesDate;
    }).reverse();
  }, [tickets, searchTerm, fromDate, toDate]);

  return (
    <div className={`${isCompact ? 'space-y-4' : 'space-y-6'}`}>
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
           <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Search Ticket #, PNR, or Pax Name..." 
               className={`w-full pl-11 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-emerald-500 shadow-sm font-medium dark:text-white ${isCompact ? 'py-1.5 text-xs' : 'py-2.5 text-sm'}`}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex gap-2">
              <input type="date" className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 font-bold text-[10px] dark:text-white ${isCompact ? 'py-1.5' : 'py-2.5'}`} value={fromDate} onChange={e => setFromDate(e.target.value)} />
              <input type="date" className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 font-bold text-[10px] dark:text-white ${isCompact ? 'py-1.5' : 'py-2.5'}`} value={toDate} onChange={e => setToDate(e.target.value)} />
           </div>
        </div>
        <button 
          onClick={onNew}
          className={`bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl ${isCompact ? 'px-4 py-2' : 'px-8 py-3'}`}
        >
          <Plus size={16} /> New Ticket
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-800 text-white uppercase text-[9px] font-black tracking-widest">
                <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Date / Ref</th>
                <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>PAX Name / Airline</th>
                <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>PNR / Ticket #</th>
                <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Sector</th>
                <th className={`px-6 text-right ${isCompact ? 'py-3' : 'py-5'}`}>Sale (PKR)</th>
                <th className={`px-6 text-right ${isCompact ? 'py-3' : 'py-5'}`}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className={`px-6 ${isCompact ? 'py-2' : 'py-4'}`}>
                    <div className="font-black text-slate-900 dark:text-slate-100">{t.date}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.id}</div>
                  </td>
                  <td className={`px-6 ${isCompact ? 'py-2' : 'py-4'}`}>
                    <div className="font-black uppercase text-blue-600 dark:text-blue-400">{t.pax_name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{t.airline}</div>
                  </td>
                  <td className={`px-6 ${isCompact ? 'py-2' : 'py-4'}`}>
                    <div className="font-black text-slate-700 dark:text-slate-300">{t.gds_pnr}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{t.ticket_no}</div>
                  </td>
                  <td className={`px-6 ${isCompact ? 'py-2' : 'py-4'}`}>
                     <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{t.sector}</span>
                  </td>
                  <td className={`px-6 text-right font-black text-slate-900 dark:text-slate-100 ${isCompact ? 'py-2' : 'py-4'}`}>
                    Rs. {t.total_sale_pkr.toLocaleString()}
                  </td>
                  <td className={`px-6 text-right ${isCompact ? 'py-2' : 'py-4'}`}>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => onEdit(t.id)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"><Edit3 size={14} /></button>
                       <button onClick={() => onClone(t.id)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-blue-600 hover:text-white rounded-lg transition-all"><Copy size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-24 text-center opacity-30 font-black uppercase tracking-[0.4em]">No Records in Ticketing Repository</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TicketVoucherList;
