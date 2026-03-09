import { useState, useMemo, useCallback, MutableRefObject } from 'react';
import {
  ShieldCheck, ShieldAlert, ShieldX, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, AlertTriangle, Info, Play, Loader2,
  HardDrive, Database, Cog, Package, Cpu, Network, Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { BuildStep } from '@/components/BuildStepReorder';
import type { WimFeatureExport } from '@/components/WimEditor';

type Severity = 'pass' | 'info' | 'warning' | 'critical' | 'blocker';
type Category = 'drivers' | 'registry' | 'services' | 'components' | 'features' | 'system' | 'compatibility';

interface CheckResult {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  detail: string;
  suggestion?: string;
}

interface CompatibilityCheckerProps {
  isMounted: boolean;
  buildSteps: BuildStep[];
  exportCustomizations: MutableRefObject<() => { programs: string[]; tweaks: string[]; optimizations: string[] }>;
  exportDrivers: MutableRefObject<() => { name: string; path: string; type: string }[]>;
  exportServices: MutableRefObject<() => string[]>;
  exportComponents: MutableRefObject<() => string[]>;
  exportRegistry: MutableRefObject<() => { hive: string; keyPath: string; valueName: string; valueType: string; valueData: string }[]>;
  exportFeatures: MutableRefObject<() => WimFeatureExport[]>;
  driverCount: number;
  registryCount: number;
  serviceCount: number;
  componentCount: number;
  updateCount: number;
}

const categoryIcons: Record<Category, React.ElementType> = {
  drivers: HardDrive,
  registry: Database,
  services: Cog,
  components: Package,
  features: Monitor,
  system: Cpu,
  compatibility: Network,
};

const categoryLabels: Record<Category, string> = {
  drivers: 'Drivers',
  registry: 'Registry',
  services: 'Services',
  components: 'Components',
  features: 'Features',
  system: 'System',
  compatibility: 'Compatibility',
};

const severityConfig: Record<Severity, { icon: React.ElementType; color: string; bg: string; label: string; weight: number }> = {
  pass: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10 border-success/20', label: 'Pass', weight: 0 },
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary/10 border-primary/20', label: 'Info', weight: 1 },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10 border-warning/20', label: 'Warning', weight: 2 },
  critical: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', label: 'Critical', weight: 3 },
  blocker: { icon: ShieldX, color: 'text-destructive', bg: 'bg-destructive/20 border-destructive/30', label: 'Blocker', weight: 4 },
};

// Known driver conflict patterns
const DRIVER_CONFLICTS: { pattern: RegExp; conflict: string; detail: string }[] = [
  { pattern: /nvidia/i, conflict: 'amd|radeon', detail: 'NVIDIA and AMD GPU drivers may conflict. Only inject drivers for your target hardware.' },
  { pattern: /realtek.*wifi/i, conflict: 'intel.*wifi|ax20[01]', detail: 'Multiple WiFi drivers detected. This can cause adapter conflicts.' },
  { pattern: /realtek.*audio/i, conflict: 'creative|soundblaster', detail: 'Multiple audio drivers may conflict on the audio endpoint.' },
];

// Services that other services depend on
const SERVICE_DEPS: Record<string, { deps: string[]; impact: string }> = {
  RpcSs: { deps: ['Most services'], impact: 'Nearly all Windows services depend on RPC. System will be non-functional.' },
  DcomLaunch: { deps: ['COM applications', 'Explorer'], impact: 'COM/DCOM applications will fail. Explorer shell may not start.' },
  EventLog: { deps: ['Security auditing', 'Application logging'], impact: 'No event logging. Debugging issues will be impossible.' },
  Winmgmt: { deps: ['WMI queries', 'System management', 'SCCM'], impact: 'WMI-dependent tools (Task Manager details, monitoring) will fail.' },
  CryptSvc: { deps: ['Windows Update', 'Code signing', 'TLS'], impact: 'Certificate validation fails. HTTPS and signed apps may break.' },
  Dhcp: { deps: ['DHCP networking'], impact: 'No automatic IP assignment. Only static IP configs will work.' },
  Dnscache: { deps: ['DNS resolution'], impact: 'DNS lookups will be slower without cache. Some apps may timeout.' },
  LanmanWorkstation: { deps: ['SMB client', 'Network drives'], impact: 'Cannot access network shares or mapped drives.' },
  nsi: { deps: ['Network connectivity'], impact: 'Network Stack Interface is required for all networking.' },
  BFE: { deps: ['Windows Firewall', 'IPsec', 'VPN'], impact: 'Filtering engine disabled. Firewall, IPsec, and some VPNs will fail.' },
  Themes: { deps: ['Visual styles', 'DWM'], impact: 'Windows will fall back to classic theme. Minor cosmetic impact.' },
  FontCache: { deps: ['Font rendering'], impact: 'Font rendering may be slower. Some apps may show missing glyphs.' },
};

