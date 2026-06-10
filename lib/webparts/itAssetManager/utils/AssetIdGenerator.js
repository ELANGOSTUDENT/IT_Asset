var AssetIdGenerator = /** @class */ (function () {
    function AssetIdGenerator() {
    }
    /**
     * Generates an Asset ID in the format: COUNTRY-OFFICE-YY-TYPE-NNNN
     * Example: IN-CHN-26-LAP-0001
     */
    AssetIdGenerator.generate = function (type, country, office, sequence, date) {
        var yr = (date || new Date()).getFullYear().toString().slice(-2);
        var seq = String(sequence).padStart(4, '0');
        return "".concat(country.toUpperCase(), "-").concat(office.toUpperCase(), "-").concat(yr, "-").concat(type, "-").concat(seq);
    };
    /** Parses an Asset ID back into its components, returns null if malformed. */
    AssetIdGenerator.parse = function (assetId) {
        if (!assetId)
            return null;
        var parts = assetId.split('-');
        if (parts.length !== 5)
            return null;
        var seq = parseInt(parts[4], 10);
        if (isNaN(seq))
            return null;
        return {
            country: parts[0],
            office: parts[1],
            year: parts[2],
            type: parts[3],
            sequence: seq,
        };
    };
    /** Returns the COUNTRY-OFFICE-YY-TYPE prefix for filtering by sequence. */
    AssetIdGenerator.getPrefix = function (type, country, office, date) {
        var yr = (date || new Date()).getFullYear().toString().slice(-2);
        return "".concat(country.toUpperCase(), "-").concat(office.toUpperCase(), "-").concat(yr, "-").concat(type, "-");
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