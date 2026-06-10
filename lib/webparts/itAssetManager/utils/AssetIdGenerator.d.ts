import { AssetType } from '../models/IAsset';
export declare class AssetIdGenerator {
    /**
     * Generates an Asset ID in the format: COUNTRY-OFFICE-YY-TYPE-NNNN
     * Example: IN-CHN-26-LAP-0001
     */
    static generate(type: AssetType, country: string, office: string, sequence: number, date?: Date): string;
    /** Parses an Asset ID back into its components, returns null if malformed. */
    static parse(assetId: string): {
        country: string;
        office: string;
        year: string;
        type: string;
        sequence: number;
    } | null;
    /** Returns the COUNTRY-OFFICE-YY-TYPE prefix for filtering by sequence. */
    static getPrefix(type: AssetType, country: string, office: string, date?: Date): string;
    static daysUntilWarrantyExpiry(warrantyExpiry: string): number;
    static formatDate(isoDate: string): string;
}
//# sourceMappingURL=AssetIdGenerator.d.ts.map