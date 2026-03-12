import { useState, useCallback, useRef, useEffect } from 'react';
import { Terminal, Play, Square, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { isElectron, executeDISM } from '@/lib/electronBridge';
import BuildLog, { LogEntry } from '@/components/BuildLog';

interface DismExecutionPanelProps {
  isMounted: boolean;
}

const DismExecutionPanel = ({ isMounted }: DismExecutionPanelProps) => {
  const [command, setCommand] = useState('DISM /Online /Get-CurrentEdition');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs(prev => [...prev, { id: logIdRef.current++, timestamp, message, type }]);
  }, []);

  const parseArgs = (cmd: string): string[] => {
    // Strip leading "DISM" or "DISM.exe" and split remaining args
    const stripped = cmd.replace(/^DISM(\.exe)?\s*/i, '');
    return stripped.split(/\s+/).filter(Boolean);
  };

  const handleExecute = useCallback(async () => {
    if (!isElectron()) return;
    setIsRunning(true);
    const args = parseArgs(command);
    addLog(`> DISM ${args.join(' ')}`, 'command');

    try {
      const result = await executeDISM(args);
      if (!result) {
        addLog('DISM execution not available', 'error');
        setIsRunning(false);
        return;
      }

      // Stream stdout lines
      if (result.stdout) {
        result.stdout.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed) addLog(trimmed, 'info');
        });
      }
      // Stream stderr lines
      if (result.stderr) {
        result.stderr.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed) addLog(trimmed, 'warning');
        });
      }

      if (result.code === 0) {
        addLog('Command completed successfully', 'success');
      } else {
        addLog(`Command exited with code ${result.code}`, 'error');
      }
    } catch (err: any) {
      addLog(`Error: ${err.message || 'Unknown error'}`, 'error');
    }
    setIsRunning(false);
  }, [command, addLog]);

  const presetCommands = [
    { label: 'Get Image Info', cmd: 'DISM /Online /Get-CurrentEdition' },
    { label: 'List Features', cmd: 'DISM /Image:C:\\Mount /Get-Features' },
    { label: 'List Packages', cmd: 'DISM /Image:C:\\Mount /Get-Packages' },
    { label: 'List Drivers', cmd: 'DISM /Image:C:\\Mount /Get-Drivers' },
    { label: 'Cleanup Image', cmd: 'DISM /Image:C:\\Mount /Cleanup-Image /AnalyzeComponentStore' },
  ];

  if (!isElectron()) {
    return (
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Terminal className="w-5 h-5" />
          <div>
            <p className="text-sm font-medium text-foreground">DISM Execution</p>
            <p className="text-xs mt-0.5">Available only in the desktop (Electron) build. Export scripts to run DISM manually.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
        <Terminal className="w-4 h-4 text-primary" />
        <span className="text-sm font-mono font-medium text-foreground">DISM Execution</span>
        <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary ml-1">LIVE</Badge>
        {isRunning && (
          <Badge variant="secondary" className="text-[10px] bg-warning/20 text-warning animate-pulse ml-auto">RUNNING</Badge>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 p-2.5 bg-warning/10 border border-warning/20 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
          <p className="text-xs text-warning">Commands execute with real system privileges. Use with caution.</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {presetCommands.map(p => (
            <button
              key={p.label}
              onClick={() => setCommand(p.cmd)}
              className="px-2 py-1 text-[10px] font-mono bg-muted/50 hover:bg-muted border border-border rounded transition-colors text-muted-foreground hover:text-foreground"
            >
              {p.label}
            </button>
          ))}
        </div>

        <Textarea
          value={command}
          onChange={e => setCommand(e.target.value)}
          placeholder="DISM /Image:C:\Mount /Get-Features"
          className="font-mono text-xs h-16 bg-background/50 resize-none"
        />

        <div className="flex gap-2">
          <Button
            onClick={handleExecute}
            disabled={isRunning || !command.trim()}
            size="sm"
            className="font-mono text-xs gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            Execute
          </Button>
          {logs.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLogs([])}
              className="font-mono text-xs"
            >
              Clear Log
            </Button>
          )}
        </div>
      </div>

      <BuildLog logs={logs} isBuilding={isRunning} />
    </div>
  );
};

export default DismExecutionPanel;
