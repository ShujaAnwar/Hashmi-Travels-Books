
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
  
  private save() { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); 
  }

  async fetchFromCloud() {
    try {
      const [ { data: accs }, { data: conts }, { data: vocs }, { data: ents }, { data: recs }, { data: hotels }, { data: tix }, { data: visas }, { data: trans } ] = await Promise.all([
        supabase.from('accounts').select('*'), supabase.from('contacts').select('*'),
        supabase.from('vouchers').select('*'), supabase.from('journal_entries').select('*'),
        supabase.from('receipts').select('*'), supabase.from('hotel_bookings').select('*'),
        supabase.from('ticket_bookings').select('*'), supabase.from('visa_applications').select('*'),
        supabase.from('transport_entries').select('*')
      ]);

      if (accs && accs.length > 0) this.data.accounts = accs.map(a => ({ ...a, type: a.type as AccountType }));
      
      if (conts && conts.length > 0) {
        this.data.customers = conts.filter(c => c.contact_type === 'Customer').map(c => ({ 
          id: c.id, customer_code: c.code, name: c.name, phone: c.phone || '', email: c.email || '', 
          address: c.address || '', city: c.city || '', opening_balance: c.opening_balance || 0, 
          opening_balance_type: 'Receivable', is_active: c.is_active, is_deleted: false, created_at: c.created_at 
        }));
        this.data.vendors = conts.filter(v => v.contact_type === 'Vendor').map(v => ({ 
          id: v.id, vendor_code: v.code, name: v.name, phone: v.phone || '', email: v.email || '', 
          address: v.address || '', city: v.city || '', opening_balance: v.opening_balance || 0, 
          opening_balance_type: 'Payable', is_active: v.is_active, is_deleted: false, created_at: v.created_at 
        }));
      }

      if (vocs) {
        this.data.vouchers = vocs.map(v => ({ 
          ...v, 
          type: v.type as VoucherType, 
          entries: (ents || []).filter(e => e.voucher_id === v.id).map(e => ({
            id: e.id, voucher_id: e.voucher_id, account_id: e.account_id, contact_id: e.contact_id, debit: e.debit, credit: e.credit
          }))
        }));
      }

      if (recs) this.data.receipts = recs;
      if (hotels) this.data.hotelVouchers = hotels;
      if (tix) this.data.ticketVouchers = tix;
      if (visas) this.data.visaVouchers = visas;
      if (trans) this.data.transportVouchers = trans;
      
      this.save();
      return { success: true };
    } catch (error: any) { 
      console.error("Fetch Cloud Error:", error);
      return { success: false, error: error.message }; 
    }
  }

  async syncToCloud() {
    try {
      // 1. Sync Entities first (Parents for accounting)
      if (this.data.accounts.length > 0) {
        await supabase.from('accounts').upsert(this.data.accounts.map(a => ({ id: a.id, title: a.title, type: a.type })));
      }
      
      const contactPayload = [
        ...this.data.customers.map(c => ({ id: c.id, contact_type: 'Customer', name: c.name, code: c.customer_code, phone: c.phone, email: c.email, address: c.address, city: c.city, opening_balance: c.opening_balance, is_active: c.is_active })),
        ...this.data.vendors.map(v => ({ id: v.id, contact_type: 'Vendor', name: v.name, code: v.vendor_code, phone: v.phone, email: v.email, address: v.address, city: v.city, opening_balance: v.opening_balance, is_active: v.is_active }))
      ];
      if (contactPayload.length > 0) await supabase.from('contacts').upsert(contactPayload);

      // 2. Sync Vouchers (The headers)
      if (this.data.vouchers.length > 0) {
        const voucherUpsert = await supabase.from('vouchers').upsert(this.data.vouchers.map(v => ({ 
          id: v.id, 
          voucher_no: v.voucher_no, 
          date: v.date, 
          type: v.type, 
          description: v.description, 
          currency: v.currency, 
          roe: v.roe, 
          total_amount: v.total_amount 
        })));
        
        if (voucherUpsert.error) throw voucherUpsert.error;

        // 3. Sync Journal Entries (Child rows)
        // Ensure every entry has a unique persistent ID
        const allEntries = this.data.vouchers.flatMap(v => v.entries.map(e => ({ 
          id: e.id || `ent-${v.id}-${Math.random()}`, 
          voucher_id: v.id, 
          account_id: e.account_id, 
          contact_id: e.contact_id || null, 
          debit: e.debit, 
          credit: e.credit 
        })));
        if (allEntries.length > 0) {
          const entryUpsert = await supabase.from('journal_entries').upsert(allEntries);
          if (entryUpsert.error) throw entryUpsert.error;
        }
      }
      
      // 4. Sync Specialized Business Modules
      if (this.data.receipts.length > 0) {
        await supabase.from('receipts').upsert(this.data.receipts.map(r => ({
          id: r.id, voucher_id: r.voucher_id, receipt_no: r.receipt_no, date: r.date, type: r.type, 
          customer_id: r.customer_id, vendor_id: r.vendor_id, account_id: r.account_id, 
          amount: r.amount, currency: r.currency, roe: r.roe, narration: r.narration
        })));
      }
      if (this.data.hotelVouchers.length > 0) {
        await supabase.from('hotel_bookings').upsert(this.data.hotelVouchers.map(h => ({
          id: h.id, voucher_id: h.voucher_id, date: h.date, customer_id: h.customer_id, vendor_id: h.vendor_id, 
          pax_name: h.pax_name, hotel_name: h.hotel_name, city: h.city, check_in: h.check_in, check_out: h.check_out, 
          nights: h.nights, rooms: h.rooms, sale_price_pkr: h.sale_price_pkr, buy_price_pkr: h.buy_price_pkr, 
          currency: h.currency, roe: h.roe, profit: h.profit
        })));
      }
      if (this.data.ticketVouchers.length > 0) {
        await supabase.from('ticket_bookings').upsert(this.data.ticketVouchers.map(t => ({
          id: t.id, voucher_id: t.voucher_id, date: t.date, customer_id: t.customer_id, vendor_id: t.vendor_id, 
          pax_name: t.pax_name, airline: t.airline, ticket_no: t.ticket_no, gds_pnr: t.gds_pnr, sector: t.sector, 
          total_sale_pkr: t.total_sale_pkr, total_buy_pkr: t.total_buy_pkr, profit: t.profit
        })));
      }
      if (this.data.visaVouchers.length > 0) {
        await supabase.from('visa_applications').upsert(this.data.visaVouchers.map(v => ({
          id: v.id, voucher_id: v.voucher_id, date: v.date, customer_id: v.customer_id, vendor_id: v.vendor_id, 
          pax_name: v.pax_name, passport_no: v.passport_no, country: v.country, status: v.status, 
          sale_price_pkr: v.sale_price_pkr, buy_price_pkr: v.buy_price_pkr, profit: v.profit
        })));
      }
      if (this.data.transportVouchers.length > 0) {
        await supabase.from('transport_entries').upsert(this.data.transportVouchers.map(t => ({
          id: t.id, voucher_id: t.voucher_id, voucher_no: t.voucher_no, date: t.date, customer_id: t.customer_id, 
          transport_type: t.transport_type, route: t.route, quantity: t.quantity, total_amount: t.total_amount
        })));
      }

      this.data.settings.lastCloudSync = new Date().toISOString();
      this.save();
      return { success: true };
    } catch (error: any) { 
      console.error("Critical Sync Error:", error);
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
      case VoucherType.OPENING: return 'OB';
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

  async addVoucher(v: any) {
    const id = v.id || `voc-${Date.now()}`;
    const newV = { 
      ...v, 
      id, 
      voucher_no: v.voucher_no || this.generateNextVoucherNo(v.type), 
      created_at: new Date().toISOString(), 
      entries: (v.entries || []).map((e: any) => ({ 
        id: e.id || `ent-${id}-${Math.floor(Math.random()*10000)}`,
        ...e, 
        voucher_id: id 
      })) 
    };
    this.data.vouchers.push(newV);
    this.save();
    return await this.syncToCloud();
  }

  async updateVoucher(id: string, updates: any) {
    const idx = this.data.vouchers.findIndex(v => v.id === id);
    if (idx !== -1) {
      this.data.vouchers[idx] = { 
        ...this.data.vouchers[idx], 
        ...updates, 
        entries: (updates.entries || []).map((e: any) => ({ 
          id: e.id || `ent-${id}-${Math.floor(Math.random()*10000)}`, 
          ...e, 
          voucher_id: id 
        })) 
      };
      this.save();
      return await this.syncToCloud();
    }
    return { success: false, error: 'Voucher not found' };
  }

  async addReceipt(r: any, entries: any[]) {
    const receiptNo = this.generateNextVoucherNo(VoucherType.RECEIPT);
    const vocId = `voc-rec-${Date.now()}`;
    const accVoucher = {
      id: vocId,
      voucher_no: receiptNo, date: r.date, type: VoucherType.RECEIPT,
      description: r.narration, total_amount: r.amount, currency: r.currency, roe: r.roe,
      created_at: new Date().toISOString(),
      entries: entries.map(e => ({ ...e, id: `ent-${vocId}-${Math.random()}`, voucher_id: vocId }))
    };
    this.data.vouchers.push(accVoucher);
    const newR = { ...r, id: `rec-${Date.now()}`, receipt_no: receiptNo, voucher_id: vocId, created_at: new Date().toISOString() };
    this.data.receipts.push(newR);
    this.save();
    return await this.syncToCloud();
  }

  async deleteReceipt(id: string) {
    const rIdx = this.data.receipts.findIndex(r => r.id === id);
    if (rIdx !== -1) {
      const r = this.data.receipts[rIdx];
      this.data.vouchers = this.data.vouchers.filter(v => v.id !== r.voucher_id);
      this.data.receipts.splice(rIdx, 1);
      this.save();
      return await this.syncToCloud();
    }
    return { success: false };
  }

  async addHotelVoucher(h: any, entries: any[]) {
    const vocId = `voc-hotel-${Date.now()}`;
    const voucher = {
      id: vocId,
      voucher_no: this.generateNextVoucherNo(VoucherType.HOTEL),
      date: h.date, type: VoucherType.HOTEL, description: `Hotel Booking: ${h.pax_name} @ ${h.hotel_name}`,
      total_amount: h.sale_price_pkr, currency: h.currency, roe: h.roe,
      created_at: new Date().toISOString(),
      entries: entries.map(e => ({ ...e, id: `ent-${vocId}-${Math.random()}`, voucher_id: vocId }))
    };
    this.data.vouchers.push(voucher);
    const newH = { ...h, id: `hotel-${Date.now()}`, voucher_id: vocId };
    this.data.hotelVouchers.push(newH);
    this.save();
    return await this.syncToCloud();
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
      return await this.syncToCloud();
    }
    return { success: false };
  }

  async addTicketVoucher(t: any, entries: any[]) {
    const vocId = `voc-tix-${Date.now()}`;
    const voucher = {
      id: vocId,
      voucher_no: this.generateNextVoucherNo(VoucherType.TICKET),
      date: t.date, type: VoucherType.TICKET, description: `Ticket: ${t.pax_name} / ${t.ticket_no}`,
      total_amount: t.total_sale_pkr, currency: t.currency || 'PKR', roe: t.roe || 1,
      created_at: new Date().toISOString(),
      entries: entries.map(e => ({ ...e, id: `ent-${vocId}-${Math.random()}`, voucher_id: vocId }))
    };
    this.data.vouchers.push(voucher);
    const newT = { ...t, id: `tix-${Date.now()}`, voucher_id: vocId };
    this.data.ticketVouchers.push(newT);
    this.save();
    return await this.syncToCloud();
  }

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
      return await this.syncToCloud();
    }
    return { success: false };
  }

  async addVisaVoucher(v: any, entries: any[]) {
    const vocId = `voc-visa-${Date.now()}`;
    const voucher = {
      id: vocId,
      voucher_no: this.generateNextVoucherNo(VoucherType.VISA),
      date: v.date, type: VoucherType.VISA, description: `Visa: ${v.pax_name} / ${v.country}`,
      total_amount: v.sale_price_pkr, currency: v.currency || 'PKR', roe: v.roe || 1,
      created_at: new Date().toISOString(),
      entries: entries.map(e => ({ ...e, id: `ent-${vocId}-${Math.random()}`, voucher_id: vocId }))
    };
    this.data.vouchers.push(voucher);
    const newV = { ...v, id: `visa-${Date.now()}`, voucher_id: vocId };
    this.data.visaVouchers.push(newV);
    this.save();
    return await this.syncToCloud();
  }

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
      return await this.syncToCloud();
    }
    return { success: false };
  }

  async addTransportVoucher(t: any, entries: any[]) {
    const vocId = `voc-trans-${Date.now()}`;
    const vno = this.generateNextVoucherNo(VoucherType.TRANSPORT);
    const voucher = {
      id: vocId,
      voucher_no: vno,
      date: t.date, type: VoucherType.TRANSPORT, description: t.narration,
      total_amount: t.total_amount, currency: t.currency || 'PKR', roe: t.roe || 1,
      created_at: new Date().toISOString(),
      entries: entries.map(e => ({ ...e, id: `ent-${vocId}-${Math.random()}`, voucher_id: vocId }))
    };
    this.data.vouchers.push(voucher);
    const newT = { ...t, id: `trans-${Date.now()}`, voucher_id: vocId, voucher_no: vno };
    this.data.transportVouchers.push(newT);
    this.save();
    return await this.syncToCloud();
  }

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
      return await this.syncToCloud();
    }
    return { success: false };
  }

  getPartyLedger(partyId: string, partyType: 'Customer' | 'Vendor', fromDate?: string, toDate?: string) {
    const party = partyType === 'Customer' ? this.getCustomer(partyId) : this.getVendor(partyId);
    let openingBalance = 0;
    
    if (party) {
        const ob = party.opening_balance || 0;
        openingBalance = party.opening_balance_type === 'Receivable' ? ob : -ob;
        if (partyType === 'Vendor') openingBalance = -openingBalance;
    }

    const entries = this.data.vouchers.flatMap(v => (v.entries || []).filter(e => e.contact_id === partyId).map(e => ({ ...e, date: v.date, voucher_no: v.voucher_no, description: v.description, type: v.type, currency: v.currency, roe: v.roe }))).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningBalance = openingBalance;
    const filtered: any[] = [];

    entries.forEach(e => {
      const entryDate = new Date(e.date);
      const net = partyType === 'Customer' ? (e.debit - e.credit) : (e.credit - e.debit);
      
      if (fromDate && entryDate < new Date(fromDate)) {
          openingBalance += net;
          runningBalance += net;
      } else if (!toDate || entryDate <= new Date(toDate)) {
        runningBalance += net;
        filtered.push({ ...e, balance: runningBalance });
      }
    });

    return { partyName: party?.name || 'Unknown', openingBalance, transactions: filtered, closingBalance: runningBalance };
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
    return { accountName: acc?.title || 'Unknown', accountType: acc?.type, openingBalance, transactions: filtered, closingBalance: openingBalance + filtered.reduce((s, t) => s + (t.debit - t.credit), 0) };
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
  getAuditLogs() { return this.data.auditLogs; }
  
  async updateSettings(s: any) { 
    this.data.settings = { ...this.data.settings, ...s }; 
    this.save(); 
  }
  
  async addCustomer(c: any) { 
    const id = `cust-${Date.now()}`;
    this.data.customers.push({ 
      ...c, id, 
      customer_code: `C${this.data.customers.length + 1}`, 
      is_deleted: false, created_at: new Date().toISOString() 
    }); 

    // Create Opening Balance Double-Entry impact
    if (c.opening_balance > 0) {
      const obType = c.opening_balance_type === 'Receivable' ? 'Debit' : 'Credit';
      const equityAcc = this.data.accounts.find(a => a.id === 'acc-11');
      const receivableAcc = this.data.accounts.find(a => a.type === AccountType.RECEIVABLE);
      if (equityAcc && receivableAcc) {
         await this.addVoucher({
            date: new Date().toISOString().split('T')[0],
            type: VoucherType.OPENING,
            description: `Opening Balance for ${c.name}`,
            total_amount: c.opening_balance,
            currency: 'PKR',
            roe: 1,
            entries: [
               { account_id: receivableAcc.id, contact_id: id, debit: obType === 'Debit' ? c.opening_balance : 0, credit: obType === 'Credit' ? c.opening_balance : 0 },
               { account_id: equityAcc.id, debit: obType === 'Credit' ? c.opening_balance : 0, credit: obType === 'Debit' ? c.opening_balance : 0 }
            ]
         });
      }
    }

    this.save(); 
    return await this.syncToCloud(); 
  }
  
  async updateCustomer(id: string, u: any) { 
    const i = this.data.customers.findIndex(c => c.id === id); 
    if (i !== -1) { 
      this.data.customers[i] = { ...this.data.customers[i], ...u }; 
      this.save(); 
      return await this.syncToCloud(); 
    } 
  }
  
  async deleteCustomer(id: string) {
    const hasTransactions = this.data.vouchers.some(v => v.entries.some(e => e.contact_id === id));
    if (hasTransactions) throw new Error("Cannot delete entity with transaction history. Deactivate instead.");
    this.data.customers = this.data.customers.filter(c => c.id !== id);
    this.save();
    return await this.syncToCloud();
  }
  
  async addVendor(v: any) { 
    const id = `vend-${Date.now()}`;
    this.data.vendors.push({ 
      ...v, id, 
      vendor_code: `V${this.data.vendors.length + 1}`, 
      is_deleted: false, created_at: new Date().toISOString() 
    }); 

    // Create Opening Balance Double-Entry impact
    if (v.opening_balance > 0) {
      const equityAcc = this.data.accounts.find(a => a.id === 'acc-11');
      const payableAcc = this.data.accounts.find(a => a.type === AccountType.PAYABLE);
      if (equityAcc && payableAcc) {
         await this.addVoucher({
            date: new Date().toISOString().split('T')[0],
            type: VoucherType.OPENING,
            description: `Opening Balance for Vendor: ${v.name}`,
            total_amount: v.opening_balance,
            currency: 'PKR',
            roe: 1,
            entries: [
               { account_id: payableAcc.id, contact_id: id, debit: 0, credit: v.opening_balance },
               { account_id: equityAcc.id, debit: v.opening_balance, credit: 0 }
            ]
         });
      }
    }

    this.save(); 
    return await this.syncToCloud(); 
  }
  
  async updateVendor(id: string, u: any) { 
    const i = this.data.vendors.findIndex(v => v.id === id); 
    if (i !== -1) { 
      this.data.vendors[i] = { ...this.data.vendors[i], ...u }; 
      this.save(); 
      return await this.syncToCloud(); 
    } 
  }
  
  async deleteVendor(id: string) {
    const hasTransactions = this.data.vouchers.some(v => v.entries.some(e => e.contact_id === id));
    if (hasTransactions) throw new Error("Cannot delete entity with transaction history. Deactivate instead.");
    this.data.vendors = this.data.vendors.filter(v => v.id !== id);
    this.save();
    return await this.syncToCloud();
  }
  
  async addAccount(a: any) { 
    this.data.accounts.push({ 
      ...a, id: `acc-${Date.now()}`, 
      created_at: new Date().toISOString() 
    }); 
    this.save(); 
    return await this.syncToCloud(); 
  }
  
  async updateAccount(id: string, u: any) { 
    const i = this.data.accounts.findIndex(a => a.id === id); 
    if (i !== -1) { 
      this.data.accounts[i] = { ...this.data.accounts[i], ...u }; 
      this.save(); 
      return await this.syncToCloud(); 
    } 
  }
  
  async deleteAccount(id: string) { 
    this.data.accounts = this.data.accounts.filter(a => a.id !== id); 
    this.save(); 
    return await this.syncToCloud(); 
  }
  
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
  
  verifyAccountingIntegrity() { 
    const tb = this.getTrialBalance(); 
    const dr = tb.reduce((s,a)=>s+a.debit,0), cr = tb.reduce((s,a)=>s+a.credit,0); 
    return { balanced: Math.abs(dr-cr)<0.01, totalDebit: dr, totalCredit: cr, difference: dr-cr }; 
  }
  
  exportDatabase() { return JSON.stringify(this.data); }
  
  importDatabase(j: string) { 
    try { 
      this.data = JSON.parse(j); 
      this.save(); 
      return true; 
    } catch(e) { return false; } 
  }
  
  resetDatabase() { 
    localStorage.removeItem(STORAGE_KEY); 
    window.location.reload(); 
  }
}

export const db = new Store();
