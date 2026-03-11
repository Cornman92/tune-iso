import { useState, useEffect, useMemo, useCallback, MutableRefObject, useRef } from 'react';
import { Code2, Copy, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { BuildStep } from '@/components/BuildStepReorder';
import type { WimFeatureExport } from '@/components/WimEditor';
import { escapePS } from '@/lib/sanitize';
import { wingetIds, tweakScripts, optimizationScripts } from '@/data/scriptCommands';

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
    const customizations = exportCustomizations.current();
    const drivers = exportDrivers.current();
    const updates = exportUpdates.current();
    const services = exportServices.current();
    const components = exportComponents.current();
    const registry = exportRegistry.current();
    const features = exportFeatures.current();

    const lines: string[] = [];
    const add = (s: string) => lines.push(s);
    const blank = () => lines.push('');

    add('#Requires -RunAsAdministrator');
    add('$ErrorActionPreference = "Stop"');
    add('$MountDir = "C:\\Mount"');
    add('$WimIndex = 6');
    blank();
    add('# ── Mount ──');
    add('DISM /Mount-Wim /WimFile:install.wim /Index:$WimIndex /MountDir:$MountDir');
    blank();

    const enabledSteps = buildSteps.filter(s => s.enabled);

    const sectionGenerators: Record<string, () => void> = {
      features: () => {
        if (features.length === 0) return;
        const toEnable = features.filter(f => f.enabled);
        const toDisable = features.filter(f => !f.enabled);
        if (toEnable.length > 0 || toDisable.length > 0) {
          add(`# ── Features (${toEnable.length}↑ ${toDisable.length}↓) ──`);
          toEnable.forEach(f => add(`DISM /Image:$MountDir /Enable-Feature /FeatureName:"${escapePS(f.id)}" /All`));
          toDisable.forEach(f => add(`DISM /Image:$MountDir /Disable-Feature /FeatureName:"${escapePS(f.id)}"`));
          blank();
        }
      },
      components: () => {
        if (components.length === 0) return;
        add(`# ── Remove Components (${components.length}) ──`);
        components.forEach(c => add(`DISM /Image:$MountDir /Remove-ProvisionedAppxPackage /PackageName:"*${escapePS(c)}*"`));
        blank();
      },
      services: () => {
        if (services.length === 0) return;
        add(`# ── Disable Services (${services.length}) ──`);
        services.forEach(s => add(`REG ADD "HKLM\\SYSTEM\\ControlSet001\\Services\\${escapePS(s)}" /v Start /t REG_DWORD /d 4 /f`));
        blank();
      },
      registry: () => {
        if (registry.length === 0) return;
        add(`# ── Registry (${registry.length}) ──`);
        add('REG LOAD "HKLM\\OFFLINE_SW" "$MountDir\\Windows\\System32\\config\\SOFTWARE"');
        registry.forEach(r => {
          add(`REG ADD "${escapePS(r.hive)}\\${escapePS(r.keyPath)}" /v "${escapePS(r.valueName)}" /t ${r.valueType} /d "${escapePS(r.valueData)}" /f`);
        });
        add('REG UNLOAD "HKLM\\OFFLINE_SW"');
        blank();
      },
      drivers: () => {
        if (drivers.length === 0) return;
        add(`# ── Drivers (${drivers.length}) ──`);
        drivers.forEach(d => {
          if (d.type === 'folder') {
            add(`DISM /Image:$MountDir /Add-Driver /Driver:"${escapePS(d.path)}" /Recurse`);
          } else {
            add(`DISM /Image:$MountDir /Add-Driver /Driver:"${escapePS(d.path)}"`);
          }
        });
        blank();
      },
      updates: () => {
        if (updates.length === 0) return;
        add(`# ── Updates (${updates.length}) ──`);
        updates.forEach(u => {
          const path = u.filePath || `C:\\Updates\\${escapePS(u.kb)}.msu`;
          add(`DISM /Image:$MountDir /Add-Package /PackagePath:"${escapePS(path)}"`);
        });
        blank();
      },
      customizations: () => {
        const total = customizations.programs.length + customizations.tweaks.length + customizations.optimizations.length;
        if (total === 0) return;
        add(`# ── Customizations (${total}) ──`);

        // Programs → winget install commands
        if (customizations.programs.length > 0) {
          add('# Programs (installed via winget on first boot)');
          customizations.programs.forEach(p => {
            const wid = wingetIds[p];
            if (wid) {
              add(`winget install --id ${wid} --accept-source-agreements --accept-package-agreements --silent`);
            } else {
              add(`# ${p} — no winget ID mapped, install manually`);
            }
          });
        }

        // Tweaks → actual registry commands
        if (customizations.tweaks.length > 0) {
          add('# Tweaks (offline registry modifications)');
          customizations.tweaks.forEach(t => {
            const cmds = tweakScripts[t];
            if (cmds) {
              cmds.forEach(c => add(c));
            } else {
              add(`# ${t} — no script mapped`);
            }
          });
        }

        // Optimizations → actual commands
        if (customizations.optimizations.length > 0) {
          add('# Optimizations (offline registry modifications)');
          customizations.optimizations.forEach(o => {
            const cmds = optimizationScripts[o];
            if (cmds) {
              cmds.forEach(c => add(c));
            } else {
              add(`# ${o} — no script mapped`);
            }
          });
        }
        blank();
      },
    };

    enabledSteps.forEach(step => {
      sectionGenerators[step.id]?.();
    });

    add('# ── Cleanup & Commit ──');
    add('DISM /Image:$MountDir /Cleanup-Image /StartComponentCleanup /ResetBase');
    add('DISM /Unmount-Wim /MountDir:$MountDir /Commit');

    return lines.join('\n');
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
