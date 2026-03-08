import { useState, useEffect, useMemo } from 'react';
import { Package, Wrench, Zap, Palette, ChevronDown, ChevronRight, Plus, Check, Search, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface CustomizationItem {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
}

interface CustomizationPanelProps {
  isMounted: boolean;
  onCountChange?: (count: number) => void;
}

const defaultPrograms: CustomizationItem[] = [
  { id: 'chrome', name: 'Google Chrome', description: 'Web browser', enabled: false, category: 'browsers' },
  { id: 'firefox', name: 'Mozilla Firefox', description: 'Web browser', enabled: false, category: 'browsers' },
  { id: 'vscode', name: 'VS Code', description: 'Code editor', enabled: false, category: 'development' },
  { id: '7zip', name: '7-Zip', description: 'File archiver', enabled: false, category: 'utilities' },
  { id: 'vlc', name: 'VLC Player', description: 'Media player', enabled: false, category: 'media' },
  { id: 'notepad++', name: 'Notepad++', description: 'Text editor', enabled: false, category: 'development' },
];

const defaultTweaks: CustomizationItem[] = [
  { id: 'disable-cortana', name: 'Disable Cortana', description: 'Remove Cortana integration', enabled: false, category: 'privacy' },
  { id: 'disable-telemetry', name: 'Disable Telemetry', description: 'Stop data collection', enabled: false, category: 'privacy' },
  { id: 'disable-onedrive', name: 'Remove OneDrive', description: 'Uninstall OneDrive', enabled: false, category: 'bloatware' },
  { id: 'disable-xbox', name: 'Remove Xbox App', description: 'Uninstall Xbox services', enabled: false, category: 'bloatware' },
  { id: 'classic-context', name: 'Classic Context Menu', description: 'Restore Win10 context menu', enabled: false, category: 'ui' },
  { id: 'show-extensions', name: 'Show File Extensions', description: 'Always show file extensions', enabled: false, category: 'ui' },
];

const defaultOptimizations: CustomizationItem[] = [
  { id: 'disable-animations', name: 'Reduce Animations', description: 'Faster UI transitions', enabled: false, category: 'performance' },
  { id: 'gaming-mode', name: 'Gaming Optimizations', description: 'Optimize for gaming', enabled: false, category: 'performance' },
  { id: 'ssd-optimize', name: 'SSD Optimization', description: 'TRIM & disable defrag', enabled: false, category: 'storage' },
  { id: 'power-plan', name: 'High Performance Plan', description: 'Maximum performance power plan', enabled: false, category: 'power' },
  { id: 'network-optimize', name: 'Network Tweaks', description: 'Optimize network settings', enabled: false, category: 'network' },
  { id: 'startup-optimize', name: 'Fast Startup', description: 'Optimize boot sequence', enabled: false, category: 'performance' },
];

const categories = [
  { id: 'programs', label: 'Programs', icon: Package, color: 'text-primary' },
  { id: 'tweaks', label: 'Tweaks', icon: Wrench, color: 'text-warning' },
  { id: 'optimizations', label: 'Optimizations', icon: Zap, color: 'text-success' },
];

const CustomizationPanel = ({ isMounted, onCountChange }: CustomizationPanelProps) => {
  const [activeTab, setActiveTab] = useState('programs');
  const [programs, setPrograms] = useState(defaultPrograms);
  const [tweaks, setTweaks] = useState(defaultTweaks);
  const [optimizations, setOptimizations] = useState(defaultOptimizations);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['browsers', 'privacy', 'performance']);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (id: string, type: 'programs' | 'tweaks' | 'optimizations') => {
    const setter = type === 'programs' ? setPrograms : type === 'tweaks' ? setTweaks : setOptimizations;
    const items = type === 'programs' ? programs : type === 'tweaks' ? tweaks : optimizations;
    
    setter(items.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getItems = () => {
    switch (activeTab) {
      case 'programs': return programs;
      case 'tweaks': return tweaks;
      case 'optimizations': return optimizations;
      default: return [];
    }
  };

  const getGroupedItems = () => {
    const items = getItems();
    const query = searchQuery.toLowerCase().trim();
    const filtered = query
      ? items.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        )
      : items;
    return filtered.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, CustomizationItem[]>);
  };

  const enabledCount = [...programs, ...tweaks, ...optimizations].filter(i => i.enabled).length;

  useEffect(() => {
    onCountChange?.(enabledCount);
  }, [enabledCount, onCountChange]);

  if (!isMounted) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Mount an ISO to customize</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-slide-in">
      {/* Tab Header */}
      <div className="flex border-b border-border">
        {categories.map(cat => {
          const Icon = cat.icon;
          const count = (cat.id === 'programs' ? programs : cat.id === 'tweaks' ? tweaks : optimizations)
            .filter(i => i.enabled).length;
          
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`
                flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all
                ${activeTab === cat.id 
                  ? 'bg-secondary border-b-2 border-primary' 
                  : 'hover:bg-muted/50'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${activeTab === cat.id ? cat.color : 'text-muted-foreground'}`} />
              <span className={`font-medium ${activeTab === cat.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {cat.label}
              </span>
              {count > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-primary/20 text-primary">
                  {count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customizations..."
            className="pl-9 pr-8 h-9 font-mono text-sm bg-muted/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {Object.entries(getGroupedItems()).map(([category, items]) => (
          <div key={category} className="mb-4">
            <button
              onClick={() => toggleCategory(category)}
              className="flex items-center gap-2 mb-2 w-full text-left group"
            >
              {expandedCategories.includes(category) ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                {category}
              </span>
              <div className="flex-1 h-px bg-border" />
            </button>
            
            {expandedCategories.includes(category) && (
              <div className="space-y-2 ml-6">
                {items.map(item => (
                  <div
                    key={item.id}
                    className={`
                      flex items-center justify-between p-3 rounded-lg transition-all
                      ${item.enabled 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'bg-muted/30 hover:bg-muted/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${item.enabled ? 'bg-primary/20' : 'bg-muted'}
                      `}>
                        {item.enabled ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={item.enabled}
                      onCheckedChange={() => toggleItem(item.id, activeTab as 'programs' | 'tweaks' | 'optimizations')}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-mono">
            {enabledCount} customization{enabledCount !== 1 ? 's' : ''} selected
          </p>
          <Button variant="outline" size="sm" className="font-mono">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;
