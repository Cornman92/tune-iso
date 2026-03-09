import { useState } from 'react';
import { RotateCcw, Copy, Download, Check } from 'lucide-react';
import { escapePS } from '@/lib/sanitize';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { ProjectData } from '@/components/ProjectManager';

interface RollbackScriptGeneratorProps {
  onGetCurrentConfig: () => ProjectData;
  exportServices: React.RefObject<() => string[]>;
  exportComponents: React.RefObject<() => string[]>;
  exportRegistry: React.RefObject<() => { hive: string; keyPath: string; valueName: string; valueType: string; valueData: string }[]>;
}

function generateRollbackScript(
  config: ProjectData,
  disabledServices: string[],
  removedComponents: string[],
  registryEntries: { hive: string; keyPath: string; valueName: string; valueType: string; valueData: string }[],
): string {
  const lines: string[] = [
    '# ============================================================',
    '# ISO Forge — Rollback Script',
    `# Generated: ${new Date().toISOString()}`,
    `# Project: ${config.name || 'Untitled'}`,
    '# This script attempts to reverse customizations applied by ISO Forge.',
    '# Run as Administrator in an elevated PowerShell session.',
    '# ============================================================',
    '',
    '#Requires -RunAsAdministrator',
    '$ErrorActionPreference = "Continue"',
    '',
    'Write-Host "=== ISO Forge Rollback Script ===" -ForegroundColor Cyan',
    'Write-Host "Starting rollback..." -ForegroundColor Yellow',
    '',
  ];

  // Re-enable services
  if (disabledServices.length > 0) {
    lines.push('# --- Re-enable Disabled Services ---');
    lines.push(`Write-Host "Re-enabling ${disabledServices.length} services..." -ForegroundColor Cyan`);
    disabledServices.forEach((svc) => {
      const safeSvc = escapePS(svc);
      lines.push(`try {`);
      lines.push(`    Set-Service -Name "${safeSvc}" -StartupType Automatic -ErrorAction Stop`);
      lines.push(`    Start-Service -Name "${safeSvc}" -ErrorAction SilentlyContinue`);
      lines.push(`    Write-Host "  [OK] Re-enabled: ${safeSvc}" -ForegroundColor Green`);
      lines.push(`} catch {`);
      lines.push(`    Write-Host "  [WARN] Could not re-enable: ${safeSvc} - `$_" -ForegroundColor Yellow`);
      lines.push(`}`);
    });
    lines.push('');
  }

  // Reverse registry changes
  if (registryEntries.length > 0) {
    lines.push('# --- Reverse Registry Changes ---');
    lines.push(`Write-Host "Removing ${registryEntries.length} registry modifications..." -ForegroundColor Cyan`);
    lines.push('# NOTE: This removes the values set by ISO Forge. If the original values were different,');
    lines.push('# you may need to manually restore them from a registry backup.');
    registryEntries.forEach((entry) => {
      const safeHive = escapePS(entry.hive);
      const safeKeyPath = escapePS(entry.keyPath);
      const safeValueName = escapePS(entry.valueName);
      const regPath = `${safeHive}:\\${safeKeyPath}`;
      lines.push(`try {`);
      lines.push(`    Remove-ItemProperty -Path "Registry::${regPath}" -Name "${safeValueName}" -ErrorAction Stop`);
      lines.push(`    Write-Host "  [OK] Removed: ${regPath}\\${safeValueName}" -ForegroundColor Green`);
      lines.push(`} catch {`);
      lines.push(`    Write-Host "  [WARN] Could not remove: ${safeValueName} - `$_" -ForegroundColor Yellow`);
      lines.push(`}`);
    });
    lines.push('');
  }

  // Re-register removed components (AppX)
  if (removedComponents.length > 0) {
    lines.push('# --- Re-register Removed Components ---');
    lines.push(`Write-Host "Attempting to re-register ${removedComponents.length} removed AppX packages..." -ForegroundColor Cyan`);
    lines.push('# NOTE: Some packages may not be restorable without the original Windows media.');
    lines.push('# Consider running: DISM /Online /Add-ProvisionedAppxPackage or reinstalling from the Microsoft Store.');
    removedComponents.forEach((comp) => {
      lines.push(`Write-Host "  [INFO] Cannot auto-restore: ${comp} — reinstall from Microsoft Store or DISM" -ForegroundColor Yellow`);
    });
    lines.push('');
  }

  // Uninstall injected programs (best-effort via winget)
  const allPrograms = config.customizations?.programs || [];
  if (allPrograms.length > 0) {
    lines.push('# --- Uninstall Injected Programs (via winget) ---');
    lines.push(`Write-Host "Attempting to uninstall ${allPrograms.length} programs..." -ForegroundColor Cyan`);
    allPrograms.forEach((prog) => {
      lines.push(`try {`);
      lines.push(`    winget uninstall --id "${prog}" --silent --accept-source-agreements 2>$null`);
      lines.push(`    Write-Host "  [OK] Uninstalled: ${prog}" -ForegroundColor Green`);
      lines.push(`} catch {`);
      lines.push(`    Write-Host "  [WARN] Could not uninstall: ${prog}" -ForegroundColor Yellow`);
      lines.push(`}`);
    });
    lines.push('');
  }

  // Remove injected drivers
  if (config.drivers && config.drivers.length > 0) {
    lines.push('# --- Remove Injected Drivers ---');
    lines.push(`Write-Host "Listing ${config.drivers.length} injected drivers for manual review..." -ForegroundColor Cyan`);
    lines.push('# NOTE: Driver removal requires identifying the OEM driver package.');
    lines.push('# Use: pnputil /enum-drivers and pnputil /delete-driver <oem##.inf> /uninstall');
    config.drivers.forEach((drv) => {
      lines.push(`Write-Host "  [INFO] Review driver: ${drv.name} (${drv.path})" -ForegroundColor Yellow`);
    });
    lines.push('');
  }

  // Create restore point
  lines.push('# --- Create System Restore Point ---');
  lines.push('try {');
  lines.push('    Enable-ComputerRestore -Drive "C:\\" -ErrorAction SilentlyContinue');
  lines.push('    Checkpoint-Computer -Description "ISO Forge Rollback" -RestorePointType MODIFY_SETTINGS -ErrorAction Stop');
  lines.push('    Write-Host "[OK] System restore point created" -ForegroundColor Green');
  lines.push('} catch {');
  lines.push('    Write-Host "[WARN] Could not create restore point: $_" -ForegroundColor Yellow');
  lines.push('}');
  lines.push('');

  lines.push('Write-Host ""');
  lines.push('Write-Host "=== Rollback Complete ===" -ForegroundColor Cyan');
  lines.push('Write-Host "Review warnings above. Some changes may require a reboot or manual intervention." -ForegroundColor Yellow');
  lines.push('Write-Host "Consider restarting your computer to apply all changes." -ForegroundColor Yellow');

  return lines.join('\n');
}

const RollbackScriptGenerator = ({
  onGetCurrentConfig,
  exportServices,
  exportComponents,
  exportRegistry,
}: RollbackScriptGeneratorProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const script = open
    ? generateRollbackScript(
        onGetCurrentConfig(),
        exportServices.current(),
        exportComponents.current(),
        exportRegistry.current(),
      )
    : '';

  const lineCount = script.split('\n').length;

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    toast.success('Rollback script copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rollback_${new Date().toISOString().slice(0, 10)}.ps1`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Rollback script downloaded');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono text-xs h-8 gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" />
          Rollback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-primary" />
            Rollback Script Generator
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-[10px] font-mono">
            {lineCount} lines
          </Badge>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs font-mono gap-1.5" onClick={handleCopy}>
              {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs font-mono gap-1.5" onClick={handleDownload}>
              <Download className="w-3 h-3" />
              Download .ps1
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px] border border-border rounded-lg bg-muted/30">
          <pre className="p-4 text-[11px] font-mono text-foreground leading-relaxed whitespace-pre-wrap">
            {script}
          </pre>
        </ScrollArea>

        <p className="text-[10px] text-muted-foreground font-mono mt-1">
          ⚠ Run as Administrator. Some changes (component removal, drivers) may need manual intervention.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default RollbackScriptGenerator;
