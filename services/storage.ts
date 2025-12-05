import { AppState, InvoiceData } from '../types';

const STORAGE_KEY_SETTINGS = 'streambill_settings';
const STORAGE_KEY_DRAFT = 'streambill_draft';

const defaultSettings: AppState = {
  businesses: [
    {
    id: '1',
    name: 'SkyHub8K',
    email: 'support@skyhub8k.com',
    website: 'www.skyhub8k.com',
    footerNote: 'Experience streaming like never before.'
  },
  {
    id: '2',
    name: 'Watchlyy',
    email: 'help@watchlyy.com',
    website: 'www.watchlyy.com',
    footerNote: 'Your gateway to unlimited channels.'
  },
    {
    id: '3',
    name: 'SkyHubTV',
    email: '',
    website: 'www.skyhubtv.com',
    footerNote: ''
  },
  ],
  packages: [
    {
      id: '1',
      name: '1 Month',
      price: 15.00,
      currency: 'USD',
      durationMonths: 1,
      features: ['4K Channels', 'Anti-Freeze', '24/7 Support']
    },
    {
      id: '2',
      name: '3 Months',
      price: 25.00,
      currency: 'USD',
      durationMonths: 3,
      features: ['4K + 8K Channels', 'Multi-Device', 'VOD Library', 'Priority Support']
    },
    {
      id: '3',
      name: '6 Months',
      price: 35.00,
      currency: 'USD',
      durationMonths: 6,
      features: ['4K + 8K Channels', 'Multi-Device', 'VOD Library', 'Priority Support']
    },
    {
      id: '4',
      name: '12 Months',
      price: 50.00,
      currency: 'USD',
      durationMonths: 12,
      features: ['4K + 8K Channels', 'Multi-Device', 'VOD Library', 'Priority Support']
    }
  ],
  paymentMethods: [
    {
      id: '1',
      name: 'PayPal',
      details: 'Send payment to: (Friends & Family)'
    },
    {
      id: '2',
      name: 'Bank Transfer',
      details: 'Send payment to: (Friends & Family)'
    },
    {
      id: '3',
      name: 'Bitcoin',
      details: ''
    }
  ],
  currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
};

export const getSettings = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migration: Ensure currencies exist for older versions
      if (!parsed.currencies) {
        parsed.currencies = defaultSettings.currencies;
      }
      return parsed;
    }
    return defaultSettings;
  } catch (e) {
    return defaultSettings;
  }
};

export const saveSettings = (settings: AppState) => {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
};

export const saveDraftInvoice = (data: InvoiceData) => {
  localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(data));
};

export const getDraftInvoice = (): InvoiceData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DRAFT);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};