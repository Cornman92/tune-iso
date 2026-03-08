import { useState } from 'react';
import { FileCode, Copy, ChevronDown, ChevronRight, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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

  // Disk Configuration
  { id: 'disk-id', label: 'Disk Number', description: 'Target disk number (usually 0)', type: 'text', category: 'disk', defaultValue: '0', value: '0', xmlPath: 'DiskConfiguration/Disk/DiskID', enabled: true },
  { id: 'partition-style', label: 'Partition Style', description: 'GPT (UEFI) or MBR (Legacy BIOS)', type: 'select', category: 'disk', defaultValue: 'GPT', value: 'GPT', options: [
    { value: 'GPT', label: 'GPT (UEFI)' },
    { value: 'MBR', label: 'MBR (Legacy BIOS)' },
  ], xmlPath: 'DiskConfiguration/Disk/PartitionStyle', enabled: true },
  { id: 'wipe-disk', label: 'Wipe Disk', description: 'Clean all partitions before install', type: 'boolean', category: 'disk', defaultValue: 'true', value: 'true', xmlPath: 'DiskConfiguration/Disk/WillWipeDisk', enabled: true },
  { id: 'efi-size', label: 'EFI Partition Size (MB)', description: 'EFI System Partition size', type: 'text', category: 'disk', defaultValue: '300', value: '300', xmlPath: 'DiskConfiguration/Disk/Partitions/EFI/Size', enabled: true },
  { id: 'recovery-size', label: 'Recovery Partition Size (MB)', description: 'Windows Recovery partition', type: 'text', category: 'disk', defaultValue: '1024', value: '1024', xmlPath: 'DiskConfiguration/Disk/Partitions/Recovery/Size', enabled: false },
  { id: 'install-to-partition', label: 'Install Partition Number', description: 'Partition to install Windows (usually 3)', type: 'text', category: 'disk', defaultValue: '3', value: '3', xmlPath: 'ImageInstall/OSImage/InstallTo/PartitionID', enabled: true },

  // Product Key & Edition
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

  // User Account
  { id: 'user-name', label: 'Username', description: 'Local admin account name', type: 'text', category: 'user', defaultValue: 'User', value: 'User', xmlPath: 'Microsoft-Windows-Shell-Setup/UserAccounts/LocalAccounts/LocalAccount/Name', enabled: true },
  { id: 'user-password', label: 'Password', description: 'Account password (blank = no password)', type: 'password', category: 'user', defaultValue: '', value: '', xmlPath: 'Microsoft-Windows-Shell-Setup/UserAccounts/LocalAccounts/LocalAccount/Password/Value', enabled: false },
  { id: 'auto-logon', label: 'Auto Logon', description: 'Skip login screen on boot', type: 'boolean', category: 'user', defaultValue: 'true', value: 'true', xmlPath: 'Microsoft-Windows-Shell-Setup/AutoLogon/Enabled', enabled: true },
  { id: 'auto-logon-count', label: 'Auto Logon Count', description: 'Number of times to auto-logon (999 = always)', type: 'text', category: 'user', defaultValue: '999', value: '999', xmlPath: 'Microsoft-Windows-Shell-Setup/AutoLogon/LogonCount', enabled: true },
  { id: 'disable-admin', label: 'Disable Built-in Admin', description: 'Disable the built-in Administrator account', type: 'boolean', category: 'user', defaultValue: 'true', value: 'true', xmlPath: 'Microsoft-Windows-Shell-Setup/UserAccounts/AdministratorPassword/Enabled', enabled: false },
  { id: 'computer-name', label: 'Computer Name', description: 'PC hostname (* = random)', type: 'text', category: 'user', defaultValue: '*', value: '*', xmlPath: 'Microsoft-Windows-Shell-Setup/ComputerName', enabled: true },
  { id: 'registered-org', label: 'Registered Organization', description: 'Organization name in system info', type: 'text', category: 'user', defaultValue: '', value: '', xmlPath: 'Microsoft-Windows-Shell-Setup/RegisteredOrganization', enabled: false },
  { id: 'registered-owner', label: 'Registered Owner', description: 'Owner name in system info', type: 'text', category: 'user', defaultValue: '', value: '', xmlPath: 'Microsoft-Windows-Shell-Setup/RegisteredOwner', enabled: false },

  // OOBE (Out of Box Experience)
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

  // Privacy (OOBE)
  { id: 'disable-location-consent', label: 'Disable Location Consent', description: 'Don\'t ask for location sharing', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableLocationConsent', enabled: true },
  { id: 'disable-speech-opt', label: 'Disable Speech Recognition', description: 'Opt out of online speech recognition', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableSpeechRecognition', enabled: true },
  { id: 'disable-activity-history-oobe', label: 'Disable Activity History', description: 'Opt out of activity history', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableActivityHistory', enabled: true },
  { id: 'disable-tailored-experiences', label: 'Disable Tailored Experiences', description: 'Opt out of tailored experiences', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableTailoredExperiences', enabled: true },
  { id: 'disable-diagnostic-data', label: 'Disable Diagnostic Data', description: 'Set diagnostic data to required only', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableDiagnosticDataConsent', enabled: true },
  { id: 'disable-find-device', label: 'Disable Find My Device', description: 'Opt out of device tracking', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableFindMyDevice', enabled: true },
  { id: 'disable-inking', label: 'Disable Inking & Typing', description: 'Opt out of inking data collection', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableInkingTyping', enabled: true },
  { id: 'disable-advertising-id-oobe', label: 'Disable Advertising ID', description: 'Opt out of advertising tracking', type: 'boolean', category: 'privacy (oobe)', defaultValue: 'true', value: 'true', xmlPath: 'OOBE/DisableAdvertisingID', enabled: true },

  // Windows PE (Setup Phase)
  { id: 'setup-ui-language', label: 'Setup UI Language', description: 'Language during Windows Setup', type: 'text', category: 'windows pe', defaultValue: 'en-US', value: 'en-US', xmlPath: 'Microsoft-Windows-International-Core-WinPE/SetupUILanguage/UILanguage', enabled: true },
  { id: 'bypass-tpm', label: 'Bypass TPM Check', description: 'Skip TPM 2.0 requirement (Win11)', type: 'boolean', category: 'windows pe', defaultValue: 'false', value: 'false', xmlPath: 'Microsoft-Windows-Setup/RunSynchronous/BypassTPMCheck', enabled: false },
  { id: 'bypass-ram', label: 'Bypass RAM Check', description: 'Skip 4GB RAM requirement (Win11)', type: 'boolean', category: 'windows pe', defaultValue: 'false', value: 'false', xmlPath: 'Microsoft-Windows-Setup/RunSynchronous/BypassRAMCheck', enabled: false },
  { id: 'bypass-secureboot', label: 'Bypass Secure Boot Check', description: 'Skip Secure Boot requirement (Win11)', type: 'boolean', category: 'windows pe', defaultValue: 'false', value: 'false', xmlPath: 'Microsoft-Windows-Setup/RunSynchronous/BypassSecureBootCheck', enabled: false },
  { id: 'bypass-storage', label: 'Bypass Storage Check', description: 'Skip storage size requirement', type: 'boolean', category: 'windows pe', defaultValue: 'false', value: 'false', xmlPath: 'Microsoft-Windows-Setup/RunSynchronous/BypassStorageCheck', enabled: false },
  { id: 'bypass-cpu', label: 'Bypass CPU Check', description: 'Skip CPU compatibility check (Win11)', type: 'boolean', category: 'windows pe', defaultValue: 'false', value: 'false', xmlPath: 'Microsoft-Windows-Setup/RunSynchronous/BypassCPUCheck', enabled: false },

  // First Logon Commands
  { id: 'cmd-disable-reserved', label: 'Disable Reserved Storage', description: 'DISM /Set-ReservedStorageState /State:Disabled', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/DisableReservedStorage', enabled: false },
  { id: 'cmd-enable-darkmode', label: 'Enable Dark Mode', description: 'Set dark theme via registry on first login', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/EnableDarkMode', enabled: false },
  { id: 'cmd-disable-edge-first-run', label: 'Disable Edge First Run', description: 'Skip Edge welcome experience', type: 'boolean', category: 'first logon', defaultValue: 'true', value: 'true', xmlPath: 'FirstLogonCommands/DisableEdgeFirstRun', enabled: true },
  { id: 'cmd-remove-taskbar-chat', label: 'Remove Taskbar Chat', description: 'Hide Teams chat icon from taskbar', type: 'boolean', category: 'first logon', defaultValue: 'true', value: 'true', xmlPath: 'FirstLogonCommands/RemoveTaskbarChat', enabled: true },
  { id: 'cmd-show-file-ext', label: 'Show File Extensions', description: 'Enable file extension visibility', type: 'boolean', category: 'first logon', defaultValue: 'true', value: 'true', xmlPath: 'FirstLogonCommands/ShowFileExtensions', enabled: true },
  { id: 'cmd-classic-context', label: 'Classic Context Menu', description: 'Restore Windows 10 right-click menu', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/ClassicContextMenu', enabled: false },
  { id: 'cmd-taskbar-left', label: 'Left-Align Taskbar', description: 'Move taskbar icons to the left', type: 'boolean', category: 'first logon', defaultValue: 'false', value: 'false', xmlPath: 'FirstLogonCommands/TaskbarLeftAlign', enabled: false },
  { id: 'cmd-custom', label: 'Custom Command', description: 'Custom command to run at first logon', type: 'text', category: 'first logon', defaultValue: '', value: '', xmlPath: 'FirstLogonCommands/Custom', enabled: false },
];

const categoryOrder = ['regional', 'windows pe', 'disk', 'product', 'user', 'oobe', 'privacy (oobe)', 'first logon'];

const UnattendGenerator = ({ isMounted }: { isMounted: boolean }) => {
  const [options, setOptions] = useState(defaultOptions);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['oobe', 'user']);
  const [copied, setCopied] = useState(false);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const updateOption = (id: string, field: 'value' | 'enabled', newValue: string | boolean) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, [field]: newValue } : o));
  };

  const resetDefaults = () => {
    setOptions(defaultOptions.map(o => ({ ...o })));
  };

  const enabledCount = options.filter(o => o.enabled).length;

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

    // Group by pass
    const regional = enabled.filter(o => o.category === 'regional');
    const winpe = enabled.filter(o => o.category === 'windows pe');
    const disk = enabled.filter(o => o.category === 'disk');
    const product = enabled.filter(o => o.category === 'product');
    const user = enabled.filter(o => o.category === 'user');
    const oobe = enabled.filter(o => o.category === 'oobe' || o.category === 'privacy (oobe)');
    const firstLogon = enabled.filter(o => o.category === 'first logon');

    // windowsPE pass
    if (winpe.length > 0 || regional.length > 0 || disk.length > 0 || product.length > 0) {
      lines.push('  <settings pass="windowsPE">');
      if (winpe.length > 0 || regional.length > 0) {
        lines.push('    <component name="Microsoft-Windows-International-Core-WinPE">');
        regional.forEach(o => {
          const tag = o.xmlPath.split('/').pop();
          lines.push(`      <${tag}>${o.value}</${tag}>`);
        });
        winpe.filter(o => o.id === 'setup-ui-language').forEach(o => {
          lines.push('      <SetupUILanguage>');
          lines.push(`        <UILanguage>${o.value}</UILanguage>`);
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
          lines.push(`          <DiskID>${disk.find(o => o.id === 'disk-id')?.value || '0'}</DiskID>`);
          lines.push(`          <WillWipeDisk>${disk.find(o => o.id === 'wipe-disk')?.value || 'true'}</WillWipeDisk>`);
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
          if (o.id === 'accept-eula') lines.push(`      <UserData><AcceptEula>${o.value}</AcceptEula></UserData>`);
          if (o.id === 'product-key' && o.value) lines.push(`      <UserData><ProductKey><Key>${o.value}</Key></ProductKey></UserData>`);
        });
        // Bypass checks
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

    // oobeSystem pass
    if (user.length > 0 || oobe.length > 0 || firstLogon.length > 0) {
      lines.push('  <settings pass="oobeSystem">');
      lines.push('    <component name="Microsoft-Windows-Shell-Setup">');

      const compName = user.find(o => o.id === 'computer-name');
      if (compName) lines.push(`      <ComputerName>${compName.value}</ComputerName>`);

      const tz = options.find(o => o.id === 'timezone' && o.enabled);
      if (tz) lines.push(`      <TimeZone>${tz.value}</TimeZone>`);

      // OOBE
      if (oobe.length > 0) {
        lines.push('      <OOBE>');
        oobe.forEach(o => {
          const tag = o.xmlPath.split('/').pop();
          if (o.type === 'boolean') {
            lines.push(`        <${tag}>${o.value}</${tag}>`);
          } else {
            lines.push(`        <${tag}>${o.value}</${tag}>`);
          }
        });
        lines.push('      </OOBE>');
      }

      // User accounts
      const userName = user.find(o => o.id === 'user-name');
      if (userName) {
        const userPass = user.find(o => o.id === 'user-password');
        lines.push('      <UserAccounts>');
        lines.push('        <LocalAccounts>');
        lines.push('          <LocalAccount wcm:action="add">');
        lines.push(`            <Name>${userName.value}</Name>`);
        lines.push('            <Group>Administrators</Group>');
        if (userPass?.enabled && userPass.value) {
          lines.push(`            <Password><Value>${userPass.value}</Value><PlainText>true</PlainText></Password>`);
        }
        lines.push('          </LocalAccount>');
        lines.push('        </LocalAccounts>');
        lines.push('      </UserAccounts>');
      }

      // Auto logon
      const autoLogon = user.find(o => o.id === 'auto-logon');
      if (autoLogon?.value === 'true') {
        const logonCount = user.find(o => o.id === 'auto-logon-count');
        lines.push('      <AutoLogon>');
        lines.push('        <Enabled>true</Enabled>');
        lines.push(`        <Username>${userName?.value || 'User'}</Username>`);
        if (logonCount) lines.push(`        <LogonCount>${logonCount.value}</LogonCount>`);
        lines.push('      </AutoLogon>');
      }

      // First logon commands
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
          if (cmd) {
            lines.push(`        <SynchronousCommand wcm:action="add"><Order>${order}</Order>`);
            lines.push(`          <CommandLine>cmd /c ${cmd}</CommandLine>`);
            lines.push(`          <Description>${o.label}</Description></SynchronousCommand>`);
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

  const grouped = categoryOrder.reduce((acc, cat) => {
    const items = options.filter(o => o.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, AnswerOption[]>);

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

      {/* Options */}
      <div className="max-h-[500px] overflow-y-auto p-3">
        {Object.entries(grouped).map(([category, items]) => {
          const isExpanded = expandedCategories.includes(category);
          const enabledInCat = items.filter(i => i.enabled).length;

          return (
            <div key={category} className="mb-3">
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-2 mb-2 w-full text-left group"
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
                <div className="space-y-2 ml-6">
                  {items.map(option => (
                    <div
                      key={option.id}
                      className={`
                        p-2.5 rounded-lg transition-all
                        ${option.enabled ? 'bg-primary/5 border border-primary/20' : 'bg-muted/20'}
                      `}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Switch
                            checked={option.enabled}
                            onCheckedChange={(v) => updateOption(option.id, 'enabled', v)}
                            className="scale-75"
                          />
                          <span className="text-sm font-medium text-foreground truncate">{option.label}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1.5 ml-10">{option.description}</p>

                      {option.enabled && (
                        <div className="ml-10">
                          {option.type === 'text' || option.type === 'password' ? (
                            <Input
                              type={option.type === 'password' ? 'password' : 'text'}
                              value={option.value}
                              onChange={(e) => updateOption(option.id, 'value', e.target.value)}
                              placeholder={option.defaultValue || 'Enter value...'}
                              className="h-8 text-xs font-mono bg-muted/30"
                            />
                          ) : option.type === 'select' ? (
                            <select
                              value={option.value}
                              onChange={(e) => updateOption(option.id, 'value', e.target.value)}
                              className="w-full h-8 text-xs font-mono bg-muted/30 border border-border rounded-md px-2 text-foreground"
                            >
                              {option.options?.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          ) : option.type === 'boolean' ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={option.value}
                                onChange={(e) => updateOption(option.id, 'value', e.target.value)}
                                className="h-8 text-xs font-mono bg-muted/30 border border-border rounded-md px-2 text-foreground"
                              >
                                <option value="true">true</option>
                                <option value="false">false</option>
                              </select>
                            </div>
                          ) : null}
                          <p className="text-[10px] font-mono text-muted-foreground/50 mt-1 truncate">
                            {option.xmlPath}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* XML Preview */}
      <div className="border-t border-border">
        <details className="group">
          <summary className="px-4 py-2.5 cursor-pointer text-xs font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
            Preview XML Output
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