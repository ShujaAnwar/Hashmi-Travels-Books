
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
import { db } from './store';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedLedgerId, setSelectedLedgerId] = useState<string | null>(null);
  
  // States for Editing/Cloning
  const [clonedTicketData, setClonedTicketData] = useState<any>(null);
  const [editingTicketData, setEditingTicketData] = useState<any>(null);
  const [clonedVisaData, setClonedVisaData] = useState<any>(null);
  const [editingVisaData, setEditingVisaData] = useState<any>(null);
  const [clonedVoucherData, setClonedVoucherData] = useState<any>(null);
  const [editingVoucherData, setEditingVoucherData] = useState<any>(null);
  const [clonedTransportData, setClonedTransportData] = useState<any>(null);
  const [editingTransportData, setEditingTransportData] = useState<any>(null);
  
  // Hotel Specific States
  const [clonedHotelData, setClonedHotelData] = useState<any>(null);
  const [editingHotelData, setEditingHotelData] = useState<any>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [hotelPrintVariant, setHotelPrintVariant] = useState<'PKR' | 'SAR' | 'USD' | 'BOOKING' | null>(null);

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

    // Hotel View Routing
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
      case 'dashboard': return <Dashboard isCompact={isCompact} />;
      
      // Manual Vouchers
      case 'vouchers': return <VoucherList isCompact={isCompact} onNew={() => { setClonedVoucherData(null); setEditingVoucherData(null); setActivePage('voucher-new'); }} onEdit={(id) => { const v = db.getVouchers().find(x => x.id === id); setEditingVoucherData(v); setActivePage('voucher-new'); }} onClone={(id) => { const v = db.getVouchers().find(x => x.id === id); setClonedVoucherData(v); setActivePage('voucher-new'); }} onPrint={() => {}} />;
      case 'voucher-new': return <VoucherEntry onComplete={() => setActivePage('vouchers')} initialData={clonedVoucherData} editingData={editingVoucherData} />;
      
      // Tickets
      case 'tickets': return <TicketVoucherList isCompact={isCompact} onNew={() => { setClonedTicketData(null); setEditingTicketData(null); setActivePage('ticket-new'); }} onEdit={(id) => { const v = db.getTicketVouchers().find(x => x.id === id); setEditingTicketData(v); setActivePage('ticket-new'); }} onClone={(id) => { const v = db.getTicketVouchers().find(x => x.id === id); setClonedTicketData(v); setActivePage('ticket-new'); }} />;
      case 'ticket-new': return <TicketVoucherEntry isCompact={isCompact} initialData={clonedTicketData} editingData={editingTicketData} onComplete={() => setActivePage('tickets')} />;
      
      // Visas
      case 'visas': return <VisaVoucherList isCompact={isCompact} onNew={() => { setClonedVisaData(null); setEditingVisaData(null); setActivePage('visa-new'); }} onEdit={(id) => { const v = db.getVisaVouchers().find(x => x.id === id); setEditingVisaData(v); setActivePage('visa-new'); }} onClone={(id) => { const v = db.getVisaVouchers().find(x => x.id === id); setClonedVisaData(v); setActivePage('visa-new'); }} />;
      case 'visa-new': return <VisaVoucherEntry isCompact={isCompact} initialData={clonedVisaData} editingData={editingVisaData} onComplete={() => setActivePage('visas')} />;
      
      // Hotels
      case 'hotel-vouchers': return <HotelVoucherList 
          isCompact={isCompact} 
          onNew={() => { setClonedHotelData(null); setEditingHotelData(null); setActivePage('hotel-voucher-new'); }} 
          onView={(id, variant) => { setSelectedHotelId(id); setHotelPrintVariant(variant); setActivePage('hotel-view'); }} 
          onClone={(id) => { const v = db.getHotelVouchers().find(x => x.id === id); setClonedHotelData(v); setEditingHotelData(null); setActivePage('hotel-voucher-new'); }} 
          onEdit={(id) => { const v = db.getHotelVouchers().find(x => x.id === id); setEditingHotelData(v); setClonedHotelData(null); setActivePage('hotel-voucher-new'); }} 
        />;
      case 'hotel-voucher-new': return <HotelVoucherEntry isCompact={isCompact} onComplete={() => setActivePage('hotel-vouchers')} initialData={clonedHotelData} editingData={editingHotelData} />;
      
      // Transport
      case 'transport-vouchers': return <TransportVoucherList onNew={() => { setClonedTransportData(null); setEditingTransportData(null); setActivePage('transport-voucher-new'); }} onEdit={(id) => { const v = db.getTransportVouchers().find(x => x.id === id); setEditingTransportData(v); setActivePage('transport-voucher-new'); }} onClone={(id) => { const v = db.getTransportVouchers().find(x => x.id === id); setClonedTransportData(v); setActivePage('transport-voucher-new'); }} onPrint={() => {}} />;
      case 'transport-voucher-new': return <TransportVoucherEntry onComplete={() => setActivePage('transport-vouchers')} onBack={() => setActivePage('transport-vouchers')} initialData={clonedTransportData} editingData={editingTransportData} />;
      
      // Receipts
      case 'receipts': return <ReceiptList onNew={() => setActivePage('receipt-new')} onPrint={() => {}} onClone={() => {}} onEdit={() => {}} />;
      case 'receipt-new': return <ReceiptEntry onComplete={() => setActivePage('receipts')} onBack={() => setActivePage('receipts')} />;
      
      // Entities
      case 'customers': return <CustomerList isCompact={isCompact} onViewLedger={handleViewCustomerLedger} onPrintLedger={() => {}} />;
      case 'vendors': return <VendorList isCompact={isCompact} onViewLedger={handleViewVendorLedger} onPrintLedger={() => {}} />;
      case 'accounts': return <AccountList isCompact={isCompact} onViewLedger={() => {}} />;
      
      // Misc
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
