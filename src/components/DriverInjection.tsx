import { useState, useCallback, useEffect, MutableRefObject } from 'react';
import { HardDrive, Upload, Trash2, FileText, FolderOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export interface DriverEntry {
  id: string;
  name: string;
  path: string;
  size: string;
  type: 'inf' | 'folder';
  status: 'pending' | 'valid' | 'warning';
  details?: string;
}

interface DriverInjectionProps {
  isMounted: boolean;
  exportRef?: MutableRefObject<() => { name: string; path: string; type: string }[]>;
  importRef?: MutableRefObject<(data: { name: string; path: string; type: string }[]) => void>;
}

const DriverInjection = ({ isMounted }: DriverInjectionProps) => {
  const [drivers, setDrivers] = useState<DriverEntry[]>([]);
  const [manualPath, setManualPath] = useState('');
  const [recurse, setRecurse] = useState(true);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newDrivers: DriverEntry[] = Array.from(files)
      .filter(f => f.name.endsWith('.inf') || f.name.endsWith('.sys') || f.name.endsWith('.cat'))
      .map(f => ({
        id: `drv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: f.name,
        path: f.webkitRelativePath || f.name,
        size: formatSize(f.size),
        type: 'inf' as const,
        status: f.name.endsWith('.inf') ? 'valid' as const : 'pending' as const,
        details: f.name.endsWith('.inf')
          ? 'INF driver package detected'
          : f.name.endsWith('.sys')
            ? 'Driver binary — needs matching .inf'
            : 'Catalog signature file',
      }));

    setDrivers(prev => [...prev, ...newDrivers]);
    e.target.value = '';
  };

  const handleAddManualPath = () => {
    const path = manualPath.trim();
    if (!path) return;

    const isFolder = !path.endsWith('.inf');
    const name = path.split('\\').pop() || path;

    const entry: DriverEntry = {
      id: `drv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      path,
      size: isFolder ? 'Directory' : 'Unknown',
      type: isFolder ? 'folder' : 'inf',
      status: 'valid',
      details: isFolder
        ? `DISM /Add-Driver /Driver:"${path}" ${recurse ? '/Recurse' : ''}`
        : `DISM /Add-Driver /Driver:"${path}"`,
    };

    setDrivers(prev => [...prev, entry]);
    setManualPath('');
  };

  const removeDriver = (id: string) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
  };

  const clearAll = () => setDrivers([]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const infCount = drivers.filter(d => d.name.endsWith('.inf')).length;
  const totalCount = drivers.length;

  if (!isMounted) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
          <HardDrive className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Mount an ISO to inject drivers</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono font-medium text-foreground">Driver Injection</span>
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
              {infCount} .inf / {totalCount} files
            </Badge>
          )}
        </div>
        {totalCount > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs font-mono text-destructive" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </div>

      {/* Add Methods */}
      <div className="p-4 space-y-3 border-b border-border">
        {/* File Upload */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="file"
              accept=".inf,.sys,.cat"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <Button variant="outline" className="w-full font-mono text-sm h-9 pointer-events-none">
              <Upload className="w-4 h-4 mr-2" />
              Browse Driver Files (.inf, .sys, .cat)
            </Button>
          </div>
        </div>

        {/* Manual Path */}
        <div className="flex gap-2">
          <Input
            value={manualPath}
            onChange={(e) => setManualPath(e.target.value)}
            placeholder="C:\Drivers\Chipset or C:\Drivers\mydriver.inf"
            className="font-mono text-sm h-9 bg-muted/30 flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddManualPath()}
          />
          <Button variant="outline" size="sm" className="h-9 font-mono shrink-0" onClick={handleAddManualPath}>
            <FolderOpen className="w-4 h-4 mr-1" />
            Add Path
          </Button>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={recurse}
              onChange={(e) => setRecurse(e.target.checked)}
              className="rounded border-border"
            />
            <span className="font-mono">/Recurse — Scan subfolders for .inf files</span>
          </label>
        </div>
      </div>

      {/* Driver List */}
      <div className="max-h-[300px] overflow-y-auto">
        {drivers.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No drivers added yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Add .inf driver packages or folders containing drivers
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {drivers.map((driver) => (
              <div key={driver.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors group">
                <div className={`
                  w-8 h-8 rounded-md flex items-center justify-center shrink-0
                  ${driver.status === 'valid' ? 'bg-success/20' : driver.status === 'warning' ? 'bg-warning/20' : 'bg-muted'}
                `}>
                  {driver.status === 'valid' ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : driver.status === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  ) : (
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-foreground truncate">{driver.name}</p>
                    <Badge variant="secondary" className="text-[10px] px-1 shrink-0">
                      {driver.type === 'folder' ? 'DIR' : driver.name.split('.').pop()?.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{driver.details || driver.path}</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground shrink-0">{driver.size}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={() => removeDriver(driver.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-border p-3 bg-muted/20">
        <p className="text-[11px] font-mono text-muted-foreground">
          DISM /Image:C:\Mount /Add-Driver /Driver:&lt;path&gt; {recurse ? '/Recurse' : ''} — Drivers are injected during the build process
        </p>
      </div>
    </div>
  );
};

export default DriverInjection;