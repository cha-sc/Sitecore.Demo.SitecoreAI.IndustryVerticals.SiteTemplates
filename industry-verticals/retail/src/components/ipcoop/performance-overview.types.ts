export type StoreStatus = 'Open' | 'Closed';

export type FranchiseAgreementStatus = 'Active' | 'Inactive';

export type TaxIdStatus = 'On File' | 'Not On File';

export interface StoreAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface DividendPayment {
  amount: number;
  date: string;
}

export interface FranchiseAgreement {
  agreementNumber: string;
  status: FranchiseAgreementStatus;
  signerName: string;
}

export interface StorePerformanceRecord {
  storeNumber: string;
  address: StoreAddress;
  storeStatus: StoreStatus;
  dividendPayment: DividendPayment;
  yearToDateDividends: number;
  franchiseAgreement: FranchiseAgreement;
  taxIdStatus: TaxIdStatus;
}
