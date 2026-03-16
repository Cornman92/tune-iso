import { useState, useCallback } from 'react';
import { ShieldCheck, Hash, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ChecksumVerifierProps {
  selectedFile: File | null;
}

const ChecksumVerifier = ({ selectedFile }: ChecksumVerifierProps) => {
  const [hash, setHash] = useState('');
  const [computing, setComputing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expectedHash, setExpectedHash] = useState('');

  const computeHash = useCallback(async () => {
    if (!selectedFile) return;
    setComputing(true);
    setProgress(0);
    setHash('');

    try {
      const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks
      const fileSize = selectedFile.size;
      const chunks = Math.ceil(fileSize / CHUNK_SIZE);
      
      // For files that fit in memory, use SubtleCrypto directly
      if (fileSize < 500 * 1024 * 1024) { // < 500MB
        const buffer = await selectedFile.arrayBuffer();
        setProgress(80);
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setHash(hashHex);
        setProgress(100);
      } else {
        // For larger files, read in chunks and show progress
        // SubtleCrypto doesn't support incremental hashing, so we still need full buffer
        const reader = new FileReader();
        const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = reject;
          reader.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 80));
          };
          reader.readAsArrayBuffer(selectedFile);
        });
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setHash(hashHex);
        setProgress(100);
      }
    } catch (err) {
      console.error('Hash computation failed:', err);
    } finally {
      setComputing(false);
    }
  }, [selectedFile]);

  const isMatch = hash && expectedHash && hash.toLowerCase() === expectedHash.toLowerCase().trim();
  const isMismatch = hash && expectedHash.trim().length >= 64 && !isMatch;

  if (!selectedFile) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <span className="text-xs font-mono font-medium text-foreground">Checksum Verifier</span>
        <Badge variant="secondary" className="text-[10px]">SHA-256</Badge>
      </div>

      <Button
        variant="outline" size="sm" className="w-full text-xs h-7"
        onClick={computeHash} disabled={computing}
      >
        {computing ? <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Computing...</> : <><Hash className="w-3 h-3 mr-1" /> Compute SHA-256</>}
      </Button>

      {computing && <Progress value={progress} className="h-1" />}

      {hash && (
        <div className="space-y-2">
          <div className="p-2 rounded bg-muted/30 border border-border">
            <p className="text-[10px] text-muted-foreground mb-0.5">Computed Hash:</p>
            <p className="text-[10px] font-mono text-foreground break-all select-all">{hash}</p>
          </div>
          
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Verify against known hash (optional):</p>
            <Input
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              placeholder="Paste expected SHA-256 hash..."
              className="h-7 text-[10px] font-mono"
            />
          </div>

          {isMatch && (
            <div className="flex items-center gap-1.5 text-emerald-500 text-[11px]">
              <Check className="w-3.5 h-3.5" /> Hash matches — file integrity verified
            </div>
          )}
          {isMismatch && (
            <div className="flex items-center gap-1.5 text-destructive text-[11px]">
              <X className="w-3.5 h-3.5" /> Hash mismatch — file may be corrupted or modified
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChecksumVerifier;
