import * as React from 'react';
import { IAsset } from '../models/IAsset';
import { AssetService } from '../services/AssetService';
interface IAssetFormProps {
    asset?: IAsset;
    defaultCountry: string;
    defaultOffice: string;
    assetService: AssetService;
    onSave: (asset: IAsset | Partial<IAsset>) => Promise<void>;
    onCancel: () => void;
}
declare const AssetForm: React.FC<IAssetFormProps>;
export default AssetForm;
//# sourceMappingURL=AssetForm.d.ts.map