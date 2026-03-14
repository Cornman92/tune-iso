import { HardDrive, Disc, Settings, HardDriveDownload, Download, FileCode, Save, Layers, Database, Cog, Package, Settings2, Shield, Globe, Clock, ShieldBan, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionSidebarProps {
  activeSection: string;
  isMounted: boolean;
  hasFile: boolean;
}

const sections = [
  { id: 'source', label: 'Source', icon: HardDrive, step: 1 },
  { id: 'mount', label: 'Mount', icon: Disc, step: 2, requiresFile: true },
  { id: 'wim', label: 'WIM Editor', icon: Layers, step: 3, requiresMount: true },
  { id: 'iso-metadata', label: 'ISO Meta', icon: Settings2, step: 4 },
  { id: 'customizations', label: 'Customize', icon: Settings, step: 5 },
  { id: 'drivers', label: 'Drivers', icon: HardDriveDownload, step: 6 },
  { id: 'registry', label: 'Registry', icon: Database, step: 7 },
  { id: 'services', label: 'Services', icon: Cog, step: 8 },
  { id: 'components', label: 'Components', icon: Package, step: 9 },
  { id: 'group-policy', label: 'GPO', icon: Shield, step: 10 },
  { id: 'hosts', label: 'Hosts', icon: Globe, step: 11 },
  { id: 'scheduled-tasks', label: 'Tasks', icon: Clock, step: 12 },
  { id: 'firewall', label: 'Firewall', icon: ShieldBan, step: 13 },
  { id: 'power-plan', label: 'Power', icon: Zap, step: 14 },
  { id: 'updates', label: 'Updates', icon: Download, step: 15 },
  { id: 'unattend', label: 'Unattend', icon: FileCode, step: 16 },
  { id: 'build', label: 'Build', icon: Save, step: 17 },
];

const SectionSidebar = ({ activeSection, isMounted, hasFile }: SectionSidebarProps) => {
  const scrollTo = (id: string) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav aria-label="Section navigation" className="hidden xl:flex flex-col fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-card/80 backdrop-blur-md border border-border rounded-r-xl py-1.5 px-1 gap-0 shadow-lg max-h-[90vh] overflow-y-auto">
      {sections.map(section => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        const isDisabled = (section.requiresFile && !hasFile) || (section.requiresMount && !isMounted);

        return (
          <button
            key={section.id}
            onClick={() => !isDisabled && scrollTo(section.id)}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-mono transition-all group whitespace-nowrap',
              isActive && 'bg-primary/20 text-primary',
              !isActive && !isDisabled && 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              isDisabled && 'opacity-30 cursor-not-allowed',
            )}
            disabled={isDisabled}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px]">{section.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default SectionSidebar;
