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
import { useState, useEffect, useCallback } from 'react';
import { Spinner, SpinnerSize, DefaultButton, PrimaryButton, IconButton, TextField, Dropdown, Dialog, DialogType, DialogFooter, MessageBar, MessageBarType, Separator, } from '@fluentui/react';
import { AttachRegular, TagRegular, WrenchRegular, MoneyRegular, DocumentRegular, } from '@fluentui/react-icons';
import { ASSET_TYPE_LABELS, } from '../models/IAsset';
import { emptyRepairDraft } from '../models/IRepairEntry';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import styles from './AssetDetailsForm.module.scss';
var DateField = function (_a) {
    var label = _a.label, value = _a.value, onChange = _a.onChange, error = _a.error, disabled = _a.disabled;
    return (React.createElement("div", null,
        React.createElement("label", { style: { fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 } }, label),
        React.createElement("input", { type: "date", value: value ? value.slice(0, 10) : '', disabled: disabled, onChange: function (e) {
                var v = e.target.value;
                onChange(v ? new Date(v + 'T00:00:00').toISOString() : '');
            }, style: {
                width: '100%', padding: '5px 8px', borderRadius: 4, fontSize: 14,
                fontFamily: 'inherit', color: '#242424',
                border: "1px solid ".concat(error ? '#d13438' : '#d1d1d1'),
                background: disabled ? '#f5f5f5' : '#fff',
                boxSizing: 'border-box',
            } }),
        error && React.createElement("span", { style: { color: '#d13438', fontSize: 12, display: 'block', marginTop: 4 } }, error)));
};
var FileField = function (_a) {
    var label = _a.label, existingUrl = _a.existingUrl, selectedFile = _a.selectedFile, onFileSelected = _a.onFileSelected;
    var inputRef = React.useRef(null);
    var handleClear = function () {
        if (inputRef.current)
            inputRef.current.value = '';
        onFileSelected(null);
    };
    return (React.createElement("div", null,
        React.createElement("label", { style: { fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 } }, label),
        React.createElement("div", { className: styles.fileField },
            React.createElement("label", { className: styles.fileLabel },
                React.createElement(AttachRegular, null),
                React.createElement("span", null, "Choose file\u2026"),
                React.createElement("input", { ref: inputRef, type: "file", style: { display: 'none' }, onChange: function (e) { var _a, _b; return onFileSelected((_b = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null); } })),
            existingUrl && !selectedFile && (React.createElement("a", { href: existingUrl, target: "_blank", rel: "noopener noreferrer", className: styles.fileLink }, "View existing"))),
        selectedFile && (React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 } },
            React.createElement("span", { style: { color: '#107c10', fontSize: 13 } },
                "\u2713 Ready to upload: ",
                selectedFile.name),
            React.createElement("button", { type: "button", onClick: handleClear, style: {
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#707070', fontSize: 16, padding: '0 2px', lineHeight: 1,
                }, title: "Remove selected file" }, "\u00D7")))));
};
// ── Section card ───────────────────────────────────────────────────────────────
var Section = function (_a) {
    var title = _a.title, icon = _a.icon, children = _a.children;
    return (React.createElement("div", { className: styles.section },
        React.createElement("div", { className: styles.sectionTitle },
            icon,
            " ",
            title),
        children));
};
var RepairDialog = function (_a) {
    var _b;
    var open = _a.open, draft = _a.draft, saving = _a.saving, onDraftChange = _a.onDraftChange, onConfirm = _a.onConfirm, onClose = _a.onClose;
    var set = function (k, v) {
        var _a;
        return onDraftChange(__assign(__assign({}, draft), (_a = {}, _a[k] = v, _a)));
    };
    return (React.createElement(Dialog, { hidden: !open, onDismiss: onClose, dialogContentProps: {
            type: DialogType.normal,
            title: 'Add Repair Entry',
        }, modalProps: { isBlocking: false }, styles: { main: { minWidth: 560 } } },
        React.createElement("div", { className: styles.dialogGrid },
            React.createElement(DateField, { label: "Repair Date *", value: draft.RepairDate, onChange: function (v) { return set('RepairDate', v); } }),
            React.createElement(TextField, { label: "Vendor / Service Centre *", value: draft.RepairVendor, onChange: function (_e, v) { return set('RepairVendor', v || ''); } }),
            React.createElement(TextField, { label: "Issue Description *", className: styles.fullWidth, multiline: true, rows: 3, value: draft.IssueDescription, onChange: function (_e, v) { return set('IssueDescription', v || ''); } }),
            React.createElement(TextField, { label: "Resolution", className: styles.fullWidth, multiline: true, rows: 2, value: draft.Resolution, onChange: function (_e, v) { return set('Resolution', v || ''); } }),
            React.createElement(TextField, { label: "Repair Cost (INR)", type: "number", prefix: "\u20B9", value: String(draft.RepairCost || 0), onChange: function (_e, v) { return set('RepairCost', parseFloat(v || '0')); } }),
            React.createElement(TextField, { label: "Remarks", value: draft.Remarks, onChange: function (_e, v) { return set('Remarks', v || ''); } }),
            React.createElement("div", { className: styles.fullWidth },
                React.createElement("label", { style: { fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 } }, "Attachment"),
                React.createElement("div", { className: styles.fileField },
                    React.createElement("label", { className: styles.fileLabel },
                        React.createElement(AttachRegular, null),
                        React.createElement("span", null, ((_b = draft.AttachmentFile) === null || _b === void 0 ? void 0 : _b.name) || 'Choose file…'),
                        React.createElement("input", { type: "file", style: { display: 'none' }, onChange: function (e) { var _a; return set('AttachmentFile', (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]); } }))))),
        React.createElement(DialogFooter, null,
            React.createElement(PrimaryButton, { onClick: onConfirm, disabled: saving }, saving ? 'Saving…' : 'Add Repair'),
            React.createElement(DefaultButton, { onClick: onClose }, "Cancel"))));
};
// ── Main component ─────────────────────────────────────────────────────────────
var TYPE_OPTIONS = ['LAP', 'MAC', 'DTP', 'MON', 'DOC', 'MOB', 'NET', 'ACC']
    .map(function (t) { return ({ value: t, label: "".concat(t, " \u2013 ").concat(ASSET_TYPE_LABELS[t]) }); });
