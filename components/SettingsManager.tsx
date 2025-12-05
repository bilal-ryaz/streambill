import React, { useState } from 'react';
import { Plus, Trash2, X, ChevronDown } from 'lucide-react';
import { AppState, BusinessProfile, Package, PaymentMethod } from '../types';

interface SettingsManagerProps {
  type: 'business' | 'package' | 'payment' | 'currency';
  data: AppState;
  onUpdate: (newData: AppState) => void;
  onClose: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ type, data, onUpdate, onClose }) => {
  // Temporary state for form inputs
  const [name, setName] = useState('');
  const [detail1, setDetail1] = useState(''); // Email / Price / Details
  const [detail2, setDetail2] = useState(type === 'package' ? (data.currencies?.[0] || 'USD') : ''); // Website / Currency / N/A
  const [detail3, setDetail3] = useState(''); // Footer / Duration / N/A

  const handleAdd = () => {
    const id = Date.now().toString();
    let newState = { ...data };

    if (type === 'business') {
      const newBiz: BusinessProfile = {
        id,
        name,
        email: detail1,
        website: detail2,
        footerNote: detail3 || 'Thank you for your business.'
      };
      newState.businesses = [...newState.businesses, newBiz];
    } else if (type === 'package') {
      const newPkg: Package = {
        id,
        name,
        price: parseFloat(detail1) || 0,
        currency: detail2 || (data.currencies?.[0] || 'USD'),
        durationMonths: parseInt(detail3) || 1,
        features: []
      };
      newState.packages = [...newState.packages, newPkg];
    } else if (type === 'payment') {
      const newMethod: PaymentMethod = {
        id,
        name,
        details: detail1
      };
      newState.paymentMethods = [...newState.paymentMethods, newMethod];
    } else if (type === 'currency') {
      const upperName = name.trim().toUpperCase();
      if (upperName && !newState.currencies.includes(upperName)) {
        newState.currencies = [...newState.currencies, upperName];
      }
    }

    onUpdate(newState);
    // Reset form
    setName('');
    setDetail1('');
    setDetail2(type === 'package' ? (data.currencies?.[0] || 'USD') : '');
    setDetail3('');
  };

  const handleDelete = (id: string) => {
    let newState = { ...data };
    if (type === 'business') newState.businesses = newState.businesses.filter(b => b.id !== id);
    if (type === 'package') newState.packages = newState.packages.filter(p => p.id !== id);
    if (type === 'payment') newState.paymentMethods = newState.paymentMethods.filter(p => p.id !== id);
    if (type === 'currency') newState.currencies = newState.currencies.filter(c => c !== id);
    onUpdate(newState);
  };

  const renderList = () => {
    if (type === 'business') return data.businesses.map(b => (
      <div key={b.id} className="flex justify-between items-center p-3 bg-slate-50 border rounded mb-2">
        <div>
          <div className="font-bold">{b.name}</div>
          <div className="text-xs text-slate-500">{b.email}</div>
        </div>
        <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
      </div>
    ));
    if (type === 'package') return data.packages.map(p => (
      <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 border rounded mb-2">
        <div>
          <div className="font-bold">{p.name}</div>
          <div className="text-xs text-slate-500">{p.price} {p.currency} / {p.durationMonths}mo</div>
        </div>
        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
      </div>
    ));
    if (type === 'payment') return data.paymentMethods.map(p => (
      <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 border rounded mb-2">
        <div>
          <div className="font-bold">{p.name}</div>
          <div className="text-xs text-slate-500 truncate max-w-[200px]">{p.details}</div>
        </div>
        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
      </div>
    ));
    if (type === 'currency') return data.currencies.map(c => (
      <div key={c} className="flex justify-between items-center p-3 bg-slate-50 border rounded mb-2">
        <div className="font-bold">{c}</div>
        <button onClick={() => handleDelete(c)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
      </div>
    ));
  };

  const getTitle = () => {
    if (type === 'currency') return 'Currencies';
    if (type === 'business') return 'Businesses';
    return type + 's';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg capitalize">Manage {getTitle()}</h3>
          <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        
        <div className="p-4 max-h-[40vh] overflow-y-auto">
          {renderList()}
        </div>

        <div className="p-4 bg-slate-50 border-t space-y-3">
          <input 
            className="w-full border border-slate-600 bg-slate-700 text-white rounded p-2 text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder={type === 'currency' ? "Currency Code (e.g. USD)" : "Name"} 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
          {type === 'business' && (
            <>
              <input className="w-full border border-slate-600 bg-slate-700 text-white rounded p-2 text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email" value={detail1} onChange={e => setDetail1(e.target.value)} />
              <input className="w-full border border-slate-600 bg-slate-700 text-white rounded p-2 text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Website" value={detail2} onChange={e => setDetail2(e.target.value)} />
              <input className="w-full border border-slate-600 bg-slate-700 text-white rounded p-2 text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Footer Note" value={detail3} onChange={e => setDetail3(e.target.value)} />
            </>
          )}
          {type === 'package' && (
            <>
              <input className="w-full border border-slate-600 bg-slate-700 text-white rounded p-2 text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" type="number" placeholder="Price (e.g. 15)" value={detail1} onChange={e => setDetail1(e.target.value)} />
              
              <div className="relative">
                <select 
                  className="w-full appearance-none border border-slate-600 bg-slate-700 text-white rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none pr-8"
                  value={detail2}
                  onChange={e => setDetail2(e.target.value)}
                >
                  {data.currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>

              <input className="w-full border border-slate-600 bg-slate-700 text-white rounded p-2 text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" type="number" placeholder="Duration (Months)" value={detail3} onChange={e => setDetail3(e.target.value)} />
            </>
          )}
          {type === 'payment' && (
            <textarea 
              className="w-full border border-slate-600 bg-slate-700 text-white rounded p-2 text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Payment Instructions (Wallet address, Bank details...)" 
              value={detail1} 
              onChange={e => setDetail1(e.target.value)} 
            />
          )}
          
          <button 
            onClick={handleAdd}
            disabled={!name}
            className="w-full bg-slate-900 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50"
          >
            <Plus size={16} /> Add New
          </button>
        </div>
      </div>
    </div>
  );
};