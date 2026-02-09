
import React, { useState, useMemo } from 'react';
import { db } from '../store';
import { Search, Filter, Printer, FileText, Plus, Copy, Edit3, ArrowRightLeft } from 'lucide-react';
import { VoucherType } from '../types';

const VoucherList: React.FC<{ 
  isCompact: boolean,
  onNew: () => void, 
  onEdit: (id: string) => void,
  onClone: (id: string) => void,
  onPrint: (id: string) => void
}> = ({ isCompact, onNew, onEdit, onClone, onPrint }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<VoucherType | 'ALL'>('ALL');

  const vouchers = db.getVouchers();

  const filtered = useMemo(() => {
    return vouchers.filter(v => {
      const matchesSearch = 
        v.voucher_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'ALL' || v.type === typeFilter;

      return matchesSearch && matchesType;
    }).reverse();
  }, [vouchers, searchTerm, typeFilter]);

  return (
    <div className={`${isCompact ? 'space-y-4' : 'space-y-6'}`}>
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 no-print">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
           <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Search voucher # or narration..." 
               className={`w-full pl-11 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-emerald-500 shadow-sm font-medium dark:text-white ${isCompact ? 'py-1.5 text-xs' : 'py-2.5 text-sm'}`}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <select 
             value={typeFilter} 
             onChange={e => setTypeFilter(e.target.value as any)}
             className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 font-black text-[10px] uppercase tracking-widest dark:text-white focus:ring-emerald-500 ${isCompact ? 'py-1.5' : 'py-2.5'}`}
           >
              <option value="ALL">All Vouchers</option>
              {Object.values(VoucherType).map(t => <option key={t} value={t}>{t}</option>)}
           </select>
        </div>
        <button 
          onClick={onNew}
          className={`bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl ${isCompact ? 'px-4 py-2' : 'px-8 py-3'}`}
        >
          <Plus size={16} /> New Manual Entry
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-800 text-white uppercase text-[9px] font-black tracking-widest">
                <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Voucher # / Date</th>
                <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Classification</th>
                <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Description / Narration</th>
                <th className={`px-6 text-right ${isCompact ? 'py-3' : 'py-5'}`}>Net Posting (PKR)</th>
                <th className={`px-6 text-right ${isCompact ? 'py-3' : 'py-5'}`}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className={`px-6 ${isCompact ? 'py-2' : 'py-4'}`}>
                    <div className="font-black text-slate-900 dark:text-slate-100">{v.voucher_no}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.date}</div>
                  </td>
                  <td className={`px-6 ${isCompact ? 'py-2' : 'py-4'}`}>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">{v.type}</span>
                  </td>
                  <td className={`px-6 max-w-md ${isCompact ? 'py-2' : 'py-4'}`}>
                    <p className="text-slate-600 dark:text-slate-400 font-medium line-clamp-1 italic">"{v.description}"</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{v.entries.length} Ledger Adjustments</p>
                  </td>
                  <td className={`px-6 text-right font-black text-slate-900 dark:text-slate-100 ${isCompact ? 'py-2' : 'py-4'}`}>
                    Rs. {v.total_amount.toLocaleString()}
                  </td>
                  <td className={`px-6 text-right ${isCompact ? 'py-2' : 'py-4'}`}>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => onPrint(v.id)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-900 hover:text-white rounded-lg transition-all"><Printer size={14} /></button>
                       <button onClick={() => onEdit(v.id)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"><Edit3 size={14} /></button>
                       <button onClick={() => onClone(v.id)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-blue-600 hover:text-white rounded-lg transition-all"><Copy size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center opacity-30">
                    <ArrowRightLeft className="mx-auto mb-4" size={48} />
                    <p className="font-black uppercase tracking-[0.4em]">No Ledger Activity Detected</p>
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

export default VoucherList;
