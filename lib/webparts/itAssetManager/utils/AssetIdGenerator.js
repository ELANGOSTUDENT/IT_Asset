// City code derived from site/office code — no CityCode SharePoint column needed
var CITY_FROM_OFFICE = {
    GIC: 'CHN',
    UWB: 'GRG',
    UWK: 'PUN',
    NYC: 'NYC',
    BOS: 'BOS',
};
var AssetIdGenerator = /** @class */ (function () {
    function AssetIdGenerator() {
    }
    /**
     * Generates an Asset ID in the format: ZRX-COUNTRY-CITY-SITE-ASSETTYPE-NNNN
     * Example: ZRX-IN-CHN-GIC-MAC-0001
     *
     * City code is derived from officeCode — no separate CityCode column required.
     */
    AssetIdGenerator.generate = function (country, officeCode, assetType, sequence) {
        var office = officeCode.toUpperCase();
        var city = CITY_FROM_OFFICE[office];
        if (!city) {
            throw new Error("Unknown office code \"".concat(officeCode, "\". Valid codes: ").concat(Object.keys(CITY_FROM_OFFICE).join(', '), "."));
        }
        var seq = String(sequence).padStart(4, '0');
        return "ZRX-".concat(country.toUpperCase(), "-").concat(city, "-").concat(office, "-").concat(assetType.toUpperCase(), "-").concat(seq);
    };
    /**
     * Parses an Asset ID and returns its sequence number.
     * Supports both formats for backward compatibility:
     *   New: ZRX-IN-CHN-GIC-MAC-0001 (6 parts, starts with ZRX)
     *   Old: IN-CHN-26-LAP-0001       (5 parts)
     */
    AssetIdGenerator.parse = function (assetId) {
        if (!assetId)
            return null;
        var parts = assetId.split('-');
        // New format: ZRX-IN-CHN-GIC-MAC-0001
        if (parts.length === 6 && parts[0] === 'ZRX') {
            var seq = parseInt(parts[5], 10);
            return isNaN(seq) ? null : { sequence: seq };
        }
        // Old format: IN-CHN-26-LAP-0001
        if (parts.length === 5) {
            var seq = parseInt(parts[4], 10);
            return isNaN(seq) ? null : { sequence: seq };
        }
        return null;
    };
    AssetIdGenerator.daysUntilWarrantyExpiry = function (warrantyExpiry) {
        if (!warrantyExpiry)
            return 9999;
        var expiry = new Date(warrantyExpiry);
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };
    AssetIdGenerator.formatDate = function (isoDate) {
        if (!isoDate)
            return '—';
        var d = new Date(isoDate);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    return AssetIdGenerator;
}());
export { AssetIdGenerator };
//# sourceMappingURL=AssetIdGenerator.js.map