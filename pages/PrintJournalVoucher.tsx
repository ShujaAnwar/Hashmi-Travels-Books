
import React from 'react';
import { db } from '../store';
import { Printer, ArrowLeft, Download, FileText } from 'lucide-react';
import { amountToWords, formatDateTime } from '../utils/format';

const PrintJournalVoucher: React.FC<{ id: string, onBack: () => void }> = ({ id, onBack }) => {
  const v = db.getVouchers().find(x => x.id === id);
  if (!v) return <div className="p-8">Voucher not found.</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-8 no-print flex flex-col items-center">
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 font-bold hover:text-slate-900">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
            <Printer size={18} /> Print Voucher / PDF
          </button>
        </div>
      </div>

      <div className="bg-white w-full max-w-5xl p-16 print:p-0 shadow-2xl print:shadow-none min-h-[11in] flex flex-col font-sans border-t-[12px] border-slate-900">
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl">NT</div>
             <div>
               <h1 className="text-3xl font-black text-slate-900 uppercase leading-none">NEEM TREE</h1>
               <p className="text-xs font-bold text-slate-400 tracking-[0.4em] mt-1">TRAVEL SERVICES</p>
             </div>
          </div>
          <div className="text-right">
             <h2 className="text-2xl font-black text-slate-900 uppercase mb-2">{v.type} Voucher</h2>
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest space-y-1">
                <p>Voucher #: <span className="text-slate-900">{v.voucher_no}</span></p>
                <p>Date: <span className="text-slate-900">{v.date}</span></p>
             </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100 italic text-slate-600 font-medium">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Narration</span>
          "{v.description}"
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
              <th className="px-6 py-4">Account Title</th>
              <th className="px-6 py-4 text-right">Debit (Rs.)</th>
              <th className="px-6 py-4 text-right">Credit (Rs.)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 border-b border-slate-200">
            {v.entries.map((entry) => {
              const account = db.getAccount(entry.account_id);
              return (
                <tr key={entry.id} className="text-sm font-medium text-slate-700">
                  <td className="px-6 py-4">{account?.title}</td>
                  <td className="px-6 py-4 text-right">{entry.debit > 0 ? entry.debit.toLocaleString() : '-'}</td>
                  <td className="px-6 py-4 text-right">{entry.credit > 0 ? entry.credit.toLocaleString() : '-'}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-black text-slate-900 bg-slate-50">
               <td className="px-6 py-4 text-[10px] uppercase tracking-widest">Grand Totals</td>
               <td className="px-6 py-4 text-right">Rs. {v.total_amount.toLocaleString()}</td>
               <td className="px-6 py-4 text-right">Rs. {v.total_amount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-12">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount in Words</h4>
          <p className="text-lg font-bold text-slate-800 underline underline-offset-8 decoration-slate-200 italic text-wrap">
            {amountToWords(v.total_amount).replace('Dollars', 'PKR')}
          </p>
        </div>

        <div className="mt-auto pt-24 grid grid-cols-3 gap-12 text-center">
           <div className="space-y-2">
              <div className="h-[1px] bg-slate-300 w-full"></div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prepared By</p>
           </div>
           <div className="space-y-2">
              <div className="h-[1px] bg-slate-300 w-full"></div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Checked By</p>
           </div>
           <div className="space-y-2">
              <div className="h-[1px] bg-slate-300 w-full"></div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Approved By</p>
           </div>
        </div>

        <div className="mt-12 text-center text-[8px] font-bold text-slate-300 uppercase tracking-[0.5em] border-t border-slate-50 pt-6">
           TravelLedger Pro System Generated • {formatDateTime()}
        </div>
      </div>
    </div>
  );
};

export default PrintJournalVoucher;
