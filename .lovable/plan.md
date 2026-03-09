

## Plan: Prepare Project for Electron (Windows 11 x64 25H2)

This plan adds Electron configuration files and build scripts so you can compile the app into a standalone `.exe` desktop application after cloning the repo from GitHub.

**Important**: Lovable cannot compile or run Electron itself. These files prepare the project so that after you clone from GitHub, you run `npm install && npm run electron:build` locally to produce the `.exe`.

### Step 1: First, remix the project

Before making changes, go to **Project Name (top left) → Settings → Remix this project** to create a copy. Then apply the following changes to the remix.

### Step 2: Add Electron main process file

Create `electron/main.cjs` — the Electron entry point that:
- Creates a `BrowserWindow` (1280x800) loading the built `index.html`
- Sets `nodeIntegration: false`, `contextIsolation: true` for security
- Targets Windows 11 x64 with appropriate settings

### Step 3: Add Electron preload script

Create `electron/preload.cjs` — minimal preload exposing platform info via `contextBridge`.

### Step 4: Update `package.json`

Add these fields and scripts:
- `"main": "electron/main.cjs"` — Electron entry
- `"author"` and `"description"` fields (required by electron-builder)
- Scripts: `electron:dev`, `electron:build`, `electron:pack`
- `"build"` config block for `electron-builder` targeting `win` (nsis installer, x64)
- Add `electron` and `electron-builder` as devDependencies

### Step 5: Update `vite.config.ts`

Add `base: "./"` so built assets use relative paths (required for Electron's `file://` protocol).

### Step 6: Add `.electron-builder.env` note

Create `ELECTRON_BUILD.md` with instructions for building the desktop app locally:
```
1. Clone the repo
2. npm install
3. npm run build
4. npm run electron:build
5. Find installer in dist/
```

### Files to create/modify:
- **Create**: `electron/main.cjs`, `electron/preload.cjs`, `ELECTRON_BUILD.md`
- **Modify**: `package.json` (add Electron deps, scripts, build config), `vite.config.ts` (add `base: "./"`)

