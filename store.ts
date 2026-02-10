
import { Customer, Vendor, Account, Voucher, AccountType, VoucherType, User, HotelVoucher, Receipt, TransportVoucher, TicketVoucher, VisaVoucher, Currency, AuditLog } from './types';

const STORAGE_KEY = 'travel_ledger_data_v4';

interface AppSettings {
  defaultROE: number;
  lastBackupDate?: string;
}

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

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc-1', title: 'Cash in Hand', type: AccountType.CASH, created_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-2', title: 'Meezan Bank Account', type: AccountType.BANK, created_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-3', title: 'Ticket & Hotel Sales', type: AccountType.INCOME, created_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-4', title: 'Office Rent', type: AccountType.EXPENSE, created_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-5', title: 'Accounts Receivable', type: AccountType.RECEIVABLE, created_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-6', title: 'Accounts Payable', type: AccountType.PAYABLE, created_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-7', title: 'Equity / Capital', type: AccountType.EQUITY, created_at: '2026-01-01T00:00:00Z' },
  { id: 'acc-11', title: 'Opening Balance Equity', type: AccountType.EQUITY, created_at: '2026-01-01T00:00:00Z' },
];

const getInitialData = (): AppData => {
  const defaults: AppData = {
    users: [{ id: 'u1', email: 'admin@travel.com', role: 'Admin', name: 'Super Admin' }],
    customers: [
      { id: 'cust-1', customer_code: 'CUST-001', name: 'Ahmed Travels', phone: '0301-1234567', email: 'ahmed@travels.com', address: 'Main Blvd, Lahore', city: 'Lahore', opening_balance: 50000, opening_balance_type: 'Receivable', is_active: true, is_deleted: false, created_at: '2026-01-01T00:00:00Z' }
    ],
    vendors: [
      { id: 'vend-1', vendor_code: 'VEND-001', name: 'City Transport Services', phone: '0333-1112223', email: 'city@transport.com', address: 'Bus Terminal, Karachi', city: 'Karachi', opening_balance: 30000, opening_balance_type: 'Payable', is_active: true, is_deleted: false, created_at: '2026-01-01T00:00:00Z' }
    ],
    accounts: DEFAULT_ACCOUNTS,
    vouchers: [],
    hotelVouchers: [],
    ticketVouchers: [],
    visaVouchers: [],
    receipts: [],
    transportVouchers: [],
    settings: { defaultROE: 83.5 },
    auditLogs: []
  };

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaults;

  try {
    const parsed = JSON.parse(stored);
    return {
      ...defaults,
      ...parsed,
      hotelVouchers: parsed.hotelVouchers || [],
      ticketVouchers: parsed.ticketVouchers || [],
      visaVouchers: parsed.visaVouchers || [],
      receipts: parsed.receipts || [],
      transportVouchers: parsed.transportVouchers || [],
      vouchers: parsed.vouchers || [],
      auditLogs: parsed.auditLogs || []
    };
  } catch (e) {
    console.error("Critical: Failed to parse local storage data.", e);
    return defaults;
  }
};

export class Store {
  private data: AppData = getInitialData();

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  // --- Sequential Numbering Logic ---
  
  getPrefixForType(type: VoucherType): string {
    switch (type) {
      case VoucherType.CASH: return 'CV';
      case VoucherType.BANK: return 'BV';
      case VoucherType.SALES: return 'SV';
      case VoucherType.PURCHASE: return 'PV';
      case VoucherType.JOURNAL: return 'JV';
      case VoucherType.HOTEL: return 'HV';
      case VoucherType.RECEIPT: return 'RV';
      case VoucherType.TRANSPORT: return 'TV';
      case VoucherType.TICKET: return 'TK';
      case VoucherType.VISA: return 'VS';
      case VoucherType.OPENING: return 'OP';
      default: return 'VO';
    }
  }

  generateNextVoucherNo(type: VoucherType): string {
    const prefix = this.getPrefixForType(type);
    const pattern = new RegExp(`^${prefix}-(\\d+)$`);
    
    const maxNum = this.data.vouchers
      .filter(v => v.type === type)
      .reduce((max, v) => {
        const match = v.voucher_no.match(pattern);
        if (match) {
          const num = parseInt(match[1], 10);
          return isNaN(num) ? max : Math.max(max, num);
        }
        return max;
      }, 0);

    return `${prefix}-${(maxNum + 1).toString().padStart(4, '0')}`;
  }

