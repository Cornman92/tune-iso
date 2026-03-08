import { useState, useEffect, MutableRefObject } from 'react';
import { Download, Plus, Trash2, Search, ExternalLink, CheckCircle2, Clock, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export interface KBUpdate {
  id: string;
  kb: string;
  title: string;
  description: string;
  date: string;
  size: string;
  category: 'cumulative' | 'security' | 'servicing' | 'dotnet' | 'driver' | 'feature' | 'custom';
  enabled: boolean;
  source: 'catalog' | 'manual';
  url?: string;
  filePath?: string;
}

interface WindowsUpdateProps {
  isMounted: boolean;
  onCountChange?: (count: number) => void;
  exportRef?: MutableRefObject<() => { kb: string; title: string; category: string; source: string; filePath?: string }[]>;
  importRef?: MutableRefObject<(data: { kb: string; title: string; category: string; source: string; filePath?: string }[]) => void>;
}

const catalogUpdates: Omit<KBUpdate, 'id' | 'enabled' | 'source'>[] = [
  // Cumulative Updates
  { kb: 'KB5034441', title: 'Windows Recovery Environment Update', description: 'Security update for WinRE partition (BitLocker bypass fix)', date: '2024-01', size: '553 MB', category: 'security' },
  { kb: 'KB5035853', title: '2024-03 Cumulative Update (Win11 23H2)', description: 'Latest cumulative update with security & quality fixes', date: '2024-03', size: '467 MB', category: 'cumulative' },
  { kb: 'KB5036893', title: '2024-04 Cumulative Update (Win11 23H2)', description: 'Monthly security and reliability improvements', date: '2024-04', size: '481 MB', category: 'cumulative' },
  { kb: 'KB5037771', title: '2024-05 Cumulative Update (Win11 23H2)', description: 'Security patches and Copilot improvements', date: '2024-05', size: '490 MB', category: 'cumulative' },
  { kb: 'KB5039212', title: '2024-06 Cumulative Update (Win11 23H2)', description: 'Wi-Fi, Bluetooth, and Start menu fixes', date: '2024-06', size: '502 MB', category: 'cumulative' },
  { kb: 'KB5040442', title: '2024-07 Cumulative Update (Win11 23H2)', description: 'File Explorer tabs fix, security patches', date: '2024-07', size: '512 MB', category: 'cumulative' },
  { kb: 'KB5041585', title: '2024-08 Cumulative Update (Win11 23H2)', description: 'Kernel security updates, UEFI fixes', date: '2024-08', size: '523 MB', category: 'cumulative' },
  { kb: 'KB5043076', title: '2024-09 Cumulative Update (Win11 23H2)', description: 'SMB, Hyper-V, and networking fixes', date: '2024-09', size: '531 MB', category: 'cumulative' },
  { kb: 'KB5044284', title: '2024-10 Cumulative Update (Win11 23H2)', description: 'Taskbar, widgets, and printing fixes', date: '2024-10', size: '540 MB', category: 'cumulative' },
  { kb: 'KB5046617', title: '2024-11 Cumulative Update (Win11 24H2)', description: 'Latest 24H2 cumulative security update', date: '2024-11', size: '560 MB', category: 'cumulative' },

  // Servicing Stack
  { kb: 'KB5035942', title: 'Servicing Stack Update (SSU)', description: 'Required before cumulative updates can install', date: '2024-03', size: '22 MB', category: 'servicing' },
  { kb: 'KB5041584', title: 'Servicing Stack Update (SSU) Aug 2024', description: 'Updated servicing stack for reliability', date: '2024-08', size: '24 MB', category: 'servicing' },

  // .NET
  { kb: 'KB5036608', title: '.NET Framework 3.5 & 4.8.1 Cumulative', description: 'Security and quality update for .NET', date: '2024-03', size: '65 MB', category: 'dotnet' },
  { kb: 'KB5039893', title: '.NET Framework 4.8.1 Security Update', description: 'Critical .NET security patches', date: '2024-06', size: '48 MB', category: 'dotnet' },
  { kb: 'KB5042098', title: '.NET 8.0.8 Runtime Update', description: '.NET 8 runtime security update', date: '2024-08', size: '84 MB', category: 'dotnet' },

  // Security
  { kb: 'KB5025885', title: 'Secure Boot DBX Update', description: 'Revokes vulnerable UEFI boot managers (BlackLotus fix)', date: '2024-01', size: '3 MB', category: 'security' },
  { kb: 'KB5012170', title: 'Secure Boot Security Update', description: 'Update for Secure Boot Forbidden Signature DB', date: '2024-02', size: '4 MB', category: 'security' },
  { kb: 'KB5011048', title: 'Microsoft Defender Update', description: 'Latest Defender antimalware platform update', date: '2024-03', size: '12 MB', category: 'security' },

  // Feature
  { kb: 'KB5027397', title: 'Windows 11 24H2 Enablement Package', description: 'Feature update enablement from 23H2 to 24H2', date: '2024-10', size: '120 MB', category: 'feature' },
];

const categoryColors: Record<string, string> = {
  cumulative: 'bg-primary/20 text-primary',
  security: 'bg-destructive/20 text-destructive',
  servicing: 'bg-warning/20 text-warning',
  dotnet: 'bg-success/20 text-success',
  driver: 'bg-muted text-muted-foreground',
  feature: 'bg-primary/30 text-primary',
  custom: 'bg-muted text-foreground',
};

const categoryLabels: Record<string, string> = {
  cumulative: 'CU',
  security: 'SEC',
  servicing: 'SSU',
  dotnet: '.NET',
  driver: 'DRV',
  feature: 'FEAT',
  custom: 'MSU',
};

const WindowsUpdate = ({ isMounted, onCountChange, exportRef, importRef }: WindowsUpdateProps) => {
  const [updates, setUpdates] = useState<KBUpdate[]>(
    catalogUpdates.map((u, i) => ({
      ...u,
      id: `wu-${i}`,
      enabled: false,
      source: 'catalog' as const,
      url: `https://catalog.update.microsoft.com/Search.aspx?q=${u.kb}`,
    }))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [manualKb, setManualKb] = useState('');
  const [manualPath, setManualPath] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const enabledCount = updates.filter(u => u.enabled).length;

  useEffect(() => {
    onCountChange?.(enabledCount);
  }, [enabledCount, onCountChange]);

  useEffect(() => {
    if (exportRef) exportRef.current = () => updates.filter(u => u.enabled).map(u => ({
      kb: u.kb, title: u.title, category: u.category, source: u.source, filePath: u.filePath,
    }));
  }, [updates, exportRef]);

  useEffect(() => {
    if (importRef) importRef.current = (data) => {
      setUpdates(prev => {
        const updated = prev.map(u => ({ ...u, enabled: data.some(d => d.kb === u.kb) }));
        const newKbs = data.filter(d => !prev.some(u => u.kb === d.kb));
        const newEntries: KBUpdate[] = newKbs.map((d, i) => ({
          id: `wu-import-${Date.now()}-${i}`,
          kb: d.kb, title: d.title, description: 'Imported from project',
          date: '', size: 'Unknown', category: d.category as any,
          enabled: true, source: d.source as any, filePath: d.filePath,
        }));
        return [...updated, ...newEntries];
      });
    };
  }, [importRef]);

  const toggleUpdate = (id: string) => {
    setUpdates(prev => prev.map(u => u.id === id ? { ...u, enabled: !u.enabled } : u));
  };

  const addManualUpdate = () => {
    if (!manualKb.trim() && !manualPath.trim()) return;
    const kb = manualKb.trim() || 'Custom';
    const entry: KBUpdate = {
      id: `wu-manual-${Date.now()}`,
      kb: kb.startsWith('KB') ? kb : `KB${kb}`,
      title: manualPath ? manualPath.split('\\').pop() || 'Custom Update' : `${kb} (Manual)`,
      description: manualPath || 'Manually added update package',
      date: new Date().toISOString().slice(0, 7),
      size: 'Unknown',
      category: 'custom',
      enabled: true,
      source: 'manual',
      filePath: manualPath || undefined,
    };
    setUpdates(prev => [entry, ...prev]);
    setManualKb('');
    setManualPath('');
  };

  const removeUpdate = (id: string) => {
    setUpdates(prev => prev.filter(u => u.id !== id));
  };

  const filtered = updates.filter(u => {
    const matchesSearch = !searchQuery ||
      u.kb.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || u.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = ['all', ...Array.from(new Set(updates.map(u => u.category)))];
  const uniqueCategories = ['all', ...Array.from(new Set(updates.map(u => u.category)))];

  if (!isMounted) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Download className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Mount an ISO to slipstream updates</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono font-medium text-foreground">Windows Update</span>
          {enabledCount > 0 && (
            <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
              {enabledCount} selected
            </Badge>
          )}
        </div>
      </div>

      {/* Add Manual Update */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex gap-2">
          <Input
            value={manualKb}
            onChange={(e) => setManualKb(e.target.value)}
            placeholder="KB number (e.g. KB5035853)"
            className="font-mono text-sm h-8 bg-muted/30 w-36"
          />
          <Input
            value={manualPath}
            onChange={(e) => setManualPath(e.target.value)}
            placeholder="Path to .msu file (optional)"
            className="font-mono text-sm h-8 bg-muted/30 flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addManualUpdate()}
          />
          <Button variant="outline" size="sm" className="h-8 font-mono shrink-0" onClick={addManualUpdate}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="px-3 pt-3 pb-1 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search KB number or title..."
            className="pl-9 pr-8 h-8 font-mono text-sm bg-muted/30"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {uniqueCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`
                px-2 py-0.5 rounded text-[10px] font-mono transition-colors
                ${filterCategory === cat
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted/30 text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {cat === 'all' ? 'ALL' : (categoryLabels[cat] || cat).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Update List */}
      <div className="max-h-[400px] overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="py-6 text-center">
            <Search className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No updates found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((update) => (
              <div
                key={update.id}
                className={`
                  flex items-start gap-2.5 p-2.5 rounded-lg transition-all group
                  ${update.enabled ? 'bg-primary/5 border border-primary/20' : 'bg-muted/10 hover:bg-muted/30'}
                `}
              >
                <Switch
                  checked={update.enabled}
                  onCheckedChange={() => toggleUpdate(update.id)}
                  className="mt-0.5 scale-75 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-primary">{update.kb}</span>
                    <Badge variant="secondary" className={`text-[9px] px-1 py-0 h-4 ${categoryColors[update.category]}`}>
                      {categoryLabels[update.category] || update.category}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground/50">{update.date}</span>
                  </div>
                  <p className="text-xs font-medium text-foreground truncate mt-0.5">{update.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{update.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-muted-foreground/50">{update.size}</span>
                    {update.url && (
                      <a
                        href={update.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                      >
                        Catalog <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
                {update.source === 'manual' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={() => removeUpdate(update.id)}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3 bg-muted/20">
        <p className="text-[11px] font-mono text-muted-foreground">
          DISM /Image:C:\Mount /Add-Package /PackagePath:&lt;update.msu&gt; — Updates are applied during the build process in order: SSU → CU → .NET → Security
        </p>
      </div>
    </div>
  );
};

export default WindowsUpdate;