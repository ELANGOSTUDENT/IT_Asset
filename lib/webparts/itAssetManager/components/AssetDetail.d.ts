import * as React from 'react';
import { IAsset, AssetStatus } from '../models/IAsset';
import { IAssetAssignment } from '../models/IAssetAssignment';
import { AssetService } from '../services/AssetService';
import { AssetRepairService } from '../services/AssetRepairService';
import { AssetAssignmentService } from '../services/AssetAssignmentService';
interface IAssetDetailProps {
    asset: IAsset;
    assetService: AssetService;
    repairService: AssetRepairService;
    assignmentService: AssetAssignmentService;
    currentUser: string;
    onBack: () => void;
    onEdit: () => void;
    onEditAssignment: (assignment: IAssetAssignment | null) => void;
    onStatusChange: (asset: IAsset, newStatus: AssetStatus, notes: string) => Promise<void>;
}
declare const AssetDetail: React.FC<IAssetDetailProps>;
export default AssetDetail;
//# sourceMappingURL=AssetDetail.d.ts.map