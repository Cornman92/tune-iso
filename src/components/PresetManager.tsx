import { useState } from 'react';
import { BookmarkPlus, Download, Upload, Trash2, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Preset, builtInPresets } from '@/data/customizations';

interface PresetManagerProps {
  onApplyPreset: (preset: Preset) => void;
  onSavePreset: (name: string, description: string) => void;
}

const PresetManager = ({ onApplyPreset, onSavePreset }: PresetManagerProps) => {
  const [showSave, setShowSave] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDesc, setPresetDesc] = useState('');
  const [customPresets, setCustomPresets] = useState<Preset[]>(() => {
    try {
      const saved = localStorage.getItem('iso-forge-presets');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const handleSave = () => {
    if (!presetName.trim()) return;
    onSavePreset(presetName.trim(), presetDesc.trim());
    setPresetName('');
    setPresetDesc('');
    setShowSave(false);
  };

  const handleApply = (preset: Preset) => {
    onApplyPreset(preset);
    setAppliedId(preset.id);
    setTimeout(() => setAppliedId(null), 2000);
  };

  const handleDeleteCustom = (id: string) => {
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('iso-forge-presets', JSON.stringify(updated));
  };

  const allPresets = [...builtInPresets, ...customPresets];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-warning" />
          <span className="text-sm font-mono font-medium text-foreground">Presets</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSave(!showSave)}
          className="h-7 text-xs font-mono"
        >
          <BookmarkPlus className="w-3.5 h-3.5 mr-1" />
          Save Current
        </Button>
      </div>

      {showSave && (
        <div className="p-3 border-b border-border bg-muted/10 space-y-2">
          <Input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            className="h-8 text-sm font-mono bg-muted/30"
          />
          <Input
            value={presetDesc}
            onChange={(e) => setPresetDesc(e.target.value)}
            placeholder="Description (optional)..."
            className="h-8 text-sm font-mono bg-muted/30"
          />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs font-mono flex-1" onClick={handleSave}>
              Save Preset
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs font-mono" onClick={() => setShowSave(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="max-h-[280px] overflow-y-auto p-2 space-y-1.5">
        {allPresets.map((preset) => {
          const isBuiltIn = builtInPresets.some(p => p.id === preset.id);
          const totalItems = preset.programs.length + preset.tweaks.length + preset.optimizations.length;
          const isApplied = appliedId === preset.id;

          return (
            <div
              key={preset.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{preset.name}</p>
                  {isBuiltIn && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 bg-primary/10 text-primary shrink-0">
                      BUILT-IN
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{preset.description}</p>
                <div className="flex gap-2 mt-1.5">
                  <span className="text-[10px] font-mono text-primary">{preset.programs.length} programs</span>
                  <span className="text-[10px] font-mono text-warning">{preset.tweaks.length} tweaks</span>
                  <span className="text-[10px] font-mono text-success">{preset.optimizations.length} opts</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleApply(preset)}
                >
                  {isApplied ? (
                    <Check className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </Button>
                {!isBuiltIn && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteCustom(preset.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PresetManager;