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
import { useState, useMemo } from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, SearchBox, Dropdown, Stack, DefaultButton, IconButton, CommandBar, Spinner, SpinnerSize, Text, Icon, } from '@fluentui/react';
import { ASSET_TYPE_LABELS, STATUS_BADGE_COLORS, ALL_ASSET_TYPES, OFFICE_OPTIONS } from '../models/IAsset';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import styles from './AssetTable.module.scss';
var STATUS_OPTIONS = __spreadArray([
    { key: '', text: 'All Statuses' }
], ['Procured', 'Stock', 'Active', 'Repair', 'Transferred', 'Gifted', 'Lost', 'Stolen', 'Scrapped', 'Disposed']
    .map(function (s) { return ({ key: s, text: s }); }), true);
var TYPE_OPTIONS = __spreadArray([
    { key: '', text: 'All Types' }
], ALL_ASSET_TYPES.map(function (t) { return ({ key: t, text: "".concat(t, " \u2013 ").concat(ASSET_TYPE_LABELS[t]) }); }), true);
var COUNTRY_FILTER_OPTIONS = [
    { key: 'all', text: 'All Countries' },
    { key: 'IN', text: 'India' },
    { key: 'US', text: 'United States' },
];
// Compact labels for the filter bar (OFFICE_OPTIONS labels are longer, suited for forms).
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
var StatusBadge = function (_a) {
    var status = _a.status;
    var colors = STATUS_BADGE_COLORS[status] || { bg: '#ebebeb', text: '#333' };
    return (React.createElement("span", { className: styles.statusBadge, style: { background: colors.bg, color: colors.text } }, status));
};
var AssetTable = function (_a) {
    var assets = _a.assets, loading = _a.loading, onAddNew = _a.onAddNew, onView = _a.onView, onEdit = _a.onEdit, onRefresh = _a.onRefresh;
    var _b = useState(''), search = _b[0], setSearch = _b[1];
    var _c = useState(''), filterStatus = _c[0], setFilterStatus = _c[1];
    var _d = useState(''), filterType = _d[0], setFilterType = _d[1];
    var _f = useState(''), filterDept = _f[0], setFilterDept = _f[1];
    var _g = useState('all'), countryFilter = _g[0], setCountryFilter = _g[1];
    var _h = useState('all'), officeFilter = _h[0], setOfficeFilter = _h[1];
    var _j = useState('Title'), sortCol = _j[0], setSortCol = _j[1];
    var _k = useState(true), sortAsc = _k[0], setSortAsc = _k[1];
    var deptOptions = useMemo(function () {
        var depts = Array.from(new Set(assets.map(function (a) { return a.Department; }).filter(Boolean))).sort();
        return __spreadArray([{ key: '', text: 'All Departments' }], depts.map(function (d) { return ({ key: d, text: d }); }), true);
    }, [assets]);
    var filtered = useMemo(function () {
        var q = search.toLowerCase();
        return assets
            .filter(function (a) {
            var _a, _b, _c, _d, _f, _g;
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
            if (q) {
                return (((_a = a.Title) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(q)) ||
                    ((_b = a.SerialNumber) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(q)) ||
                    ((_c = a.Model) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(q)) ||
                    ((_d = a.Vendor) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(q)) ||
                    ((_f = a.AssignedTo) === null || _f === void 0 ? void 0 : _f.toLowerCase().includes(q)) ||
                    ((_g = a.Department) === null || _g === void 0 ? void 0 : _g.toLowerCase().includes(q)));
            }
            return true;
        })
            .sort(function (a, b) {
            var av = a[sortCol] || '';
            var bv = b[sortCol] || '';
            return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
        });
    }, [assets, search, filterStatus, filterType, filterDept, countryFilter, officeFilter, sortCol, sortAsc]);
    var hasActiveFilters = !!(search || filterStatus || filterType || filterDept || countryFilter !== 'all');
    var clearAllFilters = function () {
        setSearch('');
        setFilterStatus('');
        setFilterType('');
        setFilterDept('');
        setCountryFilter('all');
        setOfficeFilter('all');
    };
    var exportCSV = function () {
        var headers = ['Asset ID', 'Serial Number', 'Model', 'Vendor', 'Type', 'Status', 'Assigned To', 'Department', 'Location', 'Purchase Date', 'Warranty Expiry', 'Cost (INR)', 'Remarks'];
        var rows = filtered.map(function (a) { return [
            a.Title, a.SerialNumber, a.Model, a.Vendor,
            ASSET_TYPE_LABELS[a.AssetType] || a.AssetType,
            a.Status, a.AssignedTo, a.Department, a.AssetLocation,
            AssetIdGenerator.formatDate(a.PurchaseDate),
            AssetIdGenerator.formatDate(a.WarrantyExpiry),
            a.Cost, a.Remarks,
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
        makeCol('AssetType', 'Type', 60, 80, function (a) { return (React.createElement("span", { title: ASSET_TYPE_LABELS[a.AssetType] }, a.AssetType)); }),
        makeCol('Model', 'Model', 120, 200),
        makeCol('SerialNumber', 'Serial No.', 100, 150),
        makeCol('Vendor', 'Vendor', 80, 130),
        makeCol('Status', 'Status', 90, 120, function (a) { return React.createElement(StatusBadge, { status: a.Status }); }),
        makeCol('AssignedTo', 'Assigned To', 100, 160),
        makeCol('Department', 'Department', 90, 140),
        makeCol('AssetLocation', 'Location', 80, 120),
        makeCol('WarrantyExpiry', 'Warranty Exp.', 90, 120, function (a) {
            var days = AssetIdGenerator.daysUntilWarrantyExpiry(a.WarrantyExpiry);
            var color = days < 0 ? '#a4262c' : days <= 30 ? '#ca5010' : days <= 90 ? '#8a3b00' : 'inherit';
            return React.createElement("span", { style: { color: color } }, AssetIdGenerator.formatDate(a.WarrantyExpiry));
        }),
        {
            key: 'actions', name: '', minWidth: 64, maxWidth: 72,
            onRender: function (a) { return (React.createElement("div", { className: styles.rowActions },
                React.createElement(IconButton, { iconProps: { iconName: 'View' }, title: "View details", ariaLabel: "View", onClick: function () { return onView(a); }, styles: { root: { width: 28, height: 28 }, icon: { fontSize: 14 } } }),
                React.createElement(IconButton, { iconProps: { iconName: 'Edit' }, title: "Edit asset", ariaLabel: "Edit", onClick: function () { return onEdit(a); }, styles: { root: { width: 28, height: 28 }, icon: { fontSize: 14 } } }))); },
        },
    ];
    var commandItems = [
        { key: 'add', text: 'Add Asset', iconProps: { iconName: 'Add' }, onClick: onAddNew },
        { key: 'refresh', text: 'Refresh', iconProps: { iconName: 'Refresh' }, onClick: onRefresh },
        { key: 'export', text: 'Export CSV', iconProps: { iconName: 'Download' }, onClick: exportCSV },
    ];
    return (React.createElement("div", { className: styles.root },
        React.createElement(CommandBar, { items: commandItems }),
        React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 12 }, className: styles.filters, wrap: true },
            React.createElement(SearchBox, { placeholder: "Search assets, serial, model, user\u2026", value: search, onChange: function (_e, v) { return setSearch(v || ''); }, className: styles.searchBox }),
            React.createElement(Dropdown, { options: STATUS_OPTIONS, selectedKey: filterStatus, onChange: function (_e, o) { return setFilterStatus((o === null || o === void 0 ? void 0 : o.key) || ''); }, className: styles.filterDrop, placeholder: "Filter by Status" }),
            React.createElement(Dropdown, { options: TYPE_OPTIONS, selectedKey: filterType, onChange: function (_e, o) { return setFilterType((o === null || o === void 0 ? void 0 : o.key) || ''); }, className: styles.filterDrop, placeholder: "Filter by Type" }),
            React.createElement(Dropdown, { options: deptOptions, selectedKey: filterDept, onChange: function (_e, o) { return setFilterDept((o === null || o === void 0 ? void 0 : o.key) || ''); }, className: styles.filterDrop, placeholder: "Filter by Department" }),
            React.createElement(Dropdown, { options: COUNTRY_FILTER_OPTIONS, selectedKey: countryFilter, onChange: function (_e, o) {
                    var country = (o === null || o === void 0 ? void 0 : o.key) || 'all';
                    setCountryFilter(country);
                    setOfficeFilter('all');
                }, className: styles.filterDrop, placeholder: "Filter by Country" }),
            countryFilter !== 'all' && (React.createElement(Dropdown, { options: getOfficeFilterOptions(countryFilter), selectedKey: officeFilter, onChange: function (_e, o) { return setOfficeFilter((o === null || o === void 0 ? void 0 : o.key) || 'all'); }, className: styles.filterDrop, placeholder: "Filter by Site / Office" })),
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
                : 'Try adjusting your search or filters.'))) : (React.createElement(DetailsList, { items: filtered, columns: columns, layoutMode: DetailsListLayoutMode.justified, selectionMode: SelectionMode.none, compact: true, className: "".concat(styles.list, " ").concat(styles.fadeIn) }))));
};
export default AssetTable;
//# sourceMappingURL=AssetTable.js.map