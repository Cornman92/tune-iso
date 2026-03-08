import { useCallback, MutableRefObject } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ExportData {
  customizations: { programs: string[]; tweaks: string[]; optimizations: string[] };
  drivers: { name: string; path: string; type: string }[];
  updates: { kb: string; title: string; category: string; source: string; filePath?: string }[];
  services: string[];
  components: string[];
  registryEntries: { hive: string; keyPath: string; valueName: string; valueType: string; valueData: string }[];
}

interface PowerShellExportProps {
  exportCustomizations: MutableRefObject<() => { programs: string[]; tweaks: string[]; optimizations: string[] }>;
  exportDrivers: MutableRefObject<() => { name: string; path: string; type: string }[]>;
  exportUpdates: MutableRefObject<() => { kb: string; title: string; category: string; source: string; filePath?: string }[]>;
  exportServices: MutableRefObject<() => string[]>;
  exportComponents: MutableRefObject<() => string[]>;
  exportRegistry: MutableRefObject<() => { hive: string; keyPath: string; valueName: string; valueType: string; valueData: string }[]>;
  isMounted: boolean;
}

const PowerShellExport = ({
  exportCustomizations,
  exportDrivers,
  exportUpdates,
  exportServices,
  exportComponents,
  exportRegistry,
  isMounted,
}: PowerShellExportProps) => {

  const generateScript = useCallback((): string => {
    const customizations = exportCustomizations.current();
    const drivers = exportDrivers.current();
    const updates = exportUpdates.current();
    const services = exportServices.current();
    const components = exportComponents.current();
    const registry = exportRegistry.current();

    const lines: string[] = [];
    const add = (s: string) => lines.push(s);
    const blank = () => lines.push('');

    add('#═══════════════════════════════════════════════════════════════');
    add('# ISO Forge - Windows Image Customization Script');
    add(`# Generated: ${new Date().toISOString()}`);
    add('# Requires: Administrator privileges, Windows ADK (DISM)');
    add('#═══════════════════════════════════════════════════════════════');
    blank();
    add('#Requires -RunAsAdministrator');
    add('$ErrorActionPreference = "Stop"');
    blank();

    add('# ── Configuration ──────────────────────────────────────────');
    add('$MountDir     = "C:\\Mount"');
    add('$WimFile      = "install.wim"');
    add('$WimIndex     = 6');
    add('$OutputISO    = "Windows_Custom.iso"');
    add('$OutputDir    = "C:\\ISO_Output"');
    add('$DriverDir    = "C:\\Drivers"');
    add('$UpdateDir    = "C:\\Updates"');
    blank();

    add('# ── Helper Functions ───────────────────────────────────────');
    add('function Write-Step($msg) {');
    add('    Write-Host ""');
    add('    Write-Host "══► $msg" -ForegroundColor Cyan');
    add('    Write-Host ("─" * 60) -ForegroundColor DarkGray');
    add('}');
    blank();

    // Mount
    add('# ══════════════════════════════════════════════════════════');
    add('# STEP 1: Mount Windows Image');
    add('# ══════════════════════════════════════════════════════════');
    add('Write-Step "Mounting Windows Image"');
    add('if (-not (Test-Path $MountDir)) { New-Item -ItemType Directory -Path $MountDir -Force | Out-Null }');
    add('DISM /Mount-Wim /WimFile:$WimFile /Index:$WimIndex /MountDir:$MountDir');
    blank();

    // Components
    if (components.length > 0) {
      add('# ══════════════════════════════════════════════════════════');
      add(`# STEP 2: Remove Components (${components.length} packages)`);
      add('# ══════════════════════════════════════════════════════════');
      add('Write-Step "Removing Provisioned App Packages"');
      add('$packages = @(');
      components.forEach(c => add(`    "${c}"`));
      add(')');
      blank();
      add('$installed = (DISM /Image:$MountDir /Get-ProvisionedAppxPackages | Select-String "PackageName" | ForEach-Object { ($_ -split ":")[1].Trim() })');
      add('foreach ($pkg in $packages) {');
      add('    $match = $installed | Where-Object { $_ -like "*$pkg*" }');
      add('    if ($match) {');
      add('        Write-Host "  Removing: $match" -ForegroundColor Yellow');
      add('        DISM /Image:$MountDir /Remove-ProvisionedAppxPackage /PackageName:$match');
      add('    } else {');
      add('        Write-Host "  Not found: $pkg" -ForegroundColor DarkGray');
      add('    }');
      add('}');
      blank();
    }

    // Services
    if (services.length > 0) {
      add('# ══════════════════════════════════════════════════════════');
      add(`# STEP 3: Disable Services (${services.length} services)`);
      add('# ══════════════════════════════════════════════════════════');
      add('Write-Step "Disabling Windows Services"');
      add('$servicesToDisable = @(');
      services.forEach(s => add(`    "${s}"`));
      add(')');
      blank();
      add('foreach ($svc in $servicesToDisable) {');
      add('    Write-Host "  Disabling: $svc" -ForegroundColor Yellow');
      add('    REG ADD "HKLM\\SYSTEM\\ControlSet001\\Services\\$svc" /v Start /t REG_DWORD /d 4 /f | Out-Null');
      add('}');
      blank();
    }

    // Registry
    if (registry.length > 0) {
      add('# ══════════════════════════════════════════════════════════');
      add(`# STEP 4: Apply Registry Tweaks (${registry.length} entries)`);
      add('# ══════════════════════════════════════════════════════════');
      add('Write-Step "Applying Registry Modifications"');
      add('# Load offline hives');
      add('REG LOAD "HKLM\\OFFLINE_SOFTWARE" "$MountDir\\Windows\\System32\\config\\SOFTWARE"');
      add('REG LOAD "HKLM\\OFFLINE_SYSTEM" "$MountDir\\Windows\\System32\\config\\SYSTEM"');
      add('REG LOAD "HKLM\\OFFLINE_DEFAULT" "$MountDir\\Windows\\System32\\config\\DEFAULT"');
      blank();
      registry.forEach(r => {
        const regType = r.valueType === 'REG_SZ' ? 'REG_SZ' : r.valueType;
        add(`Write-Host "  Setting: ${r.valueName}" -ForegroundColor Yellow`);
        add(`REG ADD "${r.hive}\\${r.keyPath}" /v "${r.valueName}" /t ${regType} /d "${r.valueData}" /f | Out-Null`);
      });
      blank();
      add('# Unload offline hives');
      add('REG UNLOAD "HKLM\\OFFLINE_SOFTWARE"');
      add('REG UNLOAD "HKLM\\OFFLINE_SYSTEM"');
      add('REG UNLOAD "HKLM\\OFFLINE_DEFAULT"');
      blank();
    }

    // Drivers
    if (drivers.length > 0) {
      add('# ══════════════════════════════════════════════════════════');
      add(`# STEP 5: Inject Drivers (${drivers.length} drivers)`);
      add('# ══════════════════════════════════════════════════════════');
      add('Write-Step "Injecting Drivers"');
      drivers.forEach(d => {
        if (d.type === 'folder') {
          add(`Write-Host "  Adding folder: ${d.path}" -ForegroundColor Yellow`);
          add(`DISM /Image:$MountDir /Add-Driver /Driver:"${d.path}" /Recurse`);
        } else {
          add(`Write-Host "  Adding driver: ${d.name}" -ForegroundColor Yellow`);
          add(`DISM /Image:$MountDir /Add-Driver /Driver:"${d.path}"`);
        }
      });
      blank();
    }

    // Updates
    if (updates.length > 0) {
      add('# ══════════════════════════════════════════════════════════');
      add(`# STEP 6: Slipstream Updates (${updates.length} packages)`);
      add('# ══════════════════════════════════════════════════════════');
      add('Write-Step "Applying Windows Updates"');

      // Sort: SSU first, then CU, then .NET, then security, then rest
      const order = ['servicing', 'cumulative', 'dotnet', 'security', 'driver', 'feature', 'custom'];
      const sorted = [...updates].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
      sorted.forEach(u => {
        const path = u.filePath || `$UpdateDir\\${u.kb}.msu`;
        add(`Write-Host "  Applying: ${u.kb} - ${u.title}" -ForegroundColor Yellow`);
        add(`DISM /Image:$MountDir /Add-Package /PackagePath:"${path}"`);
      });
      blank();
    }

    // Customizations (programs)
    if (customizations.programs.length > 0 || customizations.tweaks.length > 0 || customizations.optimizations.length > 0) {
      add('# ══════════════════════════════════════════════════════════');
      add('# STEP 7: Apply Customizations');
      add('# ══════════════════════════════════════════════════════════');
      add('Write-Step "Applying Customizations"');
      if (customizations.programs.length > 0) {
        add(`Write-Host "  Programs to integrate: ${customizations.programs.length}" -ForegroundColor Yellow`);
        customizations.programs.forEach(p => add(`Write-Host "    - ${p}" -ForegroundColor DarkGray`));
      }
      if (customizations.tweaks.length > 0) {
        add(`Write-Host "  Tweaks enabled: ${customizations.tweaks.length}" -ForegroundColor Yellow`);
        customizations.tweaks.forEach(t => add(`Write-Host "    - ${t}" -ForegroundColor DarkGray`));
      }
      if (customizations.optimizations.length > 0) {
        add(`Write-Host "  Optimizations enabled: ${customizations.optimizations.length}" -ForegroundColor Yellow`);
        customizations.optimizations.forEach(o => add(`Write-Host "    - ${o}" -ForegroundColor DarkGray`));
      }
      blank();
    }

    // Cleanup & Commit
    add('# ══════════════════════════════════════════════════════════');
    add('# FINAL: Cleanup, Commit & Build ISO');
    add('# ══════════════════════════════════════════════════════════');
    add('Write-Step "Cleaning Up Image"');
    add('DISM /Image:$MountDir /Cleanup-Image /StartComponentCleanup /ResetBase');
    blank();
    add('Write-Step "Committing Changes"');
    add('DISM /Unmount-Wim /MountDir:$MountDir /Commit');
    blank();
    add('Write-Step "Building ISO"');
    add('if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null }');
    add('$bootData = "2#p0,e,b`"etfsboot.com`"#pEF,e,b`"efisys.bin`""');
    add('oscdimg -m -o -u2 -udfver102 -bootdata:$bootData -l"CUSTOM_WIN" .\\ISO_Source "$OutputDir\\$OutputISO"');
    blank();
    add('Write-Host ""');
    add('Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green');
    add('Write-Host "  Build Complete: $OutputDir\\$OutputISO" -ForegroundColor Green');
    add('Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green');

    return lines.join('\r\n');
  }, [exportCustomizations, exportDrivers, exportUpdates, exportServices, exportComponents, exportRegistry]);

  const handleExport = () => {
    const script = generateScript();
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ISO_Forge_Build.ps1';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('PowerShell script exported');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={!isMounted}
      className="text-xs font-mono h-8 gap-1.5"
    >
      <FileDown className="w-3.5 h-3.5" />
      Export .ps1
    </Button>
  );
};

export default PowerShellExport;
