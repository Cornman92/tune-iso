import { useState } from 'react';
import { FileText, Tag, Key, Settings2, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface IsoMetadataEditorProps {
  isMounted: boolean;
}

const EDITIONS = [
  { value: '', label: 'Auto-detect (no override)' },
  { value: 'Core', label: 'Home' },
  { value: 'CoreSingleLanguage', label: 'Home Single Language' },
  { value: 'Professional', label: 'Pro' },
  { value: 'ProfessionalWorkstation', label: 'Pro for Workstations' },
  { value: 'Education', label: 'Education' },
  { value: 'Enterprise', label: 'Enterprise' },
  { value: 'EnterpriseS', label: 'Enterprise LTSC' },
  { value: 'ServerStandard', label: 'Server Standard' },
  { value: 'ServerDatacenter', label: 'Server Datacenter' },
];

const CHANNELS = [
  { value: '', label: 'Default' },
  { value: 'Retail', label: 'Retail' },
  { value: 'OEM', label: 'OEM' },
  { value: 'Volume', label: 'Volume (VL)' },
];

const IsoMetadataEditor = ({ isMounted }: IsoMetadataEditorProps) => {
  const [isoLabel, setIsoLabel] = useState('WIN11_CUSTOM_X64');
  const [eiCfgEnabled, setEiCfgEnabled] = useState(false);
  const [eiEdition, setEiEdition] = useState('');
  const [eiChannel, setEiChannel] = useState('');
  const [pidEnabled, setPidEnabled] = useState(false);
  const [productKey, setProductKey] = useState('');
  const [bootMenuText, setBootMenuText] = useState('Windows 11 Custom');
  const [bootTimeout, setBootTimeout] = useState('10');
  const [skipEditionSelect, setSkipEditionSelect] = useState(false);

  const changeCount = [eiCfgEnabled, pidEnabled && productKey.length > 0, bootMenuText !== 'Windows 11 Custom', isoLabel !== 'WIN11_CUSTOM_X64', skipEditionSelect].filter(Boolean).length;

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden ${!isMounted ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">ISO Metadata</h3>
          {changeCount > 0 && (
            <Badge variant="secondary" className="text-[10px] font-mono">{changeCount} modified</Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* ISO Label */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">ISO Volume Label</label>
          </div>
          <Input
            value={isoLabel}
            onChange={e => setIsoLabel(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 32))}
            className="font-mono text-sm h-9"
            placeholder="WIN11_CUSTOM_X64"
          />
          <p className="text-[10px] text-muted-foreground">Alphanumeric + underscore, max 32 chars. Shown in drive properties.</p>
        </div>

        {/* Boot Menu */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Boot Menu Text</label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={bootMenuText}
              onChange={e => setBootMenuText(e.target.value.slice(0, 80))}
              className="font-mono text-sm h-9"
              placeholder="Windows 11 Custom"
            />
            <Input
              value={bootTimeout}
              onChange={e => setBootTimeout(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
              className="font-mono text-sm h-9"
              placeholder="10"
              type="text"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">Description shown in boot manager • Timeout in seconds</p>
        </div>

        {/* EI.cfg */}
        <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium text-foreground">EI.cfg</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px]">
                  <p className="text-xs">Controls which edition the installer offers. Remove or edit to bypass edition selection screen.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch checked={eiCfgEnabled} onCheckedChange={setEiCfgEnabled} />
          </div>

          {eiCfgEnabled && (
            <div className="space-y-2 ml-5">
              <div>
                <label className="text-[10px] font-mono text-muted-foreground">Edition</label>
                <Select value={eiEdition} onValueChange={setEiEdition}>
                  <SelectTrigger className="h-8 text-xs font-mono"><SelectValue placeholder="Select edition..." /></SelectTrigger>
                  <SelectContent>
                    {EDITIONS.map(ed => (
                      <SelectItem key={ed.value} value={ed.value || '_auto'} className="text-xs font-mono">{ed.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted-foreground">Channel</label>
                <Select value={eiChannel} onValueChange={setEiChannel}>
                  <SelectTrigger className="h-8 text-xs font-mono"><SelectValue placeholder="Select channel..." /></SelectTrigger>
                  <SelectContent>
                    {CHANNELS.map(ch => (
                      <SelectItem key={ch.value} value={ch.value || '_default'} className="text-xs font-mono">{ch.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Switch checked={skipEditionSelect} onCheckedChange={setSkipEditionSelect} />
                <span className="text-xs text-muted-foreground">Skip edition selection screen</span>
              </div>
            </div>
          )}
        </div>

        {/* PID.txt */}
        <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-warning" />
              <span className="text-sm font-medium text-foreground">PID.txt</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px]">
                  <p className="text-xs">Embeds a product key that auto-fills during installation. Use generic/KMS keys for deployment.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch checked={pidEnabled} onCheckedChange={setPidEnabled} />
          </div>

          {pidEnabled && (
            <div className="ml-5 space-y-2">
              <Input
                value={productKey}
                onChange={e => {
                  let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                  // Auto-insert dashes at positions 5, 11, 17, 23
                  const clean = val.replace(/-/g, '');
                  const parts = clean.match(/.{1,5}/g) || [];
                  val = parts.join('-').slice(0, 29);
                  setProductKey(val);
                }}
                className="font-mono text-sm h-9 tracking-wider"
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                maxLength={29}
              />
              <p className="text-[10px] text-muted-foreground">Format: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX</p>
            </div>
          )}
        </div>

        {/* Preview */}
        {(eiCfgEnabled || pidEnabled) && (
          <div className="p-3 bg-muted/30 rounded-lg border border-border">
            <p className="text-[11px] font-mono text-muted-foreground mb-2 flex items-center gap-1.5">
              <Info className="w-3 h-3 text-primary" /> Files to inject
            </p>
            <div className="space-y-1 text-[11px] font-mono">
              {eiCfgEnabled && (
                <div>
                  <span className="text-primary">sources/EI.cfg</span>
                  <span className="text-muted-foreground"> → [{eiChannel || 'Default'}] {eiEdition && eiEdition !== '_auto' ? eiEdition : 'Auto'}</span>
                </div>
              )}
              {pidEnabled && productKey.length === 29 && (
                <div>
                  <span className="text-primary">sources/PID.txt</span>
                  <span className="text-muted-foreground"> → [PID] Value={productKey}</span>
                </div>
              )}
              <div>
                <span className="text-primary">boot/BCD</span>
                <span className="text-muted-foreground"> → description="{bootMenuText}" timeout={bootTimeout}s</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IsoMetadataEditor;