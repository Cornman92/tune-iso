

## Implementation Plan: Script Simulator, Onboarding Wizard, and Build Pipeline (Phase 3)

### 1. Script Dry-Run Simulator — `src/components/ScriptSimulator.tsx`

A new component placed in the right column (after LiveScriptPreview) that parses the generated script and displays each command with:
- **Plain English explanation** — pattern-match on command prefixes (`DISM /Mount-Wim` → "Mounts the Windows image for offline editing", `REG ADD` → "Modifies registry key X to value Y", `winget install` → "Installs program X on first boot")
- **Risk badge** per line — green (safe: comments, variables), yellow (moderate: registry tweaks, feature toggles), red (aggressive: service disabling for critical services, component removal, firewall blocks)
- **Step-through mode** — Play/Pause button that highlights one line at a time with a 500ms interval, auto-scrolling
- **Summary bar** at top showing total commands, safe/moderate/aggressive counts

It receives the same `exportCustomizations`, `exportServices`, etc. refs and `changeTrigger` as LiveScriptPreview, reusing the same script generation logic (extract into a shared `generateScript()` utility in `src/lib/scriptGenerator.ts` to avoid duplication).

### 2. Onboarding Wizard — `src/components/OnboardingWizard.tsx`

A multi-step dialog shown on first visit (`localStorage.getItem('isoforge-onboarded')` check):

- **Step 1**: Welcome screen — "ISO Forge helps you customize Windows images" with app screenshot/illustration
- **Step 2**: Workflow overview — visual 4-step flow: Select ISO → Mount → Customize → Build
- **Step 3**: Quick-start template selection — reuse the preset configs from `PresetLibrary.tsx` (Gaming, Privacy, Minimal, Developer, Enterprise) with one-click apply
- **Step 4**: "You're ready!" — close and set localStorage flag

Props: `onApplyPreset` callback to wire into the existing `importCustomizations`/`importServices`/`importComponents` refs. Added to `Index.tsx` at the top level.

### 3. Build History & Versioning — `src/components/BuildHistory.tsx`

- Stores build snapshots in `localStorage` under key `isoforge-build-history` (array of `{ id, name, timestamp, config: ProjectData }`)
- Auto-saves on every "Commit/Build" action from CommitPanel (add `onBuildComplete` callback)
- UI: collapsible list showing past builds with timestamps, "Restore" and "Delete" buttons
- "Compare" button opens existing `ConfigComparison` dialog pre-loaded with the selected historical config vs current

### 4. Checksum Verifier — `src/components/ChecksumVerifier.tsx`

- Input: file from IsoUploader (the already-selected `File` object)
- Uses `SubtleCrypto` API (`crypto.subtle.digest('SHA-256', arrayBuffer)`) to compute hash in browser
- Progress bar during hashing (chunked `FileReader` with progress)
- Optional comparison input to paste known Microsoft SHA-256 hash and show match/mismatch
- Small component placed near the ISO source section

### 5. Shared Script Generator — `src/lib/scriptGenerator.ts`

Extract the script generation logic currently duplicated between `LiveScriptPreview.tsx` and `PowerShellExport.tsx` into a shared pure function:
```
generateScript(config): { lines: string[], sections: Section[] }
```
This avoids triple-maintaining the same logic (LivePreview, PowerShellExport, and now ScriptSimulator).

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/ScriptSimulator.tsx` | Dry-run simulator with explanations and risk highlights |
| `src/components/OnboardingWizard.tsx` | First-visit wizard with quick-start templates |
| `src/components/BuildHistory.tsx` | Build history with localStorage persistence |
| `src/components/ChecksumVerifier.tsx` | SHA-256 hash computation and verification |
| `src/lib/scriptGenerator.ts` | Shared script generation utility |

### Files to Modify
| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Add lazy imports for all 4 new components, wire OnboardingWizard at top, add BuildHistory in right column, add ChecksumVerifier near source section, add ScriptSimulator after LiveScriptPreview |
| `src/components/LiveScriptPreview.tsx` | Refactor to use shared `generateScript()` from scriptGenerator.ts |
| `src/components/PowerShellExport.tsx` | Refactor to use shared `generateScript()` |

### Implementation Order
1. `scriptGenerator.ts` (shared utility — foundation)
2. Refactor LiveScriptPreview + PowerShellExport to use it
3. `ScriptSimulator.tsx` (uses scriptGenerator)
4. `OnboardingWizard.tsx` (standalone)
5. `BuildHistory.tsx` (standalone)
6. `ChecksumVerifier.tsx` (standalone)
7. Wire everything into `Index.tsx`

