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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Spinner, SpinnerSize, DefaultButton, PrimaryButton, IconButton, Dropdown, Dialog, DialogType, DialogFooter, MessageBar, MessageBarType, } from '@fluentui/react';
import styles from './AssetDetail.module.scss';
// Categories available in the generic upload dialog.
// Purchase, gifted, and scrap documents must go through their dedicated forms
// (asset edit / status-change dialog) so the URL is saved to the list record field.
// Files uploaded here go to the SharePoint library; only Repair Reports are
// fetched back and displayed in this section (per-asset subfolder).
var UPLOAD_CATEGORY_OPTIONS = [
    { key: 'repairs', text: 'Repair Report' },
    { key: 'warranty', text: 'Warranty Document' },
    { key: 'other', text: 'Other' },
];
var CATEGORY_LABELS = {
    purchase: 'Purchase Invoice',
    repairs: 'Repair Report',
    gifted: 'Gift Document',
    scrap: 'Scrap Document',
    warranty: 'Warranty Document',
    other: 'Other',
};
var formatSize = function (bytes) {
    if (!bytes)
        return '';
    if (bytes < 1024)
        return "".concat(bytes, " B");
    if (bytes < 1024 * 1024)
        return "".concat((bytes / 1024).toFixed(1), " KB");
    return "".concat((bytes / (1024 * 1024)).toFixed(1), " MB");
};
var formatDate = function (iso) {
    if (!iso)
        return '';
    try {
        return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    catch (_a) {
        return iso;
    }
};
var getPreviewType = function (fileName) {
    var _a, _b;
    var ext = (_b = (_a = fileName.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '';
    if (['pdf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'tiff', 'txt', 'csv'].includes(ext))
        return 'browser';
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext))
        return 'office';
    return 'download';
};
// Build an IAttachment from a stored URL field (server-relative or absolute)
var buildUrlAttachment = function (url, displayName, category) {
    var absUrl = url.startsWith('http') ? url : "".concat(window.location.origin).concat(url);
    return {
        name: displayName,
        serverRelativeUrl: url,
        absoluteUrl: absUrl,
        downloadUrl: "".concat(absUrl, "?download=1"),
        category: category,
        timeCreated: '',
        fileSize: 0,
        previewType: getPreviewType(displayName),
    };
};
var AssetAttachmentSection = function (_a) {
    var assetId = _a.assetId, asset = _a.asset, repairs = _a.repairs, fileService = _a.fileService;
    var _b = useState([]), libraryFiles = _b[0], setLibraryFiles = _b[1];
    var _c = useState(true), loading = _c[0], setLoading = _c[1];
    var _d = useState(''), error = _d[0], setError = _d[1];
    // Upload dialog
    var _f = useState(false), showUploadDlg = _f[0], setShowUploadDlg = _f[1];
    var _g = useState([]), selectedFiles = _g[0], setSelectedFiles = _g[1];
    var _h = useState('repairs'), uploadCategory = _h[0], setUploadCategory = _h[1];
    var _j = useState(false), uploading = _j[0], setUploading = _j[1];
    // Delete confirmation
    var _k = useState(null), deleteTarget = _k[0], setDeleteTarget = _k[1];
    var _l = useState(false), deleting = _l[0], setDeleting = _l[1];
    var loadLibraryFiles = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var files, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    setError('');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, fileService.listFiles(assetId)];
                case 2:
                    files = _b.sent();
                    setLibraryFiles(files);
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    setError('Failed to load repair attachments from library.');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [assetId, fileService]);
    useEffect(function () { loadLibraryFiles(); }, [loadLibraryFiles]);
    // Build URL-field-based attachments from the asset record (purchase bill only)
    var urlAttachments = useMemo(function () {
        var list = [];
        if (asset.PurchaseBillUrl)
            list.push(buildUrlAttachment(asset.PurchaseBillUrl, 'Purchase Invoice', 'purchase'));
        return list;
    }, [asset]);
    // Build repair attachments from the Asset_Repairs list entries
    var repairAttachments = useMemo(function () {
        return repairs
            .filter(function (r) { return r.AttachmentUrl; })
            .map(function (r) {
            var _a, _b;
            return buildUrlAttachment(r.AttachmentUrl, "Repair \u2014 ".concat((_b = (_a = r.RepairDate) === null || _a === void 0 ? void 0 : _a.slice(0, 10)) !== null && _b !== void 0 ? _b : ''), 'repairs');
        });
    }, [repairs]);
    // Merge all three sources, deduplicating by serverRelativeUrl
    var allAttachments = useMemo(function () {
        var seen = new Set();
        return __spreadArray(__spreadArray(__spreadArray([], urlAttachments, true), repairAttachments, true), libraryFiles, true).filter(function (a) {
            if (seen.has(a.serverRelativeUrl))
                return false;
            seen.add(a.serverRelativeUrl);
            return true;
        });
    }, [urlAttachments, repairAttachments, libraryFiles]);
    var handleOpen = function (attachment) {
        window.open(encodeURI(attachment.absoluteUrl), '_blank', 'noopener,noreferrer');
    };
    var handleUpload = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _i, selectedFiles_1, file, uploadFile, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!selectedFiles.length)
                        return [2 /*return*/];
                    setUploading(true);
                    setError('');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, 8, 9]);
                    _i = 0, selectedFiles_1 = selectedFiles;
                    _b.label = 2;
                case 2:
                    if (!(_i < selectedFiles_1.length)) return [3 /*break*/, 5];
                    file = selectedFiles_1[_i];
                    uploadFile = uploadCategory === 'repairs'
                        ? new File([file], "".concat(Date.now(), "_").concat(file.name), { type: file.type })
                        : file;
                    return [4 /*yield*/, fileService.upload(assetId, uploadCategory, uploadFile)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    setShowUploadDlg(false);
                    setSelectedFiles([]);
                    setUploadCategory('repairs');
                    return [4 /*yield*/, loadLibraryFiles()];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 7:
                    _a = _b.sent();
                    setError('Upload failed. Please try again.');
                    return [3 /*break*/, 9];
                case 8:
                    setUploading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!deleteTarget)
                        return [2 /*return*/];
                    setDeleting(true);
                    setError('');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, fileService.deleteFile(deleteTarget.serverRelativeUrl)];
                case 2:
                    _b.sent();
                    setLibraryFiles(function (prev) { return prev.filter(function (a) { return a.serverRelativeUrl !== deleteTarget.serverRelativeUrl; }); });
                    setDeleteTarget(null);
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    setError('Delete failed. Please try again.');
                    return [3 /*break*/, 5];
                case 4:
                    setDeleting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Only library files can be deleted (URL-field attachments are managed via the form)
    var isLibraryFile = function (a) {
        return libraryFiles.some(function (f) { return f.serverRelativeUrl === a.serverRelativeUrl; });
    };
    return (React.createElement("div", { className: styles.card, style: { marginTop: 16 } },
        React.createElement("div", { className: styles.cardTitle }, "Attachments"),
        error && React.createElement(MessageBar, { messageBarType: MessageBarType.error }, error),
        loading && React.createElement(Spinner, { size: SpinnerSize.small, label: "Loading attachments\u2026" }),
        !loading && allAttachments.length === 0 && (React.createElement("div", { className: styles.emptyState }, "No attachments uploaded yet.")),
        !loading && allAttachments.length > 0 && (React.createElement("div", null, allAttachments.map(function (a) {
            var _a;
            return (React.createElement("div", { key: a.serverRelativeUrl, className: styles.attachItem },
                React.createElement("div", { className: styles.attachInfo },
                    React.createElement("span", { className: styles.attachName, title: a.name }, a.name),
                    React.createElement("div", { className: styles.attachMeta },
                        React.createElement("span", { className: styles.badge }, (_a = CATEGORY_LABELS[a.category]) !== null && _a !== void 0 ? _a : a.category),
                        a.fileSize > 0 && React.createElement("span", null, formatSize(a.fileSize)),
                        a.timeCreated && React.createElement("span", null, formatDate(a.timeCreated)))),
                React.createElement("div", { className: styles.attachActions },
                    React.createElement(IconButton, { iconProps: { iconName: a.previewType === 'download' ? 'Download' : 'View' }, title: a.previewType === 'download' ? 'Download' : 'Open', onClick: function () { return handleOpen(a); } }),
                    isLibraryFile(a) && (React.createElement(IconButton, { iconProps: { iconName: 'Delete' }, title: "Delete", onClick: function () { return setDeleteTarget(a); } })))));
        }))),
        React.createElement(DefaultButton, { iconProps: { iconName: 'Upload' }, onClick: function () { setSelectedFiles([]); setUploadCategory('repairs'); setShowUploadDlg(true); }, style: { marginTop: 8 } }, "Upload Files"),
        React.createElement(Dialog, { hidden: !showUploadDlg, onDismiss: function () { setShowUploadDlg(false); setSelectedFiles([]); }, dialogContentProps: { type: DialogType.normal, title: 'Upload Files' }, modalProps: { isBlocking: false }, styles: { main: { minWidth: 480 } } },
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 } },
                React.createElement(MessageBar, { messageBarType: MessageBarType.info }, "Files uploaded here are stored in the SharePoint library. Only Repair Reports are shown in this section. For Purchase Invoice, Gift, or Scrap documents \u2014 use the dedicated forms so the URL is linked to the correct list record."),
                React.createElement("div", null,
                    React.createElement("label", { style: { fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 } }, "Select Files"),
                    React.createElement("input", { type: "file", multiple: true, onChange: function (e) { return setSelectedFiles(Array.from(e.target.files || [])); } }),
                    selectedFiles.length > 0 && (React.createElement("span", { style: { display: 'block', marginTop: 6, fontSize: 13, color: '#107c10' } },
                        "\u2713 Ready to upload: ",
                        selectedFiles.map(function (f) { return f.name; }).join(', ')))),
                React.createElement(Dropdown, { label: "Category", selectedKey: uploadCategory, options: UPLOAD_CATEGORY_OPTIONS, onChange: function (_e, opt) { return setUploadCategory((opt === null || opt === void 0 ? void 0 : opt.key) || 'repairs'); } })),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: handleUpload, disabled: !selectedFiles.length || uploading }, uploading ? 'Uploading…' : 'Upload'),
                React.createElement(DefaultButton, { onClick: function () { setShowUploadDlg(false); setSelectedFiles([]); } }, "Cancel"))),
        React.createElement(Dialog, { hidden: !deleteTarget, onDismiss: function () { return setDeleteTarget(null); }, dialogContentProps: { type: DialogType.normal, title: 'Delete Attachment?' }, modalProps: { isBlocking: false } },
            React.createElement("p", null,
                "Are you sure you want to delete ",
                React.createElement("strong", null, deleteTarget === null || deleteTarget === void 0 ? void 0 : deleteTarget.name),
                "? This will move it to the SharePoint recycle bin."),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: handleDelete, disabled: deleting }, deleting ? 'Deleting…' : 'Delete'),
                React.createElement(DefaultButton, { onClick: function () { return setDeleteTarget(null); } }, "Cancel")))));
};
export default AssetAttachmentSection;
//# sourceMappingURL=AssetAttachmentSection.js.map