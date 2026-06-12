import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { IScrapAsset } from '../models/IScrapAsset';
import { stripMetadata } from '../utils/SharePointUtils';

const LIST = 'Asset_Scrap';

const SELECT = [
  'Id', 'Title', 'AssetItemId', 'ScrapDate', 'ScrapVendor',
  'ScrapAmount', 'ScrapAttachmentUrl', 'ScrapRemarks',
];

export class AssetScrapService {
  constructor(private _sp: SPFI) {}

  async getScrapByAsset(assetId: string): Promise<IScrapAsset | null> {
    const results = await this._sp.web.lists
      .getByTitle(LIST)
      .items.filter(`Title eq '${assetId.replace(/'/g, "''")}'`)
      .select(...SELECT)
      .top(1)() as IScrapAsset[];
    return results.length > 0 ? results[0] : null;
  }

  async addScrap(entry: Omit<IScrapAsset, 'Id'>): Promise<IScrapAsset> {
    const result = await this._sp.web.lists
      .getByTitle(LIST)
      .items.add(entry);
    return { ...entry, Id: result.data.Id };
  }

  async updateScrap(id: number, changes: Partial<IScrapAsset>): Promise<void> {
    const payload = stripMetadata(changes as Record<string, unknown>);
    await this._sp.web.lists
      .getByTitle(LIST)
      .items.getById(id)
      .update(payload);
  }
}
