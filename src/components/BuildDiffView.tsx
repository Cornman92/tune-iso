import { useMemo, useState } from 'react';
import { Diff, ChevronDown, ChevronUp, Plus, Minus as MinusIcon, FileCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { COMPONENTS } from '@/components/ComponentRemoval';
import { SERVICES } from '@/components/ServicesManager';
import { PRESET_ENTRIES } from '@/components/RegistryEditor';

interface DiffSection {
  title: string;
  additions: string[];
  removals: string[];
}

interface BuildDiffViewProps {
  customizations: { programs: string[]; tweaks: string[]; optimizations: string[] };
  disabledServices: string[];
  removedComponents: string[];
  registryEntries: { hive: string; keyPath: string; valueName: string; valueType: string; valueData: string }[];
  driverCount: number;
  updateCount: number;
  unattendCount: number;
}

const BuildDiffView = ({
  customizations,
  disabledServices,
  removedComponents,
  registryEntries,
  driverCount,
  updateCount,
  unattendCount,
}: BuildDiffViewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sections = useMemo((): DiffSection[] => {
    const result: DiffSection[] = [];

    // Customizations
    const allCustom = [...customizations.programs, ...customizations.tweaks, ...customizations.optimizations];
    if (allCustom.length > 0) {
      result.push({
        title: 'Customizations',
        additions: allCustom.map(c => c.replace(/-/g, ' ')),
        removals: [],
      });
    }

    // Components
    if (removedComponents.length > 0) {
      result.push({
        title: 'Components',
        additions: [],
        removals: removedComponents.map(id => {
          const comp = COMPONENTS.find(c => c.id === id);
          return comp ? comp.name : id;
        }),
      });
    }

    // Services
    if (disabledServices.length > 0) {
      result.push({
        title: 'Services',
        additions: [],
        removals: disabledServices.map(name => {
          const svc = SERVICES.find(s => s.name === name);
          return svc ? svc.displayName : name;
        }),
      });
    }

    // Registry
    if (registryEntries.length > 0) {
      result.push({
        title: 'Registry',
        additions: registryEntries.map(e => `${e.keyPath}\\${e.valueName} = ${e.valueData}`),
        removals: [],
      });
    }

    // Drivers
    if (driverCount > 0) {
      result.push({
        title: 'Drivers',
        additions: [`${driverCount} driver pack(s) injected`],
        removals: [],
      });
    }

    // Updates
    if (updateCount > 0) {
      result.push({
        title: 'Updates',
        additions: [`${updateCount} update(s) slipstreamed`],
        removals: [],
      });
    }

    // Unattend
    if (unattendCount > 0) {
      result.push({
        title: 'Unattend',
        additions: [`${unattendCount} answer file setting(s)`],
        removals: [],
      });
    }

    return result;
  }, [customizations, disabledServices, removedComponents, registryEntries, driverCount, updateCount, unattendCount]);

  const totalChanges = sections.reduce((sum, s) => sum + s.additions.length + s.removals.length, 0);

  if (totalChanges === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <Diff className="w-4 h-4 text-primary" />
        <span className="text-sm font-mono font-medium text-foreground">Change Diff</span>
        <Badge variant="secondary" className="text-[10px] font-mono ml-1">
          {totalChanges} changes
        </Badge>
        <span className="ml-auto">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </span>
      </button>

      {isExpanded && (
        <div className="p-3 space-y-3 max-h-[400px] overflow-y-auto font-mono text-xs">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-1.5">
                <FileCode className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">{section.title}</span>
                <span className="text-[10px] text-muted-foreground">
                  {section.additions.length > 0 && `+${section.additions.length}`}
                  {section.additions.length > 0 && section.removals.length > 0 && ' / '}
                  {section.removals.length > 0 && `-${section.removals.length}`}
                </span>
              </div>
              <div className="space-y-0.5 pl-5">
                {section.additions.map((item, i) => (
                  <div key={`a-${i}`} className="flex items-center gap-2 text-success bg-success/5 px-2 py-0.5 rounded">
                    <Plus className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
                {section.removals.map((item, i) => (
                  <div key={`r-${i}`} className="flex items-center gap-2 text-destructive bg-destructive/5 px-2 py-0.5 rounded">
                    <MinusIcon className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuildDiffView;
