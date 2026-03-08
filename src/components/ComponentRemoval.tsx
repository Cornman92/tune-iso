import { useState, useMemo } from 'react';
import { Trash2, Search, Shield, AlertTriangle, XOctagon, Package, CheckSquare, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

type RiskLevel = 'safe' | 'moderate' | 'aggressive';

interface ComponentEntry {
  id: string;
  name: string;
  description: string;
  size: string;
  risk: RiskLevel;
  category: string;
  packageName?: string;
}

const COMPONENTS: ComponentEntry[] = [
  // Safe removals
  { id: 'cortana', name: 'Cortana', description: 'Voice assistant', size: '~80 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.549981C3F5F10' },
  { id: 'bing-weather', name: 'Weather', description: 'MSN Weather app', size: '~15 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.BingWeather' },
  { id: 'bing-news', name: 'News', description: 'MSN News app', size: '~15 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.BingNews' },
  { id: 'bing-finance', name: 'Finance', description: 'MSN Money app', size: '~12 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.BingFinance' },
  { id: 'bing-sports', name: 'Sports', description: 'MSN Sports app', size: '~12 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.BingSports' },
  { id: 'skype', name: 'Skype', description: 'Skype communication app', size: '~90 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.SkypeApp' },
  { id: 'solitaire', name: 'Solitaire Collection', description: 'Microsoft Solitaire & Casual Games', size: '~200 MB', risk: 'safe', category: 'Games', packageName: 'Microsoft.MicrosoftSolitaireCollection' },
  { id: 'xbox-app', name: 'Xbox App', description: 'Xbox companion app', size: '~60 MB', risk: 'safe', category: 'Xbox', packageName: 'Microsoft.GamingApp' },
  { id: 'xbox-bar', name: 'Xbox Game Bar', description: 'In-game overlay and recording', size: '~45 MB', risk: 'safe', category: 'Xbox', packageName: 'Microsoft.XboxGamingOverlay' },
  { id: 'xbox-tcui', name: 'Xbox TCUI', description: 'Xbox text/voice communication UI', size: '~5 MB', risk: 'safe', category: 'Xbox', packageName: 'Microsoft.Xbox.TCUI' },
  { id: 'xbox-identity', name: 'Xbox Identity Provider', description: 'Xbox Live identity', size: '~5 MB', risk: 'safe', category: 'Xbox', packageName: 'Microsoft.XboxIdentityProvider' },
  { id: 'xbox-speech', name: 'Xbox Speech to Text', description: 'Voice transcription for Xbox', size: '~10 MB', risk: 'safe', category: 'Xbox', packageName: 'Microsoft.XboxSpeechToTextOverlay' },
  { id: 'gethelp', name: 'Get Help', description: 'Microsoft support app', size: '~10 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.GetHelp' },
  { id: 'getstarted', name: 'Tips', description: 'Windows Tips app', size: '~10 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.Getstarted' },
  { id: 'feedback', name: 'Feedback Hub', description: 'Send feedback to Microsoft', size: '~25 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.WindowsFeedbackHub' },
  { id: 'maps', name: 'Maps', description: 'Windows Maps app', size: '~30 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.WindowsMaps' },
  { id: 'mixedreality', name: 'Mixed Reality Portal', description: 'VR headset portal', size: '~100 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.MixedReality.Portal' },
  { id: 'people', name: 'People', description: 'Contact management app', size: '~10 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.People' },
  { id: 'onenote', name: 'OneNote', description: 'Note-taking app (UWP version)', size: '~120 MB', risk: 'safe', category: 'Office', packageName: 'Microsoft.Office.OneNote' },
  { id: 'teams', name: 'Microsoft Teams', description: 'Teams chat client (new)', size: '~150 MB', risk: 'safe', category: 'Apps', packageName: 'MicrosoftTeams' },
  { id: 'clipchamp', name: 'Clipchamp', description: 'Video editor', size: '~100 MB', risk: 'safe', category: 'Apps', packageName: 'Clipchamp.Clipchamp' },
  { id: 'todo', name: 'Microsoft To Do', description: 'Task management app', size: '~15 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.Todos' },
  { id: 'powerautomate', name: 'Power Automate', description: 'Desktop automation', size: '~80 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.PowerAutomateDesktop' },
  // Moderate
  { id: 'onedrive', name: 'OneDrive', description: 'Cloud storage integration — some apps depend on it', size: '~40 MB', risk: 'moderate', category: 'Cloud' },
  { id: 'edge', name: 'Microsoft Edge', description: 'Default browser — removing may break some web links', size: '~350 MB', risk: 'moderate', category: 'Browser' },
  { id: 'widgets', name: 'Widgets', description: 'Taskbar Widgets panel (Win 11)', size: '~50 MB', risk: 'moderate', category: 'UI', packageName: 'MicrosoftWindows.Client.WebExperience' },
  { id: 'paint3d', name: 'Paint 3D', description: '3D painting app', size: '~120 MB', risk: 'moderate', category: 'Apps', packageName: 'Microsoft.MSPaint' },
  { id: 'your-phone', name: 'Phone Link', description: 'Connect phone to PC', size: '~30 MB', risk: 'moderate', category: 'Apps', packageName: 'Microsoft.YourPhone' },
  { id: 'media-player', name: 'Media Player', description: 'Windows Media Player — some codecs may stop working', size: '~40 MB', risk: 'moderate', category: 'Media' },
  { id: 'store', name: 'Microsoft Store', description: 'App store — cannot install UWP apps without it', size: '~35 MB', risk: 'moderate', category: 'System', packageName: 'Microsoft.WindowsStore' },
  // Aggressive
  { id: 'defender', name: 'Windows Defender', description: 'Built-in antivirus — system will be unprotected', size: '~200 MB', risk: 'aggressive', category: 'Security' },
  { id: 'windows-security', name: 'Windows Security', description: 'Security dashboard UI', size: '~30 MB', risk: 'aggressive', category: 'Security', packageName: 'Microsoft.SecHealthUI' },
  { id: 'search', name: 'Windows Search', description: 'Taskbar search and indexing — affects Start menu search', size: '~80 MB', risk: 'aggressive', category: 'System' },
  { id: 'recall', name: 'Windows Recall', description: 'AI timeline feature (Win 11 24H2+)', size: '~150 MB', risk: 'aggressive', category: 'AI', packageName: 'MicrosoftWindows.AI.Copilot.Provider' },
  { id: 'copilot', name: 'Copilot', description: 'Windows AI Copilot', size: '~20 MB', risk: 'aggressive', category: 'AI', packageName: 'Microsoft.Copilot' },
];

const riskConfig: Record<RiskLevel, { color: string; badgeColor: string; icon: React.ElementType; label: string }> = {
  safe: { color: 'text-success', badgeColor: 'border-success/30 text-success', icon: Shield, label: 'Safe' },
  moderate: { color: 'text-warning', badgeColor: 'border-warning/30 text-warning', icon: AlertTriangle, label: 'Moderate' },
  aggressive: { color: 'text-destructive', badgeColor: 'border-destructive/30 text-destructive', icon: XOctagon, label: 'Aggressive' },
};

interface ComponentRemovalProps {
  isMounted: boolean;
}

const ComponentRemoval = ({ isMounted }: ComponentRemovalProps) => {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectByRisk = (risk: RiskLevel) => {
    setSelected(prev => {
      const next = new Set(prev);
      COMPONENTS.filter(c => c.risk === risk).forEach(c => next.add(c.id));
      return next;
    });
  };

  const clearAll = () => setSelected(new Set());

  const filtered = useMemo(() => {
    return COMPONENTS.filter(c => {
      if (riskFilter !== 'all' && c.risk !== riskFilter) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, riskFilter]);

  const categories = useMemo(() => {
    const cats = new Map<string, ComponentEntry[]>();
    filtered.forEach(c => {
      if (!cats.has(c.category)) cats.set(c.category, []);
      cats.get(c.category)!.push(c);
    });
    return cats;
  }, [filtered]);

  const totalSize = useMemo(() => {
    let mb = 0;
    COMPONENTS.filter(c => selected.has(c.id)).forEach(c => {
      const match = c.size.match(/(\d+)/);
      if (match) mb += parseInt(match[1]);
    });
    return mb;
  }, [selected]);

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden ${!isMounted ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Component Removal</h3>
            {selected.size > 0 && (
              <Badge variant="destructive" className="text-xs">{selected.size} selected • ~{totalSize} MB</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-7">Clear All</Button>
        </div>

        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search components..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'safe', 'moderate', 'aggressive'] as const).map(risk => (
            <Button key={risk} variant={riskFilter === risk ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setRiskFilter(risk)}>
              {risk === 'all' ? 'All' : riskConfig[risk].label}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-3">
        <div className="flex gap-2 mb-3">
          {(['safe', 'moderate', 'aggressive'] as RiskLevel[]).map(risk => (
            <Button key={risk} variant="outline" size="sm" className="h-7 text-xs" onClick={() => selectByRisk(risk)}>
              <Trash2 className="w-3 h-3 mr-1" /> Remove all {riskConfig[risk].label}
            </Button>
          ))}
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {[...categories.entries()].map(([cat, components]) => (
            <div key={cat}>
              <h4 className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-2">{cat}</h4>
              <div className="space-y-1">
                {components.map(comp => {
                  const isSelected = selected.has(comp.id);
                  const cfg = riskConfig[comp.risk];
                  const RiskIcon = cfg.icon;
                  return (
                    <div
                      key={comp.id}
                      onClick={() => toggle(comp.id)}
                      className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/30 border-border hover:bg-muted/50'}`}
                    >
                      <Checkbox checked={isSelected} className="pointer-events-none" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${isSelected ? 'text-destructive line-through' : 'text-foreground'}`}>{comp.name}</span>
                          <RiskIcon className={`w-3 h-3 shrink-0 ${cfg.color}`} />
                          <span className="text-[10px] text-muted-foreground">{comp.size}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{comp.description}</p>
                      </div>
                      <Badge variant="outline" className={`text-[9px] shrink-0 ${cfg.badgeColor}`}>{cfg.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="p-3 border-t border-border bg-muted/20">
          <p className="text-[11px] font-mono text-muted-foreground mb-2">DISM Commands Preview:</p>
          <div className="bg-background rounded p-2 max-h-32 overflow-y-auto">
            {COMPONENTS.filter(c => selected.has(c.id) && c.packageName).map(comp => (
              <p key={comp.id} className="text-[10px] font-mono text-muted-foreground">
                <span className="text-primary">DISM</span> /Remove-ProvisionedAppxPackage /PackageName:{comp.packageName}
              </p>
            ))}
            {COMPONENTS.filter(c => selected.has(c.id) && !c.packageName).map(comp => (
              <p key={comp.id} className="text-[10px] font-mono text-warning">
                # {comp.name} requires custom removal script
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentRemoval;
