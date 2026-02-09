
import React, { useState, useMemo } from 'react';
import { db } from '../store';
import { Vendor } from '../types';
import { Search, Printer, UserPlus, Edit2, Trash2, LayoutList, CheckCircle2, XCircle, Copy } from 'lucide-react';
import PartyForm from '../components/PartyForm';

const VendorList: React.FC<{ 
  isCompact: boolean,
  onViewLedger: (id: string) => void,
  onPrintLedger: (id: string) => void
}> = ({ isCompact, onViewLedger, onPrintLedger }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | undefined>(undefined);

  const vendors = db.getVendors();

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           v.vendor_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || 
                           (statusFilter === 'ACTIVE' && v.is_active) || 
                           (statusFilter === 'INACTIVE' && !v.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [vendors, searchTerm, statusFilter]);

  const handleSave = (data: any) => {
    if (editingVendor && !editingVendor.id.startsWith('new_clone_')) {
      db.updateVendor(editingVendor.id, data);
    } else {
      db.addVendor(data);
    }
    setIsFormOpen(false);
    setEditingVendor(undefined);
  };

  const handleClone = (vendor: Vendor) => {
    const clone: any = { ...vendor, id: 'new_clone_' + Date.now(), vendor_code: '', opening_balance: 0 };
    setEditingVendor(clone);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this vendor? This cannot be undone if no transactions exist.")) {
      try {
        db.deleteVendor(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className={`${isCompact ? 'space-y-4' : 'space-y-6'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div className="flex flex-wrap gap-4 flex-1">
           <div className="relative min-w-[300px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search by vendor name or code..." 
               className={`w-full pl-10 pr-4 border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:ring-slate-900 font-medium dark:text-white ${isCompact ? 'py-1.5 text-xs' : 'py-2.5 text-sm'}`}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <select 
             className={`px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest shadow-sm focus:ring-emerald-500 ${isCompact ? 'py-1.5' : 'py-2.5'}`}
             value={statusFilter}
             onChange={e => setStatusFilter(e.target.value as any)}
           >
             <option value="ALL">All Status</option>
             <option value="ACTIVE">Active Only</option>
             <option value="INACTIVE">Inactive Only</option>
           </select>
        </div>
        <div className="flex gap-3">
           <button onClick={() => window.print()} className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${isCompact ? 'py-2 px-4' : 'py-3 px-6'}`}>
              <Printer size={14} /> <span className="hidden sm:inline">Print</span>
           </button>
           <button 
             onClick={() => { setEditingVendor(undefined); setIsFormOpen(true); }}
             className={`flex-1 sm:flex-none bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-slate-900/10 ${isCompact ? 'px-4 py-2' : 'px-8 py-3'}`}
           >
             <UserPlus size={16} /> Add Vendor
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-800 text-white uppercase text-[9px] font-black tracking-widest">
                <th className={`px-6 ${isCompact ? 'py-2' : 'py-3'}`}>Code</th>
                <th className={`px-6 ${isCompact ? 'py-2' : 'py-3'}`}>Vendor Name</th>
                <th className={`px-6 ${isCompact ? 'py-2' : 'py-3'}`}>Contact Info</th>
                <th className={`px-6 ${isCompact ? 'py-2' : 'py-3'}`}>City</th>
                <th className={`px-6 text-right ${isCompact ? 'py-2' : 'py-3'}`}>Balance Payable</th>
                <th className={`px-6 text-center ${isCompact ? 'py-2' : 'py-3'}`}>Status</th>
                <th className={`px-6 text-right ${isCompact ? 'py-2' : 'py-3'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {filteredVendors.map(v => {
                const ledger = db.getPartyLedger(v.id, 'Vendor');
                return (
                  <tr key={v.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group ${!v.is_active ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                    <td className={`px-6 font-black text-emerald-600 dark:text-emerald-400 ${isCompact ? 'py-1.5 text-[10px]' : 'py-3 text-xs'}`}>{v.vendor_code}</td>
                    <td className={`px-6 ${isCompact ? 'py-1.5' : 'py-3'}`}>
                      <div className={`font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>{v.name}</div>
                      <div className={`text-[7px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px] ${isCompact ? 'text-[7px]' : 'text-[8px]'}`}>{v.address}</div>
                    </td>
                    <td className={`px-6 ${isCompact ? 'py-1.5' : 'py-3'}`}>
                      <div className={`font-bold text-slate-700 dark:text-slate-300 ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>{v.phone}</div>
                      <div className={`text-slate-400 dark:text-slate-500 font-medium ${isCompact ? 'text-[8px]' : 'text-[10px]'}`}>{v.email}</div>
                    </td>
                    <td className={`px-6 font-bold text-slate-500 dark:text-slate-400 uppercase ${isCompact ? 'py-1.5 text-[8px]' : 'py-3 text-[10px]'}`}>{v.city}</td>
                    <td className={`px-6 text-right ${isCompact ? 'py-1.5' : 'py-3'}`}>
                      <div className={`font-black ${isCompact ? 'text-[10px]' : 'text-sm'} ${ledger.closingBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        Rs. {Math.abs(ledger.closingBalance).toLocaleString()}
                        <span className="text-[7px] ml-1 opacity-40">{ledger.closingBalance >= 0 ? 'CR' : 'DR'}</span>
                      </div>
                    </td>
                    <td className={`px-6 text-center ${isCompact ? 'py-1.5' : 'py-3'}`}>
                      {v.is_active ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest">Active</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest">Inactive</span>
                      )}
                    </td>
                    <td className={`px-6 text-right ${isCompact ? 'py-1.5' : 'py-3'}`}>
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleClone(v)} className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-emerald-600 hover:text-white rounded transition-all"><Copy size={12} /></button>
                         <button onClick={() => onViewLedger(v.id)} className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-blue-600 hover:text-white rounded transition-all"><LayoutList size={12} /></button>
                         <button onClick={() => { setEditingVendor(v); setIsFormOpen(true); }} className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-900 hover:text-white rounded transition-all"><Edit2 size={12} /></button>
                         <button onClick={() => handleDelete(v.id)} className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-600 hover:text-white rounded transition-all"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[9px] opacity-30">
                    No vendors matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <PartyForm 
          isCompact={isCompact}
          type="Vendor" 
          initialData={editingVendor} 
          onClose={() => { setIsFormOpen(false); setEditingVendor(undefined); }} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};

export default VendorList;
