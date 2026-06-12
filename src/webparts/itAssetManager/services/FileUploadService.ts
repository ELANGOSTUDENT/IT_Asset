import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import { IAttachment, AttachmentCategory } from '../models/IAttachment';

const DOCUMENT_LIBRARY_TITLE = 'Documents';          // display title for lists.getByTitle()
const ATTACHMENT_ROOT        = 'Shared Documents/IT Assets'; // server-relative path segment

const CATEGORY_FOLDER: Record<AttachmentCategory, string> = {
  purchase:   'Purchase Invoices',
  repairs:    'Repair Reports',
  gifted:     'Gift Documents',
  scrap:      'Scrap Documents',
  warranty:   'Warranty Documents',
  other:      'Other',
};

export interface IUploadResult {
  serverRelativeUrl: string;
  absoluteUrl: string;
  fileName: string;
}

export class FileUploadService {
  private _siteRelUrl: string;

  constructor(private _sp: SPFI, siteRelUrl: string) {
    this._siteRelUrl = siteRelUrl.replace(/\/$/, '');
  }

  private folderPath(assetId: string, sub: AttachmentCategory): string {
    const folder = CATEGORY_FOLDER[sub];
    if (sub === 'repairs') {
      return `${this._siteRelUrl}/${ATTACHMENT_ROOT}/${folder}/${assetId}`;
    }
    return `${this._siteRelUrl}/${ATTACHMENT_ROOT}/${folder}`;
  }

  async ensureFolder(assetId: string, sub: AttachmentCategory): Promise<void> {
    const folder = CATEGORY_FOLDER[sub];
    const catPath = `${this._siteRelUrl}/${ATTACHMENT_ROOT}/${folder}`;
    try {
      await this._sp.web.folders.addUsingPath(catPath, true);
    } catch { /* already exists */ }
    if (sub === 'repairs') {
      try {
        await this._sp.web.folders.addUsingPath(`${catPath}/${assetId}`, true);
      } catch { /* already exists */ }
    }
  }

  async upload(assetId: string, sub: AttachmentCategory, file: File): Promise<IUploadResult> {
    await this.ensureFolder(assetId, sub);
    const buf = await file.arrayBuffer();
    const fp = this.folderPath(assetId, sub);
    await this._sp.web
      .getFolderByServerRelativePath(fp)
      .files.addUsingPath(file.name, buf, { Overwrite: true });
    const serverRelativeUrl = `${fp}/${file.name}`;
    return {
      serverRelativeUrl,
      absoluteUrl: this.getAbsoluteUrl(serverRelativeUrl),
      fileName: file.name,
    };
  }

  async deleteFile(serverRelativeUrl: string): Promise<void> {
    try {
      await this._sp.web.getFileByServerRelativePath(serverRelativeUrl).recycle();
    } catch { /* file may not exist — ignore */ }
  }

  getAbsoluteUrl(serverRelativeUrl: string): string {
    return `${window.location.origin}${serverRelativeUrl}`;
  }

  // Returns repair files for a specific asset from the Repair Reports subfolder.
  // Non-repair attachments are stored as URL fields on the IT_Assets record itself.
  async listFiles(assetId: string): Promise<IAttachment[]> {
    const repairFolderPath = this.folderPath(assetId, 'repairs');
    try {
      const items = await this._sp.web.lists
        .getByTitle(DOCUMENT_LIBRARY_TITLE)
        .items
        .filter(`startswith(FileRef, '${repairFolderPath}') and FSObjType eq 0`)
        .orderBy('Created', false)
        .select('FileRef', 'FileLeafRef', 'Created', 'File_x0020_Size')();
      return items.map(item => {
        const srUrl = item.FileRef as string;
        const absUrl = this.getAbsoluteUrl(srUrl);
        return {
          name: item.FileLeafRef as string,
          serverRelativeUrl: srUrl,
          absoluteUrl: absUrl,
          downloadUrl: `${absUrl}?download=1`,
          category: 'repairs' as AttachmentCategory,
          timeCreated: item.Created as string,
          fileSize: (item.File_x0020_Size as number) || 0,
          previewType: this._getPreviewType(item.FileLeafRef as string),
        };
      });
    } catch {
      return [];
    }
  }

  async getFilesByCategory(assetId: string): Promise<Record<AttachmentCategory, IAttachment[]>> {
    const all = await this.listFiles(assetId);
    const grouped: Record<string, IAttachment[]> = {};
    for (const file of all) {
      if (!grouped[file.category]) grouped[file.category] = [];
      grouped[file.category].push(file);
    }
    return grouped as Record<AttachmentCategory, IAttachment[]>;
  }

  private _getPreviewType(fileName: string): 'browser' | 'office' | 'download' {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    const browserTypes = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'tiff', 'txt', 'csv'];
    const officeTypes  = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    if (browserTypes.includes(ext)) return 'browser';
    if (officeTypes.includes(ext))  return 'office';
    return 'download';
  }
}
