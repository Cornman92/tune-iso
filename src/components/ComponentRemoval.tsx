import { useState, useMemo, useEffect, MutableRefObject } from 'react';
import { Trash2, Search, Shield, AlertTriangle, XOctagon, Package, Sparkles } from 'lucide-react';
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
  // Apps
  { id: 'cortana', name: 'Cortana', description: 'Voice assistant', size: '~80 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.549981C3F5F10' },
  { id: 'bing-weather', name: 'Weather', description: 'MSN Weather app', size: '~15 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.BingWeather' },
  { id: 'bing-news', name: 'News', description: 'MSN News app', size: '~15 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.BingNews' },
  { id: 'bing-finance', name: 'Finance', description: 'MSN Money app', size: '~12 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.BingFinance' },
  { id: 'bing-sports', name: 'Sports', description: 'MSN Sports app', size: '~12 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.BingSports' },
  { id: 'skype', name: 'Skype', description: 'Skype communication app', size: '~90 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.SkypeApp' },
  { id: 'gethelp', name: 'Get Help', description: 'Microsoft support app', size: '~10 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.GetHelp' },
  { id: 'getstarted', name: 'Tips', description: 'Windows Tips app', size: '~10 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.Getstarted' },
  { id: 'feedback', name: 'Feedback Hub', description: 'Send feedback to Microsoft', size: '~25 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.WindowsFeedbackHub' },
  { id: 'maps', name: 'Maps', description: 'Windows Maps app', size: '~30 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.WindowsMaps' },
  { id: 'mixedreality', name: 'Mixed Reality Portal', description: 'VR headset portal', size: '~100 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.MixedReality.Portal' },
  { id: 'people', name: 'People', description: 'Contact management app', size: '~10 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.People' },
  { id: 'teams', name: 'Microsoft Teams', description: 'Teams chat client (new)', size: '~150 MB', risk: 'safe', category: 'Apps', packageName: 'MicrosoftTeams' },
  { id: 'clipchamp', name: 'Clipchamp', description: 'Video editor', size: '~100 MB', risk: 'safe', category: 'Apps', packageName: 'Clipchamp.Clipchamp' },
  { id: 'todo', name: 'Microsoft To Do', description: 'Task management app', size: '~15 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.Todos' },
  { id: 'powerautomate', name: 'Power Automate', description: 'Desktop automation', size: '~80 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.PowerAutomateDesktop' },
  { id: 'quickassist', name: 'Quick Assist', description: 'Remote assistance tool', size: '~15 MB', risk: 'safe', category: 'Apps', packageName: 'MicrosoftCorporationII.QuickAssist' },
  { id: 'journal', name: 'Journal', description: 'Microsoft Journal note-taking', size: '~30 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.MicrosoftJournal' },
  { id: 'family', name: 'Family Safety', description: 'Microsoft Family features', size: '~20 MB', risk: 'safe', category: 'Apps', packageName: 'MicrosoftCorporationII.MicrosoftFamily' },
  { id: 'devhome', name: 'Dev Home', description: 'Developer dashboard (Preview)', size: '~40 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.Windows.DevHome' },
  { id: 'outlook-new', name: 'Outlook (New)', description: 'New Outlook mail client', size: '~60 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.OutlookForWindows' },
  { id: 'linkedin', name: 'LinkedIn', description: 'LinkedIn integration app', size: '~15 MB', risk: 'safe', category: 'Apps', packageName: 'LinkedIn.LinkedIn' },
  { id: 'sticky-notes', name: 'Sticky Notes', description: 'Desktop sticky notes', size: '~15 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.MicrosoftStickyNotes' },
  { id: 'alarms', name: 'Alarms & Clock', description: 'Clock, timer, and alarms', size: '~10 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.WindowsAlarms' },
  { id: 'calculator', name: 'Calculator', description: 'Windows Calculator app', size: '~10 MB', risk: 'moderate', category: 'Apps', packageName: 'Microsoft.WindowsCalculator' },
  { id: 'camera', name: 'Camera', description: 'Windows Camera app', size: '~15 MB', risk: 'moderate', category: 'Apps', packageName: 'Microsoft.WindowsCamera' },
  { id: 'soundrecorder', name: 'Sound Recorder', description: 'Voice recorder app', size: '~10 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.WindowsSoundRecorder' },
  { id: 'photos', name: 'Photos', description: 'Photo viewer & editor — some features depend on it', size: '~80 MB', risk: 'moderate', category: 'Apps', packageName: 'Microsoft.Windows.Photos' },
  { id: 'snip-sketch', name: 'Snipping Tool', description: 'Screenshot & screen capture', size: '~20 MB', risk: 'moderate', category: 'Apps', packageName: 'Microsoft.ScreenSketch' },
  { id: 'paint3d', name: 'Paint 3D', description: '3D painting app', size: '~120 MB', risk: 'moderate', category: 'Apps', packageName: 'Microsoft.MSPaint' },
  { id: 'your-phone', name: 'Phone Link', description: 'Connect phone to PC', size: '~30 MB', risk: 'moderate', category: 'Apps', packageName: 'Microsoft.YourPhone' },
  { id: 'whiteboard', name: 'Microsoft Whiteboard', description: 'Digital whiteboard app', size: '~25 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.Whiteboard' },
  { id: 'mixed-reality-viewer', name: '3D Viewer', description: '3D model viewer', size: '~60 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.Microsoft3DViewer' },
  { id: 'winget', name: 'Winget (App Installer)', description: 'Package manager CLI — needed for installs', size: '~10 MB', risk: 'moderate', category: 'Apps', packageName: 'Microsoft.DesktopAppInstaller' },
  { id: 'web-media-ext', name: 'Web Media Extensions', description: 'OGG Vorbis & Theora codecs', size: '~5 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.WebMediaExtensions' },
  { id: 'heif-ext', name: 'HEIF Image Extensions', description: 'HEIC photo format support', size: '~5 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.HEIFImageExtension' },
  { id: 'webp-ext', name: 'WebP Image Extensions', description: 'WebP image format', size: '~3 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.WebpImageExtension' },
  { id: 'raw-ext', name: 'Raw Image Extension', description: 'Camera RAW photo support', size: '~5 MB', risk: 'safe', category: 'Apps', packageName: 'Microsoft.RawImageExtension' },
  { id: 'paint', name: 'Paint', description: 'Classic Windows Paint (new version)', size: '~15 MB', risk: 'moderate', category: 'Apps', packageName: 'Microsoft.Paint' },
  { id: 'notepad-store', name: 'Notepad (Store)', description: 'Modern Notepad from Store', size: '~8 MB', risk: 'moderate', category: 'Apps', packageName: 'Microsoft.WindowsNotepad' },
  { id: 'terminal-store', name: 'Windows Terminal', description: 'Modern terminal emulator', size: '~20 MB', risk: 'moderate', category: 'Apps', packageName: 'Microsoft.WindowsTerminal' },

  // Games
  { id: 'solitaire', name: 'Solitaire Collection', description: 'Microsoft Solitaire & Casual Games', size: '~200 MB', risk: 'safe', category: 'Games', packageName: 'Microsoft.MicrosoftSolitaireCollection' },
  { id: 'candy-crush', name: 'Candy Crush Saga', description: 'Pre-installed game', size: '~100 MB', risk: 'safe', category: 'Games', packageName: 'king.com.CandyCrushSaga' },
  { id: 'candy-crush-friends', name: 'Candy Crush Friends', description: 'Pre-installed game', size: '~100 MB', risk: 'safe', category: 'Games', packageName: 'king.com.CandyCrushFriends' },
  { id: 'disney-magic', name: 'Disney Magic Kingdoms', description: 'Pre-installed game', size: '~80 MB', risk: 'safe', category: 'Games', packageName: 'Disney.37853FC22B2CE' },
  { id: 'farmville', name: 'FarmVille 2', description: 'Pre-installed game', size: '~80 MB', risk: 'safe', category: 'Games', packageName: 'Zynga.FarmVille2CountryEscape' },
  { id: 'bubble-witch', name: 'Bubble Witch 3', description: 'Pre-installed puzzle game', size: '~80 MB', risk: 'safe', category: 'Games', packageName: 'king.com.BubbleWitch3Saga' },
  { id: 'march-empires', name: 'March of Empires', description: 'Pre-installed strategy game', size: '~100 MB', risk: 'safe', category: 'Games', packageName: 'Gameloft.MarchofEmpires' },
  { id: 'hidden-city', name: 'Hidden City', description: 'Pre-installed hidden object game', size: '~100 MB', risk: 'safe', category: 'Games', packageName: 'G5Entertainment.HiddenCity' },
  { id: 'asphalt-legends', name: 'Asphalt Legends', description: 'Pre-installed racing game', size: '~100 MB', risk: 'safe', category: 'Games', packageName: 'Gameloft.AsphaltLegends' },
  { id: 'sudoku', name: 'Microsoft Sudoku', description: 'Pre-installed puzzle game', size: '~40 MB', risk: 'safe', category: 'Games', packageName: 'Microsoft.MicrosoftSudoku' },
  { id: 'mahjong', name: 'Microsoft Mahjong', description: 'Pre-installed tile game', size: '~60 MB', risk: 'safe', category: 'Games', packageName: 'Microsoft.MicrosoftMahjong' },
  { id: 'jigsaw', name: 'Microsoft Jigsaw', description: 'Pre-installed jigsaw puzzle', size: '~40 MB', risk: 'safe', category: 'Games', packageName: 'Microsoft.MicrosoftJigsaw' },

  // Xbox
  { id: 'xbox-app', name: 'Xbox App', description: 'Xbox companion app', size: '~60 MB', risk: 'safe', category: 'Xbox', packageName: 'Microsoft.GamingApp' },
  { id: 'xbox-bar', name: 'Xbox Game Bar', description: 'In-game overlay and recording', size: '~45 MB', risk: 'safe', category: 'Xbox', packageName: 'Microsoft.XboxGamingOverlay' },
  { id: 'xbox-tcui', name: 'Xbox TCUI', description: 'Xbox text/voice communication UI', size: '~5 MB', risk: 'safe', category: 'Xbox', packageName: 'Microsoft.Xbox.TCUI' },
  { id: 'xbox-identity', name: 'Xbox Identity Provider', description: 'Xbox Live identity', size: '~5 MB', risk: 'safe', category: 'Xbox', packageName: 'Microsoft.XboxIdentityProvider' },
  { id: 'xbox-speech', name: 'Xbox Speech to Text', description: 'Voice transcription for Xbox', size: '~10 MB', risk: 'safe', category: 'Xbox', packageName: 'Microsoft.XboxSpeechToTextOverlay' },
  { id: 'xbox-game-callable-ui', name: 'Xbox Game Callable UI', description: 'In-game Xbox UI overlay', size: '~5 MB', risk: 'safe', category: 'Xbox', packageName: 'Microsoft.Xbox.GameCallableUI' },

  // Office
  { id: 'onenote', name: 'OneNote', description: 'Note-taking app (UWP version)', size: '~120 MB', risk: 'safe', category: 'Office', packageName: 'Microsoft.Office.OneNote' },
  { id: 'office-hub', name: 'Office Hub', description: 'Office app launcher', size: '~20 MB', risk: 'safe', category: 'Office', packageName: 'Microsoft.MicrosoftOfficeHub' },
  { id: 'office-sway', name: 'Sway', description: 'Presentation creation app', size: '~15 MB', risk: 'safe', category: 'Office', packageName: 'Microsoft.Office.Sway' },

  // Cloud
  { id: 'onedrive', name: 'OneDrive', description: 'Cloud storage integration — some apps depend on it', size: '~40 MB', risk: 'moderate', category: 'Cloud' },

  // Browser
  { id: 'edge', name: 'Microsoft Edge', description: 'Default browser — removing may break some web links', size: '~350 MB', risk: 'moderate', category: 'Browser' },
  { id: 'edge-webview', name: 'Edge WebView2', description: 'Web rendering runtime — many apps depend on it', size: '~150 MB', risk: 'aggressive', category: 'Browser' },

  // UI
  { id: 'widgets', name: 'Widgets', description: 'Taskbar Widgets panel (Win 11)', size: '~50 MB', risk: 'moderate', category: 'UI', packageName: 'MicrosoftWindows.Client.WebExperience' },
  { id: 'lockscreen-spotlight', name: 'Windows Spotlight', description: 'Lock screen dynamic images', size: '~10 MB', risk: 'safe', category: 'UI', packageName: 'Microsoft.Windows.ContentDeliveryManager' },
  { id: 'start-recommended', name: 'Start Menu Recommendations', description: 'Suggested apps in Start menu', size: '~5 MB', risk: 'safe', category: 'UI' },
  { id: 'snap-layouts', name: 'Snap Layouts', description: 'Window snap arrangement UI', size: '~5 MB', risk: 'moderate', category: 'UI' },

  // Media
  { id: 'media-player', name: 'Media Player', description: 'Windows Media Player — some codecs may stop working', size: '~40 MB', risk: 'moderate', category: 'Media' },
  { id: 'groove-music', name: 'Groove Music', description: 'Legacy music player', size: '~25 MB', risk: 'safe', category: 'Media', packageName: 'Microsoft.ZuneMusic' },
  { id: 'movies-tv', name: 'Movies & TV', description: 'Video player app', size: '~25 MB', risk: 'safe', category: 'Media', packageName: 'Microsoft.ZuneVideo' },
  { id: 'voice-recorder', name: 'Voice Recorder', description: 'Audio recording app', size: '~10 MB', risk: 'safe', category: 'Media', packageName: 'Microsoft.WindowsSoundRecorder' },

  // System
  { id: 'store', name: 'Microsoft Store', description: 'App store — cannot install UWP apps without it', size: '~35 MB', risk: 'moderate', category: 'System', packageName: 'Microsoft.WindowsStore' },
  { id: 'store-purchase', name: 'Store Purchase App', description: 'Store purchase service', size: '~5 MB', risk: 'moderate', category: 'System', packageName: 'Microsoft.StorePurchaseApp' },
  { id: 'app-installer', name: 'App Installer', description: 'Winget & MSIX installer — needed for package management', size: '~10 MB', risk: 'moderate', category: 'System', packageName: 'Microsoft.DesktopAppInstaller' },
  { id: 'store-experience', name: 'Store Experience Host', description: 'Store UI rendering component', size: '~10 MB', risk: 'moderate', category: 'System', packageName: 'Microsoft.StorePurchaseApp' },
  { id: 'xaml-framework', name: 'XAML Framework', description: 'UI framework for UWP/WinUI apps', size: '~30 MB', risk: 'aggressive', category: 'System', packageName: 'Microsoft.UI.Xaml' },
  { id: 'vclibs', name: 'VCLibs', description: 'Visual C++ UWP runtime — apps may break', size: '~5 MB', risk: 'aggressive', category: 'System', packageName: 'Microsoft.VCLibs.140.00' },

  // AI
  { id: 'recall', name: 'Windows Recall', description: 'AI timeline feature (Win 11 24H2+)', size: '~150 MB', risk: 'aggressive', category: 'AI', packageName: 'MicrosoftWindows.AI.Copilot.Provider' },
  { id: 'copilot', name: 'Copilot', description: 'Windows AI Copilot', size: '~20 MB', risk: 'aggressive', category: 'AI', packageName: 'Microsoft.Copilot' },
  { id: 'copilot-runtime', name: 'Copilot Runtime', description: 'AI model runtime services', size: '~200 MB', risk: 'aggressive', category: 'AI', packageName: 'Microsoft.Windows.AI.CopilotRuntime' },
  { id: 'ai-ocr', name: 'AI OCR', description: 'AI-powered text recognition', size: '~50 MB', risk: 'safe', category: 'AI', packageName: 'Microsoft.Windows.AI.OCR' },

  // Telemetry
  { id: 'compat-telemetry', name: 'Compatibility Telemetry', description: 'Compatibility data collection', size: '~20 MB', risk: 'safe', category: 'Telemetry' },
  { id: 'census', name: 'Device Census', description: 'Hardware telemetry reporting', size: '~5 MB', risk: 'safe', category: 'Telemetry' },
  { id: 'diagtrack', name: 'DiagTrack (Telemetry)', description: 'Connected User Experiences collector', size: '~15 MB', risk: 'safe', category: 'Telemetry' },
  { id: 'error-reporting', name: 'Error Reporting', description: 'Windows Error Reporting data', size: '~10 MB', risk: 'safe', category: 'Telemetry' },
  { id: 'customer-experience', name: 'Customer Experience Program', description: 'CEIP data collection', size: '~5 MB', risk: 'safe', category: 'Telemetry' },

  // Security
  { id: 'defender', name: 'Windows Defender', description: 'Built-in antivirus — system will be unprotected', size: '~200 MB', risk: 'aggressive', category: 'Security' },
  { id: 'windows-security', name: 'Windows Security', description: 'Security dashboard UI', size: '~30 MB', risk: 'aggressive', category: 'Security', packageName: 'Microsoft.SecHealthUI' },
  { id: 'search', name: 'Windows Search', description: 'Taskbar search and indexing — affects Start menu search', size: '~80 MB', risk: 'aggressive', category: 'System' },
  { id: 'smartscreen', name: 'SmartScreen', description: 'App reputation filter — removes download warnings', size: '~10 MB', risk: 'aggressive', category: 'Security' },
];

