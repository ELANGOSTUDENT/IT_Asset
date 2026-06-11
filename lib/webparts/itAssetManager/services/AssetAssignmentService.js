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
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
var ASSIGNMENTS_LIST = 'Asset_Assignments';
var ASSETS_LIST = 'IT_Assets';
var SELECT = [
    'Id', 'Title', 'AssetItemId', 'SerialNumber',
    'AssignedTo', 'AssignedToEmail', 'Department', 'AssetLocation',
    'DateOfAssignment', 'LastMaintenanceDate', 'NextMaintenanceDate',
    'MaintenanceNotes', 'AssignmentRemarks', 'IsActive',
];
var AssetAssignmentService = /** @class */ (function () {
    function AssetAssignmentService(_sp) {
        this._sp = _sp;
    }
    AssetAssignmentService.prototype.getActiveAssignment = function (assetId) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (_a = this._sp.web.lists
                            .getByTitle(ASSIGNMENTS_LIST)
                            .items.filter("Title eq '".concat(assetId.replace(/'/g, "''"), "' and IsActive eq 1")))
                            .select.apply(_a, SELECT).top(1)()];
                    case 1:
                        results = _b.sent();
                        return [2 /*return*/, results.length > 0 ? results[0] : null];
                }
            });
        });
    };
    AssetAssignmentService.prototype.getAllAssignments = function (assetId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                return [2 /*return*/, (_a = this._sp.web.lists
                        .getByTitle(ASSIGNMENTS_LIST)
                        .items.filter("Title eq '".concat(assetId.replace(/'/g, "''"), "'")))
                        .select.apply(_a, SELECT).orderBy('DateOfAssignment', false)
                        .top(200)()];
            });
        });
    };
    AssetAssignmentService.prototype.addAssignment = function (assignment) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Deactivate any existing active assignment first
                    return [4 /*yield*/, this.deactivateExisting(assignment.Title)];
                    case 1:
                        // Deactivate any existing active assignment first
                        _a.sent();
                        return [4 /*yield*/, this._sp.web.lists
                                .getByTitle(ASSIGNMENTS_LIST)
                                .items.add(__assign(__assign({}, assignment), { IsActive: true }))];
                    case 2:
                        result = _a.sent();
                        // Sync denormalized fields to IT_Assets
                        return [4 /*yield*/, this._syncITAssets(assignment.AssetItemId, assignment)];
                    case 3:
                        // Sync denormalized fields to IT_Assets
                        _a.sent();
                        return [2 /*return*/, __assign(__assign({}, assignment), { Id: result.data.Id })];
                }
            });
        });
    };
    AssetAssignmentService.prototype.updateAssignment = function (id, changes) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._sp.web.lists
                            .getByTitle(ASSIGNMENTS_LIST)
                            .items.getById(id)
                            .update(changes)];
                    case 1:
                        _a.sent();
                        if (!changes.AssetItemId) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._syncITAssets(changes.AssetItemId, changes)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AssetAssignmentService.prototype.deactivateExisting = function (assetId) {
        return __awaiter(this, void 0, void 0, function () {
            var existing;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._sp.web.lists
                            .getByTitle(ASSIGNMENTS_LIST)
                            .items.filter("Title eq '".concat(assetId.replace(/'/g, "''"), "' and IsActive eq 1"))
                            .select('Id')
                            .top(10)()];
                    case 1:
                        existing = _a.sent();
                        return [4 /*yield*/, Promise.all(existing.map(function (item) {
                                return _this._sp.web.lists.getByTitle(ASSIGNMENTS_LIST).items.getById(item.Id).update({ IsActive: false });
                            }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Sync assignment fields to the IT_Assets list item so detail view is up to date. */
    AssetAssignmentService.prototype._syncITAssets = function (assetItemId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var fields;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fields = {};
                        if (data.AssignedTo !== undefined)
                            fields.AssignedTo = data.AssignedTo;
                        if (data.AssignedToEmail !== undefined)
                            fields.AssignedToEmail = data.AssignedToEmail;
                        if (data.Department !== undefined)
                            fields.Department = data.Department;
                        if (data.AssetLocation !== undefined)
                            fields.AssetLocation = data.AssetLocation;
                        if (data.DateOfAssignment !== undefined)
                            fields.DateOfAssignment = data.DateOfAssignment;
                        if (Object.keys(fields).length === 0)
                            return [2 /*return*/];
                        return [4 /*yield*/, this._sp.web.lists
                                .getByTitle(ASSETS_LIST)
                                .items.getById(assetItemId)
                                .update(fields)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AssetAssignmentService;
}());
export { AssetAssignmentService };
//# sourceMappingURL=AssetAssignmentService.js.map