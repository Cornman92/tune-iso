import { useState, useEffect, MutableRefObject, useRef } from 'react';
import { Database, Plus, Trash2, Copy, FileDown, FileUp, ChevronDown, ChevronRight, FolderTree, Diff } from 'lucide-react';
import { escapeRegValue, isValidHex } from '@/lib/sanitize';
import { parseRegFile, diffRegistryEntries, type RegistryDiff } from '@/lib/regParser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

type RegValueType = 'REG_SZ' | 'REG_DWORD' | 'REG_QWORD' | 'REG_BINARY' | 'REG_MULTI_SZ' | 'REG_EXPAND_SZ' | 'REG_NONE';

interface RegistryEntry {
  id: string;
  hive: string;
  keyPath: string;
  valueName: string;
  valueType: RegValueType;
  valueData: string;
  description: string;
}

const HIVES = ['HKLM\\SOFTWARE', 'HKLM\\SYSTEM', 'HKCU\\SOFTWARE', 'HKCU\\Control Panel', 'HKLM\\DEFAULT', 'HKU\\.DEFAULT'];

export const PRESET_ENTRIES: RegistryEntry[] = [
  { id: 'p1', hive: 'HKLM\\SOFTWARE', keyPath: 'Microsoft\\Windows\\CurrentVersion\\Policies\\System', valueName: 'EnableLUA', valueType: 'REG_DWORD', valueData: '0', description: 'Disable UAC prompts' },
  { id: 'p2', hive: 'HKLM\\SOFTWARE', keyPath: 'Policies\\Microsoft\\Windows\\WindowsUpdate\\AU', valueName: 'NoAutoUpdate', valueType: 'REG_DWORD', valueData: '1', description: 'Disable auto Windows Update' },
  { id: 'p3', hive: 'HKLM\\SOFTWARE', keyPath: 'Policies\\Microsoft\\Windows Defender', valueName: 'DisableAntiSpyware', valueType: 'REG_DWORD', valueData: '1', description: 'Disable Windows Defender' },
  { id: 'p4', hive: 'HKCU\\SOFTWARE', keyPath: 'Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize', valueName: 'AppsUseLightTheme', valueType: 'REG_DWORD', valueData: '0', description: 'Enable dark mode for apps' },
  { id: 'p5', hive: 'HKCU\\SOFTWARE', keyPath: 'Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced', valueName: 'TaskbarAl', valueType: 'REG_DWORD', valueData: '0', description: 'Left-align taskbar' },
  { id: 'p6', hive: 'HKLM\\SOFTWARE', keyPath: 'Microsoft\\Windows\\CurrentVersion\\Explorer', valueName: 'SmallIcons', valueType: 'REG_DWORD', valueData: '1', description: 'Use small taskbar icons' },
  { id: 'p7', hive: 'HKCU\\SOFTWARE', keyPath: 'Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\\InprocServer32', valueName: '(Default)', valueType: 'REG_SZ', valueData: '', description: 'Classic right-click context menu' },
  { id: 'p8', hive: 'HKLM\\SOFTWARE', keyPath: 'Policies\\Microsoft\\Windows\\DataCollection', valueName: 'AllowTelemetry', valueType: 'REG_DWORD', valueData: '0', description: 'Disable telemetry' },
  { id: 'p9', hive: 'HKLM\\SYSTEM', keyPath: 'CurrentControlSet\\Control\\Session Manager\\Memory Management', valueName: 'ClearPageFileAtShutdown', valueType: 'REG_DWORD', valueData: '0', description: 'Skip pagefile clearing on shutdown' },
  { id: 'p10', hive: 'HKCU\\SOFTWARE', keyPath: 'Microsoft\\Windows\\CurrentVersion\\Search', valueName: 'SearchboxTaskbarMode', valueType: 'REG_DWORD', valueData: '0', description: 'Hide search from taskbar' },
  { id: 'p11', hive: 'HKCU\\SOFTWARE', keyPath: 'Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced', valueName: 'ShowTaskViewButton', valueType: 'REG_DWORD', valueData: '0', description: 'Hide Task View button' },
  { id: 'p12', hive: 'HKCU\\SOFTWARE', keyPath: 'Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced', valueName: 'TaskbarDa', valueType: 'REG_DWORD', valueData: '0', description: 'Hide Widgets button' },
  { id: 'p13', hive: 'HKCU\\SOFTWARE', keyPath: 'Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced', valueName: 'TaskbarMn', valueType: 'REG_DWORD', valueData: '0', description: 'Hide Chat button' },
  { id: 'p14', hive: 'HKLM\\SOFTWARE', keyPath: 'Policies\\Microsoft\\Windows\\Explorer', valueName: 'DisableNotificationCenter', valueType: 'REG_DWORD', valueData: '1', description: 'Disable notification center' },
  { id: 'p15', hive: 'HKLM\\SOFTWARE', keyPath: 'Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile', valueName: 'SystemResponsiveness', valueType: 'REG_DWORD', valueData: '0', description: 'Optimize for foreground apps' },
  { id: 'p16', hive: 'HKLM\\SYSTEM', keyPath: 'CurrentControlSet\\Services\\Tcpip\\Parameters', valueName: 'TcpAckFrequency', valueType: 'REG_DWORD', valueData: '1', description: 'Reduce TCP ACK delay (gaming)' },
  { id: 'p17', hive: 'HKLM\\SYSTEM', keyPath: 'CurrentControlSet\\Services\\Tcpip\\Parameters', valueName: 'TCPNoDelay', valueType: 'REG_DWORD', valueData: '1', description: 'Disable Nagle algorithm (gaming)' },
  { id: 'p18', hive: 'HKLM\\SOFTWARE', keyPath: 'Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games', valueName: 'GPU Priority', valueType: 'REG_DWORD', valueData: '8', description: 'Boost GPU priority for games' },
  { id: 'p19', hive: 'HKLM\\SOFTWARE', keyPath: 'Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games', valueName: 'Priority', valueType: 'REG_DWORD', valueData: '6', description: 'Boost CPU priority for games' },
  { id: 'p20', hive: 'HKLM\\SYSTEM', keyPath: 'CurrentControlSet\\Control\\Power\\PowerThrottling', valueName: 'PowerThrottlingOff', valueType: 'REG_DWORD', valueData: '1', description: 'Disable power throttling' },
];

