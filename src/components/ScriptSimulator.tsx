import { useState, useMemo, useCallback, useEffect, useRef, MutableRefObject } from 'react';
import { Play, Pause, SkipForward, RotateCcw, AlertTriangle, Shield, ShieldCheck, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { generateScriptLines, type ScriptLine, type ScriptInput } from '@/lib/scriptGenerator';
import type { BuildStep } from '@/components/BuildStepReorder';
import type { WimFeatureExport } from '@/components/WimEditor';

interface ScriptSimulatorProps {
  exportCustomizations: MutableRefObject<() => { programs: string[]; tweaks: string[]; optimizations: string[] }>;
  exportDrivers: MutableRefObject<() => { name: string; path: string; type: string }[]>;
  exportUpdates: MutableRefObject<() => { kb: string; title: string; category: string; source: string; filePath?: string }[]>;
  exportServices: MutableRefObject<() => string[]>;
  exportComponents: MutableRefObject<() => string[]>;
  exportRegistry: MutableRefObject<() => { hive: string; keyPath: string; valueName: string; valueType: string; valueData: string }[]>;
  exportFeatures: MutableRefObject<() => WimFeatureExport[]>;
  buildSteps: BuildStep[];
  changeTrigger: string;
}

const RISK_CONFIG = {
  safe: { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Safe' },
  moderate: { icon: Shield, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Moderate' },
  aggressive: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Aggressive' },
} as const;

const ScriptSimulator = ({
  exportCustomizations, exportDrivers, exportUpdates, exportServices,
  exportComponents, exportRegistry, exportFeatures, buildSteps, changeTrigger,
}: ScriptSimulatorProps) => {
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const lines = useMemo<ScriptLine[]>(() => {
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
    return generateScriptLines(input);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeTrigger, buildSteps]);

  const commandLines = useMemo(() => lines.filter(l => l.text.trim() && !l.text.trim().startsWith('#')), [lines]);

  const counts = useMemo(() => {
    const c = { safe: 0, moderate: 0, aggressive: 0, total: commandLines.length };
    commandLines.forEach(l => c[l.risk]++);
    return c;
  }, [commandLines]);

  // Auto-scroll
  useEffect(() => {
    if (currentLine >= 0 && scrollRef.current) {
      const el = scrollRef.current.children[currentLine] as HTMLElement;
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentLine]);

  // Play/Pause
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentLine(prev => {
          if (prev >= lines.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 400);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, lines.length]);

  const handleReset = useCallback(() => {
    setPlaying(false);
    setCurrentLine(-1);
  }, []);

  const handleStep = useCallback(() => {
    setCurrentLine(prev => Math.min(prev + 1, lines.length - 1));
  }, [lines.length]);

  const progress = lines.length > 0 ? ((currentLine + 1) / lines.length) * 100 : 0;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-2.5 bg-muted/30 border-b border-border hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono font-medium text-foreground">Script Dry-Run Simulator</span>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(RISK_CONFIG).map(([key, cfg]) => (
            <Badge key={key} variant="secondary" className={`text-[10px] ${cfg.bg} ${cfg.color} border-0`}>
              {counts[key as keyof typeof counts]} {cfg.label}
            </Badge>
          ))}
        </div>
      </button>

      {expanded && (
        <div className="p-3 space-y-3">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm" className="h-7 gap-1 text-xs"
              onClick={() => { if (currentLine < 0) setCurrentLine(0); setPlaying(!playing); }}
            >
              {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {playing ? 'Pause' : 'Play'}
            </Button>
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={handleStep} disabled={playing}>
              <SkipForward className="w-3 h-3" /> Step
            </Button>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={handleReset}>
              <RotateCcw className="w-3 h-3" /> Reset
            </Button>
            <div className="ml-auto text-[10px] font-mono text-muted-foreground">
              {currentLine + 1} / {lines.length}
            </div>
          </div>

          <Progress value={progress} className="h-1.5" />

          {/* Lines */}
          <div ref={scrollRef} className="max-h-[350px] overflow-auto space-y-0.5 scrollbar-thin">
            {lines.map((line, i) => {
              const isActive = i === currentLine;
              const isPast = i < currentLine;
              const cfg = RISK_CONFIG[line.risk];
              const RiskIcon = cfg.icon;
              const isEmpty = !line.text.trim();

              if (isEmpty) return <div key={i} className="h-2" />;

              return (
                <div
                  key={i}
                  className={`flex items-start gap-2 px-2 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                    isActive ? 'bg-primary/15 ring-1 ring-primary/30' :
                    isPast ? 'opacity-60' : 'opacity-40'
                  } ${currentLine < 0 ? 'opacity-100' : ''}`}
                  onClick={() => { setPlaying(false); setCurrentLine(i); }}
                >
                  <span className="w-6 text-right text-muted-foreground/40 select-none shrink-0">{i + 1}</span>
                  <RiskIcon className={`w-3 h-3 mt-0.5 shrink-0 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`truncate ${line.text.startsWith('#') ? 'text-muted-foreground' : 'text-foreground/90'}`}>
                      {line.text}
                    </div>
                    {isActive && (
                      <div className={`text-[10px] mt-0.5 ${cfg.color}`}>
                        {line.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptSimulator;
