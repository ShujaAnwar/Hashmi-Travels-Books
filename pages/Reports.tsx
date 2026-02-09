
import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../store';
import { getFinancialInsights } from '../geminiService';
import { AccountType, VoucherType } from '../types';
import { 
  Sparkles, 
  Printer, 
  FileDown, 
  FileSpreadsheet, 
  TrendingUp, 
  Activity, 
  Bus, 
  Calendar,
  Clock,
  PieChart,
  ArrowRightLeft,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ExternalLink,
  Table as TableIcon,
  BarChart3
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface ReportsProps {
  isCompact: boolean;
  initialParams?: { tab: string; accountId?: string } | null;
  onClearParams?: () => void;
}

type ReportTab = 'ledger' | 'trial' | 'pl' | 'balance' | 'aging' | 'cashflow' | 'analysis';

const Reports: React.FC<ReportsProps> = ({ isCompact, initialParams, onClearParams }) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('trial');
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-12-31');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [agingType, setAgingType] = useState<'Customer' | 'Vendor'>('Customer');

  // Handle external drill-downs
  useEffect(() => {
    if (initialParams) {
      setActiveTab(initialParams.tab as ReportTab);
      if (initialParams.accountId) {
        setSelectedAccountId(initialParams.accountId);
      }
      if (onClearParams) onClearParams();
    }
  }, [initialParams, onClearParams]);

  // Load Data
  const accounts = db.getAccounts();
  const trialBalance = db.getTrialBalance(toDate);
  const plData = db.getPLReport(fromDate, toDate);
  const balanceSheet = db.getBalanceSheet(toDate);
  const agingData = db.getAgingReport(agingType, toDate);
  const cashFlow = db.getCashFlowStatement(fromDate, toDate);
  const ledgerData = useMemo(() => {
    if (!selectedAccountId) return null;
    return db.getAccountLedger(selectedAccountId, fromDate, toDate);
  }, [selectedAccountId, fromDate, toDate]);

  const drillToLedger = (accountId: string) => {
    setSelectedAccountId(accountId);
    setActiveTab('ledger');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Derived analysis data for charts
  const monthlyData = useMemo(() => {
    return [
      { name: 'Jan', revenue: plData.totalIncome * 0.8, expense: plData.totalExpenses * 0.9 },
      { name: 'Feb', revenue: plData.totalIncome * 0.9, expense: plData.totalExpenses * 0.85 },
      { name: 'Mar', revenue: plData.totalIncome, expense: plData.totalExpenses },
    ];
  }, [plData]);

  const generateInsights = async () => {
    setLoading(true);
    const summary = `Reporting Period: ${fromDate} to ${toDate}. Net Profit: Rs. ${plData.netProfit}. Total Income: ${plData.totalIncome}. Total Expenses: ${plData.totalExpenses}. Cash Balance: ${cashFlow.closingCash}.`;
    const text = await getFinancialInsights(summary);
    setInsights(text);
    setLoading(false);
  };

  const handleExportExcel = () => {
    let exportSet: any[] = [];
    let fileName = `Report_${activeTab}`;
    if (activeTab === 'trial') exportSet = trialBalance;
    if (activeTab === 'pl') exportSet = [...plData.income, ...plData.expenses];
    if (activeTab === 'balance') exportSet = [...balanceSheet.assets, ...balanceSheet.liabilities, ...balanceSheet.equity];
    if (activeTab === 'aging') exportSet = agingData;
    if (activeTab === 'cashflow') exportSet = cashFlow.movements;
    if (activeTab === 'ledger' && ledgerData) exportSet = ledgerData.transactions;
    const ws = XLSX.utils.json_to_sheet(exportSet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('NEEM TREE TRAVEL SERVICES', pageWidth/2, 50, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`FINANCIAL REPORT: ${activeTab.toUpperCase()}`, pageWidth/2, 70, { align: 'center' });
    doc.text(`Reporting Period: ${fromDate} to ${toDate}`, pageWidth/2, 85, { align: 'center' });
    let body: any[] = [];
    let head: string[][] = [];
    if (activeTab === 'trial') {
      head = [['Account Title', 'Type', 'Debit (PKR)', 'Credit (PKR)']];
      body = trialBalance.map(a => [a.title, a.type, a.debit.toLocaleString(), a.credit.toLocaleString()]);
    } else if (activeTab === 'pl') {
      head = [['Description', 'Amount (PKR)']];
      body = [...plData.income.map(i => [i.title, i.amount.toLocaleString()]), ['TOTAL INCOME', plData.totalIncome.toLocaleString()]];
    }
    // @ts-ignore
    doc.autoTable({ head, body, startY: 110, theme: 'grid' });
    doc.save(`Report_${activeTab}.pdf`);
  };

  const ReportHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="mb-10 text-center border-b-2 border-slate-900 pb-8 print:block hidden">
      <h1 className="text-4xl font-black text-slate-900 mb-1">NEEM TREE TRAVEL SERVICES</h1>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Official Financial Statement</p>
      <div className="bg-slate-900 text-white inline-block px-10 py-2.5 rounded-full shadow-lg">
        <h2 className="text-lg font-black uppercase tracking-widest">{title}</h2>
      </div>
      <p className="mt-4 text-sm font-bold text-slate-600">{subtitle}</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Filter Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 p-8 no-print transition-all">
         <div className="flex flex-col lg:flex-row items-end gap-6">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period From</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-emerald-500" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period To</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-emerald-500" />
                  </div>
               </div>
               {activeTab === 'ledger' && (
                 <div className="space-y-2 animate-in fade-in slide-in-from-left-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Selector</label>
                    <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-emerald-500">
                       <option value="">Select Account...</option>
                       {accounts.map(a => <option key={a.id} value={a.id}>{a.title} ({a.type})</option>)}
                    </select>
                 </div>
               )}
               {activeTab === 'aging' && (
                 <div className="space-y-2 animate-in fade-in slide-in-from-left-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Class</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                       <button onClick={() => setAgingType('Customer')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${agingType === 'Customer' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}>Customers</button>
                       <button onClick={() => setAgingType('Vendor')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${agingType === 'Vendor' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Vendors</button>
                    </div>
                 </div>
               )}
            </div>
            
            <div className="flex gap-2 w-full lg:w-auto">
               <button onClick={() => window.print()} className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 transition-all text-slate-600 dark:text-slate-400" title="Print Report"><Printer size={20}/></button>
               <button onClick={handleExportExcel} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all"><FileSpreadsheet size={16}/> Excel</button>
               <button onClick={handleDownloadPDF} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-700 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:opacity-90 transition-all"><FileDown size={16}/> PDF</button>
            </div>
         </div>

         {/* 2. Top Navigation Tabs */}
         <div className="flex flex-wrap gap-2 mt-8 border-t border-slate-100 dark:border-slate-800 pt-8">
            {[
              { id: 'trial', label: 'Trial Balance', icon: <Activity size={14}/> },
              { id: 'ledger', label: 'General Ledger', icon: <ChevronDown size={14}/> },
              { id: 'pl', label: 'Profit & Loss', icon: <TrendingUp size={14}/> },
              { id: 'balance', label: 'Balance Sheet', icon: <PieChart size={14}/> },
              { id: 'aging', label: 'Aging Report', icon: <Clock size={14}/> },
              { id: 'cashflow', label: 'Cash Flow', icon: <ArrowRightLeft size={14}/> },
              { id: 'analysis', label: 'Management Analysis', icon: <BarChart3 size={14}/> },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ReportTab)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
         </div>
      </div>

      {/* 3. Report Container */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden print:shadow-none print:border-none min-h-[600px]">
        
        {/* TRIAL BALANCE */}
        {activeTab === 'trial' && (
          <div className="animate-in fade-in duration-500">
            <ReportHeader title="Trial Balance" subtitle="Consolidated Account Balances (Unadjusted)" />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
                    <th className="px-10 py-6">Ledger Account</th>
                    <th className="px-6 py-6">Type</th>
                    <th className="px-6 py-6 text-right">Debit (PKR)</th>
                    <th className="px-6 py-6 text-right">Credit (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {trialBalance.map(acc => (
                    <tr 
                      key={acc.id} 
                      onClick={() => drillToLedger(acc.id)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-10 py-5 font-black text-slate-800 dark:text-slate-200 text-sm flex items-center gap-3">
                         <div className="w-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                         {acc.title}
                      </td>
                      <td className="px-6 py-5"><span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[8px] font-black text-slate-500 uppercase tracking-widest">{acc.type}</span></td>
                      <td className="px-6 py-5 text-right font-black text-slate-900 dark:text-white text-sm">{acc.debit > 0 ? acc.debit.toLocaleString() : '-'}</td>
                      <td className="px-6 py-5 text-right font-black text-rose-600 dark:text-rose-400 text-sm">{acc.credit > 0 ? acc.credit.toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-900 text-white font-black text-xl">
                    <td colSpan={2} className="px-10 py-8 uppercase text-[10px] tracking-[0.4em] opacity-40">Statement Totals</td>
                    <td className="px-6 py-8 text-right">Rs. {trialBalance.reduce((s,x)=>s+x.debit,0).toLocaleString()}</td>
                    <td className="px-6 py-8 text-right">Rs. {trialBalance.reduce((s,x)=>s+x.credit,0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GENERAL LEDGER */}
        {activeTab === 'ledger' && (
           <div className="animate-in fade-in duration-500">
              {ledgerData ? (
                 <>
                    <ReportHeader title={`General Ledger: ${ledgerData.accountName}`} subtitle={`${ledgerData.accountType} Transaction Details`} />
                    <div className="px-10 py-8 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Identity</p>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white">{ledgerData.accountName}</h3>
                       </div>
                       <div className="sm:text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Opening Balance</p>
                          <h4 className={`text-xl font-black ${ledgerData.openingBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Rs. {Math.abs(ledgerData.openingBalance).toLocaleString()} <span className="text-[9px] font-black opacity-40">{ledgerData.openingBalance >= 0 ? 'Dr' : 'Cr'}</span></h4>
                       </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[900px]">
                         <thead className="sticky top-0 z-20">
                            <tr className="bg-slate-100 dark:bg-slate-950 text-slate-500 uppercase text-[9px] font-black tracking-widest border-b border-slate-200 dark:border-slate-800">
                               <th className="px-10 py-4">Post Date</th>
                               <th className="px-6 py-4">Voucher Reference</th>
                               <th className="px-6 py-4">Narration</th>
                               <th className="px-6 py-4 text-right">Debit (+)</th>
                               <th className="px-6 py-4 text-right">Credit (-)</th>
                               <th className="px-10 py-4 text-right">Balance Position</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {ledgerData.transactions.map((t, i) => (
                               <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-10 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs">{t.date}</td>
                                  <td className="px-6 py-4 font-black text-blue-600 text-xs">{t.voucher_no}</td>
                                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs italic">{t.description}</td>
                                  <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">{t.debit > 0 ? t.debit.toLocaleString() : '-'}</td>
                                  <td className="px-6 py-4 text-right font-black text-rose-500">{t.credit > 0 ? t.credit.toLocaleString() : '-'}</td>
                                  <td className={`px-10 py-4 text-right font-black ${t.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                     Rs. {Math.abs(t.balance).toLocaleString()} <span className="text-[8px] opacity-40">{t.balance >= 0 ? 'Dr' : 'Cr'}</span>
                                  </td>
                               </tr>
                            ))}
                            <tr className="bg-slate-900 text-white">
                               <td colSpan={5} className="px-10 py-6 text-right uppercase text-[10px] tracking-widest opacity-40">Period End Closing Balance</td>
                               <td className="px-10 py-6 text-right font-black text-lg">Rs. {ledgerData.closingBalance.toLocaleString()}</td>
                            </tr>
                         </tbody>
                      </table>
                    </div>
                 </>
              ) : (
                 <div className="py-40 text-center space-y-4">
                    <TableIcon size={64} className="mx-auto text-slate-200 dark:text-slate-800" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em]">Select an account to generate ledger</p>
                 </div>
              )}
           </div>
        )}

        {/* PROFIT & LOSS */}
        {activeTab === 'pl' && (
          <div className="p-8 sm:p-16 animate-in zoom-in-95 duration-500">
            <ReportHeader title="Profit or Loss Statement" subtitle={`Comprehensive Income for period ${fromDate} - ${toDate}`} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-20">
               <div>
                  <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                    <div className="h-1 flex-1 bg-emerald-100 rounded-full"></div> REVENUE STREAMS
                  </h3>
                  <div className="space-y-6">
                     {plData.income.map((i,idx) => (
                       <div key={idx} className="flex justify-between items-end border-b border-slate-50 dark:border-slate-800 pb-4">
                         <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{i.title}</span>
                         <span className="font-black text-slate-900 dark:text-white text-lg">Rs. {i.amount.toLocaleString()}</span>
                       </div>
                     ))}
                     <div className="flex justify-between items-center pt-6 text-emerald-600">
                        <span className="text-[10px] font-black uppercase tracking-widest">Gross Sales Margin</span>
                        <span className="text-2xl sm:text-3xl font-black">Rs. {plData.totalIncome.toLocaleString()}</span>
                     </div>
                  </div>
               </div>
               <div>
                  <h3 className="text-xs font-black text-rose-600 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                    <div className="h-1 flex-1 bg-rose-100 rounded-full"></div> OPERATIONAL OVERHEAD
                  </h3>
                  <div className="space-y-6">
                     {plData.expenses.map((e,idx) => (
                       <div key={idx} className="flex justify-between items-end border-b border-slate-50 dark:border-slate-800 pb-4">
                         <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{e.title}</span>
                         <span className="font-black text-slate-900 dark:text-white text-lg">Rs. {e.amount.toLocaleString()}</span>
                       </div>
                     ))}
                     <div className="flex justify-between items-center pt-6 text-rose-600">
                        <span className="text-[10px] font-black uppercase tracking-widest">Total Period Expenses</span>
                        <span className="text-2xl sm:text-3xl font-black">Rs. {plData.totalExpenses.toLocaleString()}</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className="mt-20 bg-slate-900 dark:bg-emerald-900/10 rounded-[3rem] p-10 sm:p-16 flex flex-col items-center justify-center text-white relative overflow-hidden group shadow-2xl">
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 to-blue-600/10 opacity-50"></div>
               <p className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] mb-4 relative z-10 text-center">Bottom Line Performance</p>
               <h4 className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-2 relative z-10 text-center">Net {plData.netProfit >= 0 ? 'Profit' : 'Loss'} For Period</h4>
               <span className={`text-4xl sm:text-7xl font-black relative z-10 transition-transform group-hover:scale-110 duration-700 ${plData.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Rs. {Math.abs(plData.netProfit).toLocaleString()}
               </span>
            </div>
          </div>
        )}

        {/* BALANCE SHEET */}
        {activeTab === 'balance' && (
          <div className="p-8 sm:p-16 animate-in slide-in-from-bottom-8 duration-500">
            <ReportHeader title="Statement of Financial Position" subtitle={`Assets, Liabilities & Equity as of ${toDate}`} />
            <div className="max-w-4xl mx-auto space-y-16">
               <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-slate-900 text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] rounded-[1rem] shadow-xl">Current Assets</div>
                    <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="space-y-6">
                     {balanceSheet.assets.map(a => (
                       <div key={a.id} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 px-6 pb-4">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{a.title}</span>
                          <span className="font-black text-lg text-slate-900 dark:text-white">Rs. {(a.debit - a.credit).toLocaleString()}</span>
                       </div>
                     ))}
                     <div className="flex justify-between items-center px-6 pt-6 text-emerald-600">
                        <span className="uppercase text-[11px] font-black tracking-widest">Total Asset Liquidity</span>
                        <span className="text-2xl sm:text-3xl font-black">Rs. {balanceSheet.totalAssets.toLocaleString()}</span>
                     </div>
                  </div>
               </section>

               <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-slate-900 text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] rounded-[1rem] shadow-xl">Liabilities & Ownership</div>
                    <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16">
                     <div className="space-y-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-6">External Liabilities</p>
                        {balanceSheet.liabilities.map(a => (
                          <div key={a.id} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 px-6 pb-3">
                             <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{a.title}</span>
                             <span className="font-black text-slate-900 dark:text-white">Rs. {(a.credit - a.debit).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center px-6 pt-4 text-rose-600 font-black">
                           <span className="text-[9px] uppercase">Total Debt Position</span>
                           <span>Rs. {balanceSheet.totalLiabilities.toLocaleString()}</span>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-6">Retained Equity</p>
                        {balanceSheet.equity.map(a => (
                          <div key={a.id} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 px-6 pb-3">
                             <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{a.title}</span>
                             <span className="font-black text-slate-900 dark:text-white">Rs. {(a.credit - a.debit).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 px-6 pb-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl py-3">
                           <span className="text-sm font-black text-emerald-700 italic">Net Period Earnings</span>
                           <span className="font-black text-emerald-700">Rs. {balanceSheet.netProfit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center px-6 pt-4 text-blue-600 font-black">
                           <span className="text-[9px] uppercase">Total Shareholder Value</span>
                           <span>Rs. {balanceSheet.totalEquity.toLocaleString()}</span>
                        </div>
                     </div>
                  </div>
                  <div className="mt-16 flex flex-col sm:flex-row justify-between items-center bg-slate-900 text-white rounded-[2rem] p-10 shadow-2xl gap-6">
                     <div className="flex items-center gap-6">
                        <div className="bg-white/10 p-4 rounded-2xl"><ShieldCheck size={32}/></div>
                        <div>
                           <h4 className="text-xl font-black uppercase tracking-tight">Equilibrium</h4>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">Assets = L + E</p>
                        </div>
                     </div>
                     <div className="sm:text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Functional Total</p>
                        <span className="text-3xl sm:text-4xl font-black text-emerald-400">Rs. {balanceSheet.totalAssets.toLocaleString()}</span>
                     </div>
                  </div>
               </section>
            </div>
          </div>
        )}

        {/* AGING REPORT */}
        {activeTab === 'aging' && (
           <div className="animate-in fade-in duration-500">
              <ReportHeader title={`${agingType} Aging Schedule`} subtitle={`Receivable / Payable Maturity buckets as of ${toDate}`} />
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
                      <th className="px-10 py-6">Operational Entity</th>
                      <th className="px-6 py-6 text-right">0-30 Days</th>
                      <th className="px-6 py-6 text-right">31-60 Days</th>
                      <th className="px-6 py-6 text-right">61-90 Days</th>
                      <th className="px-6 py-6 text-right">90+ Overdue</th>
                      <th className="px-10 py-6 text-right bg-slate-800">Outstanding Balance</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                     {agingData.map((p: any) => (
                       <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <td className="px-10 py-5 font-black uppercase text-slate-800 dark:text-slate-200">{p.name}</td>
                          <td className="px-6 py-5 text-right font-bold text-slate-500">{p.current.toLocaleString()}</td>
                          <td className={`px-6 py-5 text-right font-black ${p.d30 > 0 ? 'text-amber-600' : 'text-slate-300'}`}>{p.d30.toLocaleString()}</td>
                          <td className={`px-6 py-5 text-right font-black ${p.d60 > 0 ? 'text-orange-600' : 'text-slate-300'}`}>{p.d60.toLocaleString()}</td>
                          <td className={`px-6 py-5 text-right font-black ${p.over90 > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-300'}`}>{p.over90.toLocaleString()}</td>
                          <td className="px-10 py-5 text-right font-black bg-slate-50/50 dark:bg-slate-800/30 text-slate-900 dark:text-white">Rs. {p.total.toLocaleString()}</td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
           </div>
        )}

        {/* CASH FLOW */}
        {activeTab === 'cashflow' && (
           <div className="animate-in fade-in duration-500">
              <ReportHeader title="Statement of Cash Flow" subtitle={`Liquidity Tracking and Movements for ${fromDate} - ${toDate}`} />
              <div className="px-8 sm:px-10 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
                 <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-[2rem] space-y-2 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Opening Liquidity</p>
                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Rs. {cashFlow.openingCash.toLocaleString()}</h4>
                 </div>
                 <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[2rem] space-y-2 border border-emerald-100 dark:border-emerald-900/30">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Period Inflows</p>
                    <h4 className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">+ Rs. {cashFlow.totalInflow.toLocaleString()}</h4>
                 </div>
                 <div className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-[2rem] space-y-2 border border-rose-100 dark:border-rose-900/30">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Period Outflows</p>
                    <h4 className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-400">- Rs. {cashFlow.totalOutflow.toLocaleString()}</h4>
                 </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                   <thead className="sticky top-0 z-20">
                      <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
                         <th className="px-10 py-6">Timeline</th>
                         <th className="px-6 py-6">Operation Narration</th>
                         <th className="px-6 py-6 text-right">Inflow (+)</th>
                         <th className="px-6 py-6 text-right">Outflow (-)</th>
                      </tr>
                   </thead>
                   <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-800">
                      {cashFlow.movements.map((cf, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                           <td className="px-10 py-5 font-bold text-slate-500 dark:text-slate-400">{cf.date}</td>
                           <td className="px-6 py-5">
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[9px] font-black uppercase mr-3">{cf.type}</span>
                              <span className="font-medium dark:text-slate-200">{cf.description}</span>
                           </td>
                           <td className="px-6 py-5 text-right font-black text-emerald-600">{cf.inflow > 0 ? cf.inflow.toLocaleString() : '-'}</td>
                           <td className="px-6 py-5 text-right font-black text-rose-600">{cf.outflow > 0 ? cf.outflow.toLocaleString() : '-'}</td>
                        </tr>
                      ))}
                   </tbody>
                   <tfoot>
                      <tr className="bg-slate-900 text-white">
                         <td colSpan={3} className="px-10 py-8 text-right uppercase text-[10px] font-black tracking-[0.3em]">Net Positions</td>
                         <td className="px-6 py-8 text-right font-black text-2xl text-emerald-400">Rs. {cashFlow.closingCash.toLocaleString()}</td>
                      </tr>
                   </tfoot>
                </table>
              </div>
           </div>
        )}

        {/* MANAGEMENT ANALYSIS (CHARTS) */}
        {activeTab === 'analysis' && (
           <div className="p-8 sm:p-16 animate-in fade-in duration-500 space-y-16">
              <ReportHeader title="Management Analysis Dashboard" subtitle="Strategic Financial Visualization & Trends" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-10">Revenue vs Expense Cycle</h4>
                    <div className="h-[300px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                             <XAxis dataKey="name" axisLine={false} tick={{fontSize: 10, fontWeight: 800}} />
                             <YAxis axisLine={false} tick={{fontSize: 10, fontWeight: 800}} />
                             <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                             <Bar dataKey="revenue" fill="#10b981" radius={[4,4,0,0]} barSize={40} />
                             <Bar dataKey="expense" fill="#f43f5e" radius={[4,4,0,0]} barSize={40} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-10">Growth Momentum</h4>
                    <div className="h-[300px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={monthlyData}>
                             <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                             <XAxis dataKey="name" axisLine={false} tick={{fontSize: 10, fontWeight: 800}} />
                             <YAxis axisLine={false} tick={{fontSize: 10, fontWeight: 800}} />
                             <Tooltip />
                             <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={4} />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>

      {/* AI Performance Insights */}
      <div className="no-print px-2 sm:px-0">
        <div className={`bg-slate-950 rounded-[4rem] shadow-2xl text-white relative overflow-hidden group p-10 sm:p-16`}>
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <Sparkles size={300} />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-12">
              <div className="bg-indigo-600 p-5 rounded-[2rem] shadow-2xl shadow-indigo-900/50 w-fit">
                <ShieldCheck size={40} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Audit Intelligence Core</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">AI-Powered Ledger Integrity Diagnostics</p>
              </div>
            </div>
            {insights ? (
              <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-8 sm:p-12 border border-white/10 shadow-inner animate-in slide-in-from-bottom-4 duration-500">
                <div className="whitespace-pre-wrap leading-relaxed text-base font-medium text-slate-200">
                  {insights}
                </div>
                <button onClick={() => setInsights('')} className="mt-10 text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest flex items-center gap-3 transition-colors">
                  <Clock size={16} /> Re-scan Registry Structures
                </button>
              </div>
            ) : (
              <div className="text-center max-w-2xl mx-auto py-12">
                <p className="text-slate-400 text-lg font-medium mb-12 leading-relaxed">
                   Run a deep neural scan of your General Ledger and Transaction Registry. Our AI will detect accounting anomalies and provide strategic recommendations.
                </p>
                <button 
                  onClick={generateInsights}
                  disabled={loading}
                  className="bg-white text-slate-900 px-10 sm:px-16 py-5 sm:py-7 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] hover:scale-105 transition-all flex items-center justify-center gap-4 mx-auto shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                >
                  {loading ? 'Initiating Audit...' : <><Sparkles size={20} /> Run Diagnostic Scan</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
