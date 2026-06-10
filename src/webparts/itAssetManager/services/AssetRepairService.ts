import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { IRepairEntry } from '../models/IRepairEntry';

const LIST = 'Asset_Repairs';

const SELECT = [
  'Id', 'Title', 'AssetItemId', 'RepairDate', 'RepairVendor',
  'IssueDescription', 'RepairCost', 'RepairInvoiceNumber',
  'AttachmentUrl', 'AttachmentName',
];

export class AssetRepairService {
  constructor(private _sp: SPFI) {}

  async getRepairs(assetId: string): Promise<IRepairEntry[]> {
    return this._sp.web.lists
      .getByTitle(LIST)
      .items.filter(`Title eq '${assetId.replace(/'/g, "''")}'`)
      .select(...SELECT)
      .orderBy('RepairDate', false)
      .top(200)() as Promise<IRepairEntry[]>;
  }

  async addRepair(entry: Omit<IRepairEntry, 'Id'>): Promise<IRepairEntry> {
    const result = await this._sp.web.lists
      .getByTitle(LIST)
      .items.add(entry);
    return { ...entry, Id: result.data.Id };
  }

  async updateRepair(id: number, changes: Partial<IRepairEntry>): Promise<void> {
    await this._sp.web.lists
      .getByTitle(LIST)
      .items.getById(id)
      .update(changes);
  }

  async deleteRepair(id: number): Promise<void> {
    await this._sp.web.lists
      .getByTitle(LIST)
      .items.getById(id)
      .recycle();
  }
}
