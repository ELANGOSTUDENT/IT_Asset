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
}

export interface IRepairEntryDraft {
  RepairDate: string;
  RepairVendor: string;
  IssueDescription: string;
  RepairCost: number;
  Resolution: string;
  Remarks: string;
  AttachmentFile?: File;
}

export const emptyRepairDraft = (): IRepairEntryDraft => ({
  RepairDate: '',
  RepairVendor: '',
  IssueDescription: '',
  RepairCost: 0,
  Resolution: '',
  Remarks: '',
});
