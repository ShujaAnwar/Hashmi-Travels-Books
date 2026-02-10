
import React, { useState, useMemo } from 'react';
import { db } from '../store';
import { Search, Filter, Printer, Plus, Copy, Trash2, Wallet } from 'lucide-react';

const ReceiptList: React.FC<{ 
  onNew: () => void, 
  onPrint: (id: string) => void,
  onClone: (id: string) => void,
  onEdit: (id: string) => void
}> = ({ onNew, onPrint, onClone, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-12-31');

  const receipts = db.getReceipts();

  const filtered = useMemo(() => {
    return receipts.filter(r => {
      const matchesSearch = r.receipt_no.toLowerCase().includes(searchTerm.toLowerCase()) || r.narration.toLowerCase().includes(searchTerm.toLowerCase());
      const date = new Date(r.date);
      return matchesSearch && date >= new Date(fromDate) && date <= new Date(toDate);
    }).reverse();
  }, [receipts, searchTerm, fromDate, toDate]);

  const handleDelete = (id: string) => {
    if (window.confirm("Permanently delete this receipt and reverse ledger postings?")) {
      db.deleteReceipt(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-end gap-4 no-print bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
           <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input type="text" placeholder="Search receipt registry..." className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-sky-500 font-medium dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
           <div className="flex gap-2">
             <input type="date" className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white" value={fromDate} onChange={e => setFromDate(e.target.value)} />
             <input type="date" className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white" value={toDate} onChange={e => setToDate(e.target.value)} />
           </div>
        </div>
        <button onClick={onNew} className="bg-slate-900 dark:bg-sky-600 hover:opacity-90 text-white px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl">
          <Plus size={18} /> New Receipt
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-800 text-white uppercase text-[9px] font-black tracking-widest">
                <th className="px-8 py-5">Receipt # / Date</th>
                <th className="px-6 py-5">Paid By (Entity)</th>
                <th className="px-6 py-5">Settlement Narration</th>
                <th className="px-6 py-5">Deposit Account</th>
                <th className="px-6 py-5 text-right">PKR Amount</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(r => {
                const party = r.type === 'Customer' ? db.getCustomer(r.customer_id!) : db.getVendor(r.vendor_id!);
                return (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="font-black text-sky-600 dark:text-sky-400 text-sm">{r.receipt_no}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{r.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter text-xs">{party?.name || 'Cash Party'}</div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{r.type} Source</div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs text-slate-600 dark:text-slate-400 font-medium max-w-xs italic line-clamp-1">"{r.narration}"</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{db.getAccount(r.account_id)?.title}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-black text-emerald-600 text-base">Rs. {r.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => onClone(r)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-sky-600 hover:text-white rounded-lg transition-all shadow-sm"><Copy size={14}/></button>
                         <button onClick={() => onPrint(r.id)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm"><Printer size={14}/></button>
                         <button onClick={() => handleDelete(r.id)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-600 hover:text-white rounded-lg transition-all shadow-sm"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <Wallet size={48} className="mx-auto text-slate-100 dark:text-slate-800 mb-4" />
                    <p className="font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700">Empty Registry</p>
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

export default ReceiptList;
