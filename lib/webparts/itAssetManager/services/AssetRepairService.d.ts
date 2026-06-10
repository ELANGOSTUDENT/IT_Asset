import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { IRepairEntry } from '../models/IRepairEntry';
export declare class AssetRepairService {
    private _sp;
    constructor(_sp: SPFI);
    getRepairs(assetId: string): Promise<IRepairEntry[]>;
    addRepair(entry: Omit<IRepairEntry, 'Id'>): Promise<IRepairEntry>;
    updateRepair(id: number, changes: Partial<IRepairEntry>): Promise<void>;
    deleteRepair(id: number): Promise<void>;
}
//# sourceMappingURL=AssetRepairService.d.ts.map