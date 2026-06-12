export interface IAssetHistory {
  Id?: number;
  Title: string;           // AssetId (e.g. IN-CHN-26-LAP-0001)
  AssetItemId?: number;    // IT_Assets list item Id
  PreviousStatus?: string;
  NewStatus?: string;
  ChangedBy: string;
  ChangeDate: string;      // ISO date string
  HistoryNotes: string;
}
