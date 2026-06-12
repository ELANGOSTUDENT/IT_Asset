# Enterprise Knowledge Base: IT Asset Lifecycle Manager

## 1. Product Overview

*   **Product Name**: IT Asset Lifecycle Manager
*   **Version**: 1.9.0
*   **Purpose**: A mission-critical SPFx application for end-to-end IT asset management, specifically tailored for multi-office tracking (focused on Chennai, India). It handles the full lifecycle from procurement and stock entry to user assignment, maintenance, repair, and eventual e-waste disposal.
*   **Technology Stack**:
    *   **Framework**: SharePoint Framework (SPFx) v1.18.2
    *   **Runtime**: Node.js v18.x
    *   **Language**: TypeScript v4.7
    *   **UI Core**: React v17.0.1, Fluent UI React v8
    *   **Icons**: @fluentui/react-icons
    *   **Data Access**: @pnp/sp (PnPJS) v3.21.0
    *   **Integration**: Power Automate (Webhook-based)

### System Statistics
*   **Functional React Components**: 7 (including legacy `AssetForm.tsx`)
*   **Core Services**: 5
*   **Data Models**: 4
*   **SharePoint Lists**: 4
*   **Document Libraries**: 1

---

## 2. SharePoint Architecture

### 2.1. List: IT_Assets (Primary Registry)
*   **Internal Name**: `IT_Assets`
*   **Purpose**: Master record for every asset. Stores current state and denormalized assignment data.

#### Identity & classification
| Display Name | Internal Name | Type | Required |
| :--- | :--- | :--- | :--- |
| Title | `Title` | Text | Built-in (Asset ID, e.g. IN-CHN-26-LAP-0001) |
| SerialNumber | `SerialNumber` | Text | Yes |
| Model | `Model` | Text | Yes |
| Vendor | `Vendor` | Text | Yes |
| Country | `Country` | Text | No |
| OfficeCode | `OfficeCode` | Text | No |
| SequenceNumber | `SequenceNumber` | Number | No |
| Status | `Status` | Choice | Yes — `Procured, Stock, Active, Repair, Transferred, Gifted, Lost, Stolen, Scrapped, Disposed` |
| AssetType | `AssetType` | Choice | Yes — `LAP, MAC, DTP, MON, DOC, MOB, NET, ACC` |

#### Procurement
| Display Name | Internal Name | Type | Required |
| :--- | :--- | :--- | :--- |
| PONumber | `PONumber` | Text | No |
| InvoiceNumber | `InvoiceNumber` | Text | No |
| Cost | `Cost` | Currency | No |
| PurchaseDate | `PurchaseDate` | DateTime | Yes |
| WarrantyExpiry | `WarrantyExpiry` | DateTime | No |
| PurchaseBillUrl | `PurchaseBillUrl` | Text | No |
| PurchaseBillName | `PurchaseBillName` | Text | No |

#### Stock / in-store details
| Display Name | Internal Name | Type | Choices |
| :--- | :--- | :--- | :--- |
| DateAddedToStock | `DateAddedToStock` | DateTime | — |
| ConditionAtStockEntry | `ConditionAtStockEntry` | Choice | `Good, Refurbished, Damaged` |
| StockRemarks | `StockRemarks` | Note | — |

#### Gifted details
| Display Name | Internal Name | Type |
| :--- | :--- | :--- |
| GiftedTo | `GiftedTo` | Text |
| GiftedDate | `GiftedDate` | DateTime |
| GiftedAuthorisedBy | `GiftedAuthorisedBy` | Text |
| GiftedRemarks | `GiftedRemarks` | Note |
| GiftedAttachmentUrl | `GiftedAttachmentUrl` | Text |

#### Transfer of ownership
| Display Name | Internal Name | Type |
| :--- | :--- | :--- |
| TransferredFrom | `TransferredFrom` | Text |
| TransferredTo | `TransferredTo` | Text |
| TransferDate | `TransferDate` | DateTime |
| TransferReason | `TransferReason` | Note |
| TransferAttachmentUrl | `TransferAttachmentUrl` | Text |

