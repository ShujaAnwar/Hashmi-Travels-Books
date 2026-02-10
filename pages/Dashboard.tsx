
import React, { useMemo, useState, useEffect } from 'react';
import { db } from '../store';
import { AccountType, VoucherType } from '../types';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Activity, 
  ShieldCheck,
  AlertTriangle,
  Ticket,
  Cloud,
  CloudOff
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  isCompact: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isCompact }) => {
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const integrity = useMemo(() => db.verifyAccountingIntegrity(), []);
  
  useEffect(() => {
    supabase.from('accounts').select('count', { count: 'exact', head: true })
      .then(res => setDbConnected(!res.error))
      .catch(() => setDbConnected(false));
  }, []);

  const stats = useMemo(() => {
    const trialBalance = db.getTrialBalance();
    return {
      cash: trialBalance.filter(a => a.type === AccountType.CASH).reduce((sum, a) => sum + (a.debit - a.credit), 0),
      bank: trialBalance.filter(a => a.type === AccountType.BANK).reduce((sum, a) => sum + (a.debit - a.credit), 0),
      receivables: trialBalance.filter(a => a.type === AccountType.RECEIVABLE).reduce((sum, a) => sum + (a.debit - a.credit), 0),
      payables: trialBalance.filter(a => a.type === AccountType.PAYABLE).reduce((sum, a) => sum + (a.credit - a.debit), 0),
      revenue: trialBalance.filter(a => a.type === AccountType.INCOME).reduce((sum, a) => sum + (a.credit - a.debit), 0),
      expenses: trialBalance.filter(a => a.type === AccountType.EXPENSE).reduce((sum, a) => sum + (a.debit - a.credit), 0),
    };
  }, []);

  const chartData = [
    { name: 'Rev', amount: stats.revenue, color: '#3b82f6' },
    { name: 'Exp', amount: stats.expenses, color: '#f43f5e' },
    { name: 'Rec', amount: stats.receivables, color: '#10b981' },
    { name: 'Pay', amount: stats.payables, color: '#f59e0b' },
  ];

  return (
    <div className={`max-w-[1600px] mx-auto ${isCompact ? 'space-y-4' : 'space-y-6 sm:space-y-8'}`}>
      
      {/* Integrity & DB Status Badge */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex-1 flex items-start sm:items-center gap-3 rounded-[1.5rem] border shadow-sm transition-all ${isCompact ? 'px-4 py-2.5' : 'px-6 py-4'} ${integrity.balanced ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-400'}`}>
          {integrity.balanced ? <ShieldCheck size={isCompact ? 16 : 20} className="shrink-0" /> : <AlertTriangle size={isCompact ? 16 : 20} className="shrink-0" />}
          <span className={`${isCompact ? 'text-[10px]' : 'text-xs sm:text-sm'} font-black uppercase tracking-widest`}>
            {integrity.balanced 
              ? `Balanced Ledger (Total: Rs. ${integrity.totalDebit.toLocaleString()})` 
              : `Balance Mismatch! Diff: Rs. ${integrity.difference.toLocaleString()}`}
          </span>
        </div>

        <div className={`flex items-center gap-3 rounded-[1.5rem] border shadow-sm px-6 py-4 ${dbConnected ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
           {dbConnected ? <Cloud size={20} /> : <CloudOff size={20} />}
           <span className="text-xs font-black uppercase tracking-widest">{dbConnected ? 'Database Connected' : 'Database Offline'}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${isCompact ? 'gap-3' : 'gap-4 sm:gap-6'}`}>
        <StatCard 
          isCompact={isCompact}
          title="Cash & Bank" 
          value={`Rs. ${(stats.cash + stats.bank).toLocaleString()}`} 
          icon={<DollarSign className="text-blue-600 dark:text-blue-400" />}
          trend="+2.4%" 
          trendUp={true} 
        />
        <StatCard 
          isCompact={isCompact}
          title="Receivables" 
          value={`Rs. ${stats.receivables.toLocaleString()}`} 
          icon={<ArrowUpRight className="text-emerald-600 dark:text-emerald-400" />}
          trend="+12%" 
          trendUp={true} 
        />
        <StatCard 
          isCompact={isCompact}
          title="Payables" 
          value={`Rs. ${stats.payables.toLocaleString()}`} 
          icon={<ArrowDownRight className="text-rose-600 dark:text-rose-400" />}
          trend="-4%" 
          trendUp={false} 
        />
        <StatCard 
          isCompact={isCompact}
          title="Revenue" 
          value={`Rs. ${stats.revenue.toLocaleString()}`} 
          icon={<TrendingUp className="text-violet-600 dark:text-violet-400" />}
          trend="+8.1%" 
          trendUp={true} 
        />
      </div>

      <div className={`grid grid-cols-1 xl:grid-cols-3 ${isCompact ? 'gap-4' : 'gap-6 sm:gap-8'}`}>
        {/* Chart */}
        <div className={`xl:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col ${isCompact ? 'p-5' : 'p-6 sm:p-8'}`}>
          <div className={`flex items-center justify-between ${isCompact ? 'mb-4' : 'mb-8'}`}>
            <h3 className={`${isCompact ? 'text-sm' : 'text-base sm:text-lg'} font-black text-slate-900 dark:text-white uppercase tracking-tight`}>Flow Analytics</h3>
            <Activity className="text-slate-300 dark:text-slate-600 shrink-0" size={18} />
          </div>
          <div className={`${isCompact ? 'h-64' : 'h-80 sm:h-96'} w-full min-h-0`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800 }} className="fill-slate-400" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800 }} className="fill-slate-400" />
                <Tooltip 
                  cursor={{ fill: 'currentColor', className: 'text-slate-50 dark:text-slate-800' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#0f172a', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px', color: '#fff' }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={isCompact ? 40 : 50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity with Scrollbar */}
        <div className={`bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 ${isCompact ? 'p-5' : 'p-6 sm:p-8'}`}>
          <h3 className={`${isCompact ? 'text-sm' : 'text-base sm:text-lg'} font-black text-slate-900 dark:text-white uppercase tracking-tight ${isCompact ? 'mb-4' : 'mb-8'}`}>Recent Activity</h3>
          
          <div className={`${isCompact ? 'max-h-[350px]' : 'max-h-[450px]'} overflow-y-auto pr-2 custom-scrollbar`}>
            <div className={`${isCompact ? 'space-y-2' : 'space-y-4'}`}>
              {db.getVouchers().slice(-30).reverse().map((v) => (
                <div key={v.id} className={`flex items-center justify-between transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group rounded-xl ${isCompact ? 'p-2 hover:bg-slate-50 dark:hover:bg-slate-800/30' : 'p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl transition-transform ${isCompact ? 'p-2' : 'p-2.5'} ${
                      v.type === VoucherType.RECEIPT ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' :
                      v.type === VoucherType.TRANSPORT ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 
                      v.type === VoucherType.TICKET ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {v.type === VoucherType.RECEIPT ? <Ticket size={isCompact ? 14 : 16} /> : <CreditCard size={isCompact ? 14 : 16} />}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-black text-slate-900 dark:text-slate-100 tracking-tight truncate ${isCompact ? 'text-xs' : 'text-sm'}`}>{v.voucher_no}</p>
                      <p className={`font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ${isCompact ? 'text-[8px]' : 'text-[10px]'}`}>{v.type}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                     <p className={`font-black text-slate-900 dark:text-slate-100 ${isCompact ? 'text-xs' : 'text-sm'}`}>Rs. {v.total_amount.toLocaleString()}</p>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{v.date}</p>
                  </div>
                </div>
              ))}
              {db.getVouchers().length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 opacity-20">
                   <Activity size={32} className="mb-2 dark:text-white"/>
                   <p className="text-[10px] font-black uppercase tracking-widest dark:text-white">Idle Ledger</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  isCompact: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp, isCompact }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 group hover:border-emerald-500 transition-all hover:shadow-xl hover:shadow-emerald-900/5 ${isCompact ? 'p-4' : 'p-6 sm:p-7'}`}>
    <div className={`flex justify-between items-start ${isCompact ? 'mb-3' : 'mb-6'}`}>
      <div className={`bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors ${isCompact ? 'p-2' : 'p-3'}`}>
        {icon}
      </div>
      {!isCompact && (
        <div className={`flex items-center gap-1 text-[10px] font-black tracking-widest uppercase ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend}
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        </div>
      )}
    </div>
    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
    <h4 className={`font-black text-slate-900 dark:text-white mt-1 tracking-tight truncate ${isCompact ? 'text-lg' : 'text-xl sm:text-2xl'}`}>{value}</h4>
  </div>
);

export default Dashboard;
