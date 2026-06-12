export type AttachmentCategory =
  | 'purchase'
  | 'repairs'
  | 'gifted'
  | 'scrap'
  | 'warranty'
  | 'other';

export interface IAttachment {
  name: string;
  serverRelativeUrl: string;
  absoluteUrl: string;
  downloadUrl: string;
  category: AttachmentCategory;
  timeCreated: string;
  fileSize: number;
  previewType: 'browser' | 'office' | 'download';
}
