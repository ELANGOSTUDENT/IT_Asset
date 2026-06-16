export declare class AssetIdGenerator {
    /**
     * Generates an Asset ID in the format: ZRX-COUNTRY-CITY-SITE-ASSETTYPE-NNNN
     * Example: ZRX-IN-CHN-GIC-MAC-0001
     *
     * City code is derived from officeCode — no separate CityCode column required.
     */
    static generate(country: string, officeCode: string, assetType: string, sequence: number): string;
    /**
     * Parses an Asset ID and returns its sequence number.
     * Supports both formats for backward compatibility:
     *   New: ZRX-IN-CHN-GIC-MAC-0001 (6 parts, starts with ZRX)
     *   Old: IN-CHN-26-LAP-0001       (5 parts)
     */
    static parse(assetId: string): {
        sequence: number;
    } | null;
    static daysUntilWarrantyExpiry(warrantyExpiry: string): number;
    static formatDate(isoDate: string): string;
}
//# sourceMappingURL=AssetIdGenerator.d.ts.map