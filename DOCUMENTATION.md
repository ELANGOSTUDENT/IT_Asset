# IT Asset Lifecycle Manager — Project Documentation

**Client:** ZoomRx Chennai Office  
**Platform:** Microsoft SharePoint (SPFx Web Part)  
**Built for:** ~500 employees · M365 E3 tenant  
**Last updated:** 2026-06-03

---

## Table of Contents

1. [What This Tool Does](#1-what-this-tool-does)
2. [How It Is Built — Architecture](#2-how-it-is-built--architecture)
3. [Navigation — How Screens Connect](#3-navigation--how-screens-connect)
4. [Screen 1: Dashboard](#4-screen-1-dashboard)
5. [Screen 2: All Assets (Asset Table)](#5-screen-2-all-assets-asset-table)
6. [Screen 3: Add / Edit Asset (Asset Form)](#6-screen-3-add--edit-asset-asset-form)
7. [Screen 4: Asset Detail](#7-screen-4-asset-detail)
8. [Asset ID — How It Is Generated](#8-asset-id--how-it-is-generated)
9. [Status Lifecycle — All Stages Explained](#9-status-lifecycle--all-stages-explained)
10. [Audit Trail — Change History](#10-audit-trail--change-history)
11. [Automated Notifications — Power Automate Flows](#11-automated-notifications--power-automate-flows)
12. [Data Storage — SharePoint Lists](#12-data-storage--sharepoint-lists)
13. [Web Part Settings (Property Pane)](#13-web-part-settings-property-pane)
14. [Permissions — Who Can Do What](#14-permissions--who-can-do-what)
15. [Change Log](#15-change-log)

---

## 1. What This Tool Does

The IT Asset Lifecycle Manager is a SharePoint web part that gives the ZoomRx IT team one place to:

- **Track every physical IT asset** — laptops, MacBooks, desktops, monitors, phones, accessories, network devices, and docking stations
- **Manage the full lifecycle** of each asset from the moment it is purchased (Procured) until it is disposed (Disposed)
- **See who has what** — every asset knows who it is assigned to, which department, and where it is located
- **Get notified automatically** when assets are assigned, lost, stolen, or approaching warranty expiry
- **Maintain a complete audit trail** — every status change, who made it, and why is permanently recorded
- **Export data** to Excel/CSV for reporting

Everything is stored inside the company's own SharePoint site. No external database or third-party tool is needed.

---

## 2. How It Is Built — Architecture

```
┌─────────────────────────────────────────────────────┐
│               SharePoint Page                        │
│  ┌──────────────────────────────────────────────┐   │
│  │        IT Asset Manager (SPFx Web Part)       │   │
│  │                                              │   │
│  │  Dashboard │ Asset Table │ Asset Form │      │   │
│  │            │             │ Asset Detail       │   │
│  └────────────────────┬─────────────────────────┘   │
│                       │ PnP.js (REST API)             │
│  ┌────────────────────▼─────────────────────────┐   │
│  │  SharePoint Lists                             │   │
│  │  • IT_Assets (main data)                      │   │
│  │  • Asset_History (audit trail)                │   │
│  └────────────────────┬─────────────────────────┘   │
│                       │ HTTP Webhook (on events)      │
│  ┌────────────────────▼─────────────────────────┐   │
│  │  Power Automate Flows                         │   │
│  │  • Assignment Notification                    │   │
│  │  • Lost / Stolen Alert                        │   │
│  │  • Warranty Expiry Check                      │   │
│  │  • Scrap / E-Waste Disposal                   │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend UI | SPFx 1.18 + React + Fluent UI v8 | The screens the user sees and interacts with |
| Data Access | PnP.js v3 (SharePoint REST API) | Reads and writes to SharePoint lists |
| Data Storage | SharePoint Lists (IT_Assets, Asset_History) | Stores all asset data and history |
| Notifications | Power Automate (HTTP Webhooks) | Sends emails and Teams messages on key events |

**No premium licences required.** Everything runs on a standard M365 E3 licence.

---

## 3. Navigation — How Screens Connect

When a user opens the page, the tool loads automatically and shows the **Dashboard** by default.

```
App loads → Dashboard (default)
               │
               ├── Tab: "All Assets" ──→ Asset Table
               │                              │
               │                              ├── "Add New Asset" ──→ Asset Form (Add mode)
               │                              │                              │
               │                              │                              └── Save ──→ Asset Table
               │                              │
               │                              ├── Click asset row ──→ Asset Detail
               │                              │                              │
               │                              │                              ├── "Edit Asset" ──→ Asset Form (Edit mode)
               │                              │                              │                          │
               │                              │                              │                          └── Save ──→ back to Detail
               │                              │                              │
               │                              │                              └── "Change Status" ──→ Dialog (inline)
               │                              │
               │                              └── Click row in Warranty Table ──→ Asset Detail
               │
               └── "View All Assets" button ──→ Asset Table
```

The header always shows **"IT Asset Lifecycle Manager · Chennai Office · India"** and a live count of total assets.

---

## 4. Screen 1: Dashboard

The Dashboard is the home screen. It gives the IT team a quick health-check view of all assets without needing to scroll through a list.

### 4.1 KPI Cards (Top Row)

Each card shows a number with a coloured top border and icon.

| Card | What It Shows | Colour |
|------|--------------|--------|
| Total Assets | Count of all assets in the system | Blue |
| Active | Assets currently assigned and in use | Green |
| In Stock | Assets available and ready to assign | Blue |
| In Repair | Assets currently being repaired | Orange |
| Procured | Assets just purchased, not yet moved to stock | Purple |
| Warranty Soon | Assets whose warranty expires within 90 days | Orange |
| Lost / Stolen | Assets marked as Lost or Stolen (only shown if count > 0) | Red |

> **Note for client:** The Warranty Soon and Lost/Stolen counts are real-time — they update every time the Dashboard loads.

### 4.2 Three Breakdown Panels (Middle Section)

**Panel 1 — Asset Type Distribution**  
A horizontal bar chart showing how many assets of each type exist.  
Example: Laptops: 120 ████████ 48%, MacBooks: 60 ████ 24%, Monitors: 40 ███ 16%

**Panel 2 — Status Breakdown**  
Coloured chips showing the count of assets in each status (Active, Stock, Repair, etc.)

**Panel 3 — Top Departments**  
A ranked list of the top 8 departments by number of assets assigned. Shows department name and count.  
Example: Engineering 85, Data Science 42, Product 30 …

### 4.3 Warranty Expiring Within 90 Days (Bottom Table)

This table only appears if there are assets whose warranty will expire within 90 days.

| Column | What It Shows |
|--------|--------------|
| Asset ID | The unique ID (e.g. IN-CHN-26-LAP-0001) — click to open Asset Detail |
| Model | The device model name |
| Assigned To | Name of the person using it |
| Department | Their department |
| Expiry Date | The warranty expiry date |
| Days Left | Number of days remaining — **red** if ≤30, **orange** if ≤60, **green** if ≤90 |

> Each row is clickable — clicking opens the Asset Detail screen for that asset.

### 4.4 "View All Assets" Button

A button at the bottom of the Dashboard takes the user to the Asset Table.

---

## 5. Screen 2: All Assets (Asset Table)

This screen shows every asset in the system as a searchable, filterable list.

### 5.1 Filters and Search (Top Bar)

| Control | What It Does |
|---------|-------------|
| Search box | Searches across: Asset ID, Serial Number, Model, Vendor, Assigned To name |
| Status dropdown | Filter to show only assets with a specific status |
| Type dropdown | Filter to show only a specific device type (LAP, MAC, DTP, etc.) |
| Department dropdown | Filter to show only assets belonging to a specific department |

All filters work together — for example, you can show only Active Laptops in the Engineering department.

### 5.2 Table Columns

| Column | Description |
|--------|-------------|
| Asset ID | Unique identifier — click to open Asset Detail |
| Serial Number | Physical serial number of the device |
| Model | Device model name |
| Vendor | Supplier/brand name |
| Type | Device type code (LAP, MAC, DTP, etc.) |
| Status | Current status shown as a coloured badge |
| Assigned To | Name of the person it is assigned to |
| Department | Department of the assignee |
| Location | Physical location (e.g. Chennai - Nungambakkam) |
| Purchase Date | Date the asset was purchased |
| Warranty Expiry | Date the warranty expires |
| Cost (INR) | Purchase cost in Indian Rupees |
| Remarks | Any freeform notes about the asset |

Click any column header to sort by that column (click again to reverse the sort direction).

### 5.3 Action Buttons (Command Bar)

| Button | What It Does |
|--------|-------------|
| Add New Asset | Opens the Asset Form in Add mode |
| Export CSV | Downloads all currently visible (filtered) rows as a CSV file |
| Refresh | Reloads data from SharePoint |

### 5.4 Row Actions

Clicking on a row opens the **Asset Detail** screen for that asset.  
There is also an **Edit** button on each row to go directly to the Edit form.

---

## 6. Screen 3: Add / Edit Asset (Asset Form)

This form is used to register a new asset or update an existing one.

### 6.1 Add Mode vs Edit Mode

| | Add Mode | Edit Mode |
|-|----------|-----------|
| How to open | "Add New Asset" button in Asset Table | "Edit Asset" button in Asset Detail or Asset Table |
| Asset ID | Auto-generated — shown as a live preview | Locked — cannot be changed |
| Asset Type | Required — selecting it updates the ID preview | Locked — cannot be changed |
| Status | Can only be set to Procured or Stock | Not editable here — use "Change Status" in Asset Detail |

### 6.2 Live Asset ID Preview (Add Mode Only)

As soon as you select an Asset Type, the form shows a preview of what the Asset ID will be. This ID is confirmed and permanently assigned when you click Save.

Example: Select Type = MAC, Country = IN, Office = GIC → Preview shows `ZRX-IN-CHN-GIC-MAC-0042`

### 6.3 All Form Fields

#### Identity
| Field | Required | Notes |
|-------|----------|-------|
| Asset Type | Yes | MAC, LAP, DSK, TAB, PHN, MON, KBD, MOS, CAM, AVC, LND, HST, TVD, PRJ, SWT, FWL, WAP, RTR, SRV, UPS, OTH |
| Country | Yes | India (IN) or United States (US) |
| Site / Office Code | Yes | GIC, UWB, UWK, NYC, BOS — filtered by selected country |
| Serial Number | Yes | Physical serial number |
| Model | Yes | e.g. Dell Latitude 5540 |
| Vendor | Yes | e.g. Dell India |

#### Procurement
| Field | Required | Notes |
|-------|----------|-------|
| PO Number | No | Purchase order number |
| Invoice Number | No | Supplier invoice number |
| Cost (INR) | No | Purchase price |
| Purchase Date | Yes | Date picker |
| Warranty Expiry | No | Date picker |

#### Assignment
| Field | Required | Notes |
|-------|----------|-------|
| Assigned To | No | Employee name |
| Assigned To Email | No | Employee email |
| Department | No | Dropdown — 13 preset options (see below) |
| Location | No | Dropdown — 5 preset options (see below) |

**Department options:** Engineering, Product, Design, Data Science, Sales, Marketing, HR, Finance, Operations, Legal, IT, Management, Customer Success

**Location options:** Chennai - Nungambakkam, Chennai - WFH, Remote, Warehouse, Other

#### Other
| Field | Required | Notes |
|-------|----------|-------|
| Remarks | No | Freeform notes about the asset (condition, known issues, special config, etc.) |

### 6.4 Saving

- Clicking **Save** creates / updates the asset in the `IT_Assets` SharePoint list
- On create: the system automatically generates the Asset ID, assigns the next sequence number, and writes the first history entry ("Asset created and entered into the system")
- On save: the user is returned to the Asset Detail screen (edit mode) or Asset Table (add mode) with a green success message

---

## 7. Screen 4: Asset Detail

This is the full profile screen for a single asset. It has two panels side by side.

### 7.1 Header (Top Bar)

| Element | What It Shows |
|---------|--------------|
| Back button | Returns to the Asset Table |
| Asset ID | The unique ID in large text |
| Status badge | Coloured pill showing current status |
| Edit Asset button | Opens the Edit form |
| Change Status button | Opens the status change dialog (hidden if the asset is in a terminal state with no further transitions) |

### 7.2 Warranty Alert Banner

If the asset has a warranty expiry date and it is within 90 days or already expired, a banner appears below the header:

- **Orange warning:** "Warranty expires in X days — consider renewal."
- **Red error:** "Warranty expired X days ago."

### 7.3 Left Panel — Asset Details (4 Cards)

**Card 1 — Classification**
Asset ID · Asset Type (code + full name) · Status · Country · Office Code

**Card 2 — Hardware**
Serial Number · Model · Vendor

**Card 3 — Procurement**
PO Number · Invoice Number · Cost (₹ formatted) · Purchase Date · Warranty Expiry (with days remaining or EXPIRED)

**Card 4 — Assignment**
Assigned To · Email · Department · Location

**Card 5 — Remarks** *(only shown if Remarks field has content)*  
Freeform notes about the asset

### 7.4 Right Panel — Change History Timeline

Every action ever taken on the asset is shown here as a vertical timeline, newest first.

Each entry shows:
- **Icon** — Add (created), Arrow (status changed), Person (assigned), Unlink (unassigned), Edit (updated)
- **Action** — e.g. "Procured → Active" or "Created"
- **Who & When** — the name of the person who made the change and the date
- **Note** — the reason or note they entered (if any)

Up to 200 history entries are shown.

### 7.5 Change Status Dialog

When the user clicks "Change Status":

1. A dialog opens showing the current status
2. A dropdown lists only the **valid next statuses** (the system enforces allowed transitions — you cannot move to an invalid state)
3. A notes field is shown — it becomes **mandatory** if the new status is Lost, Stolen, Gifted, Transferred, or Disposed
4. A preview bar shows: "Status will change: **Current** → **New**"
5. Clicking Confirm:
   - Updates the status in the `IT_Assets` list
   - Writes a history entry in `Asset_History`
   - Triggers the relevant Power Automate webhook (if configured)
   - Shows a green success message

---

## 8. Asset ID — How It Is Generated

Every asset gets a unique ID that is automatically created when the asset is first saved. The format is:

```
ZRX - IN - CHN - GIC - MAC - 0001
 │     │    │     │     │      │
 │     │    │     │     │      └── Global sequence (4 digits, never resets)
 │     │    │     │     └───────── Asset type code
 │     │    │     └─────────────── Site / Office code
 │     │    └───────────────────── City code (derived from office code — not stored separately)
 │     └────────────────────────── Country code
 └──────────────────────────────── ZoomRx org code (always ZRX)
```

**Segments:**

| # | Segment | Values |
|---|---------|--------|
| 1 | Org Code | Always `ZRX` |
| 2 | Country | `IN` (India), `US` (United States) |
| 3 | City | `CHN` (Chennai), `GRG` (Gurgaon), `PUN` (Pune), `NYC` (New York), `BOS` (Boston) — derived from office code |
| 4 | Site / Office | `GIC` (Global Infocity Chennai), `UWB` (UrbanWrk Gurgaon), `UWK` (UrbanWrk Pune), `NYC` (New York), `BOS` (Boston) |
| 5 | Asset Type | See asset type code table below |
| 6 | Sequence | 4-digit zero-padded global counter |

**How the sequence number works:**  
The sequence is **global** across all assets — it never resets by country, office, year, or asset type. When a new asset is created, the system finds the highest sequence number across every existing asset (reading the `SequenceNumber` field, with a fallback parse of the `Title` field) and assigns that number + 1. A duplicate guard increments further if there is a race condition.

**Legacy asset IDs** (format: `IN-CHN-26-LAP-0001`) continue to display and function correctly. The parse logic supports both old (5-part) and new (6-part ZRX) formats. Their sequence numbers are included in the global max calculation.

**Office → City mapping (no CityCode SharePoint column needed):**

| Office Code | City Code | Location |
|-------------|-----------|----------|
| GIC | CHN | Global Infocity, Chennai |
| UWB | GRG | UrbanWrk — Baani The Statement, Gurgaon |
| UWK | PUN | UrbanWrk — Konkord Towers, Pune |
| NYC | NYC | US — New York Office |
| BOS | BOS | US — Boston Office |

**Asset type codes:**

| Code | Description |
|------|-------------|
| MAC | MacBook |
| LAP | Laptop |
| DSK | Desktop |
| TAB | Tablet |
| PHN | Mobile Phone |
| MON | Monitor |
| KBD | Keyboard |
| MOS | Mouse |
| CAM | Webcam / Camera |
| AVC | Audio/Video Conferencing Device |
| LND | Landline / IP Phone |
| HST | Headset |
| TVD | TV / Large-format Display |
| PRJ | Projector |
| SWT | Network Switch |
| FWL | Firewall |
| WAP | Wireless Access Point |
| RTR | Router |
| SRV | Server |
| UPS | UPS / Power Device |
| OTH | Other IT Hardware |

Legacy codes (existing assets only — not selectable for new assets): `DTP`, `DOC`, `MOB`, `NET`, `ACC`.

---

## 9. Status Lifecycle — All Stages Explained

Every asset moves through stages over its life. The system enforces which stage can follow which — you cannot skip stages or move backwards (except for specific recovery flows).

### 9.1 What Each Status Means

| Status | What It Means |
|--------|--------------|
| **Procured** | The asset has been purchased but has not yet been physically received or inspected |
| **Stock** | The asset is in the IT storeroom, ready to be assigned to someone |
| **Active** | The asset is assigned to an employee and currently in use |
| **Repair** | The asset has been taken from the employee and sent for repair |
| **Transferred** | The asset has been moved to another person or location |
| **Gifted** | The asset was given to an employee as a gift (terminal — no further movement) |
| **Lost** | The asset has been reported as lost |
| **Stolen** | The asset has been reported as stolen |
| **Scrapped** | The asset is broken or obsolete and is no longer functional |
| **Disposed** | The asset has been physically disposed of / sent for e-waste recycling (terminal) |

### 9.2 Allowed Transitions (What Can Follow What)

```
Procured  ──→  Stock
Stock     ──→  Active   (assign to employee)
          ──→  Scrapped (damaged on arrival / never used)
Active    ──→  Repair   (sent for service)
          ──→  Transferred
          ──→  Gifted
          ──→  Lost
          ──→  Stolen
Repair    ──→  Active   (returned from repair)
          ──→  Scrapped (beyond repair)
Transferred ──→ Active  (re-assigned after transfer)
            ──→ Stock   (returned to storeroom)
Lost      ──→  Active   (recovered)
Stolen    ──→  Active   (recovered)
Scrapped  ──→  Disposed (physically disposed)
Gifted    ──→  (no further movement)
Disposed  ──→  (no further movement)
```

### 9.3 Statuses That Require a Mandatory Note

When changing to any of these statuses, the user **must** type a reason in the Notes field before the system will save:

- **Lost** — reason the asset is considered lost
- **Stolen** — how / when it was stolen, police report reference, etc.
- **Gifted** — who authorised the gift, to whom
- **Transferred** — where it is going and why
- **Disposed** — method of disposal, e-waste vendor, etc.

This is enforced in the UI and ensures the audit trail always has context for sensitive events.

---

## 10. Audit Trail — Change History

Every action on every asset is permanently recorded in the `Asset_History` SharePoint list. This cannot be edited or deleted by users.

### What Gets Recorded

| Event | When It Is Written |
|-------|--------------------|
| Created | When a new asset is first saved |
| StatusChanged | When any status change is confirmed |
| (Future) Assigned | Can be added when assignment changes |
| (Future) Updated | Can be added for field edits |

### What Is Stored Per Entry

- Asset ID (which asset this relates to)
- Action type (Created, StatusChanged, etc.)
- Previous Status and New Status
- Who made the change (name + email)
- Date and time
- Notes / reason

### Where It Appears

In the Asset Detail screen, the right-hand panel shows all history entries for that asset as a scrollable timeline, newest first.

---

## 11. Automated Notifications — Power Automate Flows

The system sends automated emails and Teams messages when key events happen. These are powered by four Power Automate flows. Each flow is triggered by the web part sending an HTTP request to a webhook URL when a relevant event occurs.

### Flow 1 — Asset Assignment Notification

**Trigger:** An asset's status is changed to **Active** and it has an assignee name set.

**What the webhook receives:**
| Field | Example |
|-------|---------|
| event | "AssetAssigned" |
| assetId | "IN-CHN-26-LAP-0042" |
| assetType | "LAP" |
| model | "Dell Latitude 5540" |
| serialNumber | "DLAB123456" |
| assignedTo | "Priya Menon" |
| assignedToEmail | "priya@zoomrx.com" |
| department | "Engineering" |
| location | "Chennai - Nungambakkam" |
| triggeredBy | "Elango Subramaniam" |

**What the flow should do (configured in Power Automate):** Send a welcome email to `assignedToEmail` telling them which laptop has been assigned to them, its serial number, and who assigned it.

---

### Flow 2 — Lost / Stolen Device Alert

**Trigger:** An asset's status is changed to **Lost** or **Stolen**.

**What the webhook receives:**
| Field | Example |
|-------|---------|
| event | "DeviceLost" or "DeviceStolen" |
| assetId | "IN-CHN-26-LAP-0042" |
| assetType | "LAP" |
| model | "Dell Latitude 5540" |
| serialNumber | "DLAB123456" |
| lastAssignedTo | "Priya Menon" |
| lastAssignedEmail | "priya@zoomrx.com" |
| department | "Engineering" |
| cost | 85000 |
| reportedBy | "Elango Subramaniam" |

**What the flow should do:** Send a high-priority alert email to IT Head and Security team with full device details.

---

### Flow 3 — Warranty Expiry Check

**Trigger:** Manually triggered from the web part, or on a schedule (recommended: every Monday at 08:00 IST).

**What the webhook receives:**
| Field | Example |
|-------|---------|
| event | "WarrantyExpirySoon" |
| count | 5 |
| assets | Array of assets (assetId, model, serialNumber, assignedTo, warrantyExpiry) |

**What the flow should do:** Send a weekly digest email to IT team listing all assets whose warranty expires within 90 days.

---

### Flow 4 — Scrap / E-Waste Disposal Notification

**Trigger:** An asset's status is changed to **Scrapped** or **Disposed**.

**What the webhook receives:**
| Field | Example |
|-------|---------|
| event | "AssetScrapped" or "AssetDisposed" |
| assetId | "IN-CHN-26-LAP-0012" |
| assetType | "LAP" |
| model | "HP EliteBook 840 G7" |
| vendor | "HP India" |
| serialNumber | "HPLA987654" |
| purchaseDate | "2021-06-15T00:00:00Z" |
| cost | 75000 |
| department | "HR" |
| disposedBy | "Elango Subramaniam" |

**What the flow should do:** Email Finance and IT Compliance with asset details for the E-Waste register, and optionally log to a separate SharePoint list for disposal records.

---

### How to Set Up a Flow (One-Time Setup Per Flow)

1. Open **Power Automate** (flow.microsoft.com)
2. New flow → Instant cloud flow → trigger: **When an HTTP request is received**
3. In the trigger step, paste in the JSON schema from the relevant file in the `flows/` folder
4. Add the email/Teams notification steps as required
5. Save the flow → copy the generated **HTTP POST URL**
6. Paste that URL into the web part property pane (see Section 13)

> If a webhook URL is not configured, the web part silently skips that notification — it will not cause any errors.

---

## 12. Data Storage — SharePoint Lists

All data is stored in two SharePoint lists that are automatically created when the web part is first deployed.

### List 1: IT_Assets

This is the main list. One row = one physical asset.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| Title | Text | Yes | Asset ID (auto-generated). New format: `ZRX-IN-CHN-GIC-MAC-0001`. Legacy: `IN-CHN-26-LAP-0001` |
| SerialNumber | Text | Yes | Physical serial number of the device |
| Model | Text | Yes | Device model name (e.g. MacBook Pro M3) |
| Vendor | Text | Yes | Supplier / brand (e.g. Apple India) |
| PONumber | Text | No | Purchase order reference number |
| InvoiceNumber | Text | No | Supplier invoice number |
| Cost | Currency | No | Purchase cost in INR |
| PurchaseDate | DateTime | Yes | Date the asset was purchased |
| WarrantyExpiry | DateTime | No | Date the warranty expires |
| AssignedTo | Text | No | Full name of the assigned employee |
| AssignedToEmail | Text | No | Email address of the assigned employee |
| Department | Text | No | Department (from preset list) |
| AssetLocation | Text | No | Physical location (from preset list) |
| Country | Text | No | Country code: `IN` or `US` |
| OfficeCode | Text | No | Site/office code: `GIC`, `UWB`, `UWK`, `NYC`, or `BOS`. City is derived in code from this value. |
| Status | Choice | Yes | Current lifecycle status |
| AssetType | Choice | Yes | 3-letter asset type code (MAC, LAP, DSK, TAB, PHN, MON, KBD, MOS, CAM, AVC, LND, HST, TVD, PRJ, SWT, FWL, WAP, RTR, SRV, UPS, OTH) |
| Remarks | Note | No | Freeform notes |
| SequenceNumber | Number | No | Global sequence counter. Never resets. Do not edit manually. |

### List 2: Asset_History

This is the audit trail. One row = one event on one asset. **Never edit this list manually.**

| Column | Type | Description |
|--------|------|-------------|
| Title | Text | Asset ID (links this entry to the asset) |
| Action | Text | Type of event: Created, StatusChanged, Assigned, etc. |
| PreviousStatus | Text | The status before the change |
| NewStatus | Text | The status after the change |
| ChangedBy | Text | Display name of the person who made the change |
| ChangedByEmail | Text | Email of the person who made the change |
| ChangedDate | DateTime | Exact date and time of the change (ISO format) |
| HistoryNotes | Note | Reason or note entered at the time of the change |

---

## 13. Web Part Settings (Property Pane)

To change settings, edit the SharePoint page and click the pencil/gear icon on the web part.

### Group 1 — Office Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| Country Code | IN | 2-letter country code used in the Asset ID prefix. Change this if the tool is deployed for a different country office |
| Office Code | CHN | 3-letter office code used in the Asset ID prefix. Change to a different code for a new office |

> **Important:** Changing the Country Code or Office Code only affects **new assets added after the change**. Existing asset IDs are not affected.

### Group 2 — Power Automate Webhooks

Paste the HTTP POST URL from each Power Automate flow here.

| Setting | Which Flow |
|---------|-----------|
| Asset Assignment Notification | Flow 1 — fires when asset goes Active with an assignee |
| Lost / Stolen Device Alert | Flow 2 — fires when asset goes Lost or Stolen |
| Warranty Expiry (90-day check) | Flow 3 — fires when the warranty check is triggered |
| Scrap / E-Waste Disposal | Flow 4 — fires when asset goes Scrapped or Disposed |

Leaving a field blank disables that notification without causing any errors.

---

## 14. Permissions — Who Can Do What

### In SharePoint

| Role | Access Needed | What They Can Do |
|------|--------------|-----------------|
| IT Admin / Asset Manager | Contribute on both lists | Add assets, edit assets, change status, view everything |
| All Staff | Read on both lists | View Dashboard and Asset Table (read-only) |
| Site Owner | Site Owner | Deploy the .sppkg file, manage list permissions |

**How to set list-level permissions:**  
SharePoint list → Settings (gear icon) → List Settings → Permissions for this list → Break inheritance → Set per-user or per-group access.

### In Power Automate

The flows run under the account of whoever created/owns the flow. That account must have access to send email or post to Teams.

---

## 15. Change Log

| Version | Date | What Changed |
|---------|------|-------------|
| v1.0.0 | 2026-06-01 | Initial release — Dashboard, Asset Table, Asset Form, Asset Detail, 4 Power Automate flows |
| v1.0.1 | 2026-06-03 | README: fixed status lifecycle diagram, added Features table, documented mandatory notes, added Department/Location presets |
| v1.1.0 | 2026-06-03 | Split Asset Form into two modules (see below); added file attachments; Fluent UI v9; new SharePoint lists |
| v1.1.1 | 2026-06-05 | Build fixes: added `es2020` to tsconfig lib; replaced `LeafRegular` with `LeafThreeRegular`; removed unsupported `onDismiss` prop from `MessageBar` components |
| v1.2.0 | 2026-06-05 | Full Fluent UI v9 → v8 migration (SPFx 1.18 Webpack compatibility); comprehensive UI/UX overhaul across all 6 SCSS modules and 2 TSX components (see below) |

### v1.2.0 — UI/UX Overhaul Details

**App Shell (`ItAssetManager`)**
- Light-grey page background (`neutralLighterAlt`) creates depth between chrome and content cards
- Header: white with Fluent standard drop shadow; title weight increased
- Asset count badge: blue-to-dark gradient with glow shadow
- Pivot bar: white background, tighter link styling

**Dashboard**
- KPI cards: Fluent standard box-shadow + `translateY(-2px)` hover lift; icon in coloured circular background chip; uppercase label
- Bar chart: gradient fill, 10px rounded track, transitions on width
- Status breakdown chips: pill-shaped with hover brightness effect
- Department list: themed blue count values
- Warranty alert panel: distinct orange-bordered card; days-left badge auto-colours red / amber / green
- "View All Assets" promoted to `PrimaryButton`

**Asset Table**
- View / Edit text buttons replaced with compact `IconButton` icons that fade in on row hover
- Column headers: uppercase, themed background, 2px bottom border
- Asset ID: code-pill with `themeLighterAlt` hover background
- Filter bar: white card visually separated from data rows

**Asset Detail**
- Header: sticky (stays visible while scrolling), white with shadow
- Asset ID rendered in monospace pill (tinted background)
- All detail cards: `border-left: 3px solid themePrimary` accent + shadow with hover lift
- Card section icons: coloured with `themePrimary`
- Timeline dots: blue ring glow; timeline notes: left-bar quote style
- Right panel: sticky with correct offset for header height
- Attachment links: pill-shaped with themed background

**Asset Details Form & Asset Assignment Form**
- Section cards: `border-left: 4px solid themePrimary` — clear section grouping
- Header and footer: both sticky with shadows (don't scroll away)
- Asset-ref card in assignment form: themed tinted background
- Asset ID preview: enclosed pill with `themeLight` border
- File pick label: icon coloured, smooth hover
- Repair dialog grid: responsive collapse to single column on narrow screens

### v1.1.0 — Module Split Details

**Module 1 — Asset Details Form (`AssetDetailsForm.tsx`)**
- Identity section: AssetType, Asset ID (auto-generated), Serial Number, Model, Vendor
- Procurement section: Purchase Date, PO Number, Invoice Number, Cost, Warranty Expiry, Purchase Bill file upload
- Stock / In-Store Details section: Date Added to Stock, Condition (Good / Refurbished / Damaged), Remarks
- Repair History section (edit mode only): list of all repair entries with Add / Delete; each repair stores Date, Vendor, Issue, Cost, Invoice Number, and an optional attachment
- Gifted Details section (shown only when Status = Gifted): Gifted To, Date, Authorised By, Remarks, attachment
- Transfer of Ownership section (shown only when Status = Transferred): Transferred From/To, Date, Reason, attachment
- Scrap / Disposal Details section (shown only when Status = Scrapped or Disposed): Scrap Date, Vendor, Invoice, PO, Amount, E-Waste Certificate Number, attachment

**Module 2 — Asset Assignment Form (`AssetAssignmentForm.tsx`)**
- Read-only asset reference card: Asset ID, Serial Number, Model, Status
- Assignment: Assigned To, Email, Department, Location, Date of Assignment
- Maintenance Schedule: Last Maintenance Date, Next Maintenance Date, Maintenance Notes
- Remarks

**Post-create flow**
After saving a new asset, a dialog asks "Assign now?" → Yes opens AssetAssignmentForm → No returns to Asset Table

**Updated Asset Detail screen**
- Left panel: all asset detail cards (Classification, Hardware, Procurement, Stock Details*, Repair History, Gifted/Transfer/Scrap* conditional, Remarks)
- Right panel: Current Assignment card + Edit Assignment button + Maintenance Schedule card + Change History timeline
- (* conditional sections only show when the asset has reached the relevant status)

**File Attachments**
- Files stored in a SharePoint document library named `IT Assets`
- Flat category-folder structure. Only repair reports use a per-asset subfolder.
- Folder mapping: `Purchase Invoices`, `Product Photos`, `Validation Reports`, `Transfer Documents`, `Gift Documents`, `Scrap Documents`, `Repair Reports/{AssetId}/`, `Other`
- Non-repair attachment URLs are stored as fields on `IT_Assets` (`PurchaseBillUrl`, `GiftedAttachmentUrl`, `TransferAttachmentUrl`, `ScrapAttachmentUrl`)
- Repair attachment URLs are stored on `Asset_Repairs.AttachmentUrl`

**New SharePoint Lists**
- `Asset_Assignments` — one row per assignment record (supports history of assignments via IsActive flag)
- `Asset_Repairs` — one row per repair entry

**SharePoint Document Library**
- `IT Assets` — document library with category subfolders for all asset lifecycle file attachments

**New IT_Assets columns** (added to existing list)
- Procurement: PurchaseBillUrl, PurchaseBillName
- Stock: DateAddedToStock, ConditionAtStockEntry, StockRemarks
- Gifted: GiftedTo, GiftedDate, GiftedAuthorisedBy, GiftedRemarks, GiftedAttachmentUrl
- Transfer: TransferredFrom, TransferredTo, TransferDate, TransferReason, TransferAttachmentUrl
- Scrap: ScrapDate, ScrapVendor, ScrapInvoiceNumber, ScrapPONumber, ScrapAmount, EWasteCertNumber, ScrapAttachmentUrl

**Tech**
- Migrated new components to Fluent UI v9 (`@fluentui/react-components`) wrapped in `FluentProvider`
- Dashboard and AssetTable remain on Fluent UI v8 (pending migration)
- `FileUploadService` — new service wrapping PnP.js v3 file upload to document library
- `AssetRepairService` — new service for Asset_Repairs CRUD
- `AssetAssignmentService` — new service for Asset_Assignments CRUD

---

*When a new feature is added or an existing feature is changed, update the relevant section(s) above and add a row to the Change Log table at the bottom.*
# IT Asset Lifecycle Manager — Technical Documentation

This document provides a comprehensive technical overview of the internal IT Asset Lifecycle Manager, a SharePoint Framework (SPFx) web part developed for **ZoomRx Chennai Office** (M365 E3 tenant, serving ~500 employees).

---

## 1. Project Overview

The **IT Asset Lifecycle Manager** is a single-page SPFx application that allows IT administrators and asset managers to track the entire lifecycle of hardware and network devices—from procurement, stocking, and active employee assignment, to repair, transfer, and eventual scrapping or disposal.

### Core Key Metrics & Targets:
* **Tenant Type:** Microsoft 365 E3 (no premium Power Platform licenses required).
* **Location Focus:** Chennai Office, India (Default Country Code: `IN`, Default Office Code: `CHN`).
* **UAT Site Site Relative Path:** `/sites/IT-Tech`
* **UAT Pages:** `IT-Asset-UAT.aspx`
* **Data Sources:** SharePoint Online Lists (`IT_Assets` and `Asset_History`).

---

## 2. Technical Architecture

The application is built entirely on the Microsoft 365 SaaS ecosystem with no external database requirements.

```
┌────────────────────────────────────────────────────────┐
│               SPFx React Web Part UI                   │
│  (Fluent UI v8, React 17, PnP.js v3, AssetIdGenerator) │
└───────────┬─────────────────────────────────┬──────────┘
            │                                 │
            ▼ (SP REST APIs via PnP.js)       ▼ (REST Webhook Calls)
┌─────────────────────────────────────┐  ┌─────────────────────────────────┐
│        SharePoint Online            │  │      Power Automate Flows       │
│  ├─ IT_Assets List (Primary Data + Current Assignment Snapshot) │
│  ├─ Asset_Assignments List (Assignment History)                 │
│  ├─ Asset_Repairs List (Repair History)                         │
│  └─ Asset_History List (Audit Log)                              │  │  ├─ Lost / Stolen Device Alert   │
└─────────────────────────────────────┘  │  ├─ Warranty Expiry Batch Run   │
                                         │  └─ Scrap / E-Waste Alert       │
                                         └─────────────────────────────────┘
```

### Frontend Stack:
* **SPFx Version:** 1.18.2
* **Build Engine:** Gulp & Webpack (via SPFx build pipeline)
* **Framework:** React v17.0.1 (functional components with Hooks)
* **UI Controls:** Fluent UI v8 (formerly Office UI Fabric)
* **Styling:** CSS Modules with Sass (`.module.scss`) and modern theme integration.
* **SharePoint Broker:** `@pnp/sp` v3 (PnPjs) utilizing standard SharePoint REST APIs (fully compliant with standard M365 E3 licenses).

---

## 3. Folder & Directory Structure

```
it-asset-tool/
├── config/                      # SPFx configuration
│   ├── config.json              # Webpack bundling configuration
│   ├── package-solution.json    # SPFx deployment and list provisioning manifest
│   └── serve.json               # Local development server and workbench settings
├── flows/                       # Power Automate JSON templates
│   ├── assignment-notification.json
│   ├── lost-device-alert.json
│   ├── warranty-expiry-check.json
│   └── scrap-ewaste-notification.json
├── sharepoint/assets/           # SharePoint declarative XML provisioning definitions
│   ├── elements.xml             # Field types and choice lists definitions
│   └── schema.xml               # Structure and views for lists + AssetAttachments doc library
├── src/webparts/itAssetManager/ # Source files
│   ├── ItAssetManagerWebPart.ts # Web part controller entry point & property pane fields
│   ├── ItAssetManagerWebPart.manifest.json # Component registration
│   ├── components/              # UI Components
│   │   ├── ItAssetManager.tsx   # Orchestrator & View Switcher (Router)
│   │   ├── Dashboard.tsx        # High-level KPIs, charts, and warranty tables
│   │   ├── AssetTable.tsx       # Interactive search & filter data grid
│   │   ├── AssetForm.tsx        # Form validation and dynamic Asset ID generation
│   │   ├── AssetDetail.tsx      # Detail inspector and status transition triggers
│   │   ├── AssetAssignmentForm.tsx # Assignment create/edit form (dialog)
│   │   └── AssetRepairForm.tsx   # Repair log form (dialog) with type-conditional fields
│   ├── models/                  # Core Types & Domains
│   │   ├── IAsset.ts            # Asset interfaces, allowed status paths, colors
│   │   ├── IAssetHistory.ts     # Audit log schema
│   │   ├── IAssetAssignment.ts  # Assignment history schema
│   │   └── IAssetRepair.ts      # Repair history schema
│   ├── services/                # Backend API Bridges
│   │   ├── AssetService.ts      # SharePoint PnPjs CRUD & Dashboard computation
│   │   ├── AssetAssignmentService.ts # Asset_Assignments CRUD for assignment history
│   │   ├── AssetRepairService.ts # Asset_Repairs CRUD for repair history
│   │   ├── FileUploadService.ts # AssetAttachments document library uploads
│   │   └── PowerAutomateService.ts # HTTP Webhook dispatch broker
│   └── utils/                   # Shared helpers
│       └── AssetIdGenerator.ts  # Regex parser and sequence-based generator
├── package.json                 # Dependency manifest
└── tsconfig.json                # TypeScript compilation parameters
```

---

## 4. React Component Architecture

The web part operates as a single-page app (SPA) routed dynamically by `ItAssetManager.tsx`.

### `ItAssetManager.tsx` (App Orchestrator)
* **Role:** Manages global state including:
  - Current view (`dashboard`, `list`, `add`, `edit`, `detail`).
  - Core asset collection state (`assets`).
  - Currently inspected asset (`selected`).
  - Loading, error, and success banner states.
* **Process Flow:** Initializes `AssetService` and `PowerAutomateService`. Triggers background data loads on mounting. Hooks up state update callbacks for child components. Handles status transition events, dispatches REST API update calls to SharePoint, and triggers relevant Power Automate webhooks concurrently.

### `Dashboard.tsx` (Insights & KPI Center)
* **Role:** Summarizes the current system inventory into digestible dashboard widgets.
* **Features:**
  - KPI Cards (Total Assets, Active, Stock, Repair, Procured, Warranty Soon, Lost/Stolen).
  - Horizontal bar distribution chart for Asset Types.
  - Choice-colored badge grid representing Statuses.
  - Scrollable grid listing the upcoming 90-day active warranties.

### `AssetTable.tsx` (Data Directory)
* **Role:** Grid view for filtering and locating assets.
* **Features:**
  - Standard keyword text search across Asset ID (Title), Serial Number, Model, and Assignee.
  - Dropdown filters for Status and Asset Type.
  - Row click trigger to view full details.

### `AssetForm.tsx` (Add & Edit Form)
* **Role:** Intuitive asset intake and editing.
* **Features:**
  - Automated ID Generator preview displaying what the future unique Asset ID will look like based on selected type and country/office properties.
  - Choice selectors for Asset Types and Statuses.
  - People Picker lookup (using SharePoint Site Users) for tracking assignees.
  - Validation rules enforcing required fields.

### `AssetDetail.tsx` (Timeline & Action Desk)
* **Role:** Thorough asset inspector with deep status modification capability.
* **Features:**
  - Detailed metadata grids showing PO, Costs, and current ownership.
  - Sequential chronological audit timeline fetched in real-time from `Asset_History`.
  - Dynamic Assignment card loading current assignment from `Asset_Assignments` via `AssetAssignmentService`.
  - "Assign Now" / "Edit Assignment" buttons that open the `AssetAssignmentForm` dialog.
  - Assignment save triggers deactivation of old records, creation of new ones, and snapshot sync to `IT_Assets`.
  - Repair History card listing all repairs (newest first) with type-conditional fields.
  - "Log Repair" button opens `AssetRepairForm` dialog with conditional fields per repair type.
  - Repair attachments stored in `AssetAttachments/{AssetID}/repairs/` via `FileUploadService`.
  - Contextual status transition actions (e.g., "Repair Completed", "Report Lost/Stolen", "Scrap Asset") reflecting current allowed paths.

---

## 5. SharePoint Lists & Integration Schema

The solution leverages SharePoint site features to declaratively provision lists during package installation.

### 1. `IT_Assets` (Primary Table)
Tracks the current state of each physical or virtual IT Asset.
* **Title:** Repurposed as the unique Asset ID. New format: `ZRX-IN-CHN-GIC-MAC-0001`. Legacy: `IN-CHN-26-LAP-0001`.
* **SerialNumber:** Required text field.
* **Model / Vendor:** Required metadata.
* **PONumber / InvoiceNumber:** Audit reference numbers.
* **Cost:** Numeric field tracking original purchase price in INR.
* **PurchaseDate:** DateTime field (Date only) indicating asset inception.
* **WarrantyExpiry:** DateTime field (Date only) indicating hardware warranty expiry.
* **AssignedTo / AssignedToEmail:** Text attributes capturing assignee.
* **Department / AssetLocation:** Segment attributes.
* **Country:** `IN` (India) or `US` (United States).
* **OfficeCode:** Site/office code — `GIC`, `UWB`, `UWK`, `NYC`, or `BOS`. City code is derived in code, no separate CityCode column.
* **Status:** Choice field mapping to Asset Lifecycle.
* **AssetType:** Choice field. New codes: MAC, LAP, DSK, TAB, PHN, MON, KBD, MOS, CAM, AVC, LND, HST, TVD, PRJ, SWT, FWL, WAP, RTR, SRV, UPS, OTH. Legacy: DTP, DOC, MOB, NET, ACC.
* **Remarks:** Multi-line text for generic comments.
* **SequenceNumber:** Integer. Global sequence counter — never resets per country/office/year/type. Every new asset increments by 1.

### 2. `Asset_History` (Audit Log Table)
An immutable ledger tracking every modification state.
* **Title:** Foreign key matching the parent Asset ID.
* **Action:** Type of action (`Created`, `StatusChanged`, etc.).
* **PreviousStatus / NewStatus:** State snapshot indicators.
* **ChangedBy / ChangedByEmail:** Operator metadata.
* **ChangedDate:** ISO timestamp when the change occurred.
* **HistoryNotes:** Operator notes documenting the reason behind state changes.

### 3. `Asset_Assignments` (Assignment History)
Tracks the full history of asset assignments — who was assigned, when, and to which department/location.
* **Title:** Foreign key matching the parent Asset ID (e.g., `IN-CHN-26-LAP-0001`).
* **AssetItemId:** Numeric ID of the parent IT_Assets item.
* **SerialNumber:** Serial number snapshot at time of assignment.
* **AssignedTo / AssignedToEmail:** Assignee details.
* **Department / AssetLocation:** Assignment context.
* **DateOfAssignment:** DateOnly field indicating when the asset was assigned.
* **AssignmentRemarks:** Optional multi-line notes about the assignment.
* **IsActive:** Boolean flag — only one assignment per asset is active at a time.
* **Current Assignment Snapshot on IT_Assets:** The `AssignedTo`, `AssignedToEmail`, `Department`, `AssetLocation`, and `DateOfAssignment` fields on `IT_Assets` are kept in sync by `AssetAssignmentService` to reflect the current assignment without requiring a join query.

### 4. `Asset_Repairs` (Repair History)
Tracks every repair performed on an asset, supporting both warranty replacements and out-of-warranty repairs.
* **Title:** Foreign key matching the parent Asset ID.
* **AssetItemId:** Numeric ID of the parent IT_Assets item.
* **SerialNumber:** Serial number snapshot at time of repair.
* **RepairType:** Choice — `In Warranty Replacement` or `Out Of Warranty Repair`.
* **RepairDate:** DateOnly field when the repair occurred.
* **RepairVendor:** Service provider name.
* **IssueDescription:** Multi-line description of the reported issue.
* **RepairCost:** Currency field (INR) — shown only for out-of-warranty repairs.
* **RepairInvoiceNumber:** Invoice reference — shown only for out-of-warranty repairs.
* **WarrantyCaseNumber:** Case/RMA number — shown only for warranty replacements.
* **ReplacementSerialNumber:** Serial number of the replacement device — shown only for warranty replacements.
* **AttachmentUrl / AttachmentName:** Link to the repair attachment file stored in `AssetAttachments/{AssetID}/repairs/`.
* **RepairRemarks:** Optional multi-line notes.
* **CreatedBy / CreatedDate:** Operator metadata.

### 5. `IT Assets` (Document Library)
File attachment library organized by category folder. Repair reports are the only category with a per-asset subfolder.
* **Folder structure:**
  - `IT Assets/Purchase Invoices/` — purchase invoices; URL stored in `IT_Assets.PurchaseBillUrl`
  - `IT Assets/Product Photos/` — product photos
  - `IT Assets/Validation Reports/` — validation reports
  - `IT Assets/Transfer Documents/` — transfer forms; URL stored in `IT_Assets.TransferAttachmentUrl`
  - `IT Assets/Gift Documents/` — gift authorisation letters; URL stored in `IT_Assets.GiftedAttachmentUrl`
  - `IT Assets/Scrap Documents/` — e-waste certificates; URL stored in `IT_Assets.ScrapAttachmentUrl`
  - `IT Assets/Repair Reports/{AssetID}/` — repair documents; URL stored in `Asset_Repairs.AttachmentUrl`
  - `IT Assets/Other/` — miscellaneous
* **Managed by:** `FileUploadService.ts`
* **DEPRECATED — do not use:** `AssetAttachments/{AssetId}/category/` folder structure has been removed.

---

## 6. Services & Integrations

### `AssetService.ts`
Uses PnPjs v3 to perform SharePoint data operations.
* **Sequential Generation:** `getNextSequenceNumber()` fetches all `IT_Assets` rows (Title + SequenceNumber) and returns the global max + 1. No prefix filter — the sequence is global across all countries, offices, years, and asset types. Parses both new (`ZRX-…`) and legacy (`IN-CHN-…`) Title formats as a fallback when `SequenceNumber` is null.
* **Dashboard Aggregation:** Performs analytical groupings on all asset rows to compute counts by Status, Type, and Department.
* **Warranty Pipeline:** Pulls active assets expiring within the customized day window (default 90 days) for proactive IT alerts.
* **Assignment Snapshot Sync:** `updateAssetAssignmentSnapshot()` updates `AssignedTo`, `AssignedToEmail`, `Department`, `AssetLocation`, and `DateOfAssignment` on `IT_Assets` to keep the current-assignment view in sync.

### `AssetAssignmentService.ts`
Manages assignment records in the `Asset_Assignments` SharePoint list and coordinates the dual-write pattern.
* **Architecture:** Assignment data is dual-stored — full history in `Asset_Assignments`, current snapshot on `IT_Assets`.
* **`getActiveAssignment(assetId)`:** Returns the single active assignment for an asset (`IsActive eq 1`), or null if none.
* **`getAllAssignments(assetId)`:** Returns full assignment history (newest first) for an asset.
* **`addAssignment(data)`:** Creates a new assignment record in `Asset_Assignments`.
* **`deactivateExisting(assetId)`:** Sets `IsActive = false` on the currently active assignment before a new one is created.
* **Save Workflow (in `ItAssetManager.tsx`):** 
  1. Deactivate existing active assignment (`deactivateExisting`)
  2. Create new assignment record (`addAssignment` with `IsActive: true`)
  3. Update `IT_Assets` snapshot fields (`AssetService.updateAssetAssignmentSnapshot`)
  4. Refresh the asset detail view

### `AssetRepairService.ts`
Manages repair records in the `Asset_Repairs` SharePoint list.
* **`getRepairs(assetId)`:** Returns all repair records for an asset, newest first.
* **`addRepair(data)`:** Creates a new repair record.
* **`updateRepair(id, changes)`:** Updates an existing repair record.
* **`deleteRepair(id)`:** Moves a repair record to the recycle bin.
* **Attachment storage:** Repair attachments are stored in `AssetAttachments/{AssetID}/repairs/` via `FileUploadService` and the URL is stored on the repair record.

### `FileUploadService.ts`
Manages document attachments in the `IT Assets` document library using a flat category-folder structure.
* **Library:** `IT Assets` (document library, must be pre-created by the SharePoint administrator with the required subfolders).
* **Folder mapping:**
  - `purchase` → `IT Assets/Purchase Invoices/`
  - `photos` → `IT Assets/Product Photos/`
  - `validation` → `IT Assets/Validation Reports/`
  - `transfer` → `IT Assets/Transfer Documents/`
  - `gifted` → `IT Assets/Gift Documents/`
  - `scrap` → `IT Assets/Scrap Documents/`
  - `repairs` → `IT Assets/Repair Reports/{AssetId}/` (only category with per-asset subfolder)
  - `other` → `IT Assets/Other/`
* **API:** `upload(assetId, category, file)` — returns `{ serverRelativeUrl, absoluteUrl, fileName }`. `listFiles(assetId)` — returns repair files from `Repair Reports/{assetId}/`. `deleteFile(serverRelativeUrl)` — recycles file.
* **URL storage:** Upload caller is responsible for saving the returned `serverRelativeUrl` to the appropriate SharePoint field (`PurchaseBillUrl`, `GiftedAttachmentUrl`, `TransferAttachmentUrl`, `ScrapAttachmentUrl`, or `Asset_Repairs.AttachmentUrl`).

### `PowerAutomateService.ts`
An lightweight, standard webhook dispatch broker that fires async POST requests containing JSON schemas to configured flow endpoints when important milestones occur:
1. **Asset Assigned:** Triggered when status shifts to `Active` with a designated assignee.
2. **Device Lost/Stolen:** Triggered on state transitions to `Lost` or `Stolen` to flag high-priority security concerns.
3. **Warranty Expiry Alert:** Dispatched on-demand via the Dashboard's manual trigger.
4. **Scrap/E-Waste Dispatch:** Dispatched on transitioning to `Scrapped` or `Disposed`.

---

## 7. Asset Lifecycle & Workflow

The web part strictly enforces the state machine below. Illegal state transitions are blocked programmatically.

```
Procured
  └──> Validation
        └──> Stock
              ├──> Active
              │     ├──> Repair ───> Active / Scrapped
              │     ├──> Transferred ───> Active / Stock
              │     ├──> Lost ───> Active (recovered)
              │     ├──> Stolen ───> Active (recovered)
              │     └──> Gifted (terminal)
              └──> Scrapped ───> Disposed (terminal)
```

### Transition Requirements:
* State transitions to `Lost`, `Stolen`, `Gifted`, `Transferred`, or `Disposed` strictly require the operator to input a explanatory reason (History Note).
* When transitioning an asset to `Active`, the system requires assignee information to trigger assignment alerts.

---

## 8. Build, Package & Deployment Process

Ensure Node.js 18.x and npm 9.x+ are installed.

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build & Package Solution
To build, bundle, and compile the package for SharePoint:
```bash
# Clean previous build artifacts
npm run clean

# Bundle client side resources in production mode (--ship)
npm run bundle

# Package solution into an sppkg installer file
npm run package
```
* **Output Artifact:** `sharepoint/solution/it-asset-manager.sppkg`

### Step 3: Deploy to SharePoint App Catalog
1. Navigate to the SharePoint tenant app catalog at `https://<tenant>.sharepoint.com/sites/appcatalog`.
2. Upload the `it-asset-manager.sppkg` package.
3. Check the deployment checkbox and click **Deploy**. Ensure no errors are raised during the provisioning of the feature definitions (`IT_Assets` and `Asset_History` lists).

### Step 4: Configure Web Part on Page
1. Go to the UAT page: `https://<tenant>.sharepoint.com/sites/IT-Tech/SitePages/IT-Asset-UAT.aspx`.
2. Edit the page, click the **+** icon, and search for **IT Asset Manager**.
3. Select the web part and open the property pane (gear icon).
4. Configure local Office codes (e.g. `IN` / `CHN`) and paste the four HTTP POST URLs copied from corresponding Power Automate flows into their respective fields.
5. Save and publish the page.

---

## 9. Version Control & Release Management

Strict version tracking across three distinct configurations is required prior to compiling any release:

| File Location | Target Element | Purpose |
|---------------|----------------|---------|
| `package.json` | `version` | NPM Package Identity & Build Dependency Control |
| `config/package-solution.json` | `solution.version` | SharePoint Solution Version (major.minor.build.revision) |
| `config/package-solution.json` | `features[0].version` | List Feature Provisioning Version (incrementing triggers schema updates) |

### Version Synchronization Checklist:
Before running `npm run bundle --ship`, ensure that:
1. `package.json` version is incremented (e.g., from `1.0.0` to `1.1.0`).
2. `config/package-solution.json` matches the new version with 4 digits (e.g., `1.1.0.0`).
3. If changes were made to list columns or schemas in `sharepoint/assets/elements.xml`, increment the feature version inside `package-solution.json` as well. This tells SharePoint to perform list upgrades upon re-deployment.
4. Document the version bump inside `CHANGELOG.md`.

### Release History

| Version | Date | Summary |
|---------|------|---------|
| 1.0.0 | 2026-06-10 | Initial release — Dashboard, Asset Catalog, Intake Form, Audit Timeline, Power Automate integration |
| 1.3.0 | 2026-06-10 | Asset Receiving & Validation workflow, `FileUploadService.ts`, `AssetAttachments` document library |
| 1.4.0 | 2026-06-10 | Internal release management |
| 1.5.0 | 2026-06-10 | Internal release management |
| 1.6.0 | 2026-06-10 | Internal release management |
| **1.7.0** | **2026-06-10** | **SequenceNumber field migration to `SequenceNumber_New` (Number type), restored list compatibility fixes** |
| **1.8.0** | **2026-06-10** | **Asset Assignment module — `Asset_Assignments` list, `AssetAssignmentService`, `AssetAssignmentForm`, dynamic assignment card in AssetDetail, `DateOfAssignment` field on IT_Assets** |
| **1.9.0** | **2026-06-10** | **Repair Management module — `Asset_Repairs` list, `AssetRepairService`, `AssetRepairForm` with type-conditional fields (In Warranty / Out Of Warranty), Repair History card in AssetDetail** |

---

## 10. Known Limitations & Future Opportunities

### Known Limitations:
* **SP List Threshold Limit:** The default queries query up to 5000 items (the OData top ceiling limit). For organizations scaling beyond 5000 assets, indexed columns and cursor-based pagination will need to be implemented within `AssetService.ts`.
* **People Picker Cache:** The User Search API searches only within members who have accessed the current SharePoint site collection at least once (i.e. site directory records).
* **Direct Webhook Deliverability:** The application relies on immediate HTTP fetches to Power Automate. If a flow endpoint is disabled, the alert request fails silently in the background (UI is unaffected but alert isn't sent).
* **IT Assets Library Dependency:** File uploads require the `IT Assets` document library to exist with its category subfolders pre-created by the SharePoint administrator (`Purchase Invoices`, `Product Photos`, `Validation Reports`, `Transfer Documents`, `Gift Documents`, `Scrap Documents`, `Repair Reports`, `Other`). The `ensureFolder` method attempts to create missing folders at upload time, but the library itself must already exist. If absent, uploads will fail with a REST error.
* **List Restore — Column Internal Name Mismatch:** If the `IT_Assets` list is deleted and recreated through the SharePoint UI (rather than redeploying the SPFx package), column internal names may differ from what the code expects (e.g., `SerialNumber` is expected, but the UI creates `Serial_x0020_Number`). After a restore, verify all column internal names against `elements.xml` and recreate mismatched columns with the correct internal names.

### Future Opportunities:
1. **Entra ID Graph Integration:** Implement `@microsoft/sp-http` MSGraphClient to lookup profiles directly from Azure AD, removing the site collection user limitation.
2. **Bulk Upload Utility:** Add CSV parse routines inside `AssetForm.tsx` to intake dozens of procured assets simultaneously.
3. **QR Code Generation:** Utilize a lightweight JS library (like `qrcode`) in `AssetDetail.tsx` to allow inventory managers to print scanner stickers directly.
4. **Image Preview Gallery:** Replace photo file links with thumbnail previews in the Receiving & Validation card.
