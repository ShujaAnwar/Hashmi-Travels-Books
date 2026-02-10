
import { Customer, Vendor, Account, Voucher, AccountType, VoucherType, User, HotelVoucher, Receipt, TransportVoucher, TicketVoucher, VisaVoucher, Currency, AuditLog, AppSettings } from './types';
import { supabase } from './lib/supabase';

const STORAGE_KEY = 'travel_ledger_data_v4';

interface AppData {
  users: User[];
  customers: Customer[];
  vendors: Vendor[];
  accounts: Account[];
  vouchers: Voucher[];
  hotelVouchers: HotelVoucher[];
  ticketVouchers: TicketVoucher[];
  visaVouchers: VisaVoucher[];
  receipts: Receipt[];
  transportVouchers: TransportVoucher[];
  settings: AppSettings;
  auditLogs: AuditLog[];
}

const DEFAULT_SETTINGS: AppSettings = {
  appName: 'TravelLedger',
  corporateName: 'NEEM TREE TRAVEL SERVICES',
  tagline: 'Agency Accounting Core',
  address: 'Shah Faisal Town Malir Halt Karachi',
  phone: '021000000',
  cell: '0334 3666777',
  email: 'neemtreetravel@gmail.com',
  website: 'www.neemtreetravels.com',
  defaultROE: 83.5,
  bankName: 'Meezan Bank Ltd',
  bankAccountTitle: 'Neem Tree Travels Services',
  bankIBAN: 'PK32MEZN001234567890'
};

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc-1', title: 'Cash in Hand', type: AccountType.CASH, created_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-2', title: 'Meezan Bank Account', type: AccountType.BANK, created_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-3', title: 'Ticket & Hotel Sales Revenue', type: AccountType.INCOME, created_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-4', title: 'Office Rent', type: AccountType.EXPENSE, created_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-5', title: 'Accounts Receivable (Customers)', type: AccountType.RECEIVABLE, created_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-6', title: 'Accounts Payable (Suppliers)', type: AccountType.PAYABLE, created_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-7', title: 'Equity / Capital Account', type: AccountType.EQUITY, created_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-11', title: 'Opening Balance Equity', type: AccountType.EQUITY, created_at: '2026-01-01T00:00:00Z' },
];

const getInitialData = (): AppData => {
  const defaults: AppData = {
    users: [], customers: [], vendors: [], accounts: DEFAULT_ACCOUNTS,
    vouchers: [], hotelVouchers: [], ticketVouchers: [], visaVouchers: [],
    receipts: [], transportVouchers: [], settings: DEFAULT_SETTINGS, auditLogs: []
  };
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaults;
  try {
    const parsed = JSON.parse(stored);
    return { ...defaults, ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } };
  } catch (e) { return defaults; }
};

