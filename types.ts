export interface BusinessProfile {
  id: string;
  name: string;
  email: string;
  website: string;
  footerNote: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  currency: string;
  durationMonths: number;
  features: string[];
}

export interface PaymentMethod {
  id: string;
  name: string; // e.g., PayPal, Crypto, Bank Transfer
  details: string; // e.g., "Send to user@example.com"
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  customerId: string;
  customerName: string;
  customerUsername?: string;
  customerPassword?: string;
  businessId: string;
  packageId: string;
  paymentMethodId: string;
  customNote?: string;
  // Custom Package Fields
  customPackageName?: string;
  customPackagePrice?: number;
  customPackageCurrency?: string;
  customPackageDuration?: number;
}

export interface AppState {
  businesses: BusinessProfile[];
  packages: Package[];
  paymentMethods: PaymentMethod[];
  currencies: string[];
}