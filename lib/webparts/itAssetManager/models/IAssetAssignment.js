export var emptyAssignment = function (assetId, assetItemId, serialNumber) { return ({
    Title: assetId,
    AssetItemId: assetItemId,
    SerialNumber: serialNumber,
    AssignedTo: '',
    AssignedToEmail: '',
    Department: '',
    AssetLocation: '',
    DateOfAssignment: new Date().toISOString().slice(0, 10),
    IsActive: true,
}); };
//# sourceMappingURL=IAssetAssignment.js.map