// Registry keys that are dangerous to modify
const DANGEROUS_REGISTRY: { path: RegExp; detail: string }[] = [
  { path: /SYSTEM\\CurrentControlSet\\Control\\Session Manager/i, detail: 'Session Manager controls boot-time behavior. Incorrect values can prevent Windows from starting.' },
  { path: /SYSTEM\\CurrentControlSet\\Control\\CrashControl/i, detail: 'Crash control settings affect BSOD behavior and memory dumps.' },
  { path: /SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon/i, detail: 'Winlogon keys control the login process. Errors here can lock you out.' },
  { path: /SYSTEM\\CurrentControlSet\\Services\\.+\\Start/i, detail: 'Changing service start types via registry. Verify the service name is correct.' },
  { path: /SOFTWARE\\Policies\\Microsoft/i, detail: 'Group Policy registry keys. These override user settings and may conflict with domain policies.' },
];

// Feature dependencies
const FEATURE_DEPS: Record<string, string[]> = {
  'NetFx3': ['Legacy .NET 3.5 apps'],
  'Microsoft-Hyper-V-All': ['WSL2', 'Docker Desktop', 'Windows Sandbox'],
  'VirtualMachinePlatform': ['WSL2', 'Android Subsystem'],
  'Microsoft-Windows-Subsystem-Linux': ['WSL distributions'],
  'Containers': ['Docker', 'Windows Containers'],
  'SMB1Protocol': ['Legacy NAS devices', 'Old network printers'],
};

