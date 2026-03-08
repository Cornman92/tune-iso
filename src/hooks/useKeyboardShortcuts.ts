import { useEffect } from 'react';

interface ShortcutHandlers {
  onExportProject: () => void;
  onExportScript: () => void;
  onToggleTheme: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

const useKeyboardShortcuts = ({ onExportProject, onExportScript, onToggleTheme, onUndo, onRedo }: ShortcutHandlers) => {
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
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            onRedo?.();
          } else {
            onUndo?.();
          }
          break;
        case 'y':
          e.preventDefault();
          onRedo?.();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onExportProject, onExportScript, onToggleTheme, onUndo, onRedo]);
};

export default useKeyboardShortcuts;
