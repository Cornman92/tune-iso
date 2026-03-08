export interface CustomizationItem {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  risk?: 'safe' | 'moderate' | 'aggressive';
}

export const defaultPrograms: CustomizationItem[] = [
  // Browsers
  { id: 'chrome', name: 'Google Chrome', description: 'Web browser by Google', enabled: false, category: 'browsers', risk: 'safe' },
  { id: 'firefox', name: 'Mozilla Firefox', description: 'Open-source web browser', enabled: false, category: 'browsers', risk: 'safe' },
  { id: 'brave', name: 'Brave Browser', description: 'Privacy-focused browser', enabled: false, category: 'browsers', risk: 'safe' },
  { id: 'edge-chromium', name: 'Edge (Chromium)', description: 'Microsoft Edge latest', enabled: false, category: 'browsers', risk: 'safe' },
  { id: 'vivaldi', name: 'Vivaldi', description: 'Power-user browser', enabled: false, category: 'browsers', risk: 'safe' },
  { id: 'ungoogled-chromium', name: 'Ungoogled Chromium', description: 'Chromium without Google services', enabled: false, category: 'browsers', risk: 'safe' },

  // Development
  { id: 'vscode', name: 'VS Code', description: 'Microsoft code editor', enabled: false, category: 'development', risk: 'safe' },
  { id: 'notepad++', name: 'Notepad++', description: 'Advanced text editor', enabled: false, category: 'development', risk: 'safe' },
  { id: 'sublime', name: 'Sublime Text', description: 'Lightweight code editor', enabled: false, category: 'development', risk: 'safe' },
  { id: 'git', name: 'Git', description: 'Version control system', enabled: false, category: 'development', risk: 'safe' },
  { id: 'nodejs', name: 'Node.js LTS', description: 'JavaScript runtime', enabled: false, category: 'development', risk: 'safe' },
  { id: 'python', name: 'Python 3', description: 'Python interpreter', enabled: false, category: 'development', risk: 'safe' },
  { id: 'winscp', name: 'WinSCP', description: 'SFTP/FTP client', enabled: false, category: 'development', risk: 'safe' },
  { id: 'putty', name: 'PuTTY', description: 'SSH/Telnet client', enabled: false, category: 'development', risk: 'safe' },
  { id: 'windows-terminal', name: 'Windows Terminal', description: 'Modern terminal app', enabled: false, category: 'development', risk: 'safe' },
  { id: 'powershell7', name: 'PowerShell 7', description: 'Cross-platform PowerShell', enabled: false, category: 'development', risk: 'safe' },

  // Utilities
  { id: '7zip', name: '7-Zip', description: 'File archiver & compressor', enabled: false, category: 'utilities', risk: 'safe' },
  { id: 'winrar', name: 'WinRAR', description: 'Archive manager', enabled: false, category: 'utilities', risk: 'safe' },
  { id: 'everything', name: 'Everything', description: 'Instant file search', enabled: false, category: 'utilities', risk: 'safe' },
  { id: 'sharex', name: 'ShareX', description: 'Screenshot & screen recorder', enabled: false, category: 'utilities', risk: 'safe' },
  { id: 'windirstat', name: 'WinDirStat', description: 'Disk usage analyzer', enabled: false, category: 'utilities', risk: 'safe' },
  { id: 'totalcmd', name: 'Total Commander', description: 'Dual-pane file manager', enabled: false, category: 'utilities', risk: 'safe' },
  { id: 'autoruns', name: 'Autoruns', description: 'Sysinternals startup manager', enabled: false, category: 'utilities', risk: 'safe' },
  { id: 'procexp', name: 'Process Explorer', description: 'Advanced task manager', enabled: false, category: 'utilities', risk: 'safe' },
  { id: 'hwinfo', name: 'HWiNFO', description: 'Hardware diagnostics', enabled: false, category: 'utilities', risk: 'safe' },
  { id: 'cpuz', name: 'CPU-Z', description: 'CPU information utility', enabled: false, category: 'utilities', risk: 'safe' },
  { id: 'crystaldisk', name: 'CrystalDiskInfo', description: 'Disk health monitor', enabled: false, category: 'utilities', risk: 'safe' },
  { id: 'rufus', name: 'Rufus', description: 'USB bootable drive creator', enabled: false, category: 'utilities', risk: 'safe' },
  { id: 'powertoys', name: 'PowerToys', description: 'Microsoft power utilities', enabled: false, category: 'utilities', risk: 'safe' },
  { id: 'quicklook', name: 'QuickLook', description: 'Spacebar file preview', enabled: false, category: 'utilities', risk: 'safe' },

  // Media
  { id: 'vlc', name: 'VLC Player', description: 'Universal media player', enabled: false, category: 'media', risk: 'safe' },
  { id: 'mpv', name: 'mpv', description: 'Lightweight media player', enabled: false, category: 'media', risk: 'safe' },
  { id: 'foobar', name: 'foobar2000', description: 'Advanced audio player', enabled: false, category: 'media', risk: 'safe' },
  { id: 'irfanview', name: 'IrfanView', description: 'Fast image viewer', enabled: false, category: 'media', risk: 'safe' },
  { id: 'obs', name: 'OBS Studio', description: 'Streaming & recording', enabled: false, category: 'media', risk: 'safe' },
  { id: 'gimp', name: 'GIMP', description: 'Image editor', enabled: false, category: 'media', risk: 'safe' },
  { id: 'handbrake', name: 'HandBrake', description: 'Video transcoder', enabled: false, category: 'media', risk: 'safe' },
  { id: 'audacity', name: 'Audacity', description: 'Audio editor', enabled: false, category: 'media', risk: 'safe' },

  // Communication
  { id: 'discord', name: 'Discord', description: 'Voice & text chat', enabled: false, category: 'communication', risk: 'safe' },
  { id: 'telegram', name: 'Telegram', description: 'Messaging app', enabled: false, category: 'communication', risk: 'safe' },
  { id: 'signal', name: 'Signal', description: 'Encrypted messaging', enabled: false, category: 'communication', risk: 'safe' },
  { id: 'thunderbird', name: 'Thunderbird', description: 'Email client', enabled: false, category: 'communication', risk: 'safe' },

  // Security
  { id: 'keepassxc', name: 'KeePassXC', description: 'Password manager', enabled: false, category: 'security', risk: 'safe' },
  { id: 'bitwarden', name: 'Bitwarden', description: 'Cloud password manager', enabled: false, category: 'security', risk: 'safe' },
  { id: 'veracrypt', name: 'VeraCrypt', description: 'Disk encryption', enabled: false, category: 'security', risk: 'safe' },
  { id: 'wireshark', name: 'Wireshark', description: 'Network analyzer', enabled: false, category: 'security', risk: 'safe' },

  // Runtimes
  { id: 'dotnet-desktop', name: '.NET Desktop Runtime', description: '.NET 8 desktop runtime', enabled: false, category: 'runtimes', risk: 'safe' },
  { id: 'vcredist', name: 'Visual C++ Redist (All)', description: 'All VC++ redistributables', enabled: false, category: 'runtimes', risk: 'safe' },
  { id: 'directx', name: 'DirectX End-User', description: 'DirectX runtime libraries', enabled: false, category: 'runtimes', risk: 'safe' },
  { id: 'java', name: 'Java (OpenJDK)', description: 'Java runtime environment', enabled: false, category: 'runtimes', risk: 'safe' },
];