#### Scrap / disposal details
| Display Name | Internal Name | Type |
| :--- | :--- | :--- |
| ScrapDate | `ScrapDate` | DateTime |
| ScrapVendor | `ScrapVendor` | Text |
| ScrapInvoiceNumber | `ScrapInvoiceNumber` | Text |
| ScrapPONumber | `ScrapPONumber` | Text |
| ScrapAmount | `ScrapAmount` | Currency |
| EWasteCertNumber | `EWasteCertNumber` | Text |
| ScrapAttachmentUrl | `ScrapAttachmentUrl` | Text |

#### Assignment (denormalised — kept for Dashboard/Table/Power Automate compatibility)
| Display Name | Internal Name | Type |
| :--- | :--- | :--- |
| AssignedTo | `AssignedTo` | Text |
| AssignedToEmail | `AssignedToEmail` | Text |
| Department | `Department` | Text |
| AssetLocation | `AssetLocation` | Text |

#### Remarks
| Display Name | Internal Name | Type |
| :--- | :--- | :--- |
| Remarks | `Remarks` | Note |

### 2.2. List: Asset_Assignments (Assignment History)
*   **Internal Name**: `Asset_Assignments`
*   **Purpose**: Granular tracking of user assignments and maintenance schedules.
*   **Columns**:
    | Display Name | Internal Name | Type |
    | :--- | :--- | :--- |
    | Title | `Title` | Text (Asset ID, FK to `IT_Assets.Title`) |
    | AssetItemId | `AssetItemId` | Number (FK to `IT_Assets.Id`) |
    | SerialNumber | `SerialNumber` | Text |
    | AssignedTo | `AssignedTo` | Text |
    | AssignedToEmail | `AssignedToEmail` | Text |
    | Department | `Department` | Text |
    | AssetLocation | `AssetLocation` | Text |
    | DateOfAssignment | `DateOfAssignment` | DateTime |
    | LastMaintenanceDate | `LastMaintenanceDate` | DateTime |
    | NextMaintenanceDate | `NextMaintenanceDate` | DateTime |
    | MaintenanceNotes | `MaintenanceNotes` | Note |
    | AssignmentRemarks | `AssignmentRemarks` | Note |
    | IsActive | `IsActive` | Boolean |

### 2.3. List: Asset_Repairs (Maintenance Log)
*   **Internal Name**: `Asset_Repairs`
*   **Purpose**: Log of all physical repairs and hardware servicing.
*   **Columns**:
    | Display Name | Internal Name | Type |
    | :--- | :--- | :--- |
    | Title | `Title` | Text (Asset ID) |
    | AssetItemId | `AssetItemId` | Number (FK to `IT_Assets.Id`) |
    | RepairDate | `RepairDate` | DateTime |
    | RepairVendor | `RepairVendor` | Text |
    | IssueDescription | `IssueDescription` | Note |
    | RepairCost | `RepairCost` | Currency |
    | RepairInvoiceNumber | `RepairInvoiceNumber` | Text |
    | AttachmentUrl | `AttachmentUrl` | Text |
    | AttachmentName | `AttachmentName` | Text |

### 2.4. List: Asset_History (Audit Trail)
*   **Internal Name**: `Asset_History`
*   **Purpose**: Immutable log of status changes and system actions.
*   **Columns**:
    | Display Name | Internal Name | Type |
    | :--- | :--- | :--- |
    | Title | `Title` | Text (Asset ID) |
    | Action | `Action` | Text — `Created, StatusChanged, Assigned, Unassigned, Updated, DepartmentChanged, LocationChanged` |
    | PreviousStatus | `PreviousStatus` | Text |
    | NewStatus | `NewStatus` | Text |
    | ChangedBy | `ChangedBy` | Text |
    | ChangedByEmail | `ChangedByEmail` | Text |
    | ChangedDate | `ChangedDate` | DateTime |
    | HistoryNotes | `HistoryNotes` | Note |

