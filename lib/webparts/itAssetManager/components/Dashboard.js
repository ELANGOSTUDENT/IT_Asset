import * as React from 'react';
import { useMemo } from 'react';
import { Icon, PrimaryButton } from '@fluentui/react';
import DashboardBreakdowns from './DashboardBreakdowns';
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
        React.createElement(DashboardBreakdowns, { assets: assets, onViewAsset: onViewAsset }),
        React.createElement("div", { className: styles.footer },
            React.createElement(PrimaryButton, { iconProps: { iconName: 'List' }, onClick: onViewAll }, "View All Assets"))));
};
export default Dashboard;
//# sourceMappingURL=Dashboard.js.map