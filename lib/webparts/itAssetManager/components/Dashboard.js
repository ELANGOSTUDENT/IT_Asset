import * as React from 'react';
import { useState, useEffect } from 'react';
import { Stack, Spinner, SpinnerSize, Icon, PrimaryButton, Shimmer, } from '@fluentui/react';
import { ASSET_TYPE_LABELS, STATUS_BADGE_COLORS } from '../models/IAsset';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import styles from './Dashboard.module.scss';
var STAT_CARDS = [
    { key: 'Active', label: 'Active', icon: 'CheckMark', color: '#16a34a' },
    { key: 'Stock', label: 'In Stock', icon: 'Inbox', color: '#0284c7' },
    { key: 'Repair', label: 'In Repair', icon: 'Wrench', color: '#ea580c' },
    { key: 'Procured', label: 'Procured', icon: 'ShoppingCart', color: '#7c3aed' },
];
var Dashboard = function (_a) {
    var assets = _a.assets, assetService = _a.assetService, onViewAll = _a.onViewAll, onViewAsset = _a.onViewAsset;
    var _b = useState(null), stats = _b[0], setStats = _b[1];
    var _c = useState([]), expiring = _c[0], setExpiring = _c[1];
    var _d = useState(true), loadingStats = _d[0], setLoadingStats = _d[1];
    useEffect(function () {
        Promise.all([
            assetService.getDashboardStats(),
            assetService.getWarrantyExpiring(90),
        ])
            .then(function (_a) {
            var s = _a[0], e = _a[1];
            setStats(s);
            setExpiring(e);
        })
            .catch(function () { })
            .finally(function () { return setLoadingStats(false); });
    }, [assets]);
    var total = assets.length;
    var issues = ((stats === null || stats === void 0 ? void 0 : stats.byStatus['Lost']) || 0) + ((stats === null || stats === void 0 ? void 0 : stats.byStatus['Stolen']) || 0);
    return (React.createElement("div", { className: styles.root },
        React.createElement("div", { className: "".concat(styles.kpiRow, " ").concat(styles.fadeIn) },
            React.createElement("div", { className: styles.kpiCard, style: { borderTop: '4px solid #2563eb' } },
                React.createElement("div", { className: styles.kpiIconWrap, style: { background: 'rgba(37,99,235,.10)' } },
                    React.createElement(Icon, { iconName: "PC1", style: { color: '#2563eb', fontSize: 18 } })),
                React.createElement("div", { className: styles.kpiValue }, total),
                React.createElement("div", { className: styles.kpiLabel }, "Total Assets")),
            STAT_CARDS.map(function (c) { return (React.createElement("div", { key: c.key, className: styles.kpiCard, style: { borderTop: "4px solid ".concat(c.color) } },
                React.createElement("div", { className: styles.kpiIconWrap, style: { background: "".concat(c.color, "18") } },
                    React.createElement(Icon, { iconName: c.icon, style: { color: c.color, fontSize: 18 } })),
                React.createElement("div", { className: styles.kpiValue }, loadingStats ? React.createElement(Shimmer, { width: 40, styles: { root: { marginTop: 4 } } }) : ((stats === null || stats === void 0 ? void 0 : stats.byStatus[c.key]) || 0)),
                React.createElement("div", { className: styles.kpiLabel }, c.label))); }),
            React.createElement("div", { className: styles.kpiCard, style: { borderTop: '4px solid #dc2626' } },
                React.createElement("div", { className: styles.kpiIconWrap, style: { background: 'rgba(220,38,38,.10)' } },
                    React.createElement(Icon, { iconName: "Warning", style: { color: '#dc2626', fontSize: 18 } })),
                React.createElement("div", { className: styles.kpiValue }, loadingStats ? React.createElement(Shimmer, { width: 40, styles: { root: { marginTop: 4 } } }) : ((stats === null || stats === void 0 ? void 0 : stats.warrantyExpiringSoon) || 0)),
                React.createElement("div", { className: styles.kpiLabel }, "Warranty Soon")),
            issues > 0 && (React.createElement("div", { className: styles.kpiCard, style: { borderTop: '4px solid #a4262c' } },
                React.createElement("div", { className: styles.kpiIconWrap, style: { background: 'rgba(164,38,44,.10)' } },
                    React.createElement(Icon, { iconName: "AlertSolid", style: { color: '#a4262c', fontSize: 18 } })),
                React.createElement("div", { className: styles.kpiValue }, issues),
                React.createElement("div", { className: styles.kpiLabel }, "Lost / Stolen")))),
        React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 18 }, className: "".concat(styles.panels, " ").concat(styles.fadeIn) },
            React.createElement(Stack.Item, { grow: 1, className: styles.panel },
                React.createElement("div", { className: styles.panelHeader },
                    React.createElement(Icon, { iconName: "Chart" }),
                    " Asset Type Distribution"),
                loadingStats ? (React.createElement(Spinner, { size: SpinnerSize.small })) : (React.createElement("div", null, Object.entries((stats === null || stats === void 0 ? void 0 : stats.byType) || {}).sort(function (a, b) { return b[1] - a[1]; }).map(function (_a) {
                    var type = _a[0], count = _a[1];
                    var pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (React.createElement("div", { key: type, className: styles.barRow },
                        React.createElement("span", { className: styles.barLabel }, ASSET_TYPE_LABELS[type] || type),
                        React.createElement("div", { className: styles.barTrack },
                            React.createElement("div", { className: styles.barFill, style: { width: "".concat(pct, "%") } })),
                        React.createElement("span", { className: styles.barCount }, count)));
                })))),
            React.createElement(Stack.Item, { grow: 1, className: styles.panel },
                React.createElement("div", { className: styles.panelHeader },
                    React.createElement(Icon, { iconName: "Bullseye" }),
                    " Status Breakdown"),
                loadingStats ? (React.createElement(Spinner, { size: SpinnerSize.small })) : (React.createElement("div", { className: styles.statusGrid }, Object.entries((stats === null || stats === void 0 ? void 0 : stats.byStatus) || {}).map(function (_a) {
                    var status = _a[0], count = _a[1];
                    var colors = STATUS_BADGE_COLORS[status] || { bg: '#ebebeb', text: '#333' };
                    return (React.createElement("div", { key: status, className: styles.statusChip, style: { background: colors.bg, color: colors.text } },
                        React.createElement("span", null, status),
                        React.createElement("span", { className: styles.statusCount }, count)));
                })))),
            React.createElement(Stack.Item, { grow: 1, className: styles.panel },
                React.createElement("div", { className: styles.panelHeader },
                    React.createElement(Icon, { iconName: "Org" }),
                    " Top Departments"),
                loadingStats ? (React.createElement(Spinner, { size: SpinnerSize.small })) : (React.createElement("div", null, Object.entries((stats === null || stats === void 0 ? void 0 : stats.byDept) || {})
                    .sort(function (a, b) { return b[1] - a[1]; })
                    .slice(0, 8)
                    .map(function (_a) {
                    var dept = _a[0], count = _a[1];
                    return (React.createElement("div", { key: dept, className: styles.deptRow },
                        React.createElement(Icon, { iconName: "People", className: styles.deptIcon }),
                        React.createElement("span", { className: styles.deptName }, dept || '(Unassigned)'),
                        React.createElement("span", { className: styles.deptCount }, count)));
                }))))),
        expiring.length > 0 && (React.createElement("div", { className: styles.warrantyPanel },
            React.createElement("div", { className: styles.warrantyPanelHeader },
                React.createElement(Icon, { iconName: "Warning" }),
                "Warranty Expiring Within 90 Days",
                React.createElement("span", { style: { marginLeft: 4, background: '#ca5010', color: '#fff', borderRadius: 10, padding: '1px 8px', fontSize: 11 } }, expiring.length)),
            React.createElement("table", { className: styles.warrantyTable },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null, "Asset ID"),
                        React.createElement("th", null, "Model"),
                        React.createElement("th", null, "Assigned To"),
                        React.createElement("th", null, "Department"),
                        React.createElement("th", null, "Expiry Date"),
                        React.createElement("th", null, "Days Left"))),
                React.createElement("tbody", null, expiring.map(function (a) {
                    var days = AssetIdGenerator.daysUntilWarrantyExpiry(a.WarrantyExpiry);
                    var dayColor = days < 0 ? '#a4262c' : days <= 30 ? '#a4262c' : days <= 60 ? '#ca5010' : '#375623';
                    var dayBg = days < 0 ? '#fde7e9' : days <= 30 ? '#fde7e9' : days <= 60 ? '#fdf6f0' : '#dff6dd';
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