# Project Rules — IT Asset Lifecycle Manager

## 1. Onboarding — Read First

Before writing any code or making changes to this project, read these files in order:

1. **AI_CONTEXT.md** — High-signal overview for AI assistants and developers starting a new session
2. **DOCUMENTATION.md** — Full technical documentation covering architecture, components, services, deployment
3. **CHANGELOG.md** — Release history and version tracking

This ensures context is loaded before any modification begins.

---

## 2. Code Change Requirements

Every code change **must** update all four of the following:

| File | What to Update |
|---|---|
| `package.json` | Bump `version` field (semver) |
| `config/package-solution.json` | Bump `solution.version` and (if schema changed) `features[0].version` to 4-part match |
| `DOCUMENTATION.md` | Reflect any new components, services, props, flows, or behavioral changes |
| `CHANGELOG.md` | Add entry under `## [Unreleased]` or a new version header with `### Added` / `### Changed` / `### Fixed` sections |
| `AI_CONTEXT.md` | Update architecture summary, component list, service descriptions, deployment steps, or rules as needed |

### Version Synchronization

Before any production build:

- `package.json` version and `config/package-solution.json` → `solution.version` must match (e.g. `1.1.0` ↔ `1.1.0.0`)
- If list schemas (`sharepoint/assets/elements.xml`) changed, also bump `config/package-solution.json` → `features[0].version`

---

## 3. Pre-Deployment Checklist

Before running `npm run bundle && npm run package` to generate a `.sppkg`:

- [ ] `package.json` version is incremented
- [ ] `config/package-solution.json` version matches (4-part format)
- [ ] Feature version bumped if list schema changed
- [ ] `DOCUMENTATION.md` reflects all changes
- [ ] `CHANGELOG.md` has a new version entry
- [ ] `AI_CONTEXT.md` is up to date
- [ ] All changes committed to version control

---

## 4. Documentation Completeness Rule

**No feature is complete until its documentation is updated.**

- New components → add to component list in DOCUMENTATION.md §4 and folder structure in §3
- New services or service methods → add to DOCUMENTATION.md §6 and AI_CONTEXT.md §5
- New list fields → update field tables in DOCUMENTATION.md §5 and README.md
- New Power Automate events → add to AI_CONTEXT.md §5 and readme flow table
- New dependencies → update `package.json` list in DOCUMENTATION.md §2
- Changed status transitions → update state machine diagram in DOCUMENTATION.md §7 and IAsset.ts

---

## 5. State Machine Integrity

All asset status transitions must be enforced through `ASSET_STATUS_TRANSITIONS` in `src/webparts/itAssetManager/models/IAsset.ts`.

- Never allow direct status modification without using `AssetService.changeStatus()`
- Statuses requiring notes (`Lost`, `Stolen`, `Gifted`, `Transferred`, `Disposed`) must enforce the note at the UI layer and API layer
- Transitions not in `ASSET_STATUS_TRANSITIONS` must be rejected

---

## 6. Code Quality

- No `@ts-ignore`, `any` casts, or linter suppressions
- Use PnP.js v3 exclusively for SharePoint data access
- Use clean selectors (`ASSET_SELECT` pattern) to fetch only required fields
- Prefer functional components with hooks over class components

---

## 7. File Change Policy

- `AI_CONTEXT.md` — Update on architecture/service/component changes
- `DOCUMENTATION.md` — Update on any feature, schema, or behavioral change
- `CHANGELOG.md` — Update per release or significant change
- `README.md` — Update on setup/deployment/permission changes

---

## 8. Build & Deploy Commands

```bash
npm install          # Install dependencies
npm run clean        # Clean build artifacts
npm run bundle       # Production bundle (--ship)
npm run package      # Package into .sppkg
```

Output: `sharepoint/solution/it-asset-manager.sppkg`
