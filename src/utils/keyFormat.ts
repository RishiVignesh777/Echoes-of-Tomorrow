/**
 * Utility for formatting raw keyboard event keys into clean, human-readable labels.
 */
export function formatKeyName(key: string | undefined): string {
  if (!key) return '';
  const k = key.toLowerCase();

  switch (k) {
    case ' ':
    case 'space':
    case 'spacebar':
      return 'SPACE';
    case 'arrowup':
      return '▲ UP';
    case 'arrowdown':
      return '▼ DOWN';
    case 'arrowleft':
      return '◄ LEFT';
    case 'arrowright':
      return '► RIGHT';
    case 'escape':
    case 'esc':
      return 'ESC';
    case 'enter':
    case 'return':
      return 'ENTER';
    case 'backspace':
      return 'BACKSPACE';
    case 'tab':
      return 'TAB';
    case 'shift':
      return 'SHIFT';
    case 'control':
    case 'ctrl':
      return 'CTRL';
    case 'alt':
      return 'ALT';
    case 'delete':
    case 'del':
      return 'DEL';
    case 'capslock':
      return 'CAPS';
    default:
      return key.toUpperCase();
  }
}
