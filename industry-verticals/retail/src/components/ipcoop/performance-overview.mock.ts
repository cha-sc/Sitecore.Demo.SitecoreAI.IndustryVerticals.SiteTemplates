import type { StorePerformanceRecord } from './performance-overview.types';

const DIVIDEND_PAYMENT_DATE = '8/31/2025';
const SIGNER_NAME = 'Andres Gomez';

function createStore(
  storeNumber: string,
  address: StorePerformanceRecord['address'],
  dividendPaymentAmount: number,
  yearToDateDividends: number,
  agreementSuffix: string
): StorePerformanceRecord {
  return {
    storeNumber,
    address,
    storeStatus: 'Open',
    dividendPayment: {
      amount: dividendPaymentAmount,
      date: DIVIDEND_PAYMENT_DATE,
    },
    yearToDateDividends,
    franchiseAgreement: {
      agreementNumber: `${storeNumber}-${agreementSuffix}`,
      status: 'Active',
      signerName: SIGNER_NAME,
    },
    taxIdStatus: 'Not On File',
  };
}

/** 15-store portfolio representing a franchise owner. */
export const FRANCHISE_OWNER_STORES: StorePerformanceRecord[] = [
  createStore(
    '295-0',
    {
      line1: '1200 Main Street',
      city: 'Bridgeport',
      state: 'CT',
      zip: '06604',
    },
    3326.54,
    14345.12,
    '134573'
  ),
  createStore(
    '301-2',
    {
      line1: '88 Boston Post Road',
      city: 'Orange',
      state: 'CT',
      zip: '06477',
    },
    3189.22,
    15230.89,
    '287641'
  ),
  createStore(
    '418-7',
    {
      line1: '4500 Dixie Highway',
      line2: 'Suite B',
      city: 'Louisville',
      state: 'KY',
      zip: '40216',
    },
    2945.88,
    12890.45,
    '519204'
  ),
  createStore(
    '522-1',
    {
      line1: '2100 N Collins Street',
      city: 'Arlington',
      state: 'TX',
      zip: '76011',
    },
    4120.35,
    16780.33,
    '640118'
  ),
  createStore(
    '634-0',
    {
      line1: '775 W Route 66',
      city: 'Flagstaff',
      state: 'AZ',
      zip: '86001',
    },
    3055.67,
    14120.67,
    '772305'
  ),
  createStore(
    '701-4',
    {
      line1: '1590 Market Street',
      city: 'Philadelphia',
      state: 'PA',
      zip: '19103',
    },
    3890.41,
    15560.21,
    '803417'
  ),
  createStore(
    '812-9',
    {
      line1: '3201 Veterans Memorial Blvd',
      city: 'Metairie',
      state: 'LA',
      zip: '70002',
    },
    2768.93,
    13245.88,
    '914528'
  ),
  createStore(
    '903-3',
    {
      line1: '6400 N Illinois Street',
      city: 'Indianapolis',
      state: 'IN',
      zip: '46220',
    },
    3542.18,
    14980.54,
    '025639'
  ),
  createStore(
    '1045-2',
    {
      line1: '900 E Las Olas Blvd',
      city: 'Fort Lauderdale',
      state: 'FL',
      zip: '33301',
    },
    4012.76,
    16120.76,
    '146702'
  ),
  createStore(
    '1156-8',
    {
      line1: '2200 SW College Road',
      city: 'Ocala',
      state: 'FL',
      zip: '34474',
    },
    2890.55,
    13890.43,
    '257813'
  ),
  createStore(
    '1203-1',
    {
      line1: '1100 Peachtree Street NE',
      city: 'Atlanta',
      state: 'GA',
      zip: '30309',
    },
    3678.29,
    14765.29,
    '308924'
  ),
  createStore(
    '1344-5',
    {
      line1: '500 S Main Street',
      city: 'Salt Lake City',
      state: 'UT',
      zip: '84111',
    },
    3955.84,
    15990.11,
    '419035'
  ),
  createStore(
    '1455-0',
    {
      line1: '75 Middlesex Turnpike',
      city: 'Burlington',
      state: 'MA',
      zip: '01803',
    },
    2712.46,
    12450.98,
    '520146'
  ),
  createStore(
    '1567-3',
    {
      line1: '1800 E Craig Road',
      city: 'North Las Vegas',
      state: 'NV',
      zip: '89030',
    },
    4285.62,
    17120.45,
    '631257'
  ),
  createStore(
    '1678-6',
    {
      line1: '3300 SE Powell Blvd',
      city: 'Portland',
      state: 'OR',
      zip: '97202',
    },
    4198.37,
    16850.1,
    '742368'
  ),
];

/** 2-store portfolio representing a store manager. */
export const STORE_MANAGER_STORES: StorePerformanceRecord[] = [
  createStore(
    '295-0',
    {
      line1: '1200 Main Street',
      city: 'Bridgeport',
      state: 'CT',
      zip: '06604',
    },
    3326.54,
    28540.18,
    '134573'
  ),
  createStore(
    '301-2',
    {
      line1: '88 Boston Post Road',
      city: 'Orange',
      state: 'CT',
      zip: '06477',
    },
    3189.22,
    31275.64,
    '287641'
  ),
];
