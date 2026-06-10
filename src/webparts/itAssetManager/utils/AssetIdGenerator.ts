import { AssetType } from '../models/IAsset';

export class AssetIdGenerator {
  /**
   * Generates an Asset ID in the format: COUNTRY-OFFICE-YY-TYPE-NNNN
   * Example: IN-CHN-26-LAP-0001
   */
  static generate(
    type: AssetType,
    country: string,
    office: string,
    sequence: number,
    date?: Date
  ): string {
    const yr = (date || new Date()).getFullYear().toString().slice(-2);
    const seq = String(sequence).padStart(4, '0');
    return `${country.toUpperCase()}-${office.toUpperCase()}-${yr}-${type}-${seq}`;
  }

  /** Parses an Asset ID back into its components, returns null if malformed. */
  static parse(assetId: string): {
    country: string;
    office: string;
    year: string;
    type: string;
    sequence: number;
  } | null {
    if (!assetId) return null;
    const parts = assetId.split('-');
    if (parts.length !== 5) return null;
    const seq = parseInt(parts[4], 10);
    if (isNaN(seq)) return null;
    return {
      country: parts[0],
      office: parts[1],
      year: parts[2],
      type: parts[3],
      sequence: seq,
    };
  }

  /** Returns the COUNTRY-OFFICE-YY-TYPE prefix for filtering by sequence. */
  static getPrefix(type: AssetType, country: string, office: string, date?: Date): string {
    const yr = (date || new Date()).getFullYear().toString().slice(-2);
    return `${country.toUpperCase()}-${office.toUpperCase()}-${yr}-${type}-`;
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