export class Store {
  private data: AppData = getInitialData();
  private save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); }

  async fetchFromCloud() {
    try {
      const [ { data: accs }, { data: conts }, { data: vocs }, { data: ents }, { data: recs }, { data: hotels }, { data: tix }, { data: visas }, { data: trans } ] = await Promise.all([
        supabase.from('accounts').select('*'), supabase.from('contacts').select('*'),
        supabase.from('vouchers').select('*'), supabase.from('journal_entries').select('*'),
        supabase.from('receipts').select('*'), supabase.from('hotel_bookings').select('*'),
        supabase.from('ticket_bookings').select('*'), supabase.from('visa_applications').select('*'),
        supabase.from('transport_entries').select('*')
      ]);

      if (accs) this.data.accounts = accs.map(a => ({ ...a, type: a.type as AccountType }));
      if (conts) {
        this.data.customers = conts.filter(c => c.contact_type === 'Customer').map(c => ({ id: c.id, customer_code: c.code, name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '', city: c.city || '', opening_balance: c.opening_balance || 0, opening_balance_type: 'Receivable', is_active: c.is_active, is_deleted: false, created_at: c.created_at }));
        this.data.vendors = conts.filter(v => v.contact_type === 'Vendor').map(v => ({ id: v.id, vendor_code: v.code, name: v.name, phone: v.phone || '', email: v.email || '', address: v.address || '', city: v.city || '', opening_balance: v.opening_balance || 0, opening_balance_type: 'Payable', is_active: v.is_active, is_deleted: false, created_at: v.created_at }));
      }
      if (vocs && ents) this.data.vouchers = vocs.map(v => ({ ...v, type: v.type as VoucherType, entries: ents.filter(e => e.voucher_id === v.id) }));
      if (recs) this.data.receipts = recs;
      if (hotels) this.data.hotelVouchers = hotels;
      if (tix) this.data.ticketVouchers = tix;
      if (visas) this.data.visaVouchers = visas;
      if (trans) this.data.transportVouchers = trans;
      
      this.save();
      return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
  }

  async syncToCloud() {
    try {
      await supabase.from('accounts').upsert(this.data.accounts.map(a => ({ id: a.id, title: a.title, type: a.type })));
      const contactPayload = [
        ...this.data.customers.map(c => ({ id: c.id, contact_type: 'Customer', name: c.name, code: c.customer_code, phone: c.phone, email: c.email, address: c.address, city: c.city, opening_balance: c.opening_balance, is_active: c.is_active })),
        ...this.data.vendors.map(v => ({ id: v.id, contact_type: 'Vendor', name: v.name, code: v.vendor_code, phone: v.phone, email: v.email, address: v.address, city: v.city, opening_balance: v.opening_balance, is_active: v.is_active }))
      ];
      await supabase.from('contacts').upsert(contactPayload);

      if (this.data.vouchers.length > 0) {
        await supabase.from('vouchers').upsert(this.data.vouchers.map(v => ({ id: v.id, voucher_no: v.voucher_no, date: v.date, type: v.type, description: v.description, currency: v.currency, roe: v.roe, total_amount: v.total_amount })));
        const allEntries = this.data.vouchers.flatMap(v => v.entries.map(e => ({ 
          id: e.id, 
          voucher_id: v.id, 
          account_id: e.account_id, 
          contact_id: e.contact_id || null, 
          debit: e.debit, 
          credit: e.credit 
        })));
        if (allEntries.length > 0) await supabase.from('journal_entries').upsert(allEntries);
      }
      
      if (this.data.receipts.length > 0) {
        await supabase.from('receipts').upsert(this.data.receipts);
      }
      
      if (this.data.hotelVouchers.length > 0) {
        await supabase.from('hotel_bookings').upsert(this.data.hotelVouchers);
      }

      this.data.settings.lastCloudSync = new Date().toISOString();
      this.save();
      return { success: true };
    } catch (error: any) { 
      console.error("Sync Error:", error);
      return { success: false, error: error.message }; 
    }
  }

  getPrefixForType(type: VoucherType): string {
    switch (type) {
      case VoucherType.RECEIPT: return 'RV';
      case VoucherType.HOTEL: return 'HV';
      case VoucherType.TICKET: return 'TK';
      case VoucherType.VISA: return 'VS';
      case VoucherType.TRANSPORT: return 'TR';
      case VoucherType.CASH: return 'CV';
      case VoucherType.BANK: return 'BV';
      default: return 'JV';
    }
  }

  generateNextVoucherNo(type: VoucherType): string {
    const prefix = this.getPrefixForType(type);
    const pattern = new RegExp(`^${prefix}-(\\d+)$`);
    const maxNum = this.data.vouchers.filter(v => v.type === type).reduce((max, v) => {
      const match = v.voucher_no.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        return isNaN(num) ? max : Math.max(max, num);
      }
      return max;
    }, 0);
    return `${prefix}-${(maxNum + 1).toString().padStart(4, '0')}`;
  }

  addVoucher(v: any) {
    const id = v.id || `voc-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const newV = { 
      ...v, 
      id, 
      voucher_no: v.voucher_no || this.generateNextVoucherNo(v.type), 
      created_at: new Date().toISOString(), 
      entries: (v.entries || []).map((e: any) => ({ 
        id: e.id || `ent-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        ...e, 
        voucher_id: id 
      })) 
    };
    this.data.vouchers.push(newV);
    this.save();
    return newV;
  }

  async updateVoucher(id: string, updates: any) {
    const idx = this.data.vouchers.findIndex(v => v.id === id);
    if (idx !== -1) {
      this.data.vouchers[idx] = { 
        ...this.data.vouchers[idx], 
        ...updates, 
        entries: (updates.entries || []).map((e: any) => ({ 
          id: e.id || `ent-${Date.now()}-${Math.floor(Math.random()*1000)}`, 
          ...e, 
          voucher_id: id 
        })) 
      };
      this.save();
      await this.syncToCloud();
    }
  }

  async addReceipt(r: any, entries: any[]) {
    const receiptNo = this.generateNextVoucherNo(VoucherType.RECEIPT);
    const accVoucher = this.addVoucher({
      voucher_no: receiptNo, date: r.date, type: VoucherType.RECEIPT,
      description: r.narration, total_amount: r.amount, currency: r.currency, roe: r.roe, entries
    });
    const newR = { ...r, id: `rec-${Date.now()}`, receipt_no: receiptNo, voucher_id: accVoucher.id, created_at: new Date().toISOString() };
    this.data.receipts.push(newR);
    this.save();
    await this.syncToCloud();
    return newR;
  }

  // Added deleteReceipt method
  async deleteReceipt(id: string) {
    const rIdx = this.data.receipts.findIndex(r => r.id === id);
    if (rIdx !== -1) {
      const r = this.data.receipts[rIdx];
      this.data.vouchers = this.data.vouchers.filter(v => v.id !== r.voucher_id);
      this.data.receipts.splice(rIdx, 1);
      this.save();
      await this.syncToCloud();
    }
  }

  async addHotelVoucher(h: any, entries: any[]) {
    const voucher = this.addVoucher({
      date: h.date, type: VoucherType.HOTEL, description: `Hotel Booking: ${h.pax_name} @ ${h.hotel_name}`,
      total_amount: h.sale_price_pkr, currency: h.currency, roe: h.roe, entries
    });
    const newH = { ...h, id: `hotel-${Date.now()}`, voucher_id: voucher.id };
    this.data.hotelVouchers.push(newH);
    this.save();
    await this.syncToCloud();
    return newH;
  }

  async updateHotelVoucher(id: string, updates: any, entries: any[]) {
    const idx = this.data.hotelVouchers.findIndex(h => h.id === id);
    if (idx !== -1) {
      const h = this.data.hotelVouchers[idx];
      await this.updateVoucher(h.voucher_id, {
        date: updates.date, description: `Hotel Booking: ${updates.pax_name} @ ${updates.hotel_name}`,
        total_amount: updates.sale_price_pkr, currency: updates.currency, roe: updates.roe, entries
      });
      this.data.hotelVouchers[idx] = { ...h, ...updates };
      this.save();
      await this.syncToCloud();
    }
  }

  async addTicketVoucher(t: any, entries: any[]) {
    const voucher = this.addVoucher({
      date: t.date, type: VoucherType.TICKET, description: `Ticket: ${t.pax_name} / ${t.ticket_no}`,
      total_amount: t.total_sale_pkr, currency: t.currency || 'PKR', roe: t.roe || 1, entries
    });
    const newT = { ...t, id: `tix-${Date.now()}`, voucher_id: voucher.id };
    this.data.ticketVouchers.push(newT);
    this.save();
    await this.syncToCloud();
    return newT;
  }

  // Added updateTicketVoucher method
  async updateTicketVoucher(id: string, updates: any, entries: any[]) {
    const idx = this.data.ticketVouchers.findIndex(t => t.id === id);
    if (idx !== -1) {
      const t = this.data.ticketVouchers[idx];
      await this.updateVoucher(t.voucher_id, {
        date: updates.date, description: `Ticket: ${updates.pax_name} / ${updates.ticket_no}`,
        total_amount: updates.total_sale_pkr, currency: updates.currency || 'PKR', roe: updates.roe || 1, entries
      });
      this.data.ticketVouchers[idx] = { ...t, ...updates };
      this.save();
      await this.syncToCloud();
    }
  }

  async addVisaVoucher(v: any, entries: any[]) {
    const voucher = this.addVoucher({
      date: v.date, type: VoucherType.VISA, description: `Visa: ${v.pax_name} / ${v.country}`,
      total_amount: v.sale_price_pkr, currency: v.currency || 'PKR', roe: v.roe || 1, entries
    });
    const newV = { ...v, id: `visa-${Date.now()}`, voucher_id: voucher.id };
    this.data.visaVouchers.push(newV);
    this.save();
    await this.syncToCloud();
    return newV;
  }

  // Added updateVisaVoucher method
  async updateVisaVoucher(id: string, updates: any, entries: any[]) {
    const idx = this.data.visaVouchers.findIndex(v => v.id === id);
    if (idx !== -1) {
      const v = this.data.visaVouchers[idx];
      await this.updateVoucher(v.voucher_id, {
        date: updates.date, description: `Visa: ${updates.pax_name} / ${updates.country}`,
        total_amount: updates.sale_price_pkr, currency: updates.currency || 'PKR', roe: updates.roe || 1, entries
      });
      this.data.visaVouchers[idx] = { ...v, ...updates };
      this.save();
      await this.syncToCloud();
    }
  }

  async addTransportVoucher(t: any, entries: any[]) {
    const voucher = this.addVoucher({
      date: t.date, type: VoucherType.TRANSPORT, description: t.narration,
      total_amount: t.total_amount, currency: t.currency || 'PKR', roe: t.roe || 1, entries
    });
    const newT = { ...t, id: `trans-${Date.now()}`, voucher_id: voucher.id };
    this.data.transportVouchers.push(newT);
    this.save();
    await this.syncToCloud();
    return newT;
  }

  // Added updateTransportVoucher method
  async updateTransportVoucher(id: string, updates: any, entries: any[]) {
    const idx = this.data.transportVouchers.findIndex(t => t.id === id);
    if (idx !== -1) {
      const t = this.data.transportVouchers[idx];
      await this.updateVoucher(t.voucher_id, {
        date: updates.date, description: updates.narration,
        total_amount: updates.total_amount, currency: updates.currency || 'PKR', roe: updates.roe || 1, entries
      });
      this.data.transportVouchers[idx] = { ...t, ...updates };
      this.save();
      await this.syncToCloud();
    }
  }

  getPartyLedger(partyId: string, partyType: 'Customer' | 'Vendor', fromDate?: string, toDate?: string) {
    const entries = this.data.vouchers.flatMap(v => (v.entries || []).filter(e => e.contact_id === partyId).map(e => ({ ...e, date: v.date, voucher_no: v.voucher_no, description: v.description, type: v.type, currency: v.currency, roe: v.roe }))).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let balance = 0, openingBalance = 0;
    const filtered: any[] = [];
    entries.forEach(e => {
      const entryDate = new Date(e.date);
      const net = partyType === 'Customer' ? (e.debit - e.credit) : (e.credit - e.debit);
      if (fromDate && entryDate < new Date(fromDate)) openingBalance += net;
      else if (!toDate || entryDate <= new Date(toDate)) {
        if (filtered.length === 0) balance = openingBalance + net; else balance += net;
        filtered.push({ ...e, balance });
      }
    });
    const party = partyType === 'Customer' ? this.getCustomer(partyId) : this.getVendor(partyId);
    return { partyName: party?.name || 'Unknown', openingBalance, transactions: filtered, closingBalance: openingBalance + filtered.reduce((s, t) => s + (partyType === 'Customer' ? (t.debit - t.credit) : (t.credit - t.debit)), 0) };
  }

  getTrialBalance(toDate?: string) {
    return this.data.accounts.map(acc => {
      const ledger = this.getAccountLedger(acc.id, undefined, toDate);
      return { id: acc.id, title: acc.title, type: acc.type, debit: ledger.closingBalance > 0 ? ledger.closingBalance : 0, credit: ledger.closingBalance < 0 ? Math.abs(ledger.closingBalance) : 0 };
    });
  }

  getAccountLedger(accountId: string, fromDate?: string, toDate?: string) {
    const entries = this.data.vouchers.flatMap(v => (v.entries || []).filter(e => e.account_id === accountId).map(e => ({ ...e, date: v.date, voucher_no: v.voucher_no, description: v.description, type: v.type, currency: v.currency, roe: v.roe }))).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let balance = 0, openingBalance = 0;
    const filtered: any[] = [];
    entries.forEach(e => {
      const entryDate = new Date(e.date);
      const net = e.debit - e.credit;
      if (fromDate && entryDate < new Date(fromDate)) openingBalance += net;
      else if (!toDate || entryDate <= new Date(toDate)) {
        if (filtered.length === 0) balance = openingBalance + net; else balance += net;
        filtered.push({ ...e, balance });
      }
    });
    const acc = this.getAccount(accountId);
    return { accountName: acc?.title || 'Unknown', openingBalance, transactions: filtered, closingBalance: openingBalance + filtered.reduce((s, t) => s + (t.debit - t.credit), 0) };
  }

  getAccount(id: string) { return this.data.accounts.find(a => a.id === id); }
  getAccounts() { return this.data.accounts; }
  getCustomers() { return this.data.customers.filter(c => !c.is_deleted); }
  getCustomer(id: string) { return this.data.customers.find(c => c.id === id); }
  getVendors() { return this.data.vendors.filter(v => !v.is_deleted); }
  getVendor(id: string) { return this.data.vendors.find(v => v.id === id); }
  getVouchers() { return this.data.vouchers; }
  getReceipts() { return this.data.receipts; }
  getSettings() { return this.data.settings; }
  // Added getAuditLogs method
  getAuditLogs() { return this.data.auditLogs; }
  updateSettings(s: any) { this.data.settings = { ...this.data.settings, ...s }; this.save(); }
  addCustomer(c: any) { this.data.customers.push({ ...c, id: `cust-${Date.now()}`, customer_code: `C${this.data.customers.length + 1}`, is_deleted: false, created_at: new Date().toISOString() }); this.save(); this.syncToCloud(); }
  updateCustomer(id: string, u: any) { const i = this.data.customers.findIndex(c => c.id === id); if (i !== -1) { this.data.customers[i] = { ...this.data.customers[i], ...u }; this.save(); this.syncToCloud(); } }
  // Added deleteCustomer method
  async deleteCustomer(id: string) {
    const hasTransactions = this.data.vouchers.some(v => v.entries.some(e => e.contact_id === id));
    if (hasTransactions) throw new Error("Cannot delete entity with transaction history. Deactivate instead.");
    this.data.customers = this.data.customers.filter(c => c.id !== id);
    this.save();
    await this.syncToCloud();
  }
  addVendor(v: any) { this.data.vendors.push({ ...v, id: `vend-${Date.now()}`, vendor_code: `V${this.data.vendors.length + 1}`, is_deleted: false, created_at: new Date().toISOString() }); this.save(); this.syncToCloud(); }
  updateVendor(id: string, u: any) { const i = this.data.vendors.findIndex(v => v.id === id); if (i !== -1) { this.data.vendors[i] = { ...this.data.vendors[i], ...u }; this.save(); this.syncToCloud(); } }
  // Added deleteVendor method
  async deleteVendor(id: string) {
    const hasTransactions = this.data.vouchers.some(v => v.entries.some(e => e.contact_id === id));
    if (hasTransactions) throw new Error("Cannot delete entity with transaction history. Deactivate instead.");
    this.data.vendors = this.data.vendors.filter(v => v.id !== id);
    this.save();
    await this.syncToCloud();
  }
  addAccount(a: any) { this.data.accounts.push({ ...a, id: `acc-${Date.now()}`, created_at: new Date().toISOString() }); this.save(); this.syncToCloud(); }
  updateAccount(id: string, u: any) { const i = this.data.accounts.findIndex(a => a.id === id); if (i !== -1) { this.data.accounts[i] = { ...this.data.accounts[i], ...u }; this.save(); this.syncToCloud(); } }
  deleteAccount(id: string) { this.data.accounts = this.data.accounts.filter(a => a.id !== id); this.save(); this.syncToCloud(); }
  getHotelVouchers() { return this.data.hotelVouchers; }
  getTicketVouchers() { return this.data.ticketVouchers; }
  getVisaVouchers() { return this.data.visaVouchers; }
  getTransportVouchers() { return this.data.transportVouchers; }
  getPLReport(f?: string, t?: string) {
    const tb = this.getTrialBalance(t);
    const income = tb.filter(a => a.type === AccountType.INCOME).map(a => ({ title: a.title, amount: a.credit - a.debit }));
    const expenses = tb.filter(a => a.type === AccountType.EXPENSE).map(a => ({ title: a.title, amount: a.debit - a.credit }));
    const totalIncome = income.reduce((s, i) => s + i.amount, 0), totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    return { income, expenses, totalIncome, totalExpenses, netProfit: totalIncome - totalExpenses };
  }
  getBalanceSheet(t?: string) {
    const tb = this.getTrialBalance(t);
    const pl = this.getPLReport(undefined, t);
    const assets = tb.filter(a => [AccountType.CASH, AccountType.BANK, AccountType.RECEIVABLE].includes(a.type as AccountType));
    const liabilities = tb.filter(a => a.type === AccountType.PAYABLE);
    const equity = tb.filter(a => a.type === AccountType.EQUITY);
    const totalAssets = assets.reduce((s, a) => s + (a.debit - a.credit), 0);
    const totalLiabilities = liabilities.reduce((s, a) => s + (a.credit - a.debit), 0);
    const totalEquity = equity.reduce((s, a) => s + (a.credit - a.debit), 0) + pl.netProfit;
    return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity, netProfit: pl.netProfit };
  }
  getAgingReport(type: 'Customer' | 'Vendor', toDate: string) {
    const entities = type === 'Customer' ? this.getCustomers() : this.getVendors();
    return entities.map(e => {
      const ledger = this.getPartyLedger(e.id, type, undefined, toDate);
      const refDate = new Date(toDate);
      const buckets = { current: 0, d30: 0, d60: 0, over90: 0 };
      ledger.transactions.forEach(t => {
        const days = Math.floor((refDate.getTime() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24));
        const amt = type === 'Customer' ? (t.debit - t.credit) : (t.credit - t.debit);
        if (days <= 30) buckets.current += amt; else if (days <= 60) buckets.d30 += amt; else if (days <= 90) buckets.d60 += amt; else buckets.over90 += amt;
      });
      return { id: e.id, name: e.name, ...buckets, total: ledger.closingBalance };
    });
  }
  getCashFlowStatement(f: string, t: string) {
    const cashAccs = this.data.accounts.filter(a => a.type === AccountType.CASH || a.type === AccountType.BANK);
    let openingCash = 0, totalIn = 0, totalOut = 0, movements: any[] = [];
    cashAccs.forEach(a => {
      const l = this.getAccountLedger(a.id, f, t);
      openingCash += l.openingBalance;
      l.transactions.forEach(tx => { movements.push({ ...tx, accountName: a.title, inflow: tx.debit, outflow: tx.credit }); totalIn += tx.debit; totalOut += tx.credit; });
    });
    return { openingCash, totalInflow: totalIn, totalOutflow: totalOut, movements: movements.sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime()), closingCash: openingCash + totalIn - totalOut };
  }
  verifyAccountingIntegrity() { const tb = this.getTrialBalance(); const dr = tb.reduce((s,a)=>s+a.debit,0), cr = tb.reduce((s,a)=>s+a.credit,0); return { balanced: Math.abs(dr-cr)<0.01, totalDebit: dr, totalCredit: cr, difference: dr-cr }; }
  exportDatabase() { return JSON.stringify(this.data); }
  importDatabase(j: string) { try { this.data = JSON.parse(j); this.save(); return true; } catch(e) { return false; } }
  resetDatabase() { localStorage.removeItem(STORAGE_KEY); window.location.reload(); }
}

export const db = new Store();
