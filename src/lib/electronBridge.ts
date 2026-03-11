/**
 * Typed abstraction layer for Electron IPC.
 * Provides safe fallbacks when running in the browser.
 */

interface ElectronAPI {
  platform: string;
  arch: string;
  isElectron: boolean;
  openFileDialog: (options: {
    title?: string;
    filters?: { name: string; extensions: string[] }[];
    properties?: string[];
  }) => Promise<string[] | null>;
  saveFileDialog: (options: {
    title?: string;
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }) => Promise<string | null>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, data: string) => Promise<void>;
  executeDISM: (args: string[]) => Promise<{ code: number; stdout: string; stderr: string }>;
  getAppVersion: () => Promise<string>;
  onUpdateAvailable: (callback: (info: { version: string }) => void) => void;
  onUpdateDownloaded: (callback: (info: { version: string }) => void) => void;
  installUpdate: () => void;
  checkForUpdates: () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export const isElectron = (): boolean => {
  return !!window.electronAPI?.isElectron;
};

export const getPlatformInfo = () => {
  if (!isElectron()) return { platform: 'web', arch: 'unknown' };
  return {
    platform: window.electronAPI!.platform,
    arch: window.electronAPI!.arch,
  };
};

export const openFileDialog = async (options: {
  title?: string;
  filters?: { name: string; extensions: string[] }[];
  properties?: string[];
}): Promise<string[] | null> => {
  if (!isElectron()) return null;
  return window.electronAPI!.openFileDialog(options);
};

export const saveFileDialog = async (options: {
  title?: string;
  defaultPath?: string;
  filters?: { name: string; extensions: string[] }[];
}): Promise<string | null> => {
  if (!isElectron()) return null;
  return window.electronAPI!.saveFileDialog(options);
};

export const readFile = async (filePath: string): Promise<string | null> => {
  if (!isElectron()) return null;
  return window.electronAPI!.readFile(filePath);
};

export const writeFile = async (filePath: string, data: string): Promise<boolean> => {
  if (!isElectron()) return false;
  await window.electronAPI!.writeFile(filePath, data);
  return true;
};

export const executeDISM = async (
  args: string[]
): Promise<{ code: number; stdout: string; stderr: string } | null> => {
  if (!isElectron()) return null;
  return window.electronAPI!.executeDISM(args);
};

export const getAppVersion = async (): Promise<string> => {
  if (!isElectron()) return 'web';
  return window.electronAPI!.getAppVersion();
};

export const checkForUpdates = (): void => {
  if (isElectron()) window.electronAPI!.checkForUpdates();
};

export const installUpdate = (): void => {
  if (isElectron()) window.electronAPI!.installUpdate();
};

export const onUpdateAvailable = (callback: (info: { version: string }) => void): void => {
  if (isElectron()) window.electronAPI!.onUpdateAvailable(callback);
};

export const onUpdateDownloaded = (callback: (info: { version: string }) => void): void => {
  if (isElectron()) window.electronAPI!.onUpdateDownloaded(callback);
};
