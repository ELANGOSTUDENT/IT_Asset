export var emptyAssignment = function (assetId, assetItemId) { return ({
    Title: assetId,
    AssetItemId: assetItemId,
    AssignedTo: '',
    AssignedToEmail: '',
    Department: '',
    AssetLocation: '',
    DateOfAssignment: new Date().toISOString().slice(0, 10),
    IsActive: true,
}); };
//# sourceMappingURL=IAssetAssignment.js.map