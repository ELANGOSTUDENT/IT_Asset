export interface IAssetAssignment {
    Id?: number;
    Title: string;
    AssetItemId: number;
    SerialNumber: string;
    AssignedTo: string;
    AssignedToEmail: string;
    Department: string;
    AssetLocation: string;
    DateOfAssignment: string;
    LastMaintenanceDate?: string;
    NextMaintenanceDate?: string;
    MaintenanceNotes?: string;
    Remarks?: string;
    IsActive: boolean;
}
export declare const emptyAssignment: (assetId: string, assetItemId: number, serialNumber: string) => IAssetAssignment;
//# sourceMappingURL=IAssetAssignment.d.ts.map