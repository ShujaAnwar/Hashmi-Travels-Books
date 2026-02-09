
import React, { useState, useMemo } from 'react';
import { db } from '../store';
import { Search, Filter, Printer, FileText, Plus, Download, Copy, Edit3 } from 'lucide-react';

const ReceiptList: React.FC<{ 
  onNew: () => void, 
  onPrint: (id: string) => void,
  onClone: (id: string) => void,
  onEdit: (id: string) => void
}> = ({ onNew, onPrint, onClone, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('2026-02-01');
  const [toDate, setToDate] = useState('2026-12-31');

  const receipts = db.getReceipts();

  const filtered = useMemo(() => {
    return receipts.filter(r => {
      const matchesSearch = 
        r.receipt_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.narration.toLowerCase().includes(searchTerm.toLowerCase());
      
      const date = new Date(r.date);
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const matchesDate = date >= from && date <= to;

      return matchesSearch && matchesDate;
    }).reverse();
  }, [receipts, searchTerm, fromDate, toDate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <div className="flex gap-4 flex-1 max-w-4xl">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search receipt # or narration..." 
               className="w-full pl-10 pr-4 py-2 border-slate-200 rounded-xl focus:ring-slate-900 text-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <input type="date" className="px-4 py-2 border-slate-200 rounded-xl text-sm" value={fromDate} onChange={e => setFromDate(e.target.value)} />
           <input type="date" className="px-4 py-2 border-slate-200 rounded-xl text-sm" value={toDate} onChange={e => setToDate(e.target.value)} />
           <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2"><Filter size={18} /> Filter</button>
        </div>
        <button 
          onClick={onNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Create Receipt
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Receipt #</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">From</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Account</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Amount</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(r => {
              const account = db.getAccount(r.account_id);
              let fromName = 'Miscellaneous';
              if (r.type === 'Customer') fromName = db.getCustomer(r.customer_id!)?.name || 'Unknown';
              if (r.type === 'Vendor') fromName = db.getVendor(r.vendor_id!)?.name || 'Unknown';

              return (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-blue-600">{r.receipt_no}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{r.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{fromName}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{r.type} Receipt</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500 font-medium">{account?.title}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-emerald-600">Rs. {r.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => onEdit(r.id)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all" title="Edit Receipt">
                         <Edit3 size={16} />
                       </button>
                       <button onClick={() => onClone(r.id)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-sky-600 hover:text-white transition-all" title="Clone Receipt">
                         <Copy size={16} />
                       </button>
                       <button onClick={() => onPrint(r.id)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                         <Printer size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceiptList;
