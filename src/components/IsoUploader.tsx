import { useState, useCallback } from 'react';
import { HardDrive, Upload, CheckCircle2 } from 'lucide-react';
import { isElectron, openFileDialog } from '@/lib/electronBridge';

interface IsoUploaderProps {
  onIsoSelect: (file: File | null) => void;
  selectedFile: File | null;
}

const IsoUploader = ({ onIsoSelect, selectedFile }: IsoUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.iso')) {
      onIsoSelect(file);
    }
  }, [onIsoSelect]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onIsoSelect(file);
    }
  };

  if (selectedFile) {
    return (
      <div className="bg-card border border-primary/30 rounded-lg p-6 glow-primary animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-mono text-sm text-muted-foreground">Selected ISO</p>
            <p className="font-mono text-foreground">{selectedFile.name}</p>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              {(selectedFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB
            </p>
          </div>
          <button
            onClick={() => onIsoSelect(null)}
            className="text-muted-foreground hover:text-foreground transition-colors font-mono text-sm"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 cursor-pointer
        ${isDragging 
          ? 'border-primary bg-primary/5 glow-primary' 
          : 'border-border hover:border-primary/50 hover:bg-card/50'
        }
      `}
    >
      <input
        type="file"
        accept=".iso"
        aria-label="Select a Windows ISO file"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-4">
        <div className={`
          w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300
          ${isDragging ? 'bg-primary/20' : 'bg-card'}
        `}>
          {isDragging ? (
            <Upload className="w-8 h-8 text-primary animate-pulse-glow" />
          ) : (
            <HardDrive className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="text-foreground font-medium mb-1">
            {isDragging ? 'Drop your ISO file' : 'Select Windows ISO'}
          </p>
          <p className="text-sm text-muted-foreground font-mono">
            Drag & drop or click to browse
          </p>
        </div>
      </div>
    </div>
  );
};

export default IsoUploader;
