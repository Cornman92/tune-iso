import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Disc3, Terminal } from 'lucide-react';
import IsoUploader from '@/components/IsoUploader';
import MountStatus from '@/components/MountStatus';
import CustomizationPanel from '@/components/CustomizationPanel';
import CommitPanel from '@/components/CommitPanel';
import WorkflowStepper from '@/components/WorkflowStepper';
import DriverInjection from '@/components/DriverInjection';
import UnattendGenerator from '@/components/UnattendGenerator';
import WindowsUpdate from '@/components/WindowsUpdate';
import ProjectManager, { type ProjectData } from '@/components/ProjectManager';
import WimEditor from '@/components/WimEditor';
import RegistryEditor from '@/components/RegistryEditor';
import ServicesManager from '@/components/ServicesManager';
import ComponentRemoval from '@/components/ComponentRemoval';
import SectionSidebar from '@/components/SectionSidebar';
import SummaryDashboard from '@/components/SummaryDashboard';

const SECTION_IDS = ['source', 'mount', 'wim', 'customizations', 'drivers', 'registry', 'services', 'components', 'updates', 'unattend', 'build'];

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [customizationCount, setCustomizationCount] = useState(0);
  const [driverCount, setDriverCount] = useState(0);
  const [registryCount, setRegistryCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [componentCount, setComponentCount] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);
  const [unattendCount, setUnattendCount] = useState(0);
  const [activeSection, setActiveSection] = useState('source');

  // Refs for export/import callbacks
  const exportCustomizations = useRef<() => { programs: string[]; tweaks: string[]; optimizations: string[] }>(() => ({ programs: [], tweaks: [], optimizations: [] }));
  const importCustomizations = useRef<(data: { programs: string[]; tweaks: string[]; optimizations: string[] }) => void>(() => {});
  const exportDrivers = useRef<() => { name: string; path: string; type: string }[]>(() => []);
  const importDrivers = useRef<(data: { name: string; path: string; type: string }[]) => void>(() => {});
  const exportUpdates = useRef<() => { kb: string; title: string; category: string; source: string; filePath?: string }[]>(() => []);
  const importUpdates = useRef<(data: { kb: string; title: string; category: string; source: string; filePath?: string }[]) => void>(() => {});
  const exportUnattend = useRef<() => { id: string; value: string; enabled: boolean }[]>(() => []);
  const importUnattend = useRef<(data: { id: string; value: string; enabled: boolean }[]) => void>(() => {});

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id.replace('section-', '');
          setActiveSection(id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );

    SECTION_IDS.forEach(id => {
      const el = document.getElementById(`section-${id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const currentStep = useMemo(() => {
    if (!selectedFile) return 1;
    if (!isMounted) return 2;
    return 3;
  }, [selectedFile, isMounted]);

  const handleExport = useCallback((): ProjectData => {
    return {
      version: '1.3.0',
      name: selectedFile?.name?.replace('.iso', '') || 'iso-forge-project',
      exportedAt: new Date().toISOString(),
      customizations: exportCustomizations.current(),
      drivers: exportDrivers.current(),
      updates: exportUpdates.current(),
      unattend: exportUnattend.current(),
    };
  }, [selectedFile]);

  const handleImport = useCallback((data: ProjectData) => {
    if (data.customizations) importCustomizations.current(data.customizations);
    if (data.drivers) importDrivers.current(data.drivers);
    if (data.updates) importUpdates.current(data.updates);
    if (data.unattend) importUnattend.current(data.unattend);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SectionSidebar activeSection={activeSection} isMounted={isMounted} hasFile={!!selectedFile} />

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
            <div className="ml-auto flex items-center gap-3">
              <ProjectManager onExport={handleExport} onImport={handleImport} />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-muted-foreground">v1.3.0</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-8 xl:pl-36">
        <WorkflowStepper currentStep={currentStep} />

        <div className="grid gap-6 lg:grid-cols-[1fr,420px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* 1. ISO Selection */}
            <section id="section-source">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">1</span>
                Source Image
              </h2>
              <IsoUploader selectedFile={selectedFile} onIsoSelect={setSelectedFile} />
            </section>

            {/* 2. Mount */}
            {selectedFile && (
              <section id="section-mount">
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

            {/* 3. WIM Editor */}
            <section id="section-wim">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">3</span>
                WIM Edition Manager
              </h2>
              <WimEditor isMounted={isMounted} />
            </section>

            {/* 4. Customizations */}
            <section id="section-customizations">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">4</span>
                Customizations
              </h2>
              <CustomizationPanel
                isMounted={isMounted}
                onCountChange={setCustomizationCount}
                exportRef={exportCustomizations}
                importRef={importCustomizations}
              />
            </section>

            {/* 5. Drivers */}
            <section id="section-drivers">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">5</span>
                Driver Injection
              </h2>
              <DriverInjection
                isMounted={isMounted}
                onCountChange={setDriverCount}
                exportRef={exportDrivers}
                importRef={importDrivers}
              />
            </section>

            {/* 6. Registry */}
            <section id="section-registry">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">6</span>
                Registry Editor
              </h2>
              <RegistryEditor isMounted={isMounted} onCountChange={setRegistryCount} />
            </section>

            {/* 7. Services Manager */}
            <section id="section-services">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">7</span>
                Services Manager
              </h2>
              <ServicesManager isMounted={isMounted} onCountChange={setServiceCount} />
            </section>

            {/* 8. Component Removal */}
            <section id="section-components">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">8</span>
                Component Removal
              </h2>
              <ComponentRemoval isMounted={isMounted} onCountChange={setComponentCount} />
            </section>

            {/* 9. Windows Update */}
            <section id="section-updates">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">9</span>
                Windows Update Slipstream
              </h2>
              <WindowsUpdate
                isMounted={isMounted}
                onCountChange={setUpdateCount}
                exportRef={exportUpdates}
                importRef={importUpdates}
              />
            </section>

            {/* 8. Unattend */}
            <section id="section-unattend">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">10</span>
                Unattended Setup (autounattend.xml)
              </h2>
              <UnattendGenerator
                isMounted={isMounted}
                onCountChange={setUnattendCount}
                exportRef={exportUnattend}
                importRef={importUnattend}
              />
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:sticky lg:top-24 lg:self-start" id="section-build">
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">11</span>
              Build Output
            </h2>
            <CommitPanel isMounted={isMounted} customizationCount={customizationCount} />

            <div className="mt-6">
              <SummaryDashboard
                customizationCount={customizationCount}
                driverCount={driverCount}
                registryCount={registryCount}
                serviceCount={serviceCount}
                componentCount={componentCount}
                updateCount={updateCount}
                unattendCount={unattendCount}
              />
            </div>

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

            <div className="mt-4 p-4 bg-muted/30 border border-border rounded-lg">
              <h3 className="text-sm font-medium text-foreground mb-2">DISM Reference</h3>
              <div className="space-y-1.5 text-[11px] font-mono text-muted-foreground">
                <p><span className="text-primary">Mount:</span> /Mount-Wim /WimFile /Index /MountDir</p>
                <p><span className="text-primary">Editions:</span> /Delete-Image /Export-Image</p>
                <p><span className="text-primary">Drivers:</span> /Add-Driver /Driver /Recurse</p>
                <p><span className="text-primary">Registry:</span> REG LOAD / REG IMPORT / REG UNLOAD</p>
                <p><span className="text-primary">Updates:</span> /Add-Package /PackagePath</p>
                <p><span className="text-primary">Packages:</span> /Remove-ProvisionedAppxPackage</p>
                <p><span className="text-primary">Cleanup:</span> /Cleanup-Image /StartComponentCleanup</p>
                <p><span className="text-primary">Commit:</span> /Unmount-Wim /Commit</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <div className="container max-w-6xl mx-auto px-4">
          <p className="text-center text-xs font-mono text-muted-foreground">
            ISO Forge • Windows Image Customization Tool • Prototype v1.3.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
