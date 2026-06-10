import * as React from 'react';
import { IAsset } from '../models/IAsset';
interface IAssetTableProps {
    assets: IAsset[];
    loading: boolean;
    onAddNew: () => void;
    onView: (asset: IAsset) => void;
    onEdit: (asset: IAsset) => void;
    onRefresh: () => void;
}
declare const AssetTable: React.FC<IAssetTableProps>;
export default AssetTable;
//# sourceMappingURL=AssetTable.d.ts.map