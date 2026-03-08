import { HardDrive, Disc, Settings, HardDriveDownload, Download, FileCode, Save, Layers, Database } from 'lucide-react';
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
  { id: 'customizations', label: 'Customize', icon: Settings, step: 4 },
  { id: 'drivers', label: 'Drivers', icon: HardDriveDownload, step: 5 },
  { id: 'registry', label: 'Registry', icon: Database, step: 6 },
  { id: 'updates', label: 'Updates', icon: Download, step: 7 },
  { id: 'unattend', label: 'Unattend', icon: FileCode, step: 8 },
  { id: 'build', label: 'Build', icon: Save, step: 9 },
];

const SectionSidebar = ({ activeSection, isMounted, hasFile }: SectionSidebarProps) => {
  const scrollTo = (id: string) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="hidden xl:flex flex-col fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-card/80 backdrop-blur-md border border-border rounded-r-xl py-2 px-1 gap-0.5 shadow-lg">
      {sections.map(section => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        const isDisabled = (section.requiresFile && !hasFile) || (section.requiresMount && !isMounted);

        return (
          <button
            key={section.id}
            onClick={() => !isDisabled && scrollTo(section.id)}
            className={cn(
              'flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-mono transition-all group whitespace-nowrap',
              isActive && 'bg-primary/20 text-primary',
              !isActive && !isDisabled && 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              isDisabled && 'opacity-30 cursor-not-allowed',
            )}
            disabled={isDisabled}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px]">{section.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default SectionSidebar;
