import { useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UndoRedoOptions<T> {
  maxHistory?: number;
  getSnapshot: () => T;
  applySnapshot: (snapshot: T) => void;
}

const useUndoRedo = <T>({ maxHistory = 50, getSnapshot, applySnapshot }: UndoRedoOptions<T>) => {
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const isApplying = useRef(false);

  const pushState = useCallback(() => {
    if (isApplying.current) return;
    const snapshot = getSnapshot();
    past.current = [...past.current.slice(-(maxHistory - 1)), snapshot];
    future.current = [];
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
    toast.success('Redo', { description: `${future.current.length} steps remaining` });
  }, [getSnapshot, applySnapshot]);

  return { pushState, undo, redo, canUndo: () => past.current.length > 0, canRedo: () => future.current.length > 0 };
};

export default useUndoRedo;
