import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Settings, HardDriveDownload, Database, Cog, Package, Download, FileCode,
  BarChart3, GripVertical, Eye, EyeOff, RotateCcw, TrendingUp, Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DashboardWidget {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  getValue: () => number;
  description: string;
  riskLevel?: 'safe' | 'moderate' | 'aggressive';
  visible: boolean;
}

interface DraggableDashboardProps {
  customizationCount: number;
  driverCount: number;
  registryCount: number;
  serviceCount: number;
  componentCount: number;
  updateCount: number;
  unattendCount: number;
  isMounted: boolean;
  buildStepCount: number;
}

const STORAGE_KEY = 'iso-forge-dashboard-layout';

const riskBadge: Record<string, { label: string; className: string }> = {
  safe: { label: 'Safe', className: 'bg-success/20 text-success' },
  moderate: { label: 'Moderate', className: 'bg-warning/20 text-warning' },
  aggressive: { label: 'Aggressive', className: 'bg-destructive/20 text-destructive' },
};

const DraggableDashboard = ({
  customizationCount,
  driverCount,
  registryCount,
  serviceCount,
  componentCount,
  updateCount,
  unattendCount,
  isMounted,
  buildStepCount,
}: DraggableDashboardProps) => {
  const defaultWidgets: DashboardWidget[] = [
    { id: 'customizations', label: 'Customizations', icon: Settings, color: 'text-primary', getValue: () => customizationCount, description: 'Programs, tweaks & optimizations', riskLevel: 'safe', visible: true },
    { id: 'drivers', label: 'Drivers', icon: HardDriveDownload, color: 'text-primary', getValue: () => driverCount, description: 'Injected driver packages', riskLevel: 'safe', visible: true },
    { id: 'registry', label: 'Registry', icon: Database, color: 'text-primary', getValue: () => registryCount, description: 'Registry key modifications', riskLevel: 'moderate', visible: true },
    { id: 'services', label: 'Services', icon: Cog, color: 'text-warning', getValue: () => serviceCount, description: 'Disabled Windows services', riskLevel: 'moderate', visible: true },
    { id: 'components', label: 'Components', icon: Package, color: 'text-destructive', getValue: () => componentCount, description: 'Removed appx packages', riskLevel: 'aggressive', visible: true },
    { id: 'updates', label: 'Updates', icon: Download, color: 'text-success', getValue: () => updateCount, description: 'Slipstreamed updates', riskLevel: 'safe', visible: true },
    { id: 'unattend', label: 'Unattend', icon: FileCode, color: 'text-primary', getValue: () => unattendCount, description: 'Answer file settings', visible: true },
    { id: 'buildsteps', label: 'Build Steps', icon: TrendingUp, color: 'text-primary', getValue: () => buildStepCount, description: 'Active build pipeline steps', visible: true },
    { id: 'status', label: 'Mount Status', icon: Shield, color: isMounted ? 'text-success' : 'text-muted-foreground', getValue: () => isMounted ? 1 : 0, description: isMounted ? 'Image mounted & ready' : 'No image mounted', visible: true },
  ];

  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.order) return parsed.order;
      }
    } catch { /* ignore */ }
    return defaultWidgets.map(w => w.id);
  });

  const [hiddenWidgets, setHiddenWidgets] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.hidden) return new Set(parsed.hidden);
      }
    } catch { /* ignore */ }
    return new Set<string>();
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragCounter = useRef(0);

  // Persist layout
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      order: widgetOrder,
      hidden: Array.from(hiddenWidgets),
    }));
  }, [widgetOrder, hiddenWidgets]);

  // Build ordered widget list with current values
  const widgets = widgetOrder
    .map(id => defaultWidgets.find(w => w.id === id))
    .filter(Boolean) as DashboardWidget[];

  // Add any new widgets not in saved order
  defaultWidgets.forEach(w => {
    if (!widgetOrder.includes(w.id)) {
      widgets.push(w);
    }
  });

  const visibleWidgets = widgets.filter(w => !hiddenWidgets.has(w.id));
  const totalChanges = visibleWidgets.reduce((sum, w) => sum + w.getValue(), 0);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    // Make drag image semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedId(null);
    setDragOverId(null);
    dragCounter.current = 0;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverId(targetId);
  }, []);

  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverId(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId === targetId) return;

    setWidgetOrder(prev => {
      const newOrder = [...prev];
      const sourceIdx = newOrder.indexOf(sourceId);
      const targetIdx = newOrder.indexOf(targetId);
      if (sourceIdx === -1 || targetIdx === -1) return prev;
      newOrder.splice(sourceIdx, 1);
      newOrder.splice(targetIdx, 0, sourceId);
      return newOrder;
    });

    setDraggedId(null);
    setDragOverId(null);
    dragCounter.current = 0;
  }, []);

  const toggleWidget = (id: string) => {
    setHiddenWidgets(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetLayout = () => {
    setWidgetOrder(defaultWidgets.map(w => w.id));
    setHiddenWidgets(new Set());
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Dashboard</h3>
          <Badge variant={totalChanges > 0 ? 'default' : 'secondary'} className="text-[10px] font-mono">
            {totalChanges} total
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isEditing ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-[10px] px-2"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Done' : 'Customize'}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Drag to reorder, toggle visibility</p>
            </TooltipContent>
          </Tooltip>
          {isEditing && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={resetLayout}>
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="p-3">
        {/* Hidden widgets bar (edit mode) */}
        {isEditing && hiddenWidgets.size > 0 && (
          <div className="mb-3 p-2 rounded-lg border border-dashed border-border bg-muted/20">
            <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">Hidden widgets:</p>
            <div className="flex flex-wrap gap-1">
              {widgets.filter(w => hiddenWidgets.has(w.id)).map(w => {
                const Icon = w.icon;
                return (
                  <button
                    key={w.id}
                    onClick={() => toggleWidget(w.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded border border-border bg-muted/30 text-[10px] text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Icon className="w-3 h-3" />
                    {w.label}
                    <Eye className="w-3 h-3 ml-0.5" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {(isEditing ? widgets : visibleWidgets).map(widget => {
            const Icon = widget.icon;
            const value = widget.getValue();
            const isHidden = hiddenWidgets.has(widget.id);
            const isDragTarget = dragOverId === widget.id && draggedId !== widget.id;

            return (
              <div
                key={widget.id}
                draggable={isEditing}
                onDragStart={isEditing ? (e) => handleDragStart(e, widget.id) : undefined}
                onDragEnd={isEditing ? handleDragEnd : undefined}
                onDragOver={isEditing ? handleDragOver : undefined}
                onDragEnter={isEditing ? (e) => handleDragEnter(e, widget.id) : undefined}
                onDragLeave={isEditing ? handleDragLeave : undefined}
                onDrop={isEditing ? (e) => handleDrop(e, widget.id) : undefined}
                className={`
                  relative flex items-center gap-2 p-2.5 rounded-lg border transition-all
                  ${isEditing ? 'cursor-grab active:cursor-grabbing' : ''}
                  ${isDragTarget ? 'border-primary bg-primary/10 scale-[1.02]' : ''}
                  ${isHidden ? 'opacity-40 border-dashed border-muted-foreground/30' : ''}
                  ${!isHidden && value > 0
                    ? 'bg-muted/50 border-border'
                    : 'bg-muted/20 border-transparent'
                  }
                  ${!isHidden && value > 0 ? '' : isHidden ? '' : 'opacity-50'}
                `}
              >
                {/* Drag handle */}
                {isEditing && (
                  <GripVertical className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                )}

                <Icon className={`w-3.5 h-3.5 shrink-0 ${!isHidden && value > 0 ? widget.color : 'text-muted-foreground'}`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-muted-foreground truncate">{widget.label}</p>
                    {widget.riskLevel && value > 0 && !isEditing && (
                      <span className={`text-[8px] px-1 py-0.5 rounded-full font-medium ${riskBadge[widget.riskLevel].className}`}>
                        {riskBadge[widget.riskLevel].label}
                      </span>
                    )}
                  </div>
                  {widget.id === 'status' ? (
                    <p className={`text-xs font-mono font-semibold ${isMounted ? 'text-success' : 'text-muted-foreground'}`}>
                      {isMounted ? 'Ready' : 'Offline'}
                    </p>
                  ) : (
                    <p className={`text-sm font-mono font-semibold ${value > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {value}
                    </p>
                  )}
                </div>

                {/* Visibility toggle (edit mode) */}
                {isEditing && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWidget(widget.id); }}
                    className="p-1 rounded hover:bg-muted/50 transition-colors"
                  >
                    {isHidden
                      ? <EyeOff className="w-3 h-3 text-muted-foreground" />
                      : <Eye className="w-3 h-3 text-foreground" />
                    }
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {visibleWidgets.length === 0 && !isEditing && (
          <p className="text-[11px] text-muted-foreground text-center py-4 font-mono">
            All widgets hidden. Click Customize to restore.
          </p>
        )}

        {/* Tooltip row */}
        {!isEditing && visibleWidgets.some(w => w.getValue() > 0) && (
          <div className="mt-2 flex items-center justify-center gap-3 text-[9px] text-muted-foreground/60">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success inline-block" /> Safe</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warning inline-block" /> Moderate</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" /> Aggressive</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableDashboard;
