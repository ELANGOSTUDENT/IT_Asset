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
import { Spinner, SpinnerSize, MessageBar, MessageBarType, DefaultButton, PrimaryButton, IconButton, TextField, Dropdown, Dialog, DialogType, DialogFooter, Separator, } from '@fluentui/react';
import { TagRegular, LaptopRegular, MoneyRegular, PersonRegular, NoteRegular, WrenchRegular, DocumentRegular, LeafThreeRegular, AttachRegular, CalendarRegular, HistoryRegular, } from '@fluentui/react-icons';
import { ASSET_STATUS_TRANSITIONS, STATUS_BADGE_COLORS, STATUS_REQUIRES_NOTE, ASSET_TYPE_LABELS, } from '../models/IAsset';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import AssetAttachmentSection from './AssetAttachmentSection';
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
var GiftedDialog = function (_a) {
    var open = _a.open, draft = _a.draft, saving = _a.saving, onChange = _a.onChange, onConfirm = _a.onConfirm, onClose = _a.onClose, fileService = _a.fileService, assetId = _a.assetId;
    var _b = useState(null), attachFile = _b[0], setAttachFile = _b[1];
    var set = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, draft), (_a = {}, _a[k] = v, _a)));
    };
    useEffect(function () {
        if (!open)
            setAttachFile(null);
    }, [open]);
    var handleConfirm = function () { return __awaiter(void 0, void 0, void 0, function () {
        var finalDraft, r;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    finalDraft = __assign({}, draft);
                    if (!attachFile) return [3 /*break*/, 2];
                    return [4 /*yield*/, fileService.upload(assetId, 'gifted', attachFile)];
                case 1:
                    r = _a.sent();
                    finalDraft = __assign(__assign({}, finalDraft), { GiftAttachmentUrl: r.serverRelativeUrl });
                    _a.label = 2;
                case 2:
                    onConfirm(finalDraft);
                    return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(Dialog, { hidden: !open, onDismiss: onClose, dialogContentProps: { type: DialogType.normal, title: 'Gifted Details' }, modalProps: { isBlocking: false }, styles: { main: { minWidth: 480 } } },
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 } },
            React.createElement(TextField, { label: "Gifted To *", value: draft.GiftedTo || '', onChange: function (_e, v) { return set('GiftedTo', v || ''); } }),
            React.createElement("div", null,
                React.createElement("label", { style: { fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 } }, "Gifted Date"),
                React.createElement("input", { type: "date", value: draft.GiftedDate ? draft.GiftedDate.slice(0, 10) : '', onChange: function (e) { return set('GiftedDate', e.target.value ? new Date(e.target.value + 'T00:00:00').toISOString() : ''); }, style: { width: '100%', padding: '5px 8px', borderRadius: 4, fontSize: 14, border: '1px solid #d1d1d1', boxSizing: 'border-box' } })),
            React.createElement(TextField, { label: "Remarks", multiline: true, rows: 2, value: draft.GiftRemarks || '', onChange: function (_e, v) { return set('GiftRemarks', v || ''); } }),
            React.createElement("div", null,
                React.createElement("label", { style: { fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 } }, "Authorisation Letter"),
                draft.GiftAttachmentUrl && (React.createElement("a", { href: draft.GiftAttachmentUrl, target: "_blank", rel: "noreferrer", style: { display: 'block', marginBottom: 8, fontSize: 13 } }, "View existing")),
                React.createElement("input", { type: "file", onChange: function (e) { var _a, _b; return setAttachFile((_b = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null); } }))),
        React.createElement(DialogFooter, null,
            React.createElement(PrimaryButton, { onClick: handleConfirm, disabled: saving || !draft.GiftedTo }, saving ? 'Saving…' : 'Save'),
            React.createElement(DefaultButton, { onClick: onClose }, "Cancel"))));
};
var ScrapDialog = function (_a) {
    var _b;
    var open = _a.open, draft = _a.draft, saving = _a.saving, onChange = _a.onChange, onConfirm = _a.onConfirm, onClose = _a.onClose, fileService = _a.fileService, assetId = _a.assetId;
    var _c = useState(null), attachFile = _c[0], setAttachFile = _c[1];
    var set = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, draft), (_a = {}, _a[k] = v, _a)));
    };
    useEffect(function () {
        if (!open)
            setAttachFile(null);
    }, [open]);
    var handleConfirm = function () { return __awaiter(void 0, void 0, void 0, function () {
        var finalDraft, r;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    finalDraft = __assign({}, draft);
                    if (!attachFile) return [3 /*break*/, 2];
                    return [4 /*yield*/, fileService.upload(assetId, 'scrap', attachFile)];
                case 1:
                    r = _a.sent();
                    finalDraft = __assign(__assign({}, finalDraft), { ScrapAttachmentUrl: r.serverRelativeUrl });
                    _a.label = 2;
                case 2:
                    onConfirm(finalDraft);
                    return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(Dialog, { hidden: !open, onDismiss: onClose, dialogContentProps: { type: DialogType.normal, title: 'Scrap / Disposal Details' }, modalProps: { isBlocking: false }, styles: { main: { minWidth: 480 } } },
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 } },
            React.createElement("div", null,
                React.createElement("label", { style: { fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 } }, "Scrap Date"),
                React.createElement("input", { type: "date", value: draft.ScrapDate ? draft.ScrapDate.slice(0, 10) : '', onChange: function (e) { return set('ScrapDate', e.target.value ? new Date(e.target.value + 'T00:00:00').toISOString() : ''); }, style: { width: '100%', padding: '5px 8px', borderRadius: 4, fontSize: 14, border: '1px solid #d1d1d1', boxSizing: 'border-box' } })),
            React.createElement(TextField, { label: "Scrap Vendor", value: draft.ScrapVendor || '', onChange: function (_e, v) { return set('ScrapVendor', v || ''); } }),
            React.createElement(TextField, { label: "Scrap Amount (INR)", type: "number", prefix: "\u20B9", value: String((_b = draft.ScrapAmount) !== null && _b !== void 0 ? _b : 0), onChange: function (_e, v) { return set('ScrapAmount', parseFloat(v || '0')); } }),
            React.createElement(TextField, { label: "Remarks", multiline: true, rows: 2, value: draft.ScrapRemarks || '', onChange: function (_e, v) { return set('ScrapRemarks', v || ''); } }),
            React.createElement("div", null,
                React.createElement("label", { style: { fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 } }, "Certificate / Document"),
                draft.ScrapAttachmentUrl && (React.createElement("a", { href: draft.ScrapAttachmentUrl, target: "_blank", rel: "noreferrer", style: { display: 'block', marginBottom: 8, fontSize: 13 } }, "View existing")),
                React.createElement("input", { type: "file", onChange: function (e) { var _a, _b; return setAttachFile((_b = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null); } }))),
        React.createElement(DialogFooter, null,
            React.createElement(PrimaryButton, { onClick: handleConfirm, disabled: saving }, saving ? 'Saving…' : 'Save'),
            React.createElement(DefaultButton, { onClick: onClose }, "Cancel"))));
};
// ── Main component ─────────────────────────────────────────────────────────────
var AssetDetail = function (_a) {
    var asset = _a.asset, assetService = _a.assetService, repairService = _a.repairService, assignmentService = _a.assignmentService, giftedService = _a.giftedService, scrapService = _a.scrapService, fileService = _a.fileService, currentUser = _a.currentUser, onBack = _a.onBack, onEdit = _a.onEdit, onEditAssignment = _a.onEditAssignment, onStatusChange = _a.onStatusChange;
    var _b = useState([]), history = _b[0], setHistory = _b[1];
    var _c = useState([]), repairs = _c[0], setRepairs = _c[1];
    var _d = useState(null), assignment = _d[0], setAssignment = _d[1];
    var _f = useState(null), gifted = _f[0], setGifted = _f[1];
    var _g = useState(null), scrap = _g[0], setScrap = _g[1];
    var _h = useState(true), loadingHist = _h[0], setLoadingHist = _h[1];
    var _j = useState(true), loadingRepairs = _j[0], setLoadingRepairs = _j[1];
    var _k = useState(true), loadingAssign = _k[0], setLoadingAssign = _k[1];
    var _l = useState(false), loadingGifted = _l[0], setLoadingGifted = _l[1];
    var _m = useState(false), loadingScrap = _m[0], setLoadingScrap = _m[1];
    var _o = useState(false), showStatusDlg = _o[0], setShowStatusDlg = _o[1];
    var _p = useState(null), newStatus = _p[0], setNewStatus = _p[1];
    var _q = useState(''), statusNote = _q[0], setStatusNote = _q[1];
    var _r = useState(false), changing = _r[0], setChanging = _r[1];
    var _s = useState(''), noteErr = _s[0], setNoteErr = _s[1];
    // Gifted / scrap edit dialogs
    var _t = useState(false), showGiftedDlg = _t[0], setShowGiftedDlg = _t[1];
    var _u = useState({}), giftedDraft = _u[0], setGiftedDraft = _u[1];
    var _v = useState(false), savingGifted = _v[0], setSavingGifted = _v[1];
    var _w = useState(false), showScrapDlg = _w[0], setShowScrapDlg = _w[1];
    var _x = useState({}), scrapDraft = _x[0], setScrapDraft = _x[1];
    var _y = useState(false), savingScrap = _y[0], setSavingScrap = _y[1];
    var showGifted = asset.Status === 'Gifted';
    var showScrap = asset.Status === 'Scrapped' || asset.Status === 'Disposed';
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
    var loadGifted = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var g;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!showGifted)
                        return [2 /*return*/];
                    setLoadingGifted(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, giftedService.getGiftedByAsset(asset.Title)];
                case 2:
                    g = _a.sent();
                    setGifted(g);
                    if (g)
                        setGiftedDraft(__assign({}, g));
                    return [3 /*break*/, 4];
                case 3:
                    setLoadingGifted(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [asset.Title, giftedService, showGifted]);
    var loadScrap = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var s;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!showScrap)
                        return [2 /*return*/];
                    setLoadingScrap(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, scrapService.getScrapByAsset(asset.Title)];
                case 2:
                    s = _a.sent();
                    setScrap(s);
                    if (s)
                        setScrapDraft(__assign({}, s));
                    return [3 /*break*/, 4];
                case 3:
                    setLoadingScrap(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [asset.Title, scrapService, showScrap]);
    useEffect(function () { loadData(); }, [loadData]);
    useEffect(function () { loadGifted(); }, [loadGifted]);
    useEffect(function () { loadScrap(); }, [loadScrap]);
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
    var handleSaveGifted = function (finalDraft) { return __awaiter(void 0, void 0, void 0, function () {
        var created;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!finalDraft.GiftedTo)
                        return [2 /*return*/];
                    setSavingGifted(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 6, 7]);
                    if (!(gifted === null || gifted === void 0 ? void 0 : gifted.Id)) return [3 /*break*/, 3];
                    return [4 /*yield*/, giftedService.updateGifted(gifted.Id, finalDraft)];
                case 2:
                    _a.sent();
                    setGifted(__assign(__assign({}, gifted), finalDraft));
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, giftedService.addGifted({
                        Title: asset.Title,
                        AssetItemId: asset.Id,
                        GiftedTo: finalDraft.GiftedTo,
                        GiftedDate: finalDraft.GiftedDate,
                        GiftAttachmentUrl: finalDraft.GiftAttachmentUrl,
                        GiftRemarks: finalDraft.GiftRemarks,
                    })];
                case 4:
                    created = _a.sent();
                    setGifted(created);
                    _a.label = 5;
                case 5:
                    setShowGiftedDlg(false);
                    return [3 /*break*/, 7];
                case 6:
                    setSavingGifted(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveScrap = function (finalDraft) { return __awaiter(void 0, void 0, void 0, function () {
        var created;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSavingScrap(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 6, 7]);
                    if (!(scrap === null || scrap === void 0 ? void 0 : scrap.Id)) return [3 /*break*/, 3];
                    return [4 /*yield*/, scrapService.updateScrap(scrap.Id, finalDraft)];
                case 2:
                    _a.sent();
                    setScrap(__assign(__assign({}, scrap), finalDraft));
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, scrapService.addScrap({
                        Title: asset.Title,
                        AssetItemId: asset.Id,
                        ScrapDate: finalDraft.ScrapDate,
                        ScrapVendor: finalDraft.ScrapVendor,
                        ScrapAmount: finalDraft.ScrapAmount,
                        ScrapAttachmentUrl: finalDraft.ScrapAttachmentUrl,
                        ScrapRemarks: finalDraft.ScrapRemarks,
                    })];
                case 4:
                    created = _a.sent();
                    setScrap(created);
                    _a.label = 5;
                case 5:
                    setShowScrapDlg(false);
                    return [3 /*break*/, 7];
                case 6:
                    setSavingScrap(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var daysLeft = AssetIdGenerator.daysUntilWarrantyExpiry(asset.WarrantyExpiry);
    var historyIcon = function (h) {
        if (h.PreviousStatus && h.NewStatus)
            return '⇄';
        if (h.NewStatus && !h.PreviousStatus)
            return '＋';
        return '✎';
    };
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
                        " View purchase bill"))),
                React.createElement(Card, { title: "Repair History", icon: React.createElement(WrenchRegular, null) }, loadingRepairs
                    ? React.createElement(Spinner, { size: SpinnerSize.small, label: "Loading\u2026" })
                    : repairs.length === 0
                        ? React.createElement("span", { style: { fontSize: 12, color: '#707070' } }, "No repair records.")
                        : repairs.map(function (r) { return (React.createElement("div", { key: r.Id, className: styles.repairEntry },
                            React.createElement("div", { className: styles.repairHeader },
                                React.createElement("span", { style: { fontWeight: 600 } }, AssetIdGenerator.formatDate(r.RepairDate)),
                                React.createElement("span", { style: { fontSize: 12, color: '#707070' } }, r.RepairVendor)),
                            React.createElement("span", { style: { fontSize: 12 } }, r.IssueDescription),
                            r.Resolution && (React.createElement("span", { style: { fontSize: 12, color: '#107c10', display: 'block' } },
                                "Resolution: ",
                                r.Resolution)),
                            r.RepairCost > 0 && (React.createElement("span", { style: { fontSize: 12, color: '#707070', display: 'block' } },
                                "\u20B9",
                                r.RepairCost.toLocaleString('en-IN'))),
                            r.AttachmentUrl && (React.createElement("a", { href: r.AttachmentUrl, target: "_blank", rel: "noreferrer", className: styles.attachLink },
                                React.createElement(AttachRegular, null),
                                " View attachment")),
                            React.createElement(Separator, null))); })),
                showGifted && (React.createElement(Card, { title: "Gifted Details", icon: React.createElement(DocumentRegular, null) }, loadingGifted ? (React.createElement(Spinner, { size: SpinnerSize.small, label: "Loading\u2026" })) : gifted ? (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: styles.fieldGrid },
                        React.createElement(F, { label: "Gifted To", value: gifted.GiftedTo }),
                        React.createElement(F, { label: "Gifted Date", value: AssetIdGenerator.formatDate(gifted.GiftedDate || '') }),
                        React.createElement(F, { label: "Remarks", value: gifted.GiftRemarks })),
                    gifted.GiftAttachmentUrl && (React.createElement("a", { href: gifted.GiftAttachmentUrl, target: "_blank", rel: "noreferrer", className: styles.attachLink },
                        React.createElement(AttachRegular, null),
                        " Authorisation letter")),
                    React.createElement(DefaultButton, { iconProps: { iconName: 'Edit' }, onClick: function () { setGiftedDraft(__assign({}, gifted)); setShowGiftedDlg(true); }, style: { marginTop: 8 } }, "Edit Gifted Details"))) : (React.createElement(DefaultButton, { iconProps: { iconName: 'Add' }, onClick: function () { setGiftedDraft({ Title: asset.Title, AssetItemId: asset.Id }); setShowGiftedDlg(true); } }, "Add Gifted Details")))),
                showScrap && (React.createElement(Card, { title: "Scrap / Disposal Details", icon: React.createElement(LeafThreeRegular, null) }, loadingScrap ? (React.createElement(Spinner, { size: SpinnerSize.small, label: "Loading\u2026" })) : scrap ? (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: styles.fieldGrid },
                        React.createElement(F, { label: "Scrap Date", value: AssetIdGenerator.formatDate(scrap.ScrapDate || '') }),
                        React.createElement(F, { label: "Scrap Vendor", value: scrap.ScrapVendor }),
                        React.createElement(F, { label: "Scrap Amount", value: scrap.ScrapAmount ? "\u20B9".concat(Number(scrap.ScrapAmount).toLocaleString('en-IN')) : undefined }),
                        React.createElement(F, { label: "Remarks", value: scrap.ScrapRemarks })),
                    scrap.ScrapAttachmentUrl && (React.createElement("a", { href: scrap.ScrapAttachmentUrl, target: "_blank", rel: "noreferrer", className: styles.attachLink },
                        React.createElement(AttachRegular, null),
                        " Certificate / Document")),
                    React.createElement(DefaultButton, { iconProps: { iconName: 'Edit' }, onClick: function () { setScrapDraft(__assign({}, scrap)); setShowScrapDlg(true); }, style: { marginTop: 8 } }, "Edit Scrap Details"))) : (React.createElement(DefaultButton, { iconProps: { iconName: 'Add' }, onClick: function () { setScrapDraft({ Title: asset.Title, AssetItemId: asset.Id }); setShowScrapDlg(true); } }, "Add Scrap Details")))),
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
                    assignment.Remarks && (React.createElement("p", { className: styles.remarks, style: { marginTop: 8 } }, assignment.Remarks)))),
                React.createElement(AssetAttachmentSection, { assetId: asset.Title, asset: asset, repairs: repairs, fileService: fileService }),
                React.createElement("div", { className: styles.card, style: { marginTop: 16 } },
                    React.createElement("div", { className: styles.cardTitle },
                        React.createElement(HistoryRegular, null),
                        " Change History"),
                    loadingHist ? (React.createElement(Spinner, { size: SpinnerSize.small, label: "Loading history\u2026" })) : history.length === 0 ? (React.createElement("span", { style: { fontSize: 12, color: '#707070' } }, "No history recorded yet.")) : (React.createElement("div", { className: styles.timeline }, history.map(function (h, i) {
                        var _a;
                        return (React.createElement("div", { key: (_a = h.Id) !== null && _a !== void 0 ? _a : i, className: styles.timelineItem },
                            React.createElement("div", { className: styles.timelineDot }, historyIcon(h)),
                            React.createElement("div", { className: styles.timelineContent },
                                React.createElement("div", { className: styles.timelineAction }, h.PreviousStatus && h.NewStatus
                                    ? React.createElement(React.Fragment, null,
                                        React.createElement("strong", null, h.PreviousStatus),
                                        ' → ',
                                        React.createElement("strong", null, h.NewStatus))
                                    : h.NewStatus
                                        ? React.createElement("strong", null,
                                            "Created (",
                                            h.NewStatus,
                                            ")")
                                        : React.createElement("strong", null, "Updated")),
                                React.createElement("div", { className: styles.timelineMeta },
                                    h.ChangedBy,
                                    " \u00B7 ",
                                    AssetIdGenerator.formatDate(h.ChangeDate)),
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
                React.createElement(DefaultButton, { onClick: function () { setShowStatusDlg(false); setNewStatus(null); setStatusNote(''); } }, "Cancel"))),
        React.createElement(GiftedDialog, { open: showGiftedDlg, draft: giftedDraft, saving: savingGifted, onChange: setGiftedDraft, onConfirm: handleSaveGifted, onClose: function () { return setShowGiftedDlg(false); }, fileService: fileService, assetId: asset.Title }),
        React.createElement(ScrapDialog, { open: showScrapDlg, draft: scrapDraft, saving: savingScrap, onChange: setScrapDraft, onConfirm: handleSaveScrap, onClose: function () { return setShowScrapDlg(false); }, fileService: fileService, assetId: asset.Title })));
};
export default AssetDetail;
//# sourceMappingURL=AssetDetail.js.map