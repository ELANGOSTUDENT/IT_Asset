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
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Spinner, SpinnerSize, DefaultButton, PrimaryButton, IconButton, Dropdown, Dialog, DialogType, DialogFooter, MessageBar, MessageBarType, } from '@fluentui/react';
import styles from './AssetDetail.module.scss';
var ALL_CATEGORIES = [
    'purchase', 'repairs', 'gifted', 'transfer', 'scrap', 'validation', 'photos', 'other',
];
var CATEGORY_OPTIONS = ALL_CATEGORIES.map(function (c) { return ({
    key: c,
    text: c.charAt(0).toUpperCase() + c.slice(1),
}); });
// ── Helpers ───────────────────────────────────────────────────────────────────
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
    try {
        var d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    catch (_a) {
        return iso;
    }
};
// ── Component ─────────────────────────────────────────────────────────────────
var AssetAttachmentSection = function (_a) {
    var assetId = _a.assetId, fileService = _a.fileService;
    var _b = useState([]), attachments = _b[0], setAttachments = _b[1];
    var _c = useState(true), loading = _c[0], setLoading = _c[1];
    var _d = useState(''), error = _d[0], setError = _d[1];
    // Upload dialog state
    var _f = useState(false), showUploadDlg = _f[0], setShowUploadDlg = _f[1];
    var _g = useState([]), selectedFiles = _g[0], setSelectedFiles = _g[1];
    var _h = useState('other'), uploadCategory = _h[0], setUploadCategory = _h[1];
    var _j = useState(false), uploading = _j[0], setUploading = _j[1];
    // Delete confirmation state
    var _k = useState(null), deleteTarget = _k[0], setDeleteTarget = _k[1];
    var _l = useState(false), deleting = _l[0], setDeleting = _l[1];
    var loadFiles = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
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
                    setAttachments(files);
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    setError('Failed to load attachments.');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [assetId, fileService]);
    useEffect(function () { loadFiles(); }, [loadFiles]);
    var handleOpen = function (attachment) {
        window.open(attachment.previewType === 'download' ? attachment.downloadUrl : attachment.absoluteUrl, '_blank');
    };
    var handleUpload = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _i, selectedFiles_1, file, _a;
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
                    return [4 /*yield*/, fileService.upload(assetId, uploadCategory, file)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    setShowUploadDlg(false);
                    setSelectedFiles([]);
                    setUploadCategory('other');
                    return [4 /*yield*/, loadFiles()];
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
                    setAttachments(function (prev) { return prev.filter(function (a) { return a.serverRelativeUrl !== deleteTarget.serverRelativeUrl; }); });
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
    // ── Render ──────────────────────────────────────────────────────────────────
    return (React.createElement("div", { className: styles.card, style: { marginTop: 16 } },
        React.createElement("div", { className: styles.cardTitle }, "Attachments"),
        error && (React.createElement(MessageBar, { messageBarType: MessageBarType.error }, error)),
        loading && (React.createElement(Spinner, { size: SpinnerSize.small, label: "Loading attachments\u2026" })),
        !loading && attachments.length === 0 && (React.createElement("div", { className: styles.emptyState }, "No attachments uploaded yet.")),
        !loading && attachments.length > 0 && (React.createElement("div", null, attachments.map(function (a) { return (React.createElement("div", { key: a.serverRelativeUrl, className: styles.attachItem },
            React.createElement("div", { className: styles.attachInfo },
                React.createElement("span", { className: styles.attachName, title: a.name }, a.name),
                React.createElement("div", { className: styles.attachMeta },
                    React.createElement("span", { className: styles.badge }, a.category),
                    a.fileSize > 0 && React.createElement("span", null, formatSize(a.fileSize)),
                    React.createElement("span", null, formatDate(a.timeCreated)))),
            React.createElement("div", { className: styles.attachActions },
                React.createElement(IconButton, { iconProps: { iconName: a.previewType === 'download' ? 'Download' : 'View' }, title: a.previewType === 'download' ? 'Download' : 'Preview', onClick: function () { return handleOpen(a); } }),
                React.createElement(IconButton, { iconProps: { iconName: 'Delete' }, title: "Delete", onClick: function () { return setDeleteTarget(a); } })))); }))),
        React.createElement(DefaultButton, { iconProps: { iconName: 'Upload' }, onClick: function () { setSelectedFiles([]); setUploadCategory('other'); setShowUploadDlg(true); }, style: { marginTop: 8 } }, "Upload Files"),
        React.createElement(Dialog, { hidden: !showUploadDlg, onDismiss: function () { setShowUploadDlg(false); setSelectedFiles([]); }, dialogContentProps: { type: DialogType.normal, title: 'Upload Files' }, modalProps: { isBlocking: false }, styles: { main: { minWidth: 480 } } },
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 } },
                React.createElement("div", null,
                    React.createElement("label", { style: { fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 } }, "Select Files"),
                    React.createElement("input", { type: "file", multiple: true, onChange: function (e) { return setSelectedFiles(Array.from(e.target.files || [])); } })),
                React.createElement(Dropdown, { label: "Category", selectedKey: uploadCategory, options: CATEGORY_OPTIONS, onChange: function (_e, opt) { return setUploadCategory((opt === null || opt === void 0 ? void 0 : opt.key) || 'other'); } }),
                selectedFiles.length > 0 && (React.createElement("span", { style: { fontSize: 12, color: '#707070' } },
                    selectedFiles.length,
                    " file(s) selected"))),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: handleUpload, disabled: !selectedFiles.length || uploading }, uploading ? 'Uploading…' : 'Upload'),
                React.createElement(DefaultButton, { onClick: function () { setShowUploadDlg(false); setSelectedFiles([]); } }, "Cancel"))),
        React.createElement(Dialog, { hidden: !deleteTarget, onDismiss: function () { return setDeleteTarget(null); }, dialogContentProps: {
                type: DialogType.normal,
                title: 'Delete Attachment?',
            }, modalProps: { isBlocking: false } },
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