### 2.5. Library: IT Assets
*   **Display Name**: `IT Assets`
*   **Template Type**: 101 (Document Library)
*   **Folder Structure**: Flat category-based. Only repair reports use a per-asset subfolder.
*   **Folders and URL field mapping**:
    | Folder | Stores URL in |
    | :--- | :--- |
    | `Purchase Invoices` | `IT_Assets.PurchaseBillUrl` |
    | `Product Photos` | — |
    | `Validation Reports` | — |
    | `Transfer Documents` | `IT_Assets.TransferAttachmentUrl` |
    | `Gift Documents` | `IT_Assets.GiftedAttachmentUrl` |
    | `Scrap Documents` | `IT_Assets.ScrapAttachmentUrl` |
    | `Repair Reports/{AssetId}/` | `Asset_Repairs.AttachmentUrl` |
    | `Other` | — |
*   **DEPRECATED**: `AssetAttachments/{AssetId}/category/` — this structure is no longer used. Do not recreate it.

---

## 3. React Component Inventory

### 3.1. ItAssetManager (Root)
*   **File**: `src/webparts/itAssetManager/components/ItAssetManager.tsx`
*   **Purpose**: Application orchestrator, state manager for views, and service initializer.
*   **Props**: `context`, `userDisplayName`, `userEmail`, `assignmentWebhook`, `lostDeviceWebhook`, `warrantyExpiryWebhook`, `scrapEwasteWebhook`, `defaultCountry`, `defaultOffice`, `isDarkTheme`.
*   **Key Methods**: `loadAssets()`, `handleStatusChange()`, `notify()`, `handleAddAsset()`, `handleUpdateAsset()`, `handleSaveAssignment()`.
*   **Parent**: `ItAssetManagerWebPart.ts`
*   **Children**: `Dashboard`, `AssetTable`, `AssetDetailsForm`, `AssetAssignmentForm`, `AssetDetail`.

### 3.2. Dashboard
*   **File**: `src/webparts/itAssetManager/components/Dashboard.tsx`
*   **Purpose**: Analytical overview with KPI cards and warranty alerts.
*   **Props**: `assets`, `assetService`, `onViewAll`, `onViewAsset`.
*   **Data**: KPI row (Total, Active, In Stock, In Repair, Procured, Warranty Soon, Lost/Stolen), Asset Type Distribution bar chart, Status Breakdown chips, Top Departments, Warranty Expiring table.
*   **Key Methods**: `useEffect` (fetches stats and expiring warranties).
*   **Children**: Shimmer (loading states).

### 3.3. AssetTable
*   **File**: `src/webparts/itAssetManager/components/AssetTable.tsx`
*   **Purpose**: High-performance data grid with advanced filtering and CSV export.
*   **Props**: `assets`, `loading`, `onAddNew`, `onView`, `onEdit`, `onRefresh`.
*   **Key Methods**: `exportCSV()`, `handleColClick()`.
*   **State**: `search`, `filterStatus`, `filterType`, `filterDept`, `sortCol`, `sortAsc`.
*   **Filters**: Status dropdown, Type dropdown, Department dropdown, free-text search (asset ID, serial, model, vendor, assignee, department).

### 3.4. AssetDetail
*   **File**: `src/webparts/itAssetManager/components/AssetDetail.tsx`
*   **Purpose**: Comprehensive 360-degree view of an asset.
*   **Props**: `asset`, `currentUser`, `onStatusChange`, `onEditAssignment`, `onBack`, `onEdit`, `assetService`, `repairService`, `assignmentService`.
*   **Key Methods**: `loadData()` (parallel fetch of history, repairs, assignment), `confirmStatusChange()`.
*   **Sections**: Classification, Hardware, Procurement, Stock Details, Repair History, Gifted Details, Transfer Details, Scrap Details, Remarks (left panel); Current Assignment, Maintenance Schedule, Change History (right panel).

