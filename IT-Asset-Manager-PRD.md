# Product Requirements Document
## IT Asset Manager — ZoomRx (India & US)
**Built on:** SharePoint Lists + SPFx Web Parts  
**Prepared by:** Arulmurugan Vaiyapuri, Manager – IT Ops  
**Shared with:** Elango S  
**Version:** 1.0  
**Date:** 16-Jun-2026  
**Status:** Draft — For Review

---

## 1. Overview

ZoomRx IT Ops is building an internal IT Asset Management tool natively within SharePoint to replace ad hoc tracking via Excel/email. The tool manages the full lifecycle of IT assets across India and US offices — from procurement and assignment to maintenance, repair, warranty tracking, and end-of-life disposal.

This document defines functional requirements, field specifications, naming standards, and implementation guidance for Elango to build and iterate on.

---

## 2. Objectives

| # | Objective |
|---|-----------|
| 1 | Single source of truth for all IT assets across India (Chennai, Gurgaon, Noida) and US offices |
| 2 | Standardised asset IDs that are globally unique, location-traceable, and system-safe |
| 3 | Full asset lifecycle tracking — Procured → Active → In Repair → Scrapped |
| 4 | Automated warranty expiry alerts and maintenance scheduling |
| 5 | Bulk document linking — one invoice or e-waste certificate mapped to multiple assets |
| 6 | Temporary assignment tracking with end-date reminders |
| 7 | Manager-level dashboard with key metrics without needing an external tool |

---

## 3. Scope

### 3.1 In Scope

**End-user devices**
- Laptops (Windows / MacBook)
- Desktops
- Tablets
- Mobile Phones (smartphones)

**Peripherals & Accessories**
- Keyboards, Mouse
- Monitors
- Webcams / Cameras (e.g., Logitech)
- Audio / Video conferencing devices (e.g., Owl devices)
- Landline / IP Phones
- Headsets

**AV & Office Equipment**
- TVs / Large-format displays (meeting rooms)
- Projectors

**Network & Infrastructure**
- Network Switches
- Firewalls
- Wireless Access Points (APs)
- Routers

**Other**
- Servers
- UPS / Power devices
- Any other IT-owned or IT-managed hardware

**Operational scope**
- All ZoomRx offices: India (Chennai – GIC, Gurgaon – UWB, Pune – UWK) and US (Boston, New York)
- Asset lifecycle: Procurement → Assignment → Maintenance → Disposal
- Temporary / test assignments with return date tracking
- Bulk document attachment (invoice and e-waste certificate to multiple assets)
- Guest user (non-employee) asset assignment with name and email validation

### 3.2 Out of Scope (v1)
- Software licence management
- Mobile Device Management (MDM) integration (future phase)
- Integration with Darwinbox or external HRMS (future phase)

---

## 4. Asset Naming Convention

### 4.1 Standard Format

```
ZRX - IN - CHN - GIC - MAC - 0001
 │     │     │     │     │     │
 │     │     │     │     │     └── Sequential Number (4-digit, zero-padded, global — never resets)
 │     │     │     │     └──────── Asset Type Code (3 chars)
 │     │     │     └────────────── Site / Office Code (3 chars)
 │     │     └──────────────────── City Code (3 chars)
 │     └────────────────────────── Country Code (ISO 3166-1 alpha-2: IN / US)
 └──────────────────────────────── Org Code (always ZRX)
```

**Example:** `ZRX-IN-CHN-GIC-MAC-0001`

### 4.2 Segment Reference Tables

**Country Codes**

| Country | Code |
|---------|------|
| India | `IN` |
| United States | `US` |

**City Codes**

| Country | City | Code |
|---------|------|------|
| India | Chennai | `CHN` |
| India | Gurgaon | `GRG` |
| India | Pune | `PUN` |
| US | New York | `NYC` |
| US | Boston | `BOS` |

**Site / Office Codes**

