# Attachment Management — Implementation Plan

## 1. Current State Analysis

### 1.1. Existing Infrastructure

| Component | Status | Details |
|---|---|---|
| **Document Library** | ✅ Provisioned | `AssetAttachments` (TemplateType 101), declared in `sharepoint/assets/elements.xml:33-38` |
| **Folder Structure** | ✅ Runtime creation | `FileUploadService.ensureFolder()` creates `AssetAttachments/{AssetID}/{category}/` on demand |
| **FileUploadService** | ✅ Exists | `services/FileUploadService.ts` — 4 methods: `ensureFolder`, `upload`, `deleteFile`, `getAbsoluteUrl` |
| **Existing Categories** | ✅ In use | `purchase`, `gifted`, `transfer`, `scrap`, `repairs/{timestamp}` |
| **IT_Assets URL fields** | ✅ Exist | `PurchaseBillUrl`, `PurchaseBillName`, `GiftedAttachmentUrl`, `TransferAttachmentUrl`, `ScrapAttachmentUrl` |
| **Repair attachment fields** | ✅ Exist | `AttachmentUrl`, `AttachmentName` on `Asset_Repairs` |
| **Asset Detail display** | ✅ Partial | Inline links shown within Procurement/Gifted/Transfer/Scrap cards and Repair entries — read-only, no dedicated section |

### 1.2. How Uploads Currently Work

All uploads happen inside `AssetDetailsForm.tsx` `handleSave()`:

```
AssetDetailsForm.handleSave()
  ├── maybeUpload(assetId, 'purchase', purchaseBillFile)   → PurchaseBillUrl
  ├── maybeUpload(assetId, 'gifted',   giftedFile)         → GiftedAttachmentUrl
  ├── maybeUpload(assetId, 'transfer', transferFile)       → TransferAttachmentUrl
  ├── maybeUpload(assetId, 'scrap',    scrapFile)          → ScrapAttachmentUrl
  ├── repairDraft → fileService.upload(assetId, `repairs/${Date.now()}`, file)
```

Each upload URL is stored in a dedicated IT_Assets field or Asset_Repairs field. There is no general-purpose "browse all files for this asset" capability.

### 1.3. How Files Are Displayed

`AssetDetail.tsx` renders attachment links **inline within feature cards**:

| Section | Links From |
|---|---|
| Procurement card | `asset.PurchaseBillUrl` |
| Gifted card | `asset.GiftedAttachmentUrl` |
| Transfer card | `asset.TransferAttachmentUrl` |
| Scrap card | `asset.ScrapAttachmentUrl` |
| Repair entries | `repair.AttachmentUrl` |

There is **no dedicated Attachments section** in Asset Detail. Files are only reachable through their feature context.

---

## 2. Gaps Analysis

