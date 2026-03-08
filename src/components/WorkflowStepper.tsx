import { HardDrive, Disc, Settings, HardDriveDownload, Download, FileCode, Save, Check, Layers, Database } from 'lucide-react';

interface WorkflowStepperProps {
  currentStep: number;
}

const steps = [
  { id: 1, label: 'Select ISO', icon: HardDrive },
  { id: 2, label: 'Mount', icon: Disc },
  { id: 3, label: 'WIM', icon: Layers },
  { id: 4, label: 'Customize', icon: Settings },
  { id: 5, label: 'Drivers', icon: HardDriveDownload },
  { id: 6, label: 'Registry', icon: Database },
  { id: 7, label: 'Updates', icon: Download },
  { id: 8, label: 'Unattend', icon: FileCode },
  { id: 9, label: 'Build', icon: Save },
];

const WorkflowStepper = ({ currentStep }: WorkflowStepperProps) => {
  return (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isComplete = step.id < currentStep;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                ${isComplete 
                  ? 'bg-success/20 border-2 border-success glow-success' 
                  : isActive 
                    ? 'bg-primary/20 border-2 border-primary glow-primary' 
                    : 'bg-muted border-2 border-border'
                }
              `}>
                {isComplete ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
              </div>
              <span className={`
                mt-1.5 text-[10px] font-mono whitespace-nowrap
                ${isActive ? 'text-primary' : isComplete ? 'text-success' : 'text-muted-foreground'}
              `}>
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`
                w-4 sm:w-8 lg:w-12 h-0.5 mx-0.5
                ${step.id < currentStep ? 'bg-success' : 'bg-border'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WorkflowStepper;
