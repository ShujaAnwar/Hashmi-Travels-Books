
import React, { useState, useMemo } from 'react';
import { db } from '../store';
import { Vendor } from '../types';
import { Search, Printer, UserPlus, Edit2, Trash2, LayoutList, CheckCircle2, XCircle, Copy } from 'lucide-react';
import PartyForm from '../components/PartyForm';

const VendorList: React.FC<{ 
  onViewLedger: (id: string) => void,
  onPrintLedger: (id: string) => void
}> = ({ onViewLedger, onPrintLedger }) => {
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div className="flex flex-wrap gap-4 flex-1">
           <div className="relative min-w-[300px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search by vendor name or code..." 
               className="w-full pl-10 pr-4 py-2 border-slate-200 rounded-xl focus:ring-slate-900 text-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <select 
             className="px-4 py-2 border-slate-200 rounded-xl text-sm font-bold text-slate-600"
             value={statusFilter}
             onChange={e => setStatusFilter(e.target.value as any)}
           >
             <option value="ALL">All Status</option>
             <option value="ACTIVE">Active Only</option>
             <option value="INACTIVE">Inactive Only</option>
           </select>
        </div>
        <div className="flex gap-3">
           <button onClick={() => window.print()} className="bg-white text-slate-900 border border-slate-200 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all hover:bg-slate-50">
              <Printer size={18} /> Print List
           </button>
           <button 
             onClick={() => { setEditingVendor(undefined); setIsFormOpen(true); }}
             className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all"
           >
             <UserPlus size={20} /> Add Vendor
           </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Vendor Name</th>
              <th className="px-6 py-4">Contact Info</th>
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4 text-right">Balance Payable</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {filteredVendors.map(v => {
              const ledger = db.getPartyLedger(v.id, 'Vendor');
              return (
                <tr key={v.id} className={`hover:bg-slate-50 transition-colors ${!v.is_active ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  <td className="px-6 py-4 font-black text-emerald-600">{v.vendor_code}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 uppercase tracking-tight">{v.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[200px]">{v.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700">{v.phone}</div>
                    <div className="text-xs text-slate-400">{v.email}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-500 uppercase text-xs">{v.city}</td>
                  <td className="px-6 py-4 text-right">
                    <div className={`font-black ${ledger.closingBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      Rs. {Math.abs(ledger.closingBalance).toLocaleString()}
                      <span className="text-[9px] ml-1">{ledger.closingBalance >= 0 ? 'CR' : 'DR'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {v.is_active ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[9px] font-black uppercase">
                        <CheckCircle2 size={10} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-[9px] font-black uppercase">
                        <XCircle size={10} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => handleClone(v)} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors" title="Clone Vendor">
                         <Copy size={16} />
                       </button>
                       <button onClick={() => onViewLedger(v.id)} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors" title="View Ledger">
                         <LayoutList size={16} />
                       </button>
                       <button onClick={() => { setEditingVendor(v); setIsFormOpen(true); }} className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors" title="Edit Master">
                         <Edit2 size={16} />
                       </button>
                       <button onClick={() => handleDelete(v.id)} className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors" title="Delete">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredVendors.length === 0 && (
              <tr>
                <td colSpan={7} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs opacity-30">
                  No vendors matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <PartyForm 
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