| Gap | Severity | Details |
|---|---|---|
| **No file listing API** | High | `FileUploadService` has no `listFiles(assetId, sub?)` — cannot enumerate existing files in the document library |
| **No dedicated Attachments section** | High | Asset Detail has no place to see ALL files for an asset at a glance |
| **No standalone upload UI** | High | Files can only be uploaded within specific form workflows (create/edit asset, add repair). No generic "upload document" button from Asset Detail |
| **No delete from detail view** | Medium | `FileUploadService.deleteFile()` exists but is not exposed in any UI; files can only be deleted via `AssetDetailsForm.tsx` on re-save |
| **No category folder browser** | Medium | Files are organized into categories but there's no way to browse by category from the UI |
| **No file type validation** | Low | No client-side file type filtering or size limits on upload (relies on SharePoint's native limits) |
| **No file preview** | Medium | Only direct link to file — no type-aware preview (PDF in-browser, Office Online viewer, image display, forced download for unsupported) |
| **No model layer** | Medium | No `IAttachment` interface — attachments are represented as bare `{ serverRelativeUrl, fileName }` pairs |

---

## 3. Required Components

### 3.1. New: `IAttachment` Model

**File**: `src/webparts/itAssetManager/models/IAttachment.ts`

```typescript
export type AttachmentCategory =
  | 'purchase'
  | 'repairs'
  | 'gifted'
  | 'transfer'
  | 'scrap'
  | 'validation'
  | 'photos'
  | 'other';

export interface IAttachment {
  name: string;
  serverRelativeUrl: string;
  absoluteUrl: string;
  downloadUrl: string;          // absoluteUrl + '?download=1' for forced download
  category: AttachmentCategory;
  timeCreated: string;
  fileSize: number;
  previewType: 'browser' | 'office' | 'download';
}
```

**Purpose**: Standard model for all attachment operations. `previewType` drives the UI button behavior:
- `browser` — PDF, images → open in new browser tab (SharePoint serves inline)
- `office` — DOCX, XLSX, PPTX → open in new tab (SharePoint redirects to Office Online)
- `download` — ZIP, unsupported → force download via `?download=1`

### 3.2. New: `AssetAttachmentSection` Component

**File**: `src/webparts/itAssetManager/components/AssetAttachmentSection.tsx`

**Location**: Right panel of `AssetDetail.tsx`, inserted between Maintenance Schedule card and Change History card.

**Props**:
```typescript
interface IAssetAttachmentSectionProps {
  assetId: string;          // Asset ID (e.g. IN-CHN-26-LAP-0001)
  fileService: FileUploadService;
  categories?: AttachmentCategory[];   // Defaults to all categories
}
```

**States**:
| State | Behavior |
|---|---|
| Loading | Shimmer placeholder while files are enumerated |
| Empty | "No attachments. Upload a file." + Upload button |
| Populated | File list sorted by date desc, grouped or flat |
| Uploading | Progress indicator during upload (inline or overlay) |
| Error | Inline error message with retry |
| Delete Confirm | Confirmation dialog before delete |

**Operations**:
- `loadFiles()`: Calls `fileService.listFiles(assetId)` to fetch all folder contents
- `handleUpload(file)`: Calls `fileService.upload(assetId, 'other', file)` or prompts for category selection
- `handleDelete(url)`: Confirmation dialog → `fileService.deleteFile(url)` → refresh list
- `handleOpen(attachment)`: Type-aware open:
  - `browser` → `window.open(attachment.absoluteUrl, '_blank')`
  - `office` → `window.open(attachment.absoluteUrl, '_blank')` (SharePoint handles Office Online redirect)
  - `download` → `window.open(attachment.downloadUrl, '_blank')`

### 3.3. Modified: `AssetDetail.tsx`

**Changes**:
- Accept new `fileService: FileUploadService` prop
- Import and render `<AssetAttachmentSection>` in the right panel (line 370-382 area, after Maintenance Schedule, before Change History)
- Accept new `onAttachmentChange?: () => void` callback (optional, for parent awareness)

### 3.4. Modified: `ItAssetManager.tsx`

**Changes**:
- Pass `fileService={fileSvc}` to `<AssetDetail>` component (line 265-277)

---

## 4. Required Service Changes

### 4.1. New Method: `FileUploadService.listFiles()`

**Add to** `services/FileUploadService.ts`:

Uses a **document library list query with path prefix filter** instead of folder recursion. See the architecture note at the end of this section.

```typescript
async listFiles(assetId: string): Promise<IAttachment[]> {
  const assetFolderPath = `${this._siteRelUrl}/${LIBRARY}/${assetId}`;
  const items = await this._sp.web.lists
    .getByTitle(LIBRARY)
    .items
    .filter(`startswith(FileRef, '${assetFolderPath}') and FSObjType eq 0`)
    .select('FileRef', 'FileLeafRef', 'TimeCreated', 'FileSizeDisplay')();
  return items.map(item => {
    const srUrl = item.FileRef;
    const absUrl = this.getAbsoluteUrl(srUrl);
    return {
      name: item.FileLeafRef,
      serverRelativeUrl: srUrl,
      absoluteUrl: absUrl,
      downloadUrl: `${absUrl}?download=1`,
      category: this._inferCategory(srUrl, assetId),
      timeCreated: item.TimeCreated,
      fileSize: item.FileSizeDisplay,
      previewType: this._getPreviewType(item.FileLeafRef),
    };
  });
}
```

**Key detail**: `FSObjType eq 0` filters out folder entries, returning only actual files. The `startswith(FileRef, path)` filter captures files at any sub-folder depth in a single API call — no recursive traversal needed.

### 4.2. New Method: `FileUploadService.getFilesByCategory()`

Client-side grouping of the single `listFiles()` response, since all files are returned in one call:

```typescript
async getFilesByCategory(assetId: string): Promise<Record<AttachmentCategory, IAttachment[]>> {
  const all = await this.listFiles(assetId);
  const grouped: Record<string, IAttachment[]> = {};
  for (const file of all) {
    const cat = file.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(file);
  }
  return grouped as Record<AttachmentCategory, IAttachment[]>;
}
```

### 4.3. Helper Method: `FileUploadService._inferCategory()`

```typescript
private _inferCategory(serverRelativeUrl: string, assetId: string): AttachmentCategory {
  const pattern = new RegExp(`${assetId}/([^/]+)/`);
  const match = serverRelativeUrl.match(pattern);
  if (!match) return 'other';
  const cat = match[1];
  const valid: AttachmentCategory[] = ['purchase', 'repairs', 'gifted', 'transfer', 'scrap', 'validation', 'photos'];
  return valid.includes(cat as AttachmentCategory) ? cat as AttachmentCategory : 'other';
}
```

### 4.4. Helper Method: `FileUploadService._getPreviewType()`

```typescript
private _getPreviewType(fileName: string): 'browser' | 'office' | 'download' {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const browserTypes = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'tiff', 'txt', 'csv'];
  const officeTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  if (browserTypes.includes(ext)) return 'browser';
  if (officeTypes.includes(ext)) return 'office';
  return 'download';
}
```

**Purpose**: Determines how the file should be opened at the UI layer without an API call.

### 4.5. New Model File

**No new model file needed** — `IAttachment` and `AttachmentCategory` can be defined inline or as a small `models/IAttachment.ts`.

---

## 5. SharePoint Changes Required

### 5.1. None Required

The `AssetAttachments` document library is already provisioned. The existing folder structure and file storage mechanism is fully capable of supporting the new feature.

**No schema.xml changes needed.**
**No elements.xml changes needed.**
**No new fields needed on any list.**

The feature reads and writes files solely through the existing `AssetAttachments` library and `FileUploadService`.

---

## 6. UI Design

### 6.1. Asset Detail — Right Panel Addition

Insert between Maintenance Schedule and Change History:

```
┌─────────────────────────────────────┐
│ 📎 Attachments                      │
│                                     │
│ [Upload Files]                      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📄 invoice.pdf          2 MB   │ │
│ │ purchase · 10 Jun 2026         │ │
│ │ [Preview] [Delete]             │ │
│ │    ↑ — PDF opens in browser    │ │
│ ├─────────────────────────────────┤ │
│ │ 📊 report.xlsx          1 MB   │ │
│ │ purchase · 10 Jun 2026         │ │
│ │ [Preview] [Delete]             │ │
│ │    ↑ — opens in Office Online  │ │
│ ├─────────────────────────────────┤ │
│ │ 🖼️ photo.jpg           1.2 MB  │ │
│ │ photos · 05 Jun 2026           │ │
│ │ [Preview] [Delete]             │ │
│ │    ↑ — opens in browser tab    │ │
│ ├─────────────────────────────────┤ │
│ │ 📦 backup.zip          10 MB   │ │
│ │ other · 01 Jun 2026            │ │
│ │ [Download] [Delete]            │ │
│ │    ↑ — forced download         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Showing 4 of 4 attachments          │
└─────────────────────────────────────┘
```

**Preview button labels by type**:

| `previewType` | Button label | Action |
|---|---|---|
| `browser` | "Preview" | Opens in new browser tab (PDF renders inline, image displays) |
| `office` | "Preview" | Opens in new tab → SharePoint redirects to Office Online |
| `download` | "Download" | Forces file download via `?download=1` |

### 6.2. Upload Dialog

Simple dialog triggered by "Upload Files" button:

- **File picker**: Single or multi-file (HTML `<input type="file" multiple>`)
- **Category dropdown**: Optional — defaults to `other`; offered for organization
- **Upload button**: Triggers parallel upload
- **Progress**: Inline spinner per file during upload
- **Result**: Success toast + list refresh

### 6.3. Delete Confirmation

Standard Fluent UI Dialog:

- Title: "Delete Attachment?"
- Body: "Are you sure you want to delete `filename.pdf`? This cannot be undone."
- Buttons: [Delete] [Cancel]

### 6.4. Empty State

```
┌─────────────────────────────────────┐
│ 📎 Attachments                      │
│                                     │
│    📭 No attachments uploaded yet.  │
│                                     │
│    [Upload Files]                   │
└─────────────────────────────────────┘
```

---

## 7. Data Flow

### 7.1. Load Attachments Flow

```
AssetDetail mounts
  → AssetAttachmentSection mounts
  → useEffect calls fileService.listFiles(assetId)
  → PnPjs queries AssetAttachments/{assetId}/ folder recursively
  → Returns IAttachment[] sorted by timeCreated desc
  → Renders file list
```

### 7.2. Upload Attachment Flow

```
User clicks "Upload Files"
  → Dialog opens with file picker + category selector
  → User selects file(s) + category
  → For each file:
      fileService.upload(assetId, category, file)
        → ensureFolder(assetId, category)
        → files.addUsingPath(file.name, buffer, { Overwrite: true })
        → Returns { serverRelativeUrl, fileName }
  → On all complete:
      Refresh attachment list
      Show success notification
```

### 7.3. Delete Attachment Flow

```
User clicks "Delete" on a file row
  → Confirmation dialog: "Delete filename.pdf?"
  → User confirms
  → fileService.deleteFile(serverRelativeUrl)
    → files.getByServerRelativePath(url).recycle()
  → Remove item from local state
  → Show success notification
```

### 7.4. Open / Preview Attachment Flow

Preview behavior is determined by `attachment.previewType`, computed at list time by `_getPreviewType()`:

```
User clicks "Open" / "Preview" on a file row
  →
  ├── previewType === 'browser' (PDF, images, text, CSV)
  │     → fileService.getAbsoluteUrl(serverRelativeUrl)
  │     → window.open(absoluteUrl, '_blank')
  │     → SharePoint serves the file inline
  │     → Browser renders PDF natively or displays the image
  │
  ├── previewType === 'office' (DOCX, XLSX, PPTX)
  │     → fileService.getAbsoluteUrl(serverRelativeUrl)
  │     → window.open(absoluteUrl, '_blank')
  │     → SharePoint Online redirects to Office Online Web Viewer
  │     → User can view, edit (if permitted), and download in-browser
  │
  └── previewType === 'download' (ZIP, unsupported)
        → fileService.getAbsoluteUrl(serverRelativeUrl) + '?download=1'
        → window.open(downloadUrl, '_blank')
        → SharePoint forces file download
```

**Why this works**:

| File type | SharePoint native URL behavior |
|---|---|
| PDF | Served with `Content-Type: application/pdf`; browser renders inline |
| PNG/JPG/GIF | Served with image MIME type; browser displays |
| DOCX/XLSX/PPTX | SharePoint detects Office type and issues HTTP 302 redirect to `https://tenant.sharepoint.com/_layouts/15/WopiFrame.aspx?sourcedoc=` → Office Online |
| ZIP | Served with `application/zip`; browser downloads |
| Any unsupported | `?download=1` forces `Content-Disposition: attachment` response header |

---

## 8. Supported File Types and Preview Behavior

| Category | Extensions | `previewType` | SharePoint URL behavior |
|---|---|---|---|
| PDF | `pdf` | `browser` | Served inline; browser renders PDF natively |
| Images | `png`, `jpg`, `jpeg`, `gif`, `svg`, `webp`, `bmp`, `tiff` | `browser` | Served with image MIME type; browser displays |
| Text | `txt`, `csv`, `log`, `json`, `xml`, `md` | `browser` | Served inline or as download depending on MIME |
| Word | `doc`, `docx` | `office` | SharePoint redirects to Office Online (WopiFrame) |
| Excel | `xls`, `xlsx` | `office` | SharePoint redirects to Office Online |
| PowerPoint | `ppt`, `pptx` | `office` | SharePoint redirects to Office Online |
| Archive | `zip`, `rar`, `7z`, `tar`, `gz` | `download` | Force download via `?download=1` |
| Other | everything else | `download` | Force download via `?download=1` |

**Note**: `_getPreviewType()` returns `download` for unrecognized extensions as a safe default — SharePoint will either serve the file or prompt download natively.

---

## 9. Implementation Order

| Phase | Task | Files | Depends On |
|---|---|---|---|
| **1** | Add `IAttachment` model + `AttachmentCategory` type | `models/IAttachment.ts` (new) | — |
| **2** | Add `listFiles()`, `getFilesByCategory()`, `_inferCategory()`, `_getPreviewType()` to FileUploadService | `services/FileUploadService.ts` | Phase 1 |
| **3** | Build `AssetAttachmentSection` component | `components/AssetAttachmentSection.tsx` (new) | Phase 2 |
| **4** | Wire `fileService` into `AssetDetail` (props + render) | `components/AssetDetail.tsx` | Phase 3 |
| **5** | Wire `fileService` into `ItAssetManager` detail view | `components/ItAssetManager.tsx` | Phase 4 |
| **6** | Documentation updates | `PRODUCT_KNOWLEDGE_BASE.md`, `AI_CONTEXT.md` | Phase 5 |
| **7** | Version bump + build verification | `package.json`, `package-solution.json` | Phase 6 |

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **SharePoint folder enumeration performance** | Medium | Medium | Limit recursive queries; use specific sub-folder paths; add client-side pagination if >100 files |
| **File overwrite** | Low | Medium | `Overwrite: true` is already set; append timestamp to filename for safety, or warn on duplicate |
| **Large file uploads** | Low | Medium | SharePoint has a 250 MB default limit; add client-side file size validation (warn at >50 MB) |
| **Permission errors on document library** | Low | High | Catch and display user-friendly errors; verify app has write access to AssetAttachments |
| **Existing inline attachment links become redundant** | Medium | Low | Keep existing inline links for backward compatibility; new section is additive, not replacing |
| **Office Online may require authentication** | Low | Medium | SharePoint handles auth transparently within the same browser session; if user is not authenticated, Office Online prompts login |
| **Folder count explosion** | Low | Low | Each asset gets at most 8 category folders; no unbounded creation |

---

## 11. File Inventory After Implementation

| File | Status |
|---|---|
| `models/IAttachment.ts` | **NEW** |
| `components/AssetAttachmentSection.tsx` | **NEW** |
| `services/FileUploadService.ts` | **MODIFIED** — 4 new methods: `listFiles`, `getFilesByCategory`, `_inferCategory`, `_getPreviewType` |
| `components/AssetDetail.tsx` | **MODIFIED** — new prop, new section render |
| `components/ItAssetManager.tsx` | **MODIFIED** — pass fileService to detail view |
| `sharepoint/assets/schema.xml` | **UNCHANGED** |
| `sharepoint/assets/elements.xml` | **UNCHANGED** |

---

## 12. Open Questions

1. **Category behavior**: Should uploaded files always require a category, or default to `other`?
2. **Multi-file upload**: Should this be allowed from the start, or single-file only in v1?
3. **Folder browsing**: Should the component show a tree of category folders, or just a flat list of all files?
4. **Edit mode**: Should files be deletable from the detail view, or only through the edit form (current behavior)?
