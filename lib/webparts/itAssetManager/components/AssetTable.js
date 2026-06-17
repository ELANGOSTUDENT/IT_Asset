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
import { useState, useMemo, useRef } from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, SearchBox, Dropdown, Stack, DefaultButton, IconButton, CommandBar, Spinner, SpinnerSize, Text, Icon, Selection, Dialog, DialogType, DialogFooter, TextField, MessageBar, MessageBarType, } from '@fluentui/react';
import { ASSET_TYPE_LABELS, STATUS_BADGE_COLORS, ALL_ASSET_TYPES, OFFICE_OPTIONS, } from '../models/IAsset';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import styles from './AssetTable.module.scss';
// ── Display helpers ────────────────────────────────────────────────────────────
function normalizeStatusLabel(status) {
    if (status === 'Stock')
        return 'In Stock';
    if (status === 'Repair')
        return 'In Repair';
    if (status === 'TempAssigned')
        return 'Temp Assigned';
    if (status === 'EndOfService')
        return 'End of Service';
    return status;
}
// ── Filter constants ──────────────────────────────────────────────────────────
var STATUS_OPTIONS = [
    { key: '', text: 'All Statuses' },
    { key: 'Procured', text: 'Procured' },
    { key: 'Stock', text: 'In Stock' },
    { key: 'Active', text: 'Active' },
    { key: 'Repair', text: 'In Repair' },
    { key: 'TempAssigned', text: 'Temp Assigned' },
    { key: 'Gifted', text: 'Gifted' },
    { key: 'Lost', text: 'Lost' },
    { key: 'Stolen', text: 'Stolen' },
    { key: 'EndOfService', text: 'End of Service' },
    { key: 'Scrapped', text: 'Scrapped' },
    { key: 'Disposed', text: 'Disposed' },
];
var TYPE_OPTIONS = __spreadArray([
    { key: '', text: 'All Types' }
], ALL_ASSET_TYPES.map(function (t) { return ({ key: t, text: "".concat(t, " \u2013 ").concat(ASSET_TYPE_LABELS[t]) }); }), true);
var COUNTRY_FILTER_OPTIONS = [
    { key: 'all', text: 'All Countries' },
    { key: 'IN', text: 'India' },
    { key: 'US', text: 'United States' },
];
var WARRANTY_FILTER_OPTIONS = [
    { key: '', text: 'All Warranties' },
    { key: 'expiring', text: 'Expiring Soon (≤30 d)' },
    { key: 'expired', text: 'Expired' },
    { key: 'valid', text: 'Valid (31+ days)' },
];
var OFFICE_FILTER_LABELS = {
    GIC: 'GIC — Chennai',
    UWB: 'UWB — Gurgaon',
    UWK: 'UWK — Pune',
    NYC: 'NYC — New York',
    BOS: 'BOS — Boston',
};
function getOfficeFilterOptions(country) {
    if (country === 'IN') {
        return __spreadArray([
            { key: 'all', text: 'All India Offices' }
        ], OFFICE_OPTIONS['IN'].map(function (o) { return ({ key: o.key, text: OFFICE_FILTER_LABELS[o.key] || o.text }); }), true);
    }
    if (country === 'US') {
        return __spreadArray([
            { key: 'all', text: 'All US Offices' }
        ], OFFICE_OPTIONS['US'].map(function (o) { return ({ key: o.key, text: OFFICE_FILTER_LABELS[o.key] || o.text }); }), true);
    }
    return [];
}
// ── Status badge ──────────────────────────────────────────────────────────────
var StatusBadge = function (_a) {
    var status = _a.status;
    var colors = STATUS_BADGE_COLORS[status] || { bg: '#ebebeb', text: '#333' };
    return (React.createElement("span", { className: styles.statusBadge, style: { background: colors.bg, color: colors.text } }, normalizeStatusLabel(status)));
};
// ── Component ─────────────────────────────────────────────────────────────────
var AssetTable = function (_a) {
    var assets = _a.assets, loading = _a.loading, onAddNew = _a.onAddNew, onView = _a.onView, onEdit = _a.onEdit, onRefresh = _a.onRefresh, onBulkLinkDocument = _a.onBulkLinkDocument;
    var _b = useState(''), search = _b[0], setSearch = _b[1];
    var _c = useState(''), filterStatus = _c[0], setFilterStatus = _c[1];
    var _d = useState(''), filterType = _d[0], setFilterType = _d[1];
    var _f = useState(''), filterDept = _f[0], setFilterDept = _f[1];
    var _g = useState(''), filterWarranty = _g[0], setFilterWarranty = _g[1];
    var _h = useState('all'), countryFilter = _h[0], setCountryFilter = _h[1];
    var _j = useState('all'), officeFilter = _j[0], setOfficeFilter = _j[1];
    var _k = useState('Title'), sortCol = _k[0], setSortCol = _k[1];
    var _l = useState(true), sortAsc = _l[0], setSortAsc = _l[1];
    // 6.13 Bulk document linking
    var _m = useState([]), selectedItems = _m[0], setSelectedItems = _m[1];
    var _o = useState(false), showBulkDlg = _o[0], setShowBulkDlg = _o[1];
    var _p = useState(''), bulkDocUrl = _p[0], setBulkDocUrl = _p[1];
    var _q = useState(false), bulkLinking = _q[0], setBulkLinking = _q[1];
    var _r = useState(''), bulkLinkError = _r[0], setBulkLinkError = _r[1];
    var _s = useState(false), bulkLinkDone = _s[0], setBulkLinkDone = _s[1];
    var selectionRef = useRef(null);
    if (!selectionRef.current) {
        selectionRef.current = new Selection({
            onSelectionChanged: function () {
                var _a;
                setSelectedItems(((_a = selectionRef.current) === null || _a === void 0 ? void 0 : _a.getSelection()) || []);
            },
        });
    }
    var selection = selectionRef.current;
    var deptOptions = useMemo(function () {
        var depts = Array.from(new Set(assets.map(function (a) { return a.Department; }).filter(Boolean))).sort();
        return __spreadArray([{ key: '', text: 'All Departments' }], depts.map(function (d) { return ({ key: d, text: d }); }), true);
    }, [assets]);
    var filtered = useMemo(function () {
        var q = search.toLowerCase();
        return assets
            .filter(function (a) {
            var _a, _b, _c, _d, _f, _g, _h;
            if (filterStatus && a.Status !== filterStatus)
                return false;
            if (filterType && a.AssetType !== filterType)
                return false;
            if (filterDept && a.Department !== filterDept)
                return false;
            if (countryFilter !== 'all') {
                if (a.Country !== countryFilter)
                    return false;
                if (officeFilter !== 'all' && a.OfficeCode !== officeFilter)
                    return false;
            }
            if (filterWarranty) {
                var days = AssetIdGenerator.daysUntilWarrantyExpiry(a.WarrantyExpiry);
                if (filterWarranty === 'expired')
                    return days < 0;
                if (filterWarranty === 'expiring')
                    return days >= 0 && days <= 30;
                if (filterWarranty === 'valid')
                    return days > 30;
            }
            if (q) {
                return (((_a = a.Title) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(q)) ||
                    ((_b = a.SerialNumber) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(q)) ||
                    ((_c = a.Model) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(q)) ||
                    ((_d = a.Vendor) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(q)) ||
                    ((_f = a.AssignedTo) === null || _f === void 0 ? void 0 : _f.toLowerCase().includes(q)) ||
                    ((_g = a.Department) === null || _g === void 0 ? void 0 : _g.toLowerCase().includes(q)) ||
                    ((_h = a.Country) === null || _h === void 0 ? void 0 : _h.toLowerCase().includes(q)));
            }
            return true;
        })
            .sort(function (a, b) {
            var av = String(a[sortCol] || '');
            var bv = String(b[sortCol] || '');
            return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
        });
    }, [assets, search, filterStatus, filterType, filterDept, filterWarranty, countryFilter, officeFilter, sortCol, sortAsc]);
    var hasActiveFilters = !!(search || filterStatus || filterType || filterDept || filterWarranty ||
        countryFilter !== 'all' || officeFilter !== 'all');
    var clearAllFilters = function () {
        setSearch('');
        setFilterStatus('');
        setFilterType('');
        setFilterDept('');
        setFilterWarranty('');
        setCountryFilter('all');
        setOfficeFilter('all');
    };
    var exportCSV = function () {
        var headers = [
            'Asset ID', 'Type', 'Model', 'Serial Number', 'Make', 'Status',
            'Assigned To', 'Department', 'Location', 'Country',
            'Warranty End', 'Purchase Date', 'Cost (INR)', 'Remarks',
        ];
        var rows = filtered.map(function (a) { return [
            a.Title,
            a.AssetType,
            a.Model,
            a.SerialNumber,
            a.Vendor,
            normalizeStatusLabel(a.Status),
            a.AssignedTo,
            a.Department,
            a.AssetLocation,
            a.Country,
            AssetIdGenerator.formatDate(a.WarrantyExpiry),
            AssetIdGenerator.formatDate(a.PurchaseDate),
            a.Cost,
            a.Remarks,
        ].map(function (v) { return "\"".concat(String(v || '').replace(/"/g, '""'), "\""); }).join(','); });
        var csv = __spreadArray([headers.join(',')], rows, true).join('\n');
        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = "IT_Assets_".concat(new Date().toISOString().slice(0, 10), ".csv");
        link.click();
        URL.revokeObjectURL(url);
    };
    var handleColClick = function (col) {
        if (col.fieldName === sortCol) {
            setSortAsc(!sortAsc);
        }
        else {
            setSortCol(col.fieldName);
            setSortAsc(true);
        }
    };
    var makeCol = function (key, name, minW, maxW, onRender) { return ({
        key: key,
        name: name,
        fieldName: key, minWidth: minW, maxWidth: maxW,
        isResizable: true, isSorted: sortCol === key, isSortedDescending: !sortAsc,
        onColumnClick: function (_e, col) { return handleColClick(col); },
        onRender: onRender,
    }); };
    var columns = [
        makeCol('Title', 'Asset ID', 140, 170, function (a) { return (React.createElement("span", { className: styles.assetId, onClick: function () { return onView(a); } }, a.Title)); }),
        makeCol('AssetType', 'Type', 55, 70, function (a) { return (React.createElement("span", { title: ASSET_TYPE_LABELS[a.AssetType] || a.AssetType }, a.AssetType)); }),
        makeCol('Model', 'Model', 120, 200),
        makeCol('SerialNumber', 'Serial No.', 100, 150),
        makeCol('Vendor', 'Make', 80, 130),
        makeCol('Status', 'Status', 90, 120, function (a) { return React.createElement(StatusBadge, { status: a.Status }); }),
        makeCol('AssignedTo', 'Assigned To', 100, 160),
        makeCol('Department', 'Department', 90, 140),
        makeCol('AssetLocation', 'Location', 80, 120),
        makeCol('WarrantyExpiry', 'Warranty End', 90, 120, function (a) {
            var days = AssetIdGenerator.daysUntilWarrantyExpiry(a.WarrantyExpiry);
            var color = (days < 0 || days <= 30) ? '#a4262c' : days <= 90 ? '#ca5010' : 'inherit';
            return React.createElement("span", { style: { color: color, fontWeight: days <= 30 ? 600 : undefined } }, AssetIdGenerator.formatDate(a.WarrantyExpiry));
        }),
        makeCol('Country', 'Country', 56, 70),
        {
            key: 'actions', name: '', minWidth: 64, maxWidth: 72,
            onRender: function (a) { return (React.createElement("div", { className: styles.rowActions },
                React.createElement(IconButton, { iconProps: { iconName: 'View' }, title: "View details", ariaLabel: "View", onClick: function () { return onView(a); }, styles: { root: { width: 28, height: 28 }, icon: { fontSize: 14 } } }),
                React.createElement(IconButton, { iconProps: { iconName: 'Edit' }, title: "Edit asset", ariaLabel: "Edit", onClick: function () { return onEdit(a); }, styles: { root: { width: 28, height: 28 }, icon: { fontSize: 14 } } }))); },
        },
    ];
    var handleBulkLink = function () { return __awaiter(void 0, void 0, void 0, function () {
        var ids, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!bulkDocUrl.trim() || !selectedItems.length || !onBulkLinkDocument)
                        return [2 /*return*/];
                    setBulkLinking(true);
                    setBulkLinkError('');
                    setBulkLinkDone(false);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    ids = selectedItems.map(function (a) { return a.Id; }).filter(Boolean);
                    return [4 /*yield*/, onBulkLinkDocument(ids, bulkDocUrl.trim())];
                case 2:
                    _b.sent();
                    setBulkLinkDone(true);
                    setBulkDocUrl('');
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    setBulkLinkError('Link failed. Please check the URL and try again.');
                    return [3 /*break*/, 5];
                case 4:
                    setBulkLinking(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var commandItems = __spreadArray([
        { key: 'add', text: 'Add Asset', iconProps: { iconName: 'Add' }, onClick: onAddNew },
        { key: 'refresh', text: 'Refresh', iconProps: { iconName: 'Refresh' }, onClick: onRefresh },
        { key: 'export', text: 'Export CSV', iconProps: { iconName: 'Download' }, onClick: exportCSV }
    ], (selectedItems.length > 0 && onBulkLinkDocument ? [{
            key: 'linkdoc',
            text: "Link Document (".concat(selectedItems.length, " selected)"),
            iconProps: { iconName: 'Link' },
            onClick: function () { setBulkDocUrl(''); setBulkLinkError(''); setBulkLinkDone(false); setShowBulkDlg(true); },
        }] : []), true);
    return (React.createElement("div", { className: styles.root },
        React.createElement(CommandBar, { items: commandItems }),
        React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 12 }, className: styles.filters, wrap: true },
            React.createElement(SearchBox, { placeholder: "Search assets, serial, model, user\u2026", value: search, onChange: function (_e, v) { return setSearch(v || ''); }, className: styles.searchBox }),
            React.createElement(Dropdown, { options: STATUS_OPTIONS, selectedKey: filterStatus, onChange: function (_e, o) { return setFilterStatus((o === null || o === void 0 ? void 0 : o.key) || ''); }, className: styles.filterDrop, placeholder: "Status" }),
            React.createElement(Dropdown, { options: TYPE_OPTIONS, selectedKey: filterType, onChange: function (_e, o) { return setFilterType((o === null || o === void 0 ? void 0 : o.key) || ''); }, className: styles.filterDrop, placeholder: "Type" }),
            React.createElement(Dropdown, { options: deptOptions, selectedKey: filterDept, onChange: function (_e, o) { return setFilterDept((o === null || o === void 0 ? void 0 : o.key) || ''); }, className: styles.filterDrop, placeholder: "Department" }),
            React.createElement(Dropdown, { options: COUNTRY_FILTER_OPTIONS, selectedKey: countryFilter, onChange: function (_e, o) {
                    setCountryFilter((o === null || o === void 0 ? void 0 : o.key) || 'all');
                    setOfficeFilter('all');
                }, className: styles.filterDrop, placeholder: "Country" }),
            countryFilter !== 'all' && (React.createElement(Dropdown, { options: getOfficeFilterOptions(countryFilter), selectedKey: officeFilter, onChange: function (_e, o) { return setOfficeFilter((o === null || o === void 0 ? void 0 : o.key) || 'all'); }, className: styles.filterDrop, placeholder: "Site / Office" })),
            React.createElement(Dropdown, { options: WARRANTY_FILTER_OPTIONS, selectedKey: filterWarranty, onChange: function (_e, o) { return setFilterWarranty((o === null || o === void 0 ? void 0 : o.key) || ''); }, className: styles.filterDrop, placeholder: "Warranty" }),
            hasActiveFilters && (React.createElement(DefaultButton, { text: "Clear", iconProps: { iconName: 'ClearFilter' }, onClick: clearAllFilters }))),
        React.createElement("div", { className: styles.resultCount },
            loading && React.createElement(Spinner, { size: SpinnerSize.xSmall }),
            React.createElement(Text, { variant: "small" },
                filtered.length,
                " of ",
                assets.length,
                " assets")),
        filtered.length === 0 && !loading ? (React.createElement("div", { className: "".concat(styles.empty, " ").concat(styles.fadeIn) },
            React.createElement(Icon, { iconName: "Inbox", className: styles.emptyIcon }),
            React.createElement("p", { className: styles.emptyTitle }, "No assets found"),
            React.createElement("p", { className: styles.emptyHint }, assets.length === 0
                ? 'Click "Add Asset" to register your first asset.'
                : 'Try adjusting your search or filters.'))) : (React.createElement(DetailsList, { items: filtered, columns: columns, layoutMode: DetailsListLayoutMode.justified, selectionMode: onBulkLinkDocument ? SelectionMode.multiple : SelectionMode.none, selection: selection, selectionPreservedOnEmptyClick: true, compact: true, className: "".concat(styles.list, " ").concat(styles.fadeIn) })),
        React.createElement(Dialog, { hidden: !showBulkDlg, onDismiss: function () { setShowBulkDlg(false); setBulkLinkDone(false); }, dialogContentProps: {
                type: DialogType.normal,
                title: 'Link Document to Selected Assets',
                subText: "This will link the document URL as the Purchase Invoice on ".concat(selectedItems.length, " selected asset(s)."),
            }, modalProps: { isBlocking: false }, styles: { main: { minWidth: 520 } } },
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 } },
                selectedItems.length > 0 && (React.createElement("div", { style: { fontSize: 12, color: '#605e5c' } },
                    "Selected: ",
                    selectedItems.map(function (a) { return a.Title; }).join(', '))),
                React.createElement(TextField, { label: "Document URL *", value: bulkDocUrl, onChange: function (_e, v) { return setBulkDocUrl(v || ''); }, placeholder: "https://\u2026  or  /sites/\u2026/Shared Documents/\u2026" }),
                bulkLinkError && React.createElement(MessageBar, { messageBarType: MessageBarType.error }, bulkLinkError),
                bulkLinkDone && React.createElement(MessageBar, { messageBarType: MessageBarType.success },
                    "Document linked to ",
                    selectedItems.length,
                    " asset(s) successfully.")),
            React.createElement(DialogFooter, null,
                React.createElement(DefaultButton, { primary: true, onClick: handleBulkLink, disabled: !bulkDocUrl.trim() || bulkLinking || bulkLinkDone }, bulkLinking ? 'Linking…' : 'Link Document'),
                React.createElement(DefaultButton, { onClick: function () { setShowBulkDlg(false); setBulkLinkDone(false); } }, bulkLinkDone ? 'Close' : 'Cancel')))));
};
export default AssetTable;
//# sourceMappingURL=AssetTable.js.map