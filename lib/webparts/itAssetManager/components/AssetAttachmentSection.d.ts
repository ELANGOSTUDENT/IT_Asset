import * as React from 'react';
import { FileUploadService } from '../services/FileUploadService';
import { IAsset } from '../models/IAsset';
import { IRepairEntry } from '../models/IRepairEntry';
interface IAssetAttachmentSectionProps {
    assetId: string;
    asset: IAsset;
    repairs: IRepairEntry[];
    fileService: FileUploadService;
}
declare const AssetAttachmentSection: React.FC<IAssetAttachmentSectionProps>;
export default AssetAttachmentSection;
//# sourceMappingURL=AssetAttachmentSection.d.ts.map