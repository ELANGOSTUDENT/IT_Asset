import { spfi, SPFI } from '@pnp/sp';
import { SPFx } from '@pnp/sp/behaviors/spfx';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/site-users/web';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IAsset, AssetStatus } from '../models/IAsset';
import { IAssetHistory } from '../models/IAssetHistory';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import { stripMetadata } from '../utils/SharePointUtils';

const ASSETS_LIST = 'IT_Assets';
const HISTORY_LIST = 'Asset_History';

const ASSET_SELECT = [
  'Id', 'Title', 'SerialNumber', 'Model', 'Vendor', 'PONumber', 'InvoiceNumber',
  'Cost', 'PurchaseDate', 'WarrantyExpiry', 'AssignedTo', 'AssignedToEmail',
  'Department', 'AssetLocation', 'Country', 'OfficeCode', 'Status', 'AssetType',
  'Remarks', 'SequenceNumber', 'Created', 'Modified',
  // Procurement attachment
  'PurchaseBillUrl',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapAsset = (item: any): IAsset => ({
  ...item,
  AssignedTo: item.AssignedTo || '',
  AssignedToEmail: item.AssignedToEmail || '',
});

export class AssetService {
  private _sp: SPFI;

  constructor(context: WebPartContext) {
    this._sp = spfi().using(SPFx(context));
  }

  // ----------------------------------------------------------------
  // Asset CRUD
  // ----------------------------------------------------------------

  async getAssets(): Promise<IAsset[]> {
    const items = await this._sp.web.lists
      .getByTitle(ASSETS_LIST)
      .items.select(...ASSET_SELECT)
      .top(5000)
      .orderBy('Created', false)();
    return items.map(mapAsset);
  }

  async getAssetById(id: number): Promise<IAsset> {
    const item = await this._sp.web.lists
      .getByTitle(ASSETS_LIST)
      .items.getById(id)
      .select(...ASSET_SELECT)();
    return mapAsset(item);
  }

  async getNextSequenceNumber(type: string, country: string, office: string): Promise<number> {
    const prefix = AssetIdGenerator.getPrefix(type as any, country, office);
    console.log(`[AssetService] getNextSequenceNumber — prefix: "${prefix}"`);

    // Fetch all items matching this prefix so we can derive the true max from both
    // SequenceNumber and the numeric suffix in Title (fallback if SequenceNumber is null).
    const items = await this._sp.web.lists
      .getByTitle(ASSETS_LIST)
      .items.filter(`startswith(Title,'${prefix}')`)
      .select('Title', 'SequenceNumber')
      .top(5000)();

    if (!items.length) {
      console.log(`[AssetService] No existing assets found for prefix "${prefix}" — starting at 1`);
      return 1;
    }

    console.log(`[AssetService] Found ${items.length} existing asset(s) for prefix "${prefix}"`);

    let maxSeq = 0;
    for (const item of items) {
      // Primary: SequenceNumber field
      if (item.SequenceNumber != null && item.SequenceNumber > maxSeq) {
        maxSeq = item.SequenceNumber;
      }
      // Fallback: parse numeric suffix from Title (handles null SequenceNumber)
      const parsed = AssetIdGenerator.parse(item.Title);
      if (parsed && parsed.sequence > maxSeq) {
        console.log(`[AssetService] Fallback parse: Title="${item.Title}" → sequence=${parsed.sequence}`);
        maxSeq = parsed.sequence;
      }
    }

    const next = maxSeq + 1;
    console.log(`[AssetService] Max SequenceNumber found: ${maxSeq} — next sequence: ${next}`);
    return next;
  }

  async addAsset(asset: Omit<IAsset, 'Id' | 'Title' | 'SequenceNumber'>): Promise<IAsset & { historyWarning?: string }> {
    let seq = await this.getNextSequenceNumber(asset.AssetType, asset.Country, asset.OfficeCode);
    let assetId = AssetIdGenerator.generate(asset.AssetType, asset.Country, asset.OfficeCode, seq);

    // Duplicate guard: keep incrementing until the generated ID is unused.
    // Protects against stale data or concurrent creates arriving in the same second.
    for (let attempt = 0; attempt < 20; attempt++) {
      const existing = await this._sp.web.lists
        .getByTitle(ASSETS_LIST)
        .items.filter(`Title eq '${assetId}'`)
        .select('Title')
        .top(1)();
      if (!existing.length) break;
      console.warn(`[AssetService] Asset ID "${assetId}" already exists (attempt ${attempt + 1}) — incrementing`);
      seq++;
      assetId = AssetIdGenerator.generate(asset.AssetType, asset.Country, asset.OfficeCode, seq);
    }

    console.log(`[AssetService] Final generated Asset ID: "${assetId}", SequenceNumber: ${seq}`);

    const payload = { ...asset, Title: assetId, SequenceNumber: seq };
    const result = await this._sp.web.lists.getByTitle(ASSETS_LIST).items.add(payload);

    const historyOk = await this._logHistory({
      Title: assetId,
      AssetItemId: result.data.Id,
      NewStatus: asset.Status,
      ChangedBy: 'System',
      ChangeDate: new Date().toISOString(),
      HistoryNotes: 'Asset created and entered into the system.',
    });

    const created: IAsset & { historyWarning?: string } = { ...payload, Id: result.data.Id };
    if (!historyOk) {
      created.historyWarning = 'Asset created, but history logging failed. Verify Asset_History list column names match: AssetItemId, NewStatus, ChangedBy, ChangeDate, HistoryNotes.';
    }
    return created;
  }

  async updateAsset(id: number, changes: Partial<IAsset>): Promise<void> {
    // Strip odata annotations and SP system fields before sending to avoid InvalidClientQueryException
    const payload = stripMetadata(changes as Record<string, unknown>);
    await this._sp.web.lists.getByTitle(ASSETS_LIST).items.getById(id).update(payload);
  }

  async deleteAsset(id: number): Promise<void> {
    await this._sp.web.lists.getByTitle(ASSETS_LIST).items.getById(id).recycle();
  }

  // ----------------------------------------------------------------
  // Status lifecycle
  // ----------------------------------------------------------------

  async changeStatus(params: {
    assetId: string;
    itemId: number;
    previousStatus: AssetStatus;
    newStatus: AssetStatus;
    notes: string;
    changedBy: string;
    /** Additional field updates (e.g. AssignedTo on Active) */
    extraFields?: Partial<IAsset>;
  }): Promise<{ historyWarning?: string }> {
    const { assetId, itemId, previousStatus, newStatus, notes, changedBy, extraFields } = params;
    await this.updateAsset(itemId, { Status: newStatus, ...extraFields });
    const historyOk = await this._logHistory({
      Title: assetId,
      AssetItemId: itemId,
      PreviousStatus: previousStatus,
      NewStatus: newStatus,
      ChangedBy: changedBy,
      ChangeDate: new Date().toISOString(),
      HistoryNotes: notes,
    });
    return historyOk ? {} : { historyWarning: 'Status updated, but history logging failed. Verify Asset_History list column names match: PreviousStatus, NewStatus, ChangedBy, ChangeDate, HistoryNotes.' };
  }

  // ----------------------------------------------------------------
  // History
  // ----------------------------------------------------------------

  async getAssetHistory(assetId: string): Promise<IAssetHistory[]> {
    return this._sp.web.lists
      .getByTitle(HISTORY_LIST)
      .items.filter(`Title eq '${assetId}'`)
      .select('Id', 'Title', 'AssetItemId', 'PreviousStatus', 'NewStatus', 'ChangedBy', 'ChangeDate', 'HistoryNotes')
      .orderBy('ChangeDate', false)
      .top(200)();
  }

  private async _logHistory(history: Partial<IAssetHistory>): Promise<boolean> {
    try {
      await this._sp.web.lists.getByTitle(HISTORY_LIST).items.add(history);
      return true;
    } catch (e) {
      console.warn('[AssetService] History log failed — check Asset_History list column names:', e);
      return false;
    }
  }

  // ----------------------------------------------------------------
  // Dashboard & reporting
  // ----------------------------------------------------------------

  async getDashboardStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byDept: Record<string, number>;
    warrantyExpiringSoon: number;
  }> {
    try {
      const [all, expiring] = await Promise.all([
        this._sp.web.lists.getByTitle(ASSETS_LIST).items.top(5000)(),
        this.getWarrantyExpiring(90),
      ]);

      const byStatus: Record<string, number> = {};
      const byType:   Record<string, number> = {};
      const byDept:   Record<string, number> = {};

      all.forEach(item => {
        if (item.Status)     byStatus[item.Status]   = (byStatus[item.Status]   || 0) + 1;
        if (item.AssetType)  byType[item.AssetType]  = (byType[item.AssetType]  || 0) + 1;
        if (item.Department) byDept[item.Department] = (byDept[item.Department] || 0) + 1;
      });

      return { total: all.length, byStatus, byType, byDept, warrantyExpiringSoon: expiring.length };
    } catch {
      return { total: 0, byStatus: {}, byType: {}, byDept: {}, warrantyExpiringSoon: 0 };
    }
  }

  async getWarrantyExpiring(days: number = 90): Promise<IAsset[]> {
    try {
      const today  = new Date();
      const future = new Date();
      future.setDate(future.getDate() + days);

      return await this._sp.web.lists.getByTitle(ASSETS_LIST)
        .items.filter(
          `WarrantyExpiry ge '${today.toISOString()}' and WarrantyExpiry le '${future.toISOString()}' and Status eq 'Active'`
        )
        .top(500)();
    } catch {
      return [];
    }
  }

  async getRecentHistory(limit: number = 10): Promise<IAssetHistory[]> {
    try {
      return await this._sp.web.lists.getByTitle(HISTORY_LIST)
        .items.select('Id', 'Title', 'AssetItemId', 'PreviousStatus', 'NewStatus', 'ChangedBy', 'ChangeDate', 'HistoryNotes')
        .orderBy('ChangeDate', false)
        .top(limit)();
    } catch (e) {
      console.warn('[AssetService] getRecentHistory failed — check Asset_History list column names:', e);
      return [];
    }
  }

  // ----------------------------------------------------------------
  // People picker helper
  // ----------------------------------------------------------------

  async searchUsers(query: string): Promise<{ displayName: string; email: string }[]> {
    if (!query || query.length < 2) return [];
    try {
      const safe = query.replace(/'/g, "''");
      const results = await this._sp.web.siteUsers
        .filter(`substringof('${safe}', Title) or substringof('${safe}', Email)`)
        .select('Title', 'Email')
        .top(10)();
      return results.map(u => ({ displayName: u.Title, email: u.Email }));
    } catch {
      return [];
    }
  }
}
