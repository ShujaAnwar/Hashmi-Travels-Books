
import React, { useState, useRef } from 'react';
import { db } from '../store';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  Trash2, 
  History, 
  Search, 
  Database, 
  AlertTriangle,
  Lock,
  Clock,
  User,
  Activity
} from 'lucide-react';

interface SecurityProps {
  isCompact: boolean;
}

const Security: React.FC<SecurityProps> = ({ isCompact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const auditLogs = db.getAuditLogs().filter(log => 
    log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.edited_by.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBackup = () => {
    const data = db.exportDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel_ledger_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = db.importDatabase(content);
      if (success) {
        setImportError(null);
        alert("Database restored successfully. The application will now reload.");
        window.location.reload();
      } else {
        setImportError("Restore failed. Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm("FATAL ACTION: This will permanently delete all local data and reset the system. Continue?")) {
      db.resetDatabase();
    }
  };

  return (
    <div className={`max-w-[1600px] mx-auto ${isCompact ? 'space-y-4' : 'space-y-8'}`}>
      {/* Header Info */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-[2rem] p-6 flex items-start gap-4">
         <ShieldCheck className="text-amber-600 shrink-0" size={24} />
         <div>
            <h3 className="text-sm font-black text-amber-900 dark:text-amber-400 uppercase tracking-widest">Disaster Recovery Protocol</h3>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-500 mt-1 leading-relaxed">
               All data is stored in your browser's local cache. Please download regular backups to prevent data loss in case of cache clearance or computer failure.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Management Controls */}
        <div className="space-y-6">
           <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 ${isCompact ? 'p-6' : 'p-8'}`}>
              <div className="flex items-center gap-3 mb-8">
                 <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-slate-900 dark:text-white">
                    <Database size={20} />
                 </div>
                 <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Backup Engine</h4>
              </div>

              <div className="space-y-4">
                 <button 
                   onClick={handleBackup}
                   className="w-full flex items-center justify-between p-5 bg-slate-900 dark:bg-emerald-600 hover:opacity-90 text-white rounded-[1.5rem] transition-all group shadow-xl"
                 >
                    <div className="text-left">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Generate Snapshot</p>
                       <p className="text-sm font-black mt-0.5">Download Backup</p>
                    </div>
                    <Download className="group-hover:translate-y-0.5 transition-transform" />
                 </button>

                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-900 dark:text-white rounded-[1.5rem] transition-all group"
                 >
                    <div className="text-left">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Restore System</p>
                       <p className="text-sm font-black mt-0.5">Upload .json file</p>
                    </div>
                    <Upload className="text-slate-400 group-hover:-translate-y-0.5 transition-transform" />
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />

                 {importError && (
                   <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest text-center mt-2 animate-pulse">{importError}</p>
                 )}
              </div>
           </div>

           <div className={`bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/30 ${isCompact ? 'p-6' : 'p-8'}`}>
              <div className="flex items-center gap-3 mb-6 text-rose-800 dark:text-rose-400">
                 <AlertTriangle size={20} />
                 <h4 className="text-sm font-black uppercase tracking-widest">Zone of High Risk</h4>
              </div>
              <button 
                onClick={handleReset}
                className="w-full py-4 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-900/10"
              >
                 <Trash2 size={16} /> Factory Data Reset
              </button>
              <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest text-center mt-4 italic">
                 Requires Administrative Authorization
              </p>
           </div>
        </div>

        {/* Audit Trail */}
        <div className="lg:col-span-2 flex flex-col h-full">
           <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 flex-1 flex flex-col overflow-hidden`}>
              <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 ${isCompact ? 'px-6 py-5' : 'px-8 py-7'}`}>
                 <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2.5 rounded-xl text-indigo-600">
                       <History size={20} />
                    </div>
                    <div>
                       <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Unified Audit Trail</h4>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Immutable Change Log</p>
                    </div>
                 </div>
                 
                 <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Filter by Module/Admin..." 
                      className={`w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-indigo-500`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>

              <div className="overflow-y-auto flex-1 scrollbar-hide">
                 <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                       <tr className="bg-slate-50 dark:bg-slate-800/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-8 py-4">Event Timeline</th>
                          <th className="px-6 py-4">Module Integration</th>
                          <th className="px-6 py-4">Operator</th>
                          <th className="px-6 py-4">Description of Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                       {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                   <Clock size={14} className="text-slate-300" />
                                   <div className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                      {new Date(log.edited_at).toLocaleDateString()}
                                      <span className="text-[10px] ml-1.5 opacity-50">{new Date(log.edited_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-5">
                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                                  log.module === 'Database' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                  log.module === 'Voucher' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                   {log.module}
                                </span>
                             </td>
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                   <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                      <User size={12} />
                                   </div>
                                   <span className="text-xs font-black text-slate-800 dark:text-slate-200">{log.edited_by}</span>
                                </div>
                             </td>
                             <td className="px-6 py-5">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{log.remarks}</p>
                                {log.record_id !== 'system' && (
                                   <p className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 mt-1 uppercase opacity-0 group-hover:opacity-100 transition-opacity">ID: {log.record_id}</p>
                                )}
                             </td>
                          </tr>
                       ))}
                       {auditLogs.length === 0 && (
                          <tr>
                             <td colSpan={4} className="py-24 text-center">
                                <div className="flex flex-col items-center opacity-10">
                                   <Activity size={48} />
                                   <p className="text-sm font-black uppercase mt-4">Safe State: No Logs Found</p>
                                </div>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
