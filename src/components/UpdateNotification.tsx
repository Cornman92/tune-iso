import { useState, useEffect } from 'react';
import { Download, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isElectron, onUpdateAvailable, onUpdateDownloaded, installUpdate, checkForUpdates } from '@/lib/electronBridge';

const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [version, setVersion] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isElectron()) return;

    onUpdateAvailable((info) => {
      setUpdateAvailable(true);
      setVersion(info.version);
    });

    onUpdateDownloaded((info) => {
      setUpdateReady(true);
      setVersion(info.version);
    });

    // Check on mount
    checkForUpdates();
  }, []);

  if (!isElectron() || dismissed || (!updateAvailable && !updateReady)) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-fade-in">
      <div className="bg-card border border-primary/30 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            {updateReady ? (
              <Download className="w-4.5 h-4.5 text-primary" />
            ) : (
              <RefreshCw className="w-4.5 h-4.5 text-primary animate-spin" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {updateReady ? 'Update Ready' : 'Update Available'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {updateReady
                ? `v${version} downloaded. Restart to apply.`
                : `v${version} is downloading...`}
            </p>
            {updateReady && (
              <Button
                size="sm"
                className="mt-2 h-7 text-xs font-mono"
                onClick={installUpdate}
              >
                <RefreshCw className="w-3 h-3 mr-1.5" />
                Restart & Update
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 shrink-0"
            onClick={() => setDismissed(true)}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