### 3.5. AssetDetailsForm
*   **File**: `src/webparts/itAssetManager/components/AssetDetailsForm.tsx`
*   **Purpose**: Unified form for Asset Creation and Metadata Editing.
*   **Props**: `asset` (optional — omitted for create mode), `defaultCountry`, `defaultOffice`, `assetService`, `repairService`, `fileService`, `onSave`, `onCancel`.
*   **Key Methods**: `validate()`, `handleSave()`, `maybeUpload()` (procurement/gifted/transfer/scrap attachments), `handleAddRepair()`.
*   **Logic**: Handles conditional sections (Stock/Gifted/Transfer/Scrap) based on `Status`.

### 3.6. AssetAssignmentForm
*   **File**: `src/webparts/itAssetManager/components/AssetAssignmentForm.tsx`
*   **Purpose**: Focused UI for assigning an asset to a user and scheduling maintenance.
*   **Props**: `asset`, `assignmentService`, `onSave`, `onCancel`.
*   **Key Methods**: `handleSave()` (creates `Asset_Assignments` record, deactivates previous, syncs denormalized fields to `IT_Assets`).

### 3.7. AssetForm (Legacy)
*   **File**: `src/webparts/itAssetManager/components/AssetForm.tsx`
*   **Status**: Legacy — partial duplicate of `AssetDetailsForm.tsx`. Not imported by the main app shell. Should be deprecated.

---

## 4. Service Inventory

### 4.1. AssetService
*   **File**: `services/AssetService.ts`
*   **SP Dependencies**: `IT_Assets`, `Asset_History`.
*   **Called By**: `ItAssetManager`, `Dashboard`, `AssetDetail`, `AssetDetailsForm`.
*   **Methods**:
    *   `getAssets()`: Fetches all assets (top 5000, ordered by Created desc).
    *   `getAssetById(id)`: Fetches a single asset by list item ID.
    *   `getNextSequenceNumber(type, country, office)`: Finds the next integer for ID generation (parses existing IDs with matching prefix).
    *   `addAsset(asset)`: Generates ID, adds record to `IT_Assets`, logs `Created` history.
    *   `updateAsset(id, changes)`: Updates an asset by list item ID.
    *   `deleteAsset(id)`: Sends an asset to the SharePoint recycle bin.
    *   `changeStatus(params)`: Updates `Status` + optional `extraFields` on `IT_Assets`, logs `StatusChanged` history.
    *   `getDashboardStats()`: Aggregates list data for KPI cards (total, byStatus, byType, byDept, warranty expiring count).
    *   `getWarrantyExpiring(days)`: Returns assets with warranty expiring within the given number of days.
    *   `getAssetHistory(assetId)`: Returns the audit trail for an asset from `Asset_History`.
    *   `getRecentHistory(limit)`: Returns the most recent history records across all assets.
    *   `searchUsers(query)`: Searches SharePoint site users by name or email (for people picker).

### 4.2. AssetAssignmentService
*   **File**: `services/AssetAssignmentService.ts`
*   **SP Dependencies**: `Asset_Assignments`, `IT_Assets`.
*   **Called By**: `ItAssetManager`, `AssetDetail`, `AssetAssignmentForm`.
*   **Methods**:
    *   `getActiveAssignment(assetId)`: Finds the `IsActive: true` record for an asset.
    *   `getAllAssignments(assetId)`: Returns all assignment records for an asset (ordered by DateOfAssignment desc).
    *   `addAssignment(assignment)`: Deactivates previous active assignment, creates new record with `IsActive: true`, syncs denormalized fields to `IT_Assets`.
    *   `updateAssignment(id, changes)`: Updates an existing assignment by ID, syncs changed fields to `IT_Assets`.
    *   `_syncITAssets(assetItemId, data)`: (Private) Updates `AssignedTo`, `AssignedToEmail`, `Department`, `AssetLocation`, `DateOfAssignment` on the matching `IT_Assets` item.

