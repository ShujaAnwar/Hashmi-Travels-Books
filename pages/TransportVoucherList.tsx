
import React, { useState, useMemo } from 'react';
import { db } from '../store';
import { Search, Filter, Printer, Bus, FileText, Plus, MapPin, Copy, Edit3 } from 'lucide-react';

const TransportVoucherList: React.FC<{ 
  onNew: () => void, 
  onPrint: (id: string) => void,
  onClone: (id: string) => void,
  onEdit: (id: string) => void
}> = ({ onNew, onPrint, onClone, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('2026-02-01');
  const [toDate, setToDate] = useState('2026-12-31');

  const transportVouchers = db.getTransportVouchers();

  const filtered = useMemo(() => {
    return transportVouchers.filter(v => {
      const customer = db.getCustomer(v.customer_id);
      const matchesSearch = 
        v.voucher_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const date = new Date(v.date);
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const matchesDate = date >= from && date <= to;

      return matchesSearch && matchesDate;
    }).reverse();
  }, [transportVouchers, searchTerm, fromDate, toDate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <div className="flex gap-4 flex-1 max-w-4xl">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search by customer, route, or voucher #..." 
               className="w-full pl-10 pr-4 py-2 border-slate-200 rounded-xl focus:ring-slate-900 text-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <input type="date" className="px-4 py-2 border-slate-200 rounded-xl text-sm" value={fromDate} onChange={e => setFromDate(e.target.value)} />
           <input type="date" className="px-4 py-2 border-slate-200 rounded-xl text-sm" value={toDate} onChange={e => setToDate(e.target.value)} />
           <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all hover:bg-slate-800 h-[42px]"><Filter size={18} /></button>
        </div>
        <button 
          onClick={onNew}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200"
        >
          <Plus size={20} /> Create Transport Voucher
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Voucher #</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Route & Transport</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Trip Info</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-right">Amount</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(v => {
              const customer = db.getCustomer(v.customer_id);
              return (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{v.voucher_no}</div>
                    <div className="text-[10px] text-slate-400 font-bold">{v.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-blue-600 text-sm uppercase">{customer?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
                       <MapPin size={12} className="text-slate-400"/> {v.route}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{v.transport_type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] font-medium text-slate-600">
                      Trip: {v.trip_date}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold">Qty: {v.quantity} @ {v.rate}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-slate-800">${v.total_amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => onEdit(v.id)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all" title="Edit Voucher">
                         <Edit3 size={16} />
                       </button>
                       <button onClick={() => onClone(v.id)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-sky-600 hover:text-white transition-all" title="Clone Voucher">
                         <Copy size={16} />
                       </button>
                       <button onClick={() => onPrint(v.id)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all" title="Print Transport Voucher">
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

export default TransportVoucherList;