| Site | Full Name | City | Code |
|------|-----------|------|------|
| GIC | Global Infocity | Chennai | `GIC` |
| UWB | UrbanWrk — Baani The Statement | Gurgaon | `UWB` |
| UWK | UrbanWrk — Konkord Towers | Pune | `UWK` |
| NYC | US — New York Office | New York | `NYC` |
| BOS | US — Boston Office | Boston | `BOS` |

**Asset Type Codes**

| Category | Asset Type | Code |
|----------|------------|------|
| End-user Devices | MacBook (Apple laptop) | `MAC` |
| End-user Devices | Laptop (Windows) | `LAP` |
| End-user Devices | Desktop | `DSK` |
| End-user Devices | Tablet | `TAB` |
| End-user Devices | Mobile Phone (smartphone) | `PHN` |
| Peripherals & Accessories | Monitor | `MON` |
| Peripherals & Accessories | Keyboard | `KBD` |
| Peripherals & Accessories | Mouse | `MOS` |
| Peripherals & Accessories | Webcam / Camera (e.g., Logitech) | `CAM` |
| Peripherals & Accessories | Audio/Video Conferencing Device (e.g., Owl) | `AVC` |
| Peripherals & Accessories | Landline / IP Phone | `LND` |
| Peripherals & Accessories | Headset | `HST` |
| AV & Office Equipment | TV / Large-format Display | `TVD` |
| AV & Office Equipment | Projector | `PRJ` |
| Network & Infrastructure | Network Switch | `SWT` |
| Network & Infrastructure | Firewall | `FWL` |
| Network & Infrastructure | Wireless Access Point (AP) | `WAP` |
| Network & Infrastructure | Router | `RTR` |
| Other | Server | `SRV` |
| Other | UPS / Power Device | `UPS` |
| Other | Other IT Hardware | `OTH` |

### 4.3 Naming Rules

1. Asset ID is **auto-generated** by the system on asset creation — user must not manually type it
2. Asset ID is **immutable** — it cannot be edited after creation
3. Sequential number is **global** across all asset types and offices — does not reset per year or per type
4. Sequential number increments by 1 for every new asset regardless of country, city, or type
5. Year is **not** embedded in the Asset ID — purchase year is captured via the `Purchase Date` field in Procurement

### 4.4 Examples Across Offices

| Office | Asset | Asset ID |
|--------|-------|---------|
| Chennai – GIC | MacBook | `ZRX-IN-CHN-GIC-MAC-0001` |
| Chennai – GIC | Windows Laptop | `ZRX-IN-CHN-GIC-LAP-0002` |
| Gurgaon – UWB | Laptop | `ZRX-IN-GRG-UWB-LAP-0003` |
| Pune – UWK | Monitor | `ZRX-IN-PUN-UWK-MON-0004` |
| US – New York | MacBook | `ZRX-US-NYC-NYC-MAC-0005` |
| US – Boston | Laptop | `ZRX-US-BOS-BOS-LAP-0006` |

---

## 5. Asset Lifecycle & Status Flow

```
Procured → In Stock → Active → In Repair → Active (returned)
                                         ↓
                              Temp Assigned → Active (returned)
                                         ↓
                              End of Service → Scrapped
                                           → Gifted
                                           → Transferred
```

### 5.1 Status Definitions

| Status | Description |
|--------|-------------|
| **Procured** | Asset purchased; not yet received or registered in stock |
| **In Stock** | Asset received and registered; not yet assigned to a user |
| **Active** | Asset assigned to an employee and in active use |
| **Temp Assigned** | Asset assigned temporarily to an employee for testing or short-term use; has a defined return date |
| **In Repair** | Asset sent for repair or maintenance; not usable |
| **End of Service** | Asset retired from active use; pending final disposal decision |
| **Scrapped** | Asset disposed of via e-waste, written off, or physically destroyed |
| **Gifted** | Asset formally gifted to an employee or external party; no longer ZoomRx property |
| **Transferred** | Asset transferred to another office, entity, or department; ownership or custody moved |

---

## 6. Module Requirements

---

### 6.1 Dashboard

