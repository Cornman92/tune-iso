

## Feature Enhancement Plan for ISO Forge

Based on a full audit of the current codebase (40+ components, 600+ line Index.tsx, extensive script generation), here is a comprehensive plan organized into implementation phases.

---

### Phase 1: UI/UX Overhaul (High Impact, Moderate Effort)

**1a. Onboarding Wizard / Getting Started**
- New `GettingStartedWizard.tsx` — modal shown on first visit (localStorage flag) walking users through: select ISO → mount → customize → build
- Quick-start templates: "Gaming PC", "Developer Workstation", "Minimal Server", "Privacy Hardened"

**1b. Collapsible Section Layout**
- Wrap each section in an accordion/collapsible so the 11-section page is not overwhelming
- Auto-collapse completed sections, auto-expand the current workflow step
- Add progress indicators to each section header showing item counts

**1c. Mobile & Small Viewport Fixes**
- Current layout is `lg:grid-cols-[1fr,420px]` which stacks on mobile but the right column is very long
- Add a floating bottom bar on mobile with quick access to Build, Script Preview, and Dashboard
- Make SectionSidebar a bottom sheet on mobile instead of left rail

**1d. Summary Dashboard Redesign**
- Replace the existing `DraggableDashboard` with a compact stats bar that shows all counts inline
- Add a "Build Readiness" score (percentage) based on: ISO selected, mounted, customizations > 0, no critical warnings

---

### Phase 2: Deeper Windows Tooling (Power Features)

**2a. Group Policy Editor**
- New `GroupPolicyEditor.tsx` — visual editor for common GPO settings (Windows Update policies, Defender policies, UAC levels, password policies)
- Generates offline registry commands targeting `HKLM\OFFLINE_SOFTWARE\Policies\...`
- Categories: Security, Network, Update, Privacy, User Experience

**2b. Hosts File Editor**
- New `HostsFileEditor.tsx` — manage entries for `$MountDir\Windows\System32\drivers\etc\hosts`
- Preset blocks: "Block telemetry domains", "Block ad domains", "Custom entries"
- Import from popular hosts file sources (StevenBlack, etc.)

**2c. Task Scheduler Editor**
- New `TaskSchedulerEditor.tsx` — disable/enable scheduled tasks in the offline image
- Common tasks: telemetry tasks, compatibility appraiser, Office telemetry, Windows Error Reporting
- Generates `DISM /Image:$MountDir /Disable-Feature` or `schtasks /Delete` commands in the script

**2d. Windows Firewall Rules**
- New `FirewallRulesEditor.tsx` — create outbound/inbound block rules
- Preset rule sets: "Block all telemetry", "Block UWP apps", "Strict outbound only"
- Generates `netsh advfirewall` commands for SetupComplete.cmd

**2e. Power Plan Customizer**
- New `PowerPlanEditor.tsx` — configure power plan settings (sleep timeouts, CPU min/max, hibernate, USB suspend)
- Generates `powercfg` commands

---

### Phase 3: Build Pipeline Enhancements

**3a. Build History & Versioning**
- New `BuildHistory.tsx` — stores build configs in localStorage with timestamps
- Compare any two past builds side-by-side (reuse `ConfigComparison` logic)
- Restore/re-apply any historical build config

**3b. Build Queue (Electron only)**
- New `BuildQueue.tsx` — queue multiple ISOs for sequential processing
- Each queue item: source ISO path, config preset, output name
- Progress tracking per-item with overall queue progress

**3c. Checksum Verification**
- New `ChecksumVerifier.tsx` — calculate and verify SHA-256/MD5 of source ISOs
- Compare against known Microsoft ISO hashes
- In Electron: use `crypto` module via IPC; in browser: use SubtleCrypto API on uploaded file

**3d. CI/CD Export**
- Extend `PowerShellExport` with a "GitHub Actions" export format
- Generates a `.github/workflows/build-iso.yml` that runs the DISM script on a Windows runner
- Also export as Docker-compatible batch script

---

### Phase 4: Community & Sharing

**4a. Preset Marketplace / Library**
- New `PresetLibrary.tsx` — built-in library of curated presets with descriptions and ratings
- Categories: Gaming, Privacy, Minimal, Enterprise, Developer
- Each preset is a JSON config that can be one-click imported

**4b. Export as GitHub Gist**
- Add "Share as Gist" button to ProjectManager
- Generates a public/private Gist with the project JSON + generated script
- Returns a shareable URL

**4c. Import Config from URL**
- Add URL input to ProjectManager import dialog
- Fetch JSON config from any URL (Gist, Pastebin, raw GitHub)
- Validate with `projectDataSchema` before applying

---

### Phase 5: Script Quality & Validation

**5a. Script Dry-Run Simulator**
- New `ScriptSimulator.tsx` — walks through the generated script line-by-line
- Shows what each command does in plain English
- Highlights potentially dangerous commands (service disabling, component removal)

**5b. Conflict Detection Engine**
- Enhance `DependencyWarnings.tsx` to detect:
  - Services required by selected programs (e.g., Docker needs Hyper-V)
  - Registry tweaks that contradict each other
  - Components removed that are needed by selected features

**5c. Script Diff Between Saves**
- Show a line-by-line diff of the generated script between the current state and last saved/exported state

---

### Phase 6: Electron-Specific Enhancements

**6a. System Tray Integration**
- Minimize to system tray, show build progress notifications
- Right-click tray menu: Open, Start Build, Quit

**6b. Real ISO Mounting**
- Use `DISM /Mount-Wim` via IPC instead of the simulated mount
- Stream real mount progress to the UI
- Detect already-mounted images and offer to use them

**6c. Native Context Menus**
- Right-click on ISO files in Explorer → "Open with ISO Forge"
- File association registration during install

---

### Implementation Priority (Suggested Order)

| Priority | Feature | Files | Effort |
|----------|---------|-------|--------|
| 1 | Collapsible sections + progress | Index.tsx, new wrapper | Small |
| 2 | Preset Library (built-in) | New PresetLibrary.tsx | Medium |
| 3 | Group Policy Editor | New GroupPolicyEditor.tsx | Medium |
| 4 | Hosts File Editor | New HostsFileEditor.tsx | Small |
| 5 | Build History | New BuildHistory.tsx | Medium |
| 6 | Conflict Detection v2 | DependencyWarnings.tsx | Medium |
| 7 | Power Plan Customizer | New PowerPlanEditor.tsx | Small |
| 8 | Firewall Rules Editor | New FirewallRulesEditor.tsx | Medium |
| 9 | Task Scheduler Editor | New TaskSchedulerEditor.tsx | Medium |
| 10 | Script Simulator | New ScriptSimulator.tsx | Medium |
| 11 | Checksum Verifier | New ChecksumVerifier.tsx | Small |
| 12 | Onboarding Wizard | New GettingStartedWizard.tsx | Small |
| 13 | Mobile floating bar | Index.tsx | Small |
| 14 | CI/CD Export | PowerShellExport.tsx | Small |
| 15 | Build Queue (Electron) | New BuildQueue.tsx | Large |

Total: ~15 new components, ~5 modified files. Can be implemented incrementally — each feature is self-contained.

