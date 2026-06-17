export interface IAssetAssignment {
    Id?: number;
    Title: string;
    AssetItemId: number;
    AssignedTo: string;
    AssignedToEmail: string;
    Department: string;
    AssetLocation: string;
    DateOfAssignment: string;
    LastMaintenanceDate?: string;
    NextMaintenanceDate?: string;
    Remarks?: string;
    IsActive: boolean;
    IsGuestUser?: boolean;
}
export declare const emptyAssignment: (assetId: string, assetItemId: number) => IAssetAssignment;
//# sourceMappingURL=IAssetAssignment.d.ts.map