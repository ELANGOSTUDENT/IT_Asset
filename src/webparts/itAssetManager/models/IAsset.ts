export type AssetStatus =
  | 'Procured'
  | 'Stock'
  | 'Active'
  | 'Repair'
  | 'Gifted'
  | 'Lost'
  | 'Stolen'
  | 'Scrapped'
  | 'Disposed';

export type AssetType =
  // Current codes (ZRX naming convention)
  | 'MAC' | 'LAP' | 'DSK' | 'TAB' | 'PHN' | 'MON' | 'KBD' | 'MOS' | 'CAM'
  | 'AVC' | 'LND' | 'HST' | 'TVD' | 'PRJ' | 'SWT' | 'FWL' | 'WAP' | 'RTR'
  | 'SRV' | 'UPS' | 'OTH'
  // Legacy codes — existing assets only, not available for new assets
  | 'DTP' | 'DOC' | 'MOB' | 'NET' | 'ACC';

export interface IAsset {
  Id?: number;
  Title: string;             // AssetId: ZRX-IN-CHN-GIC-MAC-0001
  SerialNumber: string;
  Model: string;
  Vendor: string;
  PONumber: string;
  InvoiceNumber: string;
  Cost: number;
  PurchaseDate: string;
  WarrantyExpiry: string;
  AssignedTo: string;
  AssignedToEmail: string;
  Department: string;
  AssetLocation: string;

  Country: string;
  OfficeCode: string;
  Status: AssetStatus;
  AssetType: AssetType;
  Remarks: string;
  SequenceNumber?: number;

  // Procurement attachment
  PurchaseBillUrl?: string;
}

// Valid next states from each state
export const ASSET_STATUS_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  Procured:  ['Stock'],
  Stock:     ['Active', 'Scrapped'],
  Active:    ['Repair', 'Gifted', 'Lost', 'Stolen'],
  Repair:    ['Active', 'Scrapped'],
  Gifted:    [],
  Lost:      ['Active'],
  Stolen:    ['Active'],
  Scrapped:  ['Disposed'],
  Disposed:  [],
};

// States that require a mandatory note
export const STATUS_REQUIRES_NOTE: AssetStatus[] = ['Lost', 'Stolen', 'Gifted', 'Disposed'];

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  // Current codes
  MAC: 'MacBook',
  LAP: 'Laptop',
  DSK: 'Desktop',
  TAB: 'Tablet',
  PHN: 'Mobile Phone',
  MON: 'Monitor',
  KBD: 'Keyboard',
  MOS: 'Mouse',
  CAM: 'Webcam / Camera',
  AVC: 'Audio/Video Conferencing Device',
  LND: 'Landline / IP Phone',
  HST: 'Headset',
  TVD: 'TV / Large-format Display',
  PRJ: 'Projector',
  SWT: 'Network Switch',
  FWL: 'Firewall',
  WAP: 'Wireless Access Point',
  RTR: 'Router',
  SRV: 'Server',
  UPS: 'UPS / Power Device',
  OTH: 'Other IT Hardware',
  // Legacy codes (backward compat — for assets created before ZRX naming convention)
  DTP: 'Desktop',
  DOC: 'Docking Station',
  MOB: 'Mobile Phone',
  NET: 'Network Device',
  ACC: 'Accessory',
};

// New asset type codes (excludes legacy codes — used in add/edit dropdowns)
export const NEW_ASSET_TYPES: AssetType[] = [
  'MAC', 'LAP', 'DSK', 'TAB', 'PHN', 'MON', 'KBD', 'MOS', 'CAM',
  'AVC', 'LND', 'HST', 'TVD', 'PRJ', 'SWT', 'FWL', 'WAP', 'RTR',
  'SRV', 'UPS', 'OTH',
];

// All known asset type codes (new + legacy — used in filter dropdowns)
export const ALL_ASSET_TYPES: AssetType[] = [
  ...NEW_ASSET_TYPES,
  'DTP', 'DOC', 'MOB', 'NET', 'ACC',
];

// Country options
export const COUNTRY_OPTIONS = [
  { key: 'IN', text: 'India (IN)' },
  { key: 'US', text: 'United States (US)' },
] as const;

// Site / Office Code options per country
export const OFFICE_OPTIONS: Record<string, { key: string; text: string }[]> = {
  IN: [
    { key: 'GIC', text: 'GIC — Global Infocity, Chennai' },
    { key: 'UWB', text: 'UWB — UrbanWrk — Baani The Statement, Gurgaon' },
    { key: 'UWK', text: 'UWK — UrbanWrk — Konkord Towers, Pune' },
  ],
  US: [
    { key: 'NYC', text: 'NYC — US — New York Office' },
    { key: 'BOS', text: 'BOS — US — Boston Office' },
  ],
};

export const STATUS_BADGE_COLORS: Record<AssetStatus, { bg: string; text: string }> = {
  Procured:  { bg: '#deecf9', text: '#004578' },
  Stock:     { bg: '#dff6dd', text: '#107c10' },
  Active:    { bg: '#e2f0d9', text: '#375623' },
  Repair:    { bg: '#fce8d2', text: '#8a3b00' },
  Gifted:    { bg: '#d2f4f4', text: '#005b5b' },
  Lost:      { bg: '#fde7e9', text: '#a4262c' },
  Stolen:    { bg: '#fce4d6', text: '#8e3a00' },
  Scrapped:  { bg: '#ebebeb', text: '#605e5c' },
  Disposed:  { bg: '#e1dfdd', text: '#3b3a39' },
};

export const DEPT_OPTIONS = [
  'Engineering', 'Product', 'Design', 'Data Science', 'Sales', 'Marketing',
  'HR', 'Finance', 'Operations', 'Legal', 'IT', 'Management', 'Customer Success',
] as const;

export const LOCATION_OPTIONS = [
  'Chennai - Nungambakkam',
  'Chennai - WFH',
  'Remote',
  'Warehouse',
  'Other',
] as const;
