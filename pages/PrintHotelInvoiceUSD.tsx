
import React from 'react';
import { db } from '../store';
import { Printer, ArrowLeft } from 'lucide-react';

const PrintHotelInvoiceUSD: React.FC<{ id: string, onBack: () => void }> = ({ id, onBack }) => {
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
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 font-bold"><ArrowLeft size={18} /> Back</button>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg"><Printer size={18} /> Print USD Invoice</button>
      </div>

      <div className="bg-white w-full max-w-6xl p-12 print:p-0 font-sans text-slate-800 shadow-2xl min-h-[11in] print:shadow-none relative">
        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-10 mb-10">
           <div className="flex items-center gap-4">
              <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl">NT</div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Neem Tree</h1>
                <p className="text-xs font-bold text-slate-400 tracking-[0.4em] uppercase">Travel Services</p>
              </div>
           </div>
           <div className="text-right">
              <h2 className="text-4xl font-black text-slate-900 opacity-10 absolute right-12 top-12">INVOICE</h2>
              <p className="text-sm font-bold text-slate-500">Invoice Number: <span className="text-slate-900">#USD-{v.id}</span></p>
              <p className="text-sm font-bold text-slate-500">Invoice Date: <span className="text-slate-900">{formatDate(v.date)}</span></p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Bill To</h4>
            <p className="text-xl font-bold text-slate-900">{customer?.name}</p>
            <p className="text-sm text-slate-500 mt-1">{customer?.address || 'N/A'}</p>
            <p className="text-sm text-slate-500">{customer?.phone}</p>
          </div>
          <div className="text-right">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">City</h4>
            <p className="text-lg font-bold text-slate-900 uppercase">{v.city || v.destination}</p>
            <p className="text-sm text-slate-500 mt-1">Lead Guest: <span className="font-bold uppercase text-slate-800">{v.pax_name}</span></p>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
              <th className="px-6 py-4">Hotel & Service Description</th>
              <th className="px-6 py-4 text-center">Unit(s)</th>
              <th className="px-6 py-4 text-right">Price (USD)</th>
              <th className="px-6 py-4 text-right">Total (USD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-6 py-8">
                <p className="font-bold text-slate-900 text-base uppercase mb-1">{v.hotel_name}</p>
                <div className="text-xs text-slate-500 space-y-1">
                  <p><span className="font-bold uppercase">Room:</span> {v.room_type} | <span className="font-bold uppercase">Meal:</span> {v.meal}</p>
                  <p><span className="font-bold uppercase">Checkin:</span> {formatDate(v.check_in)} <span className="mx-2">→</span> <span className="font-bold uppercase">Checkout:</span> {formatDate(v.check_out)}</p>
                  <p><span className="font-bold uppercase">Pax:</span> {v.adults} Adults, {v.children} Children</p>
                </div>
              </td>
              <td className="px-6 py-8 text-center align-top">
                <p className="text-sm font-bold">{v.rooms} Rooms x {v.nights} Nights</p>
              </td>
              <td className="px-6 py-8 text-right align-top">
                <p className="text-sm font-bold">${v.sale_rate_usd?.toLocaleString()}</p>
              </td>
              <td className="px-6 py-8 text-right align-top">
                <p className="text-base font-black text-slate-900">${v.sale_total_usd?.toLocaleString()}</p>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-12 flex justify-end">
           <div className="w-64 space-y-3 bg-slate-50 p-6 rounded-2xl">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Subtotal</span>
                <span>${v.sale_total_usd?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Tax (0%)</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="text-sm font-black text-slate-900 uppercase">Grand Total</span>
                <span className="text-xl font-black text-slate-900">${v.sale_total_usd?.toLocaleString()}</span>
              </div>
           </div>
        </div>

        <div className="mt-24 grid grid-cols-2 gap-12">
           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Instructions</h4>
              <div className="text-[10px] text-slate-500 leading-relaxed space-y-1 font-bold">
                 <p>ACCOUNT NAME: NEEM TREE TRAVEL SERVICES</p>
                 <p>BANK: STANDARD CHARTERED BANK</p>
                 <p>IBAN: PK63SCBL0000000123456789</p>
                 <p>SWIFT CODE: SCBLPKKA</p>
              </div>
           </div>
           <div className="text-right flex flex-col items-end justify-end">
              <div className="w-32 h-[1px] bg-slate-900 mb-2"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Authorized Signature</p>
           </div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-8">
           Neem Tree Travel Services • Karachi, Pakistan • +92 334 3666777 • travelledger.pro
        </div>
      </div>
    </div>
  );
};

export default PrintHotelInvoiceUSD;
