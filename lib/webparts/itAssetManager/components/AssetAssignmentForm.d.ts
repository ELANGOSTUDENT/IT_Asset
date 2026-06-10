import * as React from 'react';
import { IAsset } from '../models/IAsset';
import { IAssetAssignment } from '../models/IAssetAssignment';
import { AssetAssignmentService } from '../services/AssetAssignmentService';
interface IAssetAssignmentFormProps {
    asset: IAsset;
    existingAssignment?: IAssetAssignment;
    assignmentService: AssetAssignmentService;
    onSave: (assignment: IAssetAssignment) => Promise<void>;
    onCancel: () => void;
}
declare const AssetAssignmentForm: React.FC<IAssetAssignmentFormProps>;
export default AssetAssignmentForm;
//# sourceMappingURL=AssetAssignmentForm.d.ts.map