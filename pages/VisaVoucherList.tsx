
import React, { useState, useMemo } from 'react';
import { db } from '../store';
import { Search, Filter, FileBadge, Plus, Copy, Edit3, Globe, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { VisaStatus } from '../types';

const VisaVoucherList: React.FC<{ 
  isCompact: boolean,
  onNew: () => void, 
  onEdit: (id: string) => void,
  onClone: (id: string) => void
}> = ({ isCompact, onNew, onEdit, onClone }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VisaStatus | 'ALL'>('ALL');

  const visas = db.getVisaVouchers();

  const filtered = useMemo(() => {
    return visas.filter(v => {
      const matchesSearch = 
        v.pax_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.passport_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.country.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

      return matchesSearch && matchesStatus;
    }).reverse();
  }, [visas, searchTerm, statusFilter]);

  const getStatusColor = (status: VisaStatus) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Rejected': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Applied': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Delivered': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className={`${isCompact ? 'space-y-4' : 'space-y-6'}`}>
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
           <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Search Passenger, Passport or Country..." 
               className={`w-full pl-11 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-emerald-500 shadow-sm font-medium dark:text-white ${isCompact ? 'py-1.5 text-xs' : 'py-2.5 text-sm'}`}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <select 
             value={statusFilter} 
             onChange={e => setStatusFilter(e.target.value as any)}
             className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 font-black text-[10px] uppercase tracking-widest dark:text-white focus:ring-emerald-500 ${isCompact ? 'py-1.5' : 'py-2.5'}`}
           >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Applied">Applied</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Delivered">Delivered</option>
           </select>
        </div>
        <button 
          onClick={onNew}
          className={`bg-slate-900 dark:bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl ${isCompact ? 'px-4 py-2' : 'px-8 py-3'}`}
        >
          <Plus size={16} /> Process Visa
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-800 text-white uppercase text-[9px] font-black tracking-widest">
                <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Submission / Ref</th>
                <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Passenger / Passport</th>
                <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Destination / Type</th>
                <th className={`px-6 ${isCompact ? 'py-3' : 'py-5'}`}>Current Status</th>
                <th className={`px-6 text-right ${isCompact ? 'py-3' : 'py-5'}`}>Sale Total (PKR)</th>
                <th className={`px-6 text-right ${isCompact ? 'py-3' : 'py-5'}`}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className={`px-6 ${isCompact ? 'py-2' : 'py-4'}`}>
                    <div className="font-black text-slate-900 dark:text-slate-100">{v.submission_date}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{v.id}</div>
                  </td>
                  <td className={`px-6 ${isCompact ? 'py-2' : 'py-4'}`}>
                    <div className="font-black uppercase text-purple-600 dark:text-purple-400">{v.pax_name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{v.passport_no}</div>
                  </td>
                  <td className={`px-6 ${isCompact ? 'py-2' : 'py-4'}`}>
                    <div className="flex items-center gap-2">
                       <Globe size={14} className="text-slate-300" />
                       <span className="font-black text-slate-700 dark:text-slate-300 uppercase">{v.country}</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-5">{v.visa_type}</div>
                  </td>
                  <td className={`px-6 ${isCompact ? 'py-2' : 'py-4'}`}>
                     <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${getStatusColor(v.status)}`}>
                        {v.status}
                     </span>
                  </td>
                  <td className={`px-6 text-right font-black text-slate-900 dark:text-slate-100 ${isCompact ? 'py-2' : 'py-4'}`}>
                    Rs. {v.sale_price_pkr.toLocaleString()}
                  </td>
                  <td className={`px-6 text-right ${isCompact ? 'py-2' : 'py-4'}`}>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => onEdit(v.id)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"><Edit3 size={14} /></button>
                       <button onClick={() => onClone(v.id)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-purple-600 hover:text-white rounded-lg transition-all"><Copy size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-24 text-center opacity-30 font-black uppercase tracking-[0.4em]">No Records in Visa Repository</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VisaVoucherList;
