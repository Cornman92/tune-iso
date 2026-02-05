import { useState } from 'react';
import { Save, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

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

  const steps = [
    'Preparing changes...',
    'Applying programs...',
    'Applying tweaks...',
    'Applying optimizations...',
    'Rebuilding image...',
    'Generating ISO...',
    'Finalizing...',
  ];

  const handleCommit = async () => {
    setIsCommitting(true);
    setProgress(0);
    setIsComplete(false);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      const stepProgress = ((i + 1) / steps.length) * 100;
      
      // Simulate step progress
      for (let p = progress; p <= stepProgress; p += 2) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setProgress(p);
      }
    }

    setProgress(100);
    setIsCommitting(false);
    setIsComplete(true);
  };

  if (!isMounted) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 opacity-50">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Save className="w-5 h-5" />
          <span>Mount an ISO and make customizations to commit changes</span>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="bg-card border border-success/30 rounded-lg p-6 glow-success animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-success" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Build Complete!</p>
            <p className="text-sm text-muted-foreground font-mono">
              {outputName} created successfully
            </p>
          </div>
          <Button 
            onClick={() => setIsComplete(false)}
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
    );
  }

  return (
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
  );
};

export default CommitPanel;
