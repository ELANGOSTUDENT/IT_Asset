import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/folders';
import '@pnp/sp/files';

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
}
