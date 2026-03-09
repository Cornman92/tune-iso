import { useState, useMemo, useCallback } from 'react';
import { GitCompareArrows, ChevronDown, Equal, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { projectDataSchema } from '@/lib/projectSchema';
import type { ProjectData } from '@/components/ProjectManager';

interface SavedTemplate {
  id: string;
  name: string;
  savedAt: string;
  data: ProjectData;
}

const STORAGE_KEY = 'iso-forge-templates';

function loadTemplates(): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t: any) =>
        t && typeof t.id === 'string' && typeof t.name === 'string' && t.data && projectDataSchema.safeParse(t.data).success,
    );
  } catch {
    return [];
  }
}

interface DiffItem {
  label: string;
  left: string[];
  right: string[];
  added: string[];
  removed: string[];
}

function computeDiff(a: ProjectData | null, b: ProjectData | null): DiffItem[] {
  if (!a || !b) return [];

  const sections: DiffItem[] = [];

  // Programs
  const aProgs = a.customizations?.programs || [];
  const bProgs = b.customizations?.programs || [];
  sections.push({
    label: 'Programs',
    left: aProgs,
    right: bProgs,
    added: bProgs.filter((x) => !aProgs.includes(x)),
    removed: aProgs.filter((x) => !bProgs.includes(x)),
  });

  // Tweaks
  const aTweaks = a.customizations?.tweaks || [];
  const bTweaks = b.customizations?.tweaks || [];
  sections.push({
    label: 'Tweaks',
    left: aTweaks,
    right: bTweaks,
    added: bTweaks.filter((x) => !aTweaks.includes(x)),
    removed: aTweaks.filter((x) => !bTweaks.includes(x)),
  });

  // Optimizations
  const aOpt = a.customizations?.optimizations || [];
  const bOpt = b.customizations?.optimizations || [];
  sections.push({
    label: 'Optimizations',
    left: aOpt,
    right: bOpt,
    added: bOpt.filter((x) => !aOpt.includes(x)),
    removed: aOpt.filter((x) => !bOpt.includes(x)),
  });

  // Drivers
  const aDrivers = (a.drivers || []).map((d) => d.name);
  const bDrivers = (b.drivers || []).map((d) => d.name);
  sections.push({
    label: 'Drivers',
    left: aDrivers,
    right: bDrivers,
    added: bDrivers.filter((x) => !aDrivers.includes(x)),
    removed: aDrivers.filter((x) => !bDrivers.includes(x)),
  });

  // Updates
  const aUpdates = (a.updates || []).map((u) => u.kb);
  const bUpdates = (b.updates || []).map((u) => u.kb);
  sections.push({
    label: 'Updates',
    left: aUpdates,
    right: bUpdates,
    added: bUpdates.filter((x) => !aUpdates.includes(x)),
    removed: aUpdates.filter((x) => !bUpdates.includes(x)),
  });

  // Unattend
  const aUnattend = (a.unattend || []).filter((u) => u.enabled).map((u) => u.id);
  const bUnattend = (b.unattend || []).filter((u) => u.enabled).map((u) => u.id);
  sections.push({
    label: 'Unattend Settings',
    left: aUnattend,
    right: bUnattend,
    added: bUnattend.filter((x) => !aUnattend.includes(x)),
    removed: aUnattend.filter((x) => !bUnattend.includes(x)),
  });

  return sections;
}

interface ConfigComparisonProps {
  onGetCurrentConfig: () => ProjectData;
}

const ConfigComparison = ({ onGetCurrentConfig }: ConfigComparisonProps) => {
  const [open, setOpen] = useState(false);
  const [leftId, setLeftId] = useState<string>('current');
  const [rightId, setRightId] = useState<string>('');
  const templates = useMemo(() => (open ? loadTemplates() : []), [open]);

  const getConfig = useCallback(
    (id: string): ProjectData | null => {
      if (id === 'current') return onGetCurrentConfig();
      return templates.find((t) => t.id === id)?.data || null;
    },
    [templates, onGetCurrentConfig],
  );

  const diff = useMemo(() => {
    return computeDiff(getConfig(leftId), getConfig(rightId));
  }, [leftId, rightId, getConfig]);

  const totalDiffs = diff.reduce((sum, d) => sum + d.added.length + d.removed.length, 0);

  const options = [
    { id: 'current', name: '⚡ Current Configuration' },
    ...templates.map((t) => ({ id: t.id, name: t.name })),
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono text-xs h-8 gap-1.5">
          <GitCompareArrows className="w-3.5 h-3.5" />
          Compare
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm flex items-center gap-2">
            <GitCompareArrows className="w-4 h-4 text-primary" />
            Configuration Comparison
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Left (Base)</label>
            <Select value={leftId} onValueChange={setLeftId}>
              <SelectTrigger className="font-mono text-xs h-8">
                <SelectValue placeholder="Select config..." />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.id} value={o.id} className="font-mono text-xs">
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Right (Compare)</label>
            <Select value={rightId} onValueChange={setRightId}>
              <SelectTrigger className="font-mono text-xs h-8">
                <SelectValue placeholder="Select config..." />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.id} value={o.id} className="font-mono text-xs">
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {leftId && rightId ? (
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-4">
              {totalDiffs === 0 && (
                <div className="flex items-center gap-2 justify-center py-8 text-muted-foreground">
                  <Equal className="w-5 h-5" />
                  <span className="font-mono text-sm">Configurations are identical</span>
                </div>
              )}
              {diff
                .filter((d) => d.added.length > 0 || d.removed.length > 0)
                .map((section) => (
                  <div key={section.label} className="border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
                      <span className="text-xs font-mono font-medium text-foreground">{section.label}</span>
                      <div className="flex items-center gap-2">
                        {section.added.length > 0 && (
                          <Badge variant="secondary" className="text-[10px] font-mono bg-success/20 text-success border-0">
                            +{section.added.length}
                          </Badge>
                        )}
                        {section.removed.length > 0 && (
                          <Badge variant="secondary" className="text-[10px] font-mono bg-destructive/20 text-destructive border-0">
                            -{section.removed.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      {section.added.map((item) => (
                        <div key={`add-${item}`} className="flex items-center gap-2 px-2 py-1 rounded bg-success/10">
                          <Plus className="w-3 h-3 text-success shrink-0" />
                          <span className="text-xs font-mono text-success">{item}</span>
                        </div>
                      ))}
                      {section.removed.map((item) => (
                        <div key={`rem-${item}`} className="flex items-center gap-2 px-2 py-1 rounded bg-destructive/10">
                          <Minus className="w-3 h-3 text-destructive shrink-0" />
                          <span className="text-xs font-mono text-destructive">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <p className="font-mono text-xs">Select two configurations to compare</p>
          </div>
        )}

        {totalDiffs > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-[10px] font-mono text-muted-foreground">
              {totalDiffs} difference{totalDiffs !== 1 ? 's' : ''} found
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConfigComparison;
