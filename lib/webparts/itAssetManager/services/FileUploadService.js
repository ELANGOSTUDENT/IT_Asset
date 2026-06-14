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
import '@pnp/sp/folders';
import '@pnp/sp/files';
var DOCUMENT_LIBRARY_TITLE = 'Documents'; // display title for lists.getByTitle()
var ATTACHMENT_ROOT = 'Shared Documents/IT Assets'; // server-relative path segment
var CATEGORY_FOLDER = {
    purchase: 'Purchase Invoices',
    repairs: 'Repair Reports',
    gifted: 'Gift Documents',
    scrap: 'Scrap Documents',
    warranty: 'Warranty Documents',
    other: 'Other',
};
var FileUploadService = /** @class */ (function () {
    function FileUploadService(_sp, siteRelUrl) {
        this._sp = _sp;
        this._siteRelUrl = siteRelUrl.replace(/\/$/, '');
    }
    FileUploadService.prototype.folderPath = function (assetId, sub) {
        var folder = CATEGORY_FOLDER[sub];
        if (sub === 'repairs') {
            return "".concat(this._siteRelUrl, "/").concat(ATTACHMENT_ROOT, "/").concat(folder, "/").concat(assetId);
        }
        return "".concat(this._siteRelUrl, "/").concat(ATTACHMENT_ROOT, "/").concat(folder);
    };
    FileUploadService.prototype.ensureFolder = function (assetId, sub) {
        return __awaiter(this, void 0, void 0, function () {
            var folder, catPath, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        folder = CATEGORY_FOLDER[sub];
                        catPath = "".concat(this._siteRelUrl, "/").concat(ATTACHMENT_ROOT, "/").concat(folder);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._sp.web.folders.addUsingPath(catPath, true)];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _c.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        if (!(sub === 'repairs')) return [3 /*break*/, 8];
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this._sp.web.folders.addUsingPath("".concat(catPath, "/").concat(assetId), true)];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _b = _c.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    FileUploadService.prototype.upload = function (assetId, sub, file) {
        return __awaiter(this, void 0, void 0, function () {
            var buf, fp, serverRelativeUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureFolder(assetId, sub)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, file.arrayBuffer()];
                    case 2:
                        buf = _a.sent();
                        fp = this.folderPath(assetId, sub);
                        return [4 /*yield*/, this._sp.web
                                .getFolderByServerRelativePath(fp)
                                .files.addUsingPath(file.name, buf, { Overwrite: true })];
                    case 3:
                        _a.sent();
                        serverRelativeUrl = "".concat(fp, "/").concat(file.name);
                        return [2 /*return*/, {
                                serverRelativeUrl: serverRelativeUrl,
                                absoluteUrl: this.getAbsoluteUrl(serverRelativeUrl),
                                fileName: file.name,
                            }];
                }
            });
        });
    };
    FileUploadService.prototype.deleteFile = function (serverRelativeUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._sp.web.getFileByServerRelativePath(serverRelativeUrl).recycle()];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FileUploadService.prototype.getAbsoluteUrl = function (serverRelativeUrl) {
        return "".concat(window.location.origin).concat(serverRelativeUrl);
    };
    // Returns repair files for a specific asset from the Repair Reports subfolder.
    // Non-repair attachments are stored as URL fields on the IT_Assets record itself.
    FileUploadService.prototype.listFiles = function (assetId) {
        return __awaiter(this, void 0, void 0, function () {
            var repairFolderPath, items, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        repairFolderPath = this.folderPath(assetId, 'repairs');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._sp.web.lists
                                .getByTitle(DOCUMENT_LIBRARY_TITLE)
                                .items
                                .filter("startswith(FileRef, '".concat(repairFolderPath, "') and FSObjType eq 0"))
                                .orderBy('Created', false)
                                .select('FileRef', 'FileLeafRef', 'Created')()];
                    case 2:
                        items = _b.sent();
                        return [2 /*return*/, items.map(function (item) {
                                var srUrl = item.FileRef;
                                var absUrl = _this.getAbsoluteUrl(srUrl);
                                return {
                                    name: item.FileLeafRef,
                                    serverRelativeUrl: srUrl,
                                    absoluteUrl: absUrl,
                                    downloadUrl: "".concat(absUrl, "?download=1"),
                                    category: 'repairs',
                                    timeCreated: item.Created,
                                    fileSize: 0,
                                    previewType: _this._getPreviewType(item.FileLeafRef),
                                };
                            })];
                    case 3:
                        _a = _b.sent();
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    FileUploadService.prototype.getFilesByCategory = function (assetId) {
        return __awaiter(this, void 0, void 0, function () {
            var all, grouped, _i, all_1, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.listFiles(assetId)];
                    case 1:
                        all = _a.sent();
                        grouped = {};
                        for (_i = 0, all_1 = all; _i < all_1.length; _i++) {
                            file = all_1[_i];
                            if (!grouped[file.category])
                                grouped[file.category] = [];
                            grouped[file.category].push(file);
                        }
                        return [2 /*return*/, grouped];
                }
            });
        });
    };
    FileUploadService.prototype._getPreviewType = function (fileName) {
        var _a, _b;
        var ext = (_b = (_a = fileName.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '';
        var browserTypes = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'tiff', 'txt', 'csv'];
        var officeTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
        if (browserTypes.includes(ext))
            return 'browser';
        if (officeTypes.includes(ext))
            return 'office';
        return 'download';
    };
    return FileUploadService;
}());
export { FileUploadService };
//# sourceMappingURL=FileUploadService.js.map