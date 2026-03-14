import { useState } from 'react';
import { ShieldBan, Plus, Trash2, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface FirewallRule {
  id: string;
  name: string;
  direction: 'in' | 'out';
  action: 'block' | 'allow';
  protocol: 'TCP' | 'UDP' | 'Any';
  port?: string;
  program?: string;
  remoteAddress?: string;
  enabled: boolean;
}

interface FirewallPreset {
  id: string;
  name: string;
  description: string;
  rules: Omit<FirewallRule, 'id'>[];
  enabled: boolean;
}

const DEFAULT_PRESETS: FirewallPreset[] = [
  {
    id: 'block-telemetry',
    name: 'Block Telemetry',
    description: 'Block outbound connections to known Microsoft telemetry IPs',
    rules: [
      { name: 'Block Telemetry 1', direction: 'out', action: 'block', protocol: 'Any', remoteAddress: '13.64.0.0/11', enabled: true },
      { name: 'Block Telemetry 2', direction: 'out', action: 'block', protocol: 'Any', remoteAddress: '13.96.0.0/13', enabled: true },
      { name: 'Block NCSI', direction: 'out', action: 'block', protocol: 'Any', remoteAddress: '23.96.0.0/13', enabled: true },
      { name: 'Block Watson', direction: 'out', action: 'block', protocol: 'TCP', remoteAddress: '65.52.0.0/14', port: '443', enabled: true },
    ],
    enabled: false,
  },
  {
    id: 'block-uwp',
    name: 'Block UWP Apps',
    description: 'Prevent built-in Windows Store apps from accessing the internet',
    rules: [
      { name: 'Block Cortana', direction: 'out', action: 'block', protocol: 'Any', program: '%ProgramFiles%\\WindowsApps\\Microsoft.549981C3F5F10*\\SearchHost.exe', enabled: true },
      { name: 'Block Widgets', direction: 'out', action: 'block', protocol: 'Any', program: '%ProgramFiles%\\WindowsApps\\MicrosoftWindows.Client.WebExperience*\\msedgewebview2.exe', enabled: true },
      { name: 'Block Feedback Hub', direction: 'out', action: 'block', protocol: 'Any', program: '%ProgramFiles%\\WindowsApps\\Microsoft.WindowsFeedbackHub*\\PilotshubApp.exe', enabled: true },
      { name: 'Block Get Help', direction: 'out', action: 'block', protocol: 'Any', program: '%ProgramFiles%\\WindowsApps\\Microsoft.GetHelp*\\GetHelp.exe', enabled: true },
    ],
    enabled: false,
  },
  {
    id: 'strict-outbound',
    name: 'Strict Outbound',
    description: 'Block all outbound by default. Only allow DNS, HTTP/HTTPS, and DHCP.',
    rules: [
      { name: 'Allow DNS', direction: 'out', action: 'allow', protocol: 'UDP', port: '53', enabled: true },
      { name: 'Allow HTTP', direction: 'out', action: 'allow', protocol: 'TCP', port: '80', enabled: true },
      { name: 'Allow HTTPS', direction: 'out', action: 'allow', protocol: 'TCP', port: '443', enabled: true },
      { name: 'Allow DHCP', direction: 'out', action: 'allow', protocol: 'UDP', port: '67-68', enabled: true },
    ],
    enabled: false,
  },
];

interface FirewallRulesEditorProps {
  onCountChange?: (count: number) => void;
}

const FirewallRulesEditor = ({ onCountChange }: FirewallRulesEditorProps) => {
  const [presets, setPresets] = useState(DEFAULT_PRESETS);
  const [customRules, setCustomRules] = useState<FirewallRule[]>([]);
  const [expandedPreset, setExpandedPreset] = useState<string | null>(null);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState<Partial<FirewallRule>>({
    direction: 'out',
    action: 'block',
    protocol: 'TCP',
  });

  const totalRules = presets.filter(p => p.enabled).reduce((sum, p) => sum + p.rules.length, 0) + customRules.filter(r => r.enabled).length;

  const togglePreset = (id: string) => {
    setPresets(prev => {
      const next = prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p);
      const count = next.filter(p => p.enabled).reduce((s, p) => s + p.rules.length, 0) + customRules.filter(r => r.enabled).length;
      onCountChange?.(count);
      return next;
    });
  };

  const addCustomRule = () => {
    if (!newRule.name?.trim()) {
      toast.error('Rule name is required');
      return;
    }
    const rule: FirewallRule = {
      id: `custom-${Date.now()}`,
      name: newRule.name!,
      direction: newRule.direction as 'in' | 'out',
      action: newRule.action as 'block' | 'allow',
      protocol: newRule.protocol as 'TCP' | 'UDP' | 'Any',
      port: newRule.port,
      program: newRule.program,
      remoteAddress: newRule.remoteAddress,
      enabled: true,
    };
    setCustomRules(prev => {
      const next = [...prev, rule];
      const count = presets.filter(p => p.enabled).reduce((s, p) => s + p.rules.length, 0) + next.filter(r => r.enabled).length;
      onCountChange?.(count);
      return next;
    });
    setNewRule({ direction: 'out', action: 'block', protocol: 'TCP' });
    setShowAddRule(false);
    toast.success('Rule added');
  };

  const removeRule = (id: string) => {
    setCustomRules(prev => {
      const next = prev.filter(r => r.id !== id);
      const count = presets.filter(p => p.enabled).reduce((s, p) => s + p.rules.length, 0) + next.filter(r => r.enabled).length;
      onCountChange?.(count);
      return next;
    });
  };

  const generateCommands = (): string[] => {
    const cmds: string[] = ['# Windows Firewall Rules - Generated by ISO Forge'];

    presets.filter(p => p.enabled).forEach(preset => {
      cmds.push(`\n# --- ${preset.name} ---`);
      preset.rules.filter(r => r.enabled).forEach(rule => {
        let cmd = `netsh advfirewall firewall add rule name="${rule.name}" dir=${rule.direction} action=${rule.action} protocol=${rule.protocol}`;
        if (rule.port) cmd += ` localport=${rule.port}`;
        if (rule.program) cmd += ` program="${rule.program}"`;
        if (rule.remoteAddress) cmd += ` remoteip=${rule.remoteAddress}`;
        cmds.push(cmd);
      });
    });

    if (customRules.filter(r => r.enabled).length > 0) {
      cmds.push('\n# --- Custom Rules ---');
      customRules.filter(r => r.enabled).forEach(rule => {
        let cmd = `netsh advfirewall firewall add rule name="${rule.name}" dir=${rule.direction} action=${rule.action} protocol=${rule.protocol}`;
        if (rule.port) cmd += ` localport=${rule.port}`;
        if (rule.program) cmd += ` program="${rule.program}"`;
        if (rule.remoteAddress) cmd += ` remoteip=${rule.remoteAddress}`;
        cmds.push(cmd);
      });
    }

    return cmds;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <ShieldBan className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Firewall Rules</h3>
        <Badge variant={totalRules > 0 ? 'default' : 'secondary'} className="ml-auto text-xs font-mono">
          {totalRules} rules
        </Badge>
      </div>

      {/* Presets */}
      <div className="space-y-2 mb-3">
        {presets.map(preset => {
          const isExpanded = expandedPreset === preset.id;
          return (
            <div key={preset.id} className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 p-2.5">
                <Switch checked={preset.enabled} onCheckedChange={() => togglePreset(preset.id)} />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedPreset(isExpanded ? null : preset.id)}>
                  <span className="text-xs font-medium text-foreground">{preset.name}</span>
                  <p className="text-[10px] text-muted-foreground">{preset.description}</p>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono shrink-0">{preset.rules.length}</Badge>
                <button onClick={() => setExpandedPreset(isExpanded ? null : preset.id)} className="p-1 shrink-0">
                  {isExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                </button>
              </div>
              {isExpanded && (
                <div className="border-t border-border p-2.5 space-y-1">
                  {preset.rules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                      <ArrowUpDown className="w-3 h-3 shrink-0" />
                      <Badge variant={rule.action === 'block' ? 'destructive' : 'default'} className="text-[9px]">{rule.action}</Badge>
                      <span className="text-foreground">{rule.name}</span>
                      <span className="ml-auto">{rule.protocol}{rule.port ? `:${rule.port}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom rules */}
      {customRules.length > 0 && (
        <div className="space-y-1 mb-3">
          <p className="text-[11px] text-muted-foreground mb-1">Custom Rules:</p>
          {customRules.map(rule => (
            <div key={rule.id} className="flex items-center gap-2 p-2 border border-border rounded-lg">
              <Badge variant={rule.action === 'block' ? 'destructive' : 'default'} className="text-[9px] shrink-0">{rule.action}</Badge>
              <span className="text-xs text-foreground flex-1">{rule.name}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{rule.direction} {rule.protocol}{rule.port ? `:${rule.port}` : ''}</span>
              <button onClick={() => removeRule(rule.id)} className="p-1 hover:bg-destructive/10 rounded transition-colors">
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add custom rule form */}
      {showAddRule ? (
        <div className="border border-border rounded-lg p-3 space-y-2">
          <Input placeholder="Rule name" value={newRule.name || ''} onChange={e => setNewRule(prev => ({ ...prev, name: e.target.value }))} className="h-7 text-xs" />
          <div className="grid grid-cols-3 gap-2">
            <Select value={newRule.direction} onValueChange={v => setNewRule(prev => ({ ...prev, direction: v as 'in' | 'out' }))}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Inbound</SelectItem>
                <SelectItem value="out">Outbound</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newRule.action} onValueChange={v => setNewRule(prev => ({ ...prev, action: v as 'block' | 'allow' }))}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="block">Block</SelectItem>
                <SelectItem value="allow">Allow</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newRule.protocol} onValueChange={v => setNewRule(prev => ({ ...prev, protocol: v as 'TCP' | 'UDP' | 'Any' }))}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TCP">TCP</SelectItem>
                <SelectItem value="UDP">UDP</SelectItem>
                <SelectItem value="Any">Any</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input placeholder="Port (optional, e.g. 443 or 80-443)" value={newRule.port || ''} onChange={e => setNewRule(prev => ({ ...prev, port: e.target.value }))} className="h-7 text-xs" />
          <Input placeholder="Remote IP / CIDR (optional)" value={newRule.remoteAddress || ''} onChange={e => setNewRule(prev => ({ ...prev, remoteAddress: e.target.value }))} className="h-7 text-xs" />
          <div className="flex gap-2">
            <Button size="sm" className="text-xs flex-1" onClick={addCustomRule}>Add Rule</Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowAddRule(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" className="text-xs gap-1 w-full" onClick={() => setShowAddRule(true)}>
          <Plus className="w-3 h-3" /> Add Custom Rule
        </Button>
      )}

      {/* Commands preview */}
      {totalRules > 0 && (
        <div className="mt-3 p-2.5 bg-muted/30 rounded-lg">
          <p className="text-[10px] text-muted-foreground mb-1.5 font-mono">netsh commands:</p>
          <pre className="text-[10px] font-mono text-foreground max-h-24 overflow-y-auto whitespace-pre-wrap break-all">
            {generateCommands().slice(0, 5).join('\n')}
            {generateCommands().length > 5 && `\n... +${generateCommands().length - 5} more`}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FirewallRulesEditor;
