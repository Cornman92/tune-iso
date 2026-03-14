import { useState } from 'react';
import { Zap, Battery, Monitor, Cpu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PowerSetting {
  id: string;
  label: string;
  icon: React.ElementType;
  subGuid: string;
  settingGuid: string;
  type: 'select' | 'slider' | 'switch';
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  unit?: string;
  defaultValue: string;
}

const POWER_PLANS = [
  { id: 'balanced', name: 'Balanced', guid: '381b4222-f694-41f0-9685-ff5bb260df2e' },
  { id: 'high-perf', name: 'High Performance', guid: '8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c' },
  { id: 'ultimate', name: 'Ultimate Performance', guid: 'e9a42b02-d5df-448d-aa00-03f14749eb61' },
  { id: 'power-saver', name: 'Power Saver', guid: 'a1841308-3541-4fab-bc81-f71556f20b4a' },
];

const POWER_SETTINGS: PowerSetting[] = [
  {
    id: 'sleep-ac',
    label: 'Sleep After (Plugged In)',
    icon: Monitor,
    subGuid: '238c9fa8-0aad-41ed-83f4-97be242c8f20',
    settingGuid: '29f6c1db-86da-48c5-9fdb-f2b67b1f44da',
    type: 'select',
    options: [
      { label: 'Never', value: '0' },
      { label: '15 min', value: '900' },
      { label: '30 min', value: '1800' },
      { label: '1 hour', value: '3600' },
      { label: '2 hours', value: '7200' },
    ],
    defaultValue: '1800',
  },
  {
    id: 'sleep-dc',
    label: 'Sleep After (Battery)',
    icon: Battery,
    subGuid: '238c9fa8-0aad-41ed-83f4-97be242c8f20',
    settingGuid: '29f6c1db-86da-48c5-9fdb-f2b67b1f44da',
    type: 'select',
    options: [
      { label: 'Never', value: '0' },
      { label: '5 min', value: '300' },
      { label: '15 min', value: '900' },
      { label: '30 min', value: '1800' },
    ],
    defaultValue: '900',
  },
  {
    id: 'display-ac',
    label: 'Turn Off Display (Plugged In)',
    icon: Monitor,
    subGuid: '7516b95f-f776-4464-8c53-06167f40cc99',
    settingGuid: '3c0bc021-c8a8-4e07-a973-6b14cbcb2b7e',
    type: 'select',
    options: [
      { label: 'Never', value: '0' },
      { label: '5 min', value: '300' },
      { label: '10 min', value: '600' },
      { label: '15 min', value: '900' },
      { label: '30 min', value: '1800' },
    ],
    defaultValue: '600',
  },
  {
    id: 'cpu-min',
    label: 'Minimum CPU State (%)',
    icon: Cpu,
    subGuid: '54533251-82be-4824-96c1-47b60b740d00',
    settingGuid: '893dee8e-2bef-41e0-89c6-b55d0929964c',
    type: 'slider',
    min: 0,
    max: 100,
    unit: '%',
    defaultValue: '5',
  },
  {
    id: 'cpu-max',
    label: 'Maximum CPU State (%)',
    icon: Cpu,
    subGuid: '54533251-82be-4824-96c1-47b60b740d00',
    settingGuid: 'bc5038f7-23e0-4960-96da-33abaf5935ec',
    type: 'slider',
    min: 0,
    max: 100,
    unit: '%',
    defaultValue: '100',
  },
];

interface PowerPlanEditorProps {
  onCountChange?: (count: number) => void;
}

const PowerPlanEditor = ({ onCountChange }: PowerPlanEditorProps) => {
  const [selectedPlan, setSelectedPlan] = useState('high-perf');
  const [settings, setSettings] = useState<Record<string, string>>(() =>
    Object.fromEntries(POWER_SETTINGS.map(s => [s.id, s.defaultValue]))
  );
  const [hibernate, setHibernate] = useState(false);
  const [usbSuspend, setUsbSuspend] = useState(false);
  const [modified, setModified] = useState(false);

  const updateSetting = (id: string, value: string) => {
    setSettings(prev => ({ ...prev, [id]: value }));
    setModified(true);
    onCountChange?.(Object.keys(settings).length + (hibernate ? 1 : 0) + (usbSuspend ? 1 : 0));
  };

  const plan = POWER_PLANS.find(p => p.id === selectedPlan)!;

  const getCommands = (): string[] => {
    const cmds: string[] = [];
    cmds.push(`# Power Plan: ${plan.name}`);
    cmds.push(`powercfg /setactive ${plan.guid}`);

    POWER_SETTINGS.forEach(s => {
      const val = settings[s.id];
      if (val !== s.defaultValue) {
        cmds.push(`powercfg /change ${s.id.includes('-ac') ? 'standby-timeout-ac' : s.id.includes('-dc') ? 'standby-timeout-dc' : `${s.id}`} ${val}`);
      }
    });

    if (hibernate) {
      cmds.push('powercfg /hibernate off');
    }
    if (!usbSuspend) {
      cmds.push('# Disable USB selective suspend');
      cmds.push(`powercfg /setacvalueindex ${plan.guid} 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 0`);
    }

    return cmds;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Power Plan</h3>
        {modified && <Badge variant="default" className="ml-auto text-xs font-mono">Modified</Badge>}
      </div>

      {/* Plan selector */}
      <div className="mb-4">
        <Label className="text-xs text-muted-foreground mb-1.5 block">Active Power Plan</Label>
        <Select value={selectedPlan} onValueChange={v => { setSelectedPlan(v); setModified(true); }}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POWER_PLANS.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        {POWER_SETTINGS.map(setting => {
          const Icon = setting.icon;
          return (
            <div key={setting.id}>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <Label className="text-xs text-foreground">{setting.label}</Label>
              </div>
              {setting.type === 'select' && (
                <Select value={settings[setting.id]} onValueChange={v => updateSetting(setting.id, v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {setting.options!.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {setting.type === 'slider' && (
                <div className="flex items-center gap-3">
                  <Slider
                    value={[parseInt(settings[setting.id])]}
                    min={setting.min}
                    max={setting.max}
                    step={5}
                    onValueChange={([v]) => updateSetting(setting.id, String(v))}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono text-foreground w-10 text-right">
                    {settings[setting.id]}{setting.unit}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Toggle switches */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-foreground">Disable Hibernate</Label>
            <Switch checked={hibernate} onCheckedChange={v => { setHibernate(v); setModified(true); }} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-foreground">Disable USB Selective Suspend</Label>
            <Switch checked={usbSuspend} onCheckedChange={v => { setUsbSuspend(v); setModified(true); }} />
          </div>
        </div>
      </div>

      {/* Generated commands preview */}
      {modified && (
        <div className="mt-4 p-2.5 bg-muted/30 rounded-lg">
          <p className="text-[10px] text-muted-foreground mb-1.5 font-mono">powercfg commands:</p>
          <pre className="text-[10px] font-mono text-foreground max-h-24 overflow-y-auto whitespace-pre-wrap">
            {getCommands().join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PowerPlanEditor;
