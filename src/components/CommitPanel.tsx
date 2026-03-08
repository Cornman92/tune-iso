import { useState, useCallback } from 'react';
import { Save, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import BuildLog, { LogEntry } from '@/components/BuildLog';

interface CommitPanelProps {
  isMounted: boolean;
  customizationCount: number;
}

const CommitPanel = ({ isMounted, customizationCount }: CommitPanelProps) => {
  const [isCommitting, setIsCommitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputName, setOutputName] = useState('Windows_Custom.iso');
  const [currentStep, setCurrentStep] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  let logId = 0;

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), timestamp, message, type }]);
  }, []);

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const buildSteps = [
    {
      label: 'Initializing...',
      logs: [
        { msg: 'DISM /Get-ImageInfo /ImageFile:install.wim', type: 'command' as const },
        { msg: 'Image found: Windows 11 Pro (Index: 6)', type: 'info' as const },
        { msg: 'Validating source image integrity...', type: 'info' as const },
        { msg: 'Source image validated ✓', type: 'success' as const },
      ],
    },
    {
      label: 'Mounting image...',
      logs: [
        { msg: 'DISM /Mount-Wim /WimFile:install.wim /Index:6 /MountDir:C:\\Mount', type: 'command' as const },
        { msg: 'Mounting Windows image...', type: 'info' as const },
        { msg: 'Image mounted successfully at C:\\Mount', type: 'success' as const },
      ],
    },
    {
      label: 'Applying programs...',
      logs: [
        { msg: 'Processing program integrations...', type: 'info' as const },
        { msg: 'Injecting silent installers into $OEM$ folder...', type: 'info' as const },
        { msg: 'Creating SetupComplete.cmd scripts...', type: 'info' as const },
        { msg: `Configured ${customizationCount} program installer(s)`, type: 'success' as const },
      ],
    },
    {
      label: 'Removing bloatware...',
      logs: [
        { msg: 'DISM /Image:C:\\Mount /Remove-ProvisionedAppxPackage...', type: 'command' as const },
        { msg: 'Removing Microsoft.Xbox.TCUI...', type: 'info' as const },
        { msg: 'Removing Microsoft.YourPhone...', type: 'info' as const },
        { msg: 'Removing Microsoft.BingWeather...', type: 'info' as const },
        { msg: 'Provisioned packages removed', type: 'success' as const },
      ],
    },
    {
      label: 'Applying registry tweaks...',
      logs: [
        { msg: 'Loading offline registry hives...', type: 'info' as const },
        { msg: 'reg load HKLM\\OFFLINE C:\\Mount\\Windows\\System32\\config\\SOFTWARE', type: 'command' as const },
        { msg: 'Applying privacy settings...', type: 'info' as const },
        { msg: 'Applying UI customizations...', type: 'info' as const },
        { msg: 'Applying service configurations...', type: 'info' as const },
        { msg: 'Applying performance optimizations...', type: 'info' as const },
        { msg: 'Registry tweaks applied', type: 'success' as const },
        { msg: 'Unloading registry hives...', type: 'info' as const },
      ],
    },
    {
      label: 'Applying optimizations...',
      logs: [
        { msg: 'Configuring power plans...', type: 'info' as const },
        { msg: 'powercfg /duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61', type: 'command' as const },
        { msg: 'Optimizing network stack...', type: 'info' as const },
        { msg: 'Configuring SSD optimizations...', type: 'info' as const },
        { msg: 'Disabling scheduled telemetry tasks...', type: 'info' as const },
        { msg: 'System optimizations configured', type: 'success' as const },
      ],
    },
    {
      label: 'Cleaning up...',
      logs: [
        { msg: 'DISM /Image:C:\\Mount /Cleanup-Image /StartComponentCleanup /ResetBase', type: 'command' as const },
        { msg: 'Cleaning component store...', type: 'info' as const },
        { msg: 'Removing superseded components...', type: 'info' as const },
        { msg: 'Cleanup complete, saved 1.2 GB', type: 'success' as const },
      ],
    },
    {
      label: 'Unmounting & committing...',
      logs: [
        { msg: 'DISM /Unmount-Wim /MountDir:C:\\Mount /Commit', type: 'command' as const },
        { msg: 'Committing changes to image...', type: 'info' as const },
        { msg: 'This may take several minutes...', type: 'warning' as const },
        { msg: 'Changes committed successfully', type: 'success' as const },
      ],
    },
    {
      label: 'Generating ISO...',
      logs: [
        { msg: 'oscdimg -m -o -u2 -udfver102 -bootdata:2#p0,e,b...', type: 'command' as const },
        { msg: 'Creating bootable ISO image...', type: 'info' as const },
        { msg: 'Writing boot sectors...', type: 'info' as const },
        { msg: 'Finalizing ISO structure...', type: 'info' as const },
      ],
    },
  ];

  const handleCommit = async () => {
    setIsCommitting(true);
    setProgress(0);
    setIsComplete(false);
    setLogs([]);

    addLog('═══════════════════════════════════════════', 'info');
    addLog('ISO Forge Build Process Started', 'info');
    addLog('═══════════════════════════════════════════', 'info');

    for (let i = 0; i < buildSteps.length; i++) {
      const step = buildSteps[i];
      setCurrentStep(step.label);

      for (const log of step.logs) {
        addLog(log.msg, log.type);
        await wait(150 + Math.random() * 300);
      }

      const stepProgress = ((i + 1) / buildSteps.length) * 100;
      for (let p = (i / buildSteps.length) * 100; p <= stepProgress; p += 5) {
        setProgress(p);
        await wait(30);
      }
    }

    addLog('═══════════════════════════════════════════', 'info');
    addLog(`Build complete: ${outputName}`, 'success');
    addLog(`Output: C:\\ISO_Output\\${outputName}`, 'success');
    addLog(`Total customizations applied: ${customizationCount}`, 'info');
    addLog('═══════════════════════════════════════════', 'info');

    setProgress(100);
    setIsCommitting(false);
    setIsComplete(true);
  };

  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-6 opacity-50">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Save className="w-5 h-5" />
            <span>Mount an ISO and make customizations to commit changes</span>
          </div>
        </div>
        <BuildLog logs={[]} isBuilding={false} />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="space-y-4">
        <div className="bg-card border border-success/30 rounded-lg p-6 glow-success animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Build Complete!</p>
              <p className="text-sm text-muted-foreground font-mono">{outputName}</p>
            </div>
            <Button
              onClick={() => { setIsComplete(false); setLogs([]); }}
              variant="outline"
              className="font-mono"
            >
              New Build
            </Button>
          </div>
          <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-sm font-mono text-success">
              ✓ Output saved to: C:\ISO_Output\{outputName}
            </p>
          </div>
        </div>
        <BuildLog logs={logs} isBuilding={false} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-6 animate-slide-in">
        <div className="flex items-start gap-4 mb-6">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            ${isCommitting ? 'bg-warning/20' : 'bg-primary/20'}
          `}>
            {isCommitting ? (
              <Loader2 className="w-6 h-6 text-warning animate-spin" />
            ) : (
              <Save className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Commit Changes</p>
            <p className="text-sm text-muted-foreground">
              Apply {customizationCount} customization{customizationCount !== 1 ? 's' : ''} and build new ISO
            </p>
          </div>
        </div>

        {!isCommitting && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-mono text-muted-foreground mb-2 block">
                Output Filename
              </label>
              <Input
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                placeholder="Windows_Custom.iso"
                className="font-mono bg-muted/30"
              />
            </div>
          </div>
        )}

        {isCommitting && (
          <div className="space-y-3 mb-6 animate-fade-in">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-mono">{currentStep}</span>
              <span className="text-foreground font-mono">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        )}

        {customizationCount === 0 && !isCommitting && (
          <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg mb-4">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <p className="text-sm text-warning">No customizations selected</p>
          </div>
        )}

        <Button
          onClick={handleCommit}
          disabled={isCommitting || customizationCount === 0}
          className="w-full font-mono"
          size="lg"
        >
          {isCommitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Building ISO...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Commit & Build ISO
            </>
          )}
        </Button>
      </div>

      <BuildLog logs={logs} isBuilding={isCommitting} />
    </div>
  );
};

export default CommitPanel;