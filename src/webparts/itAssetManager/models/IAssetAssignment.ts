export interface IAssetAssignment {
  Id?: number;
  Title: string;              // AssetId (FK)
  AssetItemId: number;        // IT_Assets list item Id
  AssignedTo: string;
  AssignedToEmail: string;
  Department: string;
  AssetLocation: string;
  DateOfAssignment: string;   // ISO date
  LastMaintenanceDate?: string;
  NextMaintenanceDate?: string;
  Remarks?: string;
  IsActive: boolean;
  // 6.6 Guest / external user assignment
  IsGuestUser?: boolean;
}

export const emptyAssignment = (assetId: string, assetItemId: number): IAssetAssignment => ({
  Title: assetId,
  AssetItemId: assetItemId,
  AssignedTo: '',
  AssignedToEmail: '',
  Department: '',
  AssetLocation: '',
  DateOfAssignment: new Date().toISOString().slice(0, 10),
  IsActive: true,
});