The dashboard is the default landing view and provides a real-time summary of the fleet.

#### 6.1.1 Summary Cards (top row)

| Card | Metric |
|------|--------|
| Total Assets | Count of all assets regardless of status |
| Active | Assets with status = Active |
| In Stock | Assets with status = In Stock |
| In Repair | Assets with status = In Repair |
| Procured | Assets with status = Procured |
| Temp Assigned | Assets with status = Temp Assigned |
| Gifted | Assets with status = Gifted |
| Transferred | Assets with status = Transferred |
| Scrapped | Assets with status = Scrapped |
| Warranty Expiring Soon | Assets where Warranty End Date ≤ Today + 30 days |
| End of Service Soon | Assets where OEM End of Service Date ≤ Today + 90 days |

#### 6.1.2 Charts & Breakdowns

| Chart | Description |
|-------|-------------|
| Asset Type Distribution | Bar/progress chart — count per asset type (MAC, LAP, MON, etc.) |
| Status Breakdown | Tag/pill count — assets per status |
| Top Departments | Count of active assets per department |
| Country Split | India vs US asset count |
| Warranty Risk | Count of assets expiring in 0–30 / 31–90 / 90+ days |

---

### 6.2 Asset Registry (All Assets View)

The main list view of all assets with search and filter.

#### 6.2.1 Columns Displayed

| Column | Notes |
|--------|-------|
| Asset ID | Clickable link to asset detail |
| Asset Type | e.g., MAC, LAP |
| Model | e.g., MacBookPro18,3 |
| Serial No. | Hardware serial number |
| Make | Manufacturer (Apple, Lenovo, HP, Dell) |
| Status | Coloured pill badge |
| Assigned To | Employee name |
| Department | |
| Location | City + office |
| Warranty End | Date; red if expired or expiring ≤ 30 days |
| Country | IN / US |

#### 6.2.2 Filters

- Status (All / Procured / In Stock / Active / Temp Assigned / In Repair / End of Service / Scrapped)
- Asset Type
- Department
- Country
- City / Office
- Warranty Expiry (Expiring Soon / Expired / Valid)

#### 6.2.3 Actions

- `+ Add Asset` — opens new asset form
- `Refresh` — reloads list data
- `Export CSV` — exports filtered view to CSV

---

### 6.3 Asset Detail — Classification

Core identity fields for the asset.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Asset ID | Auto-generated text | Yes | Format: `ZRX-IN-CHN-GIC-MAC-0001`; read-only after creation |
| Asset Type | Dropdown | Yes | MAC / LAP / MON / PHN / DSK / TAB / PRP |
| Status | Dropdown | Yes | See Section 5.1 |
| Country | Dropdown | Yes | IN / US |
| City | Dropdown | Yes | Filtered by country |
| Site / Office | Dropdown | Yes | Filtered by city |

---

### 6.4 Asset Detail — Hardware

Physical hardware identity of the device.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Serial Number | Text | Yes | Manufacturer serial number |
| Make | Dropdown | Yes | **Replaces "Vendor" in hardware section.** Apple / Lenovo / HP / Dell / Samsung / Logitech / Cisco / Fortinet / Other |
| Model | Text | Yes | Specific product model name / number — e.g., MacBookPro18,3 / ThinkPad L14 Gen 6 / UniFi AP AC Pro |
| Model Type | Dropdown | Yes | Broad category describing the model line — see Model Type values below |

**Model Type — Dropdown Values**

