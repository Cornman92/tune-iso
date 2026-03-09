import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UndoRedoOptions<T> {
  maxHistory?: number;
  getSnapshot: () => T;
  applySnapshot: (snapshot: T) => void;
}

export interface UndoRedoState<T> {
  past: T[];
  future: T[];
}

const useUndoRedo = <T>({ maxHistory = 50, getSnapshot, applySnapshot }: UndoRedoOptions<T>) => {
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const isApplying = useRef(false);
  const [historyVersion, setHistoryVersion] = useState(0);

  const pushState = useCallback(() => {
    if (isApplying.current) return;
    const snapshot = getSnapshot();
    past.current = [...past.current.slice(-(maxHistory - 1)), snapshot];
    future.current = [];
    setHistoryVersion(v => v + 1);
  }, [getSnapshot, maxHistory]);

  const undo = useCallback(() => {
    if (past.current.length === 0) {
      toast.info('Nothing to undo');
      return;
    }
    const current = getSnapshot();
    future.current = [current, ...future.current];
    const prev = past.current.pop()!;
    isApplying.current = true;
    applySnapshot(prev);
    isApplying.current = false;
    setHistoryVersion(v => v + 1);
    toast.success('Undo', { description: `${past.current.length} steps remaining` });
  }, [getSnapshot, applySnapshot]);

  const redo = useCallback(() => {
    if (future.current.length === 0) {
      toast.info('Nothing to redo');
      return;
    }
    const current = getSnapshot();
    past.current = [...past.current, current];
    const next = future.current.shift()!;
    isApplying.current = true;
    applySnapshot(next);
    isApplying.current = false;
    setHistoryVersion(v => v + 1);
    toast.success('Redo', { description: `${future.current.length} steps remaining` });
  }, [getSnapshot, applySnapshot]);

  const jumpTo = useCallback((index: number) => {
    // index is in past array (0 = oldest)
    if (index < 0 || index >= past.current.length) return;
    const current = getSnapshot();
    // Everything after index goes to future
    const movingToFuture = past.current.slice(index + 1);
    future.current = [...movingToFuture, current, ...future.current];
    const target = past.current[index];
    past.current = past.current.slice(0, index);
    isApplying.current = true;
    applySnapshot(target);
    isApplying.current = false;
    setHistoryVersion(v => v + 1);
    toast.success('Jumped to snapshot', { description: `Step ${index + 1}` });
  }, [getSnapshot, applySnapshot]);

  const getHistory = useCallback((): UndoRedoState<T> => ({
    past: [...past.current],
    future: [...future.current],
  }), []);

  return {
    pushState,
    undo,
    redo,
    jumpTo,
    canUndo: () => past.current.length > 0,
    canRedo: () => future.current.length > 0,
    getHistory,
    historyVersion,
  };
};

export default useUndoRedo;
