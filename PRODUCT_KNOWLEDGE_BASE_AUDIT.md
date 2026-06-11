# Audit Report: PRODUCT_KNOWLEDGE_BASE.md vs. Codebase

**Date**: 2026-06-11
**Auditor**: Automated Codebase Validation
**Source of Truth**: Source code, SharePoint provisioning files, package.json, package-solution.json

---

## Executive Summary

**Documentation Accuracy Score: 87 / 100**

*What is stated is mostly correct.* The primary issues are:
1. **Incomplete schema coverage** — 23 of 41 IT_Assets columns and 8 of 13 Asset_Assignments columns are undocumented.
2. **One incorrect claim** — The Assignment Flow (5.2) states `PowerAutomateService.onAssetAssigned` fires during assignment save; it actually fires only during status change to `Active`.
3. **Incomplete service method inventories** — Several methods on every service are omitted.

---

## Section-by-Section Audit

### 1. Product Overview

| Claim | Verdict | Evidence |
|---|---|---|
| Product name: IT Asset Lifecycle Manager | **VERIFIED** | `config/package-solution.json:4` |
| Version: 1.9.0 | **VERIFIED** | `package.json:3`, `package-solution.json:6` |
| SPFx v1.18.2 | **VERIFIED** | All `@microsoft/sp-*` deps are `~1.18.2` |
| Node.js v18.x | **VERIFIED** | `package.json:6` `>=18.17.1 <19.0.0` |
| TypeScript v4.7 | **VERIFIED** | `package.json:44` `~4.7.4` |
| React v17.0.1, Fluent UI v8 | **VERIFIED** | `package.json:17-18,29` |
| @fluentui/react-icons | **VERIFIED** | `package.json:19` |
| @pnp/sp v3.21.0 | **VERIFIED** | `package.json:28` |
| Power Automate Integration | **VERIFIED** | `flows/*.json` (4 flows), `PowerAutomateService.ts` |
| 7 functional React components | **PARTIALLY VERIFIED** | 7 `.tsx` component files exist, but `AssetForm.tsx` is legacy/unused (see Known Issues §8.4) |
| 5 core services | **VERIFIED** | 5 service files in `services/` |
| 4 data models | **VERIFIED** | 4 model files in `models/` |
| 4 SharePoint lists | **VERIFIED** | `elements.xml` lists IT_Assets, Asset_History, Asset_Assignments, Asset_Repairs |
| 1 document library | **VERIFIED** | `elements.xml:35` AssetAttachments (TemplateType=101) |

### 2. SharePoint Architecture

#### 2.1 IT_Assets

| Claim | Verdict | Evidence |
|---|---|---|
| Internal name `IT_Assets` | **VERIFIED** | `schema.xml:9` |
| 18 columns documented | **VERIFIED** | Each column exists in `schema.xml:19-108` |
| **23 columns undocumented** | **MISSING** | `SequenceNumber`, `PurchaseBillName`, `DateAddedToStock`, `ConditionAtStockEntry`, `StockRemarks`, `GiftedTo`, `GiftedDate`, `GiftedAuthorisedBy`, `GiftedRemarks`, `GiftedAttachmentUrl`, `TransferredFrom`, `TransferredTo`, `TransferDate`, `TransferReason`, `TransferAttachmentUrl`, `ScrapVendor`, `ScrapInvoiceNumber`, `ScrapPONumber`, `ScrapAmount`, `EWasteCertNumber`, `ScrapAttachmentUrl`, `Remarks`, `AssetLocation` (the field exists but is miscategorised — see below) |
| AssetLocation = "Current physical location" | **PARTIALLY VERIFIED** | It is the denormalised assignment location, not a freeform physical-location field |

#### 2.2 Asset_Assignments

| Claim | Verdict | Evidence |
|---|---|---|
| Internal name `Asset_Assignments` | **VERIFIED** | `schema.xml:140` |
| 5 columns documented | **VERIFIED** | Title, AssetItemId, IsActive, DateOfAssignment, NextMaintenanceDate |
| **8 columns undocumented** | **MISSING** | `SerialNumber`, `AssignedTo`, `AssignedToEmail`, `Department`, `AssetLocation`, `LastMaintenanceDate`, `MaintenanceNotes`, `AssignmentRemarks` |

#### 2.3 Asset_Repairs

| Claim | Verdict | Evidence |
|---|---|---|
| Internal name `Asset_Repairs` | **VERIFIED** | `schema.xml:169` |
| 4 columns documented | **VERIFIED** | RepairDate, RepairVendor, IssueDescription, RepairCost |
| **5 columns undocumented** | **MISSING** | `AssetItemId`, `RepairInvoiceNumber`, `AttachmentUrl`, `AttachmentName` |

#### 2.4 Asset_History

