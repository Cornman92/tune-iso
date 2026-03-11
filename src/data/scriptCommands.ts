/**
 * Real executable commands for each customization item.
 * Used by LiveScriptPreview and PowerShellExport to generate functional scripts.
 */

// ── Program → winget ID mapping ──
export const wingetIds: Record<string, string> = {
  // Browsers
  'chrome': 'Google.Chrome',
  'firefox': 'Mozilla.Firefox',
  'brave': 'Brave.Brave',
  'edge-chromium': 'Microsoft.Edge',
  'vivaldi': 'VivaldiTechnologies.Vivaldi',
  'ungoogled-chromium': 'eloston.ungoogled-chromium',
  'tor-browser': 'TorProject.TorBrowser',
  'opera-gx': 'Opera.OperaGX',
  'librewolf': 'LibreWolf.LibreWolf',
  'waterfox': 'Waterfox.Waterfox',

  // Development
  'vscode': 'Microsoft.VisualStudioCode',
  'vscodium': 'VSCodium.VSCodium',
  'notepad++': 'Notepad++.Notepad++',
  'sublime': 'SublimeHQ.SublimeText.4',
  'jetbrains-toolbox': 'JetBrains.Toolbox',
  'git': 'Git.Git',
  'github-desktop': 'GitHub.GitHubDesktop',
  'nodejs': 'OpenJS.NodeJS.LTS',
  'python': 'Python.Python.3.12',
  'rust': 'Rustlang.Rustup',
  'golang': 'GoLang.Go',
  'docker-desktop': 'Docker.DockerDesktop',
  'winscp': 'WinSCP.WinSCP',
  'putty': 'SimonTatham.PuTTY',
  'windows-terminal': 'Microsoft.WindowsTerminal',
  'powershell7': 'Microsoft.PowerShell',
  'postman': 'Postman.Postman',
  'insomnia': 'Kong.Insomnia',
  'dbeaver': 'dbeaver.dbeaver',
  'heidisql': 'HeidiSQL.HeidiSQL',
  'filezilla': 'TimKosse.FileZilla.Client',
  'cmake': 'Kitware.CMake',
  'mingw': 'MSYS2.MSYS2',

  // Utilities
  '7zip': '7zip.7zip',
  'winrar': 'RARLab.WinRAR',
  'peazip': 'Giorgiotani.Peazip',
  'everything': 'voidtools.Everything',
  'sharex': 'ShareX.ShareX',
  'greenshot': 'Greenshot.Greenshot',
  'windirstat': 'WinDirStat.WinDirStat',
  'treesize': 'JAMSoftware.TreeSize.Free',
  'totalcmd': 'Ghisler.TotalCommander',
  'doublecmd': 'alexx2000.DoubleCommander',
  'autoruns': 'Microsoft.Sysinternals.Autoruns',
  'procexp': 'Microsoft.Sysinternals.ProcessExplorer',
  'procmon': 'Microsoft.Sysinternals.ProcessMonitor',
  'hwinfo': 'REALiX.HWiNFO',
  'cpuz': 'CPUID.CPU-Z',
  'gpuz': 'TechPowerUp.GPU-Z',
  'crystaldisk': 'CrystalDewWorld.CrystalDiskInfo',
  'crystaldiskmark': 'CrystalDewWorld.CrystalDiskMark',
  'rufus': 'Rufus.Rufus',
  'ventoy': 'Ventoy.Ventoy',
  'powertoys': 'Microsoft.PowerToys',
  'quicklook': 'QL-Win.QuickLook',
  'bulk-crap-uninstaller': 'Klocman.BulkCrapUninstaller',
  'revo-uninstaller': 'VS Revo Group.Revo Uninstaller',
  'bleachbit': 'BleachBit.BleachBit',
  'ccleaner': 'Piriform.CCleaner',
  'ditto': 'DittoClipboard.Ditto',
  'autohotkey': 'AutoHotkey.AutoHotkey',
  'syncthing': 'Syncthing.Syncthing',
  'teracopy': 'CodeSector.TeraCopy',

  // Media
  'vlc': 'VideoLAN.VLC',
  'mpv': 'mpv.net',
  'mpc-hc': 'clsid2.mpc-hc',
  'potplayer': 'Daum.PotPlayer',
  'foobar': 'PeterPawlowski.foobar2000',
  'musicbee': 'MusicBee.MusicBee',
  'spotify': 'Spotify.Spotify',
  'irfanview': 'IrfanSkiljan.IrfanView',
  'obs': 'OBSProject.OBSStudio',
  'gimp': 'GIMP.GIMP',
  'paint-net': 'dotPDN.PaintDotNet',
  'krita': 'KDE.Krita',
  'inkscape': 'Inkscape.Inkscape',
  'handbrake': 'HandBrake.HandBrake',
  'audacity': 'Audacity.Audacity',
  'kdenlive': 'KDE.Kdenlive',
  'blender': 'BlenderFoundation.Blender',
  'screentogif': 'NickeManarin.ScreenToGif',

  // Productivity
  'libreoffice': 'TheDocumentFoundation.LibreOffice',
  'onlyoffice': 'ONLYOFFICE.DesktopEditors',
  'sumatra-pdf': 'SumatraPDF.SumatraPDF',
  'foxit-reader': 'Foxit.FoxitReader',
  'obsidian': 'Obsidian.Obsidian',
  'notion': 'Notion.Notion',
  'joplin': 'Joplin.Joplin',
  'calibre': 'calibre.calibre',

  // Communication
  'discord': 'Discord.Discord',
  'telegram': 'Telegram.TelegramDesktop',
  'signal': 'OpenWhisperSystems.Signal',
  'thunderbird': 'Mozilla.Thunderbird',
  'slack': 'SlackTechnologies.Slack',
  'zoom': 'Zoom.Zoom',
  'element': 'Element.Element',

  // Gaming
  'steam': 'Valve.Steam',
  'epic-games': 'EpicGames.EpicGamesLauncher',
  'gog-galaxy': 'GOG.Galaxy',
  'ea-app': 'ElectronicArts.EADesktop',
  'playnite': 'Playnite.Playnite',
  'ds4windows': 'Ryochan7.DS4Windows',

  // Security
  'keepassxc': 'KeePassXCTeam.KeePassXC',
  'bitwarden': 'Bitwarden.Bitwarden',
  'veracrypt': 'IDRIX.VeraCrypt',
  'wireshark': 'WiresharkFoundation.Wireshark',
  'malwarebytes': 'Malwarebytes.Malwarebytes',
  'simplewall': 'Henry++.simplewall',
  'gpg4win': 'GnuPG.Gpg4win',
  'cryptomator': 'Cryptomator.Cryptomator',

  // Networking
  'qbittorrent': 'qBittorrent.qBittorrent',
  'wireguard': 'WireGuard.WireGuard',
  'openvpn': 'OpenVPNTechnologies.OpenVPN',
  'mullvad-vpn': 'MullvadVPN.MullvadVPN',
  'protonvpn': 'ProtonTechnologies.ProtonVPN',
  'nmap': 'Insecure.Nmap',

  // Virtualization
  'virtualbox': 'Oracle.VirtualBox',
  'sandboxie-plus': 'sandboxie-plus.SandboxiePlus',

  // Runtimes
  'dotnet-desktop': 'Microsoft.DotNet.DesktopRuntime.8',
  'dotnet-sdk': 'Microsoft.DotNet.SDK.8',
  'vcredist': 'Microsoft.VCRedist.2015+.x64',
  'java': 'EclipseAdoptium.Temurin.21.JRE',
  'webview2': 'Microsoft.EdgeWebView2Runtime',

  // System Tools
  'wiztree': 'AntibodySoftware.WizTree',

  // Customization
  'open-shell': 'Open-Shell.Open-Shell-Menu',
  'translucenttb': 'TranslucentTB.TranslucentTB',
  'rainmeter': 'Rainmeter.Rainmeter',
  'eartrumpet': 'File-New-Project.EarTrumpet',
  'files-app': 'Files-Community.Files',

  // Cloud
  'nextcloud-client': 'Nextcloud.NextcloudDesktop',
  'rclone': 'Rclone.Rclone',
  'dropbox': 'Dropbox.Dropbox',

  // Remote Access
  'rustdesk': 'RustDesk.RustDesk',
  'anydesk': 'AnyDeskSoftware.AnyDesk',
  'parsec': 'Parsec.Parsec',
  'tailscale': 'tailscale.tailscale',
  'zerotier': 'ZeroTier.ZeroTierOne',
};

