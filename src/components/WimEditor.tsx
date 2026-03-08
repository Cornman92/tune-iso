import { useState, useMemo, useEffect, MutableRefObject } from 'react';
import { Layers, Check, Info, Package, FileUp, Settings, FolderPlus, Trash2, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ── Edition Manager ──
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

// ── Windows Features ──
interface WinFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
}

export const DEFAULT_FEATURES: WinFeature[] = [
  // Developer
  { id: 'wsl', name: 'Windows Subsystem for Linux', description: 'Run Linux binaries natively', enabled: false, category: 'Developer' },
  { id: 'hyperv', name: 'Hyper-V', description: 'Type-1 hypervisor for VMs', enabled: false, category: 'Developer' },
  { id: 'sandbox', name: 'Windows Sandbox', description: 'Disposable lightweight desktop', enabled: false, category: 'Developer' },
  { id: 'containers', name: 'Containers', description: 'Windows container support', enabled: false, category: 'Developer' },
  { id: 'wsl-gui', name: 'WSLg (GUI Apps)', description: 'Run Linux GUI apps via WSL', enabled: false, category: 'Developer' },
  { id: 'dev-mode', name: 'Developer Mode', description: 'Sideload apps & dev tools', enabled: false, category: 'Developer' },
  { id: 'windows-developer-tools', name: 'Windows Developer Tools', description: 'Device Portal, discovery, SSH', enabled: false, category: 'Developer' },
  { id: 'data-dedup', name: 'Data Deduplication', description: 'NTFS deduplication (Server feature)', enabled: false, category: 'Developer' },

  // Networking
  { id: 'ssh-server', name: 'OpenSSH Server', description: 'SSH server for remote access', enabled: false, category: 'Networking' },
  { id: 'ssh-client', name: 'OpenSSH Client', description: 'SSH client for connecting', enabled: true, category: 'Networking' },
  { id: 'telnet', name: 'Telnet Client', description: 'Legacy remote terminal', enabled: false, category: 'Networking' },
  { id: 'nfs', name: 'NFS Client', description: 'Network File System support', enabled: false, category: 'Networking' },
  { id: 'tftp', name: 'TFTP Client', description: 'Trivial File Transfer Protocol', enabled: false, category: 'Networking' },
  { id: 'snmp', name: 'SNMP', description: 'Simple Network Management Protocol', enabled: false, category: 'Networking' },
  { id: 'ras-connection-manager', name: 'RAS Connection Manager', description: 'Remote access connection profiles', enabled: false, category: 'Networking' },
  { id: 'cmak', name: 'Connection Manager Admin Kit', description: 'Create RAS connection profiles', enabled: false, category: 'Networking' },
  { id: 'rip-listener', name: 'RIP Listener', description: 'Routing Information Protocol listener', enabled: false, category: 'Networking' },
  { id: 'simple-tcpip', name: 'Simple TCP/IP Services', description: 'Legacy TCP services (echo, daytime)', enabled: false, category: 'Networking' },
  { id: 'wins', name: 'WINS Client', description: 'Windows Internet Name Service', enabled: false, category: 'Networking' },
  { id: 'smb-direct', name: 'SMB Direct (RDMA)', description: 'SMB over RDMA for high-speed transfers', enabled: false, category: 'Networking' },

  // Frameworks
  { id: 'dotnet35', name: '.NET Framework 3.5', description: 'Legacy .NET for older apps', enabled: false, category: 'Frameworks' },
  { id: 'dotnet48', name: '.NET Framework 4.8', description: 'Latest .NET Framework', enabled: true, category: 'Frameworks' },
  { id: 'directplay', name: 'DirectPlay', description: 'Legacy gaming networking', enabled: false, category: 'Frameworks' },
  { id: 'dotnet-wcf', name: 'WCF Services', description: 'Windows Communication Foundation', enabled: false, category: 'Frameworks' },
  { id: 'dotnet-http-activation', name: 'HTTP Activation', description: '.NET HTTP activation for WCF', enabled: false, category: 'Frameworks' },
  { id: 'msmq-activex', name: 'MSMQ ActiveX', description: 'COM scripting for MSMQ', enabled: false, category: 'Frameworks' },

  // Media
  { id: 'mediaplayer', name: 'Windows Media Player', description: 'Legacy media player', enabled: true, category: 'Media' },
  { id: 'media-foundation', name: 'Media Foundation', description: 'Multimedia framework', enabled: true, category: 'Media' },
  { id: 'media-playback', name: 'Windows Media Playback', description: 'Advanced media codecs', enabled: true, category: 'Media' },
  { id: 'hevc-codec', name: 'HEVC Video Extensions', description: 'H.265 video codec support', enabled: false, category: 'Media' },
  { id: 'webp-codec', name: 'WebP Image Extension', description: 'WebP image format support', enabled: false, category: 'Media' },
  { id: 'raw-image-ext', name: 'Raw Image Extension', description: 'Camera RAW preview support', enabled: false, category: 'Media' },

  // Printing
  { id: 'print-pdf', name: 'Print to PDF', description: 'Microsoft Print to PDF', enabled: true, category: 'Printing' },
  { id: 'lpr-client', name: 'LPR Print Client', description: 'Line Printer Remote protocol', enabled: false, category: 'Printing' },
  { id: 'lpd-service', name: 'LPD Print Service', description: 'Line Printer Daemon service', enabled: false, category: 'Printing' },
  { id: 'internet-printing', name: 'Internet Printing Client', description: 'Print via IPP protocol', enabled: false, category: 'Printing' },
  { id: 'scan-management', name: 'Scan Management', description: 'Enterprise scan management', enabled: false, category: 'Printing' },

  // Legacy
  { id: 'xps-viewer', name: 'XPS Viewer', description: 'XPS document viewer', enabled: false, category: 'Legacy' },
  { id: 'xps-printer', name: 'XPS Document Writer', description: 'Print to XPS format', enabled: false, category: 'Legacy' },
  { id: 'wordpad', name: 'WordPad', description: 'Basic rich text editor', enabled: true, category: 'Legacy' },
  { id: 'ie-mode', name: 'Internet Explorer Mode', description: 'IE compatibility for Edge', enabled: false, category: 'Legacy' },
  { id: 'powershell2', name: 'PowerShell 2.0', description: 'Legacy PS engine (security risk)', enabled: false, category: 'Legacy' },
  { id: 'smb1', name: 'SMB 1.0/CIFS', description: 'Legacy file sharing (security risk)', enabled: false, category: 'Legacy' },
  { id: 'fax-scan', name: 'Windows Fax & Scan', description: 'Fax and scanning features', enabled: false, category: 'Legacy' },
  { id: 'steps-recorder', name: 'Steps Recorder', description: 'Problem steps recorder', enabled: false, category: 'Legacy' },
  { id: 'math-recognizer', name: 'Math Recognizer', description: 'Handwriting math input panel', enabled: false, category: 'Legacy' },
  { id: 'hello-face', name: 'Windows Hello Face', description: 'Facial recognition login', enabled: false, category: 'Legacy' },
  { id: 'notepad-legacy', name: 'Notepad (Legacy)', description: 'Classic Notepad application', enabled: true, category: 'Legacy' },

  // Enterprise
  { id: 'work-folders', name: 'Work Folders Client', description: 'Sync work files offline', enabled: false, category: 'Enterprise' },
  { id: 'rsat', name: 'RSAT Tools', description: 'Remote Server Administration', enabled: false, category: 'Enterprise' },
  { id: 'iis', name: 'Internet Information Services', description: 'Web server platform', enabled: false, category: 'Enterprise' },
  { id: 'msmq', name: 'MSMQ', description: 'Microsoft Message Queuing', enabled: false, category: 'Enterprise' },
  { id: 'embedded-shell', name: 'Embedded Shell Launcher', description: 'Kiosk mode shell replacement', enabled: false, category: 'Enterprise' },
  { id: 'assigned-access', name: 'Assigned Access', description: 'Single-app kiosk mode', enabled: false, category: 'Enterprise' },
  { id: 'device-guard', name: 'Device Guard', description: 'Code integrity policies', enabled: false, category: 'Enterprise' },
  { id: 'credential-guard', name: 'Credential Guard', description: 'Virtualization-based credential protection', enabled: false, category: 'Enterprise' },
  { id: 'applocker', name: 'AppLocker', description: 'Application whitelisting', enabled: false, category: 'Enterprise' },
  { id: 'branch-cache', name: 'BranchCache', description: 'WAN optimization for branch offices', enabled: false, category: 'Enterprise' },
  { id: 'directaccess', name: 'DirectAccess Client', description: 'Always-on VPN alternative', enabled: false, category: 'Enterprise' },
  { id: 'group-policy-management', name: 'Group Policy Management', description: 'GPO management console (GPMC)', enabled: false, category: 'Enterprise' },
  { id: 'multipoint-connector', name: 'MultiPoint Connector', description: 'Multi-user station support', enabled: false, category: 'Enterprise' },
  { id: 'storage-spaces', name: 'Storage Spaces', description: 'Software-defined storage pools', enabled: false, category: 'Enterprise' },
];

