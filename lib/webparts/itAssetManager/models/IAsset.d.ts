export declare type AssetStatus = 'Procured' | 'Stock' | 'Active' | 'Repair' | 'Gifted' | 'Lost' | 'Stolen' | 'Scrapped' | 'Disposed' | 'TempAssigned' | 'EndOfService';
export declare type AssetType = 'MAC' | 'LAP' | 'DSK' | 'TAB' | 'PHN' | 'MON' | 'KBD' | 'MOS' | 'CAM' | 'AVC' | 'LND' | 'HST' | 'TVD' | 'PRJ' | 'SWT' | 'FWL' | 'WAP' | 'RTR' | 'SRV' | 'UPS' | 'OTH' | 'DTP' | 'DOC' | 'MOB' | 'NET' | 'ACC';
export interface IAsset {
    Id?: number;
    Title: string;
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
    PurchaseBillUrl?: string;
    Make?: string;
    ModelType?: string;
    ProcurementVendor?: string;
    IsTempAssignment?: boolean;
    TempAssignedTo?: string;
    TempAssignmentEmail?: string;
    TempAssignmentPurpose?: string;
    TempStartDate?: string;
    TempEndDate?: string;
    TempReminderSent?: boolean;
    WarrantyStartDate?: string;
    OEMEndOfServiceDate?: string;
    WarrantyType?: string;
    AddOnService?: string;
    EndOfServiceDate?: string;
    EndOfServiceReason?: string;
    EosRemarks?: string;
}
export declare const ASSET_STATUS_TRANSITIONS: Record<AssetStatus, AssetStatus[]>;
export declare const STATUS_REQUIRES_NOTE: AssetStatus[];
export declare const ASSET_TYPE_LABELS: Record<AssetType, string>;
export declare const NEW_ASSET_TYPES: AssetType[];
export declare const ALL_ASSET_TYPES: AssetType[];
export declare const COUNTRY_OPTIONS: readonly [{
    readonly key: "IN";
    readonly text: "India (IN)";
}, {
    readonly key: "US";
    readonly text: "United States (US)";
}];
export declare const CITY_OPTIONS: Record<string, {
    key: string;
    text: string;
}[]>;
export declare const CITY_LABEL: Record<string, string>;
export declare const CITY_CODE_FROM_OFFICE: Record<string, string>;
export declare const OFFICE_OPTIONS: Record<string, {
    key: string;
    text: string;
}[]>;
export declare const OFFICE_OPTIONS_BY_CITY: Record<string, {
    key: string;
    text: string;
}[]>;
export declare const STATUS_BADGE_COLORS: Record<AssetStatus, {
    bg: string;
    text: string;
}>;
export declare const DEPT_OPTIONS: readonly ["Engineering", "Product", "Design", "Data Science", "Sales", "Marketing", "HR", "Finance", "Operations", "Legal", "IT", "Management", "Customer Success"];
export declare const LOCATION_OPTIONS: readonly ["Chennai - Nungambakkam", "Chennai - WFH", "Remote", "Warehouse", "Other"];
export declare const MAKE_OPTIONS: readonly ["Apple", "Lenovo", "HP", "Dell", "Samsung", "Logitech", "Cisco", "Fortinet", "Other"];
export declare const MODEL_TYPE_OPTIONS: readonly ["MacBook Air", "MacBook Pro", "ThinkPad", "IdeaPad", "EliteBook", "ProBook", "Latitude", "Inspiron", "iMac", "Mac Mini", "iPhone", "Android Phone", "iPad", "Android Tablet", "LED Monitor", "Smart TV / Display", "Projector", "IP Phone / Landline", "Owl Device", "Webcam", "Headset", "Keyboard", "Mouse", "Network Switch", "Firewall", "Access Point", "Router", "Server", "UPS", "Other"];
export declare const WARRANTY_TYPE_OPTIONS: readonly ["Onsite", "Carry-In", "Depot", "Mail-In", "Extended", "AppleCare"];
export declare const MAINTENANCE_TYPE_OPTIONS: readonly ["Preventive", "Corrective", "Repair", "Inspection"];
export declare const EOS_REASON_OPTIONS: readonly ["End of Life", "Beyond Repair", "Surplus", "Policy Refresh", "Lost", "Stolen"];
export declare const DISPOSAL_METHOD_OPTIONS: readonly ["E-waste", "Written Off", "Sold", "Donated", "Transferred"];
//# sourceMappingURL=IAsset.d.ts.map