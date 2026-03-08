import { useMemo } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface DependencyWarning {
  id: string;
  severity: 'warning' | 'critical';
  title: string;
  description: string;
}

interface DependencyRule {
  check: (ctx: DepContext) => boolean;
  severity: 'warning' | 'critical';
  title: string;
  description: string;
}

interface DepContext {
  services: string[];
  components: string[];
}

const RULES: DependencyRule[] = [
  {
    check: (ctx) => ctx.components.includes('xbox-bar') && !ctx.components.includes('xbox-app'),
    severity: 'warning',
    title: 'Xbox Game Bar removed without Xbox App',
    description: 'Game DVR capture and FPS overlay will stop working. If you need game recording, keep Xbox Game Bar.',
  },
  {
    check: (ctx) => ctx.components.includes('store') && ctx.components.includes('winget'),
    severity: 'critical',
    title: 'Store & Winget both removed',
    description: 'You will have no package manager for UWP or modern apps. Winget CLI depends on App Installer from the Store.',
  },
  {
    check: (ctx) => ctx.components.includes('store') && !ctx.components.includes('winget'),
    severity: 'warning',
    title: 'Microsoft Store removed',
    description: 'UWP apps cannot be installed. Some apps like Calculator, Photos, Terminal depend on the Store for updates.',
  },
  {
    check: (ctx) => ctx.components.includes('edge-webview'),
    severity: 'critical',
    title: 'Edge WebView2 removed',
    description: 'Many modern apps (Teams, Outlook, Widgets, some installers) rely on WebView2 for rendering. Expect broken UIs.',
  },
  {
    check: (ctx) => ctx.components.includes('xaml-framework'),
    severity: 'critical',
    title: 'XAML Framework removed',
    description: 'All WinUI 3 / UWP apps will fail to launch, including Settings, Terminal, and Calculator.',
  },
  {
    check: (ctx) => ctx.components.includes('vclibs'),
    severity: 'critical',
    title: 'VCLibs runtime removed',
    description: 'Many UWP and Win32 apps depend on the Visual C++ UWP runtime. Broad app breakage expected.',
  },
  {
    check: (ctx) => ctx.services.includes('Audiosrv') || ctx.services.includes('AudioEndpointBuilder'),
    severity: 'critical',
    title: 'Audio services disabled',
    description: 'All system audio will be muted. No sounds, media playback, or voice calls will work.',
  },
  {
    check: (ctx) => ctx.services.includes('PlugPlay'),
    severity: 'critical',
    title: 'Plug and Play disabled',
    description: 'Hardware detection will stop working. New devices won\'t be recognized. This can make the system unbootable.',
  },
  {
    check: (ctx) => ctx.services.includes('Schedule'),
    severity: 'warning',
    title: 'Task Scheduler disabled',
    description: 'Many Windows features rely on scheduled tasks: Windows Update, Defender scans, maintenance, and .NET optimization.',
  },
  {
    check: (ctx) => ctx.services.includes('wuauserv') && ctx.services.includes('BITS'),
    severity: 'warning',
    title: 'Windows Update fully disabled',
    description: 'No security patches or feature updates will be installed. The system will become increasingly vulnerable.',
  },
  {
    check: (ctx) => ctx.components.includes('defender') && ctx.services.includes('WinDefend'),
    severity: 'critical',
    title: 'All antivirus protection removed',
    description: 'Both Defender component and service are removed. System is completely unprotected unless third-party AV is installed.',
  },
  {
    check: (ctx) => ctx.services.includes('MpsSvc'),
    severity: 'critical',
    title: 'Windows Firewall disabled',
    description: 'All inbound/outbound filtering is removed. The system is fully exposed to network attacks.',
  },
  {
    check: (ctx) => ctx.services.includes('SamSs'),
    severity: 'critical',
    title: 'Security Accounts Manager disabled',
    description: 'User login and authentication will break completely. The system may become unbootable.',
  },
  {
    check: (ctx) => ctx.components.includes('search') && ctx.services.includes('WSearch'),
    severity: 'warning',
    title: 'Windows Search fully removed',
    description: 'Start menu search, file search, and Outlook search will stop working. Only manual folder navigation will work.',
  },
  {
    check: (ctx) => ctx.services.includes('Spooler') && !ctx.services.includes('PrintNotify'),
    severity: 'warning',
    title: 'Print Spooler disabled',
    description: 'No printing capability. If this is a kiosk or server without a printer, this is fine.',
  },
  {
    check: (ctx) => ctx.services.includes('DeviceInstall'),
    severity: 'warning',
    title: 'Device Install Service disabled',
    description: 'New device drivers won\'t install automatically. You\'ll need to pre-inject all needed drivers.',
  },
];

interface DependencyWarningsProps {
  disabledServices: string[];
  removedComponents: string[];
}

const DependencyWarnings = ({ disabledServices, removedComponents }: DependencyWarningsProps) => {
  const warnings = useMemo(() => {
    const ctx: DepContext = {
      services: disabledServices,
      components: removedComponents,
    };
    return RULES
      .filter(rule => rule.check(ctx))
      .map((rule, i) => ({
        id: `dep-${i}`,
        severity: rule.severity,
        title: rule.title,
        description: rule.description,
      }));
  }, [disabledServices, removedComponents]);

  if (warnings.length === 0) return null;

  const criticalCount = warnings.filter(w => w.severity === 'critical').length;
  const warningCount = warnings.filter(w => w.severity === 'warning').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-warning" />
        <h3 className="text-sm font-medium text-foreground">Dependency Warnings</h3>
        <div className="flex gap-1.5 ml-auto">
          {criticalCount > 0 && (
            <Badge variant="destructive" className="text-[10px] font-mono">
              {criticalCount} critical
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="secondary" className="text-[10px] font-mono border-warning/30 text-warning">
              {warningCount} warning{warningCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {warnings.map((w) => (
          <Alert
            key={w.id}
            variant={w.severity === 'critical' ? 'destructive' : 'default'}
            className={`py-2.5 px-3 ${w.severity === 'warning' ? 'border-warning/30 bg-warning/5' : ''}`}
          >
            {w.severity === 'critical' ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : (
              <Info className="h-3.5 w-3.5 text-warning" />
            )}
            <AlertTitle className="text-xs font-mono font-semibold">{w.title}</AlertTitle>
            <AlertDescription className="text-[11px] text-muted-foreground mt-0.5">
              {w.description}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  );
};

export default DependencyWarnings;
