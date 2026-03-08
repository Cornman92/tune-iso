/**
 * Escape special XML characters to prevent injection in generated XML files.
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Escape special characters for .reg file string values.
 * Backslashes and double quotes need escaping.
 */
export function escapeRegValue(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Validate that a string contains only valid hex digits (for REG_DWORD/REG_BINARY).
 */
export function isValidHex(str: string): boolean {
  return /^[0-9a-fA-F,\s]*$/.test(str);
}

/**
 * Escape a string for embedding in a PowerShell double-quoted string.
 * Escapes ", $, and backtick.
 */
export function escapePS(str: string): string {
  return str
    .replace(/`/g, '``')
    .replace(/\$/g, '`$')
    .replace(/"/g, '`"');
}

/**
 * Escape a string for embedding in a CMD/batch double-quoted context.
 * Escapes shell metacharacters with ^.
 */
export function escapeBatch(str: string): string {
  return str
    .replace(/%/g, '%%')
    .replace(/"/g, '""')
    .replace(/([&|<>^])/g, '^$1');
}
