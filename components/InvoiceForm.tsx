import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, RefreshCw, ChevronRight, FileText, ChevronDown } from 'lucide-react';
import { AppState, InvoiceData } from '../types';
import { getSettings, saveSettings, saveDraftInvoice } from '../services/storage';
import { SettingsManager } from './SettingsManager';

export const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppState>(getSettings());
  const [manageMode, setManageMode] = useState<'business' | 'package' | 'payment' | 'currency' | null>(null);

  // Form State
  const [invoice, setInvoice] = useState<Partial<InvoiceData>>({
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
    issueDate: new Date().toISOString().split('T')[0],
    customerId: '',
    customerName: '',
    customerUsername: '',
    customerPassword: '',
    packageId: '',
    customPackageCurrency: settings.currencies?.[0] || 'USD',
    customPackageDuration: 1
  });

  // Load initial selections if available
  useEffect(() => {
    if (settings.businesses.length > 0 && !invoice.businessId) {
      setInvoice(prev => ({ ...prev, businessId: settings.businesses[0].id }));
    }
    // Only set default package if not already set (allows keeping 'custom' if selected)
    if (settings.packages.length > 0 && !invoice.packageId) {
      setInvoice(prev => ({ ...prev, packageId: settings.packages[0].id }));
    }
    if (settings.paymentMethods.length > 0 && !invoice.paymentMethodId) {
      setInvoice(prev => ({ ...prev, paymentMethodId: settings.paymentMethods[0].id }));
    }
    // Update default custom currency if not set
    if (!invoice.customPackageCurrency && settings.currencies?.length > 0) {
       setInvoice(prev => ({ ...prev, customPackageCurrency: settings.currencies[0] }));
    }
  }, [settings, invoice.businessId, invoice.packageId, invoice.paymentMethodId]);

  const handleUpdateSettings = (newSettings: AppState) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const generateCustomerId = () => {
    const prefix = 'CUST';
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    setInvoice(prev => ({ ...prev, customerId: `${prefix}${random}` }));
  };

  const generateInvoiceNumber = () => {
    setInvoice(prev => ({ ...prev, invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}` }));
  };

  const handlePreview = () => {
    if (!invoice.businessId || !invoice.packageId || !invoice.customerId) {
      alert("Please ensure Business, Package, and Customer ID are filled.");
      return;
    }
    
    // Validation for custom package
    if (invoice.packageId === 'custom') {
        if (!invoice.customPackageName || !invoice.customPackagePrice) {
            alert("Please fill in the Custom Package Name and Price.");
            return;
        }
    }

    saveDraftInvoice(invoice as InvoiceData);
    navigate('/preview');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      {manageMode && (
        <SettingsManager 
          type={manageMode} 
          data={settings} 
          onUpdate={handleUpdateSettings} 
          onClose={() => setManageMode(null)} 
        />
      )}

      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">StreamBill</h1>
            <p className="text-slate-500">IPTV Invoice Generator</p>
          </div>
          <button className="md:hidden p-2 bg-white rounded-full shadow text-slate-600">
            <Settings size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Form Area */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Business Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">1</span>
                  Business Identity
                </h2>
                <button onClick={() => setManageMode('business')} className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
                  Manage <Settings size={12} />
                </button>
              </div>
              <div className="relative">
                <select 
                  className="w-full appearance-none p-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-lg focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer hover:bg-slate-750"
                  value={invoice.businessId}
                  onChange={(e) => setInvoice({...invoice, businessId: e.target.value})}
                >
                  {settings.businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">2</span>
                Customer Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="John Doe"
                    value={invoice.customerName}
                    onChange={(e) => setInvoice({...invoice, customerName: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer ID / Username</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                      placeholder="CUST12345"
                      value={invoice.customerId}
                      onChange={(e) => setInvoice({...invoice, customerId: e.target.value})}
                    />
                    <button 
                      onClick={generateCustomerId}
                      className="bg-slate-100 text-slate-600 px-4 rounded-lg hover:bg-slate-200 transition flex items-center gap-2 font-medium text-sm border border-slate-200"
                    >
                      <RefreshCw size={16} /> Auto
                    </button>
                  </div>
                </div>

                {/* New Optional Fields */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Username <span className="text-xs text-slate-400">(Optional)</span></label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="user_123"
                    value={invoice.customerUsername}
                    onChange={(e) => setInvoice({...invoice, customerUsername: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Password <span className="text-xs text-slate-400">(Optional)</span></label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="********"
                    value={invoice.customerPassword}
                    onChange={(e) => setInvoice({...invoice, customerPassword: e.target.value})}
                  />
                </div>

              </div>
            </div>

             {/* Package & Payment */}
             <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">3</span>
                  Package & Payment
                </h2>
                <button onClick={() => setManageMode('currency')} className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
                  Manage Currencies <Settings size={12} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Select Package</label>
                    <button onClick={() => setManageMode('package')} className="text-xs text-blue-600 font-medium hover:underline">Manage List</button>
                  </div>
                  <div className="relative">
                    <select 
                      className="w-full appearance-none p-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-lg focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer hover:bg-slate-750 pr-10"
                      value={invoice.packageId}
                      onChange={(e) => setInvoice({...invoice, packageId: e.target.value})}
                    >
                      {settings.packages.map(p => (
                        <option key={p.id} value={p.id}>{p.name} — {p.price} {p.currency} ({p.durationMonths} {Number(p.durationMonths) === 1 ? 'Month' : 'Months'})</option>
                      ))}
                      <option value="custom" className="bg-slate-900 text-blue-200 font-bold">✨ Custom Package...</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                  
                  {/* Custom Package Inputs */}
                  {invoice.packageId === 'custom' && (
                    <div className="mt-4 p-5 bg-slate-800 rounded-xl border border-slate-600 space-y-4 animate-in fade-in slide-in-from-top-2 shadow-inner">
                      <div className="text-xs text-blue-400 uppercase font-bold tracking-wider mb-1">Custom Package Details</div>
                      <input 
                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Package Name"
                        value={invoice.customPackageName || ''}
                        onChange={(e) => setInvoice({...invoice, customPackageName: e.target.value})}
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <input 
                           type="number"
                           className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                           placeholder="Price"
                           value={invoice.customPackagePrice || ''}
                           onChange={(e) => setInvoice({...invoice, customPackagePrice: parseFloat(e.target.value)})}
                        />
                        <div className="relative">
                            <select
                            className="w-full appearance-none p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={invoice.customPackageCurrency}
                            onChange={(e) => setInvoice({...invoice, customPackageCurrency: e.target.value})}
                            >
                            {settings.currencies?.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                        </div>
                        <div className="relative">
                          <input 
                             type="number"
                             className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none pr-8"
                             placeholder="Months"
                             value={invoice.customPackageDuration || ''}
                             onChange={(e) => setInvoice({...invoice, customPackageDuration: parseFloat(e.target.value)})}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">Mo</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Payment Method</label>
                    <button onClick={() => setManageMode('payment')} className="text-xs text-blue-600 font-medium hover:underline">Manage List</button>
                  </div>
                  <div className="relative">
                    <select 
                        className="w-full appearance-none p-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-lg focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer hover:bg-slate-750 pr-10"
                        value={invoice.paymentMethodId}
                        onChange={(e) => setInvoice({...invoice, paymentMethodId: e.target.value})}
                    >
                        {settings.paymentMethods.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar / Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
               <h3 className="font-semibold text-slate-900 mb-4">Invoice Meta</h3>
               <div className="space-y-3">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Invoice Number</label>
                    <div className="flex gap-2 mt-1">
                      <input 
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm font-mono text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={invoice.invoiceNumber}
                        onChange={(e) => setInvoice({...invoice, invoiceNumber: e.target.value})}
                      />
                      <button onClick={generateInvoiceNumber} className="text-slate-400 hover:text-slate-600"><RefreshCw size={14} /></button>
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Date Issued</label>
                    <input 
                      type="date"
                      className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded text-sm text-white [color-scheme:dark] focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={invoice.issueDate}
                      onChange={(e) => setInvoice({...invoice, issueDate: e.target.value})}
                    />
                 </div>
               </div>
            </div>

            <button 
              onClick={handlePreview}
              className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-blue-500/20 font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              Generate Invoice <ChevronRight />
            </button>
            
            <div className="bg-brand-50 p-4 rounded-lg border border-brand-100 text-sm text-brand-900">
              <p className="flex items-start gap-2">
                <FileText className="w-5 h-5 flex-shrink-0" />
                <span>Generating will create a print-ready preview page.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};