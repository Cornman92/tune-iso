# Building ISO Forge as a Desktop App (Windows 11 x64)

## Prerequisites

- [Node.js](https://nodejs.org/) v18+ installed
- Git installed

## Steps

```bash
# 1. Clone the repo
git clone <your-github-repo-url>
cd <repo-folder>

# 2. Install dependencies
npm install

# 3. Build the Vite frontend
npm run build

# 4. Build the Electron installer (.exe)
npm run electron:build
```

## Output

The Windows installer (`.exe`) will be in the `release/` folder.

## Development

To run the app in dev mode (with hot reload):

```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Launch Electron pointing at dev server
npm run electron:dev
```

## Notes

- Targets **Windows 11 x64 (25H2)**
- Uses NSIS installer format
- Built with `electron-builder`
- Electron version: 33.x (Chromium 130+, supports Windows 11 25H2)
