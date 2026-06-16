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
import { useState, useEffect } from 'react';
import { Stack, TextField, Dropdown, DatePicker, defaultDatePickerStrings, PrimaryButton, DefaultButton, Spinner, SpinnerSize, Text, Icon, } from '@fluentui/react';
import { ASSET_TYPE_LABELS, NEW_ASSET_TYPES, COUNTRY_OPTIONS, OFFICE_OPTIONS } from '../models/IAsset';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import styles from './AssetForm.module.scss';
var TYPE_OPTIONS = NEW_ASSET_TYPES
    .map(function (t) { return ({ key: t, text: "".concat(t, " \u2013 ").concat(ASSET_TYPE_LABELS[t]) }); });
var INITIAL_STATUS_OPTIONS = ['Procured', 'Stock']
    .map(function (s) { return ({ key: s, text: s }); });
var DEPT_OPTIONS = [
    'Engineering', 'Product', 'Design', 'Data Science', 'Sales', 'Marketing',
    'HR', 'Finance', 'Operations', 'Legal', 'IT', 'Management', 'Customer Success',
].map(function (d) { return ({ key: d, text: d }); });
var LOCATION_OPTIONS = [
    'Chennai - Nungambakkam',
    'Chennai - WFH',
    'Remote',
    'Warehouse',
    'Other',
].map(function (l) { return ({ key: l, text: l }); });
var empty = {
    SerialNumber: '', Model: '', Vendor: '', PONumber: '', InvoiceNumber: '',
    Cost: 0, PurchaseDate: '', WarrantyExpiry: '',
    AssignedTo: '', AssignedToEmail: '',
    Department: '', AssetLocation: '', Remarks: '',
    Status: 'Procured', AssetType: undefined, Country: 'IN', OfficeCode: 'GIC',
};
var AssetForm = function (_a) {
    var asset = _a.asset, defaultCountry = _a.defaultCountry, defaultOffice = _a.defaultOffice, assetService = _a.assetService, onSave = _a.onSave, onCancel = _a.onCancel;
    var isEdit = !!asset;
    var _b = useState(asset ? __assign({}, asset) : __assign(__assign({}, empty), { Country: defaultCountry, OfficeCode: defaultOffice })), form = _b[0], setForm = _b[1];
    var _c = useState(''), previewId = _c[0], setPreviewId = _c[1];
    var _d = useState(false), saving = _d[0], setSaving = _d[1];
    var _f = useState({}), errors = _f[0], setErrors = _f[1];
    var _g = useState(false), loadingId = _g[0], setLoadingId = _g[1];
    // Recompute preview ID when type/country/office changes (add mode only)
    useEffect(function () {
        if (isEdit || !form.AssetType || !form.Country || !form.OfficeCode) {
            setPreviewId('');
            return;
        }
        setLoadingId(true);
        assetService.getNextSequenceNumber()
            .then(function (seq) {
            setPreviewId(AssetIdGenerator.generate(form.Country, form.OfficeCode, form.AssetType, seq));
        })
            .catch(function () { return setPreviewId('—'); })
            .finally(function () { return setLoadingId(false); });
    }, [form.AssetType, form.Country, form.OfficeCode, isEdit]);
    var set = function (key, value) { return setForm(function (f) {
        var _a;
        return (__assign(__assign({}, f), (_a = {}, _a[key] = value, _a)));
    }); };
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
        if (form.WarrantyExpiry && form.PurchaseDate && new Date(form.WarrantyExpiry) <= new Date(form.PurchaseDate)) {
            e.WarrantyExpiry = 'Warranty expiry must be after purchase date.';
        }
        if (form.Cost && form.Cost < 0)
            e.Cost = 'Cost cannot be negative.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!validate())
                        return [2 /*return*/];
                    setSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, onSave(form)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var parseDate = function (iso) { return iso ? new Date(iso) : undefined; };
    return (React.createElement("div", { className: styles.root },
        React.createElement("div", { className: styles.header },
            React.createElement(DefaultButton, { iconProps: { iconName: 'Back' }, onClick: onCancel, className: styles.backBtn }),
            React.createElement("div", null,
                React.createElement(Text, { variant: "xLarge", className: styles.title }, isEdit ? "Edit Asset \u2014 ".concat(asset.Title) : 'Add New Asset'),
                !isEdit && (React.createElement("div", { className: styles.idPreview },
                    React.createElement(Icon, { iconName: "Tag" }),
                    loadingId ? React.createElement(Spinner, { size: SpinnerSize.xSmall }) : (React.createElement("span", null,
                        "Asset ID will be: ",
                        React.createElement("strong", null, previewId || '(select type first)'))))))),
        React.createElement("div", { className: styles.form },
            React.createElement("div", { className: styles.section },
                React.createElement("div", { className: styles.sectionTitle },
                    React.createElement(Icon, { iconName: "Tag" }),
                    " Classification"),
                React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 16 }, wrap: true },
                    React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 200 } } },
                        React.createElement(Dropdown, { label: "Asset Type *", options: TYPE_OPTIONS, selectedKey: form.AssetType || null, onChange: function (_e, o) { return set('AssetType', o === null || o === void 0 ? void 0 : o.key); }, errorMessage: errors.AssetType, disabled: isEdit })),
                    !isEdit && (React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 200 } } },
                        React.createElement(Dropdown, { label: "Initial Status *", options: INITIAL_STATUS_OPTIONS, selectedKey: form.Status, onChange: function (_e, o) { return set('Status', o === null || o === void 0 ? void 0 : o.key); } }))),
                    React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 160 } } },
                        React.createElement(Dropdown, { label: "Country *", selectedKey: form.Country || '', disabled: isEdit, options: __spreadArray([
                                { key: '', text: 'Select country…' }
                            ], COUNTRY_OPTIONS.map(function (c) { return ({ key: c.key, text: c.text }); }), true), onChange: function (_e, option) {
                                var _a, _b;
                                var country = option === null || option === void 0 ? void 0 : option.key;
                                var firstOffice = ((_b = (_a = OFFICE_OPTIONS[country]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.key) || '';
                                setForm(function (f) { return (__assign(__assign({}, f), { Country: country, OfficeCode: firstOffice })); });
                            }, errorMessage: errors.Country })),
                    React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 240 } } },
                        React.createElement(Dropdown, { label: "Site / Office Code *", selectedKey: form.OfficeCode || '', disabled: isEdit || !form.Country, options: __spreadArray([
                                { key: '', text: form.Country ? 'Select site…' : 'Select country first…' }
                            ], (OFFICE_OPTIONS[form.Country || ''] || []).map(function (o) { return ({ key: o.key, text: o.text }); }), true), onChange: function (_e, option) { return set('OfficeCode', option === null || option === void 0 ? void 0 : option.key); }, errorMessage: errors.OfficeCode })))),
            React.createElement("div", { className: styles.section },
                React.createElement("div", { className: styles.sectionTitle },
                    React.createElement(Icon, { iconName: "PC1" }),
                    " Hardware Details"),
                React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 16 }, wrap: true },
                    React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 200 } } },
                        React.createElement(TextField, { label: "Serial Number *", value: form.SerialNumber || '', onChange: function (_e, v) { return set('SerialNumber', v); }, errorMessage: errors.SerialNumber, maxLength: 100 })),
                    React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 200 } } },
                        React.createElement(TextField, { label: "Model *", value: form.Model || '', onChange: function (_e, v) { return set('Model', v); }, errorMessage: errors.Model, maxLength: 200 })),
                    React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 160 } } },
                        React.createElement(TextField, { label: "Vendor *", value: form.Vendor || '', onChange: function (_e, v) { return set('Vendor', v); }, errorMessage: errors.Vendor, maxLength: 200 })))),
            React.createElement("div", { className: styles.section },
                React.createElement("div", { className: styles.sectionTitle },
                    React.createElement(Icon, { iconName: "Money" }),
                    " Procurement"),
                React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 16 }, wrap: true },
                    React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 160 } } },
                        React.createElement(TextField, { label: "PO Number", value: form.PONumber || '', onChange: function (_e, v) { return set('PONumber', v); }, maxLength: 100 })),
                    React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 160 } } },
                        React.createElement(TextField, { label: "Invoice Number", value: form.InvoiceNumber || '', onChange: function (_e, v) { return set('InvoiceNumber', v); }, maxLength: 100 })),
                    React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 140 } } },
                        React.createElement(TextField, { label: "Cost (INR)", type: "number", value: String(form.Cost || 0), onChange: function (_e, v) { return set('Cost', parseFloat(v || '0')); }, errorMessage: errors.Cost, prefix: "\u20B9" })),
                    React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 160 } } },
                        React.createElement(DatePicker, { label: "Purchase Date *", value: parseDate(form.PurchaseDate), onSelectDate: function (d) { return set('PurchaseDate', (d === null || d === void 0 ? void 0 : d.toISOString()) || ''); }, strings: defaultDatePickerStrings, formatDate: function (d) { return d ? AssetIdGenerator.formatDate(d.toISOString()) : ''; } }),
                        errors.PurchaseDate && React.createElement(Text, { className: styles.errText }, errors.PurchaseDate)),
                    React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 160 } } },
                        React.createElement(DatePicker, { label: "Warranty Expiry", value: parseDate(form.WarrantyExpiry), onSelectDate: function (d) { return set('WarrantyExpiry', (d === null || d === void 0 ? void 0 : d.toISOString()) || ''); }, strings: defaultDatePickerStrings, formatDate: function (d) { return d ? AssetIdGenerator.formatDate(d.toISOString()) : ''; } }),
                        errors.WarrantyExpiry && React.createElement(Text, { className: styles.errText }, errors.WarrantyExpiry)))),
            React.createElement("div", { className: styles.section },
                React.createElement("div", { className: styles.sectionTitle },
                    React.createElement(Icon, { iconName: "Contact" }),
                    " Assignment"),
                React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 16 }, wrap: true },
                    React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 200 } } },
                        React.createElement(TextField, { label: "Assigned To", value: form.AssignedTo || '', onChange: function (_e, v) { return set('AssignedTo', v); }, maxLength: 255, placeholder: "Full name" })),
                    React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 220 } } },
                        React.createElement(TextField, { label: "Assigned To Email", value: form.AssignedToEmail || '', onChange: function (_e, v) { return set('AssignedToEmail', v); }, maxLength: 255, type: "email", placeholder: "user@company.com" })),
                    React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 180 } } },
                        React.createElement(Dropdown, { label: "Department", options: DEPT_OPTIONS, selectedKey: form.Department || null, onChange: function (_e, o) { return set('Department', o === null || o === void 0 ? void 0 : o.key); }, placeholder: "Select department" })),
                    React.createElement(Stack.Item, { grow: true, styles: { root: { minWidth: 180 } } },
                        React.createElement(Dropdown, { label: "Location", options: LOCATION_OPTIONS, selectedKey: form.AssetLocation || null, onChange: function (_e, o) { return set('AssetLocation', o === null || o === void 0 ? void 0 : o.key); }, placeholder: "Select location" })))),
            React.createElement("div", { className: styles.section },
                React.createElement(TextField, { label: "Remarks", multiline: true, rows: 3, value: form.Remarks || '', onChange: function (_e, v) { return set('Remarks', v); }, maxLength: 2000, placeholder: "Any additional notes about this asset\u2026" }))),
        React.createElement("div", { className: styles.footer },
            React.createElement(PrimaryButton, { text: saving ? 'Saving…' : (isEdit ? 'Update Asset' : 'Create Asset'), onClick: handleSave, disabled: saving, iconProps: { iconName: isEdit ? 'Save' : 'Add' } }),
            saving && React.createElement(Spinner, { size: SpinnerSize.small }),
            React.createElement(DefaultButton, { text: "Cancel", onClick: onCancel }))));
};
export default AssetForm;
//# sourceMappingURL=AssetForm.js.map