export const defaultTweaks: CustomizationItem[] = [
  // Privacy
  { id: 'disable-telemetry', name: 'Disable Telemetry', description: 'Block all diagnostic data collection', enabled: false, category: 'privacy', risk: 'moderate' },
  { id: 'disable-cortana', name: 'Disable Cortana', description: 'Remove Cortana integration entirely', enabled: false, category: 'privacy', risk: 'safe' },
  { id: 'disable-activity-history', name: 'Disable Activity History', description: 'Stop tracking app usage history', enabled: false, category: 'privacy', risk: 'safe' },
  { id: 'disable-advertising-id', name: 'Disable Advertising ID', description: 'Remove ad tracking identifier', enabled: false, category: 'privacy', risk: 'safe' },
  { id: 'disable-location-tracking', name: 'Disable Location Tracking', description: 'Turn off location services', enabled: false, category: 'privacy', risk: 'safe' },
  { id: 'disable-feedback', name: 'Disable Feedback Hub', description: 'Remove feedback notifications', enabled: false, category: 'privacy', risk: 'safe' },
  { id: 'disable-wifi-sense', name: 'Disable Wi-Fi Sense', description: 'Stop auto-sharing Wi-Fi passwords', enabled: false, category: 'privacy', risk: 'safe' },
  { id: 'disable-cloud-clipboard', name: 'Disable Cloud Clipboard', description: 'Stop syncing clipboard to cloud', enabled: false, category: 'privacy', risk: 'safe' },
  { id: 'disable-timeline', name: 'Disable Timeline', description: 'Remove task view timeline', enabled: false, category: 'privacy', risk: 'safe' },
  { id: 'disable-handwriting-data', name: 'Disable Handwriting Data', description: 'Stop handwriting recognition sharing', enabled: false, category: 'privacy', risk: 'safe' },
  { id: 'disable-app-suggestions', name: 'Disable App Suggestions', description: 'Stop suggested apps in Start menu', enabled: false, category: 'privacy', risk: 'safe' },
  { id: 'disable-bing-search', name: 'Disable Bing in Start Search', description: 'Remove web results from Start menu', enabled: false, category: 'privacy', risk: 'safe' },

  // Bloatware Removal
  { id: 'remove-onedrive', name: 'Remove OneDrive', description: 'Uninstall OneDrive completely', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-xbox', name: 'Remove Xbox Apps', description: 'Xbox Game Bar, Identity Provider, etc.', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-teams', name: 'Remove Microsoft Teams', description: 'Remove Teams chat integration', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-skype', name: 'Remove Skype', description: 'Uninstall Skype app', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-cortana-app', name: 'Remove Cortana App', description: 'Delete Cortana UWP app', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-maps', name: 'Remove Windows Maps', description: 'Uninstall Maps app', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-weather', name: 'Remove Weather App', description: 'Uninstall Weather widget app', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-news', name: 'Remove News App', description: 'Remove Microsoft News', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-people', name: 'Remove People App', description: 'Uninstall People contacts app', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-yourphone', name: 'Remove Phone Link', description: 'Remove Your Phone / Phone Link', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-groove', name: 'Remove Groove Music', description: 'Uninstall Groove Music player', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-mixedreality', name: 'Remove Mixed Reality', description: 'Remove Mixed Reality Portal', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-feedback', name: 'Remove Feedback Hub', description: 'Uninstall Feedback Hub app', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-3dviewer', name: 'Remove 3D Viewer', description: 'Uninstall 3D Viewer app', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-paint3d', name: 'Remove Paint 3D', description: 'Uninstall Paint 3D', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-solitaire', name: 'Remove Solitaire', description: 'Remove Microsoft Solitaire Collection', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-tips', name: 'Remove Tips App', description: 'Uninstall Windows Tips', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-clipchamp', name: 'Remove Clipchamp', description: 'Uninstall Clipchamp video editor', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-getstarted', name: 'Remove Get Started', description: 'Remove Get Started / Get Help apps', enabled: false, category: 'bloatware', risk: 'safe' },
  { id: 'remove-todos', name: 'Remove Microsoft To Do', description: 'Uninstall To Do app', enabled: false, category: 'bloatware', risk: 'safe' },

  // UI Tweaks
  { id: 'classic-context', name: 'Classic Context Menu', description: 'Restore Win10 right-click menu', enabled: false, category: 'ui tweaks', risk: 'safe' },
  { id: 'show-extensions', name: 'Show File Extensions', description: 'Always display file extensions', enabled: false, category: 'ui tweaks', risk: 'safe' },
  { id: 'show-hidden', name: 'Show Hidden Files', description: 'Display hidden files by default', enabled: false, category: 'ui tweaks', risk: 'safe' },
  { id: 'disable-snap-assist', name: 'Disable Snap Assist', description: 'Turn off window snap suggestions', enabled: false, category: 'ui tweaks', risk: 'safe' },
  { id: 'taskbar-left', name: 'Taskbar Left Align', description: 'Move taskbar icons to the left', enabled: false, category: 'ui tweaks', risk: 'safe' },
  { id: 'disable-widgets', name: 'Disable Widgets', description: 'Remove widgets button from taskbar', enabled: false, category: 'ui tweaks', risk: 'safe' },
  { id: 'disable-chat', name: 'Disable Chat Icon', description: 'Remove Teams chat from taskbar', enabled: false, category: 'ui tweaks', risk: 'safe' },
  { id: 'disable-searchbar', name: 'Disable Search Bar', description: 'Remove search bar from taskbar', enabled: false, category: 'ui tweaks', risk: 'safe' },
  { id: 'disable-taskview', name: 'Disable Task View', description: 'Remove task view button', enabled: false, category: 'ui tweaks', risk: 'safe' },
  { id: 'small-taskbar', name: 'Small Taskbar', description: 'Reduce taskbar size (Win10 style)', enabled: false, category: 'ui tweaks', risk: 'safe' },
  { id: 'dark-mode', name: 'Force Dark Mode', description: 'Enable dark mode system-wide', enabled: false, category: 'ui tweaks', risk: 'safe' },
  { id: 'disable-rounded-corners', name: 'Disable Rounded Corners', description: 'Square window corners (Win10 style)', enabled: false, category: 'ui tweaks', risk: 'moderate' },
  { id: 'compact-view', name: 'Compact File Explorer', description: 'Reduce spacing in Explorer', enabled: false, category: 'ui tweaks', risk: 'safe' },
  { id: 'disable-lockscreen', name: 'Disable Lock Screen', description: 'Skip lock screen on boot', enabled: false, category: 'ui tweaks', risk: 'safe' },

  // Services
  { id: 'disable-wupdate-auto', name: 'Disable Auto Windows Update', description: 'Stop automatic update downloads', enabled: false, category: 'services', risk: 'aggressive' },
  { id: 'disable-superfetch', name: 'Disable SysMain (Superfetch)', description: 'Stop memory preloading service', enabled: false, category: 'services', risk: 'moderate' },
  { id: 'disable-indexing', name: 'Disable Windows Search Indexing', description: 'Stop background file indexing', enabled: false, category: 'services', risk: 'moderate' },
  { id: 'disable-print-spooler', name: 'Disable Print Spooler', description: 'Stop print service (security risk)', enabled: false, category: 'services', risk: 'moderate' },
  { id: 'disable-remote-desktop', name: 'Disable Remote Desktop', description: 'Turn off RDP access', enabled: false, category: 'services', risk: 'safe' },
  { id: 'disable-remote-registry', name: 'Disable Remote Registry', description: 'Block remote registry access', enabled: false, category: 'services', risk: 'safe' },
  { id: 'disable-connected-devices', name: 'Disable Connected Devices', description: 'Stop CDPUserSvc service', enabled: false, category: 'services', risk: 'safe' },
  { id: 'disable-diagnostics', name: 'Disable Diagnostics Hub', description: 'Stop diagnostic collection service', enabled: false, category: 'services', risk: 'safe' },
  { id: 'disable-error-reporting', name: 'Disable Error Reporting', description: 'Stop WER (Windows Error Reporting)', enabled: false, category: 'services', risk: 'safe' },
  { id: 'disable-fax', name: 'Disable Fax Service', description: 'Remove fax support', enabled: false, category: 'services', risk: 'safe' },
  { id: 'disable-geolocation', name: 'Disable Geolocation Service', description: 'Stop location tracking service', enabled: false, category: 'services', risk: 'safe' },
  { id: 'disable-dmwappush', name: 'Disable WAP Push', description: 'Stop dmwappushsvc (telemetry)', enabled: false, category: 'services', risk: 'moderate' },

  // Windows Features
  { id: 'disable-wmp', name: 'Remove Windows Media Player', description: 'Uninstall legacy media player', enabled: false, category: 'features', risk: 'safe' },
  { id: 'disable-ie', name: 'Remove Internet Explorer', description: 'Disable IE mode completely', enabled: false, category: 'features', risk: 'safe' },
  { id: 'disable-xps', name: 'Remove XPS Viewer', description: 'Uninstall XPS document viewer', enabled: false, category: 'features', risk: 'safe' },
  { id: 'disable-wordpad', name: 'Remove WordPad', description: 'Uninstall WordPad editor', enabled: false, category: 'features', risk: 'safe' },
  { id: 'enable-wsl', name: 'Enable WSL2', description: 'Install Windows Subsystem for Linux', enabled: false, category: 'features', risk: 'safe' },
  { id: 'enable-hyper-v', name: 'Enable Hyper-V', description: 'Enable virtualization platform', enabled: false, category: 'features', risk: 'safe' },
  { id: 'enable-sandbox', name: 'Enable Windows Sandbox', description: 'Install isolated sandbox', enabled: false, category: 'features', risk: 'safe' },
  { id: 'enable-ssh', name: 'Enable OpenSSH Server', description: 'Install SSH server feature', enabled: false, category: 'features', risk: 'safe' },
  { id: 'disable-smb1', name: 'Disable SMBv1', description: 'Remove legacy SMB protocol', enabled: false, category: 'features', risk: 'safe' },
  { id: 'disable-powershell2', name: 'Disable PowerShell 2.0', description: 'Remove legacy PS engine', enabled: false, category: 'features', risk: 'safe' },

  // Scheduled Tasks
  { id: 'disable-ceip', name: 'Disable CEIP Tasks', description: 'Customer Experience Improvement tasks', enabled: false, category: 'scheduled tasks', risk: 'safe' },
  { id: 'disable-consolidator', name: 'Disable Consolidator', description: 'Stop telemetry consolidator task', enabled: false, category: 'scheduled tasks', risk: 'safe' },
  { id: 'disable-usbceip', name: 'Disable USB CEIP', description: 'Stop USB telemetry reporting', enabled: false, category: 'scheduled tasks', risk: 'safe' },
  { id: 'disable-disk-diagnostics', name: 'Disable Disk Diagnostics', description: 'Stop scheduled disk data collector', enabled: false, category: 'scheduled tasks', risk: 'safe' },
  { id: 'disable-compatibility-appraiser', name: 'Disable Compatibility Appraiser', description: 'Stop compatibility telemetry', enabled: false, category: 'scheduled tasks', risk: 'moderate' },
  { id: 'disable-maps-update', name: 'Disable Maps Update', description: 'Stop offline maps download', enabled: false, category: 'scheduled tasks', risk: 'safe' },

  // Security Hardening
  { id: 'disable-smb-signing', name: 'Require SMB Signing', description: 'Force signed SMB connections', enabled: false, category: 'security', risk: 'safe' },
  { id: 'enable-bitlocker', name: 'Enable BitLocker Auto', description: 'Auto-enable drive encryption', enabled: false, category: 'security', risk: 'moderate' },
  { id: 'disable-autorun', name: 'Disable AutoRun/AutoPlay', description: 'Block auto-execution of media', enabled: false, category: 'security', risk: 'safe' },
  { id: 'uac-max', name: 'UAC Maximum Level', description: 'Set UAC to always notify', enabled: false, category: 'security', risk: 'safe' },
  { id: 'enable-doh', name: 'Enable DNS over HTTPS', description: 'Encrypted DNS by default', enabled: false, category: 'security', risk: 'safe' },
  { id: 'block-netbios', name: 'Block NetBIOS', description: 'Disable NetBIOS over TCP/IP', enabled: false, category: 'security', risk: 'moderate' },
  { id: 'disable-llmnr', name: 'Disable LLMNR', description: 'Block Link-Local Multicast', enabled: false, category: 'security', risk: 'moderate' },
  { id: 'enable-asm', name: 'Enable Attack Surface Reduction', description: 'Defender ASR rules', enabled: false, category: 'security', risk: 'moderate' },
];