| Model Type | Applies To |
|------------|-----------|
| MacBook Air | Apple laptops — Air line |
| MacBook Pro | Apple laptops — Pro line |
| ThinkPad | Lenovo business laptops |
| IdeaPad | Lenovo consumer/mid-range laptops |
| EliteBook | HP business laptops |
| ProBook | HP mid-range laptops |
| Latitude | Dell business laptops |
| Inspiron | Dell consumer laptops |
| iMac | Apple desktop |
| Mac Mini | Apple desktop |
| iPhone | Apple smartphone |
| Android Phone | Android smartphones (Samsung, OnePlus, etc.) |
| iPad | Apple tablet |
| Android Tablet | Android tablets |
| LED Monitor | Standard desktop monitors |
| Smart TV / Display | Large-format TVs and meeting room displays |
| Projector | Projector devices |
| IP Phone / Landline | Desk phones |
| Owl Device | Owl Labs AV conferencing units |
| Webcam | Logitech and other webcams |
| Headset | Wired / wireless headsets |
| Keyboard | Wired / wireless keyboards |
| Mouse | Wired / wireless mice |
| Network Switch | Managed / unmanaged switches |
| Firewall | Perimeter security appliances |
| Access Point | Wi-Fi access points |
| Router | Network routers |
| Server | Rack / tower servers |
| UPS | Uninterruptible power supply units |
| Other | Anything not listed above |

> **Note:** "Make" = the manufacturer (Apple, Lenovo). "Model" = exact product identifier. "Model Type" = the product line / category — used for filtering and reporting across similar devices (e.g., "show all ThinkPads" or "all Owl Devices").
>
> "Vendor" = the supplier/seller from whom ZoomRx purchased the asset — captured separately in Procurement (Section 6.5).

---

### 6.5 Asset Detail — Procurement

Purchasing and financial details.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| PO Number | Text | No | Internal purchase order number |
| Invoice No. | Text | No | Supplier invoice number |
| Vendor | Text / Lookup | Yes | **New field.** Name of the procurement vendor / supplier (e.g., Croma, Imagine, B2X, Amazon Business). Different from Make. |
| Cost | Currency | No | Purchase cost in INR or USD (based on country) |
| Purchase Date | Date | Yes | Used for Asset Age calculation and naming reference |
| Purchase Invoice | File attachment | No | Single PDF; can be shared across multiple assets (see Section 6.10 — Bulk Documents) |

---

### 6.6 Asset Detail — Assignment Management

Tracks who the asset is currently assigned to.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Assigned To | Person / Text | Yes (if Active) | Employee name — SharePoint People Picker for internal users; free text with validation for guest users |
| Email | Email (validated) | Yes (if Active) | Must be valid email format; required for guest users |
| Department | Dropdown | No | Engineering / IT / Finance / Operations / Product / Sales / Other |
| Location | Text | No | e.g., Chennai – Nungambakkam |
| Assigned On | Date | Yes (if Active) | Date assignment took effect |

#### 6.6.1 Guest User Assignment

When an asset is assigned to a non-employee (contractor, vendor, guest):

| Field | Validation Rule |
|-------|----------------|
| Name | Minimum 2 words (First + Last name); no special characters except hyphen and space |
| Email | Valid email format (`name@domain.com`); must not be blank |
| Guest flag | Checkbox — "Is External / Guest User" — when checked, disables SharePoint People Picker and enables free-text name + email fields |

---

### 6.7 Asset Detail — Temporary Assignment

Captures short-term or test assignments with a defined return date.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Is Temporary Assignment | Toggle / Checkbox | No | When enabled, shows temporary assignment fields and sets Status = Temp Assigned |
| Temp Assigned To | Person / Text | Yes (if temp) | Name of employee receiving device temporarily |
| Temp Assignment Email | Email | Yes (if temp) | Email for reminder notification |
| Temp Assignment Purpose | Text | No | e.g., "Performance testing", "New joiner evaluation", "Loaner while device in repair" |
| Temp Start Date | Date | Yes (if temp) | Date temporary assignment begins |
| Temp End Date (Return By) | Date | Yes (if temp) | Expected return date; triggers reminder notification |
| Reminder Sent | Yes/No (auto) | Read-only | Automatically marked Yes when reminder email is sent |

**Behaviour:**
- When "Is Temporary Assignment" = Yes → Status auto-set to `Temp Assigned`
- When Temp End Date is reached → automated reminder sent to assigned person and IT Ops
- When asset is returned and status changed back to `In Stock` or `Active` → Temp Assignment fields cleared

