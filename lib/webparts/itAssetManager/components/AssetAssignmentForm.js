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
import { useState } from 'react';
import { Spinner, SpinnerSize, MessageBar, MessageBarType, DefaultButton, PrimaryButton, IconButton, TextField, Dropdown, } from '@fluentui/react';
import { PersonRegular, CalendarRegular, NoteRegular, } from '@fluentui/react-icons';
import { DEPT_OPTIONS, LOCATION_OPTIONS } from '../models/IAsset';
import { emptyAssignment } from '../models/IAssetAssignment';
import styles from './AssetAssignmentForm.module.scss';
var DateField = function (_a) {
    var label = _a.label, value = _a.value, onChange = _a.onChange, error = _a.error;
    return (React.createElement("div", null,
        React.createElement("label", { style: { fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 } }, label),
        React.createElement("input", { type: "date", value: value ? value.slice(0, 10) : '', onChange: function (e) {
                var v = e.target.value;
                onChange(v ? new Date(v + 'T00:00:00').toISOString() : '');
            }, style: {
                width: '100%', padding: '5px 8px', borderRadius: 4, fontSize: 14,
                fontFamily: 'inherit', color: '#242424',
                border: "1px solid ".concat(error ? '#d13438' : '#d1d1d1'),
                background: '#fff',
                boxSizing: 'border-box',
            } }),
        error && React.createElement("span", { style: { color: '#d13438', fontSize: 12, display: 'block', marginTop: 4 } }, error)));
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
// ── Main component ─────────────────────────────────────────────────────────────
var AssetAssignmentForm = function (_a) {
    var _b;
    var asset = _a.asset, existingAssignment = _a.existingAssignment, assignmentService = _a.assignmentService, onSave = _a.onSave, onCancel = _a.onCancel;
    var isEdit = !!existingAssignment;
    var _c = useState(existingAssignment
        ? __assign({}, existingAssignment) : emptyAssignment(asset.Title, (_b = asset.Id) !== null && _b !== void 0 ? _b : 0)), form = _c[0], setForm = _c[1];
    var _d = useState(false), saving = _d[0], setSaving = _d[1];
    var _f = useState({}), errors = _f[0], setErrors = _f[1];
    var set = function (key, value) {
        return setForm(function (f) {
            var _a;
            return (__assign(__assign({}, f), (_a = {}, _a[key] = value, _a)));
        });
    };
    // ── Validation ───────────────────────────────────────────────────────────────
    var validate = function () {
        var _a, _b, _c;
        var e = {};
        if (!((_a = form.AssignedTo) === null || _a === void 0 ? void 0 : _a.trim()))
            e.AssignedTo = 'Assigned To is required.';
        else if (form.IsGuestUser && form.AssignedTo.trim().split(/\s+/).length < 2)
            e.AssignedTo = 'Guest user name must include at least first and last name.';
        if (!((_b = form.AssignedToEmail) === null || _b === void 0 ? void 0 : _b.trim()))
            e.AssignedToEmail = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.AssignedToEmail.trim()))
            e.AssignedToEmail = 'Enter a valid email address.';
        if (!((_c = form.Department) === null || _c === void 0 ? void 0 : _c.trim()))
            e.Department = 'Department is required.';
        if (!form.DateOfAssignment)
            e.DateOfAssignment = 'Date of assignment is required.';
        if (form.NextMaintenanceDate && form.LastMaintenanceDate &&
            new Date(form.NextMaintenanceDate) < new Date(form.LastMaintenanceDate))
            e.NextMaintenanceDate = 'Next maintenance must be after last maintenance.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };
    // ── Save ──────────────────────────────────────────────────────────────────────
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        var saved, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!validate())
                        return [2 /*return*/];
                    setSaving(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, 8, 9]);
                    saved = void 0;
                    if (!(isEdit && (existingAssignment === null || existingAssignment === void 0 ? void 0 : existingAssignment.Id) !== undefined)) return [3 /*break*/, 3];
                    return [4 /*yield*/, assignmentService.updateAssignment(existingAssignment.Id, form)];
                case 2:
                    _b.sent();
                    saved = form;
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, assignmentService.addAssignment(form)];
                case 4:
                    saved = _b.sent();
                    _b.label = 5;
                case 5: return [4 /*yield*/, onSave(saved)];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 7:
                    _a = _b.sent();
                    setErrors({ form: 'Save failed. Please try again.' });
                    return [3 /*break*/, 9];
                case 8:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    // ── Render ────────────────────────────────────────────────────────────────────
    return (React.createElement("div", { className: styles.root },
        React.createElement("div", { className: styles.header },
            React.createElement(IconButton, { iconProps: { iconName: 'Back' }, onClick: onCancel }),
            React.createElement("div", null,
                React.createElement("span", { style: { fontSize: 20, fontWeight: 600 } }, isEdit ? 'Edit Assignment' : 'Assign Asset'),
                React.createElement("div", { className: styles.assetMeta },
                    React.createElement("span", { className: styles.assetIdChip }, asset.Title),
                    React.createElement("span", null, asset.Model),
                    React.createElement("span", { style: { color: '#707070' } },
                        "S/N: ",
                        asset.SerialNumber)))),
        errors.form && (React.createElement(MessageBar, { messageBarType: MessageBarType.error }, errors.form)),
        React.createElement("div", { className: styles.form },
            React.createElement("div", { className: styles.assetRefCard },
                React.createElement("div", { className: styles.refRow },
                    React.createElement("span", { className: styles.refLabel }, "Asset ID"),
                    React.createElement("span", { className: styles.refValue, style: { fontFamily: 'monospace', fontWeight: 700 } }, asset.Title)),
                React.createElement("div", { className: styles.refRow },
                    React.createElement("span", { className: styles.refLabel }, "Serial Number"),
                    React.createElement("span", { className: styles.refValue }, asset.SerialNumber)),
                React.createElement("div", { className: styles.refRow },
                    React.createElement("span", { className: styles.refLabel }, "Model"),
                    React.createElement("span", { className: styles.refValue }, asset.Model)),
                React.createElement("div", { className: styles.refRow },
                    React.createElement("span", { className: styles.refLabel }, "Current Status"),
                    React.createElement("span", { className: styles.refValue }, asset.Status))),
            React.createElement(Section, { title: "Assignment Details", icon: React.createElement(PersonRegular, null) },
                React.createElement("div", { style: { marginBottom: 12 } },
                    React.createElement("label", { style: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 } },
                        React.createElement("input", { type: "checkbox", checked: !!form.IsGuestUser, onChange: function (e) { return set('IsGuestUser', e.target.checked); }, style: { width: 16, height: 16, cursor: 'pointer' } }),
                        "Is External / Guest User"),
                    form.IsGuestUser && (React.createElement("span", { style: { fontSize: 12, color: '#7d4900', display: 'block', marginTop: 4, marginLeft: 24 } }, "Guest user \u2014 full name (2+ words) and valid email required."))),
                React.createElement("div", { className: styles.grid },
                    React.createElement(TextField, { label: "Assigned To *", value: form.AssignedTo, onChange: function (_e, v) { return set('AssignedTo', v || ''); }, placeholder: form.IsGuestUser ? 'First Last (full name required)' : 'Full name', errorMessage: errors.AssignedTo }),
                    React.createElement(TextField, { label: "Email *", type: "email", value: form.AssignedToEmail, onChange: function (_e, v) { return set('AssignedToEmail', v || ''); }, placeholder: form.IsGuestUser ? 'guest@external.com' : 'user@zoomrx.com', errorMessage: errors.AssignedToEmail }),
                    React.createElement(Dropdown, { label: "Department *", selectedKey: form.Department || '', options: __spreadArray([
                            { key: '', text: 'Select department…' }
                        ], DEPT_OPTIONS.map(function (d) { return ({ key: d, text: d }); }), true), onChange: function (_e, option) { return set('Department', (option === null || option === void 0 ? void 0 : option.key) || ''); }, errorMessage: errors.Department }),
                    React.createElement(Dropdown, { label: "Location", selectedKey: form.AssetLocation || '', options: __spreadArray([
                            { key: '', text: 'Select location…' }
                        ], LOCATION_OPTIONS.map(function (l) { return ({ key: l, text: l }); }), true), onChange: function (_e, option) { return set('AssetLocation', (option === null || option === void 0 ? void 0 : option.key) || ''); } }),
                    React.createElement(DateField, { label: "Date of Assignment *", value: form.DateOfAssignment, onChange: function (v) { return set('DateOfAssignment', v); }, required: true, error: errors.DateOfAssignment }))),
            React.createElement(Section, { title: "Maintenance Schedule", icon: React.createElement(CalendarRegular, null) },
                React.createElement("div", { className: styles.grid },
                    React.createElement(DateField, { label: "Last Maintenance Date", value: form.LastMaintenanceDate || '', onChange: function (v) { return set('LastMaintenanceDate', v); } }),
                    React.createElement(DateField, { label: "Next Maintenance Date", value: form.NextMaintenanceDate || '', onChange: function (v) { return set('NextMaintenanceDate', v); }, error: errors.NextMaintenanceDate }))),
            React.createElement(Section, { title: "Remarks", icon: React.createElement(NoteRegular, null) },
                React.createElement(TextField, { multiline: true, rows: 2, value: form.Remarks || '', onChange: function (_e, v) { return set('Remarks', v || ''); }, placeholder: "Any notes about this assignment\u2026", maxLength: 1000 }))),
        React.createElement("div", { className: styles.footer },
            React.createElement(PrimaryButton, { iconProps: { iconName: 'Save' }, onClick: handleSave, disabled: saving }, saving
                ? React.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                    React.createElement(Spinner, { size: SpinnerSize.small }),
                    React.createElement("span", null, "Saving\u2026"))
                : (isEdit ? 'Update Assignment' : 'Assign Asset')),
            React.createElement(DefaultButton, { onClick: onCancel }, isEdit ? 'Cancel' : 'Skip for Now'),
            !isEdit && (React.createElement("span", { style: { fontSize: 12, color: '#707070', marginLeft: 4 } }, "You can assign this asset later from the Asset Detail screen.")))));
};
export default AssetAssignmentForm;
//# sourceMappingURL=AssetAssignmentForm.js.map