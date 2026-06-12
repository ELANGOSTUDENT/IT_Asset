export interface IGiftedAsset {
  Id?: number;
  Title: string;           // AssetId (FK)
  AssetItemId: number;     // IT_Assets list item Id
  GiftedTo: string;
  GiftedDate?: string;     // ISO date
  GiftAttachmentUrl?: string;
  GiftRemarks?: string;
}