export const defaultOptimizations: CustomizationItem[] = [
  // Performance
  { id: 'disable-animations', name: 'Reduce Animations', description: 'Minimize UI transition effects', enabled: false, category: 'performance', risk: 'safe' },
  { id: 'disable-transparency', name: 'Disable Transparency', description: 'Turn off acrylic/blur effects', enabled: false, category: 'performance', risk: 'safe' },
  { id: 'gaming-mode', name: 'Game Mode Optimization', description: 'Prioritize game processes, disable DVR', enabled: false, category: 'performance', risk: 'safe' },
  { id: 'disable-background-apps', name: 'Disable Background Apps', description: 'Stop UWP apps from running in background', enabled: false, category: 'performance', risk: 'safe' },
  { id: 'visual-performance', name: 'Adjust for Performance', description: 'Set visual effects to best performance', enabled: false, category: 'performance', risk: 'safe' },
  { id: 'process-scheduling', name: 'Foreground Process Priority', description: 'Prioritize active window processes', enabled: false, category: 'performance', risk: 'safe' },
  { id: 'disable-spectre', name: 'Disable Spectre Mitigations', description: 'Trade security for CPU performance', enabled: false, category: 'performance', risk: 'aggressive' },
  { id: 'disable-core-parking', name: 'Disable Core Parking', description: 'Keep all CPU cores active', enabled: false, category: 'performance', risk: 'moderate' },
  { id: 'disable-hpet', name: 'Disable HPET', description: 'High Precision Event Timer off', enabled: false, category: 'performance', risk: 'moderate' },
  { id: 'msi-mode', name: 'Enable MSI Mode', description: 'Message Signaled Interrupts for GPU', enabled: false, category: 'performance', risk: 'moderate' },
  { id: 'disable-fullscreen-opt', name: 'Disable Fullscreen Optimizations', description: 'Reduce input lag in games', enabled: false, category: 'performance', risk: 'safe' },

  // Memory
  { id: 'disable-pagefile', name: 'Disable Page File', description: 'Remove virtual memory (16GB+ RAM)', enabled: false, category: 'memory', risk: 'aggressive' },
  { id: 'optimize-pagefile', name: 'Optimize Page File', description: 'Set fixed size based on RAM', enabled: false, category: 'memory', risk: 'safe' },
  { id: 'large-system-cache', name: 'Large System Cache', description: 'Optimize for file server caching', enabled: false, category: 'memory', risk: 'moderate' },
  { id: 'disable-prefetch', name: 'Disable Prefetch', description: 'Stop app prefetching (SSD only)', enabled: false, category: 'memory', risk: 'moderate' },
  { id: 'memory-management', name: 'Optimize Memory Management', description: 'Tune kernel memory parameters', enabled: false, category: 'memory', risk: 'moderate' },
  { id: 'disable-memory-compression', name: 'Disable Memory Compression', description: 'Trade RAM for CPU cycles', enabled: false, category: 'memory', risk: 'moderate' },

  // Storage
  { id: 'ssd-optimize', name: 'SSD Optimization Suite', description: 'TRIM, disable defrag, optimize I/O', enabled: false, category: 'storage', risk: 'safe' },
  { id: 'disable-hibernation', name: 'Disable Hibernation', description: 'Free disk space (hiberfil.sys)', enabled: false, category: 'storage', risk: 'safe' },
  { id: 'disable-system-restore', name: 'Disable System Restore', description: 'Free disk, remove restore points', enabled: false, category: 'storage', risk: 'aggressive' },
  { id: 'compact-os', name: 'Enable Compact OS', description: 'Compress OS files to save space', enabled: false, category: 'storage', risk: 'safe' },
  { id: 'disable-delivery-opt', name: 'Disable Delivery Optimization', description: 'Stop P2P update sharing', enabled: false, category: 'storage', risk: 'safe' },
  { id: 'disable-reserved-storage', name: 'Disable Reserved Storage', description: 'Reclaim 7GB+ reserved space', enabled: false, category: 'storage', risk: 'moderate' },
  { id: 'disable-storage-sense', name: 'Configure Storage Sense', description: 'Auto-clean temp files', enabled: false, category: 'storage', risk: 'safe' },

  // Network
  { id: 'network-optimize', name: 'Network Stack Optimization', description: 'Optimize TCP/IP parameters', enabled: false, category: 'network', risk: 'safe' },
  { id: 'disable-nagle', name: 'Disable Nagle Algorithm', description: 'Reduce network latency for gaming', enabled: false, category: 'network', risk: 'safe' },
  { id: 'network-throttling', name: 'Disable Network Throttling', description: 'Remove multimedia bandwidth limit', enabled: false, category: 'network', risk: 'safe' },
  { id: 'optimize-dns', name: 'Optimize DNS Cache', description: 'Increase DNS cache size & TTL', enabled: false, category: 'network', risk: 'safe' },
  { id: 'disable-wifi-autoconnect', name: 'Disable Wi-Fi AutoConnect', description: 'Prevent auto-connecting to open APs', enabled: false, category: 'network', risk: 'safe' },
  { id: 'disable-ipv6', name: 'Disable IPv6', description: 'Turn off IPv6 protocol stack', enabled: false, category: 'network', risk: 'moderate' },
  { id: 'tcp-optimization', name: 'TCP Optimization', description: 'Window scaling, timestamps, ECN', enabled: false, category: 'network', risk: 'safe' },

  // Power
  { id: 'power-plan', name: 'Ultimate Performance Plan', description: 'Hidden ultimate power plan', enabled: false, category: 'power', risk: 'safe' },
  { id: 'disable-usb-suspend', name: 'Disable USB Selective Suspend', description: 'Prevent USB device disconnects', enabled: false, category: 'power', risk: 'safe' },
  { id: 'disable-pci-power', name: 'Disable PCI Express Power Management', description: 'Full power to PCIe devices', enabled: false, category: 'power', risk: 'safe' },
  { id: 'disable-link-state', name: 'Disable Link State Power', description: 'ASPM off for stability', enabled: false, category: 'power', risk: 'safe' },
  { id: 'disable-sleep', name: 'Disable Sleep', description: 'Prevent system sleep mode', enabled: false, category: 'power', risk: 'safe' },
  { id: 'fast-boot', name: 'Enable Fast Boot', description: 'Hybrid shutdown for faster boot', enabled: false, category: 'power', risk: 'safe' },

  // GPU
  { id: 'gpu-scheduling', name: 'Hardware GPU Scheduling', description: 'Enable hardware-accelerated GPU scheduling', enabled: false, category: 'gpu', risk: 'safe' },
  { id: 'disable-dwm', name: 'Optimize DWM', description: 'Optimize Desktop Window Manager', enabled: false, category: 'gpu', risk: 'moderate' },
  { id: 'disable-gpu-preemption', name: 'Disable GPU Preemption', description: 'Reduce GPU latency for gaming', enabled: false, category: 'gpu', risk: 'moderate' },
  { id: 'force-p-state', name: 'Force Max GPU P-State', description: 'Lock GPU to highest performance', enabled: false, category: 'gpu', risk: 'moderate' },

  // Boot
  { id: 'startup-optimize', name: 'Optimize Boot Sequence', description: 'Parallelize startup, reduce timeout', enabled: false, category: 'boot', risk: 'safe' },
  { id: 'disable-boot-logo', name: 'Disable Boot Logo', description: 'Skip Windows boot animation', enabled: false, category: 'boot', risk: 'safe' },
  { id: 'boot-timeout', name: 'Reduce Boot Timeout', description: 'Set boot menu timeout to 3s', enabled: false, category: 'boot', risk: 'safe' },
  { id: 'disable-boot-log', name: 'Disable Boot Logging', description: 'Skip boot log for faster start', enabled: false, category: 'boot', risk: 'safe' },
];

