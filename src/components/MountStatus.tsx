import { useState, useEffect } from 'react';
import { Disc, Play, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface MountStatusProps {
  isoFile: File | null;
  isMounted: boolean;
  onMount: () => void;
  onUnmount: () => void;
}

const MountStatus = ({ isoFile, isMounted, onMount, onUnmount }: MountStatusProps) => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleMount = async () => {
    setIsLoading(true);
    setProgress(0);
    
    // Simulate mounting progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setProgress(i);
    }
    
    setIsLoading(false);
    onMount();
  };

  const handleUnmount = async () => {
    setIsLoading(true);
    setProgress(100);
    
    // Simulate unmounting progress
    for (let i = 100; i >= 0; i -= 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(i);
    }
    
    setIsLoading(false);
    onUnmount();
  };

  if (!isoFile) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-slide-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${isMounted ? 'bg-success/20' : 'bg-muted'}
          `}>
            <Disc className={`w-5 h-5 ${isMounted ? 'text-success animate-pulse-glow' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="font-medium text-foreground">Mount Status</p>
            <p className="text-sm font-mono text-muted-foreground">
              {isLoading 
                ? (progress < 50 ? 'Mounting...' : isMounted ? 'Mounted' : 'Unmounting...') 
                : (isMounted ? 'Mounted & Ready' : 'Not Mounted')
              }
            </p>
          </div>
        </div>
        
        <Button
          onClick={isMounted ? handleUnmount : handleMount}
          disabled={isLoading}
          variant={isMounted ? "destructive" : "default"}
          className="font-mono"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : isMounted ? (
            <Square className="w-4 h-4 mr-2" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isLoading ? 'Processing...' : isMounted ? 'Unmount' : 'Mount ISO'}
        </Button>
      </div>
      
      {isLoading && (
        <div className="space-y-2 animate-fade-in">
          <Progress value={progress} className="h-2" />
          <p className="text-xs font-mono text-muted-foreground text-right">{progress}%</p>
        </div>
      )}
      
      {isMounted && !isLoading && (
        <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
          <p className="text-sm font-mono text-success">
            ✓ ISO mounted at E:\Windows_Image
          </p>
        </div>
      )}
    </div>
  );
};

export default MountStatus;