const riskConfig: Record<RiskLevel, { color: string; badgeColor: string; icon: React.ElementType; label: string }> = {
  safe: { color: 'text-success', badgeColor: 'border-success/30 text-success', icon: Shield, label: 'Safe' },
  moderate: { color: 'text-warning', badgeColor: 'border-warning/30 text-warning', icon: AlertTriangle, label: 'Moderate' },
  aggressive: { color: 'text-destructive', badgeColor: 'border-destructive/30 text-destructive', icon: XOctagon, label: 'Aggressive' },
};

interface ComponentPreset {
  id: string;
  name: string;
  description: string;
  components: string[];
}

const COMPONENT_PRESETS: ComponentPreset[] = [
  {
    id: 'gaming',
    name: '🎮 Gaming PC',
    description: 'Remove bloatware but keep Xbox Game Bar for captures',
    components: ['cortana', 'bing-weather', 'bing-news', 'bing-finance', 'bing-sports', 'skype', 'gethelp', 'getstarted', 'feedback', 'maps', 'mixedreality', 'people', 'onenote', 'teams', 'clipchamp', 'todo', 'powerautomate', 'your-phone', 'widgets', 'copilot', 'recall'],
  },
  {
    id: 'minimal',
    name: '🔧 Minimal Install',
    description: 'Strip everything possible for a bare-bones OS',
    components: COMPONENTS.filter(c => c.risk === 'safe' || c.risk === 'moderate').map(c => c.id),
  },
  {
    id: 'privacy',
    name: '🔒 Privacy Focused',
    description: 'Remove telemetry, AI, cloud, and tracking components',
    components: ['cortana', 'feedback', 'onedrive', 'teams', 'copilot', 'recall', 'widgets', 'your-phone', 'bing-weather', 'bing-news', 'bing-finance', 'bing-sports', 'maps', 'people', 'clipchamp'],
  },
  {
    id: 'workstation',
    name: '💼 Workstation',
    description: 'Remove consumer/gaming apps, keep productivity tools',
    components: ['solitaire', 'xbox-app', 'xbox-bar', 'xbox-tcui', 'xbox-identity', 'xbox-speech', 'cortana', 'bing-sports', 'bing-finance', 'mixedreality', 'skype', 'clipchamp', 'recall', 'copilot'],
  },
];

interface ComponentRemovalProps {
  isMounted: boolean;
  onCountChange?: (count: number) => void;
  exportRef?: MutableRefObject<() => string[]>;
}

const ComponentRemoval = ({ isMounted, onCountChange, exportRef }: ComponentRemovalProps) => {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    onCountChange?.(selected.size);
  }, [selected.size, onCountChange]);

  useEffect(() => {
    if (exportRef) exportRef.current = () => [...selected];
  }, [selected, exportRef]);

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

  const applyPreset = (preset: ComponentPreset) => {
    setSelected(new Set(preset.components));
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

        {/* Presets */}
        <div className="mb-3">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Quick Presets
          </p>
          <div className="grid grid-cols-2 gap-2">
            {COMPONENT_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="text-left p-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all group"
              >
                <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{preset.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{preset.description}</p>
                <p className="text-[10px] font-mono text-destructive mt-1">{preset.components.length} components</p>
              </button>
            ))}
          </div>
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
