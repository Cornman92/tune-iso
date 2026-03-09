/**
 * Parser for Windows .reg files
 * Converts .reg file format to internal RegistryEntry format
 */

type RegValueType = 'REG_SZ' | 'REG_DWORD' | 'REG_QWORD' | 'REG_BINARY' | 'REG_MULTI_SZ' | 'REG_EXPAND_SZ' | 'REG_NONE';

interface RegistryEntry {
  id: string;
  hive: string;
  keyPath: string;
  valueName: string;
  valueType: RegValueType;
  valueData: string;
  description: string;
}

export interface RegistryDiff {
  added: RegistryEntry[];
  modified: { current: RegistryEntry; imported: RegistryEntry }[];
  unchanged: RegistryEntry[];
  onlyInCurrent: RegistryEntry[];
}

const HIVE_MAP: Record<string, string> = {
  'HKEY_LOCAL_MACHINE': 'HKLM',
  'HKLM': 'HKLM',
  'HKEY_CURRENT_USER': 'HKCU',
  'HKCU': 'HKCU',
  'HKEY_USERS': 'HKU',
  'HKU': 'HKU',
  'HKEY_CLASSES_ROOT': 'HKCR',
  'HKCR': 'HKCR',
  'HKEY_CURRENT_CONFIG': 'HKCC',
  'HKCC': 'HKCC',
};

/**
 * Parse a Windows .reg file and extract registry entries
 */
export function parseRegFile(content: string): RegistryEntry[] {
  const entries: RegistryEntry[] = [];
  const lines = content.split(/\r?\n/);
  
  let currentKey: { hive: string; keyPath: string } | null = null;
  let multiLineValue = '';
  let multiLineValueName = '';
  let multiLineValueType: RegValueType | null = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Skip header and empty lines
    if (line.startsWith('Windows Registry Editor') || line.startsWith('REGEDIT') || line.trim() === '') {
      continue;
    }

    // Handle multi-line values (ending with \)
    if (multiLineValueType) {
      multiLineValue += line.trim().replace(/\\$/, '');
      if (!line.trim().endsWith('\\')) {
        // End of multi-line value
        entries.push({
          id: crypto.randomUUID(),
          hive: currentKey!.hive,
          keyPath: currentKey!.keyPath,
          valueName: multiLineValueName,
          valueType: multiLineValueType,
          valueData: multiLineValue,
          description: '',
        });
        multiLineValue = '';
        multiLineValueName = '';
        multiLineValueType = null;
      }
      continue;
    }

    // Parse key path: [HKEY_LOCAL_MACHINE\SOFTWARE\...]
    const keyMatch = line.match(/^\[(-?)(.+?)\]$/);
    if (keyMatch) {
      const isDelete = keyMatch[1] === '-';
      const fullPath = keyMatch[2];
      
      if (isDelete) {
        // Skip delete keys for now
        currentKey = null;
        continue;
      }
      
      // Split into hive and path
      const firstBackslash = fullPath.indexOf('\\');
      if (firstBackslash === -1) {
        currentKey = null;
        continue;
      }
      
      const rawHive = fullPath.substring(0, firstBackslash);
      const path = fullPath.substring(firstBackslash + 1);
      
      const hive = HIVE_MAP[rawHive];
      if (!hive) {
        currentKey = null;
        continue;
      }

      // Map to our supported hive format
      const hiveWithSubkey = mapToSupportedHive(hive, path);
      currentKey = hiveWithSubkey;
      continue;
    }

    // Skip if no current key
    if (!currentKey) continue;

    // Parse value: "ValueName"=<type>:<data>
    const valueMatch = line.match(/^"(.+?)"=(.*)$/) || line.match(/^@=(.*)$/);
    if (valueMatch) {
      const valueName = valueMatch.length === 3 ? unescapeRegString(valueMatch[1]) : '(Default)';
      const valueData = valueMatch.length === 3 ? valueMatch[2] : valueMatch[1];
      
      const parsed = parseValueData(valueData);
      if (!parsed) continue;

      // Check for multi-line
      if (valueData.trim().endsWith('\\')) {
        multiLineValueName = valueName;
        multiLineValueType = parsed.type;
        multiLineValue = parsed.data.replace(/\\$/, '');
        continue;
      }

      entries.push({
        id: crypto.randomUUID(),
        hive: currentKey.hive,
        keyPath: currentKey.keyPath,
        valueName,
        valueType: parsed.type,
        valueData: parsed.data,
        description: '',
      });
    }
  }

  return entries;
}

/**
 * Map a full registry path to our supported hive format
 */
