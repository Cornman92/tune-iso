import { useState, useMemo } from 'react';
import { Clock, Search, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScheduledTask {
  id: string;
  name: string;
  path: string;
  description: string;
  category: string;
  risk: 'safe' | 'moderate' | 'aggressive';
  defaultDisabled: boolean;
}

const SCHEDULED_TASKS: ScheduledTask[] = [
  // Telemetry
  { id: 'ait-agent', name: 'AitAgent', path: '\\Microsoft\\Windows\\Application Experience\\AitAgent', description: 'Application Impact Telemetry agent', category: 'Telemetry', risk: 'safe', defaultDisabled: false },
  { id: 'ms-compat-appraiser', name: 'Microsoft Compatibility Appraiser', path: '\\Microsoft\\Windows\\Application Experience\\Microsoft Compatibility Appraiser', description: 'Collects compatibility telemetry data', category: 'Telemetry', risk: 'safe', defaultDisabled: false },
  { id: 'program-data-updater', name: 'ProgramDataUpdater', path: '\\Microsoft\\Windows\\Application Experience\\ProgramDataUpdater', description: 'Collects program telemetry', category: 'Telemetry', risk: 'safe', defaultDisabled: false },
  { id: 'consolidator', name: 'Consolidator', path: '\\Microsoft\\Windows\\Customer Experience Improvement Program\\Consolidator', description: 'CEIP data consolidation', category: 'Telemetry', risk: 'safe', defaultDisabled: false },
  { id: 'usb-ceip', name: 'UsbCeip', path: '\\Microsoft\\Windows\\Customer Experience Improvement Program\\UsbCeip', description: 'USB CEIP telemetry', category: 'Telemetry', risk: 'safe', defaultDisabled: false },
  { id: 'kernel-ceip', name: 'KernelCeipTask', path: '\\Microsoft\\Windows\\Customer Experience Improvement Program\\KernelCeipTask', description: 'Kernel CEIP telemetry', category: 'Telemetry', risk: 'safe', defaultDisabled: false },
  { id: 'proxy', name: 'Proxy', path: '\\Microsoft\\Windows\\Autochk\\Proxy', description: 'Sends autochk results to telemetry', category: 'Telemetry', risk: 'safe', defaultDisabled: false },
  { id: 'queue-reporting', name: 'QueueReporting', path: '\\Microsoft\\Windows\\Windows Error Reporting\\QueueReporting', description: 'Error reporting queue', category: 'Telemetry', risk: 'safe', defaultDisabled: false },

  // Office Telemetry
  { id: 'office-tel-agent', name: 'OfficeTelemetryAgentFallBack', path: '\\Microsoft\\Office\\OfficeTelemetryAgentFallBack', description: 'Office telemetry fallback', category: 'Office', risk: 'safe', defaultDisabled: false },
  { id: 'office-tel-logon', name: 'OfficeTelemetryAgentLogOn', path: '\\Microsoft\\Office\\OfficeTelemetryAgentLogOn', description: 'Office telemetry on logon', category: 'Office', risk: 'safe', defaultDisabled: false },

  // Diagnostics
  { id: 'diag-boot', name: 'Diagnostic Boot', path: '\\Microsoft\\Windows\\DiskDiagnostic\\Microsoft-Windows-DiskDiagnosticDataCollector', description: 'Disk diagnostic data collection', category: 'Diagnostics', risk: 'safe', defaultDisabled: false },
  { id: 'maps-toast', name: 'MapsToastTask', path: '\\Microsoft\\Windows\\Maps\\MapsToastTask', description: 'Maps notification task', category: 'Diagnostics', risk: 'safe', defaultDisabled: false },
  { id: 'maps-update', name: 'MapsUpdateTask', path: '\\Microsoft\\Windows\\Maps\\MapsUpdateTask', description: 'Offline maps update', category: 'Diagnostics', risk: 'safe', defaultDisabled: false },
  { id: 'family-monitor', name: 'Family Safety Monitor', path: '\\Microsoft\\Windows\\Shell\\FamilySafetyMonitor', description: 'Family Safety monitoring', category: 'Diagnostics', risk: 'safe', defaultDisabled: false },

  // Cloud
  { id: 'onedrive-standalone', name: 'OneDrive Standalone Update', path: '\\Microsoft\\OneDrive\\OneDrive Standalone Update Task', description: 'Auto-update OneDrive', category: 'Cloud', risk: 'safe', defaultDisabled: false },
  { id: 'edge-update', name: 'MicrosoftEdgeUpdateTaskMachineCore', path: '\\MicrosoftEdgeUpdateTaskMachineCore', description: 'Edge auto-update', category: 'Cloud', risk: 'moderate', defaultDisabled: false },

  // Xbox
  { id: 'xbox-save', name: 'XblGameSaveTask', path: '\\Microsoft\\XblGameSave\\XblGameSaveTask', description: 'Xbox game save sync', category: 'Xbox', risk: 'safe', defaultDisabled: false },

  // Maintenance
  { id: 'scheduled-defrag', name: 'ScheduledDefrag', path: '\\Microsoft\\Windows\\Defrag\\ScheduledDefrag', description: 'Scheduled disk defragmentation', category: 'Maintenance', risk: 'moderate', defaultDisabled: false },
  { id: 'sil-collector', name: 'Software Inventory Logging', path: '\\Microsoft\\Windows\\SoftwareInventoryLogging\\Collection', description: 'Software inventory collection', category: 'Maintenance', risk: 'safe', defaultDisabled: false },
  { id: 'sih-client', name: 'SIH Client (Healing)', path: '\\Microsoft\\Windows\\WindowsUpdate\\sih', description: 'Service Initiated Healing', category: 'Maintenance', risk: 'moderate', defaultDisabled: false },

  // Privacy
  { id: 'clipboard-sync', name: 'Clipboard Sync', path: '\\Microsoft\\Windows\\CloudClipboard\\CloudClipboardSync', description: 'Cloud clipboard synchronization', category: 'Privacy', risk: 'safe', defaultDisabled: false },
  { id: 'speech-model', name: 'Speech Model Download', path: '\\Microsoft\\Speech\\SpeechModelDownloadTask', description: 'Downloads speech recognition models', category: 'Privacy', risk: 'safe', defaultDisabled: false },
  { id: 'feedback-notification', name: 'Feedback Notification', path: '\\Microsoft\\Windows\\Feedback\\Siuf\\DmClient', description: 'Feedback notification prompts', category: 'Privacy', risk: 'safe', defaultDisabled: false },
];

const CATEGORIES = [...new Set(SCHEDULED_TASKS.map(t => t.category))];

interface TaskSchedulerEditorProps {
  isMounted: boolean;
  onCountChange?: (count: number) => void;
}

const TaskSchedulerEditor = ({ isMounted, onCountChange }: TaskSchedulerEditorProps) => {
  const [disabledTasks, setDisabledTasks] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTasks = useMemo(() => {
    let tasks = SCHEDULED_TASKS;
    if (selectedCategory !== 'all') {
      tasks = tasks.filter(t => t.category === selectedCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      tasks = tasks.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.path.toLowerCase().includes(q));
    }
    return tasks;
  }, [selectedCategory, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredTasks> = {};
    filteredTasks.forEach(t => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return groups;
  }, [filteredTasks]);

  const toggleTask = (id: string) => {
    setDisabledTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      onCountChange?.(next.size);
      return next;
    });
  };

  const disableAll = (category: string) => {
    const tasksInCat = SCHEDULED_TASKS.filter(t => t.category === category);
    setDisabledTasks(prev => {
      const next = new Set(prev);
      tasksInCat.forEach(t => next.add(t.id));
      onCountChange?.(next.size);
      return next;
    });
  };

  const getCommands = (): string[] => {
    return SCHEDULED_TASKS
      .filter(t => disabledTasks.has(t.id))
      .map(t => `schtasks /Change /TN "${t.path}" /Disable`);
  };

  const riskColors: Record<string, string> = {
    safe: 'text-success',
    moderate: 'text-warning',
    aggressive: 'text-destructive',
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Scheduled Tasks</h3>
        <Badge variant={disabledTasks.size > 0 ? 'default' : 'secondary'} className="ml-auto text-xs font-mono">
          {disabledTasks.size} disabled
        </Badge>
      </div>

      {!isMounted && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 border border-warning/20 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
          <p className="text-[11px] text-warning">Tasks will be disabled via schtasks in SetupComplete.cmd on first boot</p>
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {Object.entries(grouped).map(([category, tasks]) => {
          const disabledInCat = tasks.filter(t => disabledTasks.has(t.id)).length;
          return (
            <div key={category} className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-2.5 bg-muted/20">
                <span className="text-xs font-medium text-foreground">{category}</span>
                <div className="flex items-center gap-2">
                  {disabledInCat > 0 && <Badge variant="destructive" className="text-[10px] font-mono">{disabledInCat}/{tasks.length}</Badge>}
                  <button
                    onClick={() => disableAll(category)}
                    className="text-[10px] text-destructive hover:text-destructive/80 font-mono transition-colors"
                  >
                    Disable All
                  </button>
                </div>
              </div>
              <div className="divide-y divide-border">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-2.5">
                    <Switch
                      checked={disabledTasks.has(task.id)}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-foreground">{task.name}</span>
                        <span className={`text-[10px] ${riskColors[task.risk]}`}>●</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{task.description}</p>
                      <p className="text-[9px] font-mono text-muted-foreground/60 truncate">{task.path}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {disabledTasks.size > 0 && (
        <div className="mt-3 p-2.5 bg-muted/30 rounded-lg">
          <p className="text-[10px] text-muted-foreground mb-1.5 font-mono">schtasks commands:</p>
          <pre className="text-[10px] font-mono text-foreground max-h-24 overflow-y-auto whitespace-pre-wrap break-all">
            {getCommands().slice(0, 4).join('\n')}
            {getCommands().length > 4 && `\n... +${getCommands().length - 4} more`}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TaskSchedulerEditor;
