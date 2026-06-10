# IT Asset Lifecycle Manager — SPFx Web Part

SharePoint Framework 1.18.x web part for complete IT asset tracking.  
Built for **ZoomRx Chennai Office** · M365 E3 tenant · ~500 employees.

---

## Features

| View | Description |
|------|-------------|
| **Dashboard** | KPI cards (Total, Active, In Stock, In Repair, Procured, Warranty Soon, Lost/Stolen), asset-type distribution bar chart, status breakdown chips, top-8 departments, and a 90-day warranty expiry table |
| **Asset Table** | Full asset list with free-text search, filter by status / type / department, column sorting, and CSV export |
| **Asset Form** | Add / edit form with live Asset ID preview, date pickers, department & location dropdowns |
| **Asset Detail** | Full asset info card, Remarks section, status-change dialog, and scrollable audit-trail timeline |

---

## Asset ID Format

```
COUNTRY - OFFICE - YY - TYPE - NNNN
   IN   -   CHN  - 26 -  LAP - 0001
```

| Type Code | Description       |
|-----------|-------------------|
| LAP       | Laptop (Windows)  |
| MAC       | MacBook           |
| DTP       | Desktop           |
| MON       | Monitor           |
| DOC       | Docking Station   |
| MOB       | Mobile Phone      |
| NET       | Network Device    |
| ACC       | Accessory         |

---

## Status Lifecycle

```
Procured → Stock → Active → Repair ─┐
                ↘ Scrapped           ├→ Active
                              Repair ┘
Active → Transferred → Active / Stock
       → Gifted        (terminal)
       → Lost    → Active (recovered)
       → Stolen  → Active (recovered)
       → Repair  → Active / Scrapped → Disposed
```

Valid transitions (source of truth: `IAsset.ts`):

| From        | To                                          |
|-------------|---------------------------------------------|
| Procured    | Stock                                       |
| Stock       | Active, Scrapped                            |
| Active      | Repair, Transferred, Gifted, Lost, Stolen   |
| Repair      | Active, Scrapped                            |
| Transferred | Active, Stock                               |
| Lost        | Active (recovered)                          |
| Stolen      | Active (recovered)                          |
| Scrapped    | Disposed                                    |
| Gifted      | — (terminal)                                |
| Disposed    | — (terminal)                                |

> **Mandatory note required** when changing to: Lost, Stolen, Gifted, Transferred, Disposed.  
> The status-change dialog enforces this before saving.

---

## Prerequisites

| Tool         | Version       |
|--------------|---------------|
| Node.js      | 18.x LTS      |
| npm          | 9.x+          |
| SPFx         | 1.18.2        |
| Yeoman       | 4.x (for new projects) |

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure tenant URL
Edit `config/serve.json`:
```json
{
  "initialPage": "https://YOUR-TENANT.sharepoint.com/_layouts/workbench.aspx"
}
```

### 3. Trust development certificate (first time only)
```bash
gulp trust-dev-cert
```

### 4. Serve locally
```bash
gulp serve
```

---

## SharePoint List Provisioning

The solution auto-provisions two lists when deployed:

### `IT_Assets` — Primary List

| Column         | Type     | Notes                              |
|----------------|----------|------------------------------------|
| Title          | Text     | Asset ID (auto-generated, e.g. IN-CHN-26-LAP-0001) |
| SerialNumber   | Text     | Required                           |
| Model          | Text     | Required                           |
| Vendor         | Text     | Required                           |
| PONumber       | Text     |                                    |
| InvoiceNumber  | Text     |                                    |
| Cost           | Currency | INR                                |
| PurchaseDate   | DateTime | Required                           |
| WarrantyExpiry | DateTime |                                    |
| AssignedTo     | Text     |                                    |
| AssignedToEmail| Text     |                                    |
| Department     | Choice   | See preset values below            |
| AssetLocation  | Choice   | See preset values below            |
| Country        | Text     | Default: IN                        |
| OfficeCode     | Text     | Default: CHN                       |
| Status         | Choice   | See lifecycle above                |
| AssetType      | Choice   | LAP / MAC / DTP / MON / DOC / MOB / NET / ACC |
| Remarks        | Note     | Multi-line, optional               |
| SequenceNumber | Number   | Internal — used for ID generation  |

**Department presets:** Engineering, Product, Design, Data Science, Sales, Marketing, HR, Finance, Operations, Legal, IT, Management, Customer Success

**Location presets:** Chennai - Nungambakkam, Chennai - WFH, Remote, Warehouse, Other

### `Asset_History` — Audit Trail

| Column         | Type     | Notes                              |
|----------------|----------|------------------------------------|
| Title          | Text     | Asset ID (FK reference)            |
| Action         | Text     | Created / StatusChanged / etc.     |
| PreviousStatus | Text     |                                    |
| NewStatus      | Text     |                                    |
| ChangedBy      | Text     |                                    |
| ChangedByEmail | Text     |                                    |
| ChangedDate    | DateTime | ISO string                         |
| HistoryNotes   | Note     | Mandatory for sensitive transitions |

---

## Build & Deploy

```bash
# 1. Bundle for production
npm run bundle

# 2. Package the solution
npm run package
# → outputs: sharepoint/solution/it-asset-manager.sppkg

# 3. Upload to SharePoint App Catalog
#    App Catalog URL: https://YOUR-TENANT.sharepoint.com/sites/appcatalog
#    Upload it-asset-manager.sppkg → Deploy globally

# 4. Add web part to a page
#    Site Pages → Edit → Add web part → "IT Asset Manager"
```

---

## Power Automate Flow Setup

Four flows are included in `flows/`. Each follows the same pattern:

1. Open **Power Automate** → **+ New flow** → **Instant cloud flow** → **When an HTTP request is received**
2. Paste the `requestBodyJsonSchema` from the JSON file into the trigger's schema field
3. Add the notification actions (email, Teams, etc.)
4. Save the flow → **copy the HTTP POST URL**
5. Paste the URL into the SPFx web part property pane (Edit web part → gear icon)

### Flows

| File | Trigger | Purpose |
|------|---------|---------|
| `assignment-notification.json` | Asset → Active + assignee set | Email + Teams notification to recipient |
| `lost-device-alert.json` | Status → Lost or Stolen | High-priority email to IT Head + Security |
| `warranty-expiry-check.json` | Batch (90-day window) | Weekly digest or on-demand via web part |
| `scrap-ewaste-notification.json` | Status → Scrapped / Disposed | Finance + IT compliance email + E-Waste register |

> **Tip:** The warranty expiry flow also supports a **Scheduled** (Recurrence) trigger. Set it to run every Monday at 08:00 IST (02:30 UTC) and query the SharePoint list directly — no need to open the app.

---

## Web Part Property Pane

| Property | Default | Description |
|----------|---------|-------------|
| Country Code | IN | 2-letter country code for Asset ID |
| Office Code | CHN | 3-letter office code for Asset ID |
| Asset Assignment Notification | — | Power Automate HTTP trigger URL |
| Lost / Stolen Device Alert | — | Power Automate HTTP trigger URL |
| Warranty Expiry (90-day check) | — | Power Automate HTTP trigger URL |
| Scrap / E-Waste Disposal | — | Power Automate HTTP trigger URL |

---

## Project Structure

```
it-asset-tool/
├── config/
│   ├── config.json              # Bundle configuration
│   ├── package-solution.json    # SPFx solution manifest
│   └── serve.json               # Local dev server
├── sharepoint/assets/
│   ├── elements.xml             # Field definitions
│   └── schema.xml               # List instances
├── src/webparts/itAssetManager/
│   ├── ItAssetManagerWebPart.ts         # Web part entry point + property pane
│   ├── ItAssetManagerWebPart.manifest.json
│   ├── components/
│   │   ├── ItAssetManager.tsx           # Root component (view router)
│   │   ├── Dashboard.tsx                # KPI cards, type/status/dept breakdowns, warranty alerts
│   │   ├── AssetTable.tsx               # Searchable/filterable/sortable asset list + CSV export
│   │   ├── AssetForm.tsx                # Add / Edit form with live ID preview
│   │   └── AssetDetail.tsx              # Asset detail, Remarks, status-change dialog, history timeline
│   ├── models/
│   │   ├── IAsset.ts                    # Types, status transitions, badge colours
│   │   └── IAssetHistory.ts             # History entry type
│   ├── services/
│   │   ├── AssetService.ts              # PnP.js v3 CRUD + history logging
│   │   └── PowerAutomateService.ts      # Webhook triggers
│   └── utils/
│       └── AssetIdGenerator.ts          # ID generation / parsing / date utils
├── flows/
│   ├── assignment-notification.json
│   ├── lost-device-alert.json
│   ├── warranty-expiry-check.json
│   └── scrap-ewaste-notification.json
├── package.json
├── tsconfig.json
└── gulpfile.js
```

---

## Permissions Required

The site where the web part is deployed needs:
- **Read** on `IT_Assets` and `Asset_History` for all staff
- **Contribute** on both lists for IT Admins / Asset Managers
- Site Owners can deploy the `.sppkg` from the App Catalog

Set list permissions via: **List Settings → Permissions for this list**

---

## M365 E3 Compatibility Notes

- No premium Power Platform licence required — HTTP webhook triggers are included in M365 E3
- PnP.js v3 uses SharePoint REST API (no Graph premium scope needed)
- Fluent UI v8 is bundled with SPFx 1.18 — no extra CDN load
- The `isDomainIsolated: false` setting in `package-solution.json` is correct for standard M365 E3 tenants
