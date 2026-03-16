/**
 * Shared script generation utility used by LiveScriptPreview, PowerShellExport, and ScriptSimulator.
 */
import { escapePS } from '@/lib/sanitize';
import { wingetIds, tweakScripts, optimizationScripts } from '@/data/scriptCommands';
import type { BuildStep } from '@/components/BuildStepReorder';
import type { WimFeatureExport } from '@/components/WimEditor';

export interface ScriptInput {
  customizations: { programs: string[]; tweaks: string[]; optimizations: string[] };
  drivers: { name: string; path: string; type: string }[];
  updates: { kb: string; title: string; category: string; source: string; filePath?: string }[];
  services: string[];
  components: string[];
  registry: { hive: string; keyPath: string; valueName: string; valueType: string; valueData: string }[];
  features: WimFeatureExport[];
  buildSteps: BuildStep[];
}

export type RiskLevel = 'safe' | 'moderate' | 'aggressive';

export interface ScriptLine {
  text: string;
  risk: RiskLevel;
  explanation: string;
  section: string;
}

function classifyLine(line: string): { risk: RiskLevel; explanation: string } {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('REM ')) {
    return { risk: 'safe', explanation: 'Comment or blank line' };
  }
  if (trimmed.startsWith('$') && trimmed.includes('=')) {
    const varName = trimmed.split('=')[0].trim();
    return { risk: 'safe', explanation: `Sets variable ${varName}` };
  }

  // DISM commands
  if (trimmed.includes('DISM') && trimmed.includes('/Mount-Wim')) {
    return { risk: 'safe', explanation: 'Mounts the Windows image for offline editing' };
  }
  if (trimmed.includes('DISM') && trimmed.includes('/Unmount-Wim') && trimmed.includes('/Commit')) {
    return { risk: 'safe', explanation: 'Saves all changes and unmounts the image' };
  }
  if (trimmed.includes('DISM') && trimmed.includes('/Cleanup-Image')) {
    return { risk: 'moderate', explanation: 'Cleans up the component store — reduces image size but is irreversible' };
  }
  if (trimmed.includes('DISM') && trimmed.includes('/Enable-Feature')) {
    const match = trimmed.match(/FeatureName:"([^"]+)"/);
    return { risk: 'moderate', explanation: `Enables Windows feature: ${match?.[1] || 'unknown'}` };
  }
  if (trimmed.includes('DISM') && trimmed.includes('/Disable-Feature')) {
    const match = trimmed.match(/FeatureName:"([^"]+)"/);
    return { risk: 'moderate', explanation: `Disables Windows feature: ${match?.[1] || 'unknown'}` };
  }
  if (trimmed.includes('DISM') && trimmed.includes('/Remove-ProvisionedAppxPackage')) {
    return { risk: 'aggressive', explanation: 'Removes a built-in Windows app package — cannot be restored without re-imaging' };
  }
  if (trimmed.includes('DISM') && trimmed.includes('/Add-Driver')) {
    return { risk: 'moderate', explanation: 'Injects a driver into the offline image' };
  }
  if (trimmed.includes('DISM') && trimmed.includes('/Add-Package')) {
    return { risk: 'moderate', explanation: 'Applies a Windows update package (.msu/.cab)' };
  }

  // REG commands
  if (trimmed.includes('REG LOAD')) {
    return { risk: 'safe', explanation: 'Loads an offline registry hive for editing' };
  }
  if (trimmed.includes('REG UNLOAD')) {
    return { risk: 'safe', explanation: 'Unloads the offline registry hive' };
  }
  if (trimmed.includes('REG ADD')) {
    // Check for service disabling
    if (trimmed.includes('/v Start') && trimmed.includes('/d 4')) {
      const svcMatch = trimmed.match(/Services\\([^"\\]+)/);
      const svc = svcMatch?.[1] || 'unknown';
      const critical = ['wuauserv', 'WSearch', 'Spooler', 'RemoteRegistry'].includes(svc);
      return {
        risk: critical ? 'aggressive' : 'moderate',
        explanation: `Disables Windows service: ${svc} (Start=4 means disabled)`,
      };
    }
    // Telemetry / privacy
    if (trimmed.includes('AllowTelemetry') || trimmed.includes('DataCollection') || trimmed.includes('DiagTrack')) {
      return { risk: 'moderate', explanation: 'Modifies telemetry/diagnostic data collection setting' };
    }
    // Policies
    if (trimmed.includes('Policies\\')) {
      return { risk: 'moderate', explanation: 'Sets a Group Policy registry value' };
    }
    // Generic registry
    const keyMatch = trimmed.match(/REG ADD "([^"]+)"/);
    return { risk: 'moderate', explanation: `Modifies registry key: ${keyMatch?.[1]?.split('\\').pop() || 'unknown'}` };
  }

  // winget
  if (trimmed.startsWith('winget install')) {
    const idMatch = trimmed.match(/--id\s+(\S+)/);
    return { risk: 'safe', explanation: `Installs application via winget: ${idMatch?.[1] || 'unknown'}` };
  }

  // netsh firewall
  if (trimmed.includes('netsh advfirewall')) {
    return { risk: 'aggressive', explanation: 'Modifies Windows Firewall rules' };
  }

  // powercfg
  if (trimmed.includes('powercfg')) {
    return { risk: 'safe', explanation: 'Configures power plan settings' };
  }

  // schtasks
  if (trimmed.includes('schtasks')) {
    return { risk: 'moderate', explanation: 'Modifies a scheduled task' };
  }

  return { risk: 'safe', explanation: 'Script command' };
}

export function generateScriptLines(input: ScriptInput): ScriptLine[] {
  const { customizations, drivers, updates, services, components, registry, features, buildSteps } = input;
  const result: ScriptLine[] = [];
  let currentSection = 'header';

  const add = (text: string, sectionOverride?: string) => {
    const { risk, explanation } = classifyLine(text);
    result.push({ text, risk, explanation, section: sectionOverride || currentSection });
  };

  currentSection = 'header';
  add('#Requires -RunAsAdministrator');
  add('$ErrorActionPreference = "Stop"');
  add('$MountDir = "C:\\Mount"');
  add('$WimIndex = 6');
  add('');

  currentSection = 'mount';
  add('# ── Mount ──');
  add('DISM /Mount-Wim /WimFile:install.wim /Index:$WimIndex /MountDir:$MountDir');
  add('');

  const enabledSteps = buildSteps.filter(s => s.enabled);

  const sectionGenerators: Record<string, () => void> = {
    features: () => {
      if (features.length === 0) return;
      currentSection = 'features';
      const toEnable = features.filter(f => f.enabled);
      const toDisable = features.filter(f => !f.enabled);
      if (toEnable.length > 0 || toDisable.length > 0) {
        add(`# ── Features (${toEnable.length}↑ ${toDisable.length}↓) ──`);
        toEnable.forEach(f => add(`DISM /Image:$MountDir /Enable-Feature /FeatureName:"${escapePS(f.id)}" /All`));
        toDisable.forEach(f => add(`DISM /Image:$MountDir /Disable-Feature /FeatureName:"${escapePS(f.id)}"`));
        add('');
      }
    },
    components: () => {
      if (components.length === 0) return;
      currentSection = 'components';
      add(`# ── Remove Components (${components.length}) ──`);
      components.forEach(c => add(`DISM /Image:$MountDir /Remove-ProvisionedAppxPackage /PackageName:"*${escapePS(c)}*"`));
      add('');
    },
    services: () => {
      if (services.length === 0) return;
      currentSection = 'services';
      add(`# ── Disable Services (${services.length}) ──`);
      services.forEach(s => add(`REG ADD "HKLM\\SYSTEM\\ControlSet001\\Services\\${escapePS(s)}" /v Start /t REG_DWORD /d 4 /f`));
      add('');
    },
    registry: () => {
      if (registry.length === 0) return;
      currentSection = 'registry';
      add(`# ── Registry (${registry.length}) ──`);
      add('REG LOAD "HKLM\\OFFLINE_SW" "$MountDir\\Windows\\System32\\config\\SOFTWARE"');
      registry.forEach(r => {
        add(`REG ADD "${escapePS(r.hive)}\\${escapePS(r.keyPath)}" /v "${escapePS(r.valueName)}" /t ${r.valueType} /d "${escapePS(r.valueData)}" /f`);
      });
      add('REG UNLOAD "HKLM\\OFFLINE_SW"');
      add('');
    },
    drivers: () => {
      if (drivers.length === 0) return;
      currentSection = 'drivers';
      add(`# ── Drivers (${drivers.length}) ──`);
      drivers.forEach(d => {
        if (d.type === 'folder') {
          add(`DISM /Image:$MountDir /Add-Driver /Driver:"${escapePS(d.path)}" /Recurse`);
        } else {
          add(`DISM /Image:$MountDir /Add-Driver /Driver:"${escapePS(d.path)}"`);
        }
      });
      add('');
    },
    updates: () => {
      if (updates.length === 0) return;
      currentSection = 'updates';
      add(`# ── Updates (${updates.length}) ──`);
      updates.forEach(u => {
        const path = u.filePath || `C:\\Updates\\${escapePS(u.kb)}.msu`;
        add(`DISM /Image:$MountDir /Add-Package /PackagePath:"${escapePS(path)}"`);
      });
      add('');
    },
    customizations: () => {
      const total = customizations.programs.length + customizations.tweaks.length + customizations.optimizations.length;
      if (total === 0) return;
      currentSection = 'customizations';
      add(`# ── Customizations (${total}) ──`);

      if (customizations.programs.length > 0) {
        add('# Programs (installed via winget on first boot)');
        customizations.programs.forEach(p => {
          const wid = wingetIds[p];
          if (wid) {
            add(`winget install --id ${wid} --accept-source-agreements --accept-package-agreements --silent`);
          } else {
            add(`# ${p} — no winget ID mapped, install manually`);
          }
        });
      }

      if (customizations.tweaks.length > 0) {
        add('# Tweaks (offline registry modifications)');
        customizations.tweaks.forEach(t => {
          const cmds = tweakScripts[t];
          if (cmds) {
            cmds.forEach(c => add(c));
          } else {
            add(`# ${t} — no script mapped`);
          }
        });
      }

      if (customizations.optimizations.length > 0) {
        add('# Optimizations (offline registry modifications)');
        customizations.optimizations.forEach(o => {
          const cmds = optimizationScripts[o];
          if (cmds) {
            cmds.forEach(c => add(c));
          } else {
            add(`# ${o} — no script mapped`);
          }
        });
      }
      add('');
    },
  };

  enabledSteps.forEach(step => {
    sectionGenerators[step.id]?.();
  });

  currentSection = 'cleanup';
  add('# ── Cleanup & Commit ──');
  add('DISM /Image:$MountDir /Cleanup-Image /StartComponentCleanup /ResetBase');
  add('DISM /Unmount-Wim /MountDir:$MountDir /Commit');

  return result;
}

/** Simple text output — used by LiveScriptPreview */
export function generateScriptText(input: ScriptInput): string {
  return generateScriptLines(input).map(l => l.text).join('\n');
}
