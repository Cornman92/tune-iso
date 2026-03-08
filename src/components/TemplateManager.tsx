import { useState, useCallback } from 'react';
import { BookmarkPlus, Trash2, Check, LayoutTemplate, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { ProjectData } from '@/components/ProjectManager';

interface SavedTemplate {
  id: string;
  name: string;
  savedAt: string;
  data: ProjectData;
}

const STORAGE_KEY = 'iso-forge-templates';

function loadTemplates(): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTemplates(templates: SavedTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

interface TemplateManagerProps {
  onExport: () => ProjectData;
  onImport: (data: ProjectData) => void;
}

const TemplateManager = ({ onExport, onImport }: TemplateManagerProps) => {
  const [templates, setTemplates] = useState<SavedTemplate[]>(loadTemplates);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [lastLoaded, setLastLoaded] = useState<string | null>(null);

  const handleSave = useCallback(() => {
    if (!templateName.trim()) return;
    const data = onExport();
    const template: SavedTemplate = {
      id: `tmpl-${Date.now()}`,
      name: templateName.trim(),
      savedAt: new Date().toISOString(),
      data,
    };
    const updated = [template, ...templates];
    setTemplates(updated);
    saveTemplates(updated);
    setTemplateName('');
    setShowSaveDialog(false);
    toast.success(`Template "${template.name}" saved`);
  }, [templateName, templates, onExport]);

  const handleLoad = useCallback((template: SavedTemplate) => {
    onImport(template.data);
    setLastLoaded(template.id);
    toast.success(`Loaded template: ${template.name}`);
    setTimeout(() => setLastLoaded(null), 2000);
  }, [onImport]);

  const handleDelete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
    toast.success('Template deleted');
  }, [templates]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="font-mono text-xs h-8 gap-1.5">
            <LayoutTemplate className="w-3.5 h-3.5" />
            Templates
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem onClick={() => setShowSaveDialog(true)} className="gap-2 font-mono text-xs">
            <BookmarkPlus className="w-3.5 h-3.5 text-primary" />
            Save Current as Template
          </DropdownMenuItem>
          {templates.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] font-mono text-muted-foreground uppercase">
                Saved Templates ({templates.length})
              </DropdownMenuLabel>
              {templates.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => handleLoad(t)}
                  className="flex items-center justify-between gap-2 font-mono text-xs group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {lastLoaded === t.id ? (
                        <Check className="w-3 h-3 text-success shrink-0" />
                      ) : (
                        <LayoutTemplate className="w-3 h-3 text-muted-foreground shrink-0" />
                      )}
                      <span className="truncate">{t.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground ml-4.5">
                      {new Date(t.savedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={(e) => handleDelete(t.id, e)}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </DropdownMenuItem>
              ))}
            </>
          )}
          {templates.length === 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-3 text-center">
                <p className="text-xs text-muted-foreground font-mono">No templates saved yet</p>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4 text-primary" />
              Save as Template
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name..."
              className="font-mono text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground mt-2 font-mono">
              Saves all customizations, drivers, registry, services, components, updates, unattend settings, and build step order.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowSaveDialog(false)} className="font-mono text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!templateName.trim()} className="font-mono text-xs">
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateManager;
