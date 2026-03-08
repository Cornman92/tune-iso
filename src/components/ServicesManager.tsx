import { useState, useMemo, useEffect, MutableRefObject } from 'react';
import { Cog, Search, Shield, AlertTriangle, XOctagon, ToggleLeft, ToggleRight, Filter, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

type RiskLevel = 'safe' | 'moderate' | 'aggressive';

interface ServiceEntry {
  name: string;
  displayName: string;
  description: string;
  risk: RiskLevel;
  category: string;
  defaultEnabled: boolean;
}

const SERVICES: ServiceEntry[] = [
  // Telemetry - Safe
  { name: 'DiagTrack', displayName: 'Connected User Experiences and Telemetry', description: 'Windows telemetry data collection', risk: 'safe', category: 'Telemetry', defaultEnabled: true },
  { name: 'dmwappushservice', displayName: 'WAP Push Message Routing', description: 'Push messaging for telemetry', risk: 'safe', category: 'Telemetry', defaultEnabled: true },
  { name: 'diagnosticshub.standardcollector.service', displayName: 'Diagnostics Hub Standard Collector', description: 'Collects diagnostic data', risk: 'safe', category: 'Telemetry', defaultEnabled: true },

  // Privacy - Safe
  { name: 'lfsvc', displayName: 'Geolocation Service', description: 'Monitors device location', risk: 'safe', category: 'Privacy', defaultEnabled: true },
  { name: 'RemoteRegistry', displayName: 'Remote Registry', description: 'Remote registry modification', risk: 'safe', category: 'Privacy', defaultEnabled: true },

  // Apps - Safe
  { name: 'MapsBroker', displayName: 'Downloaded Maps Manager', description: 'Manages offline maps', risk: 'safe', category: 'Apps', defaultEnabled: true },
  { name: 'WalletService', displayName: 'WalletService', description: 'Wallet objects used by clients', risk: 'safe', category: 'Apps', defaultEnabled: true },
  { name: 'PhoneSvc', displayName: 'Phone Service', description: 'Manages telephony state', risk: 'safe', category: 'Apps', defaultEnabled: true },
  { name: 'MessagingService', displayName: 'Messaging Service', description: 'SMS/MMS message management', risk: 'safe', category: 'Apps', defaultEnabled: true },
  { name: 'PcaSvc', displayName: 'Program Compatibility Assistant', description: 'Detects compatibility issues with programs', risk: 'safe', category: 'Apps', defaultEnabled: true },
  { name: 'InventorySvc', displayName: 'Inventory Service', description: 'Collects system inventory data', risk: 'safe', category: 'Apps', defaultEnabled: true },
  { name: 'DevicesFlowUserSvc', displayName: 'Devices Flow', description: 'Connects and manages devices', risk: 'safe', category: 'Apps', defaultEnabled: true },
  { name: 'CaptureService', displayName: 'CaptureService', description: 'Screen capture related', risk: 'safe', category: 'Apps', defaultEnabled: true },
  { name: 'ClipSVC', displayName: 'Client License Service', description: 'License management for Store apps', risk: 'moderate', category: 'Apps', defaultEnabled: true },

  // Xbox - Safe
  { name: 'XblAuthManager', displayName: 'Xbox Live Auth Manager', description: 'Xbox Live authentication', risk: 'safe', category: 'Xbox', defaultEnabled: true },
  { name: 'XblGameSave', displayName: 'Xbox Live Game Save', description: 'Syncs Xbox game saves', risk: 'safe', category: 'Xbox', defaultEnabled: true },
  { name: 'XboxNetApiSvc', displayName: 'Xbox Live Networking Service', description: 'Xbox Live networking', risk: 'safe', category: 'Xbox', defaultEnabled: true },
  { name: 'XboxGipSvc', displayName: 'Xbox Accessory Management', description: 'Manages Xbox accessories', risk: 'safe', category: 'Xbox', defaultEnabled: true },
  { name: 'BcastDVRUserService', displayName: 'GameDVR & Broadcast', description: 'Game recording and broadcast', risk: 'safe', category: 'Xbox', defaultEnabled: true },

  // Media - Safe
  { name: 'WMPNetworkSvc', displayName: 'Windows Media Player Network', description: 'Shares Windows Media Player libraries', risk: 'safe', category: 'Media', defaultEnabled: true },

  // Misc - Safe
  { name: 'RetailDemo', displayName: 'Retail Demo Service', description: 'Retail demo experience for stores', risk: 'safe', category: 'Misc', defaultEnabled: true },
  { name: 'wisvc', displayName: 'Windows Insider Service', description: 'Windows Insider Program', risk: 'safe', category: 'Misc', defaultEnabled: true },
  { name: 'Fax', displayName: 'Fax', description: 'Send and receive faxes', risk: 'safe', category: 'Misc', defaultEnabled: true },
  { name: 'TrkWks', displayName: 'Distributed Link Tracking Client', description: 'Maintains NTFS links across network', risk: 'safe', category: 'Misc', defaultEnabled: true },
  { name: 'WpcMonSvc', displayName: 'Parental Controls', description: 'Family Safety monitoring', risk: 'safe', category: 'Misc', defaultEnabled: true },
  { name: 'SCardSvr', displayName: 'Smart Card', description: 'Manages smart card access', risk: 'safe', category: 'Misc', defaultEnabled: true },
  { name: 'ScDeviceEnum', displayName: 'Smart Card Device Enumeration', description: 'Enumerates smart card readers', risk: 'safe', category: 'Misc', defaultEnabled: true },
  { name: 'SEMgrSvc', displayName: 'Payments and NFC/SE Manager', description: 'NFC-based payment management', risk: 'safe', category: 'Misc', defaultEnabled: true },
  { name: 'AJRouter', displayName: 'AllJoyn Router Service', description: 'IoT AllJoyn messaging router', risk: 'safe', category: 'Misc', defaultEnabled: true },
  { name: 'ALG', displayName: 'Application Layer Gateway', description: 'FTP/plugin support for ICS', risk: 'safe', category: 'Misc', defaultEnabled: true },
  { name: 'PushToInstall', displayName: 'Push to Install Service', description: 'Remote app install via Store', risk: 'safe', category: 'Misc', defaultEnabled: true },
  { name: 'wercplsupport', displayName: 'Problem Reports Support', description: 'Problem reports control panel', risk: 'safe', category: 'Misc', defaultEnabled: true },
  { name: 'WpnService', displayName: 'Windows Push Notifications', description: 'Push notification platform', risk: 'moderate', category: 'Misc', defaultEnabled: true },
  { name: 'WpnUserService', displayName: 'Push Notification User Service', description: 'Per-user push notifications', risk: 'moderate', category: 'Misc', defaultEnabled: true },

  // Network - Safe/Moderate
  { name: 'SharedAccess', displayName: 'Internet Connection Sharing', description: 'NAT and sharing for home networks', risk: 'safe', category: 'Network', defaultEnabled: true },
  { name: 'CDPSvc', displayName: 'Connected Devices Platform', description: 'Cross-device experiences', risk: 'moderate', category: 'Network', defaultEnabled: true },
  { name: 'NcbService', displayName: 'Network Connection Broker', description: 'Manages network connections for Store apps', risk: 'moderate', category: 'Network', defaultEnabled: true },
  { name: 'lmhosts', displayName: 'TCP/IP NetBIOS Helper', description: 'NetBIOS name resolution support', risk: 'safe', category: 'Network', defaultEnabled: true },
  { name: 'icssvc', displayName: 'Windows Mobile Hotspot Service', description: 'Mobile hotspot capability', risk: 'safe', category: 'Network', defaultEnabled: true },
  { name: 'WFDSConMgrSvc', displayName: 'Wi-Fi Direct Services', description: 'Miracast and Wi-Fi Direct connections', risk: 'safe', category: 'Network', defaultEnabled: true },
  { name: 'RmSvc', displayName: 'Radio Management Service', description: 'Manages radio states (airplane mode)', risk: 'moderate', category: 'Network', defaultEnabled: true },
  { name: 'NcdAutoSetup', displayName: 'Network Connected Devices Auto-Setup', description: 'Auto-setup for network devices', risk: 'safe', category: 'Network', defaultEnabled: true },
  { name: 'WlanSvc', displayName: 'WLAN AutoConfig', description: 'Wi-Fi network configuration — disable only if wired', risk: 'moderate', category: 'Network', defaultEnabled: true },
  { name: 'p2psvc', displayName: 'Peer Networking Group', description: 'Peer-to-peer networking', risk: 'safe', category: 'Network', defaultEnabled: true },
  { name: 'p2pimsvc', displayName: 'Peer Networking Identity', description: 'Peer networking identity manager', risk: 'safe', category: 'Network', defaultEnabled: true },
  { name: 'PNRPsvc', displayName: 'Peer Name Resolution Protocol', description: 'PNRP name resolution', risk: 'safe', category: 'Network', defaultEnabled: true },
  { name: 'PNRPAutoReg', displayName: 'PNRP Machine Name Publication', description: 'Publishes machine name via PNRP', risk: 'safe', category: 'Network', defaultEnabled: true },
  { name: 'CDPUserSvc', displayName: 'Connected Devices Platform User', description: 'Per-user device connectivity', risk: 'safe', category: 'Network', defaultEnabled: true },
  { name: 'NaturalAuthentication', displayName: 'Natural Authentication', description: 'Dynamic lock & proximity features', risk: 'safe', category: 'Network', defaultEnabled: true },
  { name: 'SSDPSRV', displayName: 'SSDP Discovery', description: 'Discovers UPnP devices on network', risk: 'safe', category: 'Network', defaultEnabled: true },
  { name: 'upnphost', displayName: 'UPnP Device Host', description: 'Hosts UPnP devices', risk: 'safe', category: 'Network', defaultEnabled: true },

  // Performance - Moderate
  { name: 'SysMain', displayName: 'SysMain (Superfetch)', description: 'Maintains and improves system performance (may cause disk usage on HDDs)', risk: 'moderate', category: 'Performance', defaultEnabled: true },
  { name: 'WSearch', displayName: 'Windows Search', description: 'Content indexing and search (can be CPU-intensive)', risk: 'moderate', category: 'Performance', defaultEnabled: true },
  { name: 'tiledatamodelsvc', displayName: 'Tile Data Model Server', description: 'Tile data for Start menu', risk: 'safe', category: 'Performance', defaultEnabled: true },
  { name: 'OneSyncSvc', displayName: 'Sync Host', description: 'Synchronizes mail, contacts, calendar', risk: 'safe', category: 'Performance', defaultEnabled: true },

  // Input - Moderate
  { name: 'TabletInputService', displayName: 'Touch Keyboard and Handwriting', description: 'Pen and ink functionality', risk: 'moderate', category: 'Input', defaultEnabled: true },
  { name: 'SensorService', displayName: 'Sensor Service', description: 'Manages device sensors', risk: 'moderate', category: 'Input', defaultEnabled: true },
  { name: 'SensorDataService', displayName: 'Sensor Data Service', description: 'Delivers sensor data', risk: 'moderate', category: 'Input', defaultEnabled: true },
  { name: 'SensrSvc', displayName: 'Sensor Monitoring Service', description: 'Monitors and adapts to sensor data', risk: 'moderate', category: 'Input', defaultEnabled: true },

  // Hardware - Moderate
  { name: 'BluetoothUserService', displayName: 'Bluetooth User Support Service', description: 'Supports Bluetooth functionality', risk: 'moderate', category: 'Hardware', defaultEnabled: true },
  { name: 'bthserv', displayName: 'Bluetooth Support Service', description: 'Discovery and association of Bluetooth', risk: 'moderate', category: 'Hardware', defaultEnabled: true },
  { name: 'WiaRpc', displayName: 'Still Image Acquisition Events', description: 'Scanner event dispatching', risk: 'moderate', category: 'Hardware', defaultEnabled: true },
  { name: 'irmon', displayName: 'Infrared Monitor', description: 'Infrared device support', risk: 'safe', category: 'Hardware', defaultEnabled: true },
  { name: 'DeviceAssociationService', displayName: 'Device Association Service', description: 'Pairs wired/wireless devices', risk: 'moderate', category: 'Hardware', defaultEnabled: true },
  { name: 'DeviceInstall', displayName: 'Device Install Service', description: 'Manages device driver installs', risk: 'aggressive', category: 'Hardware', defaultEnabled: true },
  { name: 'PlugPlay', displayName: 'Plug and Play', description: 'Hardware detection and config — DO NOT disable', risk: 'aggressive', category: 'Hardware', defaultEnabled: true },

  // Media - Moderate
  { name: 'FrameServer', displayName: 'Windows Camera Frame Server', description: 'Manages access to camera frames', risk: 'moderate', category: 'Media', defaultEnabled: true },
  { name: 'stisvc', displayName: 'Windows Image Acquisition', description: 'Scanner and camera image acquisition', risk: 'moderate', category: 'Media', defaultEnabled: true },
  { name: 'AudioEndpointBuilder', displayName: 'Windows Audio Endpoint Builder', description: 'Manages audio devices — disabling breaks audio', risk: 'aggressive', category: 'Media', defaultEnabled: true },
  { name: 'Audiosrv', displayName: 'Windows Audio', description: 'Core audio service — disabling mutes all sound', risk: 'aggressive', category: 'Media', defaultEnabled: true },
  { name: 'AudioSrvHost', displayName: 'Audio Service Host', description: 'Per-session audio management', risk: 'aggressive', category: 'Media', defaultEnabled: true },

  // Security - Moderate
  { name: 'WbioSrvc', displayName: 'Windows Biometric Service', description: 'Fingerprint and face recognition', risk: 'moderate', category: 'Security', defaultEnabled: true },
  { name: 'BDESVC', displayName: 'BitLocker Drive Encryption', description: 'Encrypts drives with BitLocker', risk: 'moderate', category: 'Security', defaultEnabled: true },
  { name: 'KeyIso', displayName: 'CNG Key Isolation', description: 'Crypto key isolation in LSA', risk: 'aggressive', category: 'Security', defaultEnabled: true },
  { name: 'EFS', displayName: 'Encrypting File System', description: 'NTFS file-level encryption', risk: 'moderate', category: 'Security', defaultEnabled: true },
  { name: 'VaultSvc', displayName: 'Credential Manager', description: 'Stores Windows credentials', risk: 'aggressive', category: 'Security', defaultEnabled: true },
  { name: 'SamSs', displayName: 'Security Accounts Manager', description: 'SAM database — DO NOT disable', risk: 'aggressive', category: 'Security', defaultEnabled: true },

  // Printing - Moderate
  { name: 'Spooler', displayName: 'Print Spooler', description: 'Manages print jobs — disable if no printer', risk: 'moderate', category: 'Printing', defaultEnabled: true },
  { name: 'PrintNotify', displayName: 'Printer Extensions and Notifications', description: 'Custom printer notifications', risk: 'moderate', category: 'Printing', defaultEnabled: true },
  { name: 'PrintWorkflowUserSvc', displayName: 'Print Workflow User Service', description: 'Print workflow for modern apps', risk: 'safe', category: 'Printing', defaultEnabled: true },

  // System - Aggressive
  { name: 'wuauserv', displayName: 'Windows Update', description: 'Detects, downloads, installs updates — disabling stops all updates', risk: 'aggressive', category: 'System', defaultEnabled: true },
  { name: 'WaaSMedicSvc', displayName: 'Windows Update Medic Service', description: 'Repairs Windows Update components', risk: 'aggressive', category: 'System', defaultEnabled: true },
  { name: 'UsoSvc', displayName: 'Update Orchestrator Service', description: 'Manages Windows Updates — required for updates', risk: 'aggressive', category: 'System', defaultEnabled: true },
  { name: 'DPS', displayName: 'Diagnostic Policy Service', description: 'Problem detection and troubleshooting', risk: 'aggressive', category: 'System', defaultEnabled: true },
  { name: 'DoSvc', displayName: 'Delivery Optimization', description: 'Peer-to-peer update delivery', risk: 'moderate', category: 'System', defaultEnabled: true },
  { name: 'BITS', displayName: 'Background Intelligent Transfer Service', description: 'Background file transfers — used by Windows Update', risk: 'aggressive', category: 'System', defaultEnabled: true },
  { name: 'WdiServiceHost', displayName: 'Diagnostic Service Host', description: 'Diagnostic troubleshooting host', risk: 'moderate', category: 'System', defaultEnabled: true },
  { name: 'WdiSystemHost', displayName: 'Diagnostic System Host', description: 'System diagnostic host', risk: 'moderate', category: 'System', defaultEnabled: true },
  { name: 'InstallService', displayName: 'Microsoft Store Install', description: 'Store app installation service', risk: 'moderate', category: 'System', defaultEnabled: true },
  { name: 'TokenBroker', displayName: 'Web Account Manager', description: 'SSO token management for apps', risk: 'moderate', category: 'System', defaultEnabled: true },
  { name: 'AppXSvc', displayName: 'AppX Deployment Service', description: 'Deploys Store (UWP) apps', risk: 'aggressive', category: 'System', defaultEnabled: true },
  { name: 'Schedule', displayName: 'Task Scheduler', description: 'Manages scheduled tasks — many features depend on it', risk: 'aggressive', category: 'System', defaultEnabled: true },
  { name: 'TrustedInstaller', displayName: 'Windows Modules Installer', description: 'Installs/modifies Windows components', risk: 'aggressive', category: 'System', defaultEnabled: true },

  // Security - Aggressive
  { name: 'SecurityHealthService', displayName: 'Windows Security Service', description: 'Windows Security / Defender health monitoring', risk: 'aggressive', category: 'Security', defaultEnabled: true },
  { name: 'WinDefend', displayName: 'Windows Defender Antivirus', description: 'Real-time antivirus protection', risk: 'aggressive', category: 'Security', defaultEnabled: true },
  { name: 'wscsvc', displayName: 'Security Center', description: 'Monitors and reports security health', risk: 'aggressive', category: 'Security', defaultEnabled: true },
  { name: 'MpsSvc', displayName: 'Windows Firewall', description: 'Windows Defender Firewall — disabling removes firewall', risk: 'aggressive', category: 'Security', defaultEnabled: true },

  // Telemetry - Aggressive
  { name: 'WerSvc', displayName: 'Windows Error Reporting', description: 'Reports errors to Microsoft', risk: 'aggressive', category: 'Telemetry', defaultEnabled: true },

  // UI - Aggressive
  { name: 'Themes', displayName: 'Themes', description: 'User experience theme management — disabling gives classic look', risk: 'aggressive', category: 'UI', defaultEnabled: true },
  { name: 'FontCache', displayName: 'Windows Font Cache', description: 'Optimizes font performance', risk: 'aggressive', category: 'UI', defaultEnabled: true },
  { name: 'UxSms', displayName: 'Desktop Window Manager Session', description: 'DWM session management', risk: 'aggressive', category: 'UI', defaultEnabled: true },

  // Remote Access
  { name: 'TermService', displayName: 'Remote Desktop Services', description: 'Allows remote desktop connections', risk: 'moderate', category: 'Remote', defaultEnabled: true },
  { name: 'SessionEnv', displayName: 'Remote Desktop Configuration', description: 'RDP session configuration', risk: 'moderate', category: 'Remote', defaultEnabled: true },
  { name: 'UmRdpService', displayName: 'Remote Desktop Device Redirector', description: 'Redirects devices to RDP sessions', risk: 'moderate', category: 'Remote', defaultEnabled: true },
  { name: 'RemoteAccess', displayName: 'Routing and Remote Access', description: 'VPN/dial-up routing service', risk: 'safe', category: 'Remote', defaultEnabled: true },
  { name: 'RasAuto', displayName: 'Remote Access Auto Connection', description: 'Auto-dial for remote access', risk: 'safe', category: 'Remote', defaultEnabled: true },
  { name: 'RasMan', displayName: 'Remote Access Connection Manager', description: 'Manages VPN and dial-up connections', risk: 'moderate', category: 'Remote', defaultEnabled: true },

  // Scheduled Tasks
  { name: 'TimeBrokerSvc', displayName: 'Time Broker', description: 'Coordinates background task execution', risk: 'moderate', category: 'Background Tasks', defaultEnabled: true },
  { name: 'UserDataSvc', displayName: 'User Data Access', description: 'Access to contacts, calendars, messages', risk: 'safe', category: 'Background Tasks', defaultEnabled: true },
  { name: 'UnistoreSvc', displayName: 'User Data Storage', description: 'Stores user data for apps', risk: 'safe', category: 'Background Tasks', defaultEnabled: true },
  { name: 'cbdhsvc', displayName: 'Clipboard User Service', description: 'Per-user clipboard history', risk: 'safe', category: 'Background Tasks', defaultEnabled: true },
];

const riskConfig: Record<RiskLevel, { color: string; icon: React.ElementType; label: string }> = {
  safe: { color: 'text-success', icon: Shield, label: 'Safe' },
  moderate: { color: 'text-warning', icon: AlertTriangle, label: 'Moderate' },
  aggressive: { color: 'text-destructive', icon: XOctagon, label: 'Aggressive' },
};

interface ServicePreset {
  id: string;
  name: string;
  description: string;
  services: string[];
}

const SERVICE_PRESETS: ServicePreset[] = [
  {
    id: 'gaming',
    name: '🎮 Gaming PC',
    description: 'Disable telemetry, Xbox cloud services, and indexing for max FPS',
    services: ['DiagTrack', 'dmwappushservice', 'WSearch', 'SysMain', 'WerSvc', 'MapsBroker', 'lfsvc', 'RetailDemo', 'wisvc', 'PhoneSvc', 'WalletService', 'Fax', 'TabletInputService', 'WMPNetworkSvc', 'SharedAccess'],
  },
  {
    id: 'minimal',
    name: '🔧 Minimal Install',
    description: 'Disable everything safe + moderate for a lean system',
    services: SERVICES.filter(s => s.risk === 'safe' || s.risk === 'moderate').map(s => s.name),
  },
  {
    id: 'privacy',
    name: '🔒 Privacy Focused',
    description: 'Disable all telemetry, tracking, and remote services',
    services: ['DiagTrack', 'dmwappushservice', 'lfsvc', 'RemoteRegistry', 'WerSvc', 'CDPSvc', 'wisvc', 'MapsBroker', 'WMPNetworkSvc', 'SharedAccess', 'PhoneSvc', 'NcbService'],
  },
  {
    id: 'workstation',
    name: '💼 Workstation',
    description: 'Keep productivity services, disable gaming and consumer features',
    services: ['XblAuthManager', 'XblGameSave', 'XboxNetApiSvc', 'XboxGipSvc', 'RetailDemo', 'WalletService', 'DiagTrack', 'dmwappushservice', 'wisvc', 'WMPNetworkSvc'],
  },
];

interface ServicesManagerProps {
  isMounted: boolean;
  onCountChange?: (count: number) => void;
  exportRef?: MutableRefObject<() => string[]>;
}

const ServicesManager = ({ isMounted, onCountChange, exportRef }: ServicesManagerProps) => {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [disabledServices, setDisabledServices] = useState<Set<string>>(new Set());

  const disabledCount = disabledServices.size;

  useEffect(() => {
    onCountChange?.(disabledCount);
  }, [disabledCount, onCountChange]);

  useEffect(() => {
    if (exportRef) exportRef.current = () => [...disabledServices];
  }, [disabledServices, exportRef]);

  const toggleService = (name: string) => {
    setDisabledServices(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const disableByRisk = (risk: RiskLevel) => {
    setDisabledServices(prev => {
      const next = new Set(prev);
      SERVICES.filter(s => s.risk === risk).forEach(s => next.add(s.name));
      return next;
    });
  };

  const applyPreset = (preset: ServicePreset) => {
    setDisabledServices(new Set(preset.services));
  };

  const enableAll = () => setDisabledServices(new Set());

  const filtered = useMemo(() => {
    return SERVICES.filter(s => {
      if (riskFilter !== 'all' && s.risk !== riskFilter) return false;
      if (search && !s.displayName.toLowerCase().includes(search.toLowerCase()) && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, riskFilter]);

  const categories = useMemo(() => {
    const cats = new Map<string, ServiceEntry[]>();
    filtered.forEach(s => {
      if (!cats.has(s.category)) cats.set(s.category, []);
      cats.get(s.category)!.push(s);
    });
    return cats;
  }, [filtered]);

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden ${!isMounted ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cog className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Windows Services</h3>
            {disabledCount > 0 && (
              <Badge variant="secondary" className="text-xs">{disabledCount} disabled</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={enableAll} className="text-xs h-7">
            <ToggleRight className="w-3 h-3 mr-1" /> Enable All
          </Button>
        </div>

        {/* Presets */}
        <div className="mb-3">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Quick Presets
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SERVICE_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="text-left p-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all group"
              >
                <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{preset.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{preset.description}</p>
                <p className="text-[10px] font-mono text-primary mt-1">{preset.services.length} services</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant={riskFilter === 'all' ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setRiskFilter('all')}>
            <Filter className="w-3 h-3 mr-1" /> All
          </Button>
          {(['safe', 'moderate', 'aggressive'] as RiskLevel[]).map(risk => {
            const cfg = riskConfig[risk];
            const Icon = cfg.icon;
            return (
              <Button key={risk} variant={riskFilter === risk ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setRiskFilter(risk)}>
                <Icon className={`w-3 h-3 mr-1 ${riskFilter !== risk ? cfg.color : ''}`} /> {cfg.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="p-3">
        <div className="flex gap-2 mb-3">
          {(['safe', 'moderate', 'aggressive'] as RiskLevel[]).map(risk => (
            <Button key={risk} variant="outline" size="sm" className="h-7 text-xs" onClick={() => disableByRisk(risk)}>
              <ToggleLeft className="w-3 h-3 mr-1" /> Disable all {riskConfig[risk].label}
            </Button>
          ))}
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {[...categories.entries()].map(([cat, services]) => (
            <div key={cat}>
              <h4 className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-2">{cat}</h4>
              <div className="space-y-1">
                {services.map(svc => {
                  const isDisabled = disabledServices.has(svc.name);
                  const cfg = riskConfig[svc.risk];
                  const RiskIcon = cfg.icon;
                  return (
                    <div key={svc.name} className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${isDisabled ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/30 border-border'}`}>
                      <Switch checked={!isDisabled} onCheckedChange={() => toggleService(svc.name)} className="scale-75" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground truncate">{svc.displayName}</span>
                          <RiskIcon className={`w-3 h-3 shrink-0 ${cfg.color}`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-primary">{svc.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate">— {svc.description}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[9px] shrink-0 ${cfg.color}`}>{cfg.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {disabledCount > 0 && (
        <div className="p-3 border-t border-border bg-muted/20">
          <p className="text-[11px] font-mono text-muted-foreground mb-2">DISM / Registry Commands Preview:</p>
          <div className="bg-background rounded p-2 max-h-32 overflow-y-auto">
            {[...disabledServices].map(name => (
              <p key={name} className="text-[10px] font-mono text-muted-foreground">
                <span className="text-primary">REG ADD</span> "HKLM\SYSTEM\ControlSet001\Services\{name}" /v Start /t REG_DWORD /d 4 /f
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManager;
