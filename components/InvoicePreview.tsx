import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, AlertTriangle, CheckCircle2, Calendar, CreditCard, Lock, User } from 'lucide-react';
import { getDraftInvoice, getSettings } from '../services/storage';
import { InvoiceData, AppState, Package } from '../types';

export const InvoicePreview: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<{invoice: InvoiceData, settings: AppState} | null>(null);

  useEffect(() => {
    const draft = getDraftInvoice();
    const settings = getSettings();
    if (!draft) {
      navigate('/');
      return;
    }
    setData({ invoice: draft, settings });
  }, [navigate]);

  if (!data) return null;

  const { invoice, settings } = data;
  const business = settings.businesses.find(b => b.id === invoice.businessId);
  
  // Logic to handle Custom Package vs Selected Package
  let pkg: Package | undefined;
  if (invoice.packageId === 'custom') {
    pkg = {
      id: 'custom',
      name: invoice.customPackageName || 'Custom Service',
      price: invoice.customPackagePrice || 0,
      currency: invoice.customPackageCurrency || 'USD',
      durationMonths: invoice.customPackageDuration || 1,
      features: []
    };
  } else {
    pkg = settings.packages.find(p => p.id === invoice.packageId);
  }

  const payment = settings.paymentMethods.find(p => p.id === invoice.paymentMethodId);

  if (!business || !pkg || !payment) return <div>Error: Missing data</div>;

  // Calculate Expiry
  const issueDate = new Date(invoice.issueDate);
  const expiryDate = new Date(issueDate);
  expiryDate.setMonth(expiryDate.getMonth() + pkg.durationMonths);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-800 p-0 md:p-8 flex flex-col items-center">
      {/* Navigation Bar - Hidden on Print */}
      <div className="w-full max-w-[210mm] mb-6 flex justify-between items-center text-white no-print px-4 md:px-0 mt-4 md:mt-0">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 hover:text-slate-300 transition"
        >
          <ArrowLeft size={20} /> Back to Editor
        </button>
        <button 
          onClick={handlePrint}
          className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold shadow hover:bg-slate-100 flex items-center gap-2 transition"
        >
          <Printer size={18} /> Print Invoice
        </button>
      </div>

      {/* Invoice Paper A4 Ratio */}
      <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl relative print:shadow-none print:w-full">
        {/* Header */}
        <div className="bg-slate-900 text-white p-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">{business.name}</h1>
              <p className="text-slate-400 text-sm max-w-xs">{business.website}</p>
              <p className="text-slate-400 text-sm max-w-xs">{business.email}</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-mono text-slate-200">INVOICE</h2>
              <p className="text-slate-400 mt-1 font-mono">#{invoice.invoiceNumber}</p>
              <div className="mt-4 inline-block bg-slate-800 rounded px-3 py-1 text-sm text-green-400 border border-green-900/50">
                STATUS: PAID
              </div>
            </div>
          </div>
        </div>

        <div className="p-12">
          {/* Bill To & Details Grid */}
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
            <div className="flex-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Bill To</h3>
              <div className="text-slate-900 font-semibold text-xl mb-1">
                {invoice.customerName || "Valued Customer"}
              </div>
              <div className="text-slate-500 font-mono text-sm bg-slate-50 inline-block px-2 py-1 rounded border border-slate-100">
                ID: {invoice.customerId}
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Issue Date</h3>
                <div className="font-medium text-slate-800 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  {formatDate(issueDate)}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Method</h3>
                <div className="font-medium text-slate-800 flex items-center gap-2">
                  <CreditCard size={14} className="text-slate-400" />
                  {payment.name}
                </div>
              </div>
            </div>
          </div>

           {/* Account Credentials Section (Only shows if fields were edited or empty placeholders needed) */}
           <div className="mb-12 bg-slate-50 p-6 rounded-lg border border-slate-100">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
               <Lock size={12} /> Account Credentials
             </h3>
             <div className="grid grid-cols-2 gap-6">
               <div>
                  <label className="text-xs text-slate-400 block mb-1">Username</label>
                  <div className="font-mono text-slate-900 font-medium flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    {invoice.customerUsername || <span className="text-slate-400 italic">See Email</span>}
                  </div>
               </div>
               <div>
                  <label className="text-xs text-slate-400 block mb-1">Password</label>
                  <div className="font-mono text-slate-900 font-medium">
                    {invoice.customerPassword || "••••••••"}
                  </div>
               </div>
             </div>
           </div>

          {/* Line Items */}
          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="text-left py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</th>
                <th className="text-right py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-50">
                <td className="py-6">
                  <div className="font-bold text-slate-800 text-lg">{pkg.name}</div>
                  <div className="text-sm text-slate-500 mt-1">
                     Premium IPTV Subscription
                  </div>
                </td>
                <td className="py-6 text-center text-slate-600">
                  {pkg.durationMonths} {Number(pkg.durationMonths) === 1 ? 'Month' : 'Months'}
                </td>
                <td className="py-6 text-right font-bold text-slate-900 text-lg">
                  {pkg.price.toFixed(2)} {pkg.currency}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="pt-6 text-right text-slate-500">Subtotal</td>
                <td className="pt-6 text-right text-slate-900 font-medium">{pkg.price.toFixed(2)} {pkg.currency}</td>
              </tr>
              <tr>
                <td colSpan={2} className="pt-2 text-right text-slate-900 font-bold text-xl">Total</td>
                <td className="pt-2 text-right text-slate-900 font-bold text-xl">{pkg.price.toFixed(2)} {pkg.currency}</td>
              </tr>
            </tfoot>
          </table>

          {/* Expiry Box - Prominent */}
          <div className="mb-12 border-l-4 border-yellow-400 bg-yellow-50/50 p-6 rounded-r-lg flex items-start gap-4">
            <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
               <AlertTriangle size={24} />
            </div>
            <div>
              <p className="font-bold text-yellow-800 uppercase text-xs tracking-wider mb-1">Subscription Expiry</p>
              <p className="text-2xl font-mono font-bold text-slate-900">{formatDate(expiryDate)}</p>
              <p className="text-yellow-700/80 text-sm mt-1">Please renew your subscription before this date to avoid service interruption.</p>
            </div>
          </div>

          {/* Additional Info / Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Payment Instructions</h4>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {payment.details}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Terms & Notes</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {business.footerNote}
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
             <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
                <CheckCircle2 size={14} /> Generated by {business.name} System
             </div>
          </div>

        </div>
      </div>
      <div className="h-12 w-full no-print"></div>
    </div>
  );
};