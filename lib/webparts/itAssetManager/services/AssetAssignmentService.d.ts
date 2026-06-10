import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { IAssetAssignment } from '../models/IAssetAssignment';
export declare class AssetAssignmentService {
    private _sp;
    constructor(_sp: SPFI);
    getActiveAssignment(assetId: string): Promise<IAssetAssignment | null>;
    getAllAssignments(assetId: string): Promise<IAssetAssignment[]>;
    addAssignment(assignment: Omit<IAssetAssignment, 'Id'>): Promise<IAssetAssignment>;
    updateAssignment(id: number, changes: Partial<IAssetAssignment>): Promise<void>;
    private deactivateExisting;
}
//# sourceMappingURL=AssetAssignmentService.d.ts.map