
import React from 'react';
import { db } from '../store';
import { Printer, ArrowLeft } from 'lucide-react';
import { amountToWords } from '../utils/format';

const PrintHotelInvoicePKR: React.FC<{ id: string, onBack: () => void }> = ({ id, onBack }) => {
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
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 font-bold hover:text-slate-900"><ArrowLeft size={18} /> Back</button>
        <button onClick={() => window.print()} className="bg-sky-700 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105"><Printer size={18} /> Print Invoice</button>
      </div>

      <div className="bg-white w-full max-w-6xl p-12 print:p-0 font-sans text-slate-800 shadow-xl border border-slate-200 print:shadow-none print:border-none min-h-[11in]">
        <div className="flex justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white font-black">LOGO</div>
              <div>
                <h1 className="text-2xl font-black">NEEM TREE</h1>
                <p className="text-[10px] tracking-widest font-bold text-slate-400">TRAVEL SERVICES</p>
              </div>
           </div>
           <div className="text-center">
              <h2 className="text-xl font-bold text-rose-600">Neem Tree Travels Services</h2>
           </div>
           <div className="border border-slate-900 p-4 text-center min-w-[200px] rounded-lg">
              <p className="text-[10px] font-black uppercase border-b border-slate-900 pb-2 mb-2 tracking-widest">PKR Invoice : {v.id}</p>
              <p className="text-lg font-black">PKR {v.sale_price_pkr.toLocaleString()}</p>
           </div>
        </div>

        <div className="text-[11px] mb-8 space-y-1 font-medium">
          <p>Shah Faisal Town Malir Halt Karachi</p>
          <p><span className="font-bold">CELL :</span> 0334 3666777 - <span className="font-bold">PHONE :</span> 021000000 - <span className="font-bold">EMAIL :</span> neemtreetravel@gmail.com</p>
          <p><span className="font-bold">Status:</span> Definite PKR Invoice</p>
        </div>

        <table className="w-full border-collapse mb-8 rounded-lg overflow-hidden border border-slate-200">
          <thead className="bg-sky-700 text-white text-[11px]">
            <tr>
              <th className="border border-sky-800 p-2 text-center uppercase tracking-widest font-black">Account Name:</th>
              <th className="border border-sky-800 p-2 text-center uppercase tracking-widest font-black">Date</th>
              <th className="border border-sky-800 p-2 text-center uppercase tracking-widest font-black">Option Date</th>
              <th className="border border-sky-800 p-2 text-center uppercase tracking-widest font-black">Country</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-bold">
            <tr>
              <td className="border border-slate-200 p-3 text-center bg-slate-50 uppercase">{customer?.name}</td>
              <td className="border border-slate-200 p-3 text-center">{formatDate(v.date)}</td>
              <td className="border border-slate-200 p-3 text-center">{formatDate(v.option_date || '')}</td>
              <td className="border border-slate-200 p-3 text-center uppercase">{v.country || v.confirmation_no || ''}</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse border border-slate-200">
          <thead className="bg-sky-700 text-white text-[11px]">
            <tr>
              <th className="border border-sky-800 p-2 text-center uppercase tracking-widest font-black">Pax Name</th>
              <th className="border border-sky-800 p-2 text-center uppercase tracking-widest font-black">Hotel</th>
              <th className="border border-sky-800 p-2 text-center uppercase tracking-widest font-black">Room Basis</th>
              <th className="border border-sky-800 p-2 text-center uppercase tracking-widest font-black">Meal</th>
              <th className="border border-sky-800 p-2 text-center uppercase tracking-widest font-black">City</th>
              <th className="border border-sky-800 p-2 text-center uppercase tracking-widest font-black">Duration</th>
              <th className="border border-sky-800 p-2 text-center uppercase tracking-widest font-black">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-medium">
            <tr>
              <td className="border border-slate-200 p-3 text-center uppercase font-bold">{v.pax_name}</td>
              <td className="border border-slate-200 p-3 text-center uppercase">{v.hotel_name}</td>
              <td className="border border-slate-200 p-3 text-center uppercase">{v.room_type}</td>
              <td className="border border-slate-200 p-3 text-center uppercase">{v.meal}</td>
              <td className="border border-slate-200 p-3 text-center uppercase">{v.city || v.destination}</td>
              <td className="border border-slate-200 p-3 text-center">
                 {formatDate(v.check_in)}<br/>{formatDate(v.check_out)}<br/>
                 <span className="font-black text-[9px] text-sky-700">({v.nights} Nights / {v.rooms} Rooms)</span>
              </td>
              <td className="border border-slate-200 p-3 text-center font-black bg-slate-50 text-slate-900">{v.sale_price_pkr.toLocaleString()}</td>
            </tr>
            <tr className="font-black bg-slate-100">
              <td colSpan={6} className="border border-slate-200 p-3 text-right uppercase tracking-widest">Total Bill (PKR):</td>
              <td className="border border-slate-200 p-3 text-center text-sky-800">PKR {v.sale_price_pkr.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8 text-[11px] font-bold">
          <p className="uppercase tracking-wide">IN WORDS: {amountToWords(v.sale_price_pkr).replace('Dollars', 'Pakistani Rupees')}</p>
          <p className="mt-12 text-slate-400 font-medium">For and on behalf of</p>
          <p className="text-rose-600 font-black uppercase text-sm">Neem Tree Travels Services</p>
          <div className="mt-12 h-[1px] bg-slate-200 w-48"></div>
        </div>

        <div className="mt-12">
           <h3 className="text-xs font-black underline mb-4 uppercase tracking-widest text-slate-900">Acknowledgement & Terms</h3>
           <ol className="text-[9px] space-y-1.5 list-decimal ml-4 font-bold uppercase text-slate-500">
             <li>ANY INVOICE OBJECTIONS MUST BE SENT TO US WITHIN 3 DAYS OF RECEIPT.</li>
             <li>LATE PAYMENTS MAY INCUR SURCHARGES SUBJECT TO CURRENCY FLUCTUATIONS.</li>
             <li>ALL PAYMENTS SHOULD BE MADE AGAINST THE COMPANY ACCOUNTS ONLY.</li>
             <li>HOTEL VOUCHER WILL ONLY BE RELEASED UPON FULL PAYMENT CLEARANCE.</li>
           </ol>
        </div>

        <div className="mt-auto pt-20 flex justify-between items-end border-t border-slate-50 text-[8px] text-slate-300 font-bold uppercase tracking-[0.3em]">
          <p>Developed by TravelLedger Pro System</p>
          <p>Official Record Copy</p>
        </div>
      </div>
    </div>
  );
};

export default PrintHotelInvoicePKR;
