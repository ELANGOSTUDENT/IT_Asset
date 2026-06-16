import * as React from 'react';
import { IAsset } from '../models/IAsset';
interface IDashboardProps {
    assets: IAsset[];
    onViewAll: () => void;
    onViewAsset: (asset: IAsset) => void;
}
declare const Dashboard: React.FC<IDashboardProps>;
export default Dashboard;
//# sourceMappingURL=Dashboard.d.ts.map