### 4.3. AssetRepairService
*   **File**: `services/AssetRepairService.ts`
*   **SP Dependencies**: `Asset_Repairs`.
*   **Called By**: `AssetDetail`, `AssetDetailsForm`.
*   **Methods**:
    *   `getRepairs(assetId)`: Fetches all repair entries for an asset (ordered by RepairDate desc).
    *   `addRepair(entry)`: Adds a new repair record.
    *   `updateRepair(id, changes)`: Updates an existing repair record by ID.
    *   `deleteRepair(id)`: Sends a repair record to the recycle bin.

### 4.4. FileUploadService
*   **File**: `services/FileUploadService.ts`
*   **SP Dependencies**: `IT Assets` document library.
*   **Called By**: `AssetDetailsForm`, `AssetAttachmentSection`.
*   **Methods**:
    *   `upload(assetId, sub, file)`: Uploads a file to `IT Assets/{CategoryFolder}/` (or `IT Assets/Repair Reports/{assetId}/` for `sub='repairs'`). Returns `IUploadResult` with `serverRelativeUrl`, `absoluteUrl`, `fileName`.
    *   `ensureFolder(assetId, sub)`: Creates the category folder if needed; also creates `Repair Reports/{assetId}` subfolder for repairs (two-step — SharePoint does not recursively create parent folders).
    *   `deleteFile(serverRelativeUrl)`: Recycles a file to the SharePoint recycle bin.
    *   `getAbsoluteUrl(serverRelativeUrl)`: Converts a server-relative URL to an absolute URL using `window.location.origin`.
    *   `listFiles(assetId)`: Queries `IT Assets/Repair Reports/{assetId}/` for repair files only. Returns `IAttachment[]` (category always `'repairs'`). Returns empty array on query error.
    *   `getFilesByCategory(assetId)`: Groups `listFiles()` result by category as a `Record<AttachmentCategory, IAttachment[]>`.
    *   `_getPreviewType(fileName)`: Maps extension to `browser`, `office`, or `download`.

### 4.5. PowerAutomateService
*   **File**: `services/PowerAutomateService.ts`
*   **Purpose**: Triggers JSON-payload webhooks for external flows.
*   **Dependencies**: 4 webhook URLs from property pane config: `assignmentWebhook`, `lostDeviceWebhook`, `warrantyExpiryWebhook`, `scrapEwasteWebhook`.
*   **Events**:
    *   `onAssetAssigned(asset, triggeredBy)`: Fires when status changes to `Active` AND `AssignedTo` is populated. **Note**: This fires during the status change flow, NOT during assignment save.
    *   `onDeviceLostOrStolen(asset, status, reportedBy)`: Fires when status changes to `Lost` or `Stolen`.
    *   `onWarrantyExpirySoon(assets)`: Fire-and-forget batch notification for warranties expiring within 90 days.
    *   `onScrapOrDispose(asset, newStatus, disposedBy)`: Fires when status changes to `Scrapped` or `Disposed`.

---

## 5. Data Flows

### 5.1. Asset Creation Flow
1. User submits `AssetDetailsForm`.
2. `AssetService.getNextSequenceNumber` is called to find next ID.
3. `AssetIdGenerator.generate` creates ID (e.g., IN-CHN-26-LAP-0005).
4. `FileUploadService` uploads procurement bill (if any).
5. `AssetService.addAsset` saves to `IT_Assets`.
6. History record `Created` is logged.
7. User is prompted to "Assign Now?" via dialog.

### 5.2. Assignment Flow
1. User submits `AssetAssignmentForm`.
2. `AssetAssignmentService.deactivateExisting` runs (sets `IsActive: false` on old records).
3. New record added to `Asset_Assignments` with `IsActive: true`.
4. `AssetAssignmentService._syncITAssets` updates `AssignedTo`, `AssignedToEmail`, `Department`, `AssetLocation`, `DateOfAssignment` on the matching `IT_Assets` item.
5. User is returned to the list view. Power Automate assignment notification is NOT fired here — it fires during the status change to `Active`.

### 5.3. Status Change Flow
1. User clicks "Change Status" in `AssetDetail`.
2. System validates transition via `ASSET_STATUS_TRANSITIONS` map (`IAsset.ts:75-86`).
3. `AssetService.changeStatus` updates `IT_Assets.Status` (and optionally `AssignedTo`/`AssignedToEmail` via `extraFields`).
4. History record `StatusChanged` is logged with notes.
5. Depending on new status, corresponding Power Automate webhook fires:
   - `Active` + has assignee → `onAssetAssigned`
   - `Lost` / `Stolen` → `onDeviceLostOrStolen`
   - `Scrapped` / `Disposed` → `onScrapOrDispose`

---

## 6. Model Inventory

### 6.1. IAsset (`models/IAsset.ts`)
*   **Purpose**: Full asset record shape matching IT_Assets columns.
*   **Key Types**:
    *   `AssetStatus`: `Procured | Stock | Active | Repair | Transferred | Gifted | Lost | Stolen | Scrapped | Disposed`
    *   `AssetType`: `LAP | MAC | DTP | MON | DOC | MOB | NET | ACC`
    *   `StockCondition`: `Good | Refurbished | Damaged`
*   **Constants**:
    *   `ASSET_STATUS_TRANSITIONS`: State machine defining valid status transitions.
    *   `STATUS_REQUIRES_NOTE`: Statuses that mandate a note (`Lost, Stolen, Gifted, Transferred, Disposed`).
    *   `ASSET_TYPE_LABELS`: Human-readable labels for each asset type (e.g. LAP → Laptop).
    *   `STATUS_BADGE_COLORS`: Background/text color pairs for each status badge.
    *   `DEPT_OPTIONS`: List of departments (`Engineering, Product, Design, Data Science, ...`).
    *   `LOCATION_OPTIONS`: List of locations (`Chennai - Nungambakkam, Chennai - WFH, Remote, Warehouse, Other`).

### 6.2. IAssetAssignment (`models/IAssetAssignment.ts`)
*   **Purpose**: Assignment record shape matching Asset_Assignments columns.
*   **Helper**: `emptyAssignment(assetId, assetItemId, serialNumber)` returns a default assignment with `IsActive: true`.

### 6.3. IAssetHistory (`models/IAssetHistory.ts`)
*   **Purpose**: Audit trail entry shape matching Asset_History columns.
*   **Action types**: `Created | StatusChanged | Assigned | Unassigned | Updated | DepartmentChanged | LocationChanged`

### 6.4. IRepairEntry (`models/IRepairEntry.ts`)
*   **Purpose**: Repair record shape matching Asset_Repairs columns.
*   **Helper**: `IRepairEntryDraft` — form-friendly subset (no Id/Title/AttachmentUrl/AttachmentName).
*   **Helper**: `emptyRepairDraft()` returns a blank draft.

### 6.5. IAttachment (`models/IAttachment.ts`)
*   **Purpose**: Attachment model for files in the `IT Assets` document library, and for URL-field-based attachments derived from `IT_Assets` and `Asset_Repairs` records.
*   **Fields**: `name`, `serverRelativeUrl`, `absoluteUrl`, `downloadUrl`, `category` (AttachmentCategory), `timeCreated`, `fileSize`, `previewType` (`browser` / `office` / `download`).
*   **AttachmentCategory**: `purchase | repairs | gifted | transfer | scrap | validation | photos | other`. For library files, always `'repairs'`. For URL-field-based records, category is set from the source field context.

