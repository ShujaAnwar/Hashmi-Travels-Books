
import React from 'react';
import { db } from '../store';
import { Printer, ArrowLeft, Download, Bus, MapPin, Calendar, User, Hash } from 'lucide-react';

const PrintTransportVoucher: React.FC<{ id: string, onBack: () => void }> = ({ id, onBack }) => {
  const v = db.getTransportVouchers().find(x => x.id === id);
  if (!v) return <div className="p-8">Transport record not found.</div>;

  const customer = db.getCustomer(v.customer_id);

  return (
    <div className="min-h-screen bg-slate-100 p-8 no-print flex flex-col items-center">
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 font-bold hover:text-slate-900">
          <ArrowLeft size={20} /> Back to List
        </button>
        <div className="flex gap-4">
          <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
            <Download size={18} /> PDF Export
          </button>
          <button onClick={() => window.print()} className="bg-emerald-600 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
            <Printer size={18} /> Print Voucher
          </button>
        </div>
      </div>

      <div className="bg-white w-full max-w-5xl p-16 print:p-0 shadow-2xl print:shadow-none min-h-[10in] flex flex-col font-sans border-t-[12px] border-emerald-600">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-16">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-emerald-200">NT</div>
             <div>
               <h1 className="text-3xl font-black text-slate-900 uppercase leading-none">NEEM TREE</h1>
               <p className="text-xs font-bold text-slate-400 tracking-[0.4em] mt-1">TRAVEL SERVICES</p>
             </div>
          </div>
          <div className="text-right">
             <h2 className="text-3xl font-black text-slate-900/10 uppercase mb-2">Transport Voucher</h2>
             <div className="space-y-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <p>Office 402, Shah Faisal Malir, Karachi</p>
                <p>Contact: +92 334 3666777</p>
                <p>Website: neemtreetravels.com</p>
             </div>
          </div>
        </div>

        {/* Voucher Metadata */}
        <div className="grid grid-cols-2 gap-12 mb-12">
           <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Provided To</h4>
              <p className="text-xl font-bold text-slate-900 uppercase underline decoration-2 decoration-emerald-500 underline-offset-8">{customer?.name}</p>
              <div className="mt-6 space-y-1 text-xs text-slate-500 font-medium">
                 <p>{customer?.address || 'N/A'}</p>
                 <p>Ph: {customer?.phone}</p>
              </div>
           </div>
           <div className="flex flex-col items-end justify-center px-8">
              <div className="space-y-4 w-full">
                 <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Voucher Number</span>
                    <span className="text-base font-black text-emerald-600">{v.voucher_no}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Voucher Date</span>
                    <span className="text-sm font-bold text-slate-900">{v.date}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transport Type</span>
                    <span className="text-sm font-bold text-slate-900 uppercase">{v.transport_type}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Detailed Service Table */}
        <div className="mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
                <th className="px-6 py-4">Route & Trip Description</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4 text-right">Rate (Rs.)</th>
                <th className="px-6 py-4 text-right">Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-6 py-8">
                  <div className="flex items-start gap-3">
                     <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mt-1">
                        <MapPin size={16} />
                     </div>
                     <div>
                        <p className="font-bold text-slate-900 text-base uppercase leading-tight">{v.route}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Trip Date: {v.trip_date}</p>
                     </div>
                  </div>
                </td>
                <td className="px-6 py-8 align-top">
                  <div className="space-y-2 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-2"><Hash size={12} /> <span className="font-bold">Vehicle:</span> {v.vehicle_no || 'N/A'}</div>
                    <div className="flex items-center gap-2"><User size={12} /> <span className="font-bold">Driver:</span> {v.driver_name || 'N/A'}</div>
                  </div>
                </td>
                <td className="px-6 py-8 text-center align-top">
                  <p className="text-sm font-bold text-slate-900">{v.quantity}</p>
                </td>
                <td className="px-6 py-8 text-right align-top">
                  <p className="text-sm font-bold text-slate-900">{v.rate.toLocaleString()}</p>
                </td>
                <td className="px-6 py-8 text-right align-top">
                  <p className="text-lg font-black text-slate-900">Rs. {v.total_amount.toLocaleString()}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Summary */}
        <div className="flex justify-end mb-16">
           <div className="w-80 bg-slate-900 text-white rounded-3xl p-8 space-y-4 shadow-xl">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <span>Subtotal</span>
                 <span>Rs. {v.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <span>Tax & Charges</span>
                 <span>Rs. 0</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                 <span className="text-sm font-black uppercase tracking-widest">Total Payable</span>
                 <span className="text-2xl font-black text-emerald-400">Rs. {v.total_amount.toLocaleString()}</span>
              </div>
           </div>
        </div>

        {/* Remarks Section */}
        <div className="mb-12">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Terms & Narration</h4>
           <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-[11px] text-slate-600 leading-relaxed font-medium">
             {v.narration || "Standard transport service provided. Rate includes fuel and driver allowance unless specified otherwise. No cancellation allowed within 24 hours of trip. Rates quoted in PKR."}
           </div>
        </div>

        {/* Signature Area */}
        <div className="mt-auto grid grid-cols-2 gap-32 px-12 pb-12">
           <div className="text-center">
              <div className="h-[1px] bg-slate-200 w-full mb-4"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Signature</p>
           </div>
           <div className="text-center">
              <div className="h-[1px] bg-slate-200 w-full mb-4"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized By</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PrintTransportVoucher;
