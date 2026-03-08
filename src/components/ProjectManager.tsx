import { useState } from 'react';
import { FolderArchive, Upload, Download, FileJson, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { projectDataSchema } from '@/lib/projectSchema';

interface BuildStepData {
  id: string;
  label: string;
  enabled: boolean;
}

interface ProjectData {
  version: string;
  name: string;
  exportedAt: string;
  customizations: {
    programs: string[];
    tweaks: string[];
    optimizations: string[];
  };
  drivers: {
    name: string;
    path: string;
    type: string;
  }[];
  updates: {
    kb: string;
    title: string;
    category: string;
    source: string;
    filePath?: string;
  }[];
  unattend: {
    id: string;
    value: string;
    enabled: boolean;
  }[];
  buildSteps?: BuildStepData[];
}

interface ProjectManagerProps {
  onExport: () => ProjectData;
  onImport: (data: ProjectData) => void;
}

const ProjectManager = ({ onExport, onImport }: ProjectManagerProps) => {
  const [lastAction, setLastAction] = useState<'export' | 'import' | null>(null);

  const handleExport = () => {
    try {
      const data = onExport();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.name || 'iso-forge-project'}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setLastAction('export');
      toast.success('Project exported successfully');
      setTimeout(() => setLastAction(null), 3000);
    } catch (err) {
      toast.error('Failed to export project');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const raw = JSON.parse(text);

        const result = projectDataSchema.safeParse(raw);
        if (!result.success) {
          const firstError = result.error.issues[0];
          toast.error('Invalid project file', {
            description: `${firstError.path.join('.')}: ${firstError.message}`,
          });
          return;
        }

        const data = result.data as ProjectData;
        onImport(data);
        setLastAction('import');
        toast.success(`Loaded project: ${data.name || 'Untitled'}`, {
          description: `${data.customizations.programs.length + data.customizations.tweaks.length + data.customizations.optimizations.length} customizations, ${data.drivers?.length || 0} drivers, ${data.updates?.length || 0} updates`,
        });
        setTimeout(() => setLastAction(null), 3000);
      } catch {
        toast.error('Failed to parse project file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="font-mono text-xs h-8 gap-1.5"
        onClick={handleExport}
      >
        {lastAction === 'export' ? (
          <Check className="w-3.5 h-3.5 text-success" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        Export Project
      </Button>
      <div className="relative">
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <Button
          variant="outline"
          size="sm"
          className="font-mono text-xs h-8 gap-1.5 pointer-events-none"
        >
          {lastAction === 'import' ? (
            <Check className="w-3.5 h-3.5 text-success" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          Import Project
        </Button>
      </div>
    </div>
  );
};

export default ProjectManager;
export type { ProjectData };