import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { IGiftedAsset } from '../models/IGiftedAsset';
import { stripMetadata } from '../utils/SharePointUtils';

const LIST = 'Asset_Gifted';

const SELECT = [
  'Id', 'Title', 'AssetItemId', 'GiftedTo', 'GiftedDate',
  'GiftAttachmentUrl', 'GiftRemarks',
];

export class AssetGiftedService {
  constructor(private _sp: SPFI) {}

  async getGiftedByAsset(assetId: string): Promise<IGiftedAsset | null> {
    const results = await this._sp.web.lists
      .getByTitle(LIST)
      .items.filter(`Title eq '${assetId.replace(/'/g, "''")}'`)
      .select(...SELECT)
      .top(1)() as IGiftedAsset[];
    return results.length > 0 ? results[0] : null;
  }

  async addGifted(entry: Omit<IGiftedAsset, 'Id'>): Promise<IGiftedAsset> {
    const result = await this._sp.web.lists
      .getByTitle(LIST)
      .items.add(entry);
    return { ...entry, Id: result.data.Id };
  }

  async updateGifted(id: number, changes: Partial<IGiftedAsset>): Promise<void> {
    const payload = stripMetadata(changes as Record<string, unknown>);
    await this._sp.web.lists
      .getByTitle(LIST)
      .items.getById(id)
      .update(payload);
  }
}
