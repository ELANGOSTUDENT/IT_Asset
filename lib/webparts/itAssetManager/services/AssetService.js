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
import { spfi } from '@pnp/sp';
import { SPFx } from '@pnp/sp/behaviors/spfx';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/site-users/web';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import { stripMetadata } from '../utils/SharePointUtils';
var ASSETS_LIST = 'IT_Assets';
var HISTORY_LIST = 'Asset_History';
var ASSET_SELECT = [
    'Id', 'Title', 'SerialNumber', 'Model', 'Vendor', 'PONumber', 'InvoiceNumber',
    'Cost', 'PurchaseDate', 'WarrantyExpiry', 'AssignedTo', 'AssignedToEmail',
    'Department', 'AssetLocation', 'Country', 'OfficeCode', 'Status', 'AssetType',
    'Remarks', 'SequenceNumber', 'Created', 'Modified',
    // Procurement
    'PurchaseBillUrl', 'ProcurementVendor',
    // 6.4 Hardware
    'Make', 'ModelType',
    // 6.7 Temporary assignment
    'IsTempAssignment', 'TempAssignedTo', 'TempAssignmentEmail',
    'TempAssignmentPurpose', 'TempStartDate', 'TempEndDate', 'TempReminderSent',
    // 6.8 Warranty & services
    'WarrantyStartDate', 'OEMEndOfServiceDate', 'WarrantyType', 'AddOnService',
    // 6.10 End of service
    'EndOfServiceDate', 'EndOfServiceReason', 'EosRemarks',
];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var mapAsset = function (item) { return (__assign(__assign({}, item), { AssignedTo: item.AssignedTo || '', AssignedToEmail: item.AssignedToEmail || '' })); };
var AssetService = /** @class */ (function () {
    function AssetService(context, siteUrl) {
        this._sp = siteUrl
            ? spfi(siteUrl).using(SPFx(context))
            : spfi().using(SPFx(context));
    }
    // ----------------------------------------------------------------
    // Asset CRUD
    // ----------------------------------------------------------------
    AssetService.prototype.getAssets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var items;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (_a = this._sp.web.lists
                            .getByTitle(ASSETS_LIST)
                            .items).select.apply(_a, ASSET_SELECT).top(5000)
                            .orderBy('Created', false)()];
                    case 1:
                        items = _b.sent();
                        return [2 /*return*/, items.map(mapAsset)];
                }
            });
        });
    };
    AssetService.prototype.getAssetById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (_a = this._sp.web.lists
                            .getByTitle(ASSETS_LIST)
                            .items.getById(id))
                            .select.apply(_a, ASSET_SELECT)()];
                    case 1:
                        item = _b.sent();
                        return [2 /*return*/, mapAsset(item)];
                }
            });
        });
    };
    AssetService.prototype.getNextSequenceNumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            var items, maxSeq, _i, items_1, item, parsed, next;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[AssetService] getNextSequenceNumber — fetching global max across all assets');
                        return [4 /*yield*/, this._sp.web.lists
                                .getByTitle(ASSETS_LIST)
                                .items.select('Title', 'SequenceNumber')
                                .top(5000)()];
                    case 1:
                        items = _a.sent();
                        if (!items.length) {
                            console.log('[AssetService] No existing assets — starting global sequence at 1');
                            return [2 /*return*/, 1];
                        }
                        maxSeq = 0;
                        for (_i = 0, items_1 = items; _i < items_1.length; _i++) {
                            item = items_1[_i];
                            // Primary: SequenceNumber field
                            if (item.SequenceNumber != null && item.SequenceNumber > maxSeq) {
                                maxSeq = item.SequenceNumber;
                            }
                            parsed = AssetIdGenerator.parse(item.Title);
                            if (parsed && parsed.sequence > maxSeq) {
                                maxSeq = parsed.sequence;
                            }
                        }
                        next = maxSeq + 1;
                        console.log("[AssetService] Global max SequenceNumber: ".concat(maxSeq, " \u2014 next: ").concat(next));
                        return [2 /*return*/, next];
                }
            });
        });
    };
    AssetService.prototype.addAsset = function (asset) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, assetId, attempt, existing, payload, result, historyOk, created;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getNextSequenceNumber()];
                    case 1:
                        seq = _a.sent();
                        assetId = AssetIdGenerator.generate(asset.Country, asset.OfficeCode, asset.AssetType, seq);
                        attempt = 0;
                        _a.label = 2;
                    case 2:
                        if (!(attempt < 20)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._sp.web.lists
                                .getByTitle(ASSETS_LIST)
                                .items.filter("Title eq '".concat(assetId, "'"))
                                .select('Title')
                                .top(1)()];
                    case 3:
                        existing = _a.sent();
                        if (!existing.length)
                            return [3 /*break*/, 5];
                        console.warn("[AssetService] Asset ID \"".concat(assetId, "\" already exists (attempt ").concat(attempt + 1, ") \u2014 incrementing"));
                        seq++;
                        assetId = AssetIdGenerator.generate(asset.Country, asset.OfficeCode, asset.AssetType, seq);
                        _a.label = 4;
                    case 4:
                        attempt++;
                        return [3 /*break*/, 2];
                    case 5:
                        console.log("[AssetService] Final generated Asset ID: \"".concat(assetId, "\", SequenceNumber: ").concat(seq));
                        payload = __assign(__assign({}, asset), { Title: assetId, SequenceNumber: seq });
                        return [4 /*yield*/, this._sp.web.lists.getByTitle(ASSETS_LIST).items.add(payload)];
                    case 6:
                        result = _a.sent();
                        return [4 /*yield*/, this._logHistory({
                                Title: assetId,
                                AssetItemId: result.data.Id,
                                NewStatus: asset.Status,
                                ChangedBy: 'System',
                                ChangeDate: new Date().toISOString(),
                                HistoryNotes: 'Asset created and entered into the system.',
                            })];
                    case 7:
                        historyOk = _a.sent();
                        created = __assign(__assign({}, payload), { Id: result.data.Id });
                        if (!historyOk) {
                            created.historyWarning = 'Asset created, but history logging failed. Verify Asset_History list column names match: AssetItemId, NewStatus, ChangedBy, ChangeDate, HistoryNotes.';
                        }
                        return [2 /*return*/, created];
                }
            });
        });
    };
    AssetService.prototype.updateAsset = function (id, changes) {
        return __awaiter(this, void 0, void 0, function () {
            var payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = stripMetadata(changes);
                        return [4 /*yield*/, this._sp.web.lists.getByTitle(ASSETS_LIST).items.getById(id).update(payload)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AssetService.prototype.deleteAsset = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._sp.web.lists.getByTitle(ASSETS_LIST).items.getById(id).recycle()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // ----------------------------------------------------------------
    // Status lifecycle
    // ----------------------------------------------------------------
    AssetService.prototype.changeStatus = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var assetId, itemId, previousStatus, newStatus, notes, changedBy, extraFields, historyOk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assetId = params.assetId, itemId = params.itemId, previousStatus = params.previousStatus, newStatus = params.newStatus, notes = params.notes, changedBy = params.changedBy, extraFields = params.extraFields;
                        return [4 /*yield*/, this.updateAsset(itemId, __assign({ Status: newStatus }, extraFields))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._logHistory({
                                Title: assetId,
                                AssetItemId: itemId,
                                PreviousStatus: previousStatus,
                                NewStatus: newStatus,
                                ChangedBy: changedBy,
                                ChangeDate: new Date().toISOString(),
                                HistoryNotes: notes,
                            })];
                    case 2:
                        historyOk = _a.sent();
                        return [2 /*return*/, historyOk ? {} : { historyWarning: 'Status updated, but history logging failed. Verify Asset_History list column names match: PreviousStatus, NewStatus, ChangedBy, ChangeDate, HistoryNotes.' }];
                }
            });
        });
    };
    // ----------------------------------------------------------------
    // History
    // ----------------------------------------------------------------
    AssetService.prototype.getAssetHistory = function (assetId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._sp.web.lists
                        .getByTitle(HISTORY_LIST)
                        .items.filter("Title eq '".concat(assetId, "'"))
                        .select('Id', 'Title', 'AssetItemId', 'PreviousStatus', 'NewStatus', 'ChangedBy', 'ChangeDate', 'HistoryNotes')
                        .orderBy('ChangeDate', false)
                        .top(200)()];
            });
        });
    };
    AssetService.prototype._logHistory = function (history) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._sp.web.lists.getByTitle(HISTORY_LIST).items.add(history)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        e_1 = _a.sent();
                        console.warn('[AssetService] History log failed — check Asset_History list column names:', e_1);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ----------------------------------------------------------------
    // Dashboard & reporting
    // ----------------------------------------------------------------
    AssetService.prototype.getDashboardStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, all, expiring, byStatus_1, byType_1, byDept_1, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                this._sp.web.lists.getByTitle(ASSETS_LIST).items.top(5000)(),
                                this.getWarrantyExpiring(90),
                            ])];
                    case 1:
                        _a = _c.sent(), all = _a[0], expiring = _a[1];
                        byStatus_1 = {};
                        byType_1 = {};
                        byDept_1 = {};
                        all.forEach(function (item) {
                            if (item.Status)
                                byStatus_1[item.Status] = (byStatus_1[item.Status] || 0) + 1;
                            if (item.AssetType)
                                byType_1[item.AssetType] = (byType_1[item.AssetType] || 0) + 1;
                            if (item.Department)
                                byDept_1[item.Department] = (byDept_1[item.Department] || 0) + 1;
                        });
                        return [2 /*return*/, { total: all.length, byStatus: byStatus_1, byType: byType_1, byDept: byDept_1, warrantyExpiringSoon: expiring.length }];
                    case 2:
                        _b = _c.sent();
                        return [2 /*return*/, { total: 0, byStatus: {}, byType: {}, byDept: {}, warrantyExpiringSoon: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AssetService.prototype.getWarrantyExpiring = function (days) {
        if (days === void 0) { days = 90; }
        return __awaiter(this, void 0, void 0, function () {
            var today, future, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        today = new Date();
                        future = new Date();
                        future.setDate(future.getDate() + days);
                        return [4 /*yield*/, this._sp.web.lists.getByTitle(ASSETS_LIST)
                                .items.filter("WarrantyExpiry ge '".concat(today.toISOString(), "' and WarrantyExpiry le '").concat(future.toISOString(), "' and Status eq 'Active'"))
                                .top(500)()];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AssetService.prototype.getRecentHistory = function (limit) {
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._sp.web.lists.getByTitle(HISTORY_LIST)
                                .items.select('Id', 'Title', 'AssetItemId', 'PreviousStatus', 'NewStatus', 'ChangedBy', 'ChangeDate', 'HistoryNotes')
                                .orderBy('ChangeDate', false)
                                .top(limit)()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        e_2 = _a.sent();
                        console.warn('[AssetService] getRecentHistory failed — check Asset_History list column names:', e_2);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ----------------------------------------------------------------
    // People picker helper
    // ----------------------------------------------------------------
    AssetService.prototype.searchUsers = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var safe, results, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!query || query.length < 2)
                            return [2 /*return*/, []];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        safe = query.replace(/'/g, "''");
                        return [4 /*yield*/, this._sp.web.siteUsers
                                .filter("substringof('".concat(safe, "', Title) or substringof('").concat(safe, "', Email)"))
                                .select('Title', 'Email')
                                .top(10)()];
                    case 2:
                        results = _b.sent();
                        return [2 /*return*/, results.map(function (u) { return ({ displayName: u.Title, email: u.Email }); })];
                    case 3:
                        _a = _b.sent();
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AssetService;
}());
export { AssetService };
//# sourceMappingURL=AssetService.js.map