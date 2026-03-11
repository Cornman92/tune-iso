

## Analysis

The app is currently a **UI-only simulator** — all operations (mounting, building, unmounting) use fake `setTimeout` progress bars and produce no real output. The script generation also has gaps: the "customizations" section only outputs comments listing program names instead of actual installation commands.

There are two distinct categories of work here:

### What Lovable CAN do (frontend + Electron config):
1. **Improve script generation** — make the output actually functional PowerShell/CMD
2. **Add Electron IPC infrastructure** — native file dialogs, auto-update config, preload API
3. **Add missing dependencies** to `package.json`
4. **Wire up the UI** to use Electron APIs when available (file picker, save dialog)

### What Lovable CANNOT do:
- Compile or test the Electron app (requires local Windows + Node.js)
- Actually run DISM commands (requires Windows ADK on the build machine)
- The app will always be a **script generator** in the browser preview; real ISO editing only works in the compiled Electron desktop build

---

## Plan

### 1. Fix Script Generation (the core problem)

The `customizations` section in both `LiveScriptPreview.tsx` and `PowerShellExport.tsx` currently only outputs comments like `# Programs: Chrome, Firefox`. This needs to generate real, runnable commands:

- **Programs**: Generate `winget install --id <package-id> --accept-source-agreements --accept-package-agreements` commands using a mapping from program IDs to winget package IDs (e.g., `chrome` → `Google.Chrome`)
- **Tweaks**: Generate actual registry commands for each tweak (e.g., "Disable Telemetry" → `REG ADD "HKLM\..."`)
- **Optimizations**: Generate actual PowerShell commands (e.g., "Disable Superfetch" → `Stop-Service SysMain; Set-Service SysMain -StartupType Disabled`)

Files: `src/data/customizations.ts` (add `wingetId` and `script` fields), `src/components/LiveScriptPreview.tsx`, `src/components/PowerShellExport.tsx`

### 2. Add Electron IPC for Native File Dialog

Expand `electron/preload.cjs` to expose: