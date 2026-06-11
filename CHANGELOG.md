# Changelog

All changes to this project are documented here.

**How to add a new entry:**
1. Copy the template block at the bottom of this file
2. Fill in the version, date, and what changed
3. Use **Added** for new features, **Changed** for updates to existing things, **Fixed** for bug fixes, **Removed** for deleted features

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
