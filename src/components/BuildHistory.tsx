import { useState, useEffect, useCallback } from 'react';
import { History, RotateCcw, Trash2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { ProjectData } from '@/components/ProjectManager';

const STORAGE_KEY = 'isoforge-build-history';
const MAX_HISTORY = 20;

interface BuildRecord {
  id: string;
  name: string;
  timestamp: string;
  config: ProjectData;
}

interface BuildHistoryProps {
  onRestore: (config: ProjectData) => void;
  onGetCurrentConfig: () => ProjectData;
}

const BuildHistory = ({ onRestore, onGetCurrentConfig }: BuildHistoryProps) => {
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<BuildRecord[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const save = useCallback((records: BuildRecord[]) => {
    setHistory(records);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, []);

  const saveSnapshot = useCallback(() => {
    const config = onGetCurrentConfig();
    const record: BuildRecord = {
      id: crypto.randomUUID(),
      name: config.name || 'Build',
      timestamp: new Date().toISOString(),
      config,
    };
    const updated = [record, ...history].slice(0, MAX_HISTORY);
    save(updated);
    toast.success('Build snapshot saved');
  }, [history, onGetCurrentConfig, save]);

  const handleRestore = (record: BuildRecord) => {
    onRestore(record.config);
    toast.success(`Restored: ${record.name}`);
  };

  const handleDelete = (id: string) => {
    save(history.filter(h => h.id !== id));
    toast.success('Snapshot deleted');
  };

  const handleClearAll = () => {
    save([]);
    toast.success('History cleared');
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-2.5 bg-muted/30 border-b border-border hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono font-medium text-foreground">Build History</span>
          <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary border-0">
            {history.length}
          </Badge>
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="p-3 space-y-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs h-7 flex-1" onClick={saveSnapshot}>
              Save Snapshot
            </Button>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive" onClick={handleClearAll}>
                Clear All
              </Button>
            )}
          </div>

          {history.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No build history yet. Save a snapshot to get started.</p>
          )}

          <div className="max-h-[250px] overflow-auto space-y-1.5 scrollbar-thin">
            {history.map(record => (
              <div key={record.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border">
                <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-foreground truncate">{record.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(record.timestamp).toLocaleString()}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleRestore(record)} title="Restore">
                  <RotateCcw className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => handleDelete(record.id)} title="Delete">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildHistory;
