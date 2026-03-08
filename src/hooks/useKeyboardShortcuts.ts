import { useEffect } from 'react';

interface ShortcutHandlers {
  onExportProject: () => void;
  onExportScript: () => void;
  onToggleTheme: () => void;
}

const useKeyboardShortcuts = ({ onExportProject, onExportScript, onToggleTheme }: ShortcutHandlers) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          onExportProject();
          break;
        case 'e':
          e.preventDefault();
          onExportScript();
          break;
        case 'd':
          e.preventDefault();
          onToggleTheme();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onExportProject, onExportScript, onToggleTheme]);
};

export default useKeyboardShortcuts;