---

## 7. File Inventory

| Path | Purpose | Key Dependencies |
| :--- | :--- | :--- |
| `ItAssetManagerWebPart.ts` | Entry point, Property Pane config | `BaseClientSideWebPart` |
| `components/ItAssetManager.tsx` | App shell, routing, state | All Services, All Components |
| `components/Dashboard.tsx` | KPI dashboard with warranty alerts | `AssetService`, `IAsset` |
| `components/AssetTable.tsx` | Filterable data grid with CSV export | `IAsset`, `AssetIdGenerator` |
| `components/AssetDetail.tsx` | 360-degree asset view | All Services, All Models |
| `components/AssetAttachmentSection.tsx` | Attachment management in detail view | `FileUploadService`, `IAttachment` |
| `components/AssetDetailsForm.tsx` | Asset create/edit form | `AssetService`, `FileUploadService`, `AssetRepairService` |
| `components/AssetAssignmentForm.tsx` | Assignment form | `AssetAssignmentService` |
| `components/AssetForm.tsx` | Legacy asset form (deprecated) | `AssetService`, `AssetIdGenerator` |
| `services/AssetService.ts` | Core business logic, SP access | `PnPJS`, `AssetIdGenerator` |
| `services/AssetAssignmentService.ts` | Assignment CRUD + IT_Assets sync | `PnPJS` |
| `services/AssetRepairService.ts` | Repair entry CRUD | `PnPJS` |
| `services/FileUploadService.ts` | Document library file mgmt | `PnPJS` |
| `services/PowerAutomateService.ts` | Webhook triggers | `fetch` |
| `utils/AssetIdGenerator.ts` | Pure logic for ID formatting & dates | `IAsset` types |
| `models/IAsset.ts` | Interfaces, state machine, constants | - |
| `models/IAssetAssignment.ts` | Interface for user tracking | - |
| `models/IAssetHistory.ts` | Interface for audit trail | - |
| `models/IRepairEntry.ts` | Interface for repair logs | - |
| `models/IAttachment.ts` | Interface for document library files | - |

---

## 8. Known Issues & Technical Debt

1.  **Denormalization Sync**: Assignment data exists in both `IT_Assets` and `Asset_Assignments`. The app syncs them via `_syncITAssets` on save, but edits made directly in SharePoint (bypassing the app) will cause drift.
2.  **List Threshold**: The Dashboard and Table use `.top(5000)`. Once the inventory exceeds 5000 items, SP list view threshold issues may occur unless indexed columns are used with more specific filters.
3.  **Webhook Reliability**: Power Automate calls are "fire and forget" via `fetch`. There is no retry logic if the webhook is down.
4.  **Legacy Code**: `AssetForm.tsx` is a partial duplicate of `AssetDetailsForm.tsx` and should be deprecated/removed to reduce bundle size.

---

## 9. AI Agent Handoff (Onboarding)

**Welcome, Agent. To work on this project, follow these rules:**

1.  **State Machine First**: Never change an asset's status via a simple `updateAsset`. Always use `AssetService.changeStatus` to ensure the audit log and Power Automate hooks are triggered.
2.  **ID Generation**: Do not allow manual entry of Asset IDs. They must strictly follow the `AssetIdGenerator` logic to maintain office-wide consistency.
3.  **Schema Updates**: If you add a column to `IAsset.ts`, you **must** also update:
    *   `AssetService.ASSET_SELECT` array.
    *   `sharepoint/assets/schema.xml` (for provisioning).
    *   `AssetDetailsForm.tsx` (for editing).
4.  **Testing**: This project uses a custom sequence number logic. When adding an asset, always verify that `getNextSequenceNumber` correctly handles prefix collisions across different countries/years.
5.  **Denormalization**: If you modify assignment logic, ensure `AssetAssignmentService._syncITAssets` is called to keep the master registry updated for the Dashboard.
