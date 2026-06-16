export declare type AssetStatus = 'Procured' | 'Stock' | 'Active' | 'Repair' | 'Gifted' | 'Lost' | 'Stolen' | 'Scrapped' | 'Disposed';
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
export declare const OFFICE_OPTIONS: Record<string, {
    key: string;
    text: string;
}[]>;
export declare const STATUS_BADGE_COLORS: Record<AssetStatus, {
    bg: string;
    text: string;
}>;
export declare const DEPT_OPTIONS: readonly ["Engineering", "Product", "Design", "Data Science", "Sales", "Marketing", "HR", "Finance", "Operations", "Legal", "IT", "Management", "Customer Success"];
export declare const LOCATION_OPTIONS: readonly ["Chennai - Nungambakkam", "Chennai - WFH", "Remote", "Warehouse", "Other"];
//# sourceMappingURL=IAsset.d.ts.map