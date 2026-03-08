import { useState, useMemo } from 'react';
import { Disc3, Terminal } from 'lucide-react';
import IsoUploader from '@/components/IsoUploader';
import MountStatus from '@/components/MountStatus';
import CustomizationPanel from '@/components/CustomizationPanel';
import CommitPanel from '@/components/CommitPanel';
import WorkflowStepper from '@/components/WorkflowStepper';
import DriverInjection from '@/components/DriverInjection';
import UnattendGenerator from '@/components/UnattendGenerator';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [customizationCount, setCustomizationCount] = useState(0);

  const currentStep = useMemo(() => {
    if (!selectedFile) return 1;
    if (!isMounted) return 2;
    return 3;
  }, [selectedFile, isMounted]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
              <Disc3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">ISO Forge</h1>
              <p className="text-xs font-mono text-muted-foreground">Windows Image Customization Tool</p>
            </div>
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">v1.1.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Workflow Stepper */}
        <WorkflowStepper currentStep={currentStep} />

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr,420px]">
          {/* Left Column - Main Actions */}
          <div className="space-y-6">
            {/* ISO Selection */}
            <section>
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">1</span>
                Source Image
              </h2>
              <IsoUploader 
                selectedFile={selectedFile} 
                onIsoSelect={setSelectedFile} 
              />
            </section>

            {/* Mount Status */}
            {selectedFile && (
              <section>
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">2</span>
                  Mount Status
                </h2>
                <MountStatus
                  isoFile={selectedFile}
                  isMounted={isMounted}
                  onMount={() => setIsMounted(true)}
                  onUnmount={() => setIsMounted(false)}
                />
              </section>
            )}

            {/* Customization Panel */}
            <section>
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">3</span>
                Customizations
              </h2>
              <CustomizationPanel isMounted={isMounted} onCountChange={setCustomizationCount} />
            </section>

            {/* Driver Injection */}
            <section>
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">4</span>
                Driver Injection
              </h2>
              <DriverInjection isMounted={isMounted} />
            </section>

            {/* Unattended Answer File */}
            <section>
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">5</span>
                Unattended Setup (autounattend.xml)
              </h2>
              <UnattendGenerator isMounted={isMounted} />
            </section>
          </div>

          {/* Right Column - Commit Panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">6</span>
              Build Output
            </h2>
            <CommitPanel 
              isMounted={isMounted} 
              customizationCount={customizationCount}
            />

            {/* Info Panel */}
            <div className="mt-6 p-4 bg-muted/30 border border-border rounded-lg">
              <h3 className="text-sm font-medium text-foreground mb-2">Risk Levels</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-success">●</span>
                  <span><strong className="text-foreground">Safe</strong> — No system impact</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning">●</span>
                  <span><strong className="text-foreground">Moderate</strong> — May affect some features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">●</span>
                  <span><strong className="text-foreground">Aggressive</strong> — Trades stability for performance</span>
                </li>
              </ul>
            </div>

            {/* DISM Commands Reference */}
            <div className="mt-4 p-4 bg-muted/30 border border-border rounded-lg">
              <h3 className="text-sm font-medium text-foreground mb-2">DISM Reference</h3>
              <div className="space-y-1.5 text-[11px] font-mono text-muted-foreground">
                <p><span className="text-primary">Mount:</span> /Mount-Wim /WimFile /Index /MountDir</p>
                <p><span className="text-primary">Drivers:</span> /Add-Driver /Driver /Recurse</p>
                <p><span className="text-primary">Packages:</span> /Remove-ProvisionedAppxPackage</p>
                <p><span className="text-primary">Cleanup:</span> /Cleanup-Image /StartComponentCleanup</p>
                <p><span className="text-primary">Commit:</span> /Unmount-Wim /Commit</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container max-w-6xl mx-auto px-4">
          <p className="text-center text-xs font-mono text-muted-foreground">
            ISO Forge • Windows Image Customization Tool • Prototype v1.1.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;