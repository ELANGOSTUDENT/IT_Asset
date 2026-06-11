import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { IAssetAssignment } from '../models/IAssetAssignment';

const ASSIGNMENTS_LIST = 'Asset_Assignments';
const ASSETS_LIST = 'IT_Assets';

const SELECT = [
  'Id', 'Title', 'AssetItemId', 'SerialNumber',
  'AssignedTo', 'AssignedToEmail', 'Department', 'AssetLocation',
  'DateOfAssignment', 'LastMaintenanceDate', 'NextMaintenanceDate',
  'MaintenanceNotes', 'AssignmentRemarks', 'IsActive',
];

export class AssetAssignmentService {
  constructor(private _sp: SPFI) {}

  async getActiveAssignment(assetId: string): Promise<IAssetAssignment | null> {
    const results = await this._sp.web.lists
      .getByTitle(ASSIGNMENTS_LIST)
      .items.filter(`Title eq '${assetId.replace(/'/g, "''")}' and IsActive eq 1`)
      .select(...SELECT)
      .top(1)() as IAssetAssignment[];
    return results.length > 0 ? results[0] : null;
  }

  async getAllAssignments(assetId: string): Promise<IAssetAssignment[]> {
    return this._sp.web.lists
      .getByTitle(ASSIGNMENTS_LIST)
      .items.filter(`Title eq '${assetId.replace(/'/g, "''")}'`)
      .select(...SELECT)
      .orderBy('DateOfAssignment', false)
      .top(200)() as Promise<IAssetAssignment[]>;
  }

  async addAssignment(assignment: Omit<IAssetAssignment, 'Id'>): Promise<IAssetAssignment> {
    // Deactivate any existing active assignment first
    await this.deactivateExisting(assignment.Title);
    const result = await this._sp.web.lists
      .getByTitle(ASSIGNMENTS_LIST)
      .items.add({ ...assignment, IsActive: true });
    // Sync denormalized fields to IT_Assets
    await this._syncITAssets(assignment.AssetItemId, assignment);
    return { ...assignment, Id: result.data.Id };
  }

  async updateAssignment(id: number, changes: Partial<IAssetAssignment>): Promise<void> {
    await this._sp.web.lists
      .getByTitle(ASSIGNMENTS_LIST)
      .items.getById(id)
      .update(changes);
    if (changes.AssetItemId) {
      await this._syncITAssets(changes.AssetItemId, changes);
    }
  }

  private async deactivateExisting(assetId: string): Promise<void> {
    const existing = await this._sp.web.lists
      .getByTitle(ASSIGNMENTS_LIST)
      .items.filter(`Title eq '${assetId.replace(/'/g, "''")}' and IsActive eq 1`)
      .select('Id')
      .top(10)() as { Id: number }[];
    await Promise.all(
      existing.map(item =>
        this._sp.web.lists.getByTitle(ASSIGNMENTS_LIST).items.getById(item.Id).update({ IsActive: false })
      )
    );
  }

  /** Sync assignment fields to the IT_Assets list item so detail view is up to date. */
  private async _syncITAssets(assetItemId: number, data: Partial<IAssetAssignment>): Promise<void> {
    const fields: Record<string, string | undefined> = {};
    if (data.AssignedTo !== undefined)      fields.AssignedTo      = data.AssignedTo;
    if (data.AssignedToEmail !== undefined) fields.AssignedToEmail = data.AssignedToEmail;
    if (data.Department !== undefined)       fields.Department      = data.Department;
    if (data.AssetLocation !== undefined)    fields.AssetLocation   = data.AssetLocation;
    if (data.DateOfAssignment !== undefined) fields.DateOfAssignment = data.DateOfAssignment;
    if (Object.keys(fields).length === 0) return;
    await this._sp.web.lists
      .getByTitle(ASSETS_LIST)
      .items.getById(assetItemId)
      .update(fields);
  }
}