function mapToSupportedHive(hive: string, path: string): { hive: string; keyPath: string } {
  // Our supported hives
  const hiveFormats = [
    'HKLM\\SOFTWARE',
    'HKLM\\SYSTEM', 
    'HKCU\\SOFTWARE',
    'HKCU\\Control Panel',
    'HKLM\\DEFAULT',
    'HKU\\.DEFAULT',
  ];

  const fullPath = `${hive}\\${path}`;
  
  for (const format of hiveFormats) {
    if (fullPath.startsWith(format + '\\')) {
      return {
        hive: format,
        keyPath: fullPath.substring(format.length + 1),
      };
    }
    if (fullPath === format) {
      return {
        hive: format,
        keyPath: '',
      };
    }
  }

  // Default: use hive + first path segment
  const parts = path.split('\\');
  return {
    hive: `${hive}\\${parts[0]}`,
    keyPath: parts.slice(1).join('\\'),
  };
}

/**
 * Parse value data from .reg format
 */
function parseValueData(data: string): { type: RegValueType; data: string } | null {
  data = data.trim();

  // Delete marker
  if (data === '-') {
    return null;
  }

  // String value: "text"
  if (data.startsWith('"') && data.endsWith('"')) {
    return {
      type: 'REG_SZ',
      data: unescapeRegString(data.slice(1, -1)),
    };
  }

  // DWORD: dword:00000001
  const dwordMatch = data.match(/^dword:([0-9a-fA-F]{8})$/i);
  if (dwordMatch) {
    return {
      type: 'REG_DWORD',
      data: parseInt(dwordMatch[1], 16).toString(),
    };
  }

  // QWORD: hex(b):...
  if (data.startsWith('hex(b):')) {
    return {
      type: 'REG_QWORD',
      data: data.substring(7).replace(/\\/g, '').replace(/\s/g, ''),
    };
  }

  // EXPAND_SZ: hex(2):...
  if (data.startsWith('hex(2):')) {
    const hexData = data.substring(7).replace(/\\/g, '').replace(/\s/g, '');
    return {
      type: 'REG_EXPAND_SZ',
      data: hexToString(hexData),
    };
  }

  // MULTI_SZ: hex(7):...
  if (data.startsWith('hex(7):')) {
    return {
      type: 'REG_MULTI_SZ',
      data: data.substring(7).replace(/\\/g, '').replace(/\s/g, ''),
    };
  }

  // Binary: hex:...
  if (data.startsWith('hex:')) {
    return {
      type: 'REG_BINARY',
      data: data.substring(4).replace(/\\/g, '').replace(/\s/g, ''),
    };
  }

  // NONE: hex(0):...
  if (data.startsWith('hex(0):')) {
    return {
      type: 'REG_NONE',
      data: data.substring(7).replace(/\\/g, '').replace(/\s/g, ''),
    };
  }

  return null;
}

/**
 * Unescape a string from .reg file format
 */
function unescapeRegString(str: string): string {
  return str
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\0/g, '\0');
}

/**
 * Convert hex bytes to string (for REG_EXPAND_SZ)
 */
function hexToString(hex: string): string {
  const bytes = hex.split(',').filter(b => b.length > 0);
  let result = '';
  
  for (let i = 0; i < bytes.length; i += 2) {
    const low = parseInt(bytes[i], 16);
    const high = bytes[i + 1] ? parseInt(bytes[i + 1], 16) : 0;
    const charCode = (high << 8) | low;
    if (charCode === 0) break; // Null terminator
    result += String.fromCharCode(charCode);
  }
  
  return result;
}

/**
 * Compare two sets of registry entries and return the diff
 */
export function diffRegistryEntries(current: RegistryEntry[], imported: RegistryEntry[]): RegistryDiff {
  const diff: RegistryDiff = {
    added: [],
    modified: [],
    unchanged: [],
    onlyInCurrent: [],
  };

  const currentMap = new Map<string, RegistryEntry>();
  current.forEach(e => {
    const key = `${e.hive}\\${e.keyPath}\\${e.valueName}`;
    currentMap.set(key, e);
  });

  const importedMap = new Map<string, RegistryEntry>();
  imported.forEach(e => {
    const key = `${e.hive}\\${e.keyPath}\\${e.valueName}`;
    importedMap.set(key, e);
  });

  // Find added and modified
  imported.forEach(importedEntry => {
    const key = `${importedEntry.hive}\\${importedEntry.keyPath}\\${importedEntry.valueName}`;
    const currentEntry = currentMap.get(key);

    if (!currentEntry) {
      diff.added.push(importedEntry);
    } else if (currentEntry.valueData !== importedEntry.valueData || currentEntry.valueType !== importedEntry.valueType) {
      diff.modified.push({ current: currentEntry, imported: importedEntry });
    } else {
      diff.unchanged.push(currentEntry);
    }
  });

  // Find only in current
  current.forEach(currentEntry => {
    const key = `${currentEntry.hive}\\${currentEntry.keyPath}\\${currentEntry.valueName}`;
    if (!importedMap.has(key)) {
      diff.onlyInCurrent.push(currentEntry);
    }
  });

  return diff;
}
