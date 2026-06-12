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

export type AssetType = 'LAP' | 'MAC' | 'DTP' | 'MON' | 'DOC' | 'MOB' | 'NET' | 'ACC';

export interface IAsset {
  Id?: number;
  Title: string;             // AssetId: IN-CHN-26-LAP-0001
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
  LAP: 'Laptop',
  MAC: 'MacBook',
  DTP: 'Desktop',
  MON: 'Monitor',
  DOC: 'Docking Station',
  MOB: 'Mobile Phone',
  NET: 'Network Device',
  ACC: 'Accessory',
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
