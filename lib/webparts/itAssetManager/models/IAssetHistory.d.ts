export declare type HistoryAction = 'Created' | 'StatusChanged' | 'Assigned' | 'Unassigned' | 'Updated' | 'DepartmentChanged' | 'LocationChanged';
export interface IAssetHistory {
    Id?: number;
    Title: string;
    Action: HistoryAction | string;
    PreviousStatus?: string;
    NewStatus?: string;
    ChangedBy: string;
    ChangedByEmail?: string;
    ChangedDate: string;
    HistoryNotes: string;
}
//# sourceMappingURL=IAssetHistory.d.ts.map