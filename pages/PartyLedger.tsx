
import React, { useState, useMemo } from 'react';
import { db } from '../store';
import { VoucherType } from '../types';
import { Search, Filter, Printer, Download, ArrowLeft, ArrowUpRight, ArrowDownRight, Calendar, Globe } from 'lucide-react';

interface PartyLedgerProps {
  partyId: string;
  partyType: 'Customer' | 'Vendor';
  onBack: () => void;
  onPrint: () => void;
  isCompact?: boolean;
}

const PartyLedger: React.FC<PartyLedgerProps> = ({ partyId, partyType, onBack, onPrint, isCompact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-12-31');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const ledger = useMemo(() => db.getPartyLedger(partyId, partyType), [partyId, partyType]);

  const filteredTransactions = useMemo(() => {
    return ledger.transactions.filter(t => {
      const date = new Date(t.date);
      const matchesDate = date >= new Date(fromDate) && date <= new Date(toDate);
      const matchesSearch = t.voucher_no.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
      
      return matchesDate && matchesSearch && matchesType;
    });
  }, [ledger, fromDate, toDate, searchTerm, typeFilter]);

  const stats = useMemo(() => {
    const totalDr = filteredTransactions.reduce((s, t) => s + t.debit, 0);
    const totalCr = filteredTransactions.reduce((s, t) => s + t.credit, 0);
    return { totalDr, totalCr };
  }, [filteredTransactions]);

  return (
    <div className={`${isCompact ? 'space-y-4' : 'space-y-6'}`}>
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 no-print">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
               <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div>
               <h2 className={`${isCompact ? 'text-xl' : 'text-2xl'} font-black text-slate-800 dark:text-white uppercase tracking-tight`}>{ledger.partyName}</h2>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Functional PKR Statement</p>
            </div>
         </div>
         <div className="flex gap-2">
            <button onClick={onPrint} className={`bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:opacity-90 transition-all ${isCompact ? 'px-5 py-2.5' : 'px-8 py-3.5'}`}>
               <Printer size={16} /> Print Ledger
            </button>
         </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl"><ArrowUpRight size={24}/></div>
            <div>
               <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Period Debits</p>
               <h4 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Rs. {stats.totalDr.toLocaleString()}</h4>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl"><ArrowDownRight size={24}/></div>
            <div>
               <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Period Credits</p>
               <h4 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Rs. {stats.totalCr.toLocaleString()}</h4>
            </div>
         </div>
         <div className="bg-slate-900 dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-xl flex items-center gap-4 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="p-3 bg-white/10 text-white rounded-xl"><Globe size={24}/></div>
            <div>
               <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Net Functional Balance</p>
               <h4 className="text-lg font-black tracking-tight">Rs. {ledger.closingBalance.toLocaleString()}</h4>
               <p className="text-[8px] font-bold text-blue-400 mt-1 uppercase tracking-widest">
                  {partyType === 'Customer' ? (ledger.closingBalance >= 0 ? 'Receivable' : 'Credit Balance') : (ledger.closingBalance >= 0 ? 'Payable' : 'Debit Advance')}
               </p>
            </div>
         </div>
      </div>

      {/* Filter Matrix */}
      <div className={`bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 no-print ${isCompact ? 'p-4' : 'p-6'}`}>
         <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Range</label>
            <div className="flex gap-2">
               <input type="date" className="w-full text-xs font-black border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg p-2 focus:ring-emerald-500 dark:text-white" value={fromDate} onChange={e => setFromDate(e.target.value)} />
               <input type="date" className="w-full text-xs font-black border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg p-2 focus:ring-emerald-500 dark:text-white" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
         </div>
         <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Universal Search</label>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
               <input type="text" placeholder="Ref # or Narration..." className="w-full pl-9 py-2 text-xs font-black border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-emerald-500 dark:text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
         </div>
         <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
            <select className="w-full py-2 text-xs font-black border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-emerald-500 dark:text-white" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
               <option value="ALL">All Entries</option>
               {Object.values(VoucherType).map(t => <option key={t} value={t}>{t} Only</option>)}
            </select>
         </div>
         <div className="flex items-end">
            <button className="w-full bg-slate-100 dark:bg-slate-800 hover:opacity-80 text-slate-800 dark:text-white text-[10px] font-black uppercase tracking-widest py-2.5 rounded-lg transition-all flex items-center justify-center gap-2">
               <Filter size={14} /> Apply Filter
            </button>
         </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                  <tr className="bg-slate-900 dark:bg-slate-800 text-white uppercase text-[9px] font-black tracking-widest">
                     <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Post Date</th>
                     <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Audit Ref</th>
                     <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Description / Narration</th>
                     <th className={`px-6 text-center ${isCompact ? 'py-3' : 'py-5'}`}>ROE</th>
                     <th className={`px-6 text-right ${isCompact ? 'py-3' : 'py-5'}`}>Debit (+)</th>
                     <th className={`px-6 text-right ${isCompact ? 'py-3' : 'py-5'}`}>Credit (-)</th>
                     <th className={`px-6 text-right ${isCompact ? 'py-3' : 'py-5'}`}>Running Balance</th>
                  </tr>
               </thead>
               <tbody className="text-[10px] divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTransactions.map((t, i) => (
                     <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className={`px-6 font-bold whitespace-nowrap text-slate-500 dark:text-slate-400 ${isCompact ? 'py-2.5' : 'py-5'}`}>{t.date}</td>
                        <td className={`px-6 font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter ${isCompact ? 'py-2.5' : 'py-5'}`}>
                           <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[8px] mr-1.5">{t.type}</span> {t.voucher_no}
                        </td>
                        <td className={`px-6 max-w-md font-medium text-slate-600 dark:text-slate-400 leading-relaxed ${isCompact ? 'py-2.5' : 'py-5'}`}>{t.description}</td>
                        <td className={`px-6 text-center ${isCompact ? 'py-2.5' : 'py-5'}`}>
                           {t.currency !== 'PKR' && (
                              <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-black">{t.roe}</span>
                           )}
                        </td>
                        <td className={`px-6 text-right font-black text-slate-800 dark:text-slate-200 ${isCompact ? 'py-2.5 text-[11px]' : 'py-5 text-sm'}`}>{t.debit > 0 ? t.debit.toLocaleString() : '-'}</td>
                        <td className={`px-6 text-right font-black text-emerald-600 dark:text-emerald-400 ${isCompact ? 'py-2.5 text-[11px]' : 'py-5 text-sm'}`}>{t.credit > 0 ? t.credit.toLocaleString() : '-'}</td>
                        <td className={`px-6 text-right font-black bg-slate-50/50 dark:bg-slate-800/30 ${isCompact ? 'py-2.5 text-[11px]' : 'py-5 text-sm'}`}>
                           <span className={t.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}>
                              {Math.abs(t.balance).toLocaleString()} {t.balance >= 0 ? 'Dr' : 'Cr'}
                           </span>
                        </td>
                     </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                     <tr>
                        <td colSpan={7} className="py-24 text-center">
                           <div className="flex flex-col items-center opacity-10 dark:opacity-20">
                              <Calendar size={64} className="mb-4 dark:text-white" />
                              <p className="text-lg font-black uppercase tracking-[0.2em] dark:text-white">No Activity Found</p>
                           </div>
                        </td>
                     </tr>
                  )}
               </tbody>
               <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                  <tr className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-widest">
                     <td colSpan={4} className="px-6 py-6 text-right">Statement Period Totals:</td>
                     <td className="px-6 py-6 text-right border-l border-slate-200 dark:border-slate-700">Rs. {stats.totalDr.toLocaleString()}</td>
                     <td className="px-6 py-6 text-right border-l border-slate-200 dark:border-slate-700">Rs. {stats.totalCr.toLocaleString()}</td>
                     <td className="px-6 py-6 text-right bg-slate-900 dark:bg-emerald-600 text-white">Rs. {ledger.closingBalance.toLocaleString()}</td>
                  </tr>
               </tfoot>
            </table>
         </div>
      </div>
    </div>
  );
};

export default PartyLedger;
