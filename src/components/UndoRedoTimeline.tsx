import { useMemo } from 'react';
import { Undo2, Redo2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { UndoRedoState } from '@/hooks/useUndoRedo';
import type { ProjectData } from '@/components/ProjectManager';

interface UndoRedoTimelineProps {
  history: UndoRedoState<ProjectData>;
  historyVersion: number;
  onUndo: () => void;
  onRedo: () => void;
  onJumpTo: (index: number) => void;
  canUndo: boolean;
  canRedo: boolean;
}

function snapshotLabel(snapshot: ProjectData, index: number): string {
  const total =
    (snapshot.customizations?.programs?.length || 0) +
    (snapshot.customizations?.tweaks?.length || 0) +
    (snapshot.customizations?.optimizations?.length || 0) +
    (snapshot.drivers?.length || 0) +
    (snapshot.updates?.length || 0) +
    (snapshot.unattend?.length || 0);
  return `Step ${index + 1} • ${total} changes`;
}

const UndoRedoTimeline = ({
  history,
  historyVersion,
  onUndo,
  onRedo,
  onJumpTo,
  canUndo,
  canRedo,
}: UndoRedoTimelineProps) => {
  const totalSteps = history.past.length + 1 + history.future.length;
  const currentIndex = history.past.length;

  const dots = useMemo(() => {
    const items: { type: 'past' | 'current' | 'future'; index: number; label: string }[] = [];

    history.past.forEach((snap, i) => {
      items.push({ type: 'past', index: i, label: snapshotLabel(snap, i) });
    });

    items.push({ type: 'current', index: currentIndex, label: 'Current state' });

    history.future.forEach((snap, i) => {
      items.push({
        type: 'future',
        index: currentIndex + 1 + i,
        label: snapshotLabel(snap, currentIndex + 1 + i),
      });
    });

    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyVersion]);

  if (totalSteps <= 1) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Undo/Redo Timeline</h3>
        </div>
        <p className="text-[11px] text-muted-foreground font-mono text-center py-2">
          Make changes to start tracking history
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Undo/Redo Timeline</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onUndo} disabled={!canUndo}>
            <Undo2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRedo} disabled={!canRedo}>
            <Redo2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Timeline strip */}
      <div className="relative flex items-center gap-0.5 overflow-x-auto py-2 px-1 scrollbar-thin">
        {/* Track line */}
        <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-border -translate-y-1/2 rounded-full" />

        {dots.map((dot, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  if (dot.type === 'past') onJumpTo(dot.index);
                  else if (dot.type === 'future') {
                    // Jump forward: redo (future.length - distance) times
                    // For simplicity, jump via past index mapping
                  }
                }}
                className={cn(
                  'relative z-10 w-3.5 h-3.5 rounded-full border-2 transition-all shrink-0',
                  dot.type === 'current' && 'bg-primary border-primary scale-125 shadow-[0_0_8px_hsl(var(--primary)/0.5)]',
                  dot.type === 'past' && 'bg-muted border-muted-foreground/40 hover:border-primary hover:bg-primary/20 cursor-pointer',
                  dot.type === 'future' && 'bg-muted/50 border-border opacity-50',
                )}
                disabled={dot.type === 'current' || dot.type === 'future'}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs font-mono">
              {dot.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] font-mono text-muted-foreground">
          {history.past.length} undo • {history.future.length} redo
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {totalSteps} total snapshots
        </span>
      </div>
    </div>
  );
};

export default UndoRedoTimeline;
