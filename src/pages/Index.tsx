import { useState, useMemo } from 'react';
import { Disc3, Terminal } from 'lucide-react';
import IsoUploader from '@/components/IsoUploader';
import MountStatus from '@/components/MountStatus';
import CustomizationPanel from '@/components/CustomizationPanel';
import CommitPanel from '@/components/CommitPanel';
import WorkflowStepper from '@/components/WorkflowStepper';

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
        <div className="container max-w-5xl mx-auto px-4 py-4">
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
              <span className="text-xs font-mono text-muted-foreground">v1.0.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-8">
        {/* Workflow Stepper */}
        <WorkflowStepper currentStep={currentStep} />

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
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
          </div>

          {/* Right Column - Commit Panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">4</span>
              Build Output
            </h2>
            <CommitPanel 
              isMounted={isMounted} 
              customizationCount={customizationCount}
            />

            {/* Info Panel */}
            <div className="mt-6 p-4 bg-muted/30 border border-border rounded-lg">
              <h3 className="text-sm font-medium text-foreground mb-2">Quick Tips</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Select a Windows ISO file to begin
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Mount the ISO to enable customizations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Toggle programs, tweaks, and optimizations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Commit changes to generate new ISO
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container max-w-5xl mx-auto px-4">
          <p className="text-center text-xs font-mono text-muted-foreground">
            ISO Forge • Windows Image Customization Tool • Prototype v1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
