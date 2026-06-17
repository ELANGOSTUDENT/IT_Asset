export interface IRepairEntry {
  Id?: number;
  Title: string;             // AssetId (FK)
  AssetItemId: number;       // IT_Assets list item Id
  RepairDate: string;        // ISO date
  RepairVendor: string;
  IssueDescription: string;
  RepairCost: number;
  Resolution?: string;
  Remarks?: string;
  AttachmentUrl?: string;    // Server-relative URL in IT Assets / Repair Reports library
  // 6.9 Maintenance & Repair
  MaintenanceType?: string;  // Preventive / Corrective / Repair / Inspection
  NextMaintenanceDue?: string; // ISO date
}

export interface IRepairEntryDraft {
  RepairDate: string;
  RepairVendor: string;
  IssueDescription: string;
  RepairCost: number;
  Resolution: string;
  Remarks: string;
  AttachmentFile?: File;
  // 6.9 additions
  MaintenanceType: string;
  NextMaintenanceDue: string;
}

export const emptyRepairDraft = (): IRepairEntryDraft => ({
  RepairDate: '',
  RepairVendor: '',
  IssueDescription: '',
  RepairCost: 0,
  Resolution: '',
  Remarks: '',
  MaintenanceType: '',
  NextMaintenanceDue: '',
});