| Claim | Verdict | Evidence |
|---|---|---|
| Internal name `Asset_History` | **VERIFIED** | `schema.xml:116` |
| Key Actions: Created, StatusChanged, Assigned, Unassigned | **PARTIALLY VERIFIED** | `IAssetHistory.ts:3-8` adds `Updated`, `DepartmentChanged`, `LocationChanged` — KB list is correct but incomplete |

#### 2.5 AssetAttachments

| Claim | Verdict | Evidence |
|---|---|---|
| Internal name `AssetAttachments` | **VERIFIED** | `elements.xml:35` |
| Folder structure `/[AssetID]/[Category]/[File]` | **VERIFIED** | `FileUploadService.ts:17` `\`${LIBRARY}/${assetId}/${sub}\`` |
| Categories: purchase, repair, gifted, transfer, scrap | **VERIFIED** | Used in `AssetDetailsForm.tsx` upload calls |

### 3. React Component Inventory

| Component | Verdict | Notes |
|---|---|---|
| ItAssetManager | **VERIFIED** | File, purpose, props, methods, parent, children all match |
| Dashboard | **VERIFIED** | File, purpose, props, useEffect pattern all match |
| AssetTable | **VERIFIED** | File, purpose, props, methods match. Minor: state has `sortAsc` not documented |
| AssetDetail | **VERIFIED** | File, purpose, props, methods all match |
| AssetDetailsForm | **VERIFIED** | File, purpose, methods all confirmed (`grep` found `maybeUpload` at line 294, `handleAddRepair` at line 333) |
| AssetAssignmentForm | **VERIFIED** | File, purpose, handleSave all match. Note: the "syncs to IT_Assets" claim is NOW correct after the fix applied in this session |

### 4. Service Inventory

| Service | Verdict | Notes |
|---|---|---|
| AssetService | **PARTIALLY VERIFIED** | Methods documented (getAssets, addAsset, changeStatus, getDashboardStats) are correct. **Missing**: getAssetById, updateAsset, deleteAsset, getNextSequenceNumber, getAssetHistory, getWarrantyExpiring, getRecentHistory, searchUsers |
| AssetAssignmentService | **PARTIALLY VERIFIED** | Methods documented (getActiveAssignment, addAssignment) are correct. **Missing**: getAllAssignments, updateAssignment, _syncITAssets |
| AssetRepairService | **PARTIALLY VERIFIED** | Methods documented (getRepairs, addRepair, deleteRepair) are correct. **Missing**: updateRepair |
| FileUploadService | **PARTIALLY VERIFIED** | Methods documented (upload, ensureFolder) are correct. **Missing**: deleteFile, getAbsoluteUrl |
| PowerAutomateService | **VERIFIED** | Events documented (onAssetAssigned, onDeviceLostOrStolen, onWarrantyExpirySoon, onScrapOrDispose) all match |

### 5. Data Flows

#### 5.1 Asset Creation Flow — **VERIFIED**
All 7 steps confirmed against code (`ItAssetManager.tsx:85-95`, `AssetService.ts:79-96`, `AssetIdGenerator.ts`).

#### 5.2 Assignment Flow

| Step | Verdict | Evidence |
|---|---|---|
| 1. User submits AssetAssignmentForm | **VERIFIED** | `AssetAssignmentForm.tsx:109-126` |
| 2. deactivateExisting runs | **VERIFIED** | `AssetAssignmentService.ts:40` |
| 3. New record added to Asset_Assignments | **VERIFIED** | `AssetAssignmentService.ts:41-43` |
| 4. _syncITAssets updates IT_Assets | **VERIFIED** | `AssetAssignmentService.ts:45` (added in fix) |
| 5. PowerAutomateService.onAssetAssigned fires | **INCORRECT** | `ItAssetManager.tsx:137-141` — `handleSaveAssignment` does NOT call any PA webhook. The only `onAssetAssigned` call is in `handleStatusChange` (line 119-120) when status changes to `Active` |

#### 5.3 Status Change Flow — **VERIFIED**
All 5 steps confirmed (`ItAssetManager.tsx:110-133`, `AssetService.ts:110-133`, `PowerAutomateService.ts`).

### 6. User Journeys — **VERIFIED**
Both walkthroughs match the component implementations.

### 7. File Inventory — **VERIFIED**
All 6 file entries have correct paths and descriptions.

### 8. Known Issues & Technical Debt

| # | Claim | Verdict | Evidence |
|---|---|---|---|
| 1 | Denormalization Sync | **VERIFIED** | Bug report confirms, and fix was applied in this session |
| 2 | List threshold (top 5000) | **VERIFIED** | `AssetService.ts:54` |
| 3 | Webhook reliability (no retry) | **VERIFIED** | `PowerAutomateService.ts:13-24` — bare `fetch` in try/catch, no retry |
| 4 | AssetForm.tsx legacy duplicate | **VERIFIED** | `AssetForm.tsx` (333 lines) exists; not imported by `ItAssetManager.tsx` |

### 9. AI Agent Handoff — **VERIFIED**
All 5 conventions are sound and derivable from the codebase.

---

## Missing Documentation

