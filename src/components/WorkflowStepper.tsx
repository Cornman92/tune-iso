import { HardDrive, Disc, Settings, HardDriveDownload, FileCode, Save, Check } from 'lucide-react';

interface WorkflowStepperProps {
  currentStep: number;
}

const steps = [
  { id: 1, label: 'Select ISO', icon: HardDrive },
  { id: 2, label: 'Mount', icon: Disc },
  { id: 3, label: 'Customize', icon: Settings },
  { id: 4, label: 'Drivers', icon: HardDriveDownload },
  { id: 5, label: 'Unattend', icon: FileCode },
  { id: 6, label: 'Build', icon: Save },
];

const WorkflowStepper = ({ currentStep }: WorkflowStepperProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isComplete = step.id < currentStep;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                ${isComplete 
                  ? 'bg-success/20 border-2 border-success glow-success' 
                  : isActive 
                    ? 'bg-primary/20 border-2 border-primary glow-primary' 
                    : 'bg-muted border-2 border-border'
                }
              `}>
                {isComplete ? (
                  <Check className="w-5 h-5 text-success" />
                ) : (
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
              </div>
              <span className={`
                mt-2 text-xs font-mono
                ${isActive ? 'text-primary' : isComplete ? 'text-success' : 'text-muted-foreground'}
              `}>
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`
                w-16 sm:w-24 h-0.5 mx-2
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
