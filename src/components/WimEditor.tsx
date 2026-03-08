import { useState } from 'react';
import { Layers, Trash2, Merge, Split, Check, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface WimEdition {
  index: number;
  name: string;
  description: string;
  size: string;
  arch: string;
  selected: boolean;
}

const MOCK_EDITIONS: WimEdition[] = [
  { index: 1, name: 'Windows 11 Home', description: 'Core consumer edition', size: '4.2 GB', arch: 'x64', selected: true },
  { index: 2, name: 'Windows 11 Home N', description: 'No media features', size: '4.0 GB', arch: 'x64', selected: false },
  { index: 3, name: 'Windows 11 Home Single Language', description: 'Single language variant', size: '4.1 GB', arch: 'x64', selected: false },
  { index: 4, name: 'Windows 11 Education', description: 'Education edition', size: '4.3 GB', arch: 'x64', selected: false },
  { index: 5, name: 'Windows 11 Education N', description: 'Education, no media', size: '4.1 GB', arch: 'x64', selected: false },
  { index: 6, name: 'Windows 11 Pro', description: 'Professional edition', size: '4.3 GB', arch: 'x64', selected: true },
  { index: 7, name: 'Windows 11 Pro N', description: 'Professional, no media', size: '4.1 GB', arch: 'x64', selected: false },
  { index: 8, name: 'Windows 11 Pro Education', description: 'Pro + Education features', size: '4.3 GB', arch: 'x64', selected: false },
  { index: 9, name: 'Windows 11 Pro for Workstations', description: 'High-perf hardware', size: '4.3 GB', arch: 'x64', selected: false },
  { index: 10, name: 'Windows 11 Enterprise', description: 'Volume license edition', size: '4.4 GB', arch: 'x64', selected: false },
  { index: 11, name: 'Windows 11 Enterprise N', description: 'Enterprise, no media', size: '4.2 GB', arch: 'x64', selected: false },
];

interface WimEditorProps {
  isMounted: boolean;
}

const WimEditor = ({ isMounted }: WimEditorProps) => {
  const [editions, setEditions] = useState<WimEdition[]>(MOCK_EDITIONS);
  const [defaultIndex, setDefaultIndex] = useState(6);

  const toggleEdition = (index: number) => {
    setEditions(prev => prev.map(e => e.index === index ? { ...e, selected: !e.selected } : e));
  };

  const selectedEditions = editions.filter(e => e.selected);
  const removedEditions = editions.filter(e => !e.selected);

  return (
    <div className={`rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 ${!isMounted ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-mono font-medium text-foreground">WIM Edition Manager</h3>
          <Badge variant="outline" className="text-[10px] font-mono">
            {selectedEditions.length}/{editions.length} kept
          </Badge>
        </div>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" className="text-xs font-mono h-7" onClick={() => setEditions(prev => prev.map(e => ({ ...e, selected: true })))}>
                Select All
              </Button>
            </TooltipTrigger>
            <TooltipContent>Keep all editions in WIM</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" className="text-xs font-mono h-7" onClick={() => setEditions(prev => prev.map((e, i) => ({ ...e, selected: i === 0 })))}>
                Keep First Only
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove all except index 1</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Edition List */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
        {editions.map(edition => (
          <div
            key={edition.index}
            className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer group ${
              edition.selected
                ? 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                : 'border-border/50 bg-muted/20 opacity-60 hover:opacity-80'
            }`}
            onClick={() => toggleEdition(edition.index)}
          >
            <Checkbox
              checked={edition.selected}
              onCheckedChange={() => toggleEdition(edition.index)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">#{edition.index}</span>
                <span className="text-sm font-medium text-foreground truncate">{edition.name}</span>
                {edition.index === defaultIndex && (
                  <Badge className="text-[9px] font-mono bg-primary/20 text-primary border-primary/30 h-4">DEFAULT</Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{edition.description}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] font-mono text-muted-foreground">{edition.size}</span>
              <Badge variant="outline" className="ml-2 text-[9px] font-mono">{edition.arch}</Badge>
            </div>
            {edition.selected && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); setDefaultIndex(edition.index); }}
              >
                <Check className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* DISM Preview */}
      {removedEditions.length > 0 && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-mono text-muted-foreground">DISM Commands Preview</span>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-muted-foreground max-h-32 overflow-y-auto">
            <p className="text-primary">DISM /Set-Edition /Name:"{editions.find(e => e.index === defaultIndex)?.name}" /Index:{defaultIndex}</p>
            {removedEditions.map(e => (
              <p key={e.index}>
                <span className="text-destructive">DISM /Delete-Image /ImageFile:install.wim /Index:{e.index}</span>
                <span className="text-muted-foreground/50"> # {e.name}</span>
              </p>
            ))}
            <p className="text-warning">DISM /Export-Image /SourceImageFile:install.wim /SourceIndex:1 /DestinationImageFile:install_clean.wim</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WimEditor;
