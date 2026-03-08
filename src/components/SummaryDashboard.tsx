import { Settings, HardDriveDownload, Database, Cog, Package, Download, FileCode, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SummaryDashboardProps {
  customizationCount: number;
  driverCount: number;
  registryCount: number;
  serviceCount: number;
  componentCount: number;
  updateCount: number;
  unattendCount: number;
}

const SummaryDashboard = ({
  customizationCount,
  driverCount,
  registryCount,
  serviceCount,
  componentCount,
  updateCount,
  unattendCount,
}: SummaryDashboardProps) => {
  const items = [
    { label: 'Customizations', count: customizationCount, icon: Settings, color: 'text-primary' },
    { label: 'Drivers', count: driverCount, icon: HardDriveDownload, color: 'text-primary' },
    { label: 'Registry Tweaks', count: registryCount, icon: Database, color: 'text-primary' },
    { label: 'Services Disabled', count: serviceCount, icon: Cog, color: 'text-warning' },
    { label: 'Components Removed', count: componentCount, icon: Package, color: 'text-destructive' },
    { label: 'Updates Queued', count: updateCount, icon: Download, color: 'text-success' },
    { label: 'Unattend Options', count: unattendCount, icon: FileCode, color: 'text-primary' },
  ];

  const totalChanges = items.reduce((sum, i) => sum + i.count, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Changes Summary</h3>
        </div>
        <Badge variant={totalChanges > 0 ? 'default' : 'secondary'} className="text-xs font-mono">
          {totalChanges} total
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                item.count > 0
                  ? 'bg-muted/50 border-border'
                  : 'bg-muted/20 border-transparent opacity-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${item.count > 0 ? item.color : 'text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground truncate">{item.label}</p>
                <p className={`text-sm font-mono font-semibold ${item.count > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.count}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {totalChanges === 0 && (
        <p className="text-[11px] text-muted-foreground text-center mt-3 font-mono">No changes configured yet</p>
      )}
    </div>
  );
};

export default SummaryDashboard;
