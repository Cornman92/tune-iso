import { useState, MutableRefObject } from 'react';
import { Gamepad2, Building2, Monitor, Sparkles, Check, RotateCcw, ShieldCheck, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export interface BuildProfile {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
  summary: string[];
  customizations: { programs: string[]; tweaks: string[]; optimizations: string[] };
  services: string[];
  components: string[];
  registry: string[];
  features: { id: string; enabled: boolean }[];
}

const PROFILES: BuildProfile[] = [
  {
    id: 'gaming',
    name: 'Gaming',
    icon: Gamepad2,
    description: 'Optimized for maximum FPS and low latency. Strips telemetry, disables background services, enables gaming-specific registry tweaks.',
    color: 'text-primary',
    summary: [
      'Remove bloatware & telemetry apps',
      'Disable indexing, Superfetch, telemetry services',
      'Apply TCP/GPU/CPU priority tweaks',
      'Enable DirectPlay & .NET 3.5 for older games',
      'Keep Xbox Game Bar for captures',
    ],
    customizations: {
      programs: ['steam', 'discord', 'gpu-drivers'],
      tweaks: ['disable-cortana', 'disable-web-search', 'classic-context-menu', 'disable-lock-screen-ads', 'disable-tips', 'disable-game-bar-tips', 'disable-sticky-keys', 'disable-mouse-acceleration'],
      optimizations: ['disable-telemetry', 'disable-superfetch', 'disable-prefetch', 'disable-hibernation', 'ultimate-performance', 'gpu-scheduling', 'game-mode', 'disable-fullscreen-optimizations'],
    },
    services: [
      'DiagTrack', 'dmwappushservice', 'WSearch', 'SysMain', 'WerSvc',
      'MapsBroker', 'lfsvc', 'RetailDemo', 'wisvc', 'PhoneSvc',
      'WalletService', 'Fax', 'TabletInputService', 'WMPNetworkSvc',
      'SharedAccess', 'diagnosticshub.standardcollector.service',
      'PcaSvc', 'InventorySvc', 'PrintWorkflowUserSvc',
    ],
    components: [
      'cortana', 'bing-weather', 'bing-news', 'bing-finance', 'bing-sports',
      'skype', 'gethelp', 'getstarted', 'feedback', 'maps', 'mixedreality',
      'people', 'teams', 'clipchamp', 'todo', 'powerautomate', 'your-phone',
      'widgets', 'copilot', 'recall', 'onenote', 'office-hub', 'quickassist',
      'solitaire', 'candy-crush', 'candy-crush-friends', 'disney-magic',
      'farmville', 'bubble-witch', 'march-empires', 'hidden-city',
      'asphalt-legends', 'sudoku', 'mahjong', 'jigsaw',
      'compat-telemetry', 'census', 'diagtrack', 'error-reporting', 'customer-experience',
    ],
    registry: ['p4', 'p5', 'p7', 'p8', 'p10', 'p11', 'p12', 'p13', 'p15', 'p16', 'p17', 'p18', 'p19', 'p20'],
    features: [
      { id: 'dotnet35', enabled: true },
      { id: 'directplay', enabled: true },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building2,
    description: 'Locked-down corporate workstation. Enables security features, RSAT tools, removes consumer apps and games. Keeps productivity tools.',
    color: 'text-warning',
    summary: [
      'Remove all games & consumer apps',
      'Enable Hyper-V, RSAT, BitLocker, AppLocker',
      'Keep Microsoft Store & Office apps',
      'Disable consumer telemetry',
      'Apply Group Policy & security registry tweaks',
    ],
    customizations: {
      programs: ['firefox', 'vscode', '7zip', 'vlc'],
      tweaks: ['disable-cortana', 'disable-web-search', 'disable-lock-screen-ads', 'disable-tips', 'disable-consumer-features'],
      optimizations: ['disable-telemetry'],
    },
    services: [
      'DiagTrack', 'dmwappushservice', 'WerSvc', 'RetailDemo', 'wisvc',
      'XblAuthManager', 'XblGameSave', 'XboxNetApiSvc', 'XboxGipSvc',
      'BcastDVRUserService', 'WalletService', 'PhoneSvc', 'MessagingService',
      'MapsBroker', 'WMPNetworkSvc', 'PushToInstall',
    ],
    components: [
      'cortana', 'solitaire', 'candy-crush', 'candy-crush-friends', 'disney-magic',
      'farmville', 'bubble-witch', 'march-empires', 'hidden-city', 'asphalt-legends',
      'sudoku', 'mahjong', 'jigsaw', 'xbox-app', 'xbox-bar', 'xbox-tcui',
      'xbox-identity', 'xbox-speech', 'xbox-game-callable-ui',
      'skype', 'clipchamp', 'mixedreality', 'mixed-reality-viewer',
      'bing-sports', 'bing-finance', 'recall', 'copilot', 'copilot-runtime',
      'widgets', 'feedback', 'getstarted',
      'compat-telemetry', 'census', 'diagtrack', 'error-reporting', 'customer-experience',
    ],
    registry: ['p2', 'p4', 'p7', 'p8', 'p10', 'p11', 'p12', 'p13', 'p14'],
    features: [
      { id: 'hyperv', enabled: true },
      { id: 'rsat', enabled: true },
      { id: 'dotnet35', enabled: true },
      { id: 'ssh-client', enabled: true },
      { id: 'ssh-server', enabled: true },
      { id: 'device-guard', enabled: true },
      { id: 'credential-guard', enabled: true },
      { id: 'applocker', enabled: true },
      { id: 'group-policy-management', enabled: true },
      { id: 'work-folders', enabled: true },
    ],
  },
  {
    id: 'kiosk',
    name: 'Kiosk',
    icon: Monitor,
    description: 'Single-purpose display or kiosk terminal. Strips everything non-essential, locks down the shell, disables updates and user-facing features.',
    color: 'text-destructive',
    summary: [
      'Remove nearly all apps and games',
      'Disable Windows Update & Store',
      'Enable Embedded Shell Launcher & Assigned Access',
      'Disable UAC, notifications, lock screen',
      'Maximum component removal for smallest footprint',
    ],
    customizations: {
      programs: [],
      tweaks: ['disable-cortana', 'disable-web-search', 'classic-context-menu', 'disable-lock-screen-ads', 'disable-tips', 'disable-action-center', 'disable-consumer-features'],
      optimizations: ['disable-telemetry', 'disable-superfetch', 'disable-prefetch', 'disable-hibernation', 'disable-indexing'],
    },
    services: [
      'DiagTrack', 'dmwappushservice', 'WSearch', 'SysMain', 'WerSvc',
      'MapsBroker', 'lfsvc', 'RetailDemo', 'wisvc', 'PhoneSvc',
      'WalletService', 'Fax', 'TabletInputService', 'WMPNetworkSvc',
      'SharedAccess', 'XblAuthManager', 'XblGameSave', 'XboxNetApiSvc',
      'XboxGipSvc', 'BcastDVRUserService', 'PcaSvc', 'InventorySvc',
      'wuauserv', 'WaaSMedicSvc', 'UsoSvc', 'DoSvc', 'BITS',
      'InstallService', 'PushToInstall', 'Spooler', 'PrintNotify',
      'WbioSrvc', 'TermService', 'SessionEnv', 'UmRdpService',
      'OneSyncSvc', 'TokenBroker',
    ],
    components: [
      'cortana', 'bing-weather', 'bing-news', 'bing-finance', 'bing-sports',
      'skype', 'gethelp', 'getstarted', 'feedback', 'maps', 'mixedreality',
      'people', 'teams', 'clipchamp', 'todo', 'powerautomate', 'your-phone',
      'widgets', 'copilot', 'recall', 'copilot-runtime', 'onenote', 'office-hub',
      'solitaire', 'candy-crush', 'candy-crush-friends', 'disney-magic',
      'farmville', 'bubble-witch', 'march-empires', 'hidden-city',
      'asphalt-legends', 'sudoku', 'mahjong', 'jigsaw',
      'xbox-app', 'xbox-bar', 'xbox-tcui', 'xbox-identity', 'xbox-speech',
      'xbox-game-callable-ui', 'onedrive', 'sticky-notes', 'alarms',
      'paint3d', 'whiteboard', 'mixed-reality-viewer', 'groove-music',
      'movies-tv', 'voice-recorder', 'journal', 'family', 'devhome',
      'outlook-new', 'linkedin', 'quickassist',
      'store', 'store-purchase', 'store-experience',
      'compat-telemetry', 'census', 'diagtrack', 'error-reporting', 'customer-experience',
    ],
    registry: ['p1', 'p2', 'p3', 'p4', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p20'],
    features: [
      { id: 'embedded-shell', enabled: true },
      { id: 'assigned-access', enabled: true },
    ],
  },
];

interface BuildProfilesProps {
  importCustomizations: MutableRefObject<(data: { programs: string[]; tweaks: string[]; optimizations: string[] }) => void>;
  importServices: MutableRefObject<(data: string[]) => void>;
  importComponents: MutableRefObject<(data: string[]) => void>;
  importRegistry: MutableRefObject<(presetIds: string[]) => void>;
  importFeatures: MutableRefObject<(data: { id: string; enabled: boolean }[]) => void>;
  isMounted: boolean;
}

const BuildProfiles = ({ importCustomizations, importServices, importComponents, importRegistry, importFeatures, isMounted }: BuildProfilesProps) => {
  const [open, setOpen] = useState(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const applyProfile = (profile: BuildProfile) => {
    importCustomizations.current(profile.customizations);
    importServices.current(profile.services);
    importComponents.current(profile.components);
    importRegistry.current(profile.registry);
    importFeatures.current(profile.features);
    setAppliedId(profile.id);
    toast.success(`Applied "${profile.name}" build profile across all sections`);
    setTimeout(() => setAppliedId(null), 3000);
  };

  const resetAll = () => {
    importCustomizations.current({ programs: [], tweaks: [], optimizations: [] });
    importServices.current([]);
    importComponents.current([]);
    importRegistry.current([]);
    importFeatures.current([]);
    toast.info('All sections reset to defaults');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs font-mono gap-1.5" disabled={!isMounted}>
          <Sparkles className="w-3.5 h-3.5 text-warning" />
          Profiles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            <Sparkles className="w-5 h-5 text-warning" />
            Build Profiles
          </DialogTitle>
          <DialogDescription>
            One-click presets that configure customizations, services, components, registry, and WIM features together.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 mt-2">
          {PROFILES.map(profile => {
            const Icon = profile.icon;
            const isApplied = appliedId === profile.id;

            return (
              <div
                key={profile.id}
                className={`relative rounded-xl border p-4 transition-all ${
                  isApplied
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border bg-card hover:border-primary/30 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 ${isApplied ? 'bg-primary/20' : ''}`}>
                    <Icon className={`w-6 h-6 ${profile.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{profile.name}</h3>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {profile.components.length} apps • {profile.services.length} services • {profile.registry.length} reg
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{profile.description}</p>
                    <ul className="space-y-1">
                      {profile.summary.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    size="sm"
                    variant={isApplied ? 'default' : 'outline'}
                    className="shrink-0 font-mono text-xs"
                    onClick={() => applyProfile(profile)}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" /> Applied
                      </>
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end mt-2">
          <Button variant="ghost" size="sm" className="text-xs font-mono text-muted-foreground" onClick={resetAll}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset All Sections
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuildProfiles;
