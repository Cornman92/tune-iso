import { useState } from 'react';
import { Library, Download, Star, Shield, Gamepad2, Code, Server, Eye, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PresetConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'gaming' | 'privacy' | 'minimal' | 'enterprise' | 'developer';
  programs: string[];
  tweaks: string[];
  optimizations: string[];
  services?: string[];
  components?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSize: string;
}

const PRESETS: PresetConfig[] = [
  {
    id: 'gaming-pc',
    name: 'Gaming Rig',
    description: 'Optimized for maximum FPS. Disables background services, telemetry, and bloatware. Installs Steam, Discord, and GPU tools.',
    icon: Gamepad2,
    category: 'gaming',
    programs: ['steam', 'discord', 'epic-games', 'msi-afterburner', 'rivatuner', 'ds4windows', '7zip', 'vlc', 'firefox', 'sharex'],
    tweaks: [
      'disable-telemetry', 'disable-cortana', 'disable-widgets', 'disable-chat',
      'disable-searchbar', 'classic-context', 'show-extensions', 'dark-mode',
      'disable-app-suggestions', 'disable-copilot', 'disable-recall',
      'taskbar-left', 'disable-taskview', 'disable-news-feed',
    ],
    optimizations: [
      'disable-superfetch', 'disable-indexing', 'disable-diagnostics',
      'disable-error-reporting', 'disable-xbox-services', 'disable-phone-service',
      'disable-wallet', 'disable-fax', 'disable-retaildemo',
    ],
    services: ['DiagTrack', 'SysMain', 'WSearch', 'Fax', 'RetailDemo'],
    components: ['Microsoft.BingWeather', 'Microsoft.GetHelp', 'Microsoft.Getstarted', 'Microsoft.MicrosoftSolitaireCollection', 'Microsoft.People', 'Clipchamp.Clipchamp', 'Microsoft.WindowsFeedbackHub', 'Microsoft.549981C3F5F10'],
    difficulty: 'intermediate',
    estimatedSize: '-1.2 GB',
  },
  {
    id: 'privacy-hardened',
    name: 'Privacy Fortress',
    description: 'Maximum privacy. Blocks all telemetry, disables tracking, removes data-collecting features. For the privacy-conscious.',
    icon: Shield,
    category: 'privacy',
    programs: ['firefox', 'keepassxc', 'veracrypt', 'signal', 'thunderbird', 'simplewall', 'bleachbit', 'librewolf', '7zip', 'vlc'],
    tweaks: [
      'disable-telemetry', 'disable-cortana', 'disable-activity-history',
      'disable-advertising-id', 'disable-location-tracking', 'disable-feedback',
      'disable-wifi-sense', 'disable-cloud-clipboard', 'disable-timeline',
      'disable-handwriting-data', 'disable-app-suggestions', 'disable-bing-search',
      'disable-copilot', 'disable-recall', 'disable-online-tips',
      'disable-tailored-experiences', 'disable-input-personalization',
      'disable-diagnostic-data', 'classic-context', 'show-extensions',
      'disable-widgets', 'disable-chat', 'disable-searchbar', 'dark-mode',
    ],
    optimizations: [
      'disable-diagnostics', 'disable-error-reporting', 'disable-geolocation',
      'disable-dmwappush', 'disable-connected-devices', 'disable-phone-service',
      'disable-wallet', 'disable-insider', 'disable-retaildemo',
      'disable-ceip', 'disable-compatibility-appraiser',
    ],
    services: ['DiagTrack', 'dmwappushservice', 'lfsvc', 'WerSvc', 'CDPUserSvc'],
    components: ['Microsoft.BingWeather', 'Microsoft.GetHelp', 'Microsoft.Getstarted', 'Microsoft.People', 'Microsoft.WindowsFeedbackHub', 'Microsoft.549981C3F5F10', 'MicrosoftTeams', 'Clipchamp.Clipchamp'],
    difficulty: 'advanced',
    estimatedSize: '-1.5 GB',
  },
  {
    id: 'minimal-server',
    name: 'Minimal Clean',
    description: 'Stripped to essentials. Removes all UWP apps, disables unnecessary services. Lean and fast.',
    icon: Server,
    category: 'minimal',
    programs: ['7zip', 'notepad++', 'everything', 'windows-terminal'],
    tweaks: [
      'disable-telemetry', 'disable-cortana', 'disable-widgets', 'disable-chat',
      'disable-searchbar', 'disable-taskview', 'classic-context', 'show-extensions',
      'show-hidden', 'compact-view', 'disable-copilot', 'disable-recall',
      'disable-app-suggestions', 'dark-mode', 'disable-lockscreen',
      'verbose-status', 'open-explorer-thispc',
    ],
    optimizations: [
      'disable-superfetch', 'disable-indexing', 'disable-diagnostics',
      'disable-error-reporting', 'disable-phone-service', 'disable-wallet',
      'disable-fax', 'disable-retaildemo', 'disable-insider',
      'disable-xbox-services', 'disable-connected-devices',
    ],
    services: ['DiagTrack', 'SysMain', 'WSearch', 'Fax', 'RetailDemo', 'PhoneSvc', 'WalletService', 'wisvc'],
    components: ['Microsoft.BingWeather', 'Microsoft.BingNews', 'Microsoft.GetHelp', 'Microsoft.Getstarted', 'Microsoft.MicrosoftSolitaireCollection', 'Microsoft.People', 'Microsoft.WindowsFeedbackHub', 'Microsoft.549981C3F5F10', 'Microsoft.ZuneMusic', 'Microsoft.ZuneVideo', 'Clipchamp.Clipchamp', 'MicrosoftTeams', 'Microsoft.MicrosoftOfficeHub', 'Microsoft.PowerAutomateDesktop', 'Microsoft.Todos'],
    difficulty: 'intermediate',
    estimatedSize: '-2.0 GB',
  },
  {
    id: 'developer-workstation',
    name: 'Dev Workstation',
    description: 'Full development environment. VS Code, Git, Docker, Node.js, Python, terminals, and essential dev tools.',
    icon: Code,
    category: 'developer',
    programs: [
      'vscode', 'git', 'github-desktop', 'windows-terminal', 'powershell7',
      'nodejs', 'python', 'docker-desktop', 'postman', 'dbeaver',
      'winscp', 'firefox', '7zip', 'everything', 'sharex', 'obsidian',
      'keepassxc', 'discord',
    ],
    tweaks: [
      'disable-telemetry', 'disable-cortana', 'classic-context', 'show-extensions',
      'show-hidden', 'dark-mode', 'disable-widgets', 'disable-chat',
      'disable-copilot', 'disable-app-suggestions', 'open-explorer-thispc',
      'end-task-taskbar', 'disable-sticky-keys', 'num-lock-on',
    ],
    optimizations: [
      'disable-diagnostics', 'disable-error-reporting', 'disable-phone-service',
      'disable-fax', 'disable-retaildemo',
    ],
    difficulty: 'beginner',
    estimatedSize: '-0.8 GB',
  },
  {
    id: 'enterprise-deploy',
    name: 'Enterprise Standard',
    description: 'Locked-down corporate image. Disables consumer features, enforces policies, minimal software footprint.',
    icon: Eye,
    category: 'enterprise',
    programs: ['7zip', 'notepad++', 'firefox', 'thunderbird', 'libreoffice', 'keepassxc', 'everything'],
    tweaks: [
      'disable-telemetry', 'disable-cortana', 'disable-activity-history',
      'disable-advertising-id', 'disable-feedback', 'disable-app-suggestions',
      'disable-bing-search', 'disable-copilot', 'disable-recall',
      'disable-widgets', 'disable-chat', 'classic-context', 'show-extensions',
      'disable-lockscreen', 'verbose-status',
    ],
    optimizations: [
      'disable-diagnostics', 'disable-error-reporting', 'disable-phone-service',
      'disable-wallet', 'disable-fax', 'disable-retaildemo', 'disable-insider',
      'disable-xbox-services', 'disable-geolocation',
    ],
    services: ['DiagTrack', 'WerSvc', 'Fax', 'RetailDemo', 'PhoneSvc', 'WalletService', 'wisvc'],
    components: ['Microsoft.BingWeather', 'Microsoft.GetHelp', 'Microsoft.Getstarted', 'Microsoft.MicrosoftSolitaireCollection', 'Microsoft.People', 'Microsoft.WindowsFeedbackHub', 'Microsoft.549981C3F5F10', 'Microsoft.ZuneMusic', 'Microsoft.ZuneVideo', 'Clipchamp.Clipchamp', 'MicrosoftTeams'],
    difficulty: 'intermediate',
    estimatedSize: '-1.8 GB',
  },
];

