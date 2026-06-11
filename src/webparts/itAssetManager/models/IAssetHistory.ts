export type HistoryAction =
  | 'Created'
  | 'StatusChanged'
  | 'Assigned'
  | 'Unassigned'
  | 'Updated'
  | 'DepartmentChanged'
  | 'LocationChanged';

export interface IAssetHistory {
  Id?: number;
  Title: string;           // AssetId (e.g. IN-CHN-26-LAP-0001)
  Action?: HistoryAction | string;
  PreviousStatus?: string;
  NewStatus?: string;
  ChangedBy: string;
  ChangedByEmail?: string;
  ChangedDate: string;     // ISO date string
  HistoryNotes: string;
}