---

### 6.8 Asset Detail — Warranty & Services

Comprehensive warranty and service coverage tracking.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Warranty Start Date | Date | Yes | Date warranty coverage begins (usually same as Purchase Date or delivery date) |
| Warranty End Date | Date | Yes | Date warranty expires; was "Warranty Exp." in v0 |
| OEM End of Service Date | Date | No | Manufacturer's declared end-of-life date (e.g., Apple support end date for that model) |
| Type of Warranty | Dropdown | No | Onsite / Carry-In / Depot / Mail-In / Extended / AppleCare |
| Add-on Service | Single line of text | No | Any additional service contract or extended coverage description (e.g., "AppleCare+ till Dec 2027", "AMC via vendor XYZ") |
| Asset Age | Calculated (read-only) | Auto | `(Today – Purchase Date) / 365` displayed as decimal years (e.g., `2.4 years`, `0.8 years`) |

> **Asset Age formula (SharePoint Calculated Column):**  
> `=TEXT(INT((TODAY()-[Purchase Date])/365),"0")&"."&TEXT(INT(MOD((TODAY()-[Purchase Date]),365)/36.5),"0")&" years"`  
> *Or simpler:* `=ROUND((TODAY()-[Purchase Date])/365,1)&" years"`

---

### 6.9 Asset Detail — Maintenance & Repair

Tracks all maintenance events for an asset. **Asset-based, not person-based** — history follows the asset regardless of who handled it.

Each asset can have multiple maintenance/repair records.

#### 6.9.1 Maintenance Record Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Maintenance Date | Date | Yes | Date repair or maintenance was performed |
| Type | Dropdown | Yes | Preventive / Corrective / Repair / Inspection |
| Service Provider / Vendor | Text | Yes | Name of vendor or service centre (e.g., Apple Service Centre, Lenovo Authorised) |
| Issue Description | Multi-line text | No | What was the problem |
| Resolution | Multi-line text | No | What was done to fix it |
| Cost (INR / USD) | Currency | No | Cost of repair or maintenance |
| Attachment | File | No | Repair report, job card, or invoice |
| Next Maintenance Due | Date | No | Auto-populates Maintenance Schedule section |

#### 6.9.2 Maintenance Schedule

Displayed on the asset detail panel (right side).

| Field | Source |
|-------|--------|
| Last Maintenance | Auto-pulled from most recent maintenance record date |
| Next Maintenance | Auto-pulled from most recent "Next Maintenance Due" entry |

> **Design note:** Maintenance history must be stored as a **child list** linked to the asset by Asset ID — not as a single field on the asset. This allows unlimited history per asset.

---

### 6.10 Asset Detail — End of Service

Captures the planned or executed retirement of an asset.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| End of Service Date | Date | No | Date the asset was taken out of active service |
| End of Service Reason | Dropdown | No | End of Life / Beyond Repair / Surplus / Policy Refresh / Lost / Stolen |
| Remarks | Multi-line text | No | Any additional notes on retirement reason |

> When End of Service Date is set, Status should be auto-suggested as `End of Service`.

---

### 6.11 Asset Detail — Scrap / Disposal

Captures final disposal details once an asset is scrapped.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Disposal Date | Date | No | Date asset was disposed |
| Disposal Method | Dropdown | No | E-waste / Written Off / Sold / Donated / Transferred |
| Disposal Vendor | Text | No | Name of e-waste vendor or recipient |
| Proceeds / Salvage Value | Currency | No | Amount received on disposal if any |
| E-waste Certificate | File / Linked Document | No | Can be shared across multiple assets (see Section 6.13 — Bulk Documents) |
| Scrap Remarks | Multi-line text | No | |

---

### 6.12 Asset Detail — Attachments

Generic attachment section for documents that don't fit other categories.

| Attachment Type Tag | Description |
|--------------------|-------------|
| Purchase Invoice | Procurement document |
| Repair Report | Linked from maintenance record |
| E-waste Certificate | Disposal document |
| Other | Miscellaneous |