// ── Tweak → actual registry/PowerShell commands (offline image context) ──
// Commands use $MountDir for offline hive paths. Hives must be loaded first.
export const tweakScripts: Record<string, string[]> = {
  // Privacy
  'disable-telemetry': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v MaxTelemetryAllowed /t REG_DWORD /d 0 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f',
  ],
  'disable-cortana': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" /v AllowCortana /t REG_DWORD /d 0 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" /v AllowCortanaAboveLock /t REG_DWORD /d 0 /f',
  ],
  'disable-activity-history': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\System" /v EnableActivityFeed /t REG_DWORD /d 0 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\System" /v PublishUserActivities /t REG_DWORD /d 0 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\System" /v UploadUserActivities /t REG_DWORD /d 0 /f',
  ],
  'disable-advertising-id': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\AdvertisingInfo" /v DisabledByGroupPolicy /t REG_DWORD /d 1 /f',
  ],
  'disable-location-tracking': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\LocationAndSensors" /v DisableLocation /t REG_DWORD /d 1 /f',
  ],
  'disable-feedback': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v DoNotShowFeedbackNotifications /t REG_DWORD /d 1 /f',
  ],
  'disable-wifi-sense': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\WcmSvc\\wifinetworkmanager\\config" /v AutoConnectAllowedOEM /t REG_DWORD /d 0 /f',
  ],
  'disable-cloud-clipboard': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\System" /v AllowClipboardHistory /t REG_DWORD /d 0 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\System" /v AllowCrossDeviceClipboard /t REG_DWORD /d 0 /f',
  ],
  'disable-timeline': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\System" /v EnableActivityFeed /t REG_DWORD /d 0 /f',
  ],
  'disable-handwriting-data': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\TabletPC" /v PreventHandwritingDataSharing /t REG_DWORD /d 1 /f',
  ],
  'disable-app-suggestions': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent" /v DisableWindowsConsumerFeatures /t REG_DWORD /d 1 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent" /v DisableSoftLanding /t REG_DWORD /d 1 /f',
  ],
  'disable-bing-search': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\Explorer" /v DisableSearchBoxSuggestions /t REG_DWORD /d 1 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" /v DisableWebSearch /t REG_DWORD /d 1 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" /v ConnectedSearchUseWeb /t REG_DWORD /d 0 /f',
  ],
  'disable-copilot': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsCopilot" /v TurnOffWindowsCopilot /t REG_DWORD /d 1 /f',
  ],
  'disable-recall': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsAI" /v DisableAIDataAnalysis /t REG_DWORD /d 1 /f',
  ],
  'disable-online-tips': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v AllowOnlineTips /t REG_DWORD /d 0 /f',
  ],
  'disable-tailored-experiences': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent" /v DisableTailoredExperiencesWithDiagnosticData /t REG_DWORD /d 1 /f',
  ],
  'disable-input-personalization': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\InputPersonalization" /v RestrictImplicitInkCollection /t REG_DWORD /d 1 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\InputPersonalization" /v RestrictImplicitTextCollection /t REG_DWORD /d 1 /f',
  ],
  'disable-diagnostic-data': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 1 /f',
  ],

  // Bloatware - handled via DISM Remove-ProvisionedAppxPackage, script just echos
  'remove-onedrive': [
    '# OneDrive removal (run after first boot):',
    '# taskkill /f /im OneDrive.exe',
    '# "%SystemRoot%\\SysWOW64\\OneDriveSetup.exe" /uninstall',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\OneDrive" /v DisableFileSyncNGSC /t REG_DWORD /d 1 /f',
  ],
  'remove-xbox': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\GameDVR" /v AllowGameDVR /t REG_DWORD /d 0 /f',
  ],
  'remove-teams': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Office\\16.0\\common\\officeupdate" /v preventteamsinstall /t REG_DWORD /d 1 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Communications" /v ConfigureChatAutoInstall /t REG_DWORD /d 0 /f',
  ],

  // UI Tweaks
  'classic-context': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\\InprocServer32" /ve /t REG_SZ /d "" /f',
  ],
  'show-extensions': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v HideFileExt /t REG_DWORD /d 0 /f',
  ],
  'show-hidden': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Hidden /t REG_DWORD /d 1 /f',
  ],
  'show-super-hidden': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ShowSuperHidden /t REG_DWORD /d 1 /f',
  ],
  'taskbar-left': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarAl /t REG_DWORD /d 0 /f',
  ],
  'disable-widgets': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Dsh" /v AllowNewsAndInterests /t REG_DWORD /d 0 /f',
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarDa /t REG_DWORD /d 0 /f',
  ],
  'disable-chat': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarMn /t REG_DWORD /d 0 /f',
  ],
  'disable-searchbar': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Search" /v SearchboxTaskbarMode /t REG_DWORD /d 0 /f',
  ],
  'disable-taskview': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ShowTaskViewButton /t REG_DWORD /d 0 /f',
  ],
  'dark-mode': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v AppsUseLightTheme /t REG_DWORD /d 0 /f',
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v SystemUsesLightTheme /t REG_DWORD /d 0 /f',
  ],
  'compact-view': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v UseCompactMode /t REG_DWORD /d 1 /f',
  ],
  'disable-lockscreen': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\Personalization" /v NoLockScreen /t REG_DWORD /d 1 /f',
  ],
  'end-task-taskbar': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarDeveloperSettings" /v TaskbarEndTask /t REG_DWORD /d 1 /f',
  ],
  'verbose-status': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v VerboseStatus /t REG_DWORD /d 1 /f',
  ],
  'open-explorer-thispc': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v LaunchTo /t REG_DWORD /d 1 /f',
  ],
  'disable-recent-files': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer" /v ShowRecent /t REG_DWORD /d 0 /f',
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer" /v ShowFrequent /t REG_DWORD /d 0 /f',
  ],
  'disable-sticky-keys': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Control Panel\\Accessibility\\StickyKeys" /v Flags /t REG_SZ /d "506" /f',
  ],
  'num-lock-on': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Control Panel\\Keyboard" /v InitialKeyboardIndicators /t REG_SZ /d "2147483650" /f',
  ],
  'disable-news-feed': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Feeds" /v EnableFeeds /t REG_DWORD /d 0 /f',
  ],

  // Services — disabled by setting Start=4 in offline SYSTEM hive
  'disable-wupdate-auto': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\wuauserv" /v Start /t REG_DWORD /d 4 /f',
  ],
  'disable-superfetch': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\SysMain" /v Start /t REG_DWORD /d 4 /f',
  ],
  'disable-indexing': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\WSearch" /v Start /t REG_DWORD /d 4 /f',
  ],
  'disable-print-spooler': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\Spooler" /v Start /t REG_DWORD /d 4 /f',
  ],
  'disable-remote-desktop': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 1 /f',
  ],
  'disable-remote-registry': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\RemoteRegistry" /v Start /t REG_DWORD /d 4 /f',
  ],
  'disable-connected-devices': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\CDPUserSvc" /v Start /t REG_DWORD /d 4 /f',
  ],
  'disable-diagnostics': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\DiagTrack" /v Start /t REG_DWORD /d 4 /f',
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\diagnosticshub.standardcollector.service" /v Start /t REG_DWORD /d 4 /f',
  ],
  'disable-error-reporting': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\WerSvc" /v Start /t REG_DWORD /d 4 /f',
  ],
  'disable-fax': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\Fax" /v Start /t REG_DWORD /d 4 /f',
  ],
  'disable-geolocation': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\lfsvc" /v Start /t REG_DWORD /d 4 /f',
  ],
  'disable-dmwappush': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\dmwappushservice" /v Start /t REG_DWORD /d 4 /f',
  ],
  'disable-xbox-services': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\XblAuthManager" /v Start /t REG_DWORD /d 4 /f',
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\XblGameSave" /v Start /t REG_DWORD /d 4 /f',
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\XboxNetApiSvc" /v Start /t REG_DWORD /d 4 /f',
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\XboxGipSvc" /v Start /t REG_DWORD /d 4 /f',
  ],
  'disable-phone-service': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\PhoneSvc" /v Start /t REG_DWORD /d 4 /f',
  ],
  'disable-wallet': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\WalletService" /v Start /t REG_DWORD /d 4 /f',
  ],
  'disable-insider': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\wisvc" /v Start /t REG_DWORD /d 4 /f',
  ],
  'disable-retaildemo': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\RetailDemo" /v Start /t REG_DWORD /d 4 /f',
  ],

  // Scheduled Tasks
  'disable-ceip': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\SQMClient\\Windows" /v CEIPEnable /t REG_DWORD /d 0 /f',
  ],
  'disable-consolidator': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f',
  ],
  'disable-usbceip': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\SQMClient\\Windows" /v CEIPEnable /t REG_DWORD /d 0 /f',
  ],
  'disable-compatibility-appraiser': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\AppCompat" /v AITEnable /t REG_DWORD /d 0 /f',
  ],

  // Security
  'disable-autorun': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoDriveTypeAutoRun /t REG_DWORD /d 255 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoAutorun /t REG_DWORD /d 1 /f',
  ],
  'uac-max': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v ConsentPromptBehaviorAdmin /t REG_DWORD /d 2 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v PromptOnSecureDesktop /t REG_DWORD /d 1 /f',
  ],
  'enable-doh': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\Dnscache\\Parameters" /v EnableAutoDoh /t REG_DWORD /d 2 /f',
  ],
  'block-netbios': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\NetBT\\Parameters" /v NodeType /t REG_DWORD /d 2 /f',
  ],
  'disable-llmnr': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows NT\\DNSClient" /v EnableMulticast /t REG_DWORD /d 0 /f',
  ],
  'disable-wpad': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\WinHttpAutoProxySvc" /v Start /t REG_DWORD /d 4 /f',
  ],
  'enable-memory-integrity': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\DeviceGuard\\Scenarios\\HypervisorEnforcedCodeIntegrity" /v Enabled /t REG_DWORD /d 1 /f',
  ],
  'disable-admin-shares': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\LanmanServer\\Parameters" /v AutoShareWks /t REG_DWORD /d 0 /f',
  ],
  'disable-guest-account': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon" /v AllowGuest /t REG_DWORD /d 0 /f',
  ],

  // Group Policy
  'gpo-disable-store': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\WindowsStore" /v RemoveWindowsStore /t REG_DWORD /d 1 /f',
  ],
  'gpo-disable-consumer-features': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent" /v DisableWindowsConsumerFeatures /t REG_DWORD /d 1 /f',
  ],
  'gpo-disable-cloud-content': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent" /v DisableCloudOptimizedContent /t REG_DWORD /d 1 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent" /v DisableConsumerAccountStateContent /t REG_DWORD /d 1 /f',
  ],
  'gpo-disable-onedrive': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\OneDrive" /v DisableFileSyncNGSC /t REG_DWORD /d 1 /f',
  ],
  'gpo-disable-telemetry': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v DisableEnterpriseAuthProxy /t REG_DWORD /d 1 /f',
  ],
  'gpo-disable-script-host': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows Script Host\\Settings" /v Enabled /t REG_DWORD /d 0 /f',
  ],
};

