export interface IRepairEntry {
    Id?: number;
    Title: string;
    AssetItemId: number;
    RepairDate: string;
    RepairVendor: string;
    IssueDescription: string;
    RepairCost: number;
    Resolution?: string;
    Remarks?: string;
    AttachmentUrl?: string;
    MaintenanceType?: string;
    NextMaintenanceDue?: string;
}
export interface IRepairEntryDraft {
    RepairDate: string;
    RepairVendor: string;
    IssueDescription: string;
    RepairCost: number;
    Resolution: string;
    Remarks: string;
    AttachmentFile?: File;
    MaintenanceType: string;
    NextMaintenanceDue: string;
}
export declare const emptyRepairDraft: () => IRepairEntryDraft;
//# sourceMappingURL=IRepairEntry.d.ts.map