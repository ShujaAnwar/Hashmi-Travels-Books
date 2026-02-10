
import React from 'react';
import { db } from '../store';
import { Printer, ArrowLeft } from 'lucide-react';

const PrintHotelVoucherSAR: React.FC<{ id: string, onBack: () => void }> = ({ id, onBack }) => {
  const v = db.getHotelVouchers().find(x => x.id === id);
  if (!v) return <div className="p-8">Record not found.</div>;

  const customer = db.getCustomer(v.customer_id);

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'Invalid Date') return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 no-print flex flex-col items-center">
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 font-bold hover:text-slate-900 transition-colors"><ArrowLeft size={18} /> Back</button>
        <button onClick={() => window.print()} className="bg-sky-700 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-sky-800 transition-all"><Printer size={18} /> Print SAR Voucher</button>
      </div>

      <div className="bg-white w-full max-w-6xl p-12 print:p-0 font-sans text-slate-800 shadow-xl border border-slate-200 print:shadow-none print:border-none min-h-[11in]">
        <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg text-white font-black text-xl">NT</div>
              <div className="text-center">
                 <h1 className="text-3xl font-black leading-none uppercase tracking-tight">NEEM TREE</h1>
                 <p className="text-xs tracking-[0.3em] font-bold text-slate-400 mt-1 uppercase">Travel Services</p>
              </div>
            </div>
            <p className="text-rose-600 font-black mt-4 uppercase tracking-widest text-sm">Official SAR Confirmation Voucher</p>
        </div>

        <div className="grid grid-cols-2 gap-y-4 text-[11px] mb-8 border-b border-slate-100 pb-8">
          <div className="flex gap-2">
            <span className="font-black text-slate-400 uppercase tracking-widest">Account:</span>
            <span className="font-bold text-slate-900 uppercase">{customer?.name}</span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-black text-slate-400 uppercase tracking-widest">HVI #:</span>
            <span className="font-bold text-blue-600">{v.id}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-black text-slate-400 uppercase tracking-widest">Subject:</span>
            <span className="font-bold text-slate-900">Definite SAR Booking</span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-black text-slate-400 uppercase tracking-widest">Date:</span>
            <span className="font-bold text-slate-900">{formatDate(v.date)}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-black text-slate-400 uppercase tracking-widest">Country:</span>
            <span className="font-bold text-slate-900 uppercase">{v.country || v.confirmation_no || 'Saudi Arabia'}</span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="font-black text-slate-400 uppercase tracking-widest">Contact:</span>
            <span className="font-bold text-slate-900">0334 3666777</span>
          </div>
        </div>

        <div className="flex justify-between text-[11px] mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex gap-2">
            <span className="font-black text-slate-400 uppercase tracking-widest">Lead Guest:</span>
            <span className="font-black uppercase underline decoration-rose-400 text-slate-900">{v.pax_name}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-black text-slate-400 uppercase tracking-widest">Option Date:</span>
            <span className="font-bold text-rose-600">{formatDate(v.option_date || '') || 'Firm Booking'}</span>
          </div>
        </div>

        <table className="w-full border-collapse mb-8 text-[11px]">
          <thead className="bg-sky-700 text-white font-black uppercase tracking-widest text-[9px]">
            <tr>
              <th className="border border-sky-800 p-3">Hotel</th>
              <th className="border border-sky-800 p-3">Basis</th>
              <th className="border border-sky-800 p-3">Meal</th>
              <th className="border border-sky-800 p-3">Checkin</th>
              <th className="border border-sky-800 p-3">Checkout</th>
              <th className="border border-sky-800 p-3">Rooms/Nights</th>
              <th className="border border-sky-800 p-3 text-right">SAR Rate</th>
              <th className="border border-sky-800 p-3 text-right">Total (SAR)</th>
            </tr>
          </thead>
          <tbody className="font-medium">
            <tr>
              <td className="border border-slate-200 p-3 text-center uppercase font-bold">{v.hotel_name}</td>
              <td className="border border-slate-200 p-3 text-center uppercase">{v.room_type}</td>
              <td className="border border-slate-200 p-3 text-center uppercase">{v.meal}</td>
              <td className="border border-slate-200 p-3 text-center font-bold">{formatDate(v.check_in)}</td>
              <td className="border border-slate-200 p-3 text-center font-bold">{formatDate(v.check_out)}</td>
              <td className="border border-slate-200 p-3 text-center font-black text-sky-700">{v.rooms}/{v.nights}</td>
              <td className="border border-slate-200 p-3 text-right font-bold">{v.sale_rate_sar?.toLocaleString()}</td>
              <td className="border border-slate-200 p-3 text-right font-black bg-slate-50 text-slate-900">{v.sale_total_sar?.toLocaleString()}</td>
            </tr>
            <tr className="font-black text-[12px] bg-slate-100">
               <td colSpan={7} className="border border-slate-200 p-4 text-right uppercase tracking-[0.2em]">Grand Total SAR:</td>
               <td className="border border-slate-200 p-4 text-right text-sky-800">SAR {v.sale_total_sar?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div className="mb-12">
           <h3 className="bg-sky-700 text-white text-center py-2 text-[10px] font-black uppercase tracking-[0.3em] mb-4 rounded-lg shadow-sm">Terms and Conditions</h3>
           <ul className="text-[10px] space-y-2 ml-4 list-disc font-bold text-slate-500 uppercase leading-relaxed">
             <li>All rates are NET and non-commissionable quoted in Saudi Riyal (SAR).</li>
             <li>Bookings are NON-REFUNDABLE and NON-AMENDABLE after re-confirmation.</li>
             <li>Standard check-in after 16:00 and check-out before 12:00.</li>
             <li>Triple or Quad occupancy typically utilizes extra rollaway beds.</li>
             <li>Hotel provides standard amenities as per local classification.</li>
           </ul>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-8">
           <p className="text-[10px] font-black text-slate-900 mb-4 uppercase tracking-widest">Company Bank Account Details</p>
           <table className="w-full border-collapse text-[9px] font-bold uppercase tracking-tighter">
             <thead className="bg-slate-900 text-white">
               <tr>
                 <th className="border border-slate-800 p-2 text-left">Bank Name</th>
                 <th className="border border-slate-800 p-2 text-left">Account Title</th>
                 <th className="border border-slate-800 p-2 text-left">IBAN / Account #</th>
               </tr>
             </thead>
             <tbody>
               <tr className="border border-slate-200">
                 <td className="p-2 border border-slate-200">Meezan Bank Ltd</td>
                 <td className="p-2 border border-slate-200">Neem Tree Travels Services</td>
                 <td className="p-2 border border-slate-200 text-blue-600 font-black">PK32MEZN001234567890</td>
               </tr>
             </tbody>
           </table>
           <p className="text-center mt-12 text-[8px] font-bold text-slate-300 uppercase tracking-[0.5em]">This document serves as an official confirmation of hotel services.</p>
        </div>
      </div>
    </div>
  );
};

export default PrintHotelVoucherSAR;