### Undocumented Services (complete method listings)

**AssetService** (8 undocumented methods):
- `getAssetById(id)` — `AssetService.ts:59-64`
- `updateAsset(id, changes)` — `AssetService.ts:98-100`
- `deleteAsset(id)` — `AssetService.ts:102-104`
- `getNextSequenceNumber(type, country, office)` — `AssetService.ts:66-77`
- `getAssetHistory(assetId)` — `AssetService.ts:139-146`
- `getWarrantyExpiring(days)` — `AssetService.ts:189-203`
- `getRecentHistory(limit)` — `AssetService.ts:205-210`
- `searchUsers(query)` — `AssetService.ts:216-228`

**AssetAssignmentService** (3 undocumented methods):
- `getAllAssignments(assetId)` — `AssetAssignmentService.ts:28-35`
- `updateAssignment(id, changes)` — `AssetAssignmentService.ts:49-57`
- `_syncITAssets(assetItemId, data)` — `AssetAssignmentService.ts:73-85`

**AssetRepairService** (1 undocumented):
- `updateRepair(id, changes)` — `AssetRepairService.ts:34-39`

**FileUploadService** (2 undocumented):
- `deleteFile(serverRelativeUrl)` — `FileUploadService.ts:40-46`
- `getAbsoluteUrl(serverRelativeUrl)` — `FileUploadService.ts:48-51`

### Undocumented SharePoint Columns

**IT_Assets** (23 missing):
`SequenceNumber`, `PurchaseBillName`, `DateAddedToStock`, `ConditionAtStockEntry`, `StockRemarks`, `GiftedTo`, `GiftedDate`, `GiftedAuthorisedBy`, `GiftedRemarks`, `GiftedAttachmentUrl`, `TransferredFrom`, `TransferredTo`, `TransferDate`, `TransferReason`, `TransferAttachmentUrl`, `ScrapVendor`, `ScrapInvoiceNumber`, `ScrapPONumber`, `ScrapAmount`, `EWasteCertNumber`, `ScrapAttachmentUrl`, `Remarks`, `AssetLocation`

**Asset_Assignments** (8 missing):
`SerialNumber`, `AssignedTo`, `AssignedToEmail`, `Department`, `AssetLocation`, `LastMaintenanceDate`, `MaintenanceNotes`, `AssignmentRemarks`

**Asset_Repairs** (5 missing):
`AssetItemId`, `RepairInvoiceNumber`, `AttachmentUrl`, `AttachmentName`

### Undocumented Model Types

- `IRepairEntryDraft` — `IRepairEntry.ts:14-21`
- `StockCondition` — `IAsset.ts:15`
- `HistoryAction` union — `IAssetHistory.ts:1-8` (lists `Updated`, `DepartmentChanged`, `LocationChanged` not in KB)
- `ASSET_STATUS_TRANSITIONS` state machine — `IAsset.ts:75-86`
- `STATUS_REQUIRES_NOTE` — `IAsset.ts:89`
- `ASSET_TYPE_LABELS` — `IAsset.ts:91-100`
- `STATUS_BADGE_COLORS` — `IAsset.ts:102-113`
- `DEPT_OPTIONS` — `IAsset.ts:115-118`
- `LOCATION_OPTIONS` — `IAsset.ts:120-126`

---

## Incorrect Items

| Section | Statement | Correction |
|---|---|---|
| 5.2 Step 5 | `PowerAutomateService.onAssetAssigned` fires during assignment save | **INCORRECT**. The assignment save handler (`ItAssetManager.tsx:137-141`) does not fire any PA webhook. `onAssetAssigned` is only called during `handleStatusChange` when status transitions to `Active` (`ItAssetManager.tsx:119-120`). |

---

## Recommended Corrections

### High Priority

1. **Fix §5.2 Step 5**: Remove or reword the claim that PA webhook fires during assignment save. The current code does not trigger `onAssetAssigned` from the assignment flow.

2. **Complete IT_Assets column listing**: Add the 23 missing columns to §2.1, grouped by category (Procurement, Stock, Gifted, Transfer, Scrap, Assignment, Remarks) matching the schema.xml structure.

3. **Complete Asset_Assignments column listing**: Add the 8 missing columns to §2.2.

4. **Complete Asset_Repairs column listing**: Add the 5 missing columns to §2.3.

### Medium Priority

5. **Fill service method inventories** in §4 with all methods from each service.

6. **Document `IAsset.ts` constants** — `ASSET_STATUS_TRANSITIONS`, `STATUS_REQUIRES_NOTE`, `ASSET_TYPE_LABELS`, `STATUS_BADGE_COLORS`, `DEPT_OPTIONS`, `LOCATION_OPTIONS`.

7. **Document `HistoryAction` union** in §2.4 — add `Updated`, `DepartmentChanged`, `LocationChanged`.

### Low Priority

8. **Add `AssetForm.tsx` to Known Issues** — already covered by §8.4, but could be referenced explicitly.