const CompatibilityChecker = ({
  isMounted,
  buildSteps,
  exportCustomizations,
  exportDrivers,
  exportServices,
  exportComponents,
  exportRegistry,
  exportFeatures,
  driverCount,
  registryCount,
  serviceCount,
  componentCount,
  updateCount,
}: CompatibilityCheckerProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');

  const runCheck = useCallback(async () => {
    setIsScanning(true);
    setExpanded(true);
    setScanProgress(0);
    const checks: CheckResult[] = [];
    let checkId = 0;

    const drivers = exportDrivers.current();
    const services = exportServices.current();
    const components = exportComponents.current();
    const registry = exportRegistry.current();
    const features = exportFeatures.current();
    const customizations = exportCustomizations.current();
    const enabledSteps = buildSteps.filter(s => s.enabled);

    // Phase 1: System readiness
    await tick(10, setScanProgress);

    if (!isMounted) {
      checks.push({ id: `c${checkId++}`, category: 'system', severity: 'blocker', title: 'Image not mounted', detail: 'You must mount the WIM image before building.', suggestion: 'Mount the image in step 2.' });
    } else {
      checks.push({ id: `c${checkId++}`, category: 'system', severity: 'pass', title: 'Image mounted', detail: 'WIM image is mounted and ready for modification.' });
    }

    if (enabledSteps.length === 0) {
      checks.push({ id: `c${checkId++}`, category: 'system', severity: 'warning', title: 'No build steps enabled', detail: 'All build steps are disabled. The output script will only mount and unmount.' });
    }

    const totalChanges = customizations.programs.length + customizations.tweaks.length + customizations.optimizations.length + drivers.length + services.length + components.length + registry.length;
    if (totalChanges === 0) {
      checks.push({ id: `c${checkId++}`, category: 'system', severity: 'info', title: 'No customizations configured', detail: 'The build will produce a vanilla image with no modifications.' });
    }

    // Phase 2: Driver analysis
    await tick(25, setScanProgress);

    if (drivers.length > 0) {
      // Check for conflicts
      const driverNames = drivers.map(d => d.name.toLowerCase());
      for (const rule of DRIVER_CONFLICTS) {
        const matching = driverNames.filter(n => rule.pattern.test(n));
        if (matching.length > 0) {
          const conflicting = driverNames.filter(n => new RegExp(rule.conflict, 'i').test(n));
          if (conflicting.length > 0) {
            checks.push({ id: `c${checkId++}`, category: 'drivers', severity: 'warning', title: 'Potential driver conflict', detail: rule.detail, suggestion: 'Remove conflicting drivers for non-target hardware.' });
          }
        }
      }

      // Check for duplicate driver types
      const folderDrivers = drivers.filter(d => d.type === 'folder');
      if (folderDrivers.length > 3) {
        checks.push({ id: `c${checkId++}`, category: 'drivers', severity: 'info', title: `${folderDrivers.length} recursive driver folders`, detail: 'Large recursive driver imports can significantly increase image size and boot time.', suggestion: 'Use targeted .inf files instead of whole driver folders when possible.' });
      }

      checks.push({ id: `c${checkId++}`, category: 'drivers', severity: 'pass', title: `${drivers.length} driver(s) queued`, detail: 'Driver packages will be injected during the build.' });
    }

    // Phase 3: Service dependency analysis
    await tick(45, setScanProgress);

    for (const svc of services) {
      if (SERVICE_DEPS[svc]) {
        const dep = SERVICE_DEPS[svc];
        const severity: Severity = ['RpcSs', 'DcomLaunch', 'nsi'].includes(svc) ? 'blocker' : ['EventLog', 'CryptSvc', 'BFE'].includes(svc) ? 'critical' : 'warning';
        checks.push({
          id: `c${checkId++}`,
          category: 'services',
          severity,
          title: `${svc} has dependents`,
          detail: `${dep.impact} Affected: ${dep.deps.join(', ')}.`,
          suggestion: severity === 'blocker' ? 'Strongly recommend keeping this service enabled.' : undefined,
        });
      }
    }

    // Check for service pairs
    if (services.includes('wuauserv') && !services.includes('BITS')) {
      checks.push({ id: `c${checkId++}`, category: 'services', severity: 'info', title: 'Windows Update disabled but BITS active', detail: 'BITS is still running but has no WU client. Consider disabling BITS too if updates are unwanted.' });
    }

    if (services.length > 0 && services.length <= 5) {
      checks.push({ id: `c${checkId++}`, category: 'services', severity: 'pass', title: `${services.length} service(s) to disable`, detail: 'Conservative service disabling. Low risk of breakage.' });
    } else if (services.length > 15) {
      checks.push({ id: `c${checkId++}`, category: 'services', severity: 'warning', title: `${services.length} services disabled — aggressive`, detail: 'Disabling many services increases risk of functionality loss. Test thoroughly in a VM first.' });
    }

    // Phase 4: Component analysis
    await tick(60, setScanProgress);

    if (components.includes('edge-webview') || components.includes('xaml-framework') || components.includes('vclibs')) {
      const broken = [
        components.includes('edge-webview') && 'WebView2',
        components.includes('xaml-framework') && 'WinUI/XAML',
        components.includes('vclibs') && 'VCLibs',
      ].filter(Boolean);
      checks.push({ id: `c${checkId++}`, category: 'components', severity: 'critical', title: 'Critical frameworks removed', detail: `Removed: ${broken.join(', ')}. Many modern apps will fail to launch.`, suggestion: 'Only remove these if you have tested thoroughly.' });
    }

    if (components.includes('store') && components.some(c => c !== 'store')) {
      checks.push({ id: `c${checkId++}`, category: 'components', severity: 'warning', title: 'Store removed with other components', detail: 'Without the Store, you cannot reinstall removed components later via GUI.' });
    }

    if (components.length > 0 && components.length <= 3) {
      checks.push({ id: `c${checkId++}`, category: 'components', severity: 'pass', title: `${components.length} component(s) to remove`, detail: 'Minimal component removal. Low risk.' });
    }

    // Phase 5: Registry analysis
    await tick(75, setScanProgress);

    for (const entry of registry) {
      const fullPath = `${entry.hive}\\${entry.keyPath}`;
      for (const rule of DANGEROUS_REGISTRY) {
        if (rule.path.test(fullPath)) {
          checks.push({ id: `c${checkId++}`, category: 'registry', severity: 'warning', title: `Sensitive registry path modified`, detail: `${fullPath}\\${entry.valueName}: ${rule.detail}`, suggestion: 'Double-check the value and test in a VM.' });
          break;
        }
      }
    }

    if (registry.length > 20) {
      checks.push({ id: `c${checkId++}`, category: 'registry', severity: 'info', title: `${registry.length} registry entries`, detail: 'Large number of registry modifications. Consider grouping related changes and documenting their purpose.' });
    }

    // Phase 6: Feature dependencies
    await tick(88, setScanProgress);

    const disabledFeatures = features.filter(f => !f.enabled);
    for (const feat of disabledFeatures) {
      if (FEATURE_DEPS[feat.id]) {
        checks.push({
          id: `c${checkId++}`,
          category: 'features',
          severity: 'warning',
          title: `${feat.name} disabled`,
          detail: `Disabling this breaks: ${FEATURE_DEPS[feat.id].join(', ')}.`,
          suggestion: 'Re-enable if you need any of the dependent features.',
        });
      }
    }

    // Phase 7: Cross-cutting compatibility
    await tick(95, setScanProgress);

    if (services.includes('WinDefend') && components.includes('defender')) {
      checks.push({ id: `c${checkId++}`, category: 'compatibility', severity: 'critical', title: 'All antivirus removed', detail: 'Both Defender service and component are removed. Install third-party AV immediately after deployment.' });
    }

    if (services.includes('DeviceInstall') && drivers.length > 0) {
      checks.push({ id: `c${checkId++}`, category: 'compatibility', severity: 'warning', title: 'Device Install disabled + drivers injected', detail: 'Pre-injected drivers will work, but any new hardware won\'t auto-install drivers after deployment.' });
    }

    if (updateCount === 0 && !services.includes('wuauserv')) {
      checks.push({ id: `c${checkId++}`, category: 'compatibility', severity: 'info', title: 'No updates slipstreamed', detail: 'The image will ship without cumulative updates. Windows Update is enabled so it will download updates on first boot.' });
    }

    if (updateCount > 0 && services.includes('wuauserv')) {
      checks.push({ id: `c${checkId++}`, category: 'compatibility', severity: 'info', title: 'Updates slipstreamed + WU disabled', detail: 'Good: updates are baked in and WU is disabled. The image will stay at the slipstreamed patch level.' });
    }

    await tick(100, setScanProgress);

    // Sort: blockers first, then critical, etc.
    checks.sort((a, b) => severityConfig[b.severity].weight - severityConfig[a.severity].weight);

    setResults(checks);
    setIsScanning(false);
  }, [isMounted, buildSteps, exportCustomizations, exportDrivers, exportServices, exportComponents, exportRegistry, exportFeatures, updateCount]);

  const filteredResults = useMemo(() => {
    if (!results) return [];
    if (filterSeverity === 'all') return results;
    return results.filter(r => r.severity === filterSeverity);
  }, [results, filterSeverity]);

  const severityCounts = useMemo(() => {
    if (!results) return {} as Record<Severity, number>;
    const counts: Record<string, number> = {};
    results.forEach(r => { counts[r.severity] = (counts[r.severity] || 0) + 1; });
    return counts as Record<Severity, number>;
  }, [results]);

  const overallStatus: 'ready' | 'warnings' | 'blocked' = useMemo(() => {
    if (!results) return 'ready';
    if (results.some(r => r.severity === 'blocker')) return 'blocked';
    if (results.some(r => r.severity === 'critical' || r.severity === 'warning')) return 'warnings';
    return 'ready';
  }, [results]);

  const StatusIcon = overallStatus === 'blocked' ? ShieldX : overallStatus === 'warnings' ? ShieldAlert : ShieldCheck;
  const statusColor = overallStatus === 'blocked' ? 'text-destructive' : overallStatus === 'warnings' ? 'text-warning' : 'text-success';

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <StatusIcon className={`w-4 h-4 ${results ? statusColor : 'text-muted-foreground'}`} />
        <span className="text-sm font-mono font-medium text-foreground">Pre-Build Compatibility</span>
        {results && (
          <div className="flex gap-1.5 ml-1">
            {(severityCounts.blocker || 0) > 0 && (
              <Badge variant="destructive" className="text-[10px] font-mono px-1.5">{severityCounts.blocker} blocker</Badge>
            )}
            {(severityCounts.critical || 0) > 0 && (
              <Badge variant="destructive" className="text-[10px] font-mono px-1.5 bg-destructive/80">{severityCounts.critical} critical</Badge>
            )}
            {(severityCounts.warning || 0) > 0 && (
              <Badge variant="secondary" className="text-[10px] font-mono px-1.5 border-warning/30 text-warning">{severityCounts.warning}</Badge>
            )}
            {(severityCounts.pass || 0) > 0 && (
              <Badge variant="secondary" className="text-[10px] font-mono px-1.5 border-success/30 text-success">{severityCounts.pass} ✓</Badge>
            )}
          </div>
        )}
        <span className="ml-auto">
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </span>
      </button>

      {expanded && (
        <div className="p-4 space-y-3">
          {/* Run button */}
          {!isScanning && (
            <Button onClick={runCheck} className="w-full" size="sm" variant={results ? 'outline' : 'default'}>
              {results ? (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Re-run Compatibility Check
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Compatibility Check
                </>
              )}
            </Button>
          )}

          {/* Scanning progress */}
          {isScanning && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="font-mono text-xs">Scanning configuration…</span>
                <span className="ml-auto font-mono text-xs">{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="h-1.5" />
            </div>
          )}

          {/* Results */}
          {results && !isScanning && (
            <>
              {/* Overall verdict */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                overallStatus === 'blocked' ? 'bg-destructive/10 border-destructive/20' :
                overallStatus === 'warnings' ? 'bg-warning/10 border-warning/20' :
                'bg-success/10 border-success/20'
              }`}>
                <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                <div>
                  <p className={`text-sm font-medium ${statusColor}`}>
                    {overallStatus === 'blocked' ? 'Build Blocked' :
                     overallStatus === 'warnings' ? 'Build Ready (with warnings)' :
                     'Build Ready'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {results.length} checks completed • {severityCounts.pass || 0} passed
                  </p>
                </div>
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setFilterSeverity('all')}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                    filterSeverity === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  All ({results.length})
                </button>
                {(['blocker', 'critical', 'warning', 'info', 'pass'] as Severity[]).map(sev => {
                  const count = severityCounts[sev] || 0;
                  if (count === 0) return null;
                  const cfg = severityConfig[sev];
                  return (
                    <button
                      key={sev}
                      onClick={() => setFilterSeverity(sev)}
                      className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                        filterSeverity === sev ? `${cfg.bg} ${cfg.color}` : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {cfg.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Check results */}
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                {filteredResults.map(result => {
                  const cfg = severityConfig[result.severity];
                  const SevIcon = cfg.icon;
                  const CatIcon = categoryIcons[result.category];

                  return (
                    <div
                      key={result.id}
                      className={`p-2.5 rounded-lg border ${cfg.bg} transition-all`}
                    >
                      <div className="flex items-start gap-2">
                        <SevIcon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${cfg.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-foreground">{result.title}</span>
                            <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 gap-0.5">
                              <CatIcon className="w-2.5 h-2.5" />
                              {categoryLabels[result.category]}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{result.detail}</p>
                          {result.suggestion && (
                            <p className="text-[11px] text-primary mt-1 flex items-center gap-1">
                              <Info className="w-3 h-3 shrink-0" />
                              {result.suggestion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

async function tick(target: number, setter: (v: number) => void) {
  setter(target);
  await new Promise(r => setTimeout(r, 120 + Math.random() * 80));
}

export default CompatibilityChecker;
