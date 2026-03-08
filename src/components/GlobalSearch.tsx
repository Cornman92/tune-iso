import { useState, useEffect, useMemo } from 'react';
import { Search, Settings, Package, Cog, Layers, Database, Wrench, Zap, Monitor } from 'lucide-react';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { defaultPrograms, defaultTweaks, defaultOptimizations } from '@/data/customizations';

// Import data inline to keep this self-contained
// WIM features, components, and services are defined in their own files,
// so we duplicate the static lists here for indexing.

interface SearchEntry {
  id: string;
  name: string;
  description: string;
  section: string;
  sectionId: string;
  icon: typeof Search;
}

// Build a static index of all searchable items
const buildIndex = (): SearchEntry[] => {
  const entries: SearchEntry[] = [];

  // Programs
  defaultPrograms.forEach(item => {
    entries.push({
      id: `prog-${item.id}`,
      name: item.name,
      description: item.description,
      section: 'Programs & Tweaks',
      sectionId: 'customizations',
      icon: Monitor,
    });
  });

  // Tweaks
  defaultTweaks.forEach(item => {
    entries.push({
      id: `tweak-${item.id}`,
      name: item.name,
      description: item.description,
      section: 'Tweaks',
      sectionId: 'customizations',
      icon: Wrench,
    });
  });

  // Optimizations
  defaultOptimizations.forEach(item => {
    entries.push({
      id: `opt-${item.id}`,
      name: item.name,
      description: item.description,
      section: 'Optimizations',
      sectionId: 'customizations',
      icon: Zap,
    });
  });

  return entries;
};

const STATIC_INDEX = buildIndex();

interface GlobalSearchProps {
  wimFeatures?: { id: string; name: string; description: string; category: string }[];
  components?: { id: string; name: string; description: string; category: string }[];
  services?: { name: string; displayName: string; description: string; category: string }[];
  registryPresets?: { id: string; description: string; valueName: string; keyPath: string }[];
}

const GlobalSearch = ({ wimFeatures = [], components = [], services = [], registryPresets = [] }: GlobalSearchProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const allEntries = useMemo(() => {
    const extra: SearchEntry[] = [];

    wimFeatures.forEach(f => {
      extra.push({
        id: `wim-${f.id}`,
        name: f.name,
        description: f.description,
        section: 'WIM Features',
        sectionId: 'wim',
        icon: Layers,
      });
    });

    components.forEach(c => {
      extra.push({
        id: `comp-${c.id}`,
        name: c.name,
        description: c.description,
        section: 'Components',
        sectionId: 'components',
        icon: Package,
      });
    });

    services.forEach(s => {
      extra.push({
        id: `svc-${s.name}`,
        name: s.displayName,
        description: s.description,
        section: 'Services',
        sectionId: 'services',
        icon: Cog,
      });
    });

    registryPresets.forEach(r => {
      extra.push({
        id: `reg-${r.id}`,
        name: r.description,
        description: `${r.keyPath}\\\\${r.valueName}`,
        section: 'Registry',
        sectionId: 'registry',
        icon: Database,
      });
    });

    return [...STATIC_INDEX, ...extra];
  }, [wimFeatures, components, services, registryPresets]);

  const scrollToSection = (sectionId: string) => {
    setOpen(false);
    setTimeout(() => {
      document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Group entries by section
  const grouped = useMemo(() => {
    const map = new Map<string, SearchEntry[]>();
    allEntries.forEach(e => {
      if (!map.has(e.section)) map.set(e.section, []);
      map.get(e.section)!.push(e);
    });
    return map;
  }, [allEntries]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border hover:bg-muted/80 transition-colors cursor-pointer"
      >
        <Search className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground hidden sm:inline">Search all…</span>
        <kbd className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
          Ctrl+K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search programs, tweaks, services, features, components, registry…" />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No results found.</CommandEmpty>
          {Array.from(grouped.entries()).map(([section, items]) => (
            <CommandGroup key={section} heading={section}>
              {items.map(item => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.name} ${item.description} ${item.section}`}
                    onSelect={() => scrollToSection(item.sectionId)}
                    className="flex items-center gap-3"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {item.section}
                    </Badge>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
