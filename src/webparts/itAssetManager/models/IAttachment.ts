export type AttachmentCategory =
  | 'purchase'
  | 'repairs'
  | 'gifted'
  | 'transfer'
  | 'scrap'
  | 'validation'
  | 'photos'
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