interface RegistryEditorProps {
  isMounted: boolean;
  onCountChange?: (count: number) => void;
  exportRef?: MutableRefObject<() => { hive: string; keyPath: string; valueName: string; valueType: string; valueData: string }[]>;
  importRef?: MutableRefObject<(presetIds: string[]) => void>;
}

const RegistryEditor = ({ isMounted, onCountChange, exportRef, importRef }: RegistryEditorProps) => {
  const [entries, setEntries] = useState<RegistryEntry[]>([]);
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  const [diffResult, setDiffResult] = useState<RegistryDiff | null>(null);
  const [importedEntries, setImportedEntries] = useState<RegistryEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const diffFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onCountChange?.(entries.length);
  }, [entries.length, onCountChange]);

  useEffect(() => {
    if (exportRef) exportRef.current = () => entries.map(e => ({ hive: e.hive, keyPath: e.keyPath, valueName: e.valueName, valueType: e.valueType, valueData: e.valueData }));
  }, [entries, exportRef]);

  useEffect(() => {
    if (importRef) importRef.current = (presetIds: string[]) => {
      const toAdd = PRESET_ENTRIES.filter(p => presetIds.includes(p.id));
      setEntries(toAdd.map(p => ({ ...p, id: crypto.randomUUID() })));
    };
  }, [importRef]);

  const [showForm, setShowForm] = useState(false);
  const [expandedPresets, setExpandedPresets] = useState(true);
  const [form, setForm] = useState<Omit<RegistryEntry, 'id'>>({
    hive: 'HKLM\\SOFTWARE',
    keyPath: '',
    valueName: '',
    valueType: 'REG_DWORD',
    valueData: '',
    description: '',
  });

  const handleImportReg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const parsed = parseRegFile(text);
      
      if (parsed.length === 0) {
        toast.error('No valid registry entries found in file');
        return;
      }

      // Filter out duplicates
      const newEntries = parsed.filter(p => 
        !entries.some(e => e.hive === p.hive && e.keyPath === p.keyPath && e.valueName === p.valueName)
      );
      
      setEntries(prev => [...prev, ...newEntries]);
      toast.success(`Imported ${newEntries.length} registry entries (${parsed.length - newEntries.length} duplicates skipped)`);
    } catch (err) {
      toast.error('Failed to parse .reg file');
      console.error(err);
    }
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDiffReg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const parsed = parseRegFile(text);
      
      if (parsed.length === 0) {
        toast.error('No valid registry entries found in file');
        return;
      }

      const diff = diffRegistryEntries(entries, parsed);
      setDiffResult(diff);
      setImportedEntries(parsed);
      setShowDiffDialog(true);
    } catch (err) {
      toast.error('Failed to parse .reg file');
      console.error(err);
    }
    
    // Reset file input
    if (diffFileInputRef.current) diffFileInputRef.current.value = '';
  };

  const applyDiffChanges = (applyAdded: boolean, applyModified: boolean) => {
    if (!diffResult) return;
    
    let newEntries = [...entries];
    let addedCount = 0;
    let modifiedCount = 0;

    if (applyAdded) {
      newEntries = [...newEntries, ...diffResult.added];
      addedCount = diffResult.added.length;
    }

    if (applyModified) {
      diffResult.modified.forEach(mod => {
        const idx = newEntries.findIndex(e => 
          e.hive === mod.current.hive && e.keyPath === mod.current.keyPath && e.valueName === mod.current.valueName
        );
        if (idx !== -1) {
          newEntries[idx] = mod.imported;
          modifiedCount++;
        }
      });
    }

    setEntries(newEntries);
    setShowDiffDialog(false);
    setDiffResult(null);
    toast.success(`Applied ${addedCount} additions, ${modifiedCount} modifications`);
  };

  const addEntry = () => {
    if (!form.keyPath || !form.valueName) {
      toast.error('Key path and value name are required');
      return;
    }
    if ((form.valueType === 'REG_DWORD' || form.valueType === 'REG_BINARY' || form.valueType === 'REG_QWORD') && form.valueData && !isValidHex(form.valueData)) {
      toast.error(`${form.valueType} value must contain only valid hex digits`);
      return;
    }
    setEntries(prev => [...prev, { ...form, id: crypto.randomUUID() }]);
    setForm({ hive: 'HKLM\\SOFTWARE', keyPath: '', valueName: '', valueType: 'REG_DWORD', valueData: '', description: '' });
    setShowForm(false);
    toast.success('Registry entry added');
  };

  const addPreset = (preset: RegistryEntry) => {
    if (entries.some(e => e.hive === preset.hive && e.keyPath === preset.keyPath && e.valueName === preset.valueName)) {
      toast.info('Entry already exists');
      return;
    }
    setEntries(prev => [...prev, { ...preset, id: crypto.randomUUID() }]);
    toast.success(`Added: ${preset.description}`);
  };

  const addAllPresets = () => {
    const newEntries = PRESET_ENTRIES.filter(p => !entries.some(e => e.hive === p.hive && e.keyPath === p.keyPath && e.valueName === p.valueName));
    setEntries(prev => [...prev, ...newEntries.map(p => ({ ...p, id: crypto.randomUUID() }))]);
    toast.success(`Added ${newEntries.length} registry entries`);
  };

  const removeEntry = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));

  const exportReg = () => {
    const lines = ['Windows Registry Editor Version 5.00', ''];
    const grouped: Record<string, RegistryEntry[]> = {};
    entries.forEach(e => {
      const key = `${e.hive}\\${e.keyPath}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(e);
    });
    Object.entries(grouped).forEach(([key, vals]) => {
      lines.push(`[${key}]`);
      vals.forEach(v => {
        const safeName = escapeRegValue(v.valueName);
        if (v.valueType === 'REG_SZ' || v.valueType === 'REG_EXPAND_SZ') {
          lines.push(`"${safeName}"="${escapeRegValue(v.valueData)}"`);
        } else if (v.valueType === 'REG_DWORD') {
          const hex = parseInt(v.valueData).toString(16).padStart(8, '0');
          lines.push(`"${safeName}"=dword:${hex}`);
        } else if (v.valueType === 'REG_QWORD') {
          lines.push(`"${safeName}"=hex(b):${v.valueData}`);
        } else if (v.valueType === 'REG_BINARY') {
          lines.push(`"${safeName}"=hex:${v.valueData}`);
        } else if (v.valueType === 'REG_MULTI_SZ') {
          lines.push(`"${safeName}"=hex(7):${v.valueData}`);
        }
      });
      lines.push('');
    });
    const blob = new Blob([lines.join('\r\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'iso-forge-registry.reg'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported .reg file');
  };

  return (
    <div className={`rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 ${!isMounted ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-mono font-medium text-foreground">Registry Editor</h3>
          <Badge variant="outline" className="text-[10px] font-mono">{entries.length} entries</Badge>
        </div>
        <div className="flex gap-2">
          {entries.length > 0 && (
            <Button size="sm" variant="outline" className="text-xs font-mono h-7" onClick={exportReg}>
              <FileDown className="w-3 h-3 mr-1" /> Export .reg
            </Button>
          )}
          <Button size="sm" variant="outline" className="text-xs font-mono h-7" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-3 h-3 mr-1" /> Custom
          </Button>
        </div>
      </div>

      {/* Preset Library */}
      <div className="mb-4">
        <button
          className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors w-full"
          onClick={() => setExpandedPresets(!expandedPresets)}
        >
          {expandedPresets ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <FolderTree className="w-3 h-3 text-primary" />
          Common Registry Tweaks ({PRESET_ENTRIES.length})
          <Button size="sm" variant="ghost" className="text-[10px] font-mono h-5 ml-auto px-2" onClick={(e) => { e.stopPropagation(); addAllPresets(); }}>
            Add All
          </Button>
        </button>
        {expandedPresets && (
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto pr-1">
            {PRESET_ENTRIES.map(preset => {
              const alreadyAdded = entries.some(e => e.hive === preset.hive && e.keyPath === preset.keyPath && e.valueName === preset.valueName);
              return (
                <div
                  key={preset.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                    alreadyAdded ? 'border-success/30 bg-success/5 opacity-60' : 'border-border/50 bg-muted/20 hover:bg-muted/40'
                  }`}
                  onClick={() => !alreadyAdded && addPreset(preset)}
                >
                  {alreadyAdded ? <Badge className="text-[9px] bg-success/20 text-success border-success/30 h-4 shrink-0">Added</Badge> : <Plus className="w-3 h-3 text-primary shrink-0" />}
                  <span className="text-foreground font-medium truncate">{preset.description}</span>
                  <span className="text-muted-foreground font-mono text-[10px] truncate ml-auto">{preset.valueName}={preset.valueData}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Entry Form */}
      {showForm && (
        <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono text-muted-foreground">Hive</label>
              <Select value={form.hive} onValueChange={(v) => setForm(f => ({ ...f, hive: v }))}>
                <SelectTrigger className="h-8 text-xs font-mono"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HIVES.map(h => <SelectItem key={h} value={h} className="text-xs font-mono">{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-muted-foreground">Type</label>
              <Select value={form.valueType} onValueChange={(v) => setForm(f => ({ ...f, valueType: v as RegValueType }))}>
                <SelectTrigger className="h-8 text-xs font-mono"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['REG_SZ', 'REG_DWORD', 'REG_QWORD', 'REG_BINARY', 'REG_MULTI_SZ', 'REG_EXPAND_SZ', 'REG_NONE'] as RegValueType[]).map(t => (
                    <SelectItem key={t} value={t} className="text-xs font-mono">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted-foreground">Key Path</label>
            <Input className="h-8 text-xs font-mono" placeholder="Microsoft\Windows\CurrentVersion\..." value={form.keyPath} onChange={e => setForm(f => ({ ...f, keyPath: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono text-muted-foreground">Value Name</label>
              <Input className="h-8 text-xs font-mono" placeholder="ValueName" value={form.valueName} onChange={e => setForm(f => ({ ...f, valueName: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] font-mono text-muted-foreground">Value Data</label>
              <Input className="h-8 text-xs font-mono" placeholder="0" value={form.valueData} onChange={e => setForm(f => ({ ...f, valueData: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted-foreground">Description (optional)</label>
            <Input className="h-8 text-xs font-mono" placeholder="What does this do?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="text-xs font-mono h-7" onClick={addEntry}>Add Entry</Button>
            <Button size="sm" variant="ghost" className="text-xs font-mono h-7" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Active Entries */}
      {entries.length > 0 && (
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {entries.map(entry => (
            <div key={entry.id} className="flex items-center gap-2 p-2 rounded-lg border border-primary/20 bg-primary/5 text-xs group">
              <Badge variant="outline" className="text-[9px] font-mono shrink-0">{entry.valueType}</Badge>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-foreground truncate">{entry.hive}\{entry.keyPath}</p>
                <p className="text-muted-foreground font-mono text-[10px]">
                  {entry.valueName} = {entry.valueData || '(empty)'}
                  {entry.description && <span className="ml-2 text-muted-foreground/60">— {entry.description}</span>}
                </p>
              </div>
              <Button size="sm" variant="ghost" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100" onClick={() => removeEntry(entry.id)}>
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground text-center py-4 font-mono">
          No registry entries. Add from presets above or create a custom entry.
        </p>
      )}

      {/* DISM Preview */}
      {entries.length > 0 && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-[11px] font-mono text-muted-foreground mb-1">
            <span className="text-primary">REG LOAD</span> HKLM\OFFLINE C:\mount\Windows\System32\config\SOFTWARE
          </p>
          <p className="text-[11px] font-mono text-muted-foreground">
            <span className="text-primary">REG IMPORT</span> iso-forge-registry.reg
          </p>
          <p className="text-[11px] font-mono text-muted-foreground">
            <span className="text-primary">REG UNLOAD</span> HKLM\OFFLINE
          </p>
        </div>
      )}
    </div>
  );
};

export default RegistryEditor;
