var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var PowerAutomateService = /** @class */ (function () {
    function PowerAutomateService(_cfg) {
        this._cfg = _cfg;
    }
    PowerAutomateService.prototype._trigger = function (url, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!url)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetch(url, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(__assign(__assign({}, payload), { source: 'IT-Asset-Manager-SPFx', timestamp: new Date().toISOString() })),
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.error('[PA Webhook] Failed:', url, err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /** Fires when an asset moves to Active with an assignee. */
    PowerAutomateService.prototype.onAssetAssigned = function (asset, triggeredBy) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._trigger(this._cfg.assignmentWebhook, {
                            event: 'AssetAssigned',
                            assetId: asset.Title,
                            assetType: asset.AssetType,
                            model: asset.Model,
                            serialNumber: asset.SerialNumber,
                            assignedTo: asset.AssignedTo,
                            assignedToEmail: asset.AssignedToEmail,
                            department: asset.Department,
                            location: asset.AssetLocation,
                            triggeredBy: triggeredBy,
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Fires when status changes to Lost or Stolen. */
    PowerAutomateService.prototype.onDeviceLostOrStolen = function (asset, status, reportedBy) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._trigger(this._cfg.lostDeviceWebhook, {
                            event: status === 'Lost' ? 'DeviceLost' : 'DeviceStolen',
                            assetId: asset.Title,
                            assetType: asset.AssetType,
                            model: asset.Model,
                            serialNumber: asset.SerialNumber,
                            lastAssignedTo: asset.AssignedTo,
                            lastAssignedEmail: asset.AssignedToEmail,
                            department: asset.Department,
                            cost: asset.Cost,
                            reportedBy: reportedBy,
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Fires with a batch of assets whose warranty expires within threshold. */
    PowerAutomateService.prototype.onWarrantyExpirySoon = function (assets) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!assets.length)
                            return [2 /*return*/];
                        return [4 /*yield*/, this._trigger(this._cfg.warrantyExpiryWebhook, {
                                event: 'WarrantyExpirySoon',
                                count: assets.length,
                                assets: assets.map(function (a) { return ({
                                    assetId: a.Title,
                                    model: a.Model,
                                    serialNumber: a.SerialNumber,
                                    assignedTo: a.AssignedTo,
                                    warrantyExpiry: a.WarrantyExpiry,
                                }); }),
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Fires when an asset is moved to Scrapped or Disposed. */
    PowerAutomateService.prototype.onScrapOrDispose = function (asset, newStatus, disposedBy) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._trigger(this._cfg.scrapEwasteWebhook, {
                            event: newStatus === 'Scrapped' ? 'AssetScrapped' : 'AssetDisposed',
                            assetId: asset.Title,
                            assetType: asset.AssetType,
                            model: asset.Model,
                            vendor: asset.Vendor,
                            serialNumber: asset.SerialNumber,
                            purchaseDate: asset.PurchaseDate,
                            cost: asset.Cost,
                            department: asset.Department,
                            disposedBy: disposedBy,
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return PowerAutomateService;
}());
export { PowerAutomateService };
//# sourceMappingURL=PowerAutomateService.js.map