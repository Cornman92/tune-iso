import { useState, useCallback, MutableRefObject } from 'react';
import { Layers, Play, Pause, RotateCcw, CheckCircle2, XCircle, Loader2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import type { BuildStep } from '@/components/BuildStepReorder';
import type { WimFeatureExport } from '@/components/WimEditor';

interface Edition {
  index: number;
  name: string;
  description: string;
  size: string;
}

type JobStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

interface BatchJob {
  edition: Edition;
  status: JobStatus;
  progress: number;
  currentStep: string;
  error?: string;
}

const MOCK_EDITIONS: Edition[] = [
  { index: 1, name: 'Windows 11 Home', description: 'Consumer edition', size: '4.2 GB' },
  { index: 2, name: 'Windows 11 Home N', description: 'Consumer (no media)', size: '4.0 GB' },
  { index: 3, name: 'Windows 11 Home SL', description: 'Single Language', size: '4.1 GB' },
  { index: 4, name: 'Windows 11 Education', description: 'Education edition', size: '4.3 GB' },
  { index: 5, name: 'Windows 11 Pro', description: 'Professional edition', size: '4.3 GB' },
  { index: 6, name: 'Windows 11 Pro N', description: 'Professional (no media)', size: '4.1 GB' },
  { index: 7, name: 'Windows 11 Pro Education', description: 'Pro Education', size: '4.3 GB' },
  { index: 8, name: 'Windows 11 Pro for Workstations', description: 'Workstation edition', size: '4.3 GB' },
  { index: 9, name: 'Windows 11 Enterprise', description: 'Enterprise edition', size: '4.4 GB' },
];

const BUILD_PHASES = [
  'Mounting image',
  'Applying features',
  'Removing components',
  'Disabling services',
  'Applying registry',
  'Injecting drivers',
  'Slipstreaming updates',
  'Applying customizations',
  'Cleanup & commit',
];

const statusIcon: Record<JobStatus, React.ReactNode> = {
  pending: <Circle className="w-4 h-4 text-muted-foreground" />,
  running: <Loader2 className="w-4 h-4 text-primary animate-spin" />,
  done: <CheckCircle2 className="w-4 h-4 text-success" />,
  failed: <XCircle className="w-4 h-4 text-destructive" />,
  skipped: <Circle className="w-4 h-4 text-muted-foreground/40" />,
};

const statusColor: Record<JobStatus, string> = {
  pending: 'text-muted-foreground',
  running: 'text-primary',
  done: 'text-success',
  failed: 'text-destructive',
  skipped: 'text-muted-foreground/40',
};

interface BatchImageProcessorProps {
  isMounted: boolean;
  buildSteps: BuildStep[];
  exportCustomizations: MutableRefObject<() => { programs: string[]; tweaks: string[]; optimizations: string[] }>;
  exportDrivers: MutableRefObject<() => { name: string; path: string; type: string }[]>;
  exportServices: MutableRefObject<() => string[]>;
  exportComponents: MutableRefObject<() => string[]>;
  exportRegistry: MutableRefObject<() => { hive: string; keyPath: string; valueName: string; valueType: string; valueData: string }[]>;
  exportFeatures: MutableRefObject<() => WimFeatureExport[]>;
}

const BatchImageProcessor = ({
  isMounted,
  buildSteps,
  exportCustomizations,
  exportDrivers,
  exportServices,
  exportComponents,
  exportRegistry,
  exportFeatures,
}: BatchImageProcessorProps) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const toggleEdition = (index: number) => {
    setSelected(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const selectAll = () => {
    if (selected.length === MOCK_EDITIONS.length) {
      setSelected([]);
    } else {
      setSelected(MOCK_EDITIONS.map(e => e.index));
    }
  };

  const customizations = exportCustomizations.current();
  const drivers = exportDrivers.current();
  const services = exportServices.current();
  const components = exportComponents.current();
  const registry = exportRegistry.current();
  const features = exportFeatures.current();
  const enabledSteps = buildSteps.filter(s => s.enabled);

  const totalChanges =
    customizations.programs.length +
    customizations.tweaks.length +
    customizations.optimizations.length +
    drivers.length +
    services.length +
    components.length +
    registry.length +
    features.filter(f => f.enabled !== f.defaultEnabled).length;

  const simulateBatch = useCallback(async () => {
    if (selected.length === 0) {
      toast.error('Select at least one edition');
      return;
    }

    const initialJobs: BatchJob[] = selected.map(idx => ({
      edition: MOCK_EDITIONS.find(e => e.index === idx)!,
      status: 'pending' as JobStatus,
      progress: 0,
      currentStep: '',
    }));

    setJobs(initialJobs);
    setIsProcessing(true);
    setIsPaused(false);

    for (let j = 0; j < initialJobs.length; j++) {
      // Check pause — simple polling
      while (isPaused) {
        await new Promise(r => setTimeout(r, 200));
      }

      setJobs(prev => prev.map((job, i) =>
        i === j ? { ...job, status: 'running', progress: 0, currentStep: BUILD_PHASES[0] } : job
      ));

      const fail = Math.random() < 0.1; // 10% random failure
      const failAt = Math.floor(Math.random() * BUILD_PHASES.length);

      for (let p = 0; p < BUILD_PHASES.length; p++) {
        await new Promise(r => setTimeout(r, 400 + Math.random() * 300));

        if (fail && p === failAt) {
          setJobs(prev => prev.map((job, i) =>
            i === j ? { ...job, status: 'failed', currentStep: BUILD_PHASES[p], error: `DISM error 0x800f081f at ${BUILD_PHASES[p]}` } : job
          ));
          break;
        }

        const progress = Math.round(((p + 1) / BUILD_PHASES.length) * 100);
        setJobs(prev => prev.map((job, i) =>
          i === j ? { ...job, progress, currentStep: BUILD_PHASES[p] } : job
        ));
      }

      // Mark done if not failed
      setJobs(prev => prev.map((job, i) =>
        i === j && job.status !== 'failed' ? { ...job, status: 'done', progress: 100, currentStep: 'Complete' } : job
      ));
    }

    setIsProcessing(false);
    const results = initialJobs.length; // we'll read from state
    toast.success(`Batch processing complete for ${selected.length} editions`);
  }, [selected, isPaused]);

  const reset = () => {
    setJobs([]);
    setIsProcessing(false);
    setIsPaused(false);
  };

  const overallProgress = jobs.length > 0
    ? Math.round(jobs.reduce((sum, j) => sum + j.progress, 0) / jobs.length)
    : 0;

  const doneCount = jobs.filter(j => j.status === 'done').length;
  const failedCount = jobs.filter(j => j.status === 'failed').length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!isMounted}>
              <Layers className="w-4 h-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">Batch Process Editions</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            <Layers className="w-5 h-5 text-primary" />
            Multi-Edition Batch Processing
          </DialogTitle>
        </DialogHeader>

        {/* Customization Summary */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border text-xs space-y-1">
          <p className="font-medium text-foreground">Current configuration to apply:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {customizations.programs.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{customizations.programs.length} programs</Badge>
            )}
            {customizations.tweaks.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{customizations.tweaks.length} tweaks</Badge>
            )}
            {drivers.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{drivers.length} drivers</Badge>
            )}
            {services.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{services.length} services</Badge>
            )}
            {components.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{components.length} components</Badge>
            )}
            {registry.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{registry.length} registry</Badge>
            )}
            {totalChanges === 0 && (
              <span className="text-muted-foreground">No customizations configured</span>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{enabledSteps.length} build steps enabled</p>
        </div>

        {/* Edition Selection */}
        {!isProcessing && jobs.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Select editions to process:</p>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={selectAll}>
                {selected.length === MOCK_EDITIONS.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {MOCK_EDITIONS.map(edition => (
                <label
                  key={edition.index}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selected.includes(edition.index)}
                    onCheckedChange={() => toggleEdition(edition.index)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{edition.name}</p>
                    <p className="text-[11px] text-muted-foreground">{edition.description}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{edition.size}</Badge>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">Index {edition.index}</span>
                </label>
              ))}
            </div>

            <Button
              onClick={simulateBatch}
              disabled={selected.length === 0 || totalChanges === 0}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Process {selected.length} Edition{selected.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}

        {/* Progress View */}
        {jobs.length > 0 && (
          <div className="space-y-3">
            {/* Overall */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-mono">Overall Progress</span>
                <span className="font-mono text-foreground">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <div className="flex gap-3 text-[11px] text-muted-foreground">
                <span>{doneCount} done</span>
                <span>{failedCount} failed</span>
                <span>{jobs.filter(j => j.status === 'running').length} running</span>
                <span>{jobs.filter(j => j.status === 'pending').length} pending</span>
              </div>
            </div>

            {/* Per-edition jobs */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {jobs.map((job, i) => (
                <div key={i} className="p-3 rounded-lg border border-border bg-muted/10 space-y-2">
                  <div className="flex items-center gap-2">
                    {statusIcon[job.status]}
                    <span className="text-sm font-medium text-foreground flex-1 truncate">{job.edition.name}</span>
                    <Badge
                      variant={job.status === 'failed' ? 'destructive' : 'secondary'}
                      className="text-[10px]"
                    >
                      {job.status === 'running' ? `${job.progress}%` : job.status}
                    </Badge>
                  </div>
                  {job.status === 'running' && (
                    <>
                      <Progress value={job.progress} className="h-1.5" />
                      <p className="text-[11px] font-mono text-muted-foreground">{job.currentStep}…</p>
                    </>
                  )}
                  {job.status === 'failed' && job.error && (
                    <p className="text-[11px] font-mono text-destructive">{job.error}</p>
                  )}
                  {job.status === 'done' && (
                    <p className="text-[11px] font-mono text-success">All steps completed successfully</p>
                  )}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              {isProcessing && (
                <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)}>
                  {isPaused ? <Play className="w-3.5 h-3.5 mr-1" /> : <Pause className="w-3.5 h-3.5 mr-1" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
              )}
              {!isProcessing && jobs.length > 0 && (
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BatchImageProcessor;
