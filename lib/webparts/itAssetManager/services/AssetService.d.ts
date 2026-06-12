import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/site-users/web';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IAsset, AssetStatus } from '../models/IAsset';
import { IAssetHistory } from '../models/IAssetHistory';
export declare class AssetService {
    private _sp;
    constructor(context: WebPartContext);
    getAssets(): Promise<IAsset[]>;
    getAssetById(id: number): Promise<IAsset>;
    getNextSequenceNumber(type: string, country: string, office: string): Promise<number>;
    addAsset(asset: Omit<IAsset, 'Id' | 'Title' | 'SequenceNumber'>): Promise<IAsset>;
    updateAsset(id: number, changes: Partial<IAsset>): Promise<void>;
    deleteAsset(id: number): Promise<void>;
    changeStatus(params: {
        assetId: string;
        itemId: number;
        previousStatus: AssetStatus;
        newStatus: AssetStatus;
        notes: string;
        changedBy: string;
        /** Additional field updates (e.g. AssignedTo on Active) */
        extraFields?: Partial<IAsset>;
    }): Promise<void>;
    getAssetHistory(assetId: string): Promise<IAssetHistory[]>;
    private _logHistory;
    getDashboardStats(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        byDept: Record<string, number>;
        warrantyExpiringSoon: number;
    }>;
    getWarrantyExpiring(days?: number): Promise<IAsset[]>;
    getRecentHistory(limit?: number): Promise<IAssetHistory[]>;
    searchUsers(query: string): Promise<{
        displayName: string;
        email: string;
    }[]>;
}
//# sourceMappingURL=AssetService.d.ts.map