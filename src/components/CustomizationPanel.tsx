import { useState, useEffect, MutableRefObject } from 'react';
import { Package, Wrench, Zap, ChevronDown, ChevronRight, Plus, Check, Search, X, Shield, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import PresetManager from '@/components/PresetManager';
import {
  CustomizationItem,
  Preset,
  defaultPrograms,
  defaultTweaks,
  defaultOptimizations,
} from '@/data/customizations';

interface CustomizationPanelProps {
  isMounted: boolean;
  onCountChange?: (count: number) => void;
  exportRef?: MutableRefObject<() => { programs: string[]; tweaks: string[]; optimizations: string[] }>;
  importRef?: MutableRefObject<(data: { programs: string[]; tweaks: string[]; optimizations: string[] }) => void>;
}

const categories = [
  { id: 'programs', label: 'Programs', icon: Package, color: 'text-primary' },
  { id: 'tweaks', label: 'Tweaks', icon: Wrench, color: 'text-warning' },
  { id: 'optimizations', label: 'Optimizations', icon: Zap, color: 'text-success' },
];

const riskColors = {
  safe: 'text-success',
  moderate: 'text-warning',
  aggressive: 'text-destructive',
};

const riskIcons = {
  safe: Shield,
  moderate: AlertTriangle,
  aggressive: AlertTriangle,
};

const CustomizationPanel = ({ isMounted, onCountChange, exportRef, importRef }: CustomizationPanelProps) => {
  const [activeTab, setActiveTab] = useState('programs');
  const [programs, setPrograms] = useState(defaultPrograms);
  const [tweaks, setTweaks] = useState(defaultTweaks);
  const [optimizations, setOptimizations] = useState(defaultOptimizations);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    if (exportRef) exportRef.current = () => ({
      programs: programs.filter(p => p.enabled).map(p => p.id),
      tweaks: tweaks.filter(t => t.enabled).map(t => t.id),
      optimizations: optimizations.filter(o => o.enabled).map(o => o.id),
    });
  }, [programs, tweaks, optimizations, exportRef]);

  useEffect(() => {
    if (importRef) importRef.current = (data) => {
      setPrograms(prev => prev.map(p => ({ ...p, enabled: data.programs.includes(p.id) })));
      setTweaks(prev => prev.map(t => ({ ...t, enabled: data.tweaks.includes(t.id) })));
      setOptimizations(prev => prev.map(o => ({ ...o, enabled: data.optimizations.includes(o.id) })));
    };
  }, [importRef]);

  const toggleItem = (id: string, type: 'programs' | 'tweaks' | 'optimizations') => {
    const setter = type === 'programs' ? setPrograms : type === 'tweaks' ? setTweaks : setOptimizations;
    const items = type === 'programs' ? programs : type === 'tweaks' ? tweaks : optimizations;
    setter(items.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleAllInCategory = (category: string, type: 'programs' | 'tweaks' | 'optimizations') => {
    const setter = type === 'programs' ? setPrograms : type === 'tweaks' ? setTweaks : setOptimizations;
    const items = type === 'programs' ? programs : type === 'tweaks' ? tweaks : optimizations;
    const categoryItems = items.filter(i => i.category === category);
    const allEnabled = categoryItems.every(i => i.enabled);
    setter(items.map(item => item.category === category ? { ...item, enabled: !allEnabled } : item));
  };

  const getItems = () => {
    switch (activeTab) {
      case 'programs': return programs;
      case 'tweaks': return tweaks;
      case 'optimizations': return optimizations;
      default: return [];
    }
  };

  const isGlobalSearch = searchQuery.trim().length > 0;

  const getGroupedItems = () => {
    const query = searchQuery.toLowerCase().trim();
    // When searching, search across ALL tabs; otherwise show active tab only
    const items = isGlobalSearch
      ? [...programs, ...tweaks, ...optimizations]
      : getItems();
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

  const getItemType = (itemId: string): 'programs' | 'tweaks' | 'optimizations' => {
    if (programs.some(p => p.id === itemId)) return 'programs';
    if (tweaks.some(t => t.id === itemId)) return 'tweaks';
    return 'optimizations';
  };

  const enabledCount = [...programs, ...tweaks, ...optimizations].filter(i => i.enabled).length;

  useEffect(() => {
    onCountChange?.(enabledCount);
  }, [enabledCount, onCountChange]);

  const handleApplyPreset = (preset: Preset) => {
    setPrograms(prev => prev.map(p => ({ ...p, enabled: preset.programs.includes(p.id) })));
    setTweaks(prev => prev.map(t => ({ ...t, enabled: preset.tweaks.includes(t.id) })));
    setOptimizations(prev => prev.map(o => ({ ...o, enabled: preset.optimizations.includes(o.id) })));
  };

  const handleSavePreset = (name: string, description: string) => {
    const preset: Preset = {
      id: `custom-${Date.now()}`,
      name,
      description,
      programs: programs.filter(p => p.enabled).map(p => p.id),
      tweaks: tweaks.filter(t => t.enabled).map(t => t.id),
      optimizations: optimizations.filter(o => o.enabled).map(o => o.id),
      createdAt: Date.now(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem('iso-forge-presets') || '[]');
      localStorage.setItem('iso-forge-presets', JSON.stringify([...existing, preset]));
    } catch { /* noop */ }
  };

  const handleClearAll = () => {
    setPrograms(prev => prev.map(p => ({ ...p, enabled: false })));
    setTweaks(prev => prev.map(t => ({ ...t, enabled: false })));
    setOptimizations(prev => prev.map(o => ({ ...o, enabled: false })));
  };

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

  const grouped = getGroupedItems();

  return (
    <div className="space-y-4">
      {/* Preset Manager Toggle */}
      <div className="flex gap-2">
        <Button
          variant={showPresets ? 'default' : 'outline'}
          size="sm"
          className="font-mono text-xs"
          onClick={() => setShowPresets(!showPresets)}
        >
          {showPresets ? 'Hide Presets' : 'Show Presets'}
        </Button>
        {enabledCount > 0 && (
          <Button variant="ghost" size="sm" className="font-mono text-xs text-destructive" onClick={handleClearAll}>
            Clear All ({enabledCount})
          </Button>
        )}
      </div>

      {showPresets && (
        <PresetManager onApplyPreset={handleApplyPreset} onSavePreset={handleSavePreset} />
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden animate-slide-in">
        {/* Tab Header */}
        <div className={`flex border-b border-border ${isGlobalSearch ? 'opacity-50 pointer-events-none' : ''}`}>
          {categories.map(cat => {
            const Icon = cat.icon;
            const items = cat.id === 'programs' ? programs : cat.id === 'tweaks' ? tweaks : optimizations;
            const count = items.filter(i => i.enabled).length;
            const total = items.length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`
                  flex-1 px-3 py-3 flex items-center justify-center gap-1.5 transition-all
                  ${activeTab === cat.id ? 'bg-secondary border-b-2 border-primary' : 'hover:bg-muted/50'}
                `}
              >
                <Icon className={`w-4 h-4 ${activeTab === cat.id ? cat.color : 'text-muted-foreground'}`} />
                <span className={`font-medium text-sm ${activeTab === cat.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {cat.label}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {count}/{total}
                </span>
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
              placeholder={isGlobalSearch ? `Searching all categories...` : `Search ${activeTab}...`}
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
        <div className="p-4 max-h-[500px] overflow-y-auto">
          {Object.keys(grouped).length === 0 && searchQuery ? (
            <div className="py-8 text-center">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No results for "{searchQuery}"</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => {
              const isExpanded = searchQuery || expandedCategories.includes(category);
              const enabledInCat = items.filter(i => i.enabled).length;

              return (
                <div key={category} className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="flex items-center gap-2 text-left group flex-1"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                        {category}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground/60">
                        ({enabledInCat}/{items.length})
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </button>
                    {isExpanded && (
                        <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] font-mono px-2"
                        onClick={() => toggleAllInCategory(category, isGlobalSearch ? getItemType(items[0].id) : activeTab as any)}
                      >
                        {enabledInCat === items.length ? 'None' : 'All'}
                      </Button>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="space-y-1.5 ml-6">
                      {items.map(item => {
                        const RiskIcon = riskIcons[item.risk || 'safe'];
                        return (
                          <div
                            key={item.id}
                            className={`
                              flex items-center justify-between p-2.5 rounded-lg transition-all
                              ${item.enabled
                                ? 'bg-primary/10 border border-primary/30'
                                : 'bg-muted/20 hover:bg-muted/40'
                              }
                            `}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className={`
                                w-7 h-7 rounded-md flex items-center justify-center shrink-0
                                ${item.enabled ? 'bg-primary/20' : 'bg-muted'}
                              `}>
                                {item.enabled ? (
                                  <Check className="w-3.5 h-3.5 text-primary" />
                                ) : (
                                  <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                                  {item.risk && item.risk !== 'safe' && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <RiskIcon className={`w-3 h-3 ${riskColors[item.risk]}`} />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs capitalize">{item.risk} risk</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={item.enabled}
                              onCheckedChange={() => toggleItem(item.id, isGlobalSearch ? getItemType(item.id) : activeTab as 'programs' | 'tweaks' | 'optimizations')}
                              className="shrink-0 ml-2"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-mono">
              {enabledCount} total • {programs.filter(i => i.enabled).length} programs
              • {tweaks.filter(i => i.enabled).length} tweaks
              • {optimizations.filter(i => i.enabled).length} opts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;