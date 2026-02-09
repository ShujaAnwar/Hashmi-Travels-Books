
import React from 'react';
import { db } from '../store';
import { Printer, ArrowLeft, Globe, TrendingUp } from 'lucide-react';
import { formatDateTime } from '../utils/format';

const PrintCustomerLedger: React.FC<{ id: string, onBack: () => void }> = ({ id, onBack }) => {
  const customer = db.getCustomer(id);
  if (!customer) return <div className="p-8">Customer not found.</div>;

  const ledger = db.getPartyLedger(id, 'Customer');

  return (
    <div className="min-h-screen bg-slate-100 p-8 no-print flex flex-col items-center">
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 font-bold hover:text-slate-900">
          <ArrowLeft size={20} /> Back
        </button>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
          <Printer size={18} /> Print Statement
        </button>
      </div>

      <div className="bg-white w-full max-w-6xl p-12 print:p-0 shadow-2xl print:shadow-none min-h-[11in] flex flex-col font-sans border-t-[16px] border-slate-900">
        <div className="flex justify-between items-start mb-16">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl">NT</div>
             <div>
               <h1 className="text-3xl font-black text-slate-900 uppercase leading-none">NEEM TREE</h1>
               <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] mt-1">TRAVEL SERVICES</p>
             </div>
          </div>
          <div className="text-right">
             <h2 className="text-2xl font-black text-slate-900 uppercase">Account Statement</h2>
             <p className="text-[10px] font-black text-blue-600 tracking-widest mt-1 uppercase">Functional PKR Ledger Report</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12 border-b border-slate-100 pb-12">
           <div>
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Client Entity Details</h4>
              <p className="text-2xl font-black text-slate-900 uppercase underline decoration-2 decoration-blue-500 underline-offset-8">{customer.name}</p>
              <div className="text-xs text-slate-500 font-bold mt-8 space-y-1.5">
                 <p><span className="text-slate-400 mr-2 uppercase text-[9px]">Account ID:</span> {customer.customer_code}</p>
                 <p><span className="text-slate-400 mr-2 uppercase text-[9px]">Contact:</span> {customer.phone}</p>
                 <p><span className="text-slate-400 mr-2 uppercase text-[9px]">Address:</span> {customer.address}</p>
              </div>
           </div>
           <div className="flex flex-col items-end justify-center">
              <div className="bg-slate-50 border border-slate-200 p-10 rounded-[2.5rem] w-full max-w-sm shadow-inner relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp size={100}/></div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 text-center">Net Functional Position</p>
                 <h3 className="text-4xl font-black text-slate-900 text-center">Rs. {Math.abs(ledger.closingBalance).toLocaleString()}</h3>
                 <p className={`text-[10px] font-black mt-3 uppercase tracking-widest text-center ${ledger.closingBalance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                   {ledger.closingBalance >= 0 ? 'Debit Receivable' : 'Credit Advance'}
                 </p>
              </div>
           </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-[9px] font-black tracking-widest">
              <th className="px-4 py-5">Post Date</th>
              <th className="px-4 py-5">Reference</th>
              <th className="px-4 py-5">Classification</th>
              <th className="px-4 py-5">Description</th>
              <th className="px-4 py-5 text-center">ROE</th>
              <th className="px-4 py-5 text-right">Debit (+)</th>
              <th className="px-4 py-5 text-right">Credit (-)</th>
              <th className="px-4 py-5 text-right bg-slate-800">Balance</th>
            </tr>
          </thead>
          <tbody className="text-[10px] divide-y divide-slate-100">
             {ledger.transactions.map((t: any, idx: number) => (
               <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                 <td className="px-4 py-5 font-bold whitespace-nowrap">{t.date}</td>
                 <td className="px-4 py-5 font-black text-blue-700">{t.voucher_no}</td>
                 <td className="px-4 py-5 font-black uppercase text-slate-400 tracking-tighter">{t.type}</td>
                 <td className="px-4 py-5 max-w-xs text-slate-600 font-medium">{t.description}</td>
                 <td className="px-4 py-5 text-center font-black text-emerald-600">{t.currency !== 'PKR' ? t.roe : ''}</td>
                 <td className="px-4 py-5 text-right font-black text-slate-900">{t.debit > 0 ? t.debit.toLocaleString() : ''}</td>
                 <td className="px-4 py-5 text-right font-black text-emerald-600">{t.credit > 0 ? t.credit.toLocaleString() : ''}</td>
                 <td className="px-4 py-5 text-right font-black text-slate-900 border-l border-slate-100">
                    {Math.abs(t.balance).toLocaleString()} <span className="text-[7px] text-slate-400 ml-1">{t.balance >= 0 ? 'DR' : 'CR'}</span>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>

        <div className="mt-12 flex justify-between items-start px-4">
           <div className="max-w-md">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Verification Certificate</h4>
              <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase">
                 I HEREBY CERTIFY THAT THE ABOVE STATEMENT IS TRUE AND ACCURATE AS PER OUR CURRENT LEDGER RECORDS. ANY DISCREPANCIES SHOULD BE REPORTED TO OUR FINANCE DEPARTMENT WITHIN 7 DAYS.
              </p>
           </div>
           <div className="w-64 space-y-4 bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                 <span className="text-[9px] font-black text-slate-500 uppercase">Closing Balance</span>
                 <span className="text-xl font-black">Rs. {ledger.closingBalance.toLocaleString()}</span>
              </div>
              <p className="text-center text-[7px] font-black text-blue-400 uppercase tracking-[0.3em]">Certified Functional PKR</p>
           </div>
        </div>

        <div className="mt-auto pt-24 grid grid-cols-2 gap-32 text-center pb-12">
           <div className="space-y-3">
              <div className="h-[1px] bg-slate-300 w-full"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Auditor</p>
           </div>
           <div className="space-y-3">
              <div className="h-[1px] bg-slate-300 w-full"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Executive</p>
           </div>
        </div>

        <div className="text-center text-[8px] font-bold text-slate-300 uppercase tracking-[0.5em] border-t border-slate-50 pt-8 mb-12">
          TravelLedger Pro System Generated • Statement Created on {formatDateTime()}
        </div>
      </div>
    </div>
  );
};

export default PrintCustomerLedger;
