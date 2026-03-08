import { useMemo } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, XOctagon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

interface ScriptValidatorProps {
  customizations: { programs: string[]; tweaks: string[]; optimizations: string[] };
  disabledServices: string[];
  removedComponents: string[];
  registryEntries: { hive: string; keyPath: string; valueName: string; valueType: string; valueData: string }[];
  driverCount: number;
  isMounted: boolean;
}

const ScriptValidator = ({
  customizations,
  disabledServices,
  removedComponents,
  registryEntries,
  driverCount,
  isMounted,
}: ScriptValidatorProps) => {
  const issues = useMemo((): ValidationIssue[] => {
    if (!isMounted) return [];
    const result: ValidationIssue[] = [];

    // Check for duplicate registry paths
    const regPaths = registryEntries.map(e => `${e.hive}\\${e.keyPath}\\${e.valueName}`);
    const dupes = regPaths.filter((p, i) => regPaths.indexOf(p) !== i);
    if (dupes.length > 0) {
      result.push({
        id: 'dup-reg',
        severity: 'warning',
        message: `${dupes.length} duplicate registry path(s) detected — last value wins`,
      });
    }

    // Check for conflicting operations
    if (removedComponents.includes('store') && customizations.programs.length > 0) {
      result.push({
        id: 'store-conflict',
        severity: 'warning',
        message: 'Microsoft Store is removed but programs are configured — some installers may need Store',
      });
    }

    // Check no mount path (conceptual — always good practice)
    const totalChanges = customizations.programs.length + customizations.tweaks.length +
      customizations.optimizations.length + disabledServices.length + removedComponents.length +
      registryEntries.length + driverCount;

    if (totalChanges === 0) {
      result.push({
        id: 'no-changes',
        severity: 'info',
        message: 'No customizations configured — the generated script will be empty',
      });
    }

    // Service+component overlap check
    if (disabledServices.includes('DiagTrack') && removedComponents.includes('diagtrack')) {
      result.push({
        id: 'overlap-diag',
        severity: 'info',
        message: 'DiagTrack is both disabled (service) and removed (component) — redundant but harmless',
      });
    }

    // Check for aggressive operations without safety net
    const aggressiveServices = ['wuauserv', 'WinDefend', 'MpsSvc', 'SamSs', 'PlugPlay'];
    const hitAggressive = disabledServices.filter(s => aggressiveServices.includes(s));
    if (hitAggressive.length >= 3) {
      result.push({
        id: 'many-aggressive',
        severity: 'error',
        message: `${hitAggressive.length} critical system services disabled — high risk of unbootable or insecure system`,
      });
    }

    // Registry type validation
    registryEntries.forEach((e, i) => {
      if (e.valueType === 'REG_DWORD' && !/^(0x)?[0-9a-fA-F]+$/.test(e.valueData) && !/^\d+$/.test(e.valueData)) {
        result.push({
          id: `reg-type-${i}`,
          severity: 'error',
          message: `Registry entry "${e.valueName}" has invalid DWORD value: "${e.valueData}"`,
        });
      }
    });

    return result;
  }, [customizations, disabledServices, removedComponents, registryEntries, driverCount, isMounted]);

  if (!isMounted || issues.length === 0) {
    if (isMounted) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/20 rounded-lg">
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          <span className="text-xs font-mono text-success">Script validation passed — no issues found</span>
        </div>
      );
    }
    return null;
  }

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warnCount = issues.filter(i => i.severity === 'warning').length;

  return (
    <div className="bg-card border border-border rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-warning" />
        <h3 className="text-sm font-medium text-foreground">Script Validation</h3>
        <div className="flex gap-1.5 ml-auto">
          {errorCount > 0 && (
            <Badge variant="destructive" className="text-[10px] font-mono">{errorCount} error{errorCount !== 1 ? 's' : ''}</Badge>
          )}
          {warnCount > 0 && (
            <Badge variant="secondary" className="text-[10px] font-mono border-warning/30 text-warning">{warnCount} warn</Badge>
          )}
        </div>
      </div>
      <div className="space-y-1">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className={`flex items-start gap-2 px-2 py-1.5 rounded text-xs font-mono ${
              issue.severity === 'error'
                ? 'bg-destructive/10 text-destructive'
                : issue.severity === 'warning'
                ? 'bg-warning/10 text-warning'
                : 'bg-muted/50 text-muted-foreground'
            }`}
          >
            {issue.severity === 'error' ? (
              <XOctagon className="w-3 h-3 shrink-0 mt-0.5" />
            ) : issue.severity === 'warning' ? (
              <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" />
            )}
            <span>{issue.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScriptValidator;
