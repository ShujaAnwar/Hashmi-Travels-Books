
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
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
import { db } from './store';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedLedgerId, setSelectedLedgerId] = useState<string | null>(null);
  
  // States for Editing/Cloning
  const [clonedTicketData, setClonedTicketData] = useState<any>(null);
  const [editingTicketData, setEditingTicketData] = useState<any>(null);
  const [clonedVisaData, setClonedVisaData] = useState<any>(null);
  const [editingVisaData, setEditingVisaData] = useState<any>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('ui-theme') as any) || 'light');
  const [isCompact, setIsCompact] = useState<boolean>(() => localStorage.getItem('ui-compact') === 'true');

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

  const renderContent = () => {
    if (activePage === 'customer-ledger-view' && selectedLedgerId) {
      return <PartyLedger isCompact={isCompact} partyId={selectedLedgerId} partyType="Customer" onBack={() => setActivePage('customers')} onPrint={() => {}} />;
    }
    if (activePage === 'vendor-ledger-view' && selectedLedgerId) {
      return <PartyLedger isCompact={isCompact} partyId={selectedLedgerId} partyType="Vendor" onBack={() => setActivePage('vendors')} onPrint={() => {}} />;
    }

    switch (activePage) {
      case 'dashboard': return <Dashboard isCompact={isCompact} />;
      case 'tickets': return <TicketVoucherList isCompact={isCompact} onNew={() => { setClonedTicketData(null); setEditingTicketData(null); setActivePage('ticket-new'); }} onEdit={(id) => { const v = db.getTicketVouchers().find(x => x.id === id); setEditingTicketData(v); setActivePage('ticket-new'); }} onClone={(id) => { const v = db.getTicketVouchers().find(x => x.id === id); setClonedTicketData(v); setActivePage('ticket-new'); }} />;
      case 'ticket-new': return <TicketVoucherEntry isCompact={isCompact} initialData={clonedTicketData} editingData={editingTicketData} onComplete={() => setActivePage('tickets')} />;
      case 'visas': return <VisaVoucherList isCompact={isCompact} onNew={() => { setClonedVisaData(null); setEditingVisaData(null); setActivePage('visa-new'); }} onEdit={(id) => { const v = db.getVisaVouchers().find(x => x.id === id); setEditingVisaData(v); setActivePage('visa-new'); }} onClone={(id) => { const v = db.getVisaVouchers().find(x => x.id === id); setClonedVisaData(v); setActivePage('visa-new'); }} />;
      case 'visa-new': return <VisaVoucherEntry isCompact={isCompact} initialData={clonedVisaData} editingData={editingVisaData} onComplete={() => setActivePage('visas')} />;
      case 'hotel-vouchers': return <HotelVoucherList isCompact={isCompact} onNew={() => setActivePage('hotel-voucher-new')} onView={() => {}} onClone={() => {}} onEdit={() => {}} />;
      case 'hotel-voucher-new': return <HotelVoucherEntry isCompact={isCompact} onComplete={() => setActivePage('hotel-vouchers')} />;
      case 'receipts': return <ReceiptList onNew={() => setActivePage('receipt-new')} onPrint={() => {}} onClone={() => {}} onEdit={() => {}} />;
      case 'receipt-new': return <ReceiptEntry onComplete={() => setActivePage('receipts')} onBack={() => setActivePage('receipts')} />;
      case 'customers': return <CustomerList isCompact={isCompact} onViewLedger={handleViewCustomerLedger} onPrintLedger={() => {}} />;
      case 'vendors': return <VendorList onViewLedger={handleViewVendorLedger} onPrintLedger={() => {}} />;
      case 'accounts': return <AccountList isCompact={isCompact} onViewLedger={() => {}} />;
      case 'reports': return <Reports isCompact={isCompact} />;
      case 'security': return <Security isCompact={isCompact} />;
      default: return <Dashboard isCompact={isCompact} />;
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} theme={theme} setTheme={setTheme} isCompact={isCompact} setIsCompact={setIsCompact}>
      {renderContent()}
    </Layout>
  );
};

export default App;
