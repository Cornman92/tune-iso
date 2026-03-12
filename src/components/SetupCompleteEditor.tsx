import { useState, useCallback, MutableRefObject, useEffect } from 'react';
import { FileText, Copy, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { wingetIds } from '@/data/scriptCommands';

interface SetupCompleteEditorProps {
  /** Ref to get selected program IDs */
  exportCustomizations: MutableRefObject<() => { programs: string[]; tweaks: string[]; optimizations: string[] }>;
  /** Trigger recalculation */
  changeTrigger: string;
}

const DEFAULT_HEADER = `@echo off
echo ════════════════════════════════════════════════
echo  ISO Forge - First Boot Setup
echo ════════════════════════════════════════════════
echo.
`;

const DEFAULT_FOOTER = `
echo.
echo ════════════════════════════════════════════════
echo  First boot setup complete!
echo ════════════════════════════════════════════════
del "%~f0"
`;

const SetupCompleteEditor = ({ exportCustomizations, changeTrigger }: SetupCompleteEditorProps) => {
  const [script, setScript] = useState('');
  const [isCustomized, setIsCustomized] = useState(false);

  const generateDefault = useCallback(() => {
    const { programs } = exportCustomizations.current();
    const lines: string[] = [DEFAULT_HEADER.trim()];

    if (programs.length > 0) {
      lines.push('echo Installing programs via winget...');
      lines.push('echo.');
      programs.forEach(p => {
        const wid = wingetIds[p];
        if (wid) {
          lines.push(`echo Installing: ${p}`);
          lines.push(`winget install --id ${wid} --accept-source-agreements --accept-package-agreements --silent`);
        } else {
          lines.push(`echo SKIP: ${p} (no winget ID mapped)`);
        }
      });
    } else {
      lines.push('echo No programs configured for first-boot installation.');
    }

    lines.push(DEFAULT_FOOTER.trim());
    return lines.join('\r\n');
  }, [exportCustomizations]);

  // Regenerate when customizations change (only if not manually customized)
  useEffect(() => {
    if (!isCustomized) {
      setScript(generateDefault());
    }
  }, [changeTrigger, generateDefault, isCustomized]);

  const handleReset = () => {
    setScript(generateDefault());
    setIsCustomized(false);
    toast.success('Reset to auto-generated script');
  };

  const handleEdit = (value: string) => {
    setScript(value);
    setIsCustomized(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    toast.success('SetupComplete.cmd copied');
  };

  const lineCount = script.split('\n').length;

  const appendSnippets = [
    { label: 'Power Plan', cmd: 'powercfg /duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61' },
    { label: 'Disable IPv6', cmd: 'netsh interface ipv6 set state disabled' },
    { label: 'Set Time Zone', cmd: 'tzutil /s "Eastern Standard Time"' },
    { label: 'Enable RDP', cmd: 'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f' },
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        <span className="text-sm font-mono font-medium text-foreground">SetupComplete.cmd Editor</span>
        <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary">
          {lineCount} lines
        </Badge>
        {isCustomized && (
          <Badge variant="secondary" className="text-[10px] bg-warning/20 text-warning">CUSTOMIZED</Badge>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCopy} title="Copy">
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleReset} title="Reset to auto-generated">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <p className="text-xs text-muted-foreground">
          This script runs once on first boot at <code className="text-primary">%WINDIR%\Setup\Scripts\SetupComplete.cmd</code> and self-deletes.
        </p>

        <div className="flex flex-wrap gap-1.5">
          {appendSnippets.map(s => (
            <button
              key={s.label}
              onClick={() => {
                setScript(prev => prev.replace(/\ndel "%~f0"$/, `\n${s.cmd}\ndel "%~f0"`));
                setIsCustomized(true);
                toast.success(`Added: ${s.label}`);
              }}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono bg-muted/50 hover:bg-muted border border-border rounded transition-colors text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-2.5 h-2.5" />
              {s.label}
            </button>
          ))}
        </div>

        <Textarea
          value={script}
          onChange={e => handleEdit(e.target.value)}
          className="font-mono text-[11px] leading-relaxed min-h-[200px] bg-background/50 resize-y"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default SetupCompleteEditor;
