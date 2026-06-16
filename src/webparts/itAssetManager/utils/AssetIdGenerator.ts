// City code derived from site/office code — no CityCode SharePoint column needed
const CITY_FROM_OFFICE: Record<string, string> = {
  GIC: 'CHN',
  UWB: 'GRG',
  UWK: 'PUN',
  NYC: 'NYC',
  BOS: 'BOS',
};

export class AssetIdGenerator {
  /**
   * Generates an Asset ID in the format: ZRX-COUNTRY-CITY-SITE-ASSETTYPE-NNNN
   * Example: ZRX-IN-CHN-GIC-MAC-0001
   *
   * City code is derived from officeCode — no separate CityCode column required.
   */
  static generate(country: string, officeCode: string, assetType: string, sequence: number): string {
    const office = officeCode.toUpperCase();
    const city = CITY_FROM_OFFICE[office];
    if (!city) {
      throw new Error(
        `Unknown office code "${officeCode}". Valid codes: ${Object.keys(CITY_FROM_OFFICE).join(', ')}.`
      );
    }
    const seq = String(sequence).padStart(4, '0');
    return `ZRX-${country.toUpperCase()}-${city}-${office}-${assetType.toUpperCase()}-${seq}`;
  }

  /**
   * Parses an Asset ID and returns its sequence number.
   * Supports both formats for backward compatibility:
   *   New: ZRX-IN-CHN-GIC-MAC-0001 (6 parts, starts with ZRX)
   *   Old: IN-CHN-26-LAP-0001       (5 parts)
   */
  static parse(assetId: string): { sequence: number } | null {
    if (!assetId) return null;
    const parts = assetId.split('-');
    // New format: ZRX-IN-CHN-GIC-MAC-0001
    if (parts.length === 6 && parts[0] === 'ZRX') {
      const seq = parseInt(parts[5], 10);
      return isNaN(seq) ? null : { sequence: seq };
    }
    // Old format: IN-CHN-26-LAP-0001
    if (parts.length === 5) {
      const seq = parseInt(parts[4], 10);
      return isNaN(seq) ? null : { sequence: seq };
    }
    return null;
  }

  static daysUntilWarrantyExpiry(warrantyExpiry: string): number {
    if (!warrantyExpiry) return 9999;
    const expiry = new Date(warrantyExpiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  static formatDate(isoDate: string): string {
    if (!isoDate) return '—';
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
