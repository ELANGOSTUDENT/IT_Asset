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
import { Spinner, SpinnerSize, MessageBar, MessageBarType, DefaultButton, PrimaryButton, IconButton, TextField, Dropdown, Dialog, DialogType, DialogFooter, Separator, } from '@fluentui/react';
import { ArrowSwapRegular, TagRegular, LaptopRegular, MoneyRegular, PersonRegular, NoteRegular, WrenchRegular, DocumentRegular, LeafThreeRegular, BoxRegular, AttachRegular, CalendarRegular, HistoryRegular, } from '@fluentui/react-icons';
import { ASSET_STATUS_TRANSITIONS, STATUS_BADGE_COLORS, STATUS_REQUIRES_NOTE, ASSET_TYPE_LABELS, } from '../models/IAsset';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import styles from './AssetDetail.module.scss';
// ── Small helpers ──────────────────────────────────────────────────────────────
var StatusBadge = function (_a) {
    var status = _a.status;
    var c = STATUS_BADGE_COLORS[status] || { bg: '#ebebeb', text: '#333' };
    return (React.createElement("span", { style: {
            background: c.bg, color: c.text,
            padding: '3px 12px', borderRadius: 12, fontWeight: 600, fontSize: 13,
        } }, status));
};
var F = function (_a) {
    var label = _a.label, value = _a.value, mono = _a.mono;
    return (React.createElement("div", { className: styles.field },
        React.createElement("span", { className: styles.fieldLabel }, label),
        React.createElement("span", { className: styles.fieldValue, style: mono ? { fontFamily: 'monospace', fontWeight: 700 } : {} }, value || '—')));
};
var Card = function (_a) {
    var title = _a.title, icon = _a.icon, children = _a.children;
    return (React.createElement("div", { className: styles.card },
        React.createElement("div", { className: styles.cardTitle },
            icon,
            " ",
            title),
        children));
};
// ── Main component ─────────────────────────────────────────────────────────────
var AssetDetail = function (_a) {
    var asset = _a.asset, assetService = _a.assetService, repairService = _a.repairService, assignmentService = _a.assignmentService, currentUser = _a.currentUser, onBack = _a.onBack, onEdit = _a.onEdit, onEditAssignment = _a.onEditAssignment, onStatusChange = _a.onStatusChange;
    var _b = useState([]), history = _b[0], setHistory = _b[1];
    var _c = useState([]), repairs = _c[0], setRepairs = _c[1];
    var _d = useState(null), assignment = _d[0], setAssignment = _d[1];
    var _f = useState(true), loadingHist = _f[0], setLoadingHist = _f[1];
    var _g = useState(true), loadingRepairs = _g[0], setLoadingRepairs = _g[1];
    var _h = useState(true), loadingAssign = _h[0], setLoadingAssign = _h[1];
    var _j = useState(false), showStatusDlg = _j[0], setShowStatusDlg = _j[1];
    var _k = useState(null), newStatus = _k[0], setNewStatus = _k[1];
    var _l = useState(''), statusNote = _l[0], setStatusNote = _l[1];
    var _m = useState(false), changing = _m[0], setChanging = _m[1];
    var _o = useState(''), noteErr = _o[0], setNoteErr = _o[1];
    var loadData = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, hist, reps, assign;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoadingHist(true);
                    setLoadingRepairs(true);
                    setLoadingAssign(true);
                    return [4 /*yield*/, Promise.allSettled([
                            assetService.getAssetHistory(asset.Title),
                            repairService.getRepairs(asset.Title),
                            assignmentService.getActiveAssignment(asset.Title),
                        ])];
                case 1:
                    _a = _b.sent(), hist = _a[0], reps = _a[1], assign = _a[2];
                    if (hist.status === 'fulfilled')
                        setHistory(hist.value);
                    if (reps.status === 'fulfilled')
                        setRepairs(reps.value);
                    if (assign.status === 'fulfilled')
                        setAssignment(assign.value);
                    setLoadingHist(false);
                    setLoadingRepairs(false);
                    setLoadingAssign(false);
                    return [2 /*return*/];
            }
        });
    }); }, [asset.Title, assetService, repairService, assignmentService]);
    useEffect(function () { loadData(); }, [loadData]);
    var validTransitions = ASSET_STATUS_TRANSITIONS[asset.Status] || [];
    var confirmStatusChange = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!newStatus)
                        return [2 /*return*/];
                    if (STATUS_REQUIRES_NOTE.includes(newStatus) && !statusNote.trim()) {
                        setNoteErr('A note is required for this status change.');
                        return [2 /*return*/];
                    }
                    setNoteErr('');
                    setChanging(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 4, 5]);
                    return [4 /*yield*/, onStatusChange(asset, newStatus, statusNote.trim() || "Status changed to ".concat(newStatus, " by ").concat(currentUser))];
                case 2:
                    _a.sent();
                    setShowStatusDlg(false);
                    setNewStatus(null);
                    setStatusNote('');
                    return [4 /*yield*/, loadData()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setChanging(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var daysLeft = AssetIdGenerator.daysUntilWarrantyExpiry(asset.WarrantyExpiry);
    var historyIcon = function (action) {
        switch (action) {
            case 'Created': return '＋';
            case 'StatusChanged': return '⇄';
            case 'Assigned': return '👤';
            case 'Unassigned': return '↩';
            default: return '✎';
        }
    };
    // ── Derived visibility flags ────────────────────────────────────────────────
    var showGifted = asset.Status === 'Gifted';
    var showTransfer = asset.Status === 'Transferred';
    var showScrap = asset.Status === 'Scrapped' || asset.Status === 'Disposed';
    var hasStockData = !!(asset.DateAddedToStock || asset.ConditionAtStockEntry || asset.StockRemarks);
    // ── Render ────────────────────────────────────────────────────────────────────
    return (React.createElement("div", { className: styles.root },
        React.createElement("div", { className: styles.header },
            React.createElement(IconButton, { iconProps: { iconName: 'Back' }, onClick: onBack }),
            React.createElement("div", { className: styles.headerCenter },
                React.createElement("span", { className: styles.assetId }, asset.Title),
                React.createElement(StatusBadge, { status: asset.Status })),
            React.createElement("div", { className: styles.headerActions },
                React.createElement(DefaultButton, { iconProps: { iconName: 'Edit' }, onClick: onEdit }, "Edit Asset"),
                validTransitions.length > 0 && (React.createElement(PrimaryButton, { iconProps: { iconName: 'Sync' }, onClick: function () { return setShowStatusDlg(true); } }, "Change Status")))),
        asset.WarrantyExpiry && daysLeft <= 90 && (React.createElement(MessageBar, { messageBarType: daysLeft < 0 ? MessageBarType.error : MessageBarType.warning }, daysLeft < 0
            ? "Warranty expired ".concat(Math.abs(daysLeft), " days ago.")
            : "Warranty expires in ".concat(daysLeft, " day").concat(daysLeft !== 1 ? 's' : '', " \u2014 consider renewal."))),
        React.createElement("div", { className: styles.body },
            React.createElement("div", { className: styles.details },
                React.createElement(Card, { title: "Classification", icon: React.createElement(TagRegular, null) },
                    React.createElement("div", { className: styles.fieldGrid },
                        React.createElement(F, { label: "Asset ID", value: asset.Title, mono: true }),
                        React.createElement(F, { label: "Asset Type", value: "".concat(asset.AssetType, " \u2013 ").concat(ASSET_TYPE_LABELS[asset.AssetType] || '') }),
                        React.createElement(F, { label: "Status", value: asset.Status }),
                        React.createElement(F, { label: "Country", value: asset.Country }),
                        React.createElement(F, { label: "Office", value: asset.OfficeCode }))),
                React.createElement(Card, { title: "Hardware", icon: React.createElement(LaptopRegular, null) },
                    React.createElement("div", { className: styles.fieldGrid },
                        React.createElement(F, { label: "Serial Number", value: asset.SerialNumber, mono: true }),
                        React.createElement(F, { label: "Model", value: asset.Model }),
                        React.createElement(F, { label: "Vendor", value: asset.Vendor }))),
                React.createElement(Card, { title: "Procurement", icon: React.createElement(MoneyRegular, null) },
                    React.createElement("div", { className: styles.fieldGrid },
                        React.createElement(F, { label: "PO Number", value: asset.PONumber }),
                        React.createElement(F, { label: "Invoice No.", value: asset.InvoiceNumber }),
                        React.createElement(F, { label: "Cost", value: asset.Cost ? "\u20B9".concat(Number(asset.Cost).toLocaleString('en-IN')) : undefined }),
                        React.createElement(F, { label: "Purchase Date", value: AssetIdGenerator.formatDate(asset.PurchaseDate) }),
                        React.createElement(F, { label: "Warranty Exp.", value: asset.WarrantyExpiry
                                ? "".concat(AssetIdGenerator.formatDate(asset.WarrantyExpiry), " (").concat(daysLeft >= 0 ? "".concat(daysLeft, "d left") : 'EXPIRED', ")")
                                : undefined })),
                    asset.PurchaseBillUrl && (React.createElement("a", { href: asset.PurchaseBillUrl, target: "_blank", rel: "noreferrer", className: styles.attachLink },
                        React.createElement(AttachRegular, null),
                        " ",
                        asset.PurchaseBillName || 'View purchase bill'))),
                hasStockData && (React.createElement(Card, { title: "Stock / In-Store Details", icon: React.createElement(BoxRegular, null) },
                    React.createElement("div", { className: styles.fieldGrid },
                        React.createElement(F, { label: "Date Added to Stock", value: AssetIdGenerator.formatDate(asset.DateAddedToStock || '') }),
                        React.createElement(F, { label: "Condition", value: asset.ConditionAtStockEntry }),
                        React.createElement(F, { label: "Remarks", value: asset.StockRemarks })))),
                React.createElement(Card, { title: "Repair History", icon: React.createElement(WrenchRegular, null) }, loadingRepairs
                    ? React.createElement(Spinner, { size: SpinnerSize.small, label: "Loading\u2026" })
                    : repairs.length === 0
                        ? React.createElement("span", { style: { fontSize: 12, color: '#707070' } }, "No repair records.")
                        : repairs.map(function (r) { return (React.createElement("div", { key: r.Id, className: styles.repairEntry },
                            React.createElement("div", { className: styles.repairHeader },
                                React.createElement("span", { style: { fontWeight: 600 } }, AssetIdGenerator.formatDate(r.RepairDate)),
                                React.createElement("span", { style: { fontSize: 12, color: '#707070' } }, r.RepairVendor)),
                            React.createElement("span", { style: { fontSize: 12 } }, r.IssueDescription),
                            r.RepairCost > 0 && (React.createElement("span", { style: { fontSize: 12, color: '#707070', display: 'block' } },
                                "\u20B9",
                                r.RepairCost.toLocaleString('en-IN'),
                                r.RepairInvoiceNumber && " \u00B7 Inv: ".concat(r.RepairInvoiceNumber))),
                            r.AttachmentUrl && (React.createElement("a", { href: r.AttachmentUrl, target: "_blank", rel: "noreferrer", className: styles.attachLink },
                                React.createElement(AttachRegular, null),
                                " ",
                                r.AttachmentName || 'View attachment')),
                            React.createElement(Separator, null))); })),
                showGifted && (React.createElement(Card, { title: "Gifted Details", icon: React.createElement(DocumentRegular, null) },
                    React.createElement("div", { className: styles.fieldGrid },
                        React.createElement(F, { label: "Gifted To", value: asset.GiftedTo }),
                        React.createElement(F, { label: "Gifted Date", value: AssetIdGenerator.formatDate(asset.GiftedDate || '') }),
                        React.createElement(F, { label: "Authorised By", value: asset.GiftedAuthorisedBy }),
                        React.createElement(F, { label: "Remarks", value: asset.GiftedRemarks })),
                    asset.GiftedAttachmentUrl && (React.createElement("a", { href: asset.GiftedAttachmentUrl, target: "_blank", rel: "noreferrer", className: styles.attachLink },
                        React.createElement(AttachRegular, null),
                        " Authorisation letter")))),
                showTransfer && (React.createElement(Card, { title: "Transfer of Ownership", icon: React.createElement(ArrowSwapRegular, null) },
                    React.createElement("div", { className: styles.fieldGrid },
                        React.createElement(F, { label: "Transferred From", value: asset.TransferredFrom }),
                        React.createElement(F, { label: "Transferred To", value: asset.TransferredTo }),
                        React.createElement(F, { label: "Transfer Date", value: AssetIdGenerator.formatDate(asset.TransferDate || '') }),
                        React.createElement(F, { label: "Reason", value: asset.TransferReason })),
                    asset.TransferAttachmentUrl && (React.createElement("a", { href: asset.TransferAttachmentUrl, target: "_blank", rel: "noreferrer", className: styles.attachLink },
                        React.createElement(AttachRegular, null),
                        " Transfer letter")))),
                showScrap && (React.createElement(Card, { title: "Scrap / Disposal Details", icon: React.createElement(LeafThreeRegular, null) },
                    React.createElement("div", { className: styles.fieldGrid },
                        React.createElement(F, { label: "Scrap Date", value: AssetIdGenerator.formatDate(asset.ScrapDate || '') }),
                        React.createElement(F, { label: "Scrap Vendor", value: asset.ScrapVendor }),
                        React.createElement(F, { label: "Scrap Invoice", value: asset.ScrapInvoiceNumber }),
                        React.createElement(F, { label: "Scrap PO", value: asset.ScrapPONumber }),
                        React.createElement(F, { label: "Scrap Amount", value: asset.ScrapAmount ? "\u20B9".concat(Number(asset.ScrapAmount).toLocaleString('en-IN')) : undefined }),
                        React.createElement(F, { label: "E-Waste Cert. No.", value: asset.EWasteCertNumber })),
                    asset.ScrapAttachmentUrl && (React.createElement("a", { href: asset.ScrapAttachmentUrl, target: "_blank", rel: "noreferrer", className: styles.attachLink },
                        React.createElement(AttachRegular, null),
                        " E-Waste certificate")))),
                asset.Remarks && (React.createElement(Card, { title: "Remarks", icon: React.createElement(NoteRegular, null) },
                    React.createElement("p", { className: styles.remarks }, asset.Remarks)))),
            React.createElement("div", { className: styles.rightPanel },
                React.createElement("div", { className: styles.card },
                    React.createElement("div", { className: styles.cardTitle },
                        React.createElement(PersonRegular, null),
                        " Current Assignment"),
                    loadingAssign ? (React.createElement(Spinner, { size: SpinnerSize.small, label: "Loading\u2026" })) : assignment ? (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: styles.fieldGrid },
                            React.createElement(F, { label: "Assigned To", value: assignment.AssignedTo }),
                            React.createElement(F, { label: "Email", value: assignment.AssignedToEmail }),
                            React.createElement(F, { label: "Department", value: assignment.Department }),
                            React.createElement(F, { label: "Location", value: assignment.AssetLocation }),
                            React.createElement(F, { label: "Assigned On", value: AssetIdGenerator.formatDate(assignment.DateOfAssignment) })),
                        React.createElement(DefaultButton, { iconProps: { iconName: 'Edit' }, onClick: function () { return onEditAssignment(assignment); }, style: { marginTop: 10 } }, "Edit Assignment"))) : (React.createElement(React.Fragment, null,
                        React.createElement("span", { style: { fontSize: 12, color: '#707070', display: 'block', marginBottom: 8 } }, "Not currently assigned."),
                        React.createElement(DefaultButton, { iconProps: { iconName: 'Add' }, onClick: function () { return onEditAssignment(null); } }, "Assign Now")))),
                assignment && (React.createElement("div", { className: styles.card, style: { marginTop: 16 } },
                    React.createElement("div", { className: styles.cardTitle },
                        React.createElement(CalendarRegular, null),
                        " Maintenance Schedule"),
                    React.createElement("div", { className: styles.fieldGrid },
                        React.createElement(F, { label: "Last Maintenance", value: AssetIdGenerator.formatDate(assignment.LastMaintenanceDate || '') }),
                        React.createElement(F, { label: "Next Maintenance", value: AssetIdGenerator.formatDate(assignment.NextMaintenanceDate || '') })),
                    assignment.MaintenanceNotes && (React.createElement("p", { className: styles.remarks, style: { marginTop: 8 } }, assignment.MaintenanceNotes)))),
                React.createElement("div", { className: styles.card, style: { marginTop: 16 } },
                    React.createElement("div", { className: styles.cardTitle },
                        React.createElement(HistoryRegular, null),
                        " Change History"),
                    loadingHist ? (React.createElement(Spinner, { size: SpinnerSize.small, label: "Loading history\u2026" })) : history.length === 0 ? (React.createElement("span", { style: { fontSize: 12, color: '#707070' } }, "No history recorded yet.")) : (React.createElement("div", { className: styles.timeline }, history.map(function (h, i) {
                        var _a;
                        return (React.createElement("div", { key: (_a = h.Id) !== null && _a !== void 0 ? _a : i, className: styles.timelineItem },
                            React.createElement("div", { className: styles.timelineDot }, historyIcon(h.Action)),
                            React.createElement("div", { className: styles.timelineContent },
                                React.createElement("div", { className: styles.timelineAction }, h.Action === 'StatusChanged'
                                    ? React.createElement(React.Fragment, null,
                                        React.createElement("strong", null, h.PreviousStatus),
                                        ' → ',
                                        React.createElement("strong", null, h.NewStatus))
                                    : React.createElement("strong", null, h.Action)),
                                React.createElement("div", { className: styles.timelineMeta },
                                    h.ChangedBy,
                                    " \u00B7 ",
                                    AssetIdGenerator.formatDate(h.ChangedDate)),
                                h.HistoryNotes && (React.createElement("div", { className: styles.timelineNote }, h.HistoryNotes)))));
                    })))))),
        React.createElement(Dialog, { hidden: !showStatusDlg, onDismiss: function () { setShowStatusDlg(false); setNewStatus(null); setStatusNote(''); setNoteErr(''); }, dialogContentProps: {
                type: DialogType.normal,
                title: 'Change Asset Status',
            }, modalProps: { isBlocking: false }, styles: { main: { minWidth: 480 } } },
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 } },
                React.createElement("span", { style: { fontSize: 12, color: '#707070' } },
                    "Current status: ",
                    React.createElement("strong", null, asset.Status)),
                React.createElement(Dropdown, { label: "New Status *", selectedKey: newStatus || '', options: __spreadArray([
                        { key: '', text: 'Select next status…' }
                    ], validTransitions.map(function (s) { return ({ key: s, text: s }); }), true), onChange: function (_e, option) {
                        var val = option === null || option === void 0 ? void 0 : option.key;
                        setNewStatus(val ? val : null);
                        setNoteErr('');
                    } }),
                React.createElement(TextField, { label: "Notes".concat(newStatus && STATUS_REQUIRES_NOTE.includes(newStatus) ? ' *' : ''), errorMessage: noteErr, multiline: true, rows: 3, value: statusNote, onChange: function (_e, v) { return setStatusNote(v || ''); }, placeholder: "Reason for status change\u2026" }),
                newStatus && (React.createElement(MessageBar, { messageBarType: MessageBarType.info },
                    "Status will change: ",
                    React.createElement("strong", null, asset.Status),
                    " \u2192 ",
                    React.createElement("strong", null, newStatus)))),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: confirmStatusChange, disabled: !newStatus || changing }, changing ? 'Changing…' : 'Confirm'),
                React.createElement(DefaultButton, { onClick: function () { setShowStatusDlg(false); setNewStatus(null); setStatusNote(''); } }, "Cancel")))));
};
export default AssetDetail;
//# sourceMappingURL=AssetDetail.js.map