export interface Preset {
  id: string;
  name: string;
  description: string;
  programs: string[];
  tweaks: string[];
  optimizations: string[];
  createdAt: number;
}

export const builtInPresets: Preset[] = [
  {
    id: 'privacy-focused',
    name: 'Privacy Focused',
    description: 'Maximum privacy with telemetry removal and bloatware cleanup',
    programs: ['firefox', 'keepassxc', 'signal'],
    tweaks: [
      'disable-telemetry', 'disable-cortana', 'disable-activity-history', 'disable-advertising-id',
      'disable-location-tracking', 'disable-feedback', 'disable-wifi-sense', 'disable-cloud-clipboard',
      'disable-timeline', 'disable-bing-search', 'disable-app-suggestions',
      'remove-onedrive', 'remove-xbox', 'remove-teams', 'remove-skype', 'remove-cortana-app',
      'remove-yourphone', 'remove-feedback', 'remove-clipchamp',
      'disable-ceip', 'disable-consolidator', 'disable-usbceip', 'disable-compatibility-appraiser',
      'disable-autorun', 'enable-doh', 'block-netbios', 'disable-llmnr',
    ],
    optimizations: ['disable-delivery-opt'],
    createdAt: Date.now(),
  },
  {
    id: 'gaming-beast',
    name: 'Gaming Beast',
    description: 'Maximum FPS and lowest latency for competitive gaming',
    programs: ['discord', 'obs', '7zip', 'vcredist', 'directx'],
    tweaks: [
      'disable-telemetry', 'remove-onedrive', 'remove-xbox',
      'disable-wupdate-auto', 'disable-indexing', 'disable-superfetch',
      'disable-widgets', 'disable-chat', 'disable-searchbar',
    ],
    optimizations: [
      'disable-animations', 'disable-transparency', 'gaming-mode', 'disable-background-apps',
      'visual-performance', 'process-scheduling', 'disable-core-parking', 'msi-mode',
      'disable-fullscreen-opt', 'disable-nagle', 'network-throttling',
      'power-plan', 'disable-usb-suspend', 'disable-pci-power', 'disable-link-state',
      'gpu-scheduling', 'disable-gpu-preemption', 'startup-optimize',
    ],
    createdAt: Date.now(),
  },
  {
    id: 'minimal-clean',
    name: 'Minimal & Clean',
    description: 'Stripped-down Windows with essential apps only',
    programs: ['chrome', '7zip', 'vlc', 'notepad++', 'everything', 'vcredist'],
    tweaks: [
      'disable-cortana', 'disable-advertising-id', 'disable-bing-search',
      'remove-onedrive', 'remove-xbox', 'remove-teams', 'remove-skype', 'remove-maps',
      'remove-weather', 'remove-news', 'remove-people', 'remove-yourphone',
      'remove-groove', 'remove-mixedreality', 'remove-feedback', 'remove-3dviewer',
      'remove-paint3d', 'remove-solitaire', 'remove-tips', 'remove-clipchamp',
      'remove-getstarted', 'remove-todos',
      'classic-context', 'show-extensions', 'disable-widgets', 'disable-chat',
    ],
    optimizations: [
      'disable-animations', 'disable-background-apps', 'ssd-optimize',
      'disable-hibernation', 'compact-os', 'startup-optimize',
    ],
    createdAt: Date.now(),
  },
  {
    id: 'developer-workstation',
    name: 'Developer Workstation',
    description: 'Full dev environment with WSL, containers, and tools',
    programs: [
      'vscode', 'git', 'nodejs', 'python', 'windows-terminal', 'powershell7',
      'winscp', 'putty', '7zip', 'everything', 'firefox', 'chrome',
      'docker', 'wireshark', 'keepassxc',
    ],
    tweaks: [
      'disable-telemetry', 'disable-cortana', 'show-extensions', 'show-hidden',
      'classic-context', 'disable-bing-search',
      'remove-xbox', 'remove-teams', 'remove-skype', 'remove-solitaire',
      'enable-wsl', 'enable-hyper-v', 'enable-sandbox', 'enable-ssh',
    ],
    optimizations: [
      'disable-background-apps', 'ssd-optimize', 'network-optimize',
      'power-plan', 'startup-optimize',
    ],
    createdAt: Date.now(),
  },
];

export const tabCategories = [
  { id: 'programs', label: 'Programs' },
  { id: 'tweaks', label: 'Tweaks' },
  { id: 'optimizations', label: 'Optimizations' },
] as const;