---

### 6.13 Bulk Document Linking

Allows a single document (PDF) to be linked to multiple assets — avoids duplicate file uploads.

#### 6.13.1 Use Cases

| Document Type | Scenario |
|---------------|---------|
| Purchase Invoice | One invoice covers 10 laptops from a single purchase order — link same PDF to all 10 asset records |
| E-waste Certificate | One e-waste certificate covers 10 scrapped devices — link same certificate to all 10 asset records |

#### 6.13.2 Requirements

1. Document is uploaded **once** to a SharePoint Document Library (`IT Assets / Shared Documents`)
2. A `Shared Documents` lookup field on each asset links to the document
3. On the asset detail page, the linked document appears in the Attachments section as a named link
4. When viewing a shared document, it shows a list of all assets it is linked to
5. Bulk linking UI: Select multiple assets from the All Assets view → "Link Document" action → pick document from library → all selected assets are linked

#### 6.13.3 Document Library Structure

```
IT Assets (SharePoint Site)
└── Shared Documents/
    ├── Purchase Invoices/
    │   └── INV-2026-001.pdf  ← linked to 10 assets
    └── E-waste Certificates/
        └── EWASTE-2026-001.pdf  ← linked to 10 assets
```

---

### 6.14 Change History

Auto-tracked audit trail for every asset — no configuration required.

| Field | Auto-captured |
|-------|--------------|
| Event | Status change, assignment change, field edit |
| Changed By | SharePoint user (name) |
| Changed On | Date and time |
| From → To | Previous value → New value |
| Notes | Optional free-text note added at time of change |

---

## 7. Complete Field Reference

### 7.1 Asset Master Fields (all sections combined)

| Section | Field | Type | Required |
|---------|-------|------|----------|
| Classification | Asset ID | Auto-text | Yes |
| Classification | Asset Type | Dropdown | Yes |
| Classification | Status | Dropdown | Yes |
| Classification | Country | Dropdown | Yes |
| Classification | City | Dropdown | Yes |
| Classification | Site / Office | Dropdown | Yes |
| Hardware | Serial Number | Text | Yes |
| Hardware | Make | Dropdown | Yes |
| Hardware | Model | Text | Yes |
| Hardware | Model Type | Dropdown | Yes |
| Procurement | PO Number | Text | No |
| Procurement | Invoice No. | Text | No |
| Procurement | Vendor | Text | Yes |
| Procurement | Cost | Currency | No |
| Procurement | Purchase Date | Date | Yes |
| Procurement | Purchase Invoice | Linked Document | No |
| Assignment | Assigned To | Person / Text | Conditional |
| Assignment | Email | Email | Conditional |
| Assignment | Department | Dropdown | No |
| Assignment | Location | Text | No |
| Assignment | Assigned On | Date | Conditional |
| Assignment | Is Guest User | Checkbox | No |
| Temp Assignment | Is Temporary | Checkbox | No |
| Temp Assignment | Temp Assigned To | Text | Conditional |
| Temp Assignment | Temp Email | Email | Conditional |
| Temp Assignment | Purpose | Text | No |
| Temp Assignment | Temp Start Date | Date | Conditional |
| Temp Assignment | Temp End Date | Date | Conditional |
| Warranty & Services | Warranty Start Date | Date | Yes |
| Warranty & Services | Warranty End Date | Date | Yes |
| Warranty & Services | OEM End of Service Date | Date | No |
| Warranty & Services | Type of Warranty | Dropdown | No |
| Warranty & Services | Add-on Service | Single line text | No |
| Warranty & Services | Asset Age | Calculated | Auto |
| End of Service | End of Service Date | Date | No |
| End of Service | End of Service Reason | Dropdown | No |
| End of Service | Remarks | Multi-line text | No |
| Scrap / Disposal | Disposal Date | Date | No |
| Scrap / Disposal | Disposal Method | Dropdown | No |
| Scrap / Disposal | Disposal Vendor | Text | No |
| Scrap / Disposal | Proceeds / Salvage Value | Currency | No |
| Scrap / Disposal | E-waste Certificate | Linked Document | No |
| Scrap / Disposal | Scrap Remarks | Multi-line text | No |
| General | Remarks | Multi-line text | No |