  logAudit(record_id: string, module: string, old_data: any, new_data: any, remarks?: string) {
    const user = this.getCurrentUser();
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      record_id,
      module,
      old_data: old_data ? JSON.parse(JSON.stringify(old_data)) : null,
      new_data: new_data ? JSON.parse(JSON.stringify(new_data)) : null,
      edited_by: user?.name || 'System',
      edited_at: new Date().toISOString(),
      remarks
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 1000) this.data.auditLogs.pop();
    this.save();
  }

  getCurrentUser(): User | null { return this.data.users[0] || null; }
  getSettings() { return this.data.settings; }
  getAuditLogs() { return this.data.auditLogs; }

  exportDatabase() {
    const backup = JSON.stringify(this.data, null, 2);
    this.data.settings.lastBackupDate = new Date().toISOString();
    this.save();
    return backup;
  }

  importDatabase(jsonData: string) {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.accounts || !parsed.vouchers) throw new Error("Invalid schema");
      this.data = { ...getInitialData(), ...parsed };
      this.save();
      return true;
    } catch (e) { return false; }
  }

  resetDatabase() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  getAccounts() { return this.data.accounts; }
  getAccount(id: string) { return this.data.accounts.find(a => a.id === id); }
  
  addAccount(acc: Omit<Account, 'id' | 'created_at'>) {
    const newAcc = { ...acc, id: `acc-${Date.now()}`, created_at: new Date().toISOString() };
    this.data.accounts.push(newAcc);
    this.save();
    return newAcc;
  }

  updateAccount(id: string, updates: Partial<Account>) {
    const idx = this.data.accounts.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.accounts[idx] = { ...this.data.accounts[idx], ...updates };
      this.save();
    }
  }

  deleteAccount(id: string) {
    const hasTransactions = this.data.vouchers.some(v => v.entries.some(e => e.account_id === id));
    if (hasTransactions) throw new Error("Account has transactions.");
    const idx = this.data.accounts.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.accounts.splice(idx, 1);
      this.save();
    }
  }

  getCustomers(includeInactive = true) { return this.data.customers.filter(c => !c.is_deleted && (includeInactive || c.is_active)); }
  getCustomer(id: string) { return this.data.customers.find(c => c.id === id); }
  addCustomer(c: any) {
    const id = `cust-${Date.now()}`;
    const newC = { ...c, id, customer_code: `C${this.data.customers.length+1}`, is_deleted: false, created_at: new Date().toISOString() };
    this.data.customers.push(newC);
    if (newC.opening_balance > 0) this.postOpeningBalance('Customer', newC);
    this.save();
    return newC;
  }

  updateCustomer(id: string, updates: any) {
    const idx = this.data.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.customers[idx] = { ...this.data.customers[idx], ...updates }; this.save(); }
  }

  deleteCustomer(id: string) {
    const idx = this.data.customers.findIndex(c => c.id === id);
    if (idx !== -1) { this.data.customers[idx].is_deleted = true; this.save(); }
  }

  getVendors(includeInactive = true) { return this.data.vendors.filter(v => !v.is_deleted && (includeInactive || v.is_active)); }
  getVendor(id: string) { return this.data.vendors.find(v => v.id === id); }
  addVendor(v: any) {
    const id = `vend-${Date.now()}`;
    const newV = { ...v, id, vendor_code: `V${this.data.vendors.length+1}`, is_deleted: false, created_at: new Date().toISOString() };
    this.data.vendors.push(newV);
    if (newV.opening_balance > 0) this.postOpeningBalance('Vendor', newV);
    this.save();
    return newV;
  }

  updateVendor(id: string, updates: any) {
    const idx = this.data.vendors.findIndex(v => v.id === id);
    if (idx !== -1) { this.data.vendors[idx] = { ...this.data.vendors[idx], ...updates }; this.save(); }
  }

  deleteVendor(id: string) {
    const idx = this.data.vendors.findIndex(v => v.id === id);
    if (idx !== -1) { this.data.vendors[idx].is_deleted = true; this.save(); }
  }

  private postOpeningBalance(type: 'Customer' | 'Vendor', party: any) {
    const obEquityAcc = this.data.accounts.find(a => a.id === 'acc-11');
    const arAcc = this.data.accounts.find(a => a.type === AccountType.RECEIVABLE);
    const apAcc = this.data.accounts.find(a => a.type === AccountType.PAYABLE);
    if (!obEquityAcc || !arAcc || !apAcc) return;
    let entries: any[] = [];
    if (type === 'Customer') {
      const isDr = party.opening_balance_type === 'Receivable';
      entries = [{ account_id: arAcc.id, contact_id: party.id, debit: isDr ? party.opening_balance : 0, credit: isDr ? 0 : party.opening_balance }, { account_id: obEquityAcc.id, debit: isDr ? 0 : party.opening_balance, credit: isDr ? party.opening_balance : 0 }];
    } else {
      const isCr = party.opening_balance_type === 'Payable';
      entries = [{ account_id: apAcc.id, contact_id: party.id, debit: isCr ? 0 : party.opening_balance, credit: isCr ? party.opening_balance : 0 }, { account_id: obEquityAcc.id, debit: isCr ? party.opening_balance : 0, credit: isCr ? 0 : party.opening_balance }];
    }
    this.addVoucher({
      voucher_no: this.generateNextVoucherNo(VoucherType.OPENING), date: party.created_at.split('T')[0], type: VoucherType.OPENING, description: `Opening for ${party.name}`,
      total_amount: party.opening_balance, currency: 'PKR', roe: 1, entries: entries.map(e => ({ ...e, id: `e-${Math.random()}` }))
    });
  }

  getVouchers() { return this.data.vouchers; }
  addVoucher(v: any) {
    const newV = { 
      ...v, 
      id: `voc-${Date.now()}`, 
      voucher_no: v.voucher_no || this.generateNextVoucherNo(v.type),
      created_at: new Date().toISOString() 
    };
    this.data.vouchers.push(newV);
    this.save();
    return newV;
  }

  updateVoucher(id: string, updates: any) {
    const idx = this.data.vouchers.findIndex(v => v.id === id);
    if (idx !== -1) { this.data.vouchers[idx] = { ...this.data.vouchers[idx], ...updates }; this.save(); }
  }

  getReceipts() { return this.data.receipts; }
  addReceipt(r: any, entries: any[]) {
    const receiptNo = this.generateNextVoucherNo(VoucherType.RECEIPT);
    const accVoucher = this.addVoucher({
      voucher_no: receiptNo, date: r.date, type: VoucherType.RECEIPT, description: r.narration,
      total_amount: r.amount, currency: r.currency, roe: r.roe, entries: entries.map(e => ({ ...e, id: `e-${Math.random()}` }))
    });
    const newR = { ...r, id: `rec-${Date.now()}`, receipt_no: receiptNo, voucher_id: accVoucher.id, created_at: new Date().toISOString() };
    this.data.receipts.push(newR);
    this.save();
    return newR;
  }

  updateReceipt(id: string, r: any, entries: any[]) {
    const idx = this.data.receipts.findIndex(x => x.id === id);
    if (idx === -1) return;
    const old = this.data.receipts[idx];
    this.updateVoucher(old.voucher_id, {
      date: r.date, description: r.narration, total_amount: r.amount, currency: r.currency, roe: r.roe,
      entries: entries.map(e => ({ ...e, id: e.id || `e-${Math.random()}` }))
    });
    this.data.receipts[idx] = { ...old, ...r };
    this.save();
  }

  getHotelVouchers() { return this.data.hotelVouchers; }
  addHotelVoucher(hv: any, entries: any[]) {
    const voucherNo = this.generateNextVoucherNo(VoucherType.HOTEL);
    const accVoucher = this.addVoucher({
      voucher_no: voucherNo, date: hv.date, type: VoucherType.HOTEL, description: `Hotel: ${hv.hotel_name} / ${hv.pax_name}`,
      total_amount: hv.sale_price_pkr, currency: hv.currency, roe: hv.roe, entries: entries.map(e => ({ ...e, id: `e-${Math.random()}` }))
    });
    const newHV = { ...hv, id: voucherNo, voucher_id: accVoucher.id };
    this.data.hotelVouchers.push(newHV);
    this.save();
    return newHV;
  }

  updateHotelVoucher(id: string, hv: any, entries: any[]) {
    const idx = this.data.hotelVouchers.findIndex(x => x.id === id);
    if (idx === -1) return;
    const old = this.data.hotelVouchers[idx];
    this.updateVoucher(old.voucher_id, {
      date: hv.date, total_amount: hv.sale_price_pkr,
      entries: entries.map(e => ({ ...e, id: e.id || `e-${Math.random()}` }))
    });
    this.data.hotelVouchers[idx] = { ...old, ...hv };
    this.save();
  }

  getTicketVouchers() { return this.data.ticketVouchers; }
  addTicketVoucher(tv: any, entries: any[]) {
    const voucherNo = this.generateNextVoucherNo(VoucherType.TICKET);
    const accVoucher = this.addVoucher({
      voucher_no: voucherNo, date: tv.date, type: VoucherType.TICKET, description: `Ticket: ${tv.airline} / ${tv.pax_name} / ${tv.ticket_no}`,
      total_amount: tv.total_sale_pkr, currency: tv.currency, roe: tv.roe, entries: entries.map(e => ({ ...e, id: `e-${Math.random()}` }))
    });
    const newTV = { ...tv, id: voucherNo, voucher_id: accVoucher.id };
    this.data.ticketVouchers.push(newTV);
    this.save();
    return newTV;
  }

  updateTicketVoucher(id: string, tv: any, entries: any[]) {
    const idx = this.data.ticketVouchers.findIndex(x => x.id === id);
    if (idx === -1) return;
    const old = this.data.ticketVouchers[idx];
    this.updateVoucher(old.voucher_id, {
      date: tv.date, total_amount: tv.total_sale_pkr,
      entries: entries.map(e => ({ ...e, id: e.id || `e-${Math.random()}` }))
    });
    this.data.ticketVouchers[idx] = { ...old, ...tv };
    this.save();
  }

  getVisaVouchers() { return this.data.visaVouchers; }
  addVisaVoucher(vv: any, entries: any[]) {
    const voucherNo = this.generateNextVoucherNo(VoucherType.VISA);
    const accVoucher = this.addVoucher({
      voucher_no: voucherNo, date: vv.date, type: VoucherType.VISA, description: `Visa: ${vv.country} / ${vv.pax_name} / ${vv.passport_no}`,
      total_amount: vv.sale_price_pkr, currency: vv.currency, roe: vv.roe, entries: entries.map(e => ({ ...e, id: `e-${Math.random()}` }))
    });
    const newVV = { ...vv, id: voucherNo, voucher_id: accVoucher.id };
    this.data.visaVouchers.push(newVV);
    this.save();
    return newVV;
  }

  updateVisaVoucher(id: string, vv: any, entries: any[]) {
    const idx = this.data.visaVouchers.findIndex(x => x.id === id);
    if (idx === -1) return;
    const old = this.data.visaVouchers[idx];
    this.updateVoucher(old.voucher_id, {
      date: vv.date, total_amount: vv.sale_price_pkr,
      entries: entries.map(e => ({ ...e, id: e.id || `e-${Math.random()}` }))
    });
    this.data.visaVouchers[idx] = { ...old, ...vv };
    this.save();
  }

  getTransportVouchers() { return this.data.transportVouchers; }
  addTransportVoucher(tv: any, entries: any[]) {
    const voucherNo = this.generateNextVoucherNo(VoucherType.TRANSPORT);
    const accVoucher = this.addVoucher({
      voucher_no: voucherNo, date: tv.date, type: VoucherType.TRANSPORT, description: `Transport: ${tv.route}`,
      total_amount: tv.total_amount, currency: tv.currency, roe: tv.roe, entries: entries.map(e => ({ ...e, id: `e-${Math.random()}` }))
    });
    const newTV = { ...tv, id: `trv-${Date.now()}`, voucher_no: voucherNo, voucher_id: accVoucher.id, created_at: new Date().toISOString() };
    this.data.transportVouchers.push(newTV);
    this.save();
    return newTV;
  }

  updateTransportVoucher(id: string, tv: any, entries: any[]) {
    const idx = this.data.transportVouchers.findIndex(x => x.id === id);
    if (idx === -1) return;
    const old = this.data.transportVouchers[idx];
    this.updateVoucher(old.voucher_id, {
      date: tv.date, total_amount: tv.total_amount,
      entries: entries.map(e => ({ ...e, id: e.id || `e-${Math.random()}` }))
    });
    this.data.transportVouchers[idx] = { ...old, ...tv };
    this.save();
  }

  getAccountLedger(accountId: string, fromDate?: string, toDate?: string) {
    const account = this.getAccount(accountId);
    if (!account) return { accountName: 'Unknown', transactions: [], openingBalance: 0, closingBalance: 0 };

    const entries = this.data.vouchers.flatMap(v => 
      v.entries.filter(e => e.account_id === accountId).map(e => ({
        ...e,
        date: v.date,
        voucher_no: v.voucher_no,
        description: v.description,
        type: v.type,
        currency: v.currency,
        roe: v.roe
      }))
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let balance = 0;
    let openingBalance = 0;
    const filteredTransactions: any[] = [];

    entries.forEach(e => {
      const entryDate = new Date(e.date);
      const isBeforeFrom = fromDate ? entryDate < new Date(fromDate) : false;
      const isAfterTo = toDate ? entryDate > new Date(toDate) : false;
      const net = e.debit - e.credit;
      if (isBeforeFrom) {
        openingBalance += net;
      } else if (!isAfterTo) {
        if (filteredTransactions.length === 0) balance = openingBalance + net;
        else balance += net;
        filteredTransactions.push({ ...e, balance });
      }
    });

    const closingBalance = openingBalance + filteredTransactions.reduce((sum, t) => sum + (t.debit - t.credit), 0);

    return {
      accountName: account.title,
      accountType: account.type,
      openingBalance,
      transactions: filteredTransactions,
      closingBalance
    };
  }

  getPartyLedger(partyId: string, partyType: 'Customer' | 'Vendor', fromDate?: string, toDate?: string) {
    const party = partyType === 'Customer' ? this.getCustomer(partyId) : this.getVendor(partyId);
    if (!party) return { partyName: 'Unknown', transactions: [], openingBalance: 0, closingBalance: 0 };

    const entries = this.data.vouchers.flatMap(v => 
      v.entries.filter(e => e.contact_id === partyId).map(e => ({
        ...e,
        date: v.date,
        voucher_no: v.voucher_no,
        description: v.description,
        type: v.type,
        currency: v.currency,
        roe: v.roe
      }))
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let balance = 0;
    let openingBalance = 0;
    const filteredTransactions: any[] = [];

    entries.forEach(e => {
      const entryDate = new Date(e.date);
      const isBeforeFrom = fromDate ? entryDate < new Date(fromDate) : false;
      const isAfterTo = toDate ? entryDate > new Date(toDate) : false;
      const net = partyType === 'Customer' ? (e.debit - e.credit) : (e.credit - e.debit);
      if (isBeforeFrom) {
        openingBalance += net;
      } else if (!isAfterTo) {
        if (filteredTransactions.length === 0) balance = openingBalance + net;
        else balance += net;
        filteredTransactions.push({ ...e, balance });
      }
    });

    const closingBalance = openingBalance + filteredTransactions.reduce((sum, t) => {
      return sum + (partyType === 'Customer' ? (t.debit - t.credit) : (t.credit - t.debit));
    }, 0);

    return {
      partyName: party.name,
      openingBalance,
      transactions: filteredTransactions,
      closingBalance
    };
  }

  getTrialBalance(toDate?: string) {
    return this.data.accounts.map(acc => {
      const ledger = this.getAccountLedger(acc.id, undefined, toDate);
      return { 
        id: acc.id, 
        title: acc.title, 
        type: acc.type, 
        debit: ledger.closingBalance > 0 ? ledger.closingBalance : 0, 
        credit: ledger.closingBalance < 0 ? Math.abs(ledger.closingBalance) : 0 
      };
    });
  }

  getPLReport(fromDate?: string, toDate?: string) {
    const incomeAccs = this.data.accounts.filter(a => a.type === AccountType.INCOME);
    const expenseAccs = this.data.accounts.filter(a => a.type === AccountType.EXPENSE);

    const income = incomeAccs.map(acc => {
      const ledger = this.getAccountLedger(acc.id, fromDate, toDate);
      return { title: acc.title, amount: -(ledger.closingBalance - ledger.openingBalance) };
    }).filter(i => i.amount !== 0);

    const expenses = expenseAccs.map(acc => {
      const ledger = this.getAccountLedger(acc.id, fromDate, toDate);
      return { title: acc.title, amount: (ledger.closingBalance - ledger.openingBalance) };
    }).filter(e => e.amount !== 0);

    const totalIncome = income.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    return { income, expenses, totalIncome, totalExpenses, netProfit: totalIncome - totalExpenses };
  }

  getBalanceSheet(toDate?: string) {
    const tb = this.getTrialBalance(toDate);
    const assets = tb.filter(a => [AccountType.CASH, AccountType.BANK, AccountType.RECEIVABLE].includes(a.type as AccountType));
    const liabilities = tb.filter(a => a.type === AccountType.PAYABLE);
    const equity = tb.filter(a => a.type === AccountType.EQUITY);
    const { netProfit } = this.getPLReport(undefined, toDate);
    const totalAssets = assets.reduce((s, a) => s + (a.debit - a.credit), 0);
    const totalLiabilities = liabilities.reduce((s, a) => s + (a.credit - a.debit), 0);
    const totalEquity = equity.reduce((s, a) => s + (a.credit - a.debit), 0) + netProfit;
    return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity, netProfit };
  }

  getAgingReport(partyType: 'Customer' | 'Vendor', toDate: string = new Date().toISOString().split('T')[0]) {
    const parties = partyType === 'Customer' ? this.getCustomers() : this.getVendors();
    const referenceDate = new Date(toDate);
    return parties.map(p => {
      const ledger = this.getPartyLedger(p.id, partyType, undefined, toDate);
      const balance = ledger.closingBalance;
      if (Math.abs(balance) < 0.01) return null;
      const buckets = { current: 0, d30: 0, d60: 0, over90: 0 };
      ledger.transactions.forEach(t => {
        const diff = (referenceDate.getTime() - new Date(t.date).getTime()) / (1000 * 3600 * 24);
        const amount = partyType === 'Customer' ? (t.debit - t.credit) : (t.credit - t.debit);
        if (amount === 0) return;
        if (diff <= 30) buckets.current += amount;
        else if (diff <= 60) buckets.d30 += amount;
        else if (diff <= 90) buckets.d60 += amount;
        else buckets.over90 += amount;
      });
      return { id: p.id, name: p.name, ...buckets, total: balance };
    }).filter(x => x !== null);
  }

  getCashFlowStatement(fromDate?: string, toDate?: string) {
    const cashBankAccounts = this.data.accounts.filter(a => a.type === AccountType.CASH || a.type === AccountType.BANK);
    let openingCash = 0;
    cashBankAccounts.forEach(acc => {
      const ledger = this.getAccountLedger(acc.id, undefined, fromDate ? new Date(new Date(fromDate).getTime() - 86400000).toISOString() : undefined);
      openingCash += ledger.closingBalance;
    });
    const movements = this.data.vouchers
      .filter(v => (!fromDate || v.date >= fromDate) && (!toDate || v.date <= toDate))
      .flatMap(v => v.entries.filter(e => cashBankAccounts.some(ca => ca.id === e.account_id)).map(e => ({
        date: v.date,
        description: v.description,
        type: v.type,
        inflow: e.debit,
        outflow: e.credit
      })));
    const totalInflow = movements.reduce((s, m) => s + m.inflow, 0);
    const totalOutflow = movements.reduce((s, m) => s + m.outflow, 0);
    return { openingCash, movements, totalInflow, totalOutflow, closingCash: openingCash + totalInflow - totalOutflow };
  }

  verifyAccountingIntegrity() {
    const trialBalance = this.getTrialBalance();
    const totalDr = trialBalance.reduce((sum, a) => sum + a.debit, 0);
    const totalCr = trialBalance.reduce((sum, a) => sum + a.credit, 0);
    return { balanced: Math.abs(totalDr - totalCr) < 0.01, totalDebit: totalDr, totalCredit: totalCr, difference: totalDr - totalCr };
  }
}

export const db = new Store();
