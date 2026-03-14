import { useState } from 'react';
import { Globe, Plus, Trash2, Download, Shield, Ban, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface HostsBlock {
  id: string;
  name: string;
  description: string;
  entries: string[];
  enabled: boolean;
  isPreset: boolean;
}

const PRESET_BLOCKS: HostsBlock[] = [
  {
    id: 'telemetry',
    name: 'Block Microsoft Telemetry',
    description: 'Blocks known Microsoft telemetry and data collection endpoints',
    entries: [
      '0.0.0.0 vortex.data.microsoft.com',
      '0.0.0.0 vortex-win.data.microsoft.com',
      '0.0.0.0 telecommand.telemetry.microsoft.com',
      '0.0.0.0 telecommand.telemetry.microsoft.com.nsatc.net',
      '0.0.0.0 oca.telemetry.microsoft.com',
      '0.0.0.0 oca.telemetry.microsoft.com.nsatc.net',
      '0.0.0.0 sqm.telemetry.microsoft.com',
      '0.0.0.0 sqm.telemetry.microsoft.com.nsatc.net',
      '0.0.0.0 watson.telemetry.microsoft.com',
      '0.0.0.0 watson.telemetry.microsoft.com.nsatc.net',
      '0.0.0.0 redir.metaservices.microsoft.com',
      '0.0.0.0 choice.microsoft.com',
      '0.0.0.0 choice.microsoft.com.nsatc.net',
      '0.0.0.0 df.telemetry.microsoft.com',
      '0.0.0.0 reports.wes.df.telemetry.microsoft.com',
      '0.0.0.0 wes.df.telemetry.microsoft.com',
      '0.0.0.0 services.wes.df.telemetry.microsoft.com',
      '0.0.0.0 sqm.df.telemetry.microsoft.com',
      '0.0.0.0 watson.ppe.telemetry.microsoft.com',
      '0.0.0.0 telemetry.microsoft.com',
      '0.0.0.0 watson.microsoft.com',
      '0.0.0.0 statsfe2.ws.microsoft.com',
      '0.0.0.0 corpext.msitadfs.glbdns2.microsoft.com',
      '0.0.0.0 compatexchange.cloudapp.net',
      '0.0.0.0 cs1.wpc.v0cdn.net',
      '0.0.0.0 a-0001.a-msedge.net',
      '0.0.0.0 settings-sandbox.data.microsoft.com',
    ],
    enabled: false,
    isPreset: true,
  },
  {
    id: 'ads',
    name: 'Block Ad Servers',
    description: 'Blocks common advertising and tracking domains',
    entries: [
      '0.0.0.0 ads.google.com',
      '0.0.0.0 pagead2.googlesyndication.com',
      '0.0.0.0 adservice.google.com',
      '0.0.0.0 ad.doubleclick.net',
      '0.0.0.0 googleads.g.doubleclick.net',
      '0.0.0.0 www.googleadservices.com',
      '0.0.0.0 creative.media.net',
      '0.0.0.0 static.media.net',
      '0.0.0.0 ade.googlesyndication.com',
      '0.0.0.0 scdn.cxense.com',
      '0.0.0.0 t.co',
      '0.0.0.0 platform.twitter.com',
      '0.0.0.0 ads.facebook.com',
      '0.0.0.0 pixel.facebook.com',
      '0.0.0.0 an.facebook.com',
    ],
    enabled: false,
    isPreset: true,
  },
  {
    id: 'copilot',
    name: 'Block Copilot & AI',
    description: 'Blocks Windows Copilot, Recall, and related AI endpoints',
    entries: [
      '0.0.0.0 copilot.microsoft.com',
      '0.0.0.0 www.bing.com',
      '0.0.0.0 edgeservices.bing.com',
      '0.0.0.0 sydney.bing.com',
      '0.0.0.0 substrate.office.com',
    ],
    enabled: false,
    isPreset: true,
  },
];

interface HostsFileEditorProps {
  isMounted: boolean;
  onCountChange?: (count: number) => void;
}

const HostsFileEditor = ({ isMounted, onCountChange }: HostsFileEditorProps) => {
  const [blocks, setBlocks] = useState<HostsBlock[]>([...PRESET_BLOCKS]);
  const [customEntry, setCustomEntry] = useState('');
  const [customBlockName, setCustomBlockName] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  const enabledCount = blocks.filter(b => b.enabled).reduce((sum, b) => sum + b.entries.length, 0);

  const toggleBlock = (id: string) => {
    setBlocks(prev => {
      const next = prev.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b);
      const count = next.filter(b => b.enabled).reduce((sum, b) => sum + b.entries.length, 0);
      onCountChange?.(count);
      return next;
    });
  };

  const addCustomBlock = () => {
    if (!customEntry.trim()) return;
    const entries = customEntry.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    if (entries.length === 0) return;

    const newBlock: HostsBlock = {
      id: `custom-${Date.now()}`,
      name: customBlockName || `Custom Block ${blocks.filter(b => !b.isPreset).length + 1}`,
      description: `${entries.length} custom entries`,
      entries,
      enabled: true,
      isPreset: false,
    };

    setBlocks(prev => {
      const next = [...prev, newBlock];
      const count = next.filter(b => b.enabled).reduce((sum, b) => sum + b.entries.length, 0);
      onCountChange?.(count);
      return next;
    });
    setCustomEntry('');
    setCustomBlockName('');
    setShowAddCustom(false);
    toast.success(`Added ${entries.length} hosts entries`);
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => {
      const next = prev.filter(b => b.id !== id);
      const count = next.filter(b => b.enabled).reduce((sum, b) => sum + b.entries.length, 0);
      onCountChange?.(count);
      return next;
    });
  };

  const generateHostsContent = (): string => {
    const lines = ['# Generated by ISO Forge - Hosts File', `# Date: ${new Date().toISOString()}`, ''];
    blocks.filter(b => b.enabled).forEach(block => {
      lines.push(`# === ${block.name} ===`);
      block.entries.forEach(e => lines.push(e));
      lines.push('');
    });
    return lines.join('\n');
  };

  const exportHosts = () => {
    const content = generateHostsContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hosts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Hosts file exported');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Hosts File Editor</h3>
        <Badge variant={enabledCount > 0 ? 'default' : 'secondary'} className="ml-auto text-xs font-mono">
          {enabledCount} entries
        </Badge>
      </div>

      <p className="text-[11px] text-muted-foreground mb-3">
        Manage <code className="text-primary">$MountDir\Windows\System32\drivers\etc\hosts</code> entries to block domains at the system level.
      </p>

      <div className="space-y-2 mb-3">
        {blocks.map(block => {
          const isExpanded = expandedBlock === block.id;
          return (
            <div key={block.id} className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 p-2.5">
                <Switch
                  checked={block.enabled}
                  onCheckedChange={() => toggleBlock(block.id)}
                />
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                >
                  <div className="flex items-center gap-2">
                    {block.isPreset ? <Shield className="w-3 h-3 text-primary shrink-0" /> : <Ban className="w-3 h-3 text-warning shrink-0" />}
                    <span className="text-xs font-medium text-foreground">{block.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{block.entries.length}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{block.description}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!block.isPreset && (
                    <button onClick={() => removeBlock(block.id)} className="p-1 rounded hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  )}
                  <button onClick={() => setExpandedBlock(isExpanded ? null : block.id)} className="p-1">
                    {isExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border p-2.5">
                  <pre className="text-[10px] font-mono text-muted-foreground max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {block.entries.join('\n')}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAddCustom ? (
        <div className="border border-border rounded-lg p-3 space-y-2">
          <Input
            placeholder="Block name (optional)"
            value={customBlockName}
            onChange={e => setCustomBlockName(e.target.value)}
            className="h-7 text-xs"
          />
          <Textarea
            placeholder="0.0.0.0 example.com&#10;0.0.0.0 tracking.example.com&#10;# One entry per line"
            value={customEntry}
            onChange={e => setCustomEntry(e.target.value)}
            rows={4}
            className="text-xs font-mono"
          />
          <div className="flex gap-2">
            <Button size="sm" className="text-xs flex-1" onClick={addCustomBlock}>Add Block</Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowAddCustom(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs gap-1 flex-1" onClick={() => setShowAddCustom(true)}>
            <Plus className="w-3 h-3" /> Add Custom Block
          </Button>
          {enabledCount > 0 && (
            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={exportHosts}>
              <Download className="w-3 h-3" /> Export
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default HostsFileEditor;
