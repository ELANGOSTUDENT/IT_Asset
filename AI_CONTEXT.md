# AI Context — IT Asset Lifecycle Manager

This file serves as a high-signal overview of the **IT Asset Lifecycle Manager** SPFx project. It is designed to provide immediate technical context to AI assistants or developers starting a new session on this repository, avoiding the need to re-scan the entire codebase.

---

## 1. Project Purpose
An internal IT asset tracking application built specifically for **ZoomRx Chennai Office** (serving ~500 employees). Operates on a standard **M365 E3 tenant**, avoiding premium Power Platform license requirements by leveraging HTTP request triggers in Power Automate and standard SharePoint REST APIs through PnP.js.

* **UAT Site relative URL:** `/sites/IT-Tech`
* **Target Pages:** `IT-Asset-UAT.aspx`
* **Location Scope:** `IN` (India) & `CHN` (Chennai)

---

## 2. Technical Architecture Summary
* **Platform:** SharePoint Framework (SPFx) v1.18.2
* **Component View Engine:** React v17.0.1 (TypeScript)
* **Design Pattern:** SPA orchestrated by a root router/view-switcher component (`ItAssetManager.tsx`).
* **Design Library:** Fluent UI React v8
* **API Broker:** PnP.js v3 (`@pnp/sp`) communicating with SharePoint list endpoints.
* **Integrations:** Power Automate HTTP Webhooks (`PowerAutomateService.ts`).

---

## 3. SharePoint Schema Summary

Declaratively provisioned via standard elements XML bindings (`elements.xml`).

### List: `IT_Assets`
Primary asset records store.
* **Title:** Repurposed as Unique Asset ID (`COUNTRY-OFFICE-YY-TYPE-NNNN`, e.g., `IN-CHN-26-LAP-0001`).
* **SerialNumber:** Required string.
* **Model / Vendor:** Required string.
* **PONumber / InvoiceNumber:** Optional string.
* **Cost:** Original price in INR (Currency).
* **PurchaseDate / WarrantyExpiry:** DateOnly fields.
* **AssignedTo / AssignedToEmail:** Details of current owner.
* **Department / AssetLocation:** Metadata tags.
* **Country / OfficeCode:** Default values `IN` / `CHN`.
* **Status:** Choice mapping (Procured, Validation, Stock, Active, Repair, Transferred, Gifted, Lost, Stolen, Scrapped, Disposed).
* **AssetType:** Choice (LAP, MAC, DTP, MON, DOC, MOB, NET, ACC).
* **SequenceNumber\_New:** Counter for generating sequential IDs per prefix.
* **ReceivedDate / ReceivedBy:** Receiving intake fields.
* **ValidationStatus:** Choice (Pending, Validated, Rejected).
* **PhysicalCondition:** Choice (New, Good, Damaged).
* **ValidationComments / ValidationDate / ValidatedBy:** Validation audit fields.

### List: `Asset_Repairs`
Tracks repair history with two repair types (In Warranty Replacement / Out Of Warranty Repair).
* **Title:** Foreign key matching parent `IT_Assets` Asset ID.
* **AssetItemId:** Numeric ID of the parent IT_Assets item.
* **SerialNumber:** Snapshot at time of repair.
* **RepairType:** Choice — `In Warranty Replacement` or `Out Of Warranty Repair`.
* **RepairDate / RepairVendor / IssueDescription:** Core repair metadata.
* **RepairCost / RepairInvoiceNumber:** Out-of-warranty fields (Currency, Text).
* **WarrantyCaseNumber / ReplacementSerialNumber:** In-warranty fields (Text).
* **AttachmentUrl / AttachmentName:** Link to file in `AssetAttachments/{AssetID}/repairs/`.
* **RepairRemarks:** Multi-line notes.
* **CreatedBy / CreatedDate:** Operator metadata.

