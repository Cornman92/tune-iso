import { useState, useEffect, useMemo, useCallback, MutableRefObject, useRef } from 'react';
import { Code2, Copy, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { BuildStep } from '@/components/BuildStepReorder';
import type { WimFeatureExport } from '@/components/WimEditor';
import { generateScriptText, type ScriptInput } from '@/lib/scriptGenerator';

interface LiveScriptPreviewProps {
  exportCustomizations: MutableRefObject<() => { programs: string[]; tweaks: string[]; optimizations: string[] }>;
  exportDrivers: MutableRefObject<() => { name: string; path: string; type: string }[]>;
  exportUpdates: MutableRefObject<() => { kb: string; title: string; category: string; source: string; filePath?: string }[]>;
  exportServices: MutableRefObject<() => string[]>;
  exportComponents: MutableRefObject<() => string[]>;
  exportRegistry: MutableRefObject<() => { hive: string; keyPath: string; valueName: string; valueType: string; valueData: string }[]>;
  exportFeatures: MutableRefObject<() => WimFeatureExport[]>;
  buildSteps: BuildStep[];
  /** Changes to these trigger a re-render of the script */
  changeTrigger: string;
}

const LiveScriptPreview = ({
  exportCustomizations,
  exportDrivers,
  exportUpdates,
  exportServices,
  exportComponents,
  exportRegistry,
  exportFeatures,
  buildSteps,
  changeTrigger,
}: LiveScriptPreviewProps) => {
  const [expanded, setExpanded] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const codeRef = useRef<HTMLPreElement>(null);

  const script = useMemo(() => {
    const input: ScriptInput = {
      customizations: exportCustomizations.current(),
      drivers: exportDrivers.current(),
      updates: exportUpdates.current(),
      services: exportServices.current(),
      components: exportComponents.current(),
      registry: exportRegistry.current(),
      features: exportFeatures.current(),
      buildSteps,
    };
    return generateScriptText(input);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeTrigger, buildSteps]);

  useEffect(() => {
    if (autoScroll && codeRef.current) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight;
    }
  }, [script, autoScroll]);

  const lineCount = script.split('\n').length;

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(script);
    toast.success('Script copied to clipboard');
  }, [script]);

  // Simple syntax highlighting
  const highlightedLines = useMemo(() => {
    return script.split('\n').map((line, i) => {
      let className = 'text-foreground/80';
      if (line.startsWith('#') || line.startsWith('REM ')) {
        className = 'text-muted-foreground';
      } else if (line.startsWith('DISM ')) {
        className = 'text-primary';
      } else if (line.startsWith('REG ')) {
        className = 'text-warning';
      } else if (line.startsWith('$')) {
        className = 'text-accent-foreground';
      }
      return (
        <div key={i} className="flex">
          <span className="inline-block w-8 text-right mr-3 text-muted-foreground/40 select-none shrink-0">{i + 1}</span>
          <span className={className}>{line || ' '}</span>
        </div>
      );
    });
  }, [script]);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono font-medium text-foreground">Live Script Preview</span>
          <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary">
            {lineCount} lines
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? 'Auto-scroll on' : 'Auto-scroll off'}
          >
            {autoScroll ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={copyToClipboard} title="Copy script">
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Code */}
      {expanded && (
        <pre
          ref={codeRef}
          className="p-3 text-[11px] font-mono leading-relaxed overflow-auto bg-background/50 max-h-[400px] scrollbar-thin"
        >
          {highlightedLines}
        </pre>
      )}
    </div>
  );
};

export default LiveScriptPreview;