// ── Optimization → actual registry/powershell commands (offline) ──
export const optimizationScripts: Record<string, string[]> = {
  // Performance
  'disable-animations': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Control Panel\\Desktop\\WindowMetrics" /v MinAnimate /t REG_SZ /d "0" /f',
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects" /v VisualFXSetting /t REG_DWORD /d 2 /f',
  ],
  'disable-transparency': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v EnableTransparency /t REG_DWORD /d 0 /f',
  ],
  'gaming-mode': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\GameBar" /v AutoGameModeEnabled /t REG_DWORD /d 1 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\GameDVR" /v AllowGameDVR /t REG_DWORD /d 0 /f',
  ],
  'disable-background-apps': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications" /v GlobalUserDisabled /t REG_DWORD /d 1 /f',
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Search" /v BackgroundAppGlobalToggle /t REG_DWORD /d 0 /f',
  ],
  'visual-performance': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects" /v VisualFXSetting /t REG_DWORD /d 2 /f',
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Control Panel\\Desktop" /v UserPreferencesMask /t REG_BINARY /d 9012078010000000 /f',
  ],
  'process-scheduling': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\PriorityControl" /v Win32PrioritySeparation /t REG_DWORD /d 38 /f',
  ],
  'disable-core-parking': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\Power\\PowerSettings\\54533251-82be-4824-96c1-47b60b740d00\\0cc5b647-c1df-4637-891a-dec35c318583" /v ValueMax /t REG_DWORD /d 0 /f',
  ],
  'disable-fullscreen-opt': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\Session Manager\\Environment" /v __COMPAT_LAYER /t REG_SZ /d "~ DISABLEDXMAXIMIZEDWINDOWEDMODE" /f',
  ],
  'disable-game-dvr': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\GameDVR" /v AllowGameDVR /t REG_DWORD /d 0 /f',
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\System\\GameConfigStore" /v GameDVR_Enabled /t REG_DWORD /d 0 /f',
  ],
  'disable-game-bar': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Software\\Microsoft\\GameBar" /v ShowStartupPanel /t REG_DWORD /d 0 /f',
  ],
  'disable-power-throttling': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\Power\\PowerThrottling" /v PowerThrottlingOff /t REG_DWORD /d 1 /f',
  ],

  // Memory
  'disable-pagefile': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\Session Manager\\Memory Management" /v PagingFiles /t REG_MULTI_SZ /d "" /f',
  ],
  'optimize-pagefile': [
    '# Pagefile will be configured on first boot via SetupComplete.cmd',
    '# wmic computersystem where name="%computername%" set AutomaticManagedPagefile=False',
  ],
  'disable-prefetch': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\Session Manager\\Memory Management\\PrefetchParameters" /v EnablePrefetcher /t REG_DWORD /d 0 /f',
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\Session Manager\\Memory Management\\PrefetchParameters" /v EnableSuperfetch /t REG_DWORD /d 0 /f',
  ],
  'disable-memory-compression': [
    '# Memory compression must be disabled at runtime:',
    '# Disable-MMAgent -MemoryCompression',
  ],
  'disable-swap-file': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\Session Manager\\Memory Management" /v SwapfileControl /t REG_DWORD /d 0 /f',
  ],

  // Storage
  'ssd-optimize': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\FileSystem" /v DisableDeleteNotification /t REG_DWORD /d 0 /f',
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\Session Manager\\Memory Management\\PrefetchParameters" /v EnableSuperfetch /t REG_DWORD /d 0 /f',
  ],
  'disable-hibernation': [
    '# Hibernation must be disabled at runtime: powercfg /h off',
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\Power" /v HibernateEnabled /t REG_DWORD /d 0 /f',
  ],
  'disable-system-restore': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows NT\\SystemRestore" /v DisableSR /t REG_DWORD /d 1 /f',
  ],
  'disable-delivery-opt': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Policies\\Microsoft\\Windows\\DeliveryOptimization" /v DODownloadMode /t REG_DWORD /d 0 /f',
  ],
  'disable-reserved-storage': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\ReserveManager" /v ShippedWithReserves /t REG_DWORD /d 0 /f',
  ],
  'disable-last-access': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\FileSystem" /v NtfsDisableLastAccessUpdate /t REG_DWORD /d 2147483649 /f',
  ],
  'disable-8dot3': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\FileSystem" /v NtfsDisable8dot3NameCreation /t REG_DWORD /d 1 /f',
  ],

  // Network
  'network-optimize': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\Tcpip\\Parameters" /v TcpAckFrequency /t REG_DWORD /d 1 /f',
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\Tcpip\\Parameters" /v TCPNoDelay /t REG_DWORD /d 1 /f',
  ],
  'disable-nagle': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\Tcpip\\Parameters" /v TcpAckFrequency /t REG_DWORD /d 1 /f',
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\Tcpip\\Parameters" /v TCPNoDelay /t REG_DWORD /d 1 /f',
  ],
  'network-throttling': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v NetworkThrottlingIndex /t REG_DWORD /d 4294967295 /f',
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 0 /f',
  ],
  'optimize-dns': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\Dnscache\\Parameters" /v MaxCacheTtl /t REG_DWORD /d 86400 /f',
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\Dnscache\\Parameters" /v MaxNegativeCacheTtl /t REG_DWORD /d 5 /f',
  ],
  'disable-ipv6': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\Tcpip6\\Parameters" /v DisabledComponents /t REG_DWORD /d 255 /f',
  ],

  // Power
  'power-plan': [
    '# Ultimate Performance plan must be enabled at runtime:',
    '# powercfg /duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61',
    '# powercfg /setactive e9a42b02-d5df-448d-aa00-03f14749eb61',
  ],
  'disable-usb-suspend': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Services\\USB" /v DisableSelectiveSuspend /t REG_DWORD /d 1 /f',
  ],
  'fast-boot': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\Session Manager\\Power" /v HiberbootEnabled /t REG_DWORD /d 1 /f',
  ],

  // GPU
  'gpu-scheduling': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\GraphicsDrivers" /v HwSchMode /t REG_DWORD /d 2 /f',
  ],
  'disable-gpu-preemption': [
    'REG ADD "HKLM\\OFFLINE_SYSTEM\\ControlSet001\\Control\\GraphicsDrivers\\Scheduler" /v EnablePreemption /t REG_DWORD /d 0 /f',
  ],

  // Boot
  'startup-optimize': [
    'REG ADD "HKLM\\OFFLINE_SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Serialize" /v StartupDelayInMSec /t REG_DWORD /d 0 /f',
  ],
  'disable-boot-logo': [
    '# Must run at runtime: bcdedit /set {current} quietboot yes',
  ],
  'boot-timeout': [
    '# Must run at runtime: bcdedit /timeout 3',
  ],

  // Input
  'raw-mouse-input': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Control Panel\\Mouse" /v MouseSpeed /t REG_SZ /d "0" /f',
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Control Panel\\Mouse" /v MouseThreshold1 /t REG_SZ /d "0" /f',
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Control Panel\\Mouse" /v MouseThreshold2 /t REG_SZ /d "0" /f',
  ],
  'disable-mouse-accel': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Control Panel\\Mouse" /v MouseSpeed /t REG_SZ /d "0" /f',
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Control Panel\\Mouse" /v MouseThreshold1 /t REG_SZ /d "0" /f',
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Control Panel\\Mouse" /v MouseThreshold2 /t REG_SZ /d "0" /f',
  ],
  'keyboard-response': [
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Control Panel\\Keyboard" /v KeyboardDelay /t REG_SZ /d "0" /f',
    'REG ADD "HKLM\\OFFLINE_DEFAULT\\Control Panel\\Keyboard" /v KeyboardSpeed /t REG_SZ /d "31" /f',
  ],

  // Audio
  'disable-audio-enhancements': [
    '# Audio enhancements must be disabled at runtime via Sound settings',
  ],
};
