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
import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Pivot, PivotItem, Spinner, SpinnerSize, MessageBar, MessageBarType, DefaultButton, PrimaryButton, Dialog, DialogType, DialogFooter, } from '@fluentui/react';
import { AssetService } from '../services/AssetService';
import { AssetRepairService } from '../services/AssetRepairService';
import { AssetAssignmentService } from '../services/AssetAssignmentService';
import { AssetGiftedService } from '../services/AssetGiftedService';
import { AssetScrapService } from '../services/AssetScrapService';
import { FileUploadService } from '../services/FileUploadService';
import { PowerAutomateService } from '../services/PowerAutomateService';
import { spfi } from '@pnp/sp';
import { SPFx } from '@pnp/sp/behaviors/spfx';
import Dashboard from './Dashboard';
import AssetTable from './AssetTable';
import AssetDetailsForm from './AssetDetailsForm';
import AssetAssignmentForm from './AssetAssignmentForm';
import AssetDetail from './AssetDetail';
import styles from './ItAssetManager.module.scss';
// ── Component ─────────────────────────────────────────────────────────────────
var ItAssetManager = function (props) {
    var _a = useState('dashboard'), view = _a[0], setView = _a[1];
    var _b = useState([]), assets = _b[0], setAssets = _b[1];
    var _c = useState(null), selected = _c[0], setSelected = _c[1];
    var _d = useState(true), loading = _d[0], setLoading = _d[1];
    var _e = useState(''), error = _e[0], setError = _e[1];
    var _f = useState(''), success = _f[0], setSuccess = _f[1];
    var _g = useState('dashboard'), pivotKey = _g[0], setPivotKey = _g[1];
    // "Assign now?" prompt state (shown after creating a new asset)
    var _h = useState(null), assignPromptAsset = _h[0], setAssignPromptAsset = _h[1];
    // Currently editing assignment (for edit-assign view)
    var _j = useState(null), editingAssignment = _j[0], setEditingAssignment = _j[1];
    // Build services once — all pointed at the configured site (may differ from the page's host site)
    var sp = useMemo(function () { return spfi(props.siteUrl).using(SPFx(props.context)); }, [props.context, props.siteUrl]);
    var siteRelUrl = useMemo(function () {
        try {
            return new URL(props.siteUrl).pathname;
        }
        catch (_a) {
            return props.context.pageContext.web.serverRelativeUrl;
        }
    }, [props.siteUrl, props.context.pageContext.web.serverRelativeUrl]);
    var svc = useMemo(function () { return new AssetService(props.context, props.siteUrl); }, [props.context, props.siteUrl]);
    var repairSvc = useMemo(function () { return new AssetRepairService(sp); }, [sp]);
    var assignSvc = useMemo(function () { return new AssetAssignmentService(sp); }, [sp]);
    var giftedSvc = useMemo(function () { return new AssetGiftedService(sp); }, [sp]);
    var scrapSvc = useMemo(function () { return new AssetScrapService(sp); }, [sp]);
    var fileSvc = useMemo(function () { return new FileUploadService(sp, siteRelUrl); }, [sp, siteRelUrl]);
    var pa = useMemo(function () { return new PowerAutomateService({
        assignmentWebhook: props.assignmentWebhook,
        lostDeviceWebhook: props.lostDeviceWebhook,
        warrantyExpiryWebhook: props.warrantyExpiryWebhook,
        scrapEwasteWebhook: props.scrapEwasteWebhook,
    }); }, [props.assignmentWebhook, props.lostDeviceWebhook, props.warrantyExpiryWebhook, props.scrapEwasteWebhook]);
    // ── Data loading ─────────────────────────────────────────────────────────────
    var loadAssets = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, e_1, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    setError('');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, svc.getAssets()];
                case 2:
                    data = _a.sent();
                    setAssets(data);
                    return [3 /*break*/, 5];
                case 3:
                    e_1 = _a.sent();
                    msg = e_1 instanceof Error ? e_1.message : JSON.stringify(e_1);
                    setError("Could not load assets: ".concat(msg));
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [svc]);
    useEffect(function () { loadAssets(); }, [loadAssets]);
    var notify = function (msg) {
        setSuccess(msg);
        setTimeout(function () { return setSuccess(''); }, 5000);
    };
    // ── Asset CRUD handlers ───────────────────────────────────────────────────────
    var handleAddAsset = function (asset) { return __awaiter(void 0, void 0, void 0, function () {
        var created, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, svc.addAsset(asset)];
                case 1:
                    created = _b.sent();
                    return [4 /*yield*/, loadAssets()];
                case 2:
                    _b.sent();
                    setSelected(created);
                    setAssignPromptAsset(created); // trigger "Assign now?" prompt
                    if (created.historyWarning) {
                        notify("Asset ".concat(created.Title, " created. Warning: history logging failed \u2014 check Asset_History list column names."));
                    }
                    else {
                        notify("Asset ".concat(created.Title, " created."));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    setError('Failed to create asset.');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdateAsset = function (id, changes) { return __awaiter(void 0, void 0, void 0, function () {
        var refreshed, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, svc.updateAsset(id, changes)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, loadAssets()];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, svc.getAssetById(id)];
                case 3:
                    refreshed = _b.sent();
                    setSelected(refreshed);
                    notify('Asset updated.');
                    setView('detail');
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setError('Failed to update asset.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleStatusChange = function (asset, newStatus, notes) { return __awaiter(void 0, void 0, void 0, function () {
        var statusResult, updatedAsset, refreshed, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, svc.changeStatus({
                            assetId: asset.Title, itemId: asset.Id,
                            previousStatus: asset.Status,
                            newStatus: newStatus,
                            notes: notes,
                            changedBy: props.userDisplayName,
                        })];
                case 1:
                    statusResult = _b.sent();
                    updatedAsset = __assign(__assign({}, asset), { Status: newStatus });
                    if (!(newStatus === 'Active' && updatedAsset.AssignedTo)) return [3 /*break*/, 3];
                    return [4 /*yield*/, pa.onAssetAssigned(updatedAsset, props.userDisplayName)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    if (!(newStatus === 'Lost' || newStatus === 'Stolen')) return [3 /*break*/, 5];
                    return [4 /*yield*/, pa.onDeviceLostOrStolen(asset, newStatus, props.userDisplayName)];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    if (!(newStatus === 'Scrapped' || newStatus === 'Disposed')) return [3 /*break*/, 7];
                    return [4 /*yield*/, pa.onScrapOrDispose(asset, newStatus, props.userDisplayName)];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7: return [4 /*yield*/, loadAssets()];
                case 8:
                    _b.sent();
                    return [4 /*yield*/, svc.getAssetById(asset.Id)];
                case 9:
                    refreshed = _b.sent();
                    setSelected(refreshed);
                    if (statusResult === null || statusResult === void 0 ? void 0 : statusResult.historyWarning) {
                        notify("Status changed to \"".concat(newStatus, "\". Warning: history logging failed \u2014 check Asset_History list column names."));
                    }
                    else {
                        notify("Status changed to \"".concat(newStatus, "\"."));
                    }
                    return [3 /*break*/, 11];
                case 10:
                    _a = _b.sent();
                    setError('Failed to change status.');
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    }); };
    // ── Assignment handlers ───────────────────────────────────────────────────────
    var handleSaveAssignment = function (assignment) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            notify("Asset ".concat(assignment.Title, " assigned to ").concat(assignment.AssignedTo, "."));
            setAssignPromptAsset(null);
            backToList();
            return [2 /*return*/];
        });
    }); };
    // ── Navigation helpers ────────────────────────────────────────────────────────
    var openDetail = function (asset) { setSelected(asset); setView('detail'); };
    var openEdit = function (asset) { setSelected(asset); setView('edit'); };
    var backToList = function () { setSelected(null); setView('list'); setPivotKey('list'); };
    var openEditAssignment = function (existing) {
        if (!selected)
            return;
        setEditingAssignment(existing);
        setView(existing ? 'edit-assign' : 'assign');
    };
    var handleBulkLinkDocument = function (assetItemIds, docUrl) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(assetItemIds.map(function (id) { return svc.updateAsset(id, { PurchaseBillUrl: docUrl }); }))];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadAssets()];
                case 2:
                    _a.sent();
                    notify("Document linked to ".concat(assetItemIds.length, " asset(s)."));
                    return [2 /*return*/];
            }
        });
    }); };
    // ── Initial loading spinner ───────────────────────────────────────────────────
    if (loading && assets.length === 0) {
        return (React.createElement("div", { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 } },
            React.createElement(Spinner, { size: SpinnerSize.large, label: "Loading IT Asset Manager\u2026" })));
    }
    var showPivot = view === 'dashboard' || view === 'list';
    return (React.createElement("div", { className: styles.root },
        error && (React.createElement(MessageBar, { messageBarType: MessageBarType.error }, error)),
        success && (React.createElement(MessageBar, { messageBarType: MessageBarType.success }, success)),
        React.createElement("div", { className: styles.header },
            React.createElement("div", null,
                React.createElement("span", { className: styles.title }, "IT Asset Lifecycle Manager"),
                React.createElement("span", { className: styles.subtitle }, " \u00B7 Chennai Office \u00B7 India")),
            React.createElement("span", { className: styles.badge },
                assets.length,
                " Assets")),
        showPivot && (React.createElement(Pivot, { selectedKey: pivotKey, onLinkClick: function (item) {
                var key = item === null || item === void 0 ? void 0 : item.props.itemKey;
                setPivotKey(key);
                setView(key);
            }, className: styles.pivot },
            React.createElement(PivotItem, { headerText: "Dashboard", itemKey: "dashboard", itemIcon: "ViewDashboard" }),
            React.createElement(PivotItem, { headerText: "All Assets", itemKey: "list", itemIcon: "List" }))),
        view === 'dashboard' && (React.createElement(Dashboard, { assets: assets, onViewAll: function () { setView('list'); setPivotKey('list'); }, onViewAsset: openDetail })),
        view === 'list' && (React.createElement(AssetTable, { assets: assets, loading: loading, onAddNew: function () { return setView('add'); }, onView: openDetail, onEdit: openEdit, onRefresh: loadAssets, onBulkLinkDocument: handleBulkLinkDocument })),
        view === 'add' && (React.createElement(AssetDetailsForm, { defaultCountry: props.defaultCountry, defaultOffice: props.defaultOffice, assetService: svc, repairService: repairSvc, fileService: fileSvc, onSave: handleAddAsset, onCancel: backToList })),
        view === 'edit' && selected && (React.createElement(AssetDetailsForm, { asset: selected, defaultCountry: props.defaultCountry, defaultOffice: props.defaultOffice, assetService: svc, repairService: repairSvc, fileService: fileSvc, onSave: function (changes) { return handleUpdateAsset(selected.Id, changes); }, onCancel: function () { return setView('detail'); } })),
        view === 'assign' && selected && (React.createElement(AssetAssignmentForm, { asset: selected, assignmentService: assignSvc, onSave: handleSaveAssignment, onCancel: function () { return setView('detail'); } })),
        view === 'edit-assign' && selected && (React.createElement(AssetAssignmentForm, { asset: selected, existingAssignment: editingAssignment !== null && editingAssignment !== void 0 ? editingAssignment : undefined, assignmentService: assignSvc, onSave: handleSaveAssignment, onCancel: function () { return setView('detail'); } })),
        view === 'detail' && selected && (React.createElement(AssetDetail, { asset: selected, assetService: svc, repairService: repairSvc, assignmentService: assignSvc, giftedService: giftedSvc, scrapService: scrapSvc, fileService: fileSvc, currentUser: props.userDisplayName, onBack: backToList, onEdit: function () { return openEdit(selected); }, onEditAssignment: openEditAssignment, onStatusChange: handleStatusChange })),
        React.createElement(Dialog, { hidden: !assignPromptAsset, onDismiss: function () { setAssignPromptAsset(null); backToList(); }, dialogContentProps: {
                type: DialogType.normal,
                title: 'Asset Created',
            }, modalProps: { isBlocking: false } },
            React.createElement("p", null,
                "Asset ",
                React.createElement("strong", { style: { fontFamily: 'monospace' } }, assignPromptAsset === null || assignPromptAsset === void 0 ? void 0 : assignPromptAsset.Title),
                " has been created successfully."),
            React.createElement("p", null, "Would you like to assign it to an employee now?"),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: function () {
                        setView('assign');
                        setAssignPromptAsset(null);
                    } }, "Yes, Assign Now"),
                React.createElement(DefaultButton, { onClick: function () { setAssignPromptAsset(null); backToList(); } }, "No, Assign Later")))));
};
export default ItAssetManager;
//# sourceMappingURL=ItAssetManager.js.map