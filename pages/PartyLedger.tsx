import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Account, AccountType, Voucher, Currency, AppConfig, VoucherType } from '../types';
import { AccountingService } from '../services/AccountingService';
import { getAccounts, getVouchers, getConfig } from '../services/db';

interface LedgerProps {
  type: AccountType;
  onEditVoucher: (v: Voucher) => void;
  onViewVoucher?: (v: Voucher) => void;
}

const Ledger: React.FC<LedgerProps> = ({ type, onEditVoucher, onViewVoucher }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formMode, setFormMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [accountList, setAccountList] = useState<Account[]>([]);
  const [allAccountsForCode, setAllAccountsForCode] = useState<Account[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [viewCurrency, setViewCurrency] = useState<Currency>(Currency.PKR);
  const pdfRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<any>({
    name: '', cell: '', location: '', code: '', openingBalance: 0,
    balanceType: type === AccountType.CUSTOMER ? 'dr' : 'cr',
    currency: Currency.PKR
  });

  const refreshAccountList = useCallback(async () => {
    const data = await getAccounts();
    setAllAccountsForCode(data);
    const filtered = data.filter(a => a.type === type);
    setAccountList(filtered);

    setSelectedAccount(prev => {
      if (!prev) return null;
      return data.find(a => a.id === prev.id) || null;
    });
  }, [type]);

  useEffect(() => {
    getConfig().then(setConfig);
    getVouchers().then(setVouchers);
  }, []);

  useEffect(() => {
    setSelectedAccount(null);
    setSearchTerm('');
    refreshAccountList();
  }, [type, refreshAccountList]);

  const generateNextCode = useCallback((targetType: AccountType) => {
    const prefix = targetType === AccountType.CUSTOMER ? '11' : '21';
    const existing = allAccountsForCode.filter(a => a.code?.startsWith(prefix));
    if (existing.length === 0) return `${prefix}01`;
    const codes = existing.map(a => parseInt(a.code || '0')).filter(n => !isNaN(n));
    return (Math.max(...codes) + 1).toString();
  }, [allAccountsForCode]);

  const filteredAccounts = useMemo(() => {
    if (!searchTerm) return accountList;
    const lowSearch = searchTerm.toLowerCase();
    return accountList.filter(a =>
      a.name.toLowerCase().includes(lowSearch) ||
      a.code?.includes(searchTerm)
    );
  }, [accountList, searchTerm]);

  const listStats = useMemo(() => {
    const count = filteredAccounts.length;
    const totalBalance = filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    return { count, totalBalance };
  }, [filteredAccounts]);

  const currentROE = config?.defaultROE || 74.5;

  const getConvertedVal = (val: number, roe: number = currentROE) => {
    if (viewCurrency === Currency.PKR) return val;
    return val / (roe || 1);
  };

  const getNarrativeForLedger = (entry: any, voucher: Voucher | undefined) => {
    if (!voucher || !voucher.details) return entry.description || '-';

    if (voucher.type === VoucherType.HOTEL) {
      const pax = voucher.details.paxName || 'N/A';
      const hotel = voucher.details.hotelName || 'N/A';
      const ci = voucher.details.fromDate || '-';
      const co = voucher.details.toDate || '-';
      const rb = voucher.details.numRooms || '0';
      const ngt = voucher.details.numNights || '0';
      const loc = voucher.details.city || 'N/A';
      const countrySuffix = (loc.toLowerCase().includes('makkah') || loc.toLowerCase().includes('madinah') || loc.toLowerCase().includes('jeddah')) ? ' -KSA' : '';

      return `${pax.toUpperCase()} | ${hotel.toUpperCase()} |Checkin: ${ci} | Checkout: ${co} | R/B: ${rb} | Nights:${ngt} | ${loc.toUpperCase()}${countrySuffix}`;
    }

    return entry.description && entry.description !== '-' ? entry.description : (voucher.description || '-');
  };

  const ledgerWithRunningBalance = useMemo(() => {
    if (!selectedAccount) return [];
    const sortedLedger = [...selectedAccount.ledger].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    let running = 0;
    return sortedLedger.map(entry => {
      running += (entry.debit - entry.credit);
      return { ...entry, balanceAfter: running };
    });
  }, [selectedAccount]);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current || !selectedAccount) return;

    setIsExporting(true);

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const element = pdfRef.current;
      const fileName = `Ledger_${selectedAccount.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

      const opt = {
        margin: [10, 10, 10, 10],           // balanced margins
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 794,                 // A4 width in pixels at 96dpi
          windowHeight: 1123
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // ... (form submit and other logic remains the same)

  if (!config) return null;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {!selectedAccount ? (
        // List view remains mostly same (compact table)
        <>
          {/* ... list view code ... */}
        </>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSelectedAccount(null)} className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 hover:text-blue-600 transition-all">
                ←
              </button>
              <div>
                <h2 className="text-xl md:text-2xl font-black uppercase">{selectedAccount.name}</h2>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-xs text-blue-600">GL: {selectedAccount.code || 'N/A'}</p>
                  <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden text-xs font-bold">
                    <button
                      onClick={() => setViewCurrency(Currency.PKR)}
                      className={`px-3 py-1 ${viewCurrency === Currency.PKR ? 'bg-white dark:bg-slate-800 text-blue-600' : 'text-slate-500'}`}
                    >
                      PKR
                    </button>
                    <button
                      onClick={() => setViewCurrency(Currency.SAR)}
                      className={`px-3 py-1 ${viewCurrency === Currency.SAR ? 'bg-white dark:bg-slate-800 text-blue-600' : 'text-slate-500'}`}
                    >
                      SAR
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 disabled:opacity-50 transition-all"
            >
              {isExporting ? 'Generating...' : 'Export PDF'}
            </button>
          </div>

          {/* PDF Content Container - Centered and Compact */}
          <div ref={pdfRef} className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 md:p-8 mx-auto max-w-[794px] print:max-w-none print:shadow-none print:p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-black">{config.companyName || 'NEEM TREE'}</h1>
              <p className="text-sm text-slate-500 mt-2">
                CONTACT: {config.companyCell || '0313-2710182'} | EMAIL: {config.companyEmail || 'NEEMTREE@GMAIL.COM'}
              </p>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black uppercase">
                {type === AccountType.CUSTOMER ? 'CUSTOMER' : 'VENDOR'} LEDGER STATEMENT
              </h2>
              <p className="text-lg font-bold mt-3">
                Party: {selectedAccount.name} ({selectedAccount.code || 'N/A'})
              </p>
              <p className="text-sm text-slate-500 mt-1">
                GENERATED ON: {new Date().toLocaleString()}
              </p>
            </div>

            {/* Table - Compact & Responsive */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="p-3 text-left">DATE</th>
                    <th className="p-3 text-left">REF #</th>
                    <th className="p-3 text-center">TYPE</th>
                    <th className="p-3 text-left">NARRATION</th>
                    <th className="p-3 text-center">ROE</th>
                    <th className="p-3 text-right">DEBIT</th>
                    <th className="p-3 text-right">CREDIT</th>
                    <th className="p-3 text-right">BALANCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ledgerWithRunningBalance.map((entry, i) => {
                    const voucher = vouchers.find(v => v.id === entry.voucherId);
                    const displayVNum = voucher?.voucherNum || entry.voucherNum || '-';
                    const displayDescription = getNarrativeForLedger(entry, voucher);
                    const displayType = voucher?.type || '-';
                    const displayROE = voucher?.roe || '-';

                    return (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3">{entry.date === '-' ? '-' : new Date(entry.date).toLocaleDateString()}</td>
                        <td className="p-3">
                          {voucher ? (
                            <button onClick={() => onEditVoucher(voucher)} className="text-blue-600 hover:underline">
                              {displayVNum}
                            </button>
                          ) : displayVNum}
                        </td>
                        <td className="p-3 text-center">{displayType}</td>
                        <td className="p-3 whitespace-pre-wrap">{displayDescription}</td>
                        <td className="p-3 text-center">{displayROE}</td>
                        <td className="p-3 text-right text-emerald-600">
                          {entry.debit > 0 ? getConvertedVal(entry.debit).toLocaleString() : '-'}
                        </td>
                        <td className="p-3 text-right text-rose-600">
                          {entry.credit > 0 ? getConvertedVal(entry.credit).toLocaleString() : '-'}
                        </td>
                        <td className="p-3 text-right font-bold">
                          {Math.abs(getConvertedVal(entry.balanceAfter)).toLocaleString()}
                          <span className="ml-1 text-xs opacity-70">{entry.balanceAfter >= 0 ? 'DR' : 'CR'}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary - Compact & on same page */}
            <div className="mt-8 pt-6 border-t text-center">
              <h3 className="text-xl font-bold uppercase mb-4">FINANCIAL SUMMARY</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-slate-500">Total Transactions</p>
                  <p className="text-xl font-bold">{ledgerWithRunningBalance.length}</p>
                </div>
                <div>
                  <p className="text-slate-500">Total Debits</p>
                  <p className="text-xl font-bold text-emerald-600">
                    Rs. {getConvertedVal(ledgerWithRunningBalance.reduce((s, e) => s + e.debit, 0)).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Total Credits</p>
                  <p className="text-xl font-bold text-rose-600">
                    Rs. {getConvertedVal(ledgerWithRunningBalance.reduce((s, e) => s + e.credit, 0)).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t">
                <p className="text-lg text-slate-500 uppercase">NET BALANCE</p>
                <p className="text-3xl font-black mt-2">
                  Rs. {Math.abs(getConvertedVal(selectedAccount.balance)).toLocaleString()}
                  <span className="ml-2 text-xl opacity-70">{selectedAccount.balance >= 0 ? 'DR' : 'CR'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal remains the same */}
      {showAddModal && ( /* ... modal code ... */ )}
    </div>
  );
};

export default Ledger;
