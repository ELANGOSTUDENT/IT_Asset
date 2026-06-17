export type AssetStatus =
  | 'Procured'
  | 'Stock'
  | 'Active'
  | 'Repair'
  | 'Gifted'
  | 'Lost'
  | 'Stolen'
  | 'Scrapped'
  | 'Disposed'
  | 'TempAssigned'
  | 'EndOfService';

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

  // 6.4 Hardware
  Make?: string;           // manufacturer dropdown (Apple/Lenovo/etc.) — Vendor field stores manufacturer for legacy assets
  ModelType?: string;      // model line dropdown (MacBook Pro/ThinkPad/etc.)

  // 6.5 Procurement
  ProcurementVendor?: string;  // procurement supplier/vendor (Croma, Amazon Business, etc.)

  // 6.7 Temporary Assignment
  IsTempAssignment?: boolean;
  TempAssignedTo?: string;
  TempAssignmentEmail?: string;
  TempAssignmentPurpose?: string;
  TempStartDate?: string;
  TempEndDate?: string;
  TempReminderSent?: boolean;

  // 6.8 Warranty & Services
  WarrantyStartDate?: string;
  OEMEndOfServiceDate?: string;
  WarrantyType?: string;
  AddOnService?: string;

  // 6.10 End of Service
  EndOfServiceDate?: string;
  EndOfServiceReason?: string;
  EosRemarks?: string;
}

// Valid next states from each state
export const ASSET_STATUS_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  Procured:     ['Stock'],
  Stock:        ['Active', 'Scrapped'],
  Active:       ['Repair', 'Gifted', 'Lost', 'Stolen', 'TempAssigned', 'EndOfService'],
  Repair:       ['Active', 'Scrapped'],
  Gifted:       [],
  Lost:         ['Active'],
  Stolen:       ['Active'],
  Scrapped:     ['Disposed'],
  Disposed:     [],
  TempAssigned: ['Active', 'Repair', 'Gifted'],
  EndOfService: ['Scrapped'],
};

// States that require a mandatory note
export const STATUS_REQUIRES_NOTE: AssetStatus[] = ['Lost', 'Stolen', 'Gifted', 'Disposed', 'EndOfService'];

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

// City options per country (for City dropdown — filtered by Country)
export const CITY_OPTIONS: Record<string, { key: string; text: string }[]> = {
  IN: [
    { key: 'CHN', text: 'Chennai' },
    { key: 'GRG', text: 'Gurgaon' },
    { key: 'PUN', text: 'Pune' },
  ],
  US: [
    { key: 'NYC', text: 'New York' },
    { key: 'BOS', text: 'Boston' },
  ],
};

// Full city name by city code
export const CITY_LABEL: Record<string, string> = {
  CHN: 'Chennai', GRG: 'Gurgaon', PUN: 'Pune', NYC: 'New York', BOS: 'Boston',
};

// City code derived from office code
export const CITY_CODE_FROM_OFFICE: Record<string, string> = {
  GIC: 'CHN', UWB: 'GRG', UWK: 'PUN', NYC: 'NYC', BOS: 'BOS',
};

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

// Site / Office options filtered by city code (for 3-level Country → City → Office cascade)
export const OFFICE_OPTIONS_BY_CITY: Record<string, { key: string; text: string }[]> = {
  CHN: [{ key: 'GIC', text: 'GIC — Global Infocity, Chennai' }],
  GRG: [{ key: 'UWB', text: 'UWB — UrbanWrk Baani, Gurgaon' }],
  PUN: [{ key: 'UWK', text: 'UWK — UrbanWrk Konkord, Pune' }],
  NYC: [{ key: 'NYC', text: 'NYC — New York Office' }],
  BOS: [{ key: 'BOS', text: 'BOS — Boston Office' }],
};

export const STATUS_BADGE_COLORS: Record<AssetStatus, { bg: string; text: string }> = {
  Procured:     { bg: '#deecf9', text: '#004578' },
  Stock:        { bg: '#dff6dd', text: '#107c10' },
  Active:       { bg: '#e2f0d9', text: '#375623' },
  Repair:       { bg: '#fce8d2', text: '#8a3b00' },
  Gifted:       { bg: '#d2f4f4', text: '#005b5b' },
  Lost:         { bg: '#fde7e9', text: '#a4262c' },
  Stolen:       { bg: '#fce4d6', text: '#8e3a00' },
  Scrapped:     { bg: '#ebebeb', text: '#605e5c' },
  Disposed:     { bg: '#e1dfdd', text: '#3b3a39' },
  TempAssigned: { bg: '#fff4ce', text: '#7d4900' },
  EndOfService: { bg: '#f3f2f1', text: '#3b3a39' },
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

// 6.4 Hardware — manufacturer dropdown
export const MAKE_OPTIONS = [
  'Apple', 'Lenovo', 'HP', 'Dell', 'Samsung',
  'Logitech', 'Cisco', 'Fortinet', 'Other',
] as const;

// 6.4 Hardware — model line dropdown
export const MODEL_TYPE_OPTIONS = [
  'MacBook Air', 'MacBook Pro', 'ThinkPad', 'IdeaPad', 'EliteBook', 'ProBook',
  'Latitude', 'Inspiron', 'iMac', 'Mac Mini', 'iPhone', 'Android Phone',
  'iPad', 'Android Tablet', 'LED Monitor', 'Smart TV / Display', 'Projector',
  'IP Phone / Landline', 'Owl Device', 'Webcam', 'Headset', 'Keyboard', 'Mouse',
  'Network Switch', 'Firewall', 'Access Point', 'Router', 'Server', 'UPS', 'Other',
] as const;

// 6.8 Warranty type
export const WARRANTY_TYPE_OPTIONS = [
  'Onsite', 'Carry-In', 'Depot', 'Mail-In', 'Extended', 'AppleCare',
] as const;

// 6.9 Maintenance type
export const MAINTENANCE_TYPE_OPTIONS = [
  'Preventive', 'Corrective', 'Repair', 'Inspection',
] as const;

// 6.10 End of Service reason
export const EOS_REASON_OPTIONS = [
  'End of Life', 'Beyond Repair', 'Surplus', 'Policy Refresh', 'Lost', 'Stolen',
] as const;

// 6.11 Disposal method
export const DISPOSAL_METHOD_OPTIONS = [
  'E-waste', 'Written Off', 'Sold', 'Donated', 'Transferred',
] as const;
