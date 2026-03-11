const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { execFile } = require('child_process');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'ISO Forge',
    icon: path.join(__dirname, '..', 'public', 'favicon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Load the built Vite app
  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── IPC Handlers ──────────────────────────────────────────────

// Open native file dialog
ipcMain.handle('open-file-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: options.title || 'Select File',
    filters: options.filters || [],
    properties: options.properties || ['openFile'],
  });
  if (result.canceled) return null;
  return result.filePaths;
});

// Save file dialog
ipcMain.handle('save-file-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: options.title || 'Save File',
    defaultPath: options.defaultPath || '',
    filters: options.filters || [],
  });
  if (result.canceled) return null;
  return result.filePath;
});

// Read file contents
ipcMain.handle('read-file', async (event, filePath) => {
  return fs.readFileSync(filePath, 'utf-8');
});

// Write file contents
ipcMain.handle('write-file', async (event, filePath, data) => {
  fs.writeFileSync(filePath, data, 'utf-8');
});

// Execute DISM command (requires admin)
ipcMain.handle('execute-dism', async (event, args) => {
  return new Promise((resolve) => {
    execFile('DISM.exe', args, { timeout: 600000 }, (error, stdout, stderr) => {
      resolve({
        code: error ? error.code || 1 : 0,
        stdout: stdout || '',
        stderr: stderr || '',
      });
    });
  });
});

// Get app version
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// ── Auto-Update ───────────────────────────────────────────────
function setupAutoUpdate() {
  try {
    const { autoUpdater } = require('electron-updater');

    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('update-available', (info) => {
      if (mainWindow) {
        mainWindow.webContents.send('update-available', { version: info.version });
      }
    });

    autoUpdater.on('update-downloaded', (info) => {
      if (mainWindow) {
        mainWindow.webContents.send('update-downloaded', { version: info.version });
      }
    });

    ipcMain.on('install-update', () => {
      autoUpdater.quitAndInstall();
    });

    ipcMain.on('check-for-updates', () => {
      autoUpdater.checkForUpdates().catch(() => {});
    });

    // Check for updates 5 seconds after launch
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(() => {});
    }, 5000);
  } catch (e) {
    // electron-updater not installed or in dev mode — skip
    console.log('Auto-updater not available:', e.message);
  }
}

// ── App Lifecycle ─────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdate();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