---

## 8. SharePoint Implementation Notes

### 8.1 Lists Required

| List / Library | Purpose |
|---------------|---------|
| `Assets` | Master asset list — one row per asset |
| `MaintenanceRecords` | Child list linked to Assets by Asset ID — multiple rows per asset |
| `SharedDocuments` | Document library for shared invoices and e-waste certificates |
| `AssetCounter` | Single-row list holding the current global sequential counter for auto ID generation |
| `OfficeCodes` | Reference list — Country / City / Site mappings for dropdown cascading |

### 8.2 Auto ID Generation

- On new asset form submission, a Power Automate flow reads the current counter from `AssetCounter`, formats the Asset ID as `ZRX-[Country]-[City]-[Site]-[AssetType]-[NNNN]`, writes it to the new asset record, and increments the counter
- Sequential number is zero-padded to 4 digits (0001–9999)
- Counter never resets — it is a single global incrementing number

### 8.3 Cascading Dropdowns

- City dropdown filters based on selected Country
- Site/Office dropdown filters based on selected City
- Implemented via SPFx web part or Power Apps form

### 8.4 Temporary Assignment Reminder

- Power Automate scheduled flow runs daily
- Checks all assets where `Is Temporary = Yes` and `Temp End Date = Today`
- Sends email reminder to `Temp Email` and to IT Ops shared mailbox
- Sets `Reminder Sent = Yes` on the asset record

### 8.5 Warranty Expiry Alert

- Power Automate scheduled flow runs weekly (every Monday)
- Checks all assets where `Warranty End Date ≤ Today + 30 days` and Status ≠ Scrapped
- Sends consolidated report to IT Ops

### 8.6 Asset Age Calculated Column (SharePoint)

```
=ROUND((TODAY()-[Purchase Date])/365,1)&" yrs"
```
Displays as: `2.4 yrs`, `0.8 yrs`, `5.0 yrs`

---

## 9. Non-Functional Requirements

| Requirement | Detail |
|-------------|--------|
| Access control | IT Ops team (Elango, Prabu, Thivakar) — Edit; All ZoomRx employees — View own assigned assets only; Manager / IT Ops Lead — Full access |
| Platform | SharePoint Online (Microsoft 365) |
| Mobile | Responsive — usable on Teams mobile for quick lookups |
| Data retention | Asset records retained for 7 years after disposal (audit requirement) |
| Export | CSV export from All Assets view for reporting |
| Audit trail | All field changes auto-logged via SharePoint version history + Change History section |

---

## 10. Open Items

| # | Item | Owner | Target |
|---|------|-------|--------|
| 1 | Confirm site code for any 2nd Chennai office when lease is finalised | Arul | TBD |
| 2 | Confirm US city office codes (NYC, BOS, or other) | Arul | TBD |
| 3 | Decide if peripherals (keyboards, mice) are tracked at asset level or as part of parent device | Elango + Arul | v1 scope call |
| 4 | Power Automate licence availability for scheduled flows | Arul | Check with Siva |
| 5 | Mobile phone IMEI tracking — include as a hardware field? | Elango | v1 scope call |
| 6 | Integration with Darwinbox employee list for People Picker | Elango | v2 |
| 7 | Bulk CSV upload for initial data migration (existing assets) | Elango | v1 |

---

## 11. Out of Scope (v1)

- Software / SaaS licence tracking
- MDM / Intune integration
- Automatic data sync from Darwinbox on employee exit
- Public-facing vendor portal
- Financial depreciation calculations

---

*Document prepared by Arulmurugan Vaiyapuri — IT Ops Manager, ZoomRx Inc.*  
*For questions or clarifications, contact Arul on Teams or at arulmurugan.vaiyapuri@zoomrx.com*