// ── Package type ──
interface WimPackage {
  id: string;
  name: string;
  path: string;
  type: 'cab' | 'msu' | 'langpack' | 'appx';
  size: string;
}

// ── Injected File type ──
interface InjectedFile {
  id: string;
  name: string;
  targetPath: string;
  size: string;
  type: 'file' | 'folder';
}

export interface WimFeatureExport {
  id: string;
  name: string;
  enabled: boolean;
}

interface WimEditorProps {
  isMounted: boolean;
  exportFeaturesRef?: MutableRefObject<() => WimFeatureExport[]>;
  importFeaturesRef?: MutableRefObject<(data: { id: string; enabled: boolean }[]) => void>;
}

type WimTab = 'editions' | 'features' | 'packages' | 'compression' | 'files';

const WimEditor = ({ isMounted, exportFeaturesRef, importFeaturesRef }: WimEditorProps) => {
  const [activeTab, setActiveTab] = useState<WimTab>('editions');

  // Edition state
  const [editions, setEditions] = useState<WimEdition[]>(MOCK_EDITIONS);
  const [defaultIndex, setDefaultIndex] = useState(6);

  // Features state
  const [features, setFeatures] = useState<WinFeature[]>(DEFAULT_FEATURES);
  const [featureSearch, setFeatureSearch] = useState('');

  // Export features ref
  useEffect(() => {
    if (exportFeaturesRef) {
      exportFeaturesRef.current = () => features
        .filter(f => f.enabled !== DEFAULT_FEATURES.find(d => d.id === f.id)?.enabled)
        .map(f => ({ id: f.id, name: f.name, enabled: f.enabled }));
    }
  }, [features, exportFeaturesRef]);
  // Package state
  const [packages, setPackages] = useState<WimPackage[]>([]);
  const [pkgName, setPkgName] = useState('');
  const [pkgPath, setPkgPath] = useState('');
  const [pkgType, setPkgType] = useState<WimPackage['type']>('cab');

  // Compression state
  const [compression, setCompression] = useState<'none' | 'fast' | 'max'>('max');
  const [splitWim, setSplitWim] = useState(false);
  const [splitSize, setSplitSize] = useState('4000');
  const [exportFormat, setExportFormat] = useState<'wim' | 'esd'>('wim');

  // File injection state
  const [injectedFiles, setInjectedFiles] = useState<InjectedFile[]>([]);
  const [fileName, setFileName] = useState('');
  const [fileTarget, setFileTarget] = useState('');
  const [fileType, setFileType] = useState<'file' | 'folder'>('file');

  // Tab config
  const tabs: { id: WimTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'editions', label: 'Editions', icon: Layers, count: editions.filter(e => e.selected).length },
    { id: 'features', label: 'Features', icon: Package, count: features.filter(f => f.enabled).length },
    { id: 'packages', label: 'Packages', icon: FileUp, count: packages.length },
    { id: 'compression', label: 'Compression', icon: Settings },
    { id: 'files', label: 'Files', icon: FolderPlus, count: injectedFiles.length },
  ];

  // Editions
  const toggleEdition = (index: number) => {
    setEditions(prev => prev.map(e => e.index === index ? { ...e, selected: !e.selected } : e));
  };
  const selectedEditions = editions.filter(e => e.selected);
  const removedEditions = editions.filter(e => !e.selected);

  // Features
  const toggleFeature = (id: string) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };
  const filteredFeatures = useMemo(() => {
    const q = featureSearch.toLowerCase();
    return q ? features.filter(f => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)) : features;
  }, [features, featureSearch]);
  const featureCategories = useMemo(() => {
    const cats = new Map<string, WinFeature[]>();
    filteredFeatures.forEach(f => {
      if (!cats.has(f.category)) cats.set(f.category, []);
      cats.get(f.category)!.push(f);
    });
    return cats;
  }, [filteredFeatures]);

  // Package add
  const addPackage = () => {
    if (!pkgName.trim() || !pkgPath.trim()) return;
    setPackages(prev => [...prev, { id: `pkg-${Date.now()}`, name: pkgName.trim(), path: pkgPath.trim(), type: pkgType, size: '~? MB' }]);
    setPkgName('');
    setPkgPath('');
  };

  // File add
  const addFile = () => {
    if (!fileName.trim() || !fileTarget.trim()) return;
    setInjectedFiles(prev => [...prev, { id: `file-${Date.now()}`, name: fileName.trim(), targetPath: fileTarget.trim(), size: '~? KB', type: fileType }]);
    setFileName('');
    setFileTarget('');
  };

  return (
    <div className={`rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden ${!isMounted ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Tab Header */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count !== undefined && (
                <Badge variant="secondary" className="text-[9px] font-mono h-4 px-1">{tab.count}</Badge>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {/* ── Editions Tab ── */}
        {activeTab === 'editions' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono">{selectedEditions.length}/{editions.length} kept</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs font-mono h-7" onClick={() => setEditions(prev => prev.map(e => ({ ...e, selected: true })))}>Select All</Button>
                <Button size="sm" variant="outline" className="text-xs font-mono h-7" onClick={() => setEditions(prev => prev.map((e, i) => ({ ...e, selected: i === 0 })))}>Keep First Only</Button>
              </div>
            </div>
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
              {editions.map(edition => (
                <div
                  key={edition.index}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer group ${
                    edition.selected ? 'border-primary/30 bg-primary/5 hover:bg-primary/10' : 'border-border/50 bg-muted/20 opacity-60 hover:opacity-80'
                  }`}
                  onClick={() => toggleEdition(edition.index)}
                >
                  <Checkbox checked={edition.selected} onCheckedChange={() => toggleEdition(edition.index)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
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
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); setDefaultIndex(edition.index); }}>
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
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
          </>
        )}

        {/* ── Features Tab ── */}
        {activeTab === 'features' && (
          <>
            <div className="mb-3">
              <Input
                value={featureSearch}
                onChange={e => setFeatureSearch(e.target.value)}
                placeholder="Search features..."
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {[...featureCategories.entries()].map(([cat, feats]) => (
                <div key={cat}>
                  <h4 className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-2">{cat}</h4>
                  <div className="space-y-1">
                    {feats.map(feat => (
                      <div
                        key={feat.id}
                        className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                          feat.enabled ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/20'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{feat.name}</p>
                          <p className="text-[11px] text-muted-foreground">{feat.description}</p>
                        </div>
                        <Switch checked={feat.enabled} onCheckedChange={() => toggleFeature(feat.id)} className="ml-2 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-[11px] font-mono text-muted-foreground mb-1">DISM Commands Preview</p>
              <div className="max-h-24 overflow-y-auto space-y-0.5 text-[11px] font-mono">
                {features.filter(f => f.enabled).map(f => (
                  <p key={f.id} className="text-primary">DISM /Enable-Feature /FeatureName:{f.id} /All</p>
                ))}
                {features.filter(f => !f.enabled && DEFAULT_FEATURES.find(d => d.id === f.id)?.enabled).map(f => (
                  <p key={f.id} className="text-destructive">DISM /Disable-Feature /FeatureName:{f.id}</p>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Packages Tab ── */}
        {activeTab === 'packages' && (
          <>
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-[1fr,1fr,auto] gap-2">
                <Input value={pkgName} onChange={e => setPkgName(e.target.value)} placeholder="Package name" className="h-8 text-xs font-mono" />
                <Input value={pkgPath} onChange={e => setPkgPath(e.target.value)} placeholder="C:\path\to\package.cab" className="h-8 text-xs font-mono" />
                <Select value={pkgType} onValueChange={v => setPkgType(v as WimPackage['type'])}>
                  <SelectTrigger className="h-8 text-xs font-mono w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cab" className="text-xs">.cab</SelectItem>
                    <SelectItem value="msu" className="text-xs">.msu</SelectItem>
                    <SelectItem value="langpack" className="text-xs">Language Pack</SelectItem>
                    <SelectItem value="appx" className="text-xs">.appx/.msix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="text-xs h-7 font-mono" onClick={addPackage} disabled={!pkgName.trim() || !pkgPath.trim()}>
                <Plus className="w-3 h-3 mr-1" /> Add Package
              </Button>
            </div>

            {packages.length === 0 ? (
              <div className="py-8 text-center">
                <FileUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No packages added. Add .cab, .msu, language packs, or .appx files.</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-[350px] overflow-y-auto">
                {packages.map(pkg => (
                  <div key={pkg.id} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/20">
                    <Badge variant="outline" className="text-[9px] font-mono shrink-0">{pkg.type}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{pkg.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground truncate">{pkg.path}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => setPackages(prev => prev.filter(p => p.id !== pkg.id))}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {packages.length > 0 && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-[11px] font-mono text-muted-foreground mb-1">DISM Commands Preview</p>
                <div className="max-h-24 overflow-y-auto space-y-0.5 text-[11px] font-mono">
                  {packages.map(pkg => (
                    <p key={pkg.id} className="text-primary">
                      DISM /Add-Package /PackagePath:"{pkg.path}"
                    </p>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Compression Tab ── */}
        {activeTab === 'compression' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">WIM Compression</label>
              <div className="grid grid-cols-3 gap-2">
                {(['none', 'fast', 'max'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setCompression(level)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      compression === level ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                    }`}
                  >
                    <p className="text-sm font-medium capitalize">{level}</p>
                    <p className="text-[10px] mt-0.5">
                      {level === 'none' ? 'Fastest, largest' : level === 'fast' ? 'Balanced' : 'Smallest, slowest'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Export Format</label>
              <div className="grid grid-cols-2 gap-2">
                {(['wim', 'esd'] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      exportFormat === fmt ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                    }`}
                  >
                    <p className="text-sm font-medium uppercase">.{fmt}</p>
                    <p className="text-[10px] mt-0.5">{fmt === 'wim' ? 'Standard, editable' : 'Encrypted, smaller (~30%)'}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Split WIM for FAT32</span>
                  <Tooltip>
                    <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent className="max-w-[220px]"><p className="text-xs">Split large WIM into .swm files for FAT32 USB drives (4GB limit).</p></TooltipContent>
                  </Tooltip>
                </div>
                <Switch checked={splitWim} onCheckedChange={setSplitWim} />
              </div>
              {splitWim && (
                <div className="flex items-center gap-2">
                  <Input value={splitSize} onChange={e => setSplitSize(e.target.value.replace(/[^0-9]/g, ''))} className="h-8 text-xs font-mono w-24" />
                  <span className="text-xs text-muted-foreground">MB per chunk</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-[11px] font-mono text-muted-foreground mb-1">DISM Commands Preview</p>
              <div className="text-[11px] font-mono space-y-0.5">
                <p className="text-primary">DISM /Export-Image /Compress:{compression} /DestinationImageFile:install.{exportFormat}</p>
                {splitWim && <p className="text-warning">DISM /Split-Image /SWMFile:install.swm /FileSize:{splitSize}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── Files Tab ── */}
        {activeTab === 'files' && (
          <>
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-[1fr,1fr,auto] gap-2">
                <Input value={fileName} onChange={e => setFileName(e.target.value)} placeholder="Source name/path" className="h-8 text-xs font-mono" />
                <Input value={fileTarget} onChange={e => setFileTarget(e.target.value)} placeholder="Target: Windows\Setup\Scripts\" className="h-8 text-xs font-mono" />
                <Select value={fileType} onValueChange={v => setFileType(v as 'file' | 'folder')}>
                  <SelectTrigger className="h-8 text-xs font-mono w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file" className="text-xs">File</SelectItem>
                    <SelectItem value="folder" className="text-xs">Folder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="text-xs h-7 font-mono" onClick={addFile} disabled={!fileName.trim() || !fileTarget.trim()}>
                <Plus className="w-3 h-3 mr-1" /> Add File
              </Button>
            </div>

            {injectedFiles.length === 0 ? (
              <div className="py-8 text-center">
                <FolderPlus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No files added. Inject wallpapers, scripts, configs, or remove files.</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-[350px] overflow-y-auto">
                {injectedFiles.map(file => (
                  <div key={file.id} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/20">
                    <Badge variant="outline" className="text-[9px] font-mono shrink-0">{file.type}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground truncate">→ {file.targetPath}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => setInjectedFiles(prev => prev.filter(f => f.id !== file.id))}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WimEditor;