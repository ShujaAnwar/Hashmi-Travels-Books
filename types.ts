
export type UserRole = 'Admin' | 'Accountant' | 'User';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export type OpeningBalanceType = 'Receivable' | 'Payable' | 'Advance';
export type Currency = 'PKR' | 'SAR' | 'USD';

export interface AppSettings {
  appName: string;
  corporateName: string;
  tagline: string;
  logoBase64?: string;
  address: string;
  phone: string;
  cell: string;
  email: string;
  website: string;
  defaultROE: number;
  bankName: string;
  bankAccountTitle: string;
  bankIBAN: string;
  lastBackupDate?: string;
  cloudSyncEnabled?: boolean;
  lastCloudSync?: string;
}

export interface AuditLog {
  id: string;
  record_id: string;
  module: string;
  old_data: any;
  new_data: any;
  edited_by: string;
  edited_at: string;
  remarks?: string;
}

export interface Customer {
  id: string;
  customer_code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  opening_balance: number;
  opening_balance_type: OpeningBalanceType;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
}

export interface Vendor {
  id: string;
  vendor_code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  opening_balance: number;
  opening_balance_type: OpeningBalanceType;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
}

export enum AccountType {
  CASH = 'Cash',
  BANK = 'Bank',
  INCOME = 'Income',
  EXPENSE = 'Expense',
  RECEIVABLE = 'Receivable',
  PAYABLE = 'Payable',
  EQUITY = 'Equity'
}

export interface Account {
  id: string;
  title: string;
  type: AccountType;
  created_at: string;
}

export enum VoucherType {
  CASH = 'Cash',
  BANK = 'Bank',
  SALES = 'Sales',
  PURCHASE = 'Purchase',
  JOURNAL = 'Journal',
  HOTEL = 'Hotel',
  RECEIPT = 'Receipt',
  TRANSPORT = 'Transport',
  TICKET = 'Ticket',
  VISA = 'Visa',
  OPENING = 'Opening'
}

export interface VoucherEntry {
  id: string;
  voucher_id: string;
  account_id: string;
  contact_id?: string;
  debit: number;
  credit: number;
}

export interface Voucher {
  id: string;
  voucher_no: string;
  date: string;
  type: VoucherType;
  description: string;
  total_amount: number;
  currency: Currency;
  roe: number;
  created_at: string;
  entries: VoucherEntry[];
}

export interface HotelVoucher {
  id: string;
  voucher_id: string;
  date: string;
  customer_id: string;
  vendor_id: string;
  pax_name: string;
  hotel_name: string;
  country: string;
  city: string;
  check_in: string;
  check_out: string;
  nights: number;
  rooms: number;
  room_type: string;
  meal: string;
  adults: number;
  children: number;
  sale_price_pkr: number;
  buy_price_pkr: number;
  profit: number;
  currency: Currency;
  roe: number;
  confirmation_no?: string;
  option_date?: string;
  destination?: string;
  sale_rate_sar?: number;
  sale_total_sar?: number;
  sale_rate_usd?: number;
  sale_total_usd?: number;
}

export interface TicketVoucher {
  id: string;
  voucher_id: string;
  date: string;
  customer_id: string;
  vendor_id: string;
  pax_name: string;
  airline: string;
  ticket_no: string;
  gds_pnr: string;
  sector: string;
  trip_date: string;
  base_fare: number;
  taxes: number;
  service_fee: number;
  total_sale_pkr: number;
  total_buy_pkr: number;
  profit: number;
  currency: Currency;
  roe: number;
}

export type VisaStatus = 'Pending' | 'Applied' | 'Approved' | 'Rejected' | 'Delivered';

export interface VisaVoucher {
  id: string;
  voucher_id: string;
  date: string;
  customer_id: string;
  vendor_id: string;
  pax_name: string;
  passport_no: string;
  visa_type: string;
  country: string;
  submission_date: string;
  expiry_date?: string;
  status: VisaStatus;
  sale_price_pkr: number;
  buy_price_pkr: number;
  profit: number;
  currency: Currency;
  roe: number;
}

export interface TransportVoucher {
  id: string;
  voucher_id: string;
  voucher_no: string;
  date: string;
  customer_id: string;
  transport_type: string;
  route: string;
  vehicle_no?: string;
  driver_name?: string;
  trip_date: string;
  quantity: number;
  rate: number;
  total_amount: number;
  currency: Currency;
  roe: number;
  narration: string;
  created_at: string;
}

export type ReceiptSourceType = 'Customer' | 'Vendor' | 'Other';

export interface Receipt {
  id: string;
  voucher_id: string;
  receipt_no: string;
  date: string;
  type: ReceiptSourceType;
  customer_id?: string;
  vendor_id?: string;
  account_id: string;
  amount: number;
  currency: Currency;
  roe: number;
  narration: string;
  created_at: string;
}