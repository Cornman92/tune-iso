import { useCallback, MutableRefObject, useState } from 'react';
import { FileDown, ChevronDown } from 'lucide-react';
import type { BuildStep } from '@/components/BuildStepReorder';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  exportScriptRef?: MutableRefObject<() => void>;
  buildSteps: BuildStep[];
}

const PowerShellExport = ({
  exportCustomizations,
  exportDrivers,
  exportUpdates,
  exportServices,
  exportComponents,
  exportRegistry,
  isMounted,
  exportScriptRef,
  buildSteps,
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

    // Mount (always first)
    add('# ══════════════════════════════════════════════════════════');
    add('# STEP 1: Mount Windows Image');
    add('# ══════════════════════════════════════════════════════════');
    add('Write-Step "Mounting Windows Image"');
    add('if (-not (Test-Path $MountDir)) { New-Item -ItemType Directory -Path $MountDir -Force | Out-Null }');
    add('DISM /Mount-Wim /WimFile:$WimFile /Index:$WimIndex /MountDir:$MountDir');
    blank();

    // Build sections in custom order
    const enabledSteps = buildSteps.filter(s => s.enabled);
    let stepNum = 2;

    const sectionGenerators: Record<string, () => void> = {
      components: () => {
        if (components.length === 0) return;
        add('# ══════════════════════════════════════════════════════════');
        add(`# STEP ${stepNum++}: Remove Components (${components.length} packages)`);
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
      },
      services: () => {
        if (services.length === 0) return;
        add('# ══════════════════════════════════════════════════════════');
        add(`# STEP ${stepNum++}: Disable Services (${services.length} services)`);
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
      },
      registry: () => {
        if (registry.length === 0) return;
        add('# ══════════════════════════════════════════════════════════');
        add(`# STEP ${stepNum++}: Apply Registry Tweaks (${registry.length} entries)`);
        add('# ══════════════════════════════════════════════════════════');
        add('Write-Step "Applying Registry Modifications"');
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
        add('REG UNLOAD "HKLM\\OFFLINE_SOFTWARE"');
        add('REG UNLOAD "HKLM\\OFFLINE_SYSTEM"');
        add('REG UNLOAD "HKLM\\OFFLINE_DEFAULT"');
        blank();
      },
      drivers: () => {
        if (drivers.length === 0) return;
        add('# ══════════════════════════════════════════════════════════');
        add(`# STEP ${stepNum++}: Inject Drivers (${drivers.length} drivers)`);
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
      },
      updates: () => {
        if (updates.length === 0) return;
        add('# ══════════════════════════════════════════════════════════');
        add(`# STEP ${stepNum++}: Slipstream Updates (${updates.length} packages)`);
        add('# ══════════════════════════════════════════════════════════');
        add('Write-Step "Applying Windows Updates"');
        const order = ['servicing', 'cumulative', 'dotnet', 'security', 'driver', 'feature', 'custom'];
        const sorted = [...updates].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
        sorted.forEach(u => {
          const path = u.filePath || `$UpdateDir\\${u.kb}.msu`;
          add(`Write-Host "  Applying: ${u.kb} - ${u.title}" -ForegroundColor Yellow`);
          add(`DISM /Image:$MountDir /Add-Package /PackagePath:"${path}"`);
        });
        blank();
      },
      customizations: () => {
        if (customizations.programs.length === 0 && customizations.tweaks.length === 0 && customizations.optimizations.length === 0) return;
        add('# ══════════════════════════════════════════════════════════');
        add(`# STEP ${stepNum++}: Apply Customizations`);
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
      },
    };

    enabledSteps.forEach(step => {
      sectionGenerators[step.id]?.();
    });

    // Cleanup & Commit (always last)
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
  }, [exportCustomizations, exportDrivers, exportUpdates, exportServices, exportComponents, exportRegistry, buildSteps]);

  const generateBatch = useCallback((): string => {
    const customizations = exportCustomizations.current();
    const drivers = exportDrivers.current();
    const updates = exportUpdates.current();
    const services = exportServices.current();
    const components = exportComponents.current();
    const registry = exportRegistry.current();

    const lines: string[] = [];
    const add = (s: string) => lines.push(s);
    const blank = () => lines.push('');

    add('@echo off');
    add('REM ═══════════════════════════════════════════════════════════');
    add('REM  ISO Forge - Windows Image Customization Script (CMD)');
    add(`REM  Generated: ${new Date().toISOString()}`);
    add('REM  Requires: Administrator privileges, Windows ADK (DISM)');
    add('REM ═══════════════════════════════════════════════════════════');
    blank();
    add('NET SESSION >nul 2>&1');
    add('IF %ERRORLEVEL% NEQ 0 (');
    add('    echo ERROR: This script must be run as Administrator.');
    add('    pause');
    add('    exit /b 1');
    add(')');
    blank();
    add('SET MountDir=C:\\Mount');
    add('SET WimFile=install.wim');
    add('SET WimIndex=6');
    add('SET OutputISO=Windows_Custom.iso');
    add('SET OutputDir=C:\\ISO_Output');
    add('SET DriverDir=C:\\Drivers');
    add('SET UpdateDir=C:\\Updates');
    blank();

    // Mount (always first)
    add('echo.');
    add('echo ══► Mounting Windows Image');
    add('echo ────────────────────────────────────────────────────');
    add('IF NOT EXIST "%MountDir%" mkdir "%MountDir%"');
    add('DISM /Mount-Wim /WimFile:%WimFile% /Index:%WimIndex% /MountDir:%MountDir%');
    add('IF %ERRORLEVEL% NEQ 0 ( echo FAILED to mount image & pause & exit /b 1 )');
    blank();

    // Build sections in custom order
    const enabledSteps = buildSteps.filter(s => s.enabled);

    const batSections: Record<string, () => void> = {
      components: () => {
        if (components.length === 0) return;
        add('echo.');
        add(`echo ══► Removing Components (${components.length} packages)`);
        add('echo ────────────────────────────────────────────────────');
        components.forEach(c => {
          add(`echo   Removing: ${c}`);
          add(`FOR /F "tokens=3 delims=: " %%P IN ('DISM /Image:%MountDir% /Get-ProvisionedAppxPackages ^| findstr /i "${c}"') DO (`);
          add(`    DISM /Image:%MountDir% /Remove-ProvisionedAppxPackage /PackageName:%%P`);
          add(')');
        });
        blank();
      },
      services: () => {
        if (services.length === 0) return;
        add('echo.');
        add(`echo ══► Disabling Services (${services.length} services)`);
        add('echo ────────────────────────────────────────────────────');
        services.forEach(s => {
          add(`echo   Disabling: ${s}`);
          add(`REG ADD "HKLM\\SYSTEM\\ControlSet001\\Services\\${s}" /v Start /t REG_DWORD /d 4 /f >nul`);
        });
        blank();
      },
      registry: () => {
        if (registry.length === 0) return;
        add('echo.');
        add(`echo ══► Applying Registry Tweaks (${registry.length} entries)`);
        add('echo ────────────────────────────────────────────────────');
        add('REG LOAD "HKLM\\OFFLINE_SOFTWARE" "%MountDir%\\Windows\\System32\\config\\SOFTWARE"');
        add('REG LOAD "HKLM\\OFFLINE_SYSTEM" "%MountDir%\\Windows\\System32\\config\\SYSTEM"');
        add('REG LOAD "HKLM\\OFFLINE_DEFAULT" "%MountDir%\\Windows\\System32\\config\\DEFAULT"');
        registry.forEach(r => {
          add(`echo   Setting: ${r.valueName}`);
          add(`REG ADD "${r.hive}\\${r.keyPath}" /v "${r.valueName}" /t ${r.valueType} /d "${r.valueData}" /f >nul`);
        });
        add('REG UNLOAD "HKLM\\OFFLINE_SOFTWARE"');
        add('REG UNLOAD "HKLM\\OFFLINE_SYSTEM"');
        add('REG UNLOAD "HKLM\\OFFLINE_DEFAULT"');
        blank();
      },
      drivers: () => {
        if (drivers.length === 0) return;
        add('echo.');
        add(`echo ══► Injecting Drivers (${drivers.length} drivers)`);
        add('echo ────────────────────────────────────────────────────');
        drivers.forEach(d => {
          if (d.type === 'folder') {
            add(`echo   Adding folder: ${d.path}`);
            add(`DISM /Image:%MountDir% /Add-Driver /Driver:"${d.path}" /Recurse`);
          } else {
            add(`echo   Adding driver: ${d.name}`);
            add(`DISM /Image:%MountDir% /Add-Driver /Driver:"${d.path}"`);
          }
        });
        blank();
      },
      updates: () => {
        if (updates.length === 0) return;
        add('echo.');
        add(`echo ══► Applying Updates (${updates.length} packages)`);
        add('echo ────────────────────────────────────────────────────');
        const order = ['servicing', 'cumulative', 'dotnet', 'security', 'driver', 'feature', 'custom'];
        const sorted = [...updates].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
        sorted.forEach(u => {
          const path = u.filePath || `%UpdateDir%\\${u.kb}.msu`;
          add(`echo   Applying: ${u.kb} - ${u.title}`);
          add(`DISM /Image:%MountDir% /Add-Package /PackagePath:"${path}"`);
        });
        blank();
      },
      customizations: () => {
        if (customizations.programs.length === 0 && customizations.tweaks.length === 0 && customizations.optimizations.length === 0) return;
        add('echo.');
        add('echo ══► Applying Customizations');
        add('echo ────────────────────────────────────────────────────');
        customizations.programs.forEach(p => add(`echo   Program: ${p}`));
        customizations.tweaks.forEach(t => add(`echo   Tweak: ${t}`));
        customizations.optimizations.forEach(o => add(`echo   Optimization: ${o}`));
        blank();
      },
    };

    enabledSteps.forEach(step => {
      batSections[step.id]?.();
    });

    // Cleanup & Commit (always last)
    add('echo.');
    add('echo ══► Cleaning Up Image');
    add('echo ────────────────────────────────────────────────────');
    add('DISM /Image:%MountDir% /Cleanup-Image /StartComponentCleanup /ResetBase');
    blank();
    add('echo.');
    add('echo ══► Committing Changes');
    add('echo ────────────────────────────────────────────────────');
    add('DISM /Unmount-Wim /MountDir:%MountDir% /Commit');
    blank();
    add('echo.');
    add('echo ══► Building ISO');
    add('echo ────────────────────────────────────────────────────');
    add('IF NOT EXIST "%OutputDir%" mkdir "%OutputDir%"');
    add('oscdimg -m -o -u2 -udfver102 -bootdata:2#p0,e,b"etfsboot.com"#pEF,e,b"efisys.bin" -l"CUSTOM_WIN" .\\ISO_Source "%OutputDir%\\%OutputISO%"');
    blank();
    add('echo.');
    add('echo ═══════════════════════════════════════════════════════');
    add('echo   Build Complete: %OutputDir%\\%OutputISO%');
    add('echo ═══════════════════════════════════════════════════════');
    add('pause');

    return lines.join('\r\n');
  }, [exportCustomizations, exportDrivers, exportUpdates, exportServices, exportComponents, exportRegistry, buildSteps]);

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPS1 = () => {
    downloadFile(generateScript(), 'ISO_Forge_Build.ps1');
    toast.success('PowerShell script exported');
  };

  const handleExportBAT = () => {
    downloadFile(generateBatch(), 'ISO_Forge_Build.bat');
    toast.success('Batch script exported');
  };

  // Expose PS1 export for keyboard shortcut
  if (exportScriptRef) {
    exportScriptRef.current = handleExportPS1;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={!isMounted}
          className="text-xs font-mono h-8 gap-1.5"
        >
          <FileDown className="w-3.5 h-3.5" />
          Export Script
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPS1} className="text-xs font-mono gap-2 cursor-pointer">
          <FileDown className="w-3.5 h-3.5" />
          PowerShell (.ps1)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportBAT} className="text-xs font-mono gap-2 cursor-pointer">
          <FileDown className="w-3.5 h-3.5" />
          Batch / CMD (.bat)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PowerShellExport;
