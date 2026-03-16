import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Disc3, HardDrive, Settings, Save, ArrowRight, ArrowLeft, Gamepad2, Shield, Code, Server, Eye, Check, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'isoforge-onboarded';

interface OnboardingWizardProps {
  onApplyPreset?: (preset: { programs: string[]; tweaks: string[]; optimizations: string[] }) => void;
}

const QUICK_TEMPLATES = [
  {
    id: 'gaming',
    name: 'Gaming Rig',
    icon: Gamepad2,
    description: 'Max FPS, stripped bloat, Steam & Discord pre-configured',
    programs: ['steam', 'discord', 'epic-games', '7zip', 'vlc', 'firefox'],
    tweaks: ['disable-telemetry', 'disable-cortana', 'disable-widgets', 'classic-context', 'dark-mode', 'disable-copilot'],
    optimizations: ['disable-superfetch', 'disable-indexing', 'disable-diagnostics', 'disable-xbox-services'],
  },
  {
    id: 'privacy',
    name: 'Privacy Fortress',
    icon: Shield,
    description: 'Block all telemetry, tracking, and data collection',
    programs: ['firefox', 'keepassxc', 'veracrypt', 'mullvad-vpn'],
    tweaks: ['disable-telemetry', 'disable-cortana', 'disable-activity-history', 'disable-advertising-id', 'disable-location-tracking', 'disable-feedback', 'disable-copilot', 'disable-recall', 'disable-bing-search'],
    optimizations: ['disable-diagnostics', 'disable-error-reporting', 'disable-dmwappush', 'disable-geolocation'],
  },
  {
    id: 'developer',
    name: 'Dev Workstation',
    icon: Code,
    description: 'VS Code, Git, Docker, Node.js, and dev-friendly tweaks',
    programs: ['vscode', 'git', 'docker-desktop', 'nodejs', 'python', 'windows-terminal', 'powershell7', '7zip', 'firefox'],
    tweaks: ['classic-context', 'show-extensions', 'show-hidden', 'dark-mode', 'disable-copilot', 'disable-widgets'],
    optimizations: ['disable-diagnostics', 'disable-error-reporting'],
  },
  {
    id: 'minimal',
    name: 'Minimal Server',
    icon: Server,
    description: 'Bare-bones Windows, maximum stability and minimal footprint',
    programs: ['7zip', 'notepad++'],
    tweaks: ['disable-telemetry', 'disable-cortana', 'show-extensions', 'disable-widgets', 'disable-chat', 'disable-copilot', 'disable-recall'],
    optimizations: ['disable-superfetch', 'disable-indexing', 'disable-diagnostics', 'disable-error-reporting', 'disable-xbox-services', 'disable-phone-service', 'disable-wallet', 'disable-fax', 'disable-retaildemo', 'disable-geolocation'],
  },
];

const STEPS = [
  { title: 'Welcome to ISO Forge', description: 'Your Windows image customization toolkit' },
  { title: 'How It Works', description: 'A simple 4-step workflow' },
  { title: 'Quick Start Template', description: 'Pick a starting point or skip to customize from scratch' },
  { title: "You're Ready!", description: 'Start customizing your Windows image' },
];

const OnboardingWizard = ({ onApplyPreset }: OnboardingWizardProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  };

  const handleFinish = () => {
    if (selectedTemplate && onApplyPreset) {
      const tpl = QUICK_TEMPLATES.find(t => t.id === selectedTemplate);
      if (tpl) {
        onApplyPreset({ programs: tpl.programs, tweaks: tpl.tweaks, optimizations: tpl.optimizations });
      }
    }
    handleClose();
  };

  const workflowSteps = [
    { icon: HardDrive, label: 'Select ISO', desc: 'Choose your Windows .iso file' },
    { icon: Disc3, label: 'Mount Image', desc: 'Mount the WIM for editing' },
    { icon: Settings, label: 'Customize', desc: 'Tweaks, drivers, registry, services' },
    { icon: Save, label: 'Build', desc: 'Commit changes and export script' },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {STEPS[step].title}
          </DialogTitle>
          <DialogDescription>{STEPS[step].description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center">
                <Disc3 className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ISO Forge lets you customize Windows images offline — remove bloatware, inject drivers,
                tweak registry settings, disable services, and build a personalized .iso ready to deploy.
              </p>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="text-[10px]">Power Users</Badge>
                <Badge variant="secondary" className="text-[10px]">IT Admins</Badge>
                <Badge variant="secondary" className="text-[10px]">Enthusiasts</Badge>
              </div>
            </div>
          )}

          {/* Step 1: Workflow */}
          {step === 1 && (
            <div className="space-y-3">
              {workflowSteps.map((ws, i) => {
                const Icon = ws.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{ws.label}</div>
                      <div className="text-[11px] text-muted-foreground">{ws.desc}</div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground/50">Step {i + 1}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 2: Templates */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-2">
              {QUICK_TEMPLATES.map(tpl => {
                const Icon = tpl.icon;
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(isSelected ? null : tpl.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected ? 'border-primary bg-primary/10 ring-1 ring-primary/30' : 'border-border bg-muted/20 hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-xs font-medium text-foreground">{tpl.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-primary ml-auto" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{tpl.description}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3: Ready */}
          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedTemplate
                  ? `The "${QUICK_TEMPLATES.find(t => t.id === selectedTemplate)?.name}" template will be applied as your starting point.`
                  : 'You can start customizing from scratch. Use the Preset Library anytime to apply templates later.'}
              </p>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? 'bg-primary w-4' : 'bg-muted-foreground/30'}`} />
          ))}
        </div>

        <DialogFooter className="gap-2">
          {step > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </Button>
          )}
          <div className="flex-1" />
          {step === 2 && (
            <Button variant="ghost" size="sm" onClick={() => { setSelectedTemplate(null); setStep(3); }}>
              Skip
            </Button>
          )}
          {step < 3 ? (
            <Button size="sm" onClick={() => setStep(step + 1)}>
              Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleFinish}>
              Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;
