import { useMemo } from 'react';
import { HardDrive, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { COMPONENTS } from '@/components/ComponentRemoval';

interface IsoSizeEstimatorProps {
  removedComponents: string[];
  driverCount: number;
  updateCount: number;
}

function parseSizeMB(sizeStr: string): number {
  const match = sizeStr.match(/~?(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

const BASE_ISO_SIZE_MB = 5400; // ~5.4 GB typical Win 11 ISO

const IsoSizeEstimator = ({ removedComponents, driverCount, updateCount }: IsoSizeEstimatorProps) => {
  const { removedMB, addedMB, estimatedMB, deltaPercent } = useMemo(() => {
    const removed = removedComponents.reduce((sum, id) => {
      const comp = COMPONENTS.find(c => c.id === id);
      return sum + (comp ? parseSizeMB(comp.size) : 0);
    }, 0);

    // Rough estimates: ~50MB per driver pack, ~30MB per update
    const driversMB = driverCount * 50;
    const updatesMB = updateCount * 30;
    const added = driversMB + updatesMB;

    const estimated = BASE_ISO_SIZE_MB - removed + added;
    const delta = ((estimated - BASE_ISO_SIZE_MB) / BASE_ISO_SIZE_MB) * 100;

    return { removedMB: removed, addedMB: added, estimatedMB: estimated, deltaPercent: delta };
  }, [removedComponents, driverCount, updateCount]);

  const netDelta = addedMB - removedMB;
  const isSmaller = netDelta < 0;
  const isLarger = netDelta > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <HardDrive className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">ISO Size Estimate</h3>
        <Badge
          variant="outline"
          className={`ml-auto text-[10px] font-mono ${
            isSmaller ? 'border-success/30 text-success' : isLarger ? 'border-warning/30 text-warning' : 'text-muted-foreground'
          }`}
        >
          {isSmaller ? (
            <TrendingDown className="w-3 h-3 mr-1" />
          ) : isLarger ? (
            <TrendingUp className="w-3 h-3 mr-1" />
          ) : (
            <Minus className="w-3 h-3 mr-1" />
          )}
          {deltaPercent > 0 ? '+' : ''}{deltaPercent.toFixed(1)}%
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground">Base image</span>
          <span className="text-foreground">{(BASE_ISO_SIZE_MB / 1024).toFixed(1)} GB</span>
        </div>
        {removedMB > 0 && (
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-success">− Removed components</span>
            <span className="text-success">-{removedMB} MB</span>
          </div>
        )}
        {addedMB > 0 && (
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-warning">+ Drivers & updates</span>
            <span className="text-warning">+{addedMB} MB</span>
          </div>
        )}
        <div className="border-t border-border pt-2 flex items-center justify-between text-xs font-mono">
          <span className="text-foreground font-semibold">Estimated output</span>
          <span className={`font-semibold ${isSmaller ? 'text-success' : isLarger ? 'text-warning' : 'text-foreground'}`}>
            {estimatedMB >= 1024 ? `${(estimatedMB / 1024).toFixed(2)} GB` : `${estimatedMB} MB`}
          </span>
        </div>

        <Progress
          value={Math.min((estimatedMB / (BASE_ISO_SIZE_MB * 1.5)) * 100, 100)}
          className="h-2 mt-1"
        />
        <p className="text-[10px] text-muted-foreground text-center font-mono">
          Estimates are approximate — actual size depends on compression and cleanup
        </p>
      </div>
    </div>
  );
};

export default IsoSizeEstimator;