const categoryColors: Record<string, string> = {
  gaming: 'bg-primary/20 text-primary',
  privacy: 'bg-destructive/20 text-destructive',
  minimal: 'bg-muted text-muted-foreground',
  enterprise: 'bg-warning/20 text-warning',
  developer: 'bg-success/20 text-success',
};

const difficultyColors: Record<string, string> = {
  beginner: 'text-success',
  intermediate: 'text-warning',
  advanced: 'text-destructive',
};

interface PresetLibraryProps {
  onApplyPreset: (preset: {
    programs: string[];
    tweaks: string[];
    optimizations: string[];
    services?: string[];
    components?: string[];
  }) => void;
}

const PresetLibrary = ({ onApplyPreset }: PresetLibraryProps) => {
  const [expandedPreset, setExpandedPreset] = useState<string | null>(null);
  const [appliedPresets, setAppliedPresets] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const filteredPresets = filterCategory
    ? PRESETS.filter(p => p.category === filterCategory)
    : PRESETS;

  const handleApply = (preset: PresetConfig) => {
    onApplyPreset({
      programs: preset.programs,
      tweaks: preset.tweaks,
      optimizations: preset.optimizations,
      services: preset.services,
      components: preset.components,
    });
    setAppliedPresets(prev => new Set(prev).add(preset.id));
    toast.success(`Applied "${preset.name}" preset`, {
      description: `${preset.programs.length} programs, ${preset.tweaks.length} tweaks, ${preset.optimizations.length} optimizations`,
    });
  };

  const categories = ['gaming', 'privacy', 'minimal', 'enterprise', 'developer'];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Library className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Preset Library</h3>
        <Badge variant="secondary" className="ml-auto text-xs font-mono">{PRESETS.length} presets</Badge>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setFilterCategory(null)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
            !filterCategory ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono capitalize transition-colors ${
              filterCategory === cat ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Preset cards */}
      <div className="space-y-2">
        {filteredPresets.map(preset => {
          const Icon = preset.icon;
          const isExpanded = expandedPreset === preset.id;
          const isApplied = appliedPresets.has(preset.id);

          return (
            <div
              key={preset.id}
              className="border border-border rounded-lg overflow-hidden transition-all hover:border-primary/30"
            >
              <div
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => setExpandedPreset(isExpanded ? null : preset.id)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${categoryColors[preset.category]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{preset.name}</span>
                    {isApplied && <Check className="w-3.5 h-3.5 text-success" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{preset.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] font-mono">{preset.estimatedSize}</Badge>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <p className="text-muted-foreground mb-1">Programs</p>
                      <p className="font-mono text-foreground">{preset.programs.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Tweaks</p>
                      <p className="font-mono text-foreground">{preset.tweaks.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Difficulty</p>
                      <p className={`font-mono capitalize ${difficultyColors[preset.difficulty]}`}>{preset.difficulty}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] text-muted-foreground">Programs included:</p>
                    <div className="flex flex-wrap gap-1">
                      {preset.programs.map(p => (
                        <Badge key={p} variant="secondary" className="text-[10px] font-mono">{p}</Badge>
                      ))}
                    </div>
                  </div>

                  {preset.services && preset.services.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-muted-foreground">Services disabled:</p>
                      <div className="flex flex-wrap gap-1">
                        {preset.services.map(s => (
                          <Badge key={s} variant="outline" className="text-[10px] font-mono text-warning">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {preset.components && preset.components.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-muted-foreground">Components removed:</p>
                      <div className="flex flex-wrap gap-1">
                        {preset.components.map(c => (
                          <Badge key={c} variant="outline" className="text-[10px] font-mono text-destructive">{c.split('.').pop()}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    size="sm"
                    className="w-full text-xs gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(preset);
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isApplied ? 'Re-apply Preset' : 'Apply Preset'}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PresetLibrary;
