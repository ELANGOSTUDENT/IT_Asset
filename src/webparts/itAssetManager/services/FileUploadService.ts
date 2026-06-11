import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import { IAttachment, AttachmentCategory } from '../models/IAttachment';

const LIBRARY = 'AssetAttachments';

export interface IUploadResult {
  serverRelativeUrl: string;
  fileName: string;
}

export class FileUploadService {
  constructor(private _sp: SPFI, private _siteRelUrl: string) {}

  private folderPath(assetId: string, sub: string): string {
    return `${this._siteRelUrl}/${LIBRARY}/${assetId}/${sub}`;
  }

  async ensureFolder(assetId: string, sub: string): Promise<void> {
    try {
      await this._sp.web.folders.addUsingPath(`${LIBRARY}/${assetId}/${sub}`, true);
    } catch {
      // Folder likely already exists — ignore
    }
  }

  async upload(assetId: string, sub: string, file: File): Promise<IUploadResult> {
    await this.ensureFolder(assetId, sub);
    const buf = await file.arrayBuffer();
    await this._sp.web
      .getFolderByServerRelativePath(this.folderPath(assetId, sub))
      .files.addUsingPath(file.name, buf, { Overwrite: true });
    return {
      serverRelativeUrl: `${this.folderPath(assetId, sub)}/${file.name}`,
      fileName: file.name,
    };
  }

  async deleteFile(serverRelativeUrl: string): Promise<void> {
    try {
      await this._sp.web.getFileByServerRelativePath(serverRelativeUrl).recycle();
    } catch {
      // File may not exist — ignore
    }
  }

  getAbsoluteUrl(serverRelativeUrl: string): string {
    const origin = window.location.origin;
    return `${origin}${serverRelativeUrl}`;
  }

  async listFiles(assetId: string): Promise<IAttachment[]> {
    const assetFolderPath = `${this._siteRelUrl}/${LIBRARY}/${assetId}`;
    const items = await this._sp.web.lists
      .getByTitle(LIBRARY)
      .items
      .filter(`startswith(FileRef, '${assetFolderPath}') and FSObjType eq 0`)
      .orderBy('Created', false)
      .select('FileRef', 'FileLeafRef', 'Created', 'File_x0020_Size')();
    return items.map(item => {
      const srUrl = item.FileRef;
      const absUrl = this.getAbsoluteUrl(srUrl);
      return {
        name: item.FileLeafRef,
        serverRelativeUrl: srUrl,
        absoluteUrl: absUrl,
        downloadUrl: `${absUrl}?download=1`,
        category: this._inferCategory(srUrl, assetId),
        timeCreated: item.Created,
        fileSize: item.File_x0020_Size || 0,
        previewType: this._getPreviewType(item.FileLeafRef),
      };
    });
  }

  async getFilesByCategory(assetId: string): Promise<Record<AttachmentCategory, IAttachment[]>> {
    const all = await this.listFiles(assetId);
    const grouped: Record<string, IAttachment[]> = {};
    for (const file of all) {
      const cat = file.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(file);
    }
    return grouped as Record<AttachmentCategory, IAttachment[]>;
  }

  private _inferCategory(serverRelativeUrl: string, assetId: string): AttachmentCategory {
    const pattern = new RegExp(`${assetId}/([^/]+)/`);
    const match = serverRelativeUrl.match(pattern);
    if (!match) return 'other';
    const cat = match[1];
    const valid: AttachmentCategory[] = ['purchase', 'repairs', 'gifted', 'transfer', 'scrap', 'validation', 'photos'];
    return valid.includes(cat as AttachmentCategory) ? cat as AttachmentCategory : 'other';
  }

  private _getPreviewType(fileName: string): 'browser' | 'office' | 'download' {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const browserTypes = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'tiff', 'txt', 'csv'];
    const officeTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    if (browserTypes.includes(ext)) return 'browser';
    if (officeTypes.includes(ext)) return 'office';
    return 'download';
  }
}
