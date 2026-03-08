import { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronDown, ChevronUp, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'command';
}

interface BuildLogProps {
  logs: LogEntry[];
  isBuilding: boolean;
}

const typeColors: Record<LogEntry['type'], string> = {
  info: 'text-muted-foreground',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
  command: 'text-primary',
};

const typePrefixes: Record<LogEntry['type'], string> = {
  info: 'INFO',
  success: '  OK',
  warning: 'WARN',
  error: ' ERR',
  command: ' CMD',
};

const BuildLog = ({ logs, isBuilding }: BuildLogProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <Terminal className="w-4 h-4 text-primary" />
        <span className="text-sm font-mono font-medium text-foreground">Build Log</span>
        {isBuilding && (
          <Badge variant="secondary" className="ml-1 bg-warning/20 text-warning text-xs animate-pulse">
            BUILDING
          </Badge>
        )}
        <span className="ml-auto text-xs font-mono text-muted-foreground">
          {logs.length} entries
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div
          ref={scrollRef}
          className="max-h-[300px] overflow-y-auto bg-[hsl(var(--background))] p-3 font-mono text-xs leading-relaxed"
        >
          {logs.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">
              No build output yet. Commit changes to start a build.
            </p>
          ) : (
            logs.map((entry) => (
              <div key={entry.id} className="flex gap-2 py-0.5 hover:bg-muted/20 px-1 rounded">
                <span className="text-muted-foreground/50 shrink-0">{entry.timestamp}</span>
                <span className={`shrink-0 ${typeColors[entry.type]}`}>
                  [{typePrefixes[entry.type]}]
                </span>
                <span className={typeColors[entry.type]}>{entry.message}</span>
              </div>
            ))
          )}
          {isBuilding && (
            <div className="flex items-center gap-2 py-1 px-1">
              <Circle className="w-2 h-2 text-primary animate-pulse fill-primary" />
              <span className="text-muted-foreground animate-pulse">Waiting for next operation...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BuildLog;