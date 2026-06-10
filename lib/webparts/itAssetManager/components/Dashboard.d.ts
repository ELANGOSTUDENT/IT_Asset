import * as React from 'react';
import { AssetService } from '../services/AssetService';
import { IAsset } from '../models/IAsset';
interface IDashboardProps {
    assets: IAsset[];
    assetService: AssetService;
    onViewAll: () => void;
    onViewAsset: (asset: IAsset) => void;
}
declare const Dashboard: React.FC<IDashboardProps>;
export default Dashboard;
//# sourceMappingURL=Dashboard.d.ts.map