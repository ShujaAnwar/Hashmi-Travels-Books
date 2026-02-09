
import React from 'react';
import { db } from '../store';
import { Printer, ArrowLeft } from 'lucide-react';
import { formatDateTime } from '../utils/format';

const PrintVendorLedger: React.FC<{ id: string, onBack: () => void }> = ({ id, onBack }) => {
  const vendor = db.getVendor(id);
  if (!vendor) return <div className="p-8">Vendor not found.</div>;

  const ledger = db.getPartyLedger(id, 'Vendor');

  return (
    <div className="min-h-screen bg-slate-100 p-8 no-print flex flex-col items-center">
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 font-bold hover:text-slate-900">
          <ArrowLeft size={20} /> Back
        </button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
          <Printer size={18} /> Print Statement
        </button>
      </div>

      <div className="bg-white w-full max-w-6xl p-12 print:p-0 shadow-2xl print:shadow-none min-h-[11in] flex flex-col font-sans border-t-[12px] border-emerald-600">
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">NT</div>
             <div>
               <h1 className="text-3xl font-black text-slate-900 uppercase leading-none">NEEM TREE</h1>
               <p className="text-xs font-bold text-slate-400 tracking-[0.4em] mt-1">TRAVEL SERVICES</p>
             </div>
          </div>
          <div className="text-right">
             <h2 className="text-2xl font-black text-slate-900 uppercase">Vendor Statement</h2>
             <p className="text-xs font-bold text-emerald-600 tracking-widest mt-1 uppercase">Supplier PKR Payable Report</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12 border-b border-slate-100 pb-12">
           <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Supplier Information</h4>
              <p className="text-2xl font-black text-slate-900 uppercase">{vendor.name}</p>
              <div className="text-xs text-slate-500 font-bold mt-2 space-y-1">
                 <p>CONTACT: {vendor.phone}</p>
                 <p>ADDRESS: {vendor.address}</p>
              </div>
           </div>
           <div className="flex flex-col items-end justify-center">
              <div className="bg-slate-900 text-white p-8 rounded-3xl w-full max-w-xs shadow-xl">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Net PKR Payable</p>
                 <h3 className="text-4xl font-black text-emerald-400 text-center">Rs. {Math.abs(ledger.closingBalance).toLocaleString()}</h3>
                 <p className="text-[10px] font-bold text-emerald-300 mt-2 uppercase tracking-widest text-center">
                   {ledger.closingBalance >= 0 ? 'Credit Payable' : 'Debit Advance'}
                 </p>
              </div>
           </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-[9px] font-black tracking-widest">
              <th className="px-4 py-4">Date</th>
              <th className="px-4 py-4">Voucher #</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-4 py-4">Description</th>
              <th className="px-4 py-4 text-right">Debit (-)</th>
              <th className="px-4 py-4 text-right">Credit (+)</th>
              <th className="px-4 py-4 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="text-[11px] divide-y divide-slate-100">
             {ledger.transactions.map((t: any, idx: number) => (
               <tr key={idx}>
                 <td className="px-4 py-4 font-bold whitespace-nowrap">{t.date}</td>
                 <td className="px-4 py-4 font-black text-emerald-600">{t.voucher_no}</td>
                 <td className="px-4 py-4 font-bold uppercase tracking-tight">{t.type}</td>
                 <td className="px-4 py-4 max-w-xs">{t.description}</td>
                 <td className="px-4 py-4 text-right font-bold text-blue-600">{t.debit > 0 ? t.debit.toLocaleString() : ''}</td>
                 <td className="px-4 py-4 text-right font-bold text-slate-800">{t.credit > 0 ? t.credit.toLocaleString() : ''}</td>
                 <td className="px-4 py-4 text-right font-black text-slate-900 bg-slate-50/30">Rs. {t.balance.toLocaleString()}</td>
               </tr>
             ))}
          </tbody>
        </table>

        <div className="mt-12 flex justify-end">
           <div className="w-64 space-y-3 bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-emerald-700 uppercase">Closing Balance</span>
                 <span className="text-xl font-black text-slate-900">Rs. {ledger.closingBalance.toLocaleString()}</span>
              </div>
           </div>
        </div>

        <div className="mt-auto pt-24 text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-6">
            TravelLedger Pro System Generated • Printed on {formatDateTime()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintVendorLedger;
