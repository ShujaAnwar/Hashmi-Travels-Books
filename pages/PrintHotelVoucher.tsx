
import React from 'react';
import { db } from '../store';
import { Printer, ArrowLeft } from 'lucide-react';

interface PrintHotelVoucherProps {
  id: string;
  onBack: () => void;
}

const PrintHotelVoucher: React.FC<PrintHotelVoucherProps> = ({ id, onBack }) => {
  const voucher = db.getHotelVouchers().find(v => v.id === id);

  if (!voucher) {
    return <div className="p-8 text-center text-slate-500">Voucher not found.</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 no-print flex flex-col items-center">
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold"
        >
          <ArrowLeft size={20} /> Back to List
        </button>
        <button 
          onClick={handlePrint}
          className="bg-sky-700 hover:bg-sky-800 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <Printer size={18} /> Print Voucher
        </button>
      </div>

      {/* Printable Area */}
      <div className="bg-white w-full max-w-5xl shadow-2xl p-12 print:shadow-none print:p-0 min-h-[11in] font-sans text-slate-800">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 leading-none">NEEM TREE</h1>
              <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mt-1">TRAVEL SERVICES</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-sky-800">Hotel Booking Voucher</h2>
            <p className="text-rose-600 font-bold mt-1">Neem Tree Travels Services</p>
            <div className="text-xs text-slate-500 mt-4 leading-relaxed font-medium">
              <p>Shah Faisal Town Malir Halt Karachi</p>
              <p>Cell: 0334 3666777</p>
              <p>Phone: 021000000</p>
            </div>
          </div>
        </div>

        {/* Voucher ID */}
        <div className="mb-10 flex justify-between items-end">
          <p className="text-sm font-bold text-slate-900">Voucher Reference: <span className="text-sky-700">{voucher.id}</span></p>
          <p className="text-xs font-bold text-slate-400">Issued On: {voucher.date}</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-12 gap-y-12 mb-12">
          {/* Hotel & Location */}
          <div className="col-span-8">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hotel Property</p>
                <p className="text-xl font-black text-slate-900 uppercase">{voucher.hotel_name}</p>
              </div>
              <div className="grid grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">City / Destination</p>
                  <p className="text-sm font-black text-slate-700 uppercase">{voucher.city || voucher.destination || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Country</p>
                  <p className="text-sm font-black text-slate-700 uppercase">{voucher.country || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Check-in */}
          <div className="col-span-4 pl-8 border-l border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check-In</p>
            <p className="text-lg font-black text-slate-900">{formatDate(voucher.check_in)}</p>
          </div>

          {/* Guest & Counts */}
          <div className="col-span-8 border-t border-slate-100 pt-8">
            <div className="grid grid-cols-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lead Guest</p>
                <p className="text-lg font-black text-slate-900 uppercase">{voucher.pax_name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rooms Count</p>
                <p className="text-lg font-black text-emerald-600">{voucher.rooms || 1} Rooms</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Nights</p>
                <p className="text-lg font-black text-slate-900">{voucher.nights} Nights</p>
              </div>
            </div>
          </div>

          {/* Check-out */}
          <div className="col-span-4 pl-8 pt-8 border-l border-slate-50 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check-Out</p>
            <p className="text-lg font-black text-slate-900">{formatDate(voucher.check_out)}</p>
          </div>
        </div>

        {/* Room Table */}
        <div className="mb-12 overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Rooms</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Configuration</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Meal Plan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Adults</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Children</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-4 text-xs font-black">{voucher.rooms || 1}</td>
                <td className="px-6 py-4 text-xs font-bold uppercase">{voucher.room_type || 'STANDARD'}</td>
                <td className="px-6 py-4 text-xs font-bold uppercase">{voucher.meal || 'NONE'}</td>
                <td className="px-6 py-4 text-xs font-bold">{voucher.adults}</td>
                <td className="px-6 py-4 text-xs font-bold">{voucher.children || '0'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Confirmation Info */}
        <div className="mb-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Confirmation Status</p>
              <p className="text-sm font-black text-emerald-600 uppercase tracking-tight">Definite Booking Confirmed</p>
           </div>
           {voucher.confirmation_no && (
             <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hotel Confirmation #</p>
                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{voucher.confirmation_no}</p>
             </div>
           )}
        </div>

        {/* Policies */}
        <div className="mt-8">
          <h4 className="text-xs font-black text-slate-900 uppercase mb-6 flex items-center gap-2">
            <span className="w-6 h-[2px] bg-sky-600"></span>
            Check-in/Check-out Timings & Policies
          </h4>
          <ul className="space-y-3 text-[11px] text-slate-600 leading-relaxed font-medium">
            <li className="flex gap-3">
              <span className="text-sky-500 font-bold">•</span>
              The usual check-in time is 2:00/4:00 PM hours however this might vary from hotel to hotel and with different destinations.
            </li>
            <li className="flex gap-3">
              <span className="text-sky-500 font-bold">•</span>
              Rooms may not be available for early check-in, unless especially required in advance. However, luggage may be deposited at the hotel reception and collected once the room is allotted.
            </li>
            <li className="flex gap-3">
              <span className="text-sky-500 font-bold">•</span>
              The usual checkout time is at 12:00 hours however this might vary from hotel to hotel and with different destinations. Any late checkout may involve additional charges.
            </li>
          </ul>
        </div>

        {/* Footer Note */}
        <div className="mt-auto pt-8 border-t border-slate-100 text-[10px] text-slate-400 font-medium italic">
          <p>Booking Notes: Please check your reservation details carefully and inform us immediately if you need any clarification. This is a computer generated document.</p>
        </div>
      </div>
    </div>
  );
};

export default PrintHotelVoucher;
