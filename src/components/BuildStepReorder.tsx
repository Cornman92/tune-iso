import { useState, useCallback } from 'react';
import { GripVertical, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BuildStep {
  id: string;
  label: string;
  enabled: boolean;
}

const DEFAULT_STEPS: BuildStep[] = [
  { id: 'components', label: 'Remove Components', enabled: true },
  { id: 'services', label: 'Disable Services', enabled: true },
  { id: 'registry', label: 'Registry Tweaks', enabled: true },
  { id: 'drivers', label: 'Inject Drivers', enabled: true },
  { id: 'updates', label: 'Slipstream Updates', enabled: true },
  { id: 'customizations', label: 'Apply Customizations', enabled: true },
];

interface BuildStepReorderProps {
  steps: BuildStep[];
  onReorder: (steps: BuildStep[]) => void;
}

const BuildStepReorder = ({ steps, onReorder }: BuildStepReorderProps) => {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const move = useCallback((from: number, to: number) => {
    if (to < 0 || to >= steps.length) return;
    const next = [...steps];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onReorder(next);
  }, [steps, onReorder]);

  const handleDragStart = (idx: number) => (e: React.DragEvent) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setOverIdx(idx);
  };

  const handleDrop = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      move(dragIdx, idx);
    }
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  const reset = () => onReorder(DEFAULT_STEPS.map(s => ({ ...s })));

  const toggleStep = (idx: number) => {
    const next = [...steps];
    next[idx] = { ...next[idx], enabled: !next[idx].enabled };
    onReorder(next);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Build Step Order</h3>
        <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs font-mono gap-1 text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground font-mono mb-3">Drag to reorder execution priority</p>
      <div className="space-y-1">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            draggable
            onDragStart={handleDragStart(idx)}
            onDragOver={handleDragOver(idx)}
            onDrop={handleDrop(idx)}
            onDragEnd={handleDragEnd}
            className={cn(
              'flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing select-none',
              dragIdx === idx && 'opacity-40',
              overIdx === idx && dragIdx !== idx && 'border-primary bg-primary/5',
              overIdx !== idx && 'border-transparent',
              !step.enabled && 'opacity-40',
            )}
          >
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-mono text-muted-foreground w-5">{idx + 1}.</span>
            <button
              onClick={() => toggleStep(idx)}
              className={cn(
                'w-3.5 h-3.5 rounded border shrink-0 transition-colors',
                step.enabled ? 'bg-primary border-primary' : 'border-muted-foreground bg-transparent'
              )}
            />
            <span className={cn(
              'text-xs font-mono flex-1',
              step.enabled ? 'text-foreground' : 'text-muted-foreground line-through'
            )}>
              {step.label}
            </span>
            <div className="flex gap-0.5">
              <button onClick={() => move(idx, idx - 1)} disabled={idx === 0} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20">
                <ArrowUp className="w-3 h-3" />
              </button>
              <button onClick={() => move(idx, idx + 1)} disabled={idx === steps.length - 1} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20">
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { DEFAULT_STEPS };
export default BuildStepReorder;
