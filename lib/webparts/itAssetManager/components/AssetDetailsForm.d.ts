import * as React from 'react';
import { IAsset } from '../models/IAsset';
import { AssetService } from '../services/AssetService';
import { AssetRepairService } from '../services/AssetRepairService';
import { FileUploadService } from '../services/FileUploadService';
interface IAssetDetailsFormProps {
    asset?: IAsset;
    defaultCountry: string;
    defaultOffice: string;
    assetService: AssetService;
    repairService: AssetRepairService;
    fileService: FileUploadService;
    onSave: (asset: IAsset) => Promise<void>;
    onCancel: () => void;
}
declare const AssetDetailsForm: React.FC<IAssetDetailsFormProps>;
export default AssetDetailsForm;
//# sourceMappingURL=AssetDetailsForm.d.ts.map