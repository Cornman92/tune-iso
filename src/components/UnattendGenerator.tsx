import { useState, useEffect, MutableRefObject } from 'react';
import {
  FileCode, Copy, Check, RotateCcw, Globe, HardDrive, Key, User, MonitorSmartphone,
  ShieldCheck, Terminal, Wifi, Zap, ChevronRight, Cpu, Eye, EyeOff
} from 'lucide-react';
import { escapeXml } from '@/lib/sanitize';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface AnswerOption {
  id: string;
  label: string;
  description: string;
  type: 'text' | 'select' | 'boolean' | 'password';
  category: string;
  defaultValue: string;
  value: string;
  options?: { value: string; label: string }[];
  xmlPath: string;
  enabled: boolean;
}

const defaultOptions: AnswerOption[] = [
  // Regional
  { id: 'input-locale', label: 'Input Locale', description: 'Keyboard layout (e.g., 0409:00000409)', type: 'text', category: 'regional', defaultValue: '0409:00000409', value: '0409:00000409', xmlPath: 'Microsoft-Windows-International-Core/InputLocale', enabled: true },
  { id: 'system-locale', label: 'System Locale', description: 'System locale for non-Unicode programs', type: 'text', category: 'regional', defaultValue: 'en-US', value: 'en-US', xmlPath: 'Microsoft-Windows-International-Core/SystemLocale', enabled: true },
  { id: 'ui-language', label: 'UI Language', description: 'Windows display language', type: 'text', category: 'regional', defaultValue: 'en-US', value: 'en-US', xmlPath: 'Microsoft-Windows-International-Core/UILanguage', enabled: true },
  { id: 'user-locale', label: 'User Locale', description: 'Format for dates, times, currency', type: 'text', category: 'regional', defaultValue: 'en-US', value: 'en-US', xmlPath: 'Microsoft-Windows-International-Core/UserLocale', enabled: true },
  { id: 'timezone', label: 'Time Zone', description: 'System time zone', type: 'select', category: 'regional', defaultValue: 'Eastern Standard Time', value: 'Eastern Standard Time', options: [
    { value: 'Hawaiian Standard Time', label: 'Hawaii (UTC-10)' },
    { value: 'Alaskan Standard Time', label: 'Alaska (UTC-9)' },
    { value: 'Pacific Standard Time', label: 'Pacific (UTC-8)' },
    { value: 'Mountain Standard Time', label: 'Mountain (UTC-7)' },
    { value: 'Central Standard Time', label: 'Central (UTC-6)' },
    { value: 'Eastern Standard Time', label: 'Eastern (UTC-5)' },
    { value: 'Atlantic Standard Time', label: 'Atlantic (UTC-4)' },
    { value: 'GMT Standard Time', label: 'UK (UTC+0)' },
    { value: 'W. Europe Standard Time', label: 'W. Europe (UTC+1)' },
    { value: 'E. Europe Standard Time', label: 'E. Europe (UTC+2)' },
    { value: 'Russian Standard Time', label: 'Moscow (UTC+3)' },
    { value: 'India Standard Time', label: 'India (UTC+5:30)' },
    { value: 'China Standard Time', label: 'China (UTC+8)' },
    { value: 'Tokyo Standard Time', label: 'Tokyo (UTC+9)' },
    { value: 'AUS Eastern Standard Time', label: 'Australia Eastern (UTC+10)' },
  ], xmlPath: 'Microsoft-Windows-Shell-Setup/TimeZone', enabled: true },
  { id: 'geo-id', label: 'GeoID', description: 'Geographic location ID (244 = US)', type: 'text', category: 'regional', defaultValue: '244', value: '244', xmlPath: 'Microsoft-Windows-International-Core/GeoID', enabled: false },

  // Disk
  { id: 'disk-id', label: 'Disk Number', description: 'Target disk number (usually 0)', type: 'text', category: 'disk', defaultValue: '0', value: '0', xmlPath: 'DiskConfiguration/Disk/DiskID', enabled: true },
  { id: 'partition-style', label: 'Partition Style', description: 'GPT (UEFI) or MBR (Legacy BIOS)', type: 'select', category: 'disk', defaultValue: 'GPT', value: 'GPT', options: [
    { value: 'GPT', label: 'GPT (UEFI)' },
    { value: 'MBR', label: 'MBR (Legacy BIOS)' },
  ], xmlPath: 'DiskConfiguration/Disk/PartitionStyle', enabled: true },
  { id: 'wipe-disk', label: 'Wipe Disk', description: 'Clean all partitions before install', type: 'boolean', category: 'disk', defaultValue: 'true', value: 'true', xmlPath: 'DiskConfiguration/Disk/WillWipeDisk', enabled: true },
  { id: 'efi-size', label: 'EFI Partition Size (MB)', description: 'EFI System Partition size', type: 'text', category: 'disk', defaultValue: '300', value: '300', xmlPath: 'DiskConfiguration/Disk/Partitions/EFI/Size', enabled: true },
  { id: 'recovery-size', label: 'Recovery Partition Size (MB)', description: 'Windows Recovery partition', type: 'text', category: 'disk', defaultValue: '1024', value: '1024', xmlPath: 'DiskConfiguration/Disk/Partitions/Recovery/Size', enabled: false },
  { id: 'install-to-partition', label: 'Install Partition Number', description: 'Partition to install Windows (usually 3)', type: 'text', category: 'disk', defaultValue: '3', value: '3', xmlPath: 'ImageInstall/OSImage/InstallTo/PartitionID', enabled: true },

  // Product
  { id: 'product-key', label: 'Product Key', description: 'Windows license key (or generic KMS key)', type: 'text', category: 'product', defaultValue: '', value: '', xmlPath: 'Microsoft-Windows-Setup/UserData/ProductKey/Key', enabled: false },
  { id: 'accept-eula', label: 'Accept EULA', description: 'Auto-accept license agreement', type: 'boolean', category: 'product', defaultValue: 'true', value: 'true', xmlPath: 'Microsoft-Windows-Setup/UserData/AcceptEula', enabled: true },
  { id: 'image-index', label: 'Image Index', description: 'WIM image index (6=Pro, 1=Home, etc.)', type: 'select', category: 'product', defaultValue: '6', value: '6', options: [
    { value: '1', label: '1 — Windows Home' },
    { value: '2', label: '2 — Windows Home N' },
    { value: '3', label: '3 — Windows Education' },
    { value: '4', label: '4 — Windows Education N' },
    { value: '5', label: '5 — Windows Pro N' },
    { value: '6', label: '6 — Windows Pro' },
    { value: '7', label: '7 — Windows Pro for Workstations' },
    { value: '8', label: '8 — Windows Enterprise' },
  ], xmlPath: 'ImageInstall/OSImage/InstallFrom/MetaData/Value', enabled: true },
  { id: 'skip-product-key', label: 'Skip Product Key Screen', description: 'Bypass key entry during install', type: 'boolean', category: 'product', defaultValue: 'true', value: 'true', xmlPath: 'Microsoft-Windows-Setup/UserData/ProductKey/WillShowUI', enabled: true },

  // User
  { id: 'user-name', label: 'Username', description: 'Local admin account name', type: 'text', category: 'user', defaultValue: 'User', value: 'User', xmlPath: 'Microsoft-Windows-Shell-Setup/UserAccounts/LocalAccounts/LocalAccount/Name', enabled: true },
  { id: 'user-password', label: 'Password', description: 'Account password (blank = no password)', type: 'password', category: 'user', defaultValue: '', value: '', xmlPath: 'Microsoft-Windows-Shell-Setup/UserAccounts/LocalAccounts/LocalAccount/Password/Value', enabled: false },
  { id: 'auto-logon', label: 'Auto Logon', description: 'Skip login screen on boot', type: 'boolean', category: 'user', defaultValue: 'true', value: 'true', xmlPath: 'Microsoft-Windows-Shell-Setup/AutoLogon/Enabled', enabled: true },
  { id: 'auto-logon-count', label: 'Auto Logon Count', description: 'Number of times to auto-logon (999 = always)', type: 'text', category: 'user', defaultValue: '999', value: '999', xmlPath: 'Microsoft-Windows-Shell-Setup/AutoLogon/LogonCount', enabled: true },
  { id: 'disable-admin', label: 'Disable Built-in Admin', description: 'Disable the built-in Administrator account', type: 'boolean', category: 'user', defaultValue: 'true', value: 'true', xmlPath: 'Microsoft-Windows-Shell-Setup/UserAccounts/AdministratorPassword/Enabled', enabled: false },
  { id: 'computer-name', label: 'Computer Name', description: 'PC hostname (* = random)', type: 'text', category: 'user', defaultValue: '*', value: '*', xmlPath: 'Microsoft-Windows-Shell-Setup/ComputerName', enabled: true },
  { id: 'registered-org', label: 'Registered Organization', description: 'Organization name in system info', type: 'text', category: 'user', defaultValue: '', value: '', xmlPath: 'Microsoft-Windows-Shell-Setup/RegisteredOrganization', enabled: false },
  { id: 'registered-owner', label: 'Registered Owner', description: 'Owner name in system info', type: 'text', category: 'user', defaultValue: '', value: '', xmlPath: 'Microsoft-Windows-Shell-Setup/RegisteredOwner', enabled: false },

  // OOBE
  { id: 'hide-eula', label: 'Hide EULA Page', description: 'Skip EULA during OOBE', type: 'boolean', category: 'oobe', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/HideEULAPage', enabled: true },
  { id: 'hide-oem-reg', label: 'Hide OEM Registration', description: 'Skip OEM registration screen', type: 'boolean', category: 'oobe', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/HideOEMRegistrationScreen', enabled: true },
  { id: 'hide-online-account', label: 'Hide Online Account Screen', description: 'Skip Microsoft account creation', type: 'boolean', category: 'oobe', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/HideOnlineAccountScreens', enabled: true },
  { id: 'hide-wireless', label: 'Hide Wireless Setup', description: 'Skip Wi-Fi setup during OOBE', type: 'boolean', category: 'oobe', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/HideWirelessSetupInOOBE', enabled: true },
  { id: 'network-location', label: 'Network Location', description: 'Default network profile', type: 'select', category: 'oobe', defaultValue: 'Home', value: 'Home', options: [
    { value: 'Home', label: 'Home (Private)' },
    { value: 'Work', label: 'Work' },
    { value: 'Other', label: 'Public' },
  ], xmlPath: 'OOBE/NetworkLocation', enabled: true },
  { id: 'protect-computer', label: 'Protection Level', description: 'Windows Update initial setting', type: 'select', category: 'oobe', defaultValue: '3', value: '3', options: [
    { value: '1', label: 'Recommended settings' },
    { value: '2', label: 'Install important updates only' },
    { value: '3', label: 'Ask me later' },
  ], xmlPath: 'OOBE/ProtectYourPC', enabled: true },
  { id: 'skip-machine-oobe', label: 'Skip Machine OOBE', description: 'Skip device setup questions', type: 'boolean', category: 'oobe', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/SkipMachineOOBE', enabled: true },
  { id: 'skip-user-oobe', label: 'Skip User OOBE', description: 'Skip user personalization', type: 'boolean', category: 'oobe', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/SkipUserOOBE', enabled: true },

  // Privacy
  { id: 'disable-location-consent', label: 'Disable Location Consent', description: 'Don\'t ask for location sharing', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableLocationConsent', enabled: true },
  { id: 'disable-speech-opt', label: 'Disable Speech Recognition', description: 'Opt out of online speech recognition', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableSpeechRecognition', enabled: true },
  { id: 'disable-activity-history-oobe', label: 'Disable Activity History', description: 'Opt out of activity history', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableActivityHistory', enabled: true },
  { id: 'disable-tailored-experiences', label: 'Disable Tailored Experiences', description: 'Opt out of tailored experiences', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableTailoredExperiences', enabled: true },
  { id: 'disable-diagnostic-data', label: 'Disable Diagnostic Data', description: 'Set diagnostic data to required only', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableDiagnosticDataConsent', enabled: true },
  { id: 'disable-find-device', label: 'Disable Find My Device', description: 'Opt out of device tracking', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableFindMyDevice', enabled: true },
  { id: 'disable-inking', label: 'Disable Inking & Typing', description: 'Opt out of inking data collection', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableInkingTyping', enabled: true },
  { id: 'disable-advertising-id-oobe', label: 'Disable Advertising ID', description: 'Opt out of advertising tracking', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableAdvertisingID', enabled: true },

  // Windows PE
  { id: 'setup-ui-language', label: 'Setup UI Language', description: 'Language during Windows Setup', type: 'text', category: 'windows pe', defaultValue: 'en-US', value: 'en-US', xmlPath: 'Microsoft-Windows-International-Core-WinPE/SetupUILanguage/UILanguage', enabled: true },
  { id: 'bypass-tpm', label: 'Bypass TPM Check', description: 'Skip TPM 2.0 requirement (Win11)', type: 'boolean', category: 'windows pe', defaultValue: 'false', value: 'false', xmlPath: 'Microsoft-Windows-Setup/RunSynchronous/BypassTPMCheck', enabled: false },
  { id: 'bypass-ram', label: 'Bypass RAM Check', description: 'Skip 4GB RAM requirement (Win11)', type: 'boolean', category: 'windows pe', defaultValue: 'false', value: 'false', xmlPath: 'Microsoft-Windows-Setup/RunSynchronous/BypassRAMCheck', enabled: false },
  { id: 'bypass-secureboot', label: 'Bypass Secure Boot Check', description: 'Skip Secure Boot requirement (Win11)', type: 'boolean', category: 'windows pe', defaultValue: 'false', value: 'false', xmlPath: 'Microsoft-Windows-Setup/RunSynchronous/BypassSecureBootCheck', enabled: false },
  { id: 'bypass-storage', label: 'Bypass Storage Check', description: 'Skip storage size requirement', type: 'boolean', category: 'windows pe', defaultValue: 'false', value: 'false', xmlPath: 'Microsoft-Windows-Setup/RunSynchronous/BypassStorageCheck', enabled: false },
  { id: 'bypass-cpu', label: 'Bypass CPU Check', description: 'Skip CPU compatibility check (Win11)', type: 'boolean', category: 'windows pe', defaultValue: 'false', value: 'false', xmlPath: 'Microsoft-Windows-Setup/RunSynchronous/BypassCPUCheck', enabled: false },

  // First Logon
  { id: 'cmd-disable-reserved', label: 'Disable Reserved Storage', description: 'DISM /Set-ReservedStorageState /State:Disabled', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/DisableReservedStorage', enabled: false },
  { id: 'cmd-enable-darkmode', label: 'Enable Dark Mode', description: 'Set dark theme via registry on first login', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/EnableDarkMode', enabled: false },
  { id: 'cmd-disable-edge-first-run', label: 'Disable Edge First Run', description: 'Skip Edge welcome experience', type: 'boolean', category: 'first logon', defaultValue: 'true', value: 'true', xmlPath: 'FirstLogonCommands/DisableEdgeFirstRun', enabled: true },
  { id: 'cmd-remove-taskbar-chat', label: 'Remove Taskbar Chat', description: 'Hide Teams chat icon from taskbar', type: 'boolean', category: 'first logon', defaultValue: 'true', value: 'true', xmlPath: 'FirstLogonCommands/RemoveTaskbarChat', enabled: true },
  { id: 'cmd-show-file-ext', label: 'Show File Extensions', description: 'Enable file extension visibility', type: 'boolean', category: 'first logon', defaultValue: 'true', value: 'true', xmlPath: 'FirstLogonCommands/ShowFileExtensions', enabled: true },
  { id: 'cmd-classic-context', label: 'Classic Context Menu', description: 'Restore Windows 10 right-click menu', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/ClassicContextMenu', enabled: false },
  { id: 'cmd-taskbar-left', label: 'Left-Align Taskbar', description: 'Move taskbar icons to the left', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/TaskbarLeftAlign', enabled: false },
  { id: 'cmd-disable-widgets', label: 'Disable Widgets', description: 'Remove Widgets from taskbar', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/DisableWidgets', enabled: false },
  { id: 'cmd-disable-cortana', label: 'Disable Cortana', description: 'Disable Cortana via registry', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/DisableCortana', enabled: false },
  { id: 'cmd-disable-telemetry', label: 'Disable Telemetry', description: 'Set telemetry to Security level', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/DisableTelemetry', enabled: false },
  { id: 'cmd-disable-onedrive', label: 'Remove OneDrive', description: 'Uninstall OneDrive on first login', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/RemoveOneDrive', enabled: false },
  { id: 'cmd-enable-numlock', label: 'Enable NumLock', description: 'Turn on NumLock by default', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/EnableNumLock', enabled: false },
  { id: 'cmd-disable-uac', label: 'Disable UAC Prompt', description: 'Disable User Account Control prompts', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/DisableUAC', enabled: false },
  { id: 'cmd-power-high-perf', label: 'High Performance Power Plan', description: 'Set power plan to High Performance', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/HighPerformancePlan', enabled: false },
  { id: 'cmd-disable-hibernation', label: 'Disable Hibernation', description: 'Remove hiberfil.sys to save space', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/DisableHibernation', enabled: false },
  { id: 'cmd-enable-rdp', label: 'Enable Remote Desktop', description: 'Turn on RDP access', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/EnableRDP', enabled: false },
  { id: 'cmd-install-winget', label: 'Install Winget Packages', description: 'Run winget package installation script', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/InstallWinget', enabled: false },
  { id: 'cmd-custom', label: 'Custom Command', description: 'Custom command to run at first logon', type: 'text', category: 'first logon', defaultValue: '', value: '', xmlPath: 'FirstLogonCommands/Custom', enabled: false },
  { id: 'cmd-custom-2', label: 'Custom Command 2', description: 'Second custom command', type: 'text', category: 'first logon', defaultValue: '', value: '', xmlPath: 'FirstLogonCommands/Custom2', enabled: false },
  { id: 'cmd-custom-3', label: 'Custom Command 3', description: 'Third custom command', type: 'text', category: 'first logon', defaultValue: '', value: '', xmlPath: 'FirstLogonCommands/Custom3', enabled: false },

  // Network
  { id: 'net-static-ip', label: 'Static IP Address', description: 'Set a static IP (leave blank for DHCP)', type: 'text', category: 'network', defaultValue: '', value: '', xmlPath: 'Microsoft-Windows-TCPIP/Interfaces/Interface/UnicastIpAddresses', enabled: false },
  { id: 'net-dns-primary', label: 'Primary DNS', description: 'Primary DNS server address', type: 'text', category: 'network', defaultValue: '1.1.1.1', value: '1.1.1.1', xmlPath: 'Microsoft-Windows-DNS-Client/Interfaces/Interface/DNSServerSearchOrder/1', enabled: false },
  { id: 'net-dns-secondary', label: 'Secondary DNS', description: 'Secondary DNS server address', type: 'text', category: 'network', defaultValue: '8.8.8.8', value: '8.8.8.8', xmlPath: 'Microsoft-Windows-DNS-Client/Interfaces/Interface/DNSServerSearchOrder/2', enabled: false },
  { id: 'net-workgroup', label: 'Workgroup', description: 'Windows workgroup name', type: 'text', category: 'network', defaultValue: 'WORKGROUP', value: 'WORKGROUP', xmlPath: 'Microsoft-Windows-UnattendedJoin/Identification/JoinWorkgroup', enabled: false },
  { id: 'net-domain-join', label: 'Domain Join', description: 'Active Directory domain to join', type: 'text', category: 'network', defaultValue: '', value: '', xmlPath: 'Microsoft-Windows-UnattendedJoin/Identification/JoinDomain', enabled: false },
  { id: 'net-disable-ipv6', label: 'Disable IPv6', description: 'Turn off IPv6 during setup', type: 'boolean', category: 'network', defaultValue: 'false', value: 'false', xmlPath: 'Microsoft-Windows-TCPIP/DisableIPv6', enabled: false },

  // Power
  { id: 'power-scheme', label: 'Power Scheme', description: 'Default power plan after install', type: 'select', category: 'power', defaultValue: 'balanced', value: 'balanced', options: [
    { value: 'balanced', label: 'Balanced' },
    { value: 'high-performance', label: 'High Performance' },
    { value: 'ultimate', label: 'Ultimate Performance' },
    { value: 'power-saver', label: 'Power Saver' },
  ], xmlPath: 'Microsoft-Windows-Shell-Setup/PowerScheme', enabled: false },
  { id: 'power-lid-action', label: 'Lid Close Action', description: 'Action when laptop lid is closed', type: 'select', category: 'power', defaultValue: 'sleep', value: 'sleep', options: [
    { value: 'nothing', label: 'Do Nothing' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'hibernate', label: 'Hibernate' },
    { value: 'shutdown', label: 'Shutdown' },
  ], xmlPath: 'Microsoft-Windows-Shell-Setup/Power/LidCloseAction', enabled: false },
  { id: 'power-sleep-timeout', label: 'Sleep Timeout (min)', description: 'Minutes before sleep (0 = never)', type: 'text', category: 'power', defaultValue: '0', value: '0', xmlPath: 'Microsoft-Windows-Shell-Setup/Power/SleepTimeout', enabled: false },
  { id: 'power-display-timeout', label: 'Display Timeout (min)', description: 'Minutes before display off (0 = never)', type: 'text', category: 'power', defaultValue: '15', value: '15', xmlPath: 'Microsoft-Windows-Shell-Setup/Power/DisplayTimeout', enabled: false },
];

// Tab definitions
const TABS = [
  { id: 'locale', label: 'Locale', icon: Globe, categories: ['regional'] },
  { id: 'disk', label: 'Disk', icon: HardDrive, categories: ['disk'] },
  { id: 'product', label: 'Product', icon: Key, categories: ['product'] },
  { id: 'user', label: 'User', icon: User, categories: ['user'] },
  { id: 'oobe', label: 'OOBE', icon: MonitorSmartphone, categories: ['oobe'] },
  { id: 'privacy', label: 'Privacy', icon: ShieldCheck, categories: ['privacy (oobe)'] },
  { id: 'winpe', label: 'WinPE', icon: Cpu, categories: ['windows pe'] },
  { id: 'commands', label: 'Commands', icon: Terminal, categories: ['first logon'] },
  { id: 'network', label: 'Network', icon: Wifi, categories: ['network'] },
  { id: 'power', label: 'Power', icon: Zap, categories: ['power'] },
];

interface UnattendGeneratorProps {
  isMounted: boolean;
  onCountChange?: (count: number) => void;
  exportRef?: MutableRefObject<() => { id: string; value: string; enabled: boolean }[]>;
  importRef?: MutableRefObject<(data: { id: string; value: string; enabled: boolean }[]) => void>;
}

// Visual partition diagram
const DiskDiagram = ({ partitionStyle, efiSize, wipeDisk }: { partitionStyle: string; efiSize: string; wipeDisk: string }) => {
  const isGPT = partitionStyle === 'GPT';
  return (
    <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border">
      <p className="text-[10px] font-mono text-muted-foreground mb-2 uppercase tracking-wider">Partition Layout Preview</p>
      <div className="flex gap-0.5 h-8 rounded overflow-hidden border border-border">
        {isGPT && (
          <>
            <div
              className="bg-warning/30 border-r border-border flex items-center justify-center text-[9px] font-mono text-warning shrink-0"
              style={{ width: `${Math.max(8, Math.min(20, parseInt(efiSize) / 15))}%` }}
            >
              EFI {efiSize}MB
            </div>
            <div className="bg-muted/50 border-r border-border flex items-center justify-center text-[9px] font-mono text-muted-foreground shrink-0" style={{ width: '4%' }}>
              MSR
            </div>
          </>
        )}
        <div className="bg-primary/20 flex-1 flex items-center justify-center text-[9px] font-mono text-primary">
          Windows (Extend)
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <Badge variant="outline" className="text-[9px] font-mono">
          {isGPT ? 'GPT / UEFI' : 'MBR / BIOS'}
        </Badge>
        {wipeDisk === 'true' && (
          <span className="text-[9px] font-mono text-destructive">⚠ Disk will be wiped</span>
        )}
      </div>
    </div>
  );
};

// Render a field
const FieldRenderer = ({ option, onUpdate }: { option: AnswerOption; onUpdate: (id: string, field: 'value' | 'enabled', val: string | boolean) => void }) => {
  const [showPw, setShowPw] = useState(false);

  return (
    <div className={`flex items-start gap-3 p-2.5 rounded-lg transition-all ${option.enabled ? 'bg-primary/5 border border-primary/15' : 'bg-muted/10 border border-transparent'}`}>
      <Switch
        checked={option.enabled}
        onCheckedChange={(v) => onUpdate(option.id, 'enabled', v)}
        className="mt-0.5 scale-75 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-foreground">{option.label}</span>
        </div>
        <p className="text-[10px] text-muted-foreground mb-1.5">{option.description}</p>
        {option.enabled && (
          <div>
            {option.type === 'password' ? (
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={option.value}
                  onChange={(e) => onUpdate(option.id, 'value', e.target.value)}
                  placeholder={option.defaultValue || 'Enter password...'}
                  className="h-7 text-xs font-mono bg-muted/30 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            ) : option.type === 'text' ? (
              <Input
                type="text"
                value={option.value}
                onChange={(e) => onUpdate(option.id, 'value', e.target.value)}
                placeholder={option.defaultValue || 'Enter value...'}
                className="h-7 text-xs font-mono bg-muted/30"
              />
            ) : option.type === 'select' ? (
              <Select value={option.value} onValueChange={(v) => onUpdate(option.id, 'value', v)}>
                <SelectTrigger className="h-7 text-xs font-mono bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {option.options?.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs font-mono">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : option.type === 'boolean' ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onUpdate(option.id, 'value', 'true')}
                  className={`px-3 py-1 rounded text-[10px] font-mono transition-all ${option.value === 'true' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
                >
                  true
                </button>
                <button
                  onClick={() => onUpdate(option.id, 'value', 'false')}
                  className={`px-3 py-1 rounded text-[10px] font-mono transition-all ${option.value === 'false' ? 'bg-destructive/80 text-destructive-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
                >
                  false
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

// Toggle grid for boolean-only categories
const ToggleGrid = ({ options, onUpdate }: { options: AnswerOption[]; onUpdate: (id: string, field: 'value' | 'enabled', val: string | boolean) => void }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
    {options.map(opt => (
      <div
        key={opt.id}
        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${
          opt.enabled && opt.value === 'true'
            ? 'bg-primary/10 border border-primary/20'
            : 'bg-muted/10 border border-transparent hover:bg-muted/20'
        }`}
        onClick={() => {
          if (!opt.enabled) {
            onUpdate(opt.id, 'enabled', true);
            onUpdate(opt.id, 'value', 'true');
          } else if (opt.value === 'true') {
            onUpdate(opt.id, 'value', 'false');
          } else {
            onUpdate(opt.id, 'enabled', false);
          }
        }}
      >
        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
          opt.enabled && opt.value === 'true' ? 'bg-primary' : 'bg-muted border border-border'
        }`}>
          {opt.enabled && opt.value === 'true' && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground leading-tight">{opt.label}</p>
          <p className="text-[9px] text-muted-foreground truncate">{opt.description}</p>
        </div>
      </div>
    ))}
  </div>
);

const UnattendGenerator = ({ isMounted, onCountChange, exportRef, importRef }: UnattendGeneratorProps) => {
  const [options, setOptions] = useState(defaultOptions);
  const [activeTab, setActiveTab] = useState('locale');
  const [copied, setCopied] = useState(false);

  const enabledCount = options.filter(o => o.enabled).length;

  useEffect(() => {
    onCountChange?.(enabledCount);
  }, [enabledCount, onCountChange]);

  useEffect(() => {
    if (exportRef) exportRef.current = () => options.map(o => ({ id: o.id, value: o.value, enabled: o.enabled }));
  }, [options, exportRef]);

  useEffect(() => {
    if (importRef) importRef.current = (data) => {
      setOptions(prev => prev.map(o => {
        const imported = data.find(d => d.id === o.id);
        return imported ? { ...o, value: imported.value, enabled: imported.enabled } : o;
      }));
    };
  }, [importRef]);

  const updateOption = (id: string, field: 'value' | 'enabled', newValue: string | boolean) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, [field]: newValue } : o));
  };

  const resetDefaults = () => {
    setOptions(defaultOptions.map(o => ({ ...o })));
    toast.success('Reset all settings to defaults');
  };

  const generateXML = (): string => {
    const enabled = options.filter(o => o.enabled);
    const lines: string[] = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<unattend xmlns="urn:schemas-microsoft-com:unattend">',
      '',
      '  <!-- Generated by ISO Forge -->',
      `  <!-- ${new Date().toISOString()} -->`,
      `  <!-- ${enabled.length} settings configured -->`,
      '',
    ];

    const regional = enabled.filter(o => o.category === 'regional');
    const winpe = enabled.filter(o => o.category === 'windows pe');
    const disk = enabled.filter(o => o.category === 'disk');
    const product = enabled.filter(o => o.category === 'product');
    const user = enabled.filter(o => o.category === 'user');
    const oobe = enabled.filter(o => o.category === 'oobe' || o.category === 'privacy (oobe)');
    const firstLogon = enabled.filter(o => o.category === 'first logon');

    if (winpe.length > 0 || regional.length > 0 || disk.length > 0 || product.length > 0) {
      lines.push('  <settings pass="windowsPE">');
      if (winpe.length > 0 || regional.length > 0) {
        lines.push('    <component name="Microsoft-Windows-International-Core-WinPE">');
        regional.forEach(o => {
          const tag = o.xmlPath.split('/').pop();
          lines.push(`      <${tag}>${escapeXml(o.value)}</${tag}>`);
        });
        winpe.filter(o => o.id === 'setup-ui-language').forEach(o => {
          lines.push('      <SetupUILanguage>');
          lines.push(`        <UILanguage>${escapeXml(o.value)}</UILanguage>`);
          lines.push('      </SetupUILanguage>');
        });
        lines.push('    </component>');
      }
      if (disk.length > 0 || product.length > 0) {
        lines.push('    <component name="Microsoft-Windows-Setup">');
        if (disk.length > 0) {
          const style = disk.find(o => o.id === 'partition-style')?.value || 'GPT';
          lines.push('      <DiskConfiguration>');
          lines.push('        <Disk wcm:action="add">');
          lines.push(`          <DiskID>${escapeXml(disk.find(o => o.id === 'disk-id')?.value || '0')}</DiskID>`);
          lines.push(`          <WillWipeDisk>${escapeXml(disk.find(o => o.id === 'wipe-disk')?.value || 'true')}</WillWipeDisk>`);
          if (style === 'GPT') {
            lines.push('          <CreatePartitions>');
            lines.push('            <CreatePartition wcm:action="add"><Order>1</Order><Type>EFI</Type><Size>' + (disk.find(o => o.id === 'efi-size')?.value || '300') + '</Size></CreatePartition>');
            lines.push('            <CreatePartition wcm:action="add"><Order>2</Order><Type>MSR</Type><Size>16</Size></CreatePartition>');
            lines.push('            <CreatePartition wcm:action="add"><Order>3</Order><Type>Primary</Type><Extend>true</Extend></CreatePartition>');
            lines.push('          </CreatePartitions>');
          }
          lines.push('        </Disk>');
          lines.push('      </DiskConfiguration>');
        }
        product.forEach(o => {
          if (o.id === 'accept-eula') lines.push(`      <UserData><AcceptEula>${escapeXml(o.value)}</AcceptEula></UserData>`);
          if (o.id === 'product-key' && o.value) lines.push(`      <UserData><ProductKey><Key>${escapeXml(o.value)}</Key></ProductKey></UserData>`);
        });
        const bypasses = winpe.filter(o => o.id.startsWith('bypass-') && o.value === 'true');
        if (bypasses.length > 0) {
          lines.push('      <RunSynchronous>');
          bypasses.forEach((b, i) => {
            const reg = b.id.replace('bypass-', '').replace(/-/g, '');
            lines.push(`        <RunSynchronousCommand wcm:action="add"><Order>${i + 1}</Order>`);
            lines.push(`          <Path>reg add HKLM\\SYSTEM\\Setup\\LabConfig /v Bypass${reg}Check /t REG_DWORD /d 1 /f</Path>`);
            lines.push('        </RunSynchronousCommand>');
          });
          lines.push('      </RunSynchronous>');
        }
        lines.push('    </component>');
      }
      lines.push('  </settings>');
      lines.push('');
    }

    if (user.length > 0 || oobe.length > 0 || firstLogon.length > 0) {
      lines.push('  <settings pass="oobeSystem">');
      lines.push('    <component name="Microsoft-Windows-Shell-Setup">');
      const compName = user.find(o => o.id === 'computer-name');
      if (compName) lines.push(`      <ComputerName>${escapeXml(compName.value)}</ComputerName>`);
      const tz = options.find(o => o.id === 'timezone' && o.enabled);
      if (tz) lines.push(`      <TimeZone>${escapeXml(tz.value)}</TimeZone>`);
      if (oobe.length > 0) {
        lines.push('      <OOBE>');
        oobe.forEach(o => {
          const tag = o.xmlPath.split('/').pop();
          lines.push(`        <${tag}>${escapeXml(o.value)}</${tag}>`);
        });
        lines.push('      </OOBE>');
      }
      const userName = user.find(o => o.id === 'user-name');
      if (userName) {
        const userPass = user.find(o => o.id === 'user-password');
        lines.push('      <UserAccounts>');
        lines.push('        <LocalAccounts>');
        lines.push('          <LocalAccount wcm:action="add">');
        lines.push(`            <Name>${escapeXml(userName.value)}</Name>`);
        lines.push('            <Group>Administrators</Group>');
        if (userPass?.enabled && userPass.value) {
          lines.push(`            <Password><Value>${escapeXml(userPass.value)}</Value><PlainText>true</PlainText></Password>`);
        }
        lines.push('          </LocalAccount>');
        lines.push('        </LocalAccounts>');
        lines.push('      </UserAccounts>');
      }
      const autoLogon = user.find(o => o.id === 'auto-logon');
      if (autoLogon?.value === 'true') {
        const logonCount = user.find(o => o.id === 'auto-logon-count');
        lines.push('      <AutoLogon>');
        lines.push('        <Enabled>true</Enabled>');
        lines.push(`        <Username>${escapeXml(userName?.value || 'User')}</Username>`);
        if (logonCount) lines.push(`        <LogonCount>${escapeXml(logonCount.value)}</LogonCount>`);
        lines.push('      </AutoLogon>');
      }
      const flcEnabled = firstLogon.filter(o => o.value === 'true' || (o.type === 'text' && o.value));
      if (flcEnabled.length > 0) {
        lines.push('      <FirstLogonCommands>');
        let order = 1;
        flcEnabled.forEach(o => {
          let cmd = '';
          if (o.id === 'cmd-enable-darkmode') cmd = 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v AppsUseLightTheme /t REG_DWORD /d 0 /f';
          else if (o.id === 'cmd-disable-edge-first-run') cmd = 'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge" /v HideFirstRunExperience /t REG_DWORD /d 1 /f';
          else if (o.id === 'cmd-remove-taskbar-chat') cmd = 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarMn /t REG_DWORD /d 0 /f';
          else if (o.id === 'cmd-show-file-ext') cmd = 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v HideFileExt /t REG_DWORD /d 0 /f';
          else if (o.id === 'cmd-classic-context') cmd = 'reg add "HKCU\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\\InprocServer32" /f /ve';
          else if (o.id === 'cmd-taskbar-left') cmd = 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarAl /t REG_DWORD /d 0 /f';
          else if (o.id === 'cmd-disable-reserved') cmd = 'DISM /Online /Set-ReservedStorageState /State:Disabled';
          else if (o.id === 'cmd-custom' && o.value) cmd = o.value;
          else if (o.id === 'cmd-custom-2' && o.value) cmd = o.value;
          else if (o.id === 'cmd-custom-3' && o.value) cmd = o.value;
          if (cmd) {
            lines.push(`        <SynchronousCommand wcm:action="add"><Order>${order}</Order>`);
            lines.push(`          <CommandLine>cmd /c ${escapeXml(cmd)}</CommandLine>`);
            lines.push(`          <Description>${escapeXml(o.label)}</Description></SynchronousCommand>`);
            order++;
          }
        });
        lines.push('      </FirstLogonCommands>');
      }
      lines.push('    </component>');
      lines.push('  </settings>');
    }

    lines.push('');
    lines.push('</unattend>');
    return lines.join('\n');
  };

  const handleCopyXML = () => {
    navigator.clipboard.writeText(generateXML());
    setCopied(true);
    toast.success('XML copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
          <FileCode className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Mount an ISO to configure unattended setup</p>
      </div>
    );
  }

  const getTabOptions = (tabId: string) => {
    const tab = TABS.find(t => t.id === tabId);
    return tab ? options.filter(o => tab.categories.includes(o.category)) : [];
  };

  const getTabEnabledCount = (tabId: string) => {
    return getTabOptions(tabId).filter(o => o.enabled).length;
  };

  // Boolean-only tabs use toggle grid
  const isBooleanOnlyTab = (tabId: string) => {
    const opts = getTabOptions(tabId);
    return opts.length > 0 && opts.every(o => o.type === 'boolean');
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono font-medium text-foreground">autounattend.xml</span>
          <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
            {enabledCount} settings
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 text-xs font-mono" onClick={resetDefaults}>
            <RotateCcw className="w-3 h-3 mr-1" /> Reset
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs font-mono" onClick={handleCopyXML}>
            {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
            {copied ? 'Copied!' : 'Copy XML'}
          </Button>
        </div>
      </div>

      {/* Visual Tabbed Editor */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border bg-muted/20 px-2">
          <TabsList className="h-auto bg-transparent flex flex-wrap gap-0 p-0">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const count = getTabEnabledCount(tab.id);
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2.5 py-2 text-[11px] font-mono gap-1.5"
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                  {count > 0 && (
                    <span className="ml-0.5 px-1 py-0 rounded-full bg-primary/20 text-primary text-[9px] leading-tight">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <div className="max-h-[480px] overflow-y-auto">
          {TABS.map(tab => {
            const tabOptions = getTabOptions(tab.id);
            const boolOnly = isBooleanOnlyTab(tab.id);
            const Icon = tab.icon;

            return (
              <TabsContent key={tab.id} value={tab.id} className="p-3 mt-0 space-y-3">
                {/* Section header */}
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Icon className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">{tab.label} Settings</h3>
                  <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                    {tabOptions.filter(o => o.enabled).length}/{tabOptions.length} active
                  </span>
                </div>

                {/* Disk tab gets visual partition diagram */}
                {tab.id === 'disk' && (
                  <DiskDiagram
                    partitionStyle={options.find(o => o.id === 'partition-style')?.value || 'GPT'}
                    efiSize={options.find(o => o.id === 'efi-size')?.value || '300'}
                    wipeDisk={options.find(o => o.id === 'wipe-disk')?.value || 'true'}
                  />
                )}

                {/* User tab gets account card */}
                {tab.id === 'user' && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-xs font-mono flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-primary" />
                        Local Administrator Account
                      </CardTitle>
                      <CardDescription className="text-[10px]">
                        This account will be created during installation with Administrator privileges
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-muted-foreground">
                        <div>Username: <span className="text-foreground">{options.find(o => o.id === 'user-name')?.value || 'User'}</span></div>
                        <div>Computer: <span className="text-foreground">{options.find(o => o.id === 'computer-name')?.value || '*'}</span></div>
                        <div>Auto Login: <span className="text-foreground">{options.find(o => o.id === 'auto-logon')?.value || 'true'}</span></div>
                        <div>Group: <span className="text-foreground">Administrators</span></div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Render fields */}
                {boolOnly ? (
                  <ToggleGrid options={tabOptions} onUpdate={updateOption} />
                ) : (
                  <div className="space-y-1.5">
                    {tabOptions.map(opt => (
                      <FieldRenderer key={opt.id} option={opt} onUpdate={updateOption} />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </div>
      </Tabs>

      {/* XML Preview */}
      <div className="border-t border-border">
        <details className="group">
          <summary className="px-4 py-2.5 cursor-pointer text-xs font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
            Preview Generated XML
          </summary>
          <div className="max-h-[300px] overflow-auto bg-[hsl(var(--background))] p-3">
            <pre className="text-[11px] font-mono text-muted-foreground whitespace-pre leading-relaxed">
              {generateXML()}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
};

export default UnattendGenerator;
