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
import { useMemo } from 'react';
import { Stack, Icon, PrimaryButton } from '@fluentui/react';
import { ASSET_TYPE_LABELS, STATUS_BADGE_COLORS } from '../models/IAsset';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import styles from './Dashboard.module.scss';
// ── Helpers ───────────────────────────────────────────────────────────────────
function todayStart() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
/** Returns days from today (start-of-day) to the given date. Negative = past. -Infinity = invalid/missing. */
function daysUntil(dateValue) {
    if (!dateValue)
        return -Infinity;
    var d = new Date(dateValue);
    if (isNaN(d.getTime()))
        return -Infinity;
    d.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - todayStart().getTime()) / 86400000);
}
/** Normalises status variants to canonical stored names. */
function normalizeStatus(status) {
    if (status === 'In Stock')
        return 'Stock';
    if (status === 'In Repair')
        return 'Repair';
    return status;
}
/** Groups items by a string key and returns a count map. */
function groupByCount(items, getter) {
    var out = {};
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        var key = getter(item) || 'Unknown';
        out[key] = (out[key] || 0) + 1;
    }
    return out;
}
var COUNTRY_LABELS = { IN: 'India', US: 'United States' };
// Standard statuses shown in breakdown even when count is 0 (lifecycle visualisation)
var STANDARD_STATUSES = [
    'Procured', 'Stock', 'Active', 'Repair', 'Gifted', 'Lost', 'Stolen', 'Scrapped', 'Disposed',
];
// ── Dashboard ─────────────────────────────────────────────────────────────────
var Dashboard = function (_a) {
    var assets = _a.assets, onViewAll = _a.onViewAll, onViewAsset = _a.onViewAsset;
    // ── KPI counters ────────────────────────────────────────────────────────────
    var kpi = useMemo(function () {
        var _a, _b;
        var active = 0, inStock = 0, inRepair = 0, procured = 0;
        var tempAssigned = 0, gifted = 0, transferred = 0, scrapped = 0;
        var warrantySoon = 0, endOfServiceSoon = 0;
        for (var _i = 0, assets_1 = assets; _i < assets_1.length; _i++) {
            var a = assets_1[_i];
            var s = normalizeStatus(a.Status || '');
            if (s === 'Active')
                active++;
            if (s === 'Stock')
                inStock++;
            if (s === 'Repair')
                inRepair++;
            if (s === 'Procured')
                procured++;
            if (s === 'Temp Assigned')
                tempAssigned++;
            if (s === 'Gifted')
                gifted++;
            if (s === 'Transferred')
                transferred++;
            if (s === 'Scrapped')
                scrapped++;
            var wDays = daysUntil(a.WarrantyExpiry);
            if (wDays >= 0 && wDays <= 30)
                warrantySoon++;
            // End of Service — field may not exist in current schema; handled defensively.
            // When OEMEndOfServiceDate / OemEndOfServiceDate / EndOfServiceDate is added to
            // the IT_Assets list and IAsset model, this count will populate automatically.
            var rec = a;
            var eosRaw = ((_b = (_a = rec.OEMEndOfServiceDate) !== null && _a !== void 0 ? _a : rec.OemEndOfServiceDate) !== null && _b !== void 0 ? _b : rec.EndOfServiceDate);
            var eosDays = daysUntil(eosRaw);
            if (eosDays >= 0 && eosDays <= 90)
                endOfServiceSoon++;
        }
        return { active: active, inStock: inStock, inRepair: inRepair, procured: procured, tempAssigned: tempAssigned, gifted: gifted, transferred: transferred, scrapped: scrapped, warrantySoon: warrantySoon, endOfServiceSoon: endOfServiceSoon };
    }, [assets]);
    // ── Asset type distribution ─────────────────────────────────────────────────
    var typeRows = useMemo(function () {
        var counts = groupByCount(assets, function (a) { return a.AssetType || 'OTH'; });
        return Object.entries(counts).sort(function (x, y) { return y[1] - x[1]; });
    }, [assets]);
    var maxTypeCount = typeRows.length > 0 ? typeRows[0][1] : 1;
    // ── Status breakdown ────────────────────────────────────────────────────────
    var statusCounts = useMemo(function () {
        var counts = {};
        // Pre-seed standard statuses at 0 to preserve lifecycle order
        for (var _i = 0, STANDARD_STATUSES_1 = STANDARD_STATUSES; _i < STANDARD_STATUSES_1.length; _i++) {
            var s = STANDARD_STATUSES_1[_i];
            counts[s] = 0;
        }
        for (var _a = 0, assets_2 = assets; _a < assets_2.length; _a++) {
            var a = assets_2[_a];
            var s = a.Status || 'Unknown';
            counts[s] = (counts[s] || 0) + 1;
        }
        return counts;
    }, [assets]);
    // ── Active assets by department — top 5 ─────────────────────────────────────
    var deptRows = useMemo(function () {
        var activeAssets = assets.filter(function (a) { return normalizeStatus(a.Status || '') === 'Active'; });
        var counts = groupByCount(activeAssets, function (a) { var _a; return ((_a = a.Department) === null || _a === void 0 ? void 0 : _a.trim()) || 'Unassigned Department'; });
        return Object.entries(counts).sort(function (x, y) { return y[1] - x[1]; }).slice(0, 5);
    }, [assets]);
    // ── Country split ────────────────────────────────────────────────────────────
    var countryRows = useMemo(function () {
        var counts = groupByCount(assets, function (a) { return COUNTRY_LABELS[a.Country || ''] || a.Country || 'Unknown'; });
        return Object.entries(counts).sort(function (x, y) { return y[1] - x[1]; });
    }, [assets]);
    // ── Warranty risk buckets ────────────────────────────────────────────────────
    var warrantyRisk = useMemo(function () {
        var b = { '0–30 days': 0, '31–90 days': 0, '90+ days': 0, 'Expired': 0 };
        for (var _i = 0, assets_3 = assets; _i < assets_3.length; _i++) {
            var a = assets_3[_i];
            if (!a.WarrantyExpiry)
                continue;
            var days = daysUntil(a.WarrantyExpiry);
            if (days < 0)
                b['Expired']++;
            else if (days <= 30)
                b['0–30 days']++;
            else if (days <= 90)
                b['31–90 days']++;
            else
                b['90+ days']++;
        }
        return b;
    }, [assets]);
    var maxRiskCount = Math.max.apply(Math, __spreadArray(__spreadArray([], Object.values(warrantyRisk), false), [1], false));
    // ── Warranty expiring table (next 90 days) ───────────────────────────────────
    var expiringAssets = useMemo(function () {
        return assets
            .filter(function (a) { var d = daysUntil(a.WarrantyExpiry); return d >= 0 && d <= 90; })
            .sort(function (a, b) { return daysUntil(a.WarrantyExpiry) - daysUntil(b.WarrantyExpiry); });
    }, [assets]);
    // ── KPI card definitions ─────────────────────────────────────────────────────
    var KPI_CARDS = [
        { label: 'Total Assets', value: assets.length, color: '#2563eb', icon: 'PC1' },
        { label: 'Active', value: kpi.active, color: '#16a34a', icon: 'CheckMark' },
        { label: 'In Stock', value: kpi.inStock, color: '#0284c7', icon: 'Inbox' },
        { label: 'In Repair', value: kpi.inRepair, color: '#ea580c', icon: 'Wrench' },
        { label: 'Procured', value: kpi.procured, color: '#7c3aed', icon: 'ShoppingCart' },
        { label: 'Temp Assigned', value: kpi.tempAssigned, color: '#0891b2', icon: 'Contact' },
        { label: 'Gifted', value: kpi.gifted, color: '#059669', icon: 'Heart' },
        { label: 'Transferred', value: kpi.transferred, color: '#6366f1', icon: 'Forward' },
        { label: 'Scrapped', value: kpi.scrapped, color: '#78716c', icon: 'Delete' },
        { label: 'Warranty Soon', value: kpi.warrantySoon, color: '#dc2626', icon: 'Warning' },
        { label: 'End of Svc Soon', value: kpi.endOfServiceSoon, color: '#b45309', icon: 'Clock' },
    ];
    // ── Render ────────────────────────────────────────────────────────────────────
    return (React.createElement("div", { className: styles.root },
        React.createElement("div", { className: "".concat(styles.kpiRow, " ").concat(styles.fadeIn) }, KPI_CARDS.map(function (c) { return (React.createElement("div", { key: c.label, className: styles.kpiCard, style: { borderTop: "4px solid ".concat(c.color) } },
            React.createElement("div", { className: styles.kpiIconWrap, style: { background: "".concat(c.color, "18") } },
                React.createElement(Icon, { iconName: c.icon, style: { color: c.color, fontSize: 18 } })),
            React.createElement("div", { className: styles.kpiValue }, c.value),
            React.createElement("div", { className: styles.kpiLabel }, c.label))); })),
        React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 18 }, className: "".concat(styles.panels, " ").concat(styles.fadeIn) },
            React.createElement(Stack.Item, { grow: 1, className: styles.panel },
                React.createElement("div", { className: styles.panelHeader },
                    React.createElement(Icon, { iconName: "Chart" }),
                    " Asset Type Distribution"),
                typeRows.length === 0 ? (React.createElement("span", { className: styles.emptyMsg }, "No assets yet")) : (typeRows.map(function (_a) {
                    var type = _a[0], count = _a[1];
                    var pct = Math.round((count / maxTypeCount) * 100);
                    var fullLabel = "".concat(type, " \u2013 ").concat(ASSET_TYPE_LABELS[type] || type);
                    return (React.createElement("div", { key: type, className: styles.barRow },
                        React.createElement("span", { className: styles.barLabel, title: fullLabel }, fullLabel),
                        React.createElement("div", { className: styles.barTrack },
                            React.createElement("div", { className: styles.barFill, style: { width: "".concat(pct, "%") } })),
                        React.createElement("span", { className: styles.barCount }, count)));
                }))),
            React.createElement(Stack.Item, { grow: 1, className: styles.panel },
                React.createElement("div", { className: styles.panelHeader },
                    React.createElement(Icon, { iconName: "Bullseye" }),
                    " Status Breakdown"),
                React.createElement("div", { className: styles.statusGrid }, Object.entries(statusCounts).map(function (_a) {
                    var status = _a[0], count = _a[1];
                    var colors = STATUS_BADGE_COLORS[status] || { bg: '#ebebeb', text: '#333' };
                    return (React.createElement("div", { key: status, className: styles.statusChip, style: { background: colors.bg, color: colors.text, opacity: count === 0 ? 0.45 : 1 } },
                        React.createElement("span", null, status),
                        React.createElement("span", { className: styles.statusCount }, count)));
                }))),
            React.createElement(Stack.Item, { grow: 1, className: styles.panel },
                React.createElement("div", { className: styles.panelHeader },
                    React.createElement(Icon, { iconName: "Org" }),
                    " Top Departments"),
                deptRows.length === 0 ? (React.createElement("span", { className: styles.emptyMsg }, "No active assets")) : (deptRows.map(function (_a) {
                    var dept = _a[0], count = _a[1];
                    return (React.createElement("div", { key: dept, className: styles.deptRow },
                        React.createElement(Icon, { iconName: "People", className: styles.deptIcon }),
                        React.createElement("span", { className: styles.deptName }, dept),
                        React.createElement("span", { className: styles.deptCount }, count)));
                })),
                React.createElement("div", { className: styles.panelCaption }, "Active assets only \u00B7 Top 5"))),
        React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 18 }, className: "".concat(styles.panels, " ").concat(styles.fadeIn) },
            React.createElement(Stack.Item, { grow: 1, className: styles.panel },
                React.createElement("div", { className: styles.panelHeader },
                    React.createElement(Icon, { iconName: "Globe" }),
                    " Country Split"),
                countryRows.length === 0 ? (React.createElement("span", { className: styles.emptyMsg }, "No assets yet")) : (countryRows.map(function (_a) {
                    var label = _a[0], count = _a[1];
                    var pct = assets.length > 0 ? Math.round((count / assets.length) * 100) : 0;
                    return (React.createElement("div", { key: label, className: styles.barRow },
                        React.createElement("span", { className: styles.barLabel }, label),
                        React.createElement("div", { className: styles.barTrack },
                            React.createElement("div", { className: styles.barFill, style: { width: "".concat(pct, "%") } })),
                        React.createElement("span", { className: styles.barCount }, count)));
                }))),
            React.createElement(Stack.Item, { grow: 2, className: styles.panel },
                React.createElement("div", { className: styles.panelHeader },
                    React.createElement(Icon, { iconName: "Shield" }),
                    " Warranty Risk"),
                Object.entries(warrantyRisk).map(function (_a) {
                    var bucket = _a[0], count = _a[1];
                    var pct = Math.round((count / maxRiskCount) * 100);
                    var fillClass = bucket === '0–30 days' || bucket === 'Expired'
                        ? styles.barFillDanger
                        : bucket === '31–90 days'
                            ? styles.barFillWarn
                            : styles.barFill;
                    return (React.createElement("div", { key: bucket, className: styles.barRow },
                        React.createElement("span", { className: styles.barLabel }, bucket),
                        React.createElement("div", { className: styles.barTrack },
                            React.createElement("div", { className: fillClass, style: { width: count > 0 ? "".concat(pct, "%") : '0%' } })),
                        React.createElement("span", { className: styles.barCount }, count)));
                }),
                React.createElement("div", { className: styles.panelCaption }, "Based on WarrantyExpiry \u2014 assets with no date excluded"))),
        expiringAssets.length > 0 && (React.createElement("div", { className: styles.warrantyPanel },
            React.createElement("div", { className: styles.warrantyPanelHeader },
                React.createElement(Icon, { iconName: "Warning" }),
                "Warranty Expiring Within 90 Days",
                React.createElement("span", { style: { marginLeft: 4, background: '#ca5010', color: '#fff', borderRadius: 10, padding: '1px 8px', fontSize: 11 } }, expiringAssets.length)),
            React.createElement("table", { className: styles.warrantyTable },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null, "Asset ID"),
                        React.createElement("th", null, "Model"),
                        React.createElement("th", null, "Assigned To"),
                        React.createElement("th", null, "Department"),
                        React.createElement("th", null, "Expiry Date"),
                        React.createElement("th", null, "Days Left"))),
                React.createElement("tbody", null, expiringAssets.map(function (a) {
                    var days = daysUntil(a.WarrantyExpiry);
                    var dayColor = days <= 0 ? '#a4262c' : days <= 30 ? '#a4262c' : days <= 60 ? '#ca5010' : '#375623';
                    var dayBg = days <= 0 ? '#fde7e9' : days <= 30 ? '#fde7e9' : days <= 60 ? '#fdf6f0' : '#dff6dd';
                    return (React.createElement("tr", { key: a.Id, className: styles.warrantyRow, onClick: function () { return onViewAsset(a); } },
                        React.createElement("td", null,
                            React.createElement("span", { className: styles.assetLink }, a.Title)),
                        React.createElement("td", null, a.Model),
                        React.createElement("td", null, a.AssignedTo || '—'),
                        React.createElement("td", null, a.Department || '—'),
                        React.createElement("td", null, AssetIdGenerator.formatDate(a.WarrantyExpiry)),
                        React.createElement("td", null,
                            React.createElement("span", { className: styles.daysBadge, style: { color: dayColor, background: dayBg } }, days < 0 ? "".concat(Math.abs(days), "d ago") : "".concat(days, "d")))));
                }))))),
        React.createElement("div", { className: styles.footer },
            React.createElement(PrimaryButton, { iconProps: { iconName: 'List' }, onClick: onViewAll }, "View All Assets"))));
};
export default Dashboard;
//# sourceMappingURL=Dashboard.js.map