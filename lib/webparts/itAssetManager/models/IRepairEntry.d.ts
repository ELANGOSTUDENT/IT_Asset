export interface IRepairEntry {
    Id?: number;
    Title: string;
    AssetItemId: number;
    RepairDate: string;
    RepairVendor: string;
    IssueDescription: string;
    RepairCost: number;
    RepairInvoiceNumber: string;
    AttachmentUrl?: string;
    AttachmentName?: string;
}
export interface IRepairEntryDraft {
    RepairDate: string;
    RepairVendor: string;
    IssueDescription: string;
    RepairCost: number;
    RepairInvoiceNumber: string;
    AttachmentFile?: File;
}
export declare const emptyRepairDraft: () => IRepairEntryDraft;
//# sourceMappingURL=IRepairEntry.d.ts.map