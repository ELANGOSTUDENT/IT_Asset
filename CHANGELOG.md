# Changelog

All changes to this project are documented here.

**How to add a new entry:**
1. Copy the template block at the bottom of this file
2. Fill in the version, date, and what changed
3. Use **Added** for new features, **Changed** for updates to existing things, **Fixed** for bug fixes, **Removed** for deleted features

---

## [v2.0.0] — 2026-06-12

### Added
- `models/IGiftedAsset.ts` — New model: `Title`, `AssetItemId`, `GiftedTo`, `GiftedDate`, `GiftAttachmentUrl`, `GiftRemarks`. Gifted data is now a separate `Asset_Gifted` list record instead of inline fields on `IT_Assets`.
- `models/IScrapAsset.ts` — New model: `Title`, `AssetItemId`, `ScrapDate`, `ScrapVendor`, `ScrapAmount`, `ScrapAttachmentUrl`, `ScrapRemarks`. Scrap/disposal data is now a separate `Asset_Scrap` list record.
- `services/AssetGiftedService.ts` — New service: `getGiftedByAsset()`, `addGifted()`, `updateGifted()` against `Asset_Gifted` list.
- `services/AssetScrapService.ts` — New service: `getScrapByAsset()`, `addScrap()`, `updateScrap()` against `Asset_Scrap` list.
- `AssetDetail.tsx` — Gifted card now loads live from `Asset_Gifted` (with Add/Edit dialog). Scrap card now loads live from `Asset_Scrap` (with Add/Edit dialog).
- `IRepairEntry.ts` — Added `Resolution` and `Remarks` fields. Repair dialog in `AssetDetailsForm` now includes Resolution and Remarks inputs.

### Changed
- `models/IAsset.ts` — Removed 21 fields that are no longer in `IT_Assets`: `PurchaseBillName`, stock-condition fields (`DateAddedToStock`, `ConditionAtStockEntry`, `StockRemarks`), inline gifted fields (`GiftedTo`, `GiftedDate`, `GiftedAuthorisedBy`, `GiftedRemarks`, `GiftedAttachmentUrl`), all transfer fields (`TransferredFrom`, `TransferredTo`, `TransferDate`, `TransferReason`, `TransferAttachmentUrl`), and inline scrap fields (`ScrapDate`, `ScrapVendor`, `ScrapInvoiceNumber`, `ScrapPONumber`, `ScrapAmount`, `EWasteCertNumber`, `ScrapAttachmentUrl`). Removed `StockCondition` type.
- `models/IAsset.ts` — Removed `Transferred` from `AssetStatus` union, `ASSET_STATUS_TRANSITIONS`, `STATUS_REQUIRES_NOTE`, and `STATUS_BADGE_COLORS`. `Active` can no longer transition to `Transferred`.
- `models/IAssetAssignment.ts` — Removed `SerialNumber` and `MaintenanceNotes`. `emptyAssignment()` no longer takes a `serialNumber` parameter.
- `models/IRepairEntry.ts` — Removed `RepairInvoiceNumber` and `AttachmentName`. Added `Resolution` and `Remarks`.
- `models/IAssetHistory.ts` — Renamed `ChangedDate` → `ChangeDate`. Removed `Action`, `ChangedByEmail`, and `HistoryAction` type. Added `AssetItemId`.
- `models/IAttachment.ts` — Removed `'transfer'` from `AttachmentCategory` union.
- `services/AssetService.ts` — `ASSET_SELECT` trimmed to match new `IT_Assets` schema (removed all dropped fields). `changeStatus()` and `_logHistory()` now write `AssetItemId` and `ChangeDate` instead of `Action`, `ChangedByEmail`, `ChangedDate`. History queries updated to `orderBy('ChangeDate')`.
- `services/AssetAssignmentService.ts` — `SELECT` array updated: removed `SerialNumber` and `MaintenanceNotes`.
- `services/AssetRepairService.ts` — `SELECT` array updated: removed `RepairInvoiceNumber` and `AttachmentName`, added `Resolution` and `Remarks`.
- `services/FileUploadService.ts` — Removed `'transfer': 'Transfer Documents'` from `CATEGORY_FOLDER`.
- `components/AssetDetailsForm.tsx` — Removed Stock / In-Store Details section, Transfer of Ownership section, inline Gifted Details section, and inline Scrap / Disposal section. Removed file staging for gifted/transfer/scrap files. Repair dialog updated: removed Invoice Number field, added Resolution and Remarks fields.
- `components/AssetDetail.tsx` — Removed Stock card, Transfer card. Gifted and Scrap cards now load data from their dedicated lists via `giftedService`/`scrapService` props. History timeline uses `ChangeDate` (renamed) and derives status-change vs. created from `PreviousStatus`/`NewStatus` presence (no longer relies on removed `Action` field). Maintenance section shows `Remarks` instead of removed `MaintenanceNotes`.
- `components/AssetAttachmentSection.tsx` — `urlAttachments` memo now only surfaces `PurchaseBillUrl` (removed `GiftedAttachmentUrl`, `TransferAttachmentUrl`, `ScrapAttachmentUrl` — those attachments now live on their respective list records). Upload dialog no longer includes `Transfer Document` category option.
- `components/AssetAssignmentForm.tsx` — Removed `SerialNumber` auto-fill effect. Removed Maintenance Notes field. Maintenance Schedule section shows date fields only.
- `components/ItAssetManager.tsx` — Instantiates `AssetGiftedService` and `AssetScrapService`; passes both to `AssetDetail`. `handleStatusChange` no longer passes `changedByEmail` (removed from `changeStatus` signature).

### Removed
- All references to `Asset_Transfers` list — transfer functionality has been removed entirely from the schema and the application.

---

## [v1.0.1] — 2026-06-03

### Changed
- `README.md` — Fixed status lifecycle diagram: removed incorrect `Active → Scrapped` path. Correct paths are `Stock → Scrapped` and `Repair → Scrapped` (matches `ASSET_STATUS_TRANSITIONS` in `IAsset.ts`)
- `README.md` — Added Features table at the top summarising all four views (Dashboard, Asset Table, Asset Form, Asset Detail)
- `README.md` — Documented mandatory history notes requirement: Lost, Stolen, Gifted, Transferred, Disposed all require a note before the status change is saved
- `README.md` — Added Department preset values: Engineering, Product, Design, Data Science, Sales, Marketing, HR, Finance, Operations, Legal, IT, Management, Customer Success
- `README.md` — Added Location preset values: Chennai - Nungambakkam, Chennai - WFH, Remote, Warehouse, Other
- `README.md` — Updated component descriptions in the Project Structure section to reflect actual behaviour

---

## [v1.0.0] — 2026-06-01 · Initial Release

### Added

#### Dashboard (`Dashboard.tsx`)
- KPI cards row: Total Assets, Active, In Stock, In Repair, Procured, Warranty Soon
- Lost / Stolen alert card (shown only when count > 0)
- Asset Type Distribution — horizontal bar chart sorted by count
- Status Breakdown — coloured status chips with counts
- Top Departments — up to 8 departments ranked by asset count
- 90-day Warranty Expiry table — clickable rows, days-left coloured red/orange/green
- Shimmer loading state while stats are fetched

#### Asset Table (`AssetTable.tsx`)
- Full asset list loaded from `IT_Assets` SharePoint list (up to 5,000 items)
- Free-text search across Asset ID, Serial Number, Model, Vendor, Assigned To
- Filter dropdowns: Status, Asset Type, Department
- Column sorting (click column header to toggle asc/desc)
- Status badges with colour coding
- CSV export button (downloads all visible/filtered rows)
- Add New Asset and Refresh buttons in the command bar

#### Asset Form (`AssetForm.tsx`)
- Add mode: live Asset ID preview updates as you select Type / Country / Office
- Edit mode: all fields pre-filled; Asset ID and Type locked
- Required field validation: Serial Number, Model, Vendor, Asset Type, Purchase Date
- Department dropdown with 13 preset options
- Location dropdown: Chennai - Nungambakkam, Chennai - WFH, Remote, Warehouse, Other
- Initial status limited to Procured or Stock when adding a new asset
- Remarks (multi-line, optional)

#### Asset Detail (`AssetDetail.tsx`)
- Four info cards: Classification, Hardware, Procurement, Assignment
- Remarks card (shown only when Remarks field has content)
- Warranty expiry banner: warning (≤90 days) or error (expired) with days remaining
- Cost displayed in Indian Rupee format (₹ with en-IN locale)
- Change Status button (hidden when no valid transitions exist for current status)
- Status Change dialog: dropdown shows only valid next states, notes field mandatory for sensitive transitions
- Change History timeline (right panel): action icon, status arrows, changed-by, date, notes
- History entries sorted newest-first, up to 200 entries

#### Status Lifecycle (`IAsset.ts`)
- 10 statuses: Procured, Stock, Active, Repair, Transferred, Gifted, Lost, Stolen, Scrapped, Disposed
- Enforced transition map — only allowed next states shown in the dropdown
- Terminal states: Gifted, Disposed (no further transitions)
- Mandatory note enforcement for: Lost, Stolen, Gifted, Transferred, Disposed

#### Asset Service (`AssetService.ts`)
- PnP.js v3 CRUD against `IT_Assets` SharePoint list
- Auto-generates Asset ID on create using next sequence number (per type + office prefix)
- Logs a history entry on every create and status change
- `getDashboardStats()` — aggregates counts by status, type, department + warranty expiring soon
- `getWarrantyExpiring(days)` — filters Active assets with warranty expiry within N days
- `getRecentHistory(limit)` — fetches latest history entries across all assets
- `searchUsers(query)` — searches SharePoint site users by name or email (people picker support)
- `deleteAsset()` — sends to SharePoint Recycle Bin (recoverable), not permanent delete

#### Asset ID Generator (`AssetIdGenerator.ts`)
- Format: `COUNTRY-OFFICE-YY-TYPE-NNNN` (e.g. `IN-CHN-26-LAP-0001`)
- `generate()` — builds ID from parts
- `getPrefix()` — returns the prefix used to query the next sequence number
- `daysUntilWarrantyExpiry()` — returns signed integer (negative = expired)
- `formatDate()` — formats ISO date strings for display

#### Power Automate Flows (`flows/`)
- `assignment-notification.json` — triggers on Active status + assignee set; sends email + Teams message to recipient
- `lost-device-alert.json` — triggers on Lost or Stolen; high-priority alert to IT Head and Security
- `warranty-expiry-check.json` — batch check for assets expiring within 90 days; supports scheduled (weekly Monday 08:00 IST) or on-demand trigger
- `scrap-ewaste-notification.json` — triggers on Scrapped or Disposed; notifies Finance + IT compliance, updates E-Waste register

#### SharePoint Provisioning
- `IT_Assets` list with all required columns (see README for full schema)
- `Asset_History` list for full audit trail
- `SequenceNumber` column used internally for collision-free ID generation

#### Web Part Property Pane (`ItAssetManagerWebPart.ts`)
- Group 1 — Office Configuration: Country Code (default: IN), Office Code (default: CHN)
- Group 2 — Power Automate Webhooks: four HTTP trigger URL fields (assignment, lost/stolen, warranty, scrap/e-waste)
- Dark theme support via `onThemeChanged` — sets CSS custom properties `--bodyText`, `--link`, `--linkHovered`

---

## [v1.9.1] — 2026-06-11

### Fixed
- `AssetAssignmentService.ts` — Changed field reference from `AssignmentRemarks` to `Remarks` to match deployed Asset_Assignments list schema
- `FileUploadService.ts` — Changed field reference from `TimeCreated` to `Created` for document library item queries
- `AssetService.ts` — Removed invalid `Action` field from history item selects; made `Action` optional in `IAssetHistory` model with `'Updated'` fallback display
- `IAssetAssignment.ts` — Renamed `AssignmentRemarks` to `Remarks` to match deployed list schema

---

## [v1.10.3] — 2026-06-12

### Fixed
- `AssetAssignmentService.ts` — `updateAssignment()` now calls `stripMetadata()` before `.update()`. The edit-assignment path initialises form state from `{ ...existingAssignment }` (a fetched SharePoint item), so without this fix any edit-assignment save would throw `InvalidClientQueryException` the same way WarrantyExpiry did.
- `AssetRepairService.ts` — `updateRepair()` now calls `stripMetadata()` before `.update()`. The method was not yet wired to a UI, but would have failed on first use.

### Changed
- `utils/SharePointUtils.ts` — **New file.** Extracted `stripMetadata()` and the `STRIP_ON_UPDATE` blocklist from `AssetService.ts` into a shared utility module so all three services (`AssetService`, `AssetAssignmentService`, `AssetRepairService`) import the same implementation. Eliminates the risk of one service being updated without the others.
- `AssetService.ts` — Removed the local copy of `stripMetadata` / `STRIP_ON_UPDATE`; now imports from `utils/SharePointUtils.ts`.

---

## [v1.10.2] — 2026-06-12

### Fixed
- `AssetService.ts` — `updateAsset()` now strips OData annotations (`@odata.*`, `odata.*`), `__*` fields, and SharePoint system-managed columns (`Id`, `Title`, `Created`, `Modified`, `Author`, `Editor`, `SequenceNumber`, etc.) from the PATCH payload before calling `.update()`. This resolves `InvalidClientQueryException: A relative URI value Web/Lists(...)/Items(...) was specified in the payload` when saving WarrantyExpiry or any other field from an asset that was fetched and spread into the form state.
- `AssetService.ts` — `getAssets()` now uses `.select(...ASSET_SELECT)` — prevents OData envelope fields from entering the `IAsset` objects in the first place (source-level fix; `stripMetadata` in `updateAsset` remains as a defensive safety net).
- `AssetService.ts` — `getAssetById()` now uses `.select(...ASSET_SELECT)` for the same reason.

---

## [v1.10.1] — 2026-06-12

### Fixed
- `FileUploadService.ts` — Removed dependency on deprecated `AssetAttachments/{AssetId}/category/` folder structure. Library target changed from `AssetAttachments` to `IT Assets`. Folder mapping now follows the approved flat structure: `Purchase Invoices`, `Product Photos`, `Validation Reports`, `Transfer Documents`, `Gift Documents`, `Scrap Documents`, and `Repair Reports/{AssetId}/` (only repairs retain a per-asset subfolder). This resolves the `"AssetAttachments/IN-CHN-26-LAP-0002/purchase not found"` upload error.
- `FileUploadService.ts` — `listFiles(assetId)` now queries only `IT Assets/Repair Reports/{assetId}/`, since non-repair attachment URLs are stored as fields on the `IT_Assets` record. Errors during the query now return an empty array instead of propagating (graceful degradation).
- `FileUploadService.ts` — `IUploadResult` now includes `absoluteUrl` alongside `serverRelativeUrl`.
- `FileUploadService.ts` — `ensureFolder` creates the category folder first, then the per-asset subfolder for repairs (two-step creation required because SharePoint does not create parent folders recursively).
- `AssetDetailsForm.tsx` — Repair file upload sub-path changed from `repairs/${Date.now()}` (invalid path) to `'repairs'` (valid `AttachmentCategory`). Filename is prefixed with `Date.now()` to prevent collisions in the shared `Repair Reports/{assetId}/` folder. Original filename is preserved in `AttachmentName`.
- `AssetDetailsForm.tsx` — `maybeUpload` helper now typed with `AttachmentCategory` instead of `string`.
- `AssetAttachmentSection.tsx` — Redesigned to show attachments from three sources: (1) URL fields on the `IT_Assets` record (`PurchaseBillUrl`, `GiftedAttachmentUrl`, `TransferAttachmentUrl`, `ScrapAttachmentUrl`), (2) `AttachmentUrl` fields on `Asset_Repairs` list entries, (3) files fetched from `IT Assets/Repair Reports/{assetId}/` in the document library. Duplicate URLs are de-duplicated. Delete is restricted to library-sourced files; URL-field attachments are managed via the Edit Asset form.
- `AssetDetail.tsx` — `AssetAttachmentSection` now receives `asset` and `repairs` props required by the redesigned component.

### Changed
- `AssetAttachmentSection.tsx` — Props updated: added `asset: IAsset` and `repairs: IRepairEntry[]`. Upload dialog default category changed from `other` to `repairs`.
- `AssetAttachmentSection.tsx` — Category badge labels now use human-readable names (e.g., "Purchase Invoice" instead of "purchase").

---

## Template — copy this block for every new change

```
## [v1.x.x] — YYYY-MM-DD

### Added
- 

### Changed
- 

### Fixed
- 

### Removed
- 
```

> Delete any section (Added / Changed / Fixed / Removed) that has no entries for that release.