### List: `Asset_Assignments`
Tracks assignment history with current-snapshot sync to `IT_Assets`.
* **Title:** Foreign key matching parent `IT_Assets` Asset ID.
* **AssetItemId:** Numeric ID of the parent IT_Assets item.
* **SerialNumber:** Snapshot of serial at time of assignment.
* **AssignedTo / AssignedToEmail:** Assignee details.
* **Department / AssetLocation:** Assignment context.
* **DateOfAssignment:** DateOnly field.
* **AssignmentRemarks:** Multi-line notes.
* **IsActive:** Boolean — only one per asset is active at a time.
* **Snapshot on IT_Assets:** Fields `AssignedTo`, `AssignedToEmail`, `Department`, `AssetLocation`, `DateOfAssignment` are synced on each assignment save.

### List: `Asset_History`
Immutable audit log ledger.
* **Title:** Foreign key matching parent `IT_Assets` Asset ID.
* **Action:** Type of log (e.g., `Created`, `StatusChanged`).
* **PreviousStatus / NewStatus:** State snapshot tracker.
* **ChangedBy / ChangedByEmail:** Operator details.
* **ChangedDate:** ISO DateTime string.
* **HistoryNotes:** Remarks summarizing the justification for changes.

### Document Library: `IT Assets`
Document-based attachment storage organized by category. Only repair reports use a per-asset subfolder.
* **Folder structure:**
  - `IT Assets/Purchase Invoices/` → URL stored in `IT_Assets.PurchaseBillUrl`
  - `IT Assets/Product Photos/`
  - `IT Assets/Validation Reports/`
  - `IT Assets/Transfer Documents/` → URL stored in `IT_Assets.TransferAttachmentUrl`
  - `IT Assets/Gift Documents/` → URL stored in `IT_Assets.GiftedAttachmentUrl`
  - `IT Assets/Scrap Documents/` → URL stored in `IT_Assets.ScrapAttachmentUrl`
  - `IT Assets/Repair Reports/{AssetID}/` → URL stored in `Asset_Repairs.AttachmentUrl`
  - `IT Assets/Other/`
* **Do NOT use:** `AssetAttachments/{AssetId}/category/` — deprecated and removed.
* Managed at runtime by `FileUploadService.ts`.

---

## 4. Main React Components

Located under `src/webparts/itAssetManager/components/`:
* **`ItAssetManager.tsx`:** Global root manager. Runs the React view router, caches lists, displays notifications, and orchestrates async state transition updates.
* **`Dashboard.tsx`:** Renders KPI cards (Totals, Active, Stock, Repair, Procured, Expiry counts), distribution graphs, and lists the 90-day active warranties.
* **`AssetTable.tsx`:** Displays the inventory list with search capability and drop-down filters for status and type.
* **`AssetForm.tsx`:** Add/Edit form. Implements validation and previews sequential Asset IDs during creation.
* **`AssetDetail.tsx`:** Shows full asset specification, sequential timeline of history fetched from `Asset_History`, dynamic assignment card loaded from `Asset_Assignments`, attachment browser (`AssetAttachmentSection`), and triggers state transitions.
* **`AssetAttachmentSection.tsx`:** Attachment management card rendered inside AssetDetail's right panel. Lists all files for the asset (sorted by TimeCreated DESC) with type-aware preview (browser/office/download), multi-file upload with category selection, and delete with recycle bin confirmation.
* **`AssetAssignmentForm.tsx`:** Dialog for creating/editing asset assignments with Fluent UI controls and validation.
* **`AssetRepairForm.tsx`:** Dialog for logging/editing repairs with type-conditional fields (In Warranty Replacement / Out Of Warranty Repair) and file attachment.

---

## 5. Main Services

Located under `src/webparts/itAssetManager/services/`:
* **`AssetService.ts`:**
  - Standard CRUD.
  - Generates next sequence number per type/prefix by performing a `startswith` prefix query on `IT_Assets` and returning `Max(SequenceNumber) + 1`.
  - Aggregates status, type, department, and warranty-expiration stats in memory.
  - Standardizes status updates and logging actions.
* **`AssetRepairService.ts`:**
  - Manages repair records in the `Asset_Repairs` SharePoint list.
  - `getRepairs(assetId)`: Returns all repairs for an asset, newest first.
  - `addRepair(data)`: Creates a new repair record.
  - `updateRepair(id, changes)`: Updates an existing repair record.
  - `deleteRepair(id)`: Recycles a repair record.
  - Attachments stored in `AssetAttachments/{AssetID}/repairs/` via `FileUploadService`.
