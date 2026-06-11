export interface IAssetAssignment {
  Id?: number;
  Title: string;              // AssetId (FK)
  AssetItemId: number;        // IT_Assets list item Id
  SerialNumber: string;
  AssignedTo: string;
  AssignedToEmail: string;
  Department: string;
  AssetLocation: string;
  DateOfAssignment: string;   // ISO date
  LastMaintenanceDate?: string;
  NextMaintenanceDate?: string;
  MaintenanceNotes?: string;
  Remarks?: string;
  IsActive: boolean;
}

export const emptyAssignment = (assetId: string, assetItemId: number, serialNumber: string): IAssetAssignment => ({
  Title: assetId,
  AssetItemId: assetItemId,
  SerialNumber: serialNumber,
  AssignedTo: '',
  AssignedToEmail: '',
  Department: '',
  AssetLocation: '',
  DateOfAssignment: new Date().toISOString().slice(0, 10),
  IsActive: true,
});
