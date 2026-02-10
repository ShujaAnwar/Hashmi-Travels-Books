
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VoucherList from './pages/VoucherList';
import VoucherEntry from './pages/VoucherEntry';
import HotelVoucherEntry from './pages/HotelVoucherEntry';
import HotelVoucherList from './pages/HotelVoucherList';
import TicketVoucherList from './pages/TicketVoucherList';
import TicketVoucherEntry from './pages/TicketVoucherEntry';
import VisaVoucherList from './pages/VisaVoucherList';
import VisaVoucherEntry from './pages/VisaVoucherEntry';
import ReceiptList from './pages/ReceiptList';
import ReceiptEntry from './pages/ReceiptEntry';
import TransportVoucherList from './pages/TransportVoucherList';
import TransportVoucherEntry from './pages/TransportVoucherEntry';
import Reports from './pages/Reports';
import CustomerList from './pages/CustomerList';
import VendorList from './pages/VendorList';
import AccountList from './pages/AccountList';
import Security from './pages/Security';
import PartyLedger from './pages/PartyLedger';
import PrintHotelVoucher from './pages/PrintHotelVoucher';
import PrintHotelInvoicePKR from './pages/PrintHotelInvoicePKR';
import PrintHotelVoucherSAR from './pages/PrintHotelVoucherSAR';
import PrintHotelInvoiceUSD from './pages/PrintHotelInvoiceUSD';
import PrintJournalVoucher from './pages/PrintJournalVoucher';
import PrintCustomerLedger from './pages/PrintCustomerLedger';
import PrintVendorLedger from './pages/PrintVendorLedger';
import PrintReceipt from './pages/PrintReceipt';
import PrintTransportVoucher from './pages/PrintTransportVoucher';
import Login from './components/Login';
import CPanel from './pages/CPanel';
import { db } from './store';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  
  // Re-rendering trigger for store updates
  const [storeTick, setStoreTick] = useState(0);

  const [selectedLedgerId, setSelectedLedgerId] = useState<string | null>(null);
  const [selectedPrintId, setSelectedPrintId] = useState<string | null>(null);
  
  const [clonedTicketData, setClonedTicketData] = useState<any>(null);
  const [editingTicketData, setEditingTicketData] = useState<any>(null);
  const [clonedVisaData, setClonedVisaData] = useState<any>(null);
  const [editingVisaData, setEditingVisaData] = useState<any>(null);
  const [clonedVoucherData, setClonedVoucherData] = useState<any>(null);
  const [editingVoucherData, setEditingVoucherData] = useState<any>(null);
  const [clonedTransportData, setClonedTransportData] = useState<any>(null);
  const [editingTransportData, setEditingTransportData] = useState<any>(null);
  const [clonedReceiptData, setClonedReceiptData] = useState<any>(null);
  const [editingReceiptData, setEditingReceiptData] = useState<any>(null);
  
  const [clonedHotelData, setClonedHotelData] = useState<any>(null);
  const [editingHotelData, setEditingHotelData] = useState<any>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [hotelPrintVariant, setHotelPrintVariant] = useState<'PKR' | 'SAR' | 'USD' | 'BOOKING' | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('ui-theme') as any) || 'light');
  const [isCompact, setIsCompact] = useState<boolean>(() => localStorage.getItem('ui-compact') === 'true');

  useEffect(() => {
    // Auth detection
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        syncDatabase();
      } else {
        setInitialized(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) syncDatabase();
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncDatabase = async () => {
    setIsSyncing(true);
    await db.fetchFromCloud();
    setIsSyncing(false);
    setInitialized(true);
    setStoreTick(t => t + 1); // Force refresh UI with cloud data
  };

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('ui-theme', theme);
  }, [theme]);

  const handleViewCustomerLedger = (id: string) => {
    setSelectedLedgerId(id);
    setActivePage('customer-ledger-view');
  };

  const handleViewVendorLedger = (id: string) => {
    setSelectedLedgerId(id);
    setActivePage('vendor-ledger-view');
  };

  if (!initialized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Synchronizing Cloud Repository...</p>
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={() => {}} />;
  }

  const handleComplete = (targetPage: string) => {
    // Force a UI tick to show the new record from local storage immediately
    setStoreTick(t => t + 1);
    setActivePage(targetPage);
  };

  const renderContent = () => {
    if (activePage === 'print-customer-ledger' && selectedLedgerId) {
      return <PrintCustomerLedger id={selectedLedgerId} onBack={() => setActivePage('customer-ledger-view')} />;
    }
    if (activePage === 'print-vendor-ledger' && selectedLedgerId) {
      return <PrintVendorLedger id={selectedLedgerId} onBack={() => setActivePage('vendor-ledger-view')} />;
    }
    if (activePage === 'print-journal' && selectedPrintId) {
      return <PrintJournalVoucher id={selectedPrintId} onBack={() => setActivePage('vouchers')} />;
    }
    if (activePage === 'print-receipt' && selectedPrintId) {
      return <PrintReceipt id={selectedPrintId} onBack={() => setActivePage('receipts')} />;
    }
    if (activePage === 'print-transport' && selectedPrintId) {
      return <PrintTransportVoucher id={selectedPrintId} onBack={() => setActivePage('transport-vouchers')} />;
    }

    if (activePage === 'customer-ledger-view' && selectedLedgerId) {
      return <PartyLedger key={`cust-${storeTick}`} isCompact={isCompact} partyId={selectedLedgerId} partyType="Customer" onBack={() => setActivePage('customers')} onPrint={() => setActivePage('print-customer-ledger')} />;
    }
    if (activePage === 'vendor-ledger-view' && selectedLedgerId) {
      return <PartyLedger key={`vend-${storeTick}`} isCompact={isCompact} partyId={selectedLedgerId} partyType="Vendor" onBack={() => setActivePage('vendors')} onPrint={() => setActivePage('print-vendor-ledger')} />;
    }

    if (activePage === 'hotel-view' && selectedHotelId) {
      switch(hotelPrintVariant) {
        case 'BOOKING': return <PrintHotelVoucher id={selectedHotelId} onBack={() => setActivePage('hotel-vouchers')} />;
        case 'PKR': return <PrintHotelInvoicePKR id={selectedHotelId} onBack={() => setActivePage('hotel-vouchers')} />;
        case 'SAR': return <PrintHotelVoucherSAR id={selectedHotelId} onBack={() => setActivePage('hotel-vouchers')} />;
        case 'USD': return <PrintHotelInvoiceUSD id={selectedHotelId} onBack={() => setActivePage('hotel-vouchers')} />;
        default: return <PrintHotelVoucher id={selectedHotelId} onBack={() => setActivePage('hotel-vouchers')} />;
      }
    }

    switch (activePage) {
      case 'dashboard': return <Dashboard key={`dash-${storeTick}`} isCompact={isCompact} />;
      case 'vouchers': return <VoucherList key={`vocs-${storeTick}`} isCompact={isCompact} onNew={() => { setClonedVoucherData(null); setEditingVoucherData(null); setActivePage('voucher-new'); }} onEdit={(id) => { const v = db.getVouchers().find(x => x.id === id); setEditingVoucherData(v); setActivePage('voucher-new'); }} onClone={(id) => { const v = db.getVouchers().find(x => x.id === id); setClonedVoucherData(v); setActivePage('voucher-new'); }} onPrint={(id) => { setSelectedPrintId(id); setActivePage('print-journal'); }} />;
      case 'voucher-new': return <VoucherEntry onComplete={() => handleComplete('vouchers')} initialData={clonedVoucherData} editingData={editingVoucherData} />;
      case 'tickets': return <TicketVoucherList key={`tix-${storeTick}`} isCompact={isCompact} onNew={() => { setClonedTicketData(null); setEditingTicketData(null); setActivePage('ticket-new'); }} onEdit={(id) => { const v = db.getTicketVouchers().find(x => x.id === id); setEditingTicketData(v); setActivePage('ticket-new'); }} onClone={(id) => { const v = db.getTicketVouchers().find(x => x.id === id); setClonedTicketData(v); setActivePage('ticket-new'); }} />;
      case 'ticket-new': return <TicketVoucherEntry isCompact={isCompact} initialData={clonedTicketData} editingData={editingTicketData} onComplete={() => handleComplete('tickets')} />;
      case 'visas': return <VisaVoucherList key={`visa-${storeTick}`} isCompact={isCompact} onNew={() => { setClonedVisaData(null); setEditingVisaData(null); setActivePage('visa-new'); }} onEdit={(id) => { const v = db.getVisaVouchers().find(x => x.id === id); setEditingVisaData(v); setActivePage('visa-new'); }} onClone={(id) => { const v = db.getVisaVouchers().find(x => x.id === id); setClonedVisaData(v); setActivePage('visa-new'); }} />;
      case 'visa-new': return <VisaVoucherEntry isCompact={isCompact} initialData={clonedVisaData} editingData={editingVisaData} onComplete={() => handleComplete('visas')} />;
      case 'hotel-vouchers': return <HotelVoucherList key={`hotel-${storeTick}`} isCompact={isCompact} onNew={() => { setClonedHotelData(null); setEditingHotelData(null); setActivePage('hotel-voucher-new'); }} onView={(id, variant) => { setSelectedHotelId(id); setHotelPrintVariant(variant); setActivePage('hotel-view'); }} onClone={(id) => { const v = db.getHotelVouchers().find(x => x.id === id); setClonedHotelData(v); setEditingHotelData(null); setActivePage('hotel-voucher-new'); }} onEdit={(id) => { const v = db.getHotelVouchers().find(x => x.id === id); setEditingHotelData(v); setClonedHotelData(null); setActivePage('hotel-voucher-new'); }} />;
      case 'hotel-voucher-new': return <HotelVoucherEntry isCompact={isCompact} onComplete={() => handleComplete('hotel-vouchers')} initialData={clonedHotelData} editingData={editingHotelData} />;
      case 'transport-vouchers': return <TransportVoucherList key={`trans-${storeTick}`} onNew={() => { setClonedTransportData(null); setEditingTransportData(null); setActivePage('transport-voucher-new'); }} onEdit={(id) => { const v = db.getTransportVouchers().find(x => x.id === id); setEditingTransportData(v); setActivePage('transport-voucher-new'); }} onClone={(id) => { const v = db.getTransportVouchers().find(x => x.id === id); setClonedTransportData(v); setActivePage('transport-voucher-new'); }} onPrint={(id) => { setSelectedPrintId(id); setActivePage('print-transport'); }} />;
      case 'transport-voucher-new': return <TransportVoucherEntry onComplete={() => handleComplete('transport-vouchers')} onBack={() => setActivePage('transport-vouchers')} initialData={clonedTransportData} editingData={editingTransportData} />;
      case 'receipts': return <ReceiptList key={`rec-${storeTick}`} onNew={() => { setClonedReceiptData(null); setEditingReceiptData(null); setActivePage('receipt-new'); }} onPrint={(id) => { setSelectedPrintId(id); setActivePage('print-receipt'); }} onClone={(r) => { setClonedReceiptData(r); setEditingReceiptData(null); setActivePage('receipt-new'); }} onEdit={(r) => { setEditingReceiptData(r); setClonedReceiptData(null); setActivePage('receipt-new'); }} />;
      case 'receipt-new': return <ReceiptEntry initialData={clonedReceiptData} editingData={editingReceiptData} onComplete={() => handleComplete('receipts')} onBack={() => setActivePage('receipts')} />;
      case 'customers': return <CustomerList key={`custl-${storeTick}`} isCompact={isCompact} onViewLedger={handleViewCustomerLedger} onPrintLedger={(id) => { setSelectedLedgerId(id); setActivePage('print-customer-ledger'); }} />;
      case 'vendors': return <VendorList key={`vendl-${storeTick}`} isCompact={isCompact} onViewLedger={handleViewVendorLedger} onPrintLedger={(id) => { setSelectedLedgerId(id); setActivePage('print-vendor-ledger'); }} />;
      case 'accounts': return <AccountList key={`accl-${storeTick}`} isCompact={isCompact} onViewLedger={() => {}} />;
      case 'reports': return <Reports isCompact={isCompact} />;
      case 'cpanel': return <CPanel isCompact={isCompact} />;
      case 'security': return <Security isCompact={isCompact} />;
      default: return <Dashboard isCompact={isCompact} />;
    }
  };

  return (
    <Layout 
      activePage={activePage} 
      setActivePage={setActivePage} 
      theme={theme} 
      setTheme={setTheme} 
      isCompact={isCompact} 
      setIsCompact={setIsCompact}
      userEmail={session?.user?.email}
      isSyncing={isSyncing}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
