import { IAsset } from '../models/IAsset';
export interface IPowerAutomateConfig {
    assignmentWebhook: string;
    lostDeviceWebhook: string;
    warrantyExpiryWebhook: string;
    scrapEwasteWebhook: string;
}
export declare class PowerAutomateService {
    private _cfg;
    constructor(_cfg: IPowerAutomateConfig);
    private _trigger;
    /** Fires when an asset moves to Active with an assignee. */
    onAssetAssigned(asset: IAsset, triggeredBy: string): Promise<void>;
    /** Fires when status changes to Lost or Stolen. */
    onDeviceLostOrStolen(asset: IAsset, status: 'Lost' | 'Stolen', reportedBy: string): Promise<void>;
    /** Fires with a batch of assets whose warranty expires within threshold. */
    onWarrantyExpirySoon(assets: IAsset[]): Promise<void>;
    /** Fires when an asset is moved to Scrapped or Disposed. */
    onScrapOrDispose(asset: IAsset, newStatus: 'Scrapped' | 'Disposed', disposedBy: string): Promise<void>;
}
//# sourceMappingURL=PowerAutomateService.d.ts.map