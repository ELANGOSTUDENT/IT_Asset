export interface IScrapAsset {
  Id?: number;
  Title: string;           // AssetId (FK)
  AssetItemId: number;     // IT_Assets list item Id
  ScrapDate?: string;      // ISO date
  ScrapVendor?: string;
  ScrapAmount?: number;
  ScrapAttachmentUrl?: string;
  ScrapRemarks?: string;
}