* **`AssetAssignmentService.ts`:**
  - Manages assignment records in the `Asset_Assignments` SharePoint list.
  - `getActiveAssignment(assetId)`: Returns the single active assignment (`IsActive eq 1`) or null.
  - `getAllAssignments(assetId)`: Returns full history sorted by date descending.
  - `addAssignment(data)`: Creates a new assignment record.
  - `deactivateExisting(assetId)`: Sets `IsActive = false` on the current active assignment.
  - Works in tandem with `AssetService.updateAssetAssignmentSnapshot()` for the dual-write pattern.
* **`FileUploadService.ts`:**
  - Manages file uploads to the `IT Assets` document library (flat category-folder structure).
  - `upload(assetId, sub, file)`: Uploads a file to `IT Assets/{CategoryFolder}/` (or `IT Assets/Repair Reports/{assetId}/` for repairs). Returns `IUploadResult` with `serverRelativeUrl`, `absoluteUrl`, and `fileName`.
  - `ensureFolder(assetId, sub)`: Creates category folder if needed; additionally creates `Repair Reports/{assetId}` subfolder for repair uploads.
  - `listFiles(assetId)`: Queries `IT Assets/Repair Reports/{assetId}/` for repair files only. Non-repair attachments are discovered from URL fields on the `IT_Assets` record. Returns `IAttachment[]`.
  - `getFilesByCategory(assetId)`: Groups `listFiles()` result by category.
  - `deleteFile(serverRelativeUrl)`: Recycles a file to the SharePoint recycle bin.
  - `getAbsoluteUrl(serverRelativeUrl)`: Converts a server-relative URL to an absolute URL.
  - `_getPreviewType()`: Maps file extension to `browser` (PDF/images/text/CSV), `office` (DOCX/XLSX/PPTX), or `download` (ZIP/unsupported).
* **`PowerAutomateService.ts`:**
  - Dispatches non-blocking async POST JSON payloads to standard HTTP hook receivers mapped in the web part property pane.
  - Events: `AssetAssigned`, `DeviceLost`, `DeviceStolen`, `WarrantyExpirySoon`, `AssetScrapped`, `AssetDisposed`.

---

## 6. Deployment Process
1. Build & Bundle: `npm run bundle` (Gulp bundler in production ship mode).
2. Package: `npm run package` (compiles and packages into `sharepoint/solution/it-asset-manager.sppkg`).
3. Deploy: Upload the `.sppkg` package file to the SharePoint App Catalog site, ensuring feature definitions are deployed.
4. Setup: Open the target page `IT-Asset-UAT.aspx`, edit, add the "IT Asset Manager" web part, configure country/office variables, and paste the respective webhook URLs in the properties pane.

---

## 7. Development Rules & Guidelines
* **State Machine Integrity:** Always enforce `ASSET_STATUS_TRANSITIONS` constraints defined in `src/webparts/itAssetManager/models/IAsset.ts`. Never allow direct state modification without documenting change reasons via history comments. The lifecycle is: `Procured → Validation → Stock → Active → Repair/Transferred/Gifted/Lost/Stolen → Scrapped → Disposed`.
* **No Supression Hacks:** Never use `@ts-ignore`, linter suppressions, prototype clones, or custom reflection. Maintain structural type-safety.
* **PnPjs Guidelines:** Rely exclusively on PnPjs v3 syntax. Always use clean selectors to fetch only required fields (e.g. `ASSET_SELECT` bounds).
* **Version Alignment:** When updating business logic or schemas, ensure both NPM `package.json` version and SPFx solution manifest versions inside `config/package-solution.json` (solution & features) are bumped in unison.
* **Assignment Dual-Write Pattern:** Assignment data is stored in two places — full history in `Asset_Assignments` (`IAssetAssignment`) and current snapshot on `IT_Assets` (`IAsset.AssignedTo`, `AssignedToEmail`, `Department`, `AssetLocation`, `DateOfAssignment`). Always use `AssetAssignmentService` for history operations and `AssetService.updateAssetAssignmentSnapshot()` for snapshot updates. The `handleAssignmentSave` pipeline in `ItAssetManager.tsx` orchestrates both writes atomically.
