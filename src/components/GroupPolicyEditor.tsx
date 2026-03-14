import { useState, useMemo } from 'react';
import { Shield, ChevronDown, ChevronUp, Search, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GPOSetting {
  id: string;
  name: string;
  description: string;
  category: string;
  registryPath: string;
  valueName: string;
  valueType: 'REG_DWORD' | 'REG_SZ';
  enabledValue: string;
  disabledValue: string;
  risk: 'safe' | 'moderate' | 'aggressive';
  defaultEnabled: boolean;
}

const GPO_SETTINGS: GPOSetting[] = [
  // Security
  { id: 'uac-max', name: 'UAC Maximum Level', description: 'Always notify on system changes (most secure)', category: 'Security', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System', valueName: 'ConsentPromptBehaviorAdmin', valueType: 'REG_DWORD', enabledValue: '2', disabledValue: '5', risk: 'safe', defaultEnabled: false },
  { id: 'uac-disable', name: 'Disable UAC Dimming', description: 'Switch to secure desktop for UAC prompts', category: 'Security', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System', valueName: 'PromptOnSecureDesktop', valueType: 'REG_DWORD', enabledValue: '0', disabledValue: '1', risk: 'moderate', defaultEnabled: false },
  { id: 'smb1-disable', name: 'Disable SMBv1', description: 'Disable insecure SMBv1 protocol', category: 'Security', registryPath: 'HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\LanmanServer\\Parameters', valueName: 'SMB1', valueType: 'REG_DWORD', enabledValue: '0', disabledValue: '1', risk: 'safe', defaultEnabled: false },
  { id: 'rdp-nla', name: 'Require NLA for RDP', description: 'Network Level Authentication for Remote Desktop', category: 'Security', registryPath: 'HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\Terminal Server\\WinStations\\RDP-Tcp', valueName: 'UserAuthentication', valueType: 'REG_DWORD', enabledValue: '1', disabledValue: '0', risk: 'safe', defaultEnabled: false },
  { id: 'credential-guard', name: 'Enable Credential Guard', description: 'Virtualization-based security for credentials', category: 'Security', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\DeviceGuard', valueName: 'EnableVirtualizationBasedSecurity', valueType: 'REG_DWORD', enabledValue: '1', disabledValue: '0', risk: 'moderate', defaultEnabled: false },
  { id: 'password-complexity', name: 'Password Complexity', description: 'Require complex passwords', category: 'Security', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\System', valueName: 'PasswordComplexity', valueType: 'REG_DWORD', enabledValue: '1', disabledValue: '0', risk: 'safe', defaultEnabled: false },

  // Windows Update
  { id: 'wu-no-auto-restart', name: 'No Auto Restart', description: 'Prevent automatic restarts after updates', category: 'Update', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU', valueName: 'NoAutoRebootWithLoggedOnUsers', valueType: 'REG_DWORD', enabledValue: '1', disabledValue: '0', risk: 'safe', defaultEnabled: false },
  { id: 'wu-defer-quality', name: 'Defer Quality Updates (30d)', description: 'Delay quality updates by 30 days', category: 'Update', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate', valueName: 'DeferQualityUpdatesPeriodInDays', valueType: 'REG_DWORD', enabledValue: '30', disabledValue: '0', risk: 'safe', defaultEnabled: false },
  { id: 'wu-defer-feature', name: 'Defer Feature Updates (90d)', description: 'Delay feature updates by 90 days', category: 'Update', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate', valueName: 'DeferFeatureUpdatesPeriodInDays', valueType: 'REG_DWORD', enabledValue: '90', disabledValue: '0', risk: 'safe', defaultEnabled: false },
  { id: 'wu-notify-download', name: 'Notify Before Download', description: 'Only notify about updates, don\'t auto-download', category: 'Update', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU', valueName: 'AUOptions', valueType: 'REG_DWORD', enabledValue: '2', disabledValue: '4', risk: 'moderate', defaultEnabled: false },
  { id: 'wu-no-driver-updates', name: 'No Driver via WU', description: 'Prevent Windows Update from installing drivers', category: 'Update', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate', valueName: 'ExcludeWUDriversInQualityUpdate', valueType: 'REG_DWORD', enabledValue: '1', disabledValue: '0', risk: 'moderate', defaultEnabled: false },

  // Defender
  { id: 'defender-pua', name: 'Defender PUA Protection', description: 'Block potentially unwanted applications', category: 'Defender', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows Defender', valueName: 'PUAProtection', valueType: 'REG_DWORD', enabledValue: '1', disabledValue: '0', risk: 'safe', defaultEnabled: false },
  { id: 'defender-cloud', name: 'Defender Cloud Protection', description: 'Enable cloud-delivered protection', category: 'Defender', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Spynet', valueName: 'SpynetReporting', valueType: 'REG_DWORD', enabledValue: '2', disabledValue: '0', risk: 'safe', defaultEnabled: false },
  { id: 'defender-asrules', name: 'Attack Surface Reduction', description: 'Enable ASR rules for exploit protection', category: 'Defender', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Windows Defender Exploit Guard\\ASR', valueName: 'ExploitGuard_ASR_Rules', valueType: 'REG_DWORD', enabledValue: '1', disabledValue: '0', risk: 'moderate', defaultEnabled: false },

  // Privacy
  { id: 'gpo-no-telemetry', name: 'Disable Telemetry (GPO)', description: 'Set diagnostic data to Security level via policy', category: 'Privacy', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection', valueName: 'AllowTelemetry', valueType: 'REG_DWORD', enabledValue: '0', disabledValue: '3', risk: 'moderate', defaultEnabled: false },
  { id: 'gpo-no-experiments', name: 'Disable Experiments', description: 'Prevent Microsoft from running experiments', category: 'Privacy', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Microsoft\\PolicyManager\\current\\device\\System', valueName: 'AllowExperimentation', valueType: 'REG_DWORD', enabledValue: '0', disabledValue: '3', risk: 'safe', defaultEnabled: false },
  { id: 'gpo-disable-ceip', name: 'Disable CEIP', description: 'Customer Experience Improvement Program', category: 'Privacy', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\SQMClient\\Windows', valueName: 'CEIPEnable', valueType: 'REG_DWORD', enabledValue: '0', disabledValue: '1', risk: 'safe', defaultEnabled: false },

  // User Experience
  { id: 'no-first-run-animation', name: 'Skip First Sign-in Animation', description: 'Disable the "Hi, we\'re getting things ready" animation', category: 'UX', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System', valueName: 'EnableFirstLogonAnimation', valueType: 'REG_DWORD', enabledValue: '0', disabledValue: '1', risk: 'safe', defaultEnabled: false },
  { id: 'no-edge-firstrun', name: 'Skip Edge First Run', description: 'Disable Edge first run experience', category: 'UX', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Edge', valueName: 'HideFirstRunExperience', valueType: 'REG_DWORD', enabledValue: '1', disabledValue: '0', risk: 'safe', defaultEnabled: false },
  { id: 'disable-autoplay', name: 'Disable AutoPlay', description: 'Prevent automatic playback of removable media', category: 'UX', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer', valueName: 'NoDriveTypeAutoRun', valueType: 'REG_DWORD', enabledValue: '255', disabledValue: '0', risk: 'safe', defaultEnabled: false },

  // Network
  { id: 'disable-netbios', name: 'Disable NetBIOS', description: 'Disable legacy NetBIOS over TCP/IP', category: 'Network', registryPath: 'HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\NetBT\\Parameters', valueName: 'NetbiosOptions', valueType: 'REG_DWORD', enabledValue: '2', disabledValue: '0', risk: 'moderate', defaultEnabled: false },
  { id: 'disable-llmnr', name: 'Disable LLMNR', description: 'Disable Link-Local Multicast Name Resolution', category: 'Network', registryPath: 'HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows NT\\DNSClient', valueName: 'EnableMulticast', valueType: 'REG_DWORD', enabledValue: '0', disabledValue: '1', risk: 'moderate', defaultEnabled: false },
  { id: 'disable-wpad', name: 'Disable WPAD', description: 'Disable Web Proxy Auto Discovery protocol', category: 'Network', registryPath: 'HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\WinHttpAutoProxySvc', valueName: 'Start', valueType: 'REG_DWORD', enabledValue: '4', disabledValue: '3', risk: 'moderate', defaultEnabled: false },
];

const CATEGORIES = [...new Set(GPO_SETTINGS.map(s => s.category))];

interface GroupPolicyEditorProps {
  isMounted: boolean;
  onCountChange?: (count: number) => void;
}

const GroupPolicyEditor = ({ isMounted, onCountChange }: GroupPolicyEditorProps) => {
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const enabledCount = Object.values(settings).filter(Boolean).length;

  const filteredSettings = useMemo(() => {
    let filtered = GPO_SETTINGS;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [selectedCategory, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredSettings> = {};
    filteredSettings.forEach(s => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [filteredSettings]);

  const toggleSetting = (id: string) => {
    setSettings(prev => {
      const next = { ...prev, [id]: !prev[id] };
      const count = Object.values(next).filter(Boolean).length;
      onCountChange?.(count);
      return next;
    });
  };

  const riskIcons: Record<string, string> = {
    safe: 'text-success',
    moderate: 'text-warning',
    aggressive: 'text-destructive',
  };

  const getCommands = (): string[] => {
    return GPO_SETTINGS
      .filter(s => settings[s.id])
      .map(s => `REG ADD "${s.registryPath}" /v ${s.valueName} /t ${s.valueType} /d ${s.enabledValue} /f`);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Group Policy Editor</h3>
        <Badge variant={enabledCount > 0 ? 'default' : 'secondary'} className="ml-auto text-xs font-mono">
          {enabledCount} active
        </Badge>
      </div>

      {!isMounted && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 border border-warning/20 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
          <p className="text-[11px] text-warning">Mount an image to apply policies to offline registry hives</p>
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search policies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {Object.entries(grouped).map(([category, items]) => {
          const isExpanded = expandedCategory === category || expandedCategory === null;
          const activeInCategory = items.filter(i => settings[i.id]).length;

          return (
            <div key={category} className="border border-border rounded-lg overflow-hidden">
              <button
                className="flex items-center justify-between w-full p-2.5 text-left hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
              >
                <span className="text-xs font-medium text-foreground">{category}</span>
                <div className="flex items-center gap-2">
                  {activeInCategory > 0 && (
                    <Badge variant="default" className="text-[10px] font-mono">{activeInCategory}</Badge>
                  )}
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border divide-y divide-border">
                  {items.map(setting => (
                    <div key={setting.id} className="flex items-center gap-3 p-2.5">
                      <Switch
                        checked={!!settings[setting.id]}
                        onCheckedChange={() => toggleSetting(setting.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-foreground">{setting.name}</span>
                          <span className={`text-[10px] ${riskIcons[setting.risk]}`}>●</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{setting.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {enabledCount > 0 && (
        <div className="mt-3 p-2.5 bg-muted/30 rounded-lg">
          <p className="text-[10px] text-muted-foreground mb-1.5 font-mono">Generated commands preview:</p>
          <pre className="text-[10px] font-mono text-foreground max-h-24 overflow-y-auto whitespace-pre-wrap break-all">
            {getCommands().slice(0, 3).join('\n')}
            {getCommands().length > 3 && `\n... +${getCommands().length - 3} more`}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GroupPolicyEditor;
export { GPO_SETTINGS };
