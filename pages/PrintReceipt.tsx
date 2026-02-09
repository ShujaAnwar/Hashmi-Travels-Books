
import React from 'react';
import { db } from '../store';
import { Printer, ArrowLeft, Download } from 'lucide-react';

const PrintReceipt: React.FC<{ id: string, onBack: () => void }> = ({ id, onBack }) => {
  const r = db.getReceipts().find(x => x.id === id);
  if (!r) return <div className="p-8">Receipt not found.</div>;

  const account = db.getAccount(r.account_id);
  let fromName = 'Miscellaneous';
  let address = 'N/A';
  if (r.type === 'Customer') {
    const c = db.getCustomer(r.customer_id!);
    fromName = c?.name || 'Unknown';
    address = c?.address || 'N/A';
  } else if (r.type === 'Vendor') {
    const v = db.getVendor(r.vendor_id!);
    fromName = v?.name || 'Unknown';
    address = v?.address || 'N/A';
  }

  // Helper for amount in words
  const amountToWords = (amount: number) => {
    return `Rupees ${amount.toLocaleString()} PKR only.`;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 no-print flex flex-col items-center">
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 font-bold hover:text-slate-900">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex gap-4">
          <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
            <Download size={18} /> PDF Export
          </button>
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
            <Printer size={18} /> Print Receipt
          </button>
        </div>
      </div>

      <div className="bg-white w-full max-w-5xl p-16 print:p-0 shadow-2xl print:shadow-none min-h-[7in] flex flex-col font-sans">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-200">NT</div>
             <div>
               <h1 className="text-3xl font-black text-slate-900 uppercase leading-none">NEEM TREE</h1>
               <p className="text-xs font-bold text-slate-400 tracking-[0.4em] mt-1">TRAVEL SERVICES</p>
             </div>
          </div>
          <div className="text-right">
             <h2 className="text-3xl font-black text-slate-900/10 uppercase mb-2">Receipt Voucher</h2>
             <div className="space-y-1 text-xs font-bold text-slate-500 uppercase">
                <p>Shah Faisal Town Malir Halt Karachi</p>
                <p>Phone: +92 21 3456789</p>
                <p>Email: accounts@neemtree.com</p>
             </div>
          </div>
        </div>

        {/* Voucher Info Box */}
        <div className="grid grid-cols-2 gap-12 mb-12">
           <div className="border-l-4 border-blue-600 pl-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Received From</h4>
              <p className="text-xl font-bold text-slate-900 uppercase underline decoration-blue-200 underline-offset-4">{fromName}</p>
              <p className="text-sm text-slate-500 mt-1">{address}</p>
           </div>
           <div className="flex flex-col items-end">
              <div className="bg-slate-50 p-6 rounded-2xl w-full max-w-xs space-y-4">
                 <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Receipt No</span>
                    <span className="text-sm font-bold text-slate-900">{r.receipt_no}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Date</span>
                    <span className="text-sm font-bold text-slate-900">{r.date}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Amount Box */}
        <div className="bg-slate-900 text-white rounded-3xl p-10 mb-12 flex justify-between items-center relative overflow-hidden">
           <div className="absolute right-0 top-0 h-full w-1/3 bg-blue-600/10 skew-x-12"></div>
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Amount Received (PKR)</p>
              <h3 className="text-4xl font-black">Rs. {r.amount.toLocaleString()}</h3>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Payment Mode</p>
              <h4 className="text-xl font-bold">{account?.title}</h4>
           </div>
        </div>

        {/* Body Text */}
        <div className="space-y-8 flex-1">
           <div className="border-b border-slate-100 pb-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Amount in words</h4>
              <p className="text-lg font-bold text-slate-800 italic underline decoration-slate-200 underline-offset-8">
                {amountToWords(r.amount)}
              </p>
           </div>
           
           <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Description / Remarks</h4>
              <p className="text-slate-600 leading-relaxed font-medium">
                {r.narration || 'No specific description provided.'}
              </p>
           </div>
        </div>

        {/* Footer Signatures */}
        <div className="mt-24 grid grid-cols-2 gap-24">
           <div className="text-center">
              <div className="h-[1px] bg-slate-300 w-full mb-3"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Received By</p>
           </div>
           <div className="text-center">
              <div className="h-[1px] bg-slate-300 w-full mb-3"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Authorized Signature</p>
           </div>
        </div>

        <div className="mt-16 text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em] border-t border-slate-50 pt-8">
           This is a computer generated document and does not require a physical stamp.
        </div>
      </div>
    </div>
  );
};

export default PrintReceipt;