var INITIAL_STATUS_OPTIONS = [
    { value: 'Procured', label: 'Procured' },
    { value: 'Stock', label: 'Stock' },
];
var empty = function () { return ({
    SerialNumber: '', Model: '', Vendor: '', PONumber: '', InvoiceNumber: '',
    Cost: 0, PurchaseDate: '', WarrantyExpiry: '', Remarks: '',
    Status: 'Procured', Country: 'IN', OfficeCode: 'CHN',
}); };
var AssetDetailsForm = function (_a) {
    var _b;
    var asset = _a.asset, defaultCountry = _a.defaultCountry, defaultOffice = _a.defaultOffice, assetService = _a.assetService, repairService = _a.repairService, fileService = _a.fileService, onSave = _a.onSave, onCancel = _a.onCancel;
    var isEdit = !!asset;
    var _c = useState(asset ? __assign({}, asset) : __assign(__assign({}, empty()), { Country: defaultCountry, OfficeCode: defaultOffice })), form = _c[0], setForm = _c[1];
    var _d = useState([]), repairs = _d[0], setRepairs = _d[1];
    var _f = useState(false), loadingRepairs = _f[0], setLoadingRepairs = _f[1];
    var _g = useState(''), previewId = _g[0], setPreviewId = _g[1];
    var _h = useState(false), loadingId = _h[0], setLoadingId = _h[1];
    var _j = useState(false), saving = _j[0], setSaving = _j[1];
    var _k = useState({}), errors = _k[0], setErrors = _k[1];
    // File staging
    var _l = useState(null), purchaseBillFile = _l[0], setPurchaseBillFile = _l[1];
    // Repair dialog
    var _m = useState(false), repairDialogOpen = _m[0], setRepairDialogOpen = _m[1];
    var _o = useState(emptyRepairDraft()), repairDraft = _o[0], setRepairDraft = _o[1];
    var _p = useState(false), savingRepair = _p[0], setSavingRepair = _p[1];
    var set = useCallback(function (key, value) {
        return setForm(function (f) {
            var _a;
            return (__assign(__assign({}, f), (_a = {}, _a[key] = value, _a)));
        });
    }, []);
    // Live ID preview
    useEffect(function () {
        if (isEdit || !form.AssetType || !form.Country || !form.OfficeCode) {
            setPreviewId('');
            return;
        }
        setLoadingId(true);
        assetService.getNextSequenceNumber(form.AssetType, form.Country, form.OfficeCode)
            .then(function (seq) { return setPreviewId(AssetIdGenerator.generate(form.AssetType, form.Country, form.OfficeCode, seq)); })
            .catch(function () { return setPreviewId('—'); })
            .finally(function () { return setLoadingId(false); });
    }, [form.AssetType, form.Country, form.OfficeCode, isEdit, assetService]);
    // Load existing repairs in edit mode
    var loadRepairs = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var r;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isEdit || !(asset === null || asset === void 0 ? void 0 : asset.Title))
                        return [2 /*return*/];
                    setLoadingRepairs(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, repairService.getRepairs(asset.Title)];
                case 2:
                    r = _a.sent();
                    setRepairs(r);
                    return [3 /*break*/, 4];
                case 3:
                    setLoadingRepairs(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [isEdit, asset === null || asset === void 0 ? void 0 : asset.Title, repairService]);
    useEffect(function () { loadRepairs(); }, [loadRepairs]);
    // ── Validation ───────────────────────────────────────────────────────────────
    var validate = function () {
        var _a, _b, _c, _d, _f;
        var e = {};
        if (!form.AssetType)
            e.AssetType = 'Asset type is required.';
        if (!((_a = form.SerialNumber) === null || _a === void 0 ? void 0 : _a.trim()))
            e.SerialNumber = 'Serial number is required.';
        if (!((_b = form.Model) === null || _b === void 0 ? void 0 : _b.trim()))
            e.Model = 'Model is required.';
        if (!((_c = form.Vendor) === null || _c === void 0 ? void 0 : _c.trim()))
            e.Vendor = 'Vendor is required.';
        if (!form.PurchaseDate)
            e.PurchaseDate = 'Purchase date is required.';
        if (!((_d = form.Country) === null || _d === void 0 ? void 0 : _d.trim()))
            e.Country = 'Country code is required.';
        if (!((_f = form.OfficeCode) === null || _f === void 0 ? void 0 : _f.trim()))
            e.OfficeCode = 'Office code is required.';
        if (form.WarrantyExpiry && form.PurchaseDate &&
            new Date(form.WarrantyExpiry) <= new Date(form.PurchaseDate))
            e.WarrantyExpiry = 'Warranty expiry must be after purchase date.';
        if (form.Cost !== undefined && form.Cost < 0)
            e.Cost = 'Cost cannot be negative.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };
    // ── File upload helper ───────────────────────────────────────────────────────
    var maybeUpload = function (assetId, sub, file) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!file)
                return [2 /*return*/, null];
            return [2 /*return*/, fileService.upload(assetId, sub, file)];
        });
    }); };
    // ── Save ──────────────────────────────────────────────────────────────────────
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        var assetId, billResult, payload, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!validate())
                        return [2 /*return*/];
                    setSaving(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    assetId = isEdit ? asset.Title : previewId;
                    if (!assetId) {
                        setErrors({ form: 'Asset ID not ready.' });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, maybeUpload(assetId, 'purchase', purchaseBillFile)];
                case 2:
                    billResult = _b.sent();
                    payload = __assign({}, form);
                    if (billResult) {
                        payload.PurchaseBillUrl = billResult.serverRelativeUrl;
                    }
                    return [4 /*yield*/, onSave(payload)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 4:
                    _a = _b.sent();
                    setErrors({ form: 'Save failed. Please try again.' });
                    return [3 /*break*/, 6];
                case 5:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // ── Add repair entry ──────────────────────────────────────────────────────────
    var handleAddRepair = function () { return __awaiter(void 0, void 0, void 0, function () {
        var attachmentUrl, originalName, uniqueFile, r, entry_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!repairDraft.RepairDate || !repairDraft.RepairVendor || !repairDraft.IssueDescription)
                        return [2 /*return*/];
                    if (!(asset === null || asset === void 0 ? void 0 : asset.Id) || !(asset === null || asset === void 0 ? void 0 : asset.Title))
                        return [2 /*return*/];
                    setSavingRepair(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 5, 6]);
                    attachmentUrl = void 0;
                    if (!repairDraft.AttachmentFile) return [3 /*break*/, 3];
                    originalName = repairDraft.AttachmentFile.name;
                    uniqueFile = new File([repairDraft.AttachmentFile], "".concat(Date.now(), "_").concat(originalName), { type: repairDraft.AttachmentFile.type });
                    return [4 /*yield*/, fileService.upload(asset.Title, 'repairs', uniqueFile)];
                case 2:
                    r = _a.sent();
                    attachmentUrl = r.serverRelativeUrl;
                    _a.label = 3;
                case 3: return [4 /*yield*/, repairService.addRepair({
                        Title: asset.Title,
                        AssetItemId: asset.Id,
                        RepairDate: repairDraft.RepairDate,
                        RepairVendor: repairDraft.RepairVendor,
                        IssueDescription: repairDraft.IssueDescription,
                        RepairCost: repairDraft.RepairCost,
                        Resolution: repairDraft.Resolution || undefined,
                        Remarks: repairDraft.Remarks || undefined,
                        AttachmentUrl: attachmentUrl,
                    })];
                case 4:
                    entry_1 = _a.sent();
                    setRepairs(function (prev) { return __spreadArray([entry_1], prev, true); });
                    setRepairDraft(emptyRepairDraft());
                    setRepairDialogOpen(false);
                    return [3 /*break*/, 6];
                case 5:
                    setSavingRepair(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteRepair = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, repairService.deleteRepair(id)];
                case 1:
                    _a.sent();
                    setRepairs(function (prev) { return prev.filter(function (r) { return r.Id !== id; }); });
                    return [2 /*return*/];
            }
        });
    }); };
    // ── Render ────────────────────────────────────────────────────────────────────
    return (React.createElement("div", { className: styles.root },
        React.createElement("div", { className: styles.header },
            React.createElement(IconButton, { iconProps: { iconName: 'Back' }, onClick: onCancel }),
            React.createElement("div", null,
                React.createElement("span", { style: { fontSize: 20, fontWeight: 600 } }, isEdit ? "Edit Asset \u2014 ".concat(asset.Title) : 'Add New Asset'),
                !isEdit && (React.createElement("div", { className: styles.idPreview },
                    React.createElement(TagRegular, { style: { color: '#0078d4' } }),
                    loadingId
                        ? React.createElement(Spinner, { size: SpinnerSize.small })
                        : React.createElement("span", null,
                            "Asset ID will be: ",
                            React.createElement("strong", null, previewId || '(select type first)')))))),
        errors.form && (React.createElement(MessageBar, { messageBarType: MessageBarType.error }, errors.form)),
        React.createElement("div", { className: styles.form },
            React.createElement(Section, { title: "Identity", icon: React.createElement(TagRegular, null) },
                React.createElement("div", { className: styles.grid },
                    React.createElement(Dropdown, { label: "Asset Type *", selectedKey: form.AssetType || '', disabled: isEdit, options: __spreadArray([
                            { key: '', text: 'Select type…' }
                        ], TYPE_OPTIONS.map(function (t) { return ({ key: t.value, text: t.label }); }), true), onChange: function (_e, option) { return set('AssetType', option === null || option === void 0 ? void 0 : option.key); }, errorMessage: errors.AssetType }),
                    isEdit && (React.createElement(TextField, { label: "Asset ID", value: form.Title || '', disabled: true, styles: { field: { fontFamily: 'monospace', fontWeight: 700 } } })),
                    !isEdit && (React.createElement(Dropdown, { label: "Initial Status", selectedKey: form.Status || 'Procured', options: INITIAL_STATUS_OPTIONS.map(function (o) { return ({ key: o.value, text: o.label }); }), onChange: function (_e, option) { return set('Status', option === null || option === void 0 ? void 0 : option.key); } })),
                    React.createElement(TextField, { label: "Serial Number *", value: form.SerialNumber || '', onChange: function (_e, v) { return set('SerialNumber', v || ''); }, maxLength: 100, errorMessage: errors.SerialNumber }),
                    React.createElement(TextField, { label: "Model *", value: form.Model || '', onChange: function (_e, v) { return set('Model', v || ''); }, maxLength: 200, errorMessage: errors.Model }),
                    React.createElement(TextField, { label: "Vendor *", value: form.Vendor || '', onChange: function (_e, v) { return set('Vendor', v || ''); }, maxLength: 200, errorMessage: errors.Vendor }),
                    React.createElement(TextField, { label: "Country Code *", value: form.Country || '', disabled: isEdit, onChange: function (_e, v) { return set('Country', (v || '').toUpperCase()); }, maxLength: 5, errorMessage: errors.Country }),
                    React.createElement(TextField, { label: "Office Code *", value: form.OfficeCode || '', disabled: isEdit, onChange: function (_e, v) { return set('OfficeCode', (v || '').toUpperCase()); }, maxLength: 5, errorMessage: errors.OfficeCode }))),
            React.createElement(Section, { title: "Procurement", icon: React.createElement(MoneyRegular, null) },
                React.createElement("div", { className: styles.grid },
                    React.createElement(DateField, { label: "Purchase Date *", value: form.PurchaseDate || '', onChange: function (v) { return set('PurchaseDate', v); }, required: true, error: errors.PurchaseDate }),
                    React.createElement(DateField, { label: "Warranty Expiry", value: form.WarrantyExpiry || '', onChange: function (v) { return set('WarrantyExpiry', v); }, error: errors.WarrantyExpiry }),
                    React.createElement(TextField, { label: "PO Number", value: form.PONumber || '', onChange: function (_e, v) { return set('PONumber', v || ''); }, maxLength: 100 }),
                    React.createElement(TextField, { label: "Invoice Number", value: form.InvoiceNumber || '', onChange: function (_e, v) { return set('InvoiceNumber', v || ''); }, maxLength: 100 }),
                    React.createElement(TextField, { label: "Cost (INR)", type: "number", prefix: "\u20B9", value: String((_b = form.Cost) !== null && _b !== void 0 ? _b : 0), onChange: function (_e, v) { return set('Cost', parseFloat(v || '0')); }, errorMessage: errors.Cost }),
                    React.createElement(FileField, { label: "Purchase Bill / Invoice", existingUrl: form.PurchaseBillUrl, selectedFile: purchaseBillFile, onFileSelected: setPurchaseBillFile }))),
            isEdit && (React.createElement(Section, { title: "Repair History", icon: React.createElement(WrenchRegular, null) }, loadingRepairs ? (React.createElement(Spinner, { size: SpinnerSize.small, label: "Loading repairs\u2026" })) : (React.createElement(React.Fragment, null,
                repairs.length === 0 && (React.createElement("span", { style: { fontSize: 12, color: '#707070' } }, "No repair records yet.")),
                repairs.map(function (r) { return (React.createElement("div", { key: r.Id, className: styles.repairEntry },
                    React.createElement("div", { className: styles.repairRow },
                        React.createElement("div", null,
                            React.createElement("span", { style: { fontWeight: 600 } }, AssetIdGenerator.formatDate(r.RepairDate)),
                            React.createElement("span", { style: { fontSize: 12, marginLeft: 8, color: '#707070' } }, r.RepairVendor)),
                        React.createElement("div", { style: { display: 'flex', gap: 8, alignItems: 'center' } },
                            r.AttachmentUrl && (React.createElement("a", { href: r.AttachmentUrl, target: "_blank", rel: "noopener noreferrer", className: styles.fileLink },
                                React.createElement(AttachRegular, null),
                                " View repair report")),
                            React.createElement(IconButton, { iconProps: { iconName: 'Delete' }, onClick: function () { return r.Id !== undefined && handleDeleteRepair(r.Id); } }))),
                    React.createElement("span", { style: { fontSize: 12 } }, r.IssueDescription),
                    r.Resolution && (React.createElement("span", { style: { fontSize: 12, color: '#107c10', display: 'block' } },
                        "Resolution: ",
                        r.Resolution)),
                    r.RepairCost > 0 && (React.createElement("span", { style: { fontSize: 12, color: '#707070', display: 'block' } },
                        "Cost: \u20B9",
                        r.RepairCost.toLocaleString('en-IN'))),
                    React.createElement(Separator, null))); }),
                React.createElement(DefaultButton, { iconProps: { iconName: 'Add' }, onClick: function () { setRepairDraft(emptyRepairDraft()); setRepairDialogOpen(true); }, style: { marginTop: 8 } }, "Add Repair Entry"))))),
            React.createElement(Section, { title: "Remarks", icon: React.createElement(DocumentRegular, null) },
                React.createElement(TextField, { multiline: true, rows: 3, value: form.Remarks || '', onChange: function (_e, v) { return set('Remarks', v || ''); }, maxLength: 2000, placeholder: "Any additional notes about this asset\u2026" }))),
        React.createElement("div", { className: styles.footer },
            React.createElement(PrimaryButton, { iconProps: { iconName: saving ? undefined : 'Save' }, onClick: handleSave, disabled: saving }, saving
                ? React.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                    React.createElement(Spinner, { size: SpinnerSize.small }),
                    React.createElement("span", null, isEdit ? 'Updating…' : 'Creating…'))
                : (isEdit ? 'Update Asset' : 'Create Asset')),
            React.createElement(DefaultButton, { onClick: onCancel }, "Cancel")),
        React.createElement(RepairDialog, { open: repairDialogOpen, draft: repairDraft, saving: savingRepair, onDraftChange: setRepairDraft, onConfirm: handleAddRepair, onClose: function () { return setRepairDialogOpen(false); } })));
};
export default AssetDetailsForm;
//# sourceMappingURL=AssetDetailsForm.js.map