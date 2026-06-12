import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import { IAttachment, AttachmentCategory } from '../models/IAttachment';
export interface IUploadResult {
    serverRelativeUrl: string;
    absoluteUrl: string;
    fileName: string;
}
export declare class FileUploadService {
    private _sp;
    private _siteRelUrl;
    constructor(_sp: SPFI, siteRelUrl: string);
    private folderPath;
    ensureFolder(assetId: string, sub: AttachmentCategory): Promise<void>;
    upload(assetId: string, sub: AttachmentCategory, file: File): Promise<IUploadResult>;
    deleteFile(serverRelativeUrl: string): Promise<void>;
    getAbsoluteUrl(serverRelativeUrl: string): string;
    listFiles(assetId: string): Promise<IAttachment[]>;
    getFilesByCategory(assetId: string): Promise<Record<AttachmentCategory, IAttachment[]>>;
    private _getPreviewType;
}
//# sourceMappingURL=FileUploadService.d.ts.map