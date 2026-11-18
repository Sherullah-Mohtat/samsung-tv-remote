/**
 * Samsung Smart TV Remote Keycodes (Tizen 2016+)
 * Modeled after physical remote BN59-01301A.
 */

export interface KeyDefinition {
  id: string;
  primaryKey: string;
  fallbackKey?: string;
  label: string;
  description?: string;
  category: 'power' | 'numpad' | 'volume' | 'channel' | 'navigation' | 'color' | 'media' | 'utility';
  icon?: string;
}

export const REMOTE_KEYS = {
  // Power & Source
  POWER: {
    id: 'POWER',
    primaryKey: 'KEY_POWER',
    label: 'POWER',
    description: 'Toggle TV Power (Sends WoL if offline)',
    category: 'power',
    icon: 'power',
  },
  SOURCE: {
    id: 'SOURCE',
    primaryKey: 'KEY_SOURCE',
    label: 'SOURCE',
    description: 'Input source selection',
    category: 'power',
  },

  // Number Pad
  KEY_1: { id: 'KEY_1', primaryKey: 'KEY_1', label: '1', category: 'numpad' },
  KEY_2: { id: 'KEY_2', primaryKey: 'KEY_2', label: '2', category: 'numpad' },
  KEY_3: { id: 'KEY_3', primaryKey: 'KEY_3', label: '3', category: 'numpad' },
  KEY_4: { id: 'KEY_4', primaryKey: 'KEY_4', label: '4', category: 'numpad' },
  KEY_5: { id: 'KEY_5', primaryKey: 'KEY_5', label: '5', category: 'numpad' },
  KEY_6: { id: 'KEY_6', primaryKey: 'KEY_6', label: '6', category: 'numpad' },
  KEY_7: { id: 'KEY_7', primaryKey: 'KEY_7', label: '7', category: 'numpad' },
  KEY_8: { id: 'KEY_8', primaryKey: 'KEY_8', label: '8', category: 'numpad' },
  KEY_9: { id: 'KEY_9', primaryKey: 'KEY_9', label: '9', category: 'numpad' },
  HYPHEN: {
    id: 'HYPHEN',
    primaryKey: 'KEY_PLUS100',
    fallbackKey: 'KEY_MINUS',
    label: '-',
    description: 'Sub-channel or minus separator',
    category: 'numpad',
  },
  KEY_0: { id: 'KEY_0', primaryKey: 'KEY_0', label: '0', category: 'numpad' },
  PRE_CH: {
    id: 'PRE_CH',
    primaryKey: 'KEY_PRECH',
    label: 'PRE-CH',
    description: 'Return to previous channel',
    category: 'numpad',
  },

  // Volume & Channel Controls
  VOL_UP: { id: 'VOL_UP', primaryKey: 'KEY_VOLUP', label: '+', category: 'volume' },
  VOL_DOWN: { id: 'VOL_DOWN', primaryKey: 'KEY_VOLDOWN', label: '-', category: 'volume' },
  MUTE: { id: 'MUTE', primaryKey: 'KEY_MUTE', label: 'MUTE', category: 'volume', icon: 'volume-mute' },
  CH_LIST: { id: 'CH_LIST', primaryKey: 'KEY_CH_LIST', label: 'CH LIST', category: 'channel' },
  CH_UP: { id: 'CH_UP', primaryKey: 'KEY_CHUP', label: '▲', category: 'channel' },
  CH_DOWN: { id: 'CH_DOWN', primaryKey: 'KEY_CHDOWN', label: '▼', category: 'channel' },

  // Navigation & Shortcuts
  SLEEP: { id: 'SLEEP', primaryKey: 'KEY_SLEEP', label: 'SLEEP', category: 'utility' },
  HOME: { id: 'HOME', primaryKey: 'KEY_HOME', label: 'HOME', category: 'navigation', icon: 'home' },
  GUIDE: { id: 'GUIDE', primaryKey: 'KEY_GUIDE', label: 'GUIDE', category: 'navigation' },
  SETTINGS: { id: 'SETTINGS', primaryKey: 'KEY_MENU', label: 'SETTINGS', category: 'navigation' },
  INFO: { id: 'INFO', primaryKey: 'KEY_INFO', label: 'INFO', category: 'navigation' },

  // Directional Pad
  UP: { id: 'UP', primaryKey: 'KEY_UP', label: '▲', category: 'navigation' },
  DOWN: { id: 'DOWN', primaryKey: 'KEY_DOWN', label: '▼', category: 'navigation' },
  LEFT: { id: 'LEFT', primaryKey: 'KEY_LEFT', label: '◀', category: 'navigation' },
  RIGHT: { id: 'RIGHT', primaryKey: 'KEY_RIGHT', label: '▶', category: 'navigation' },
  ENTER: { id: 'ENTER', primaryKey: 'KEY_ENTER', label: 'ENTER', category: 'navigation' },

  // Control Row
  RETURN: { id: 'RETURN', primaryKey: 'KEY_RETURN', label: 'RETURN', category: 'navigation' },
  EXIT: { id: 'EXIT', primaryKey: 'KEY_EXIT', label: 'EXIT', category: 'navigation' },

  // Color Buttons
  COLOR_A: { id: 'COLOR_A', primaryKey: 'KEY_RED', label: 'A', description: 'Red function', category: 'color' },
  COLOR_B: { id: 'COLOR_B', primaryKey: 'KEY_GREEN', label: 'B', description: 'Green function', category: 'color' },
  COLOR_C: { id: 'COLOR_C', primaryKey: 'KEY_YELLOW', label: 'C', description: 'Yellow function', category: 'color' },
  COLOR_D: { id: 'COLOR_D', primaryKey: 'KEY_CYAN', label: 'D', description: 'Blue function', category: 'color' },

  // Function Row
  EMANUAL: { id: 'EMANUAL', primaryKey: 'KEY_EMANUAL', label: 'E-MANUAL', category: 'utility' },
  P_SIZE: { id: 'P_SIZE', primaryKey: 'KEY_PICTURE_SIZE', label: 'P.SIZE', category: 'utility' },
  CC_VD: {
    id: 'CC_VD',
    primaryKey: 'KEY_CAPTION',
    fallbackKey: 'KEY_SUB_TITLE',
    label: 'CC/VD',
    description: 'Subtitles & Voice description',
    category: 'utility',
  },
  STOP: { id: 'STOP', primaryKey: 'KEY_STOP', label: '■', category: 'media' },

  // Media Playback Controls
  REWIND: { id: 'REWIND', primaryKey: 'KEY_REWIND', label: '◀◀', category: 'media' },
  PLAY: { id: 'PLAY', primaryKey: 'KEY_PLAY', label: '▶', category: 'media' },
  PAUSE: { id: 'PAUSE', primaryKey: 'KEY_PAUSE', label: '❚❚', category: 'media' },
  FAST_FORWARD: { id: 'FAST_FORWARD', primaryKey: 'KEY_FF', label: '▶▶', category: 'media' },
} as const satisfies Record<string, KeyDefinition>;

export type RemoteKeyId = keyof typeof REMOTE_KEYS;
export type RemoteKeyCode = (typeof REMOTE_KEYS)[RemoteKeyId]['primaryKey'];

/**
 * Extended list of all Samsung Tizen keys for testing and discovery on debug screen.
 */
export const ALL_SAMSUNG_KEYCODES: string[] = [
  'KEY_POWER',
  'KEY_SOURCE',
  'KEY_0',
  'KEY_1',
  'KEY_2',
  'KEY_3',
  'KEY_4',
  'KEY_5',
  'KEY_6',
  'KEY_7',
  'KEY_8',
  'KEY_9',
  'KEY_PLUS100',
  'KEY_MINUS',
  'KEY_PRECH',
  'KEY_VOLUP',
  'KEY_VOLDOWN',
  'KEY_MUTE',
  'KEY_CHUP',
  'KEY_CHDOWN',
  'KEY_CH_LIST',
  'KEY_MENU',
  'KEY_HOME',
  'KEY_GUIDE',
  'KEY_INFO',
  'KEY_UP',
  'KEY_DOWN',
  'KEY_LEFT',
  'KEY_RIGHT',
  'KEY_ENTER',
  'KEY_RETURN',
  'KEY_EXIT',
  'KEY_RED',
  'KEY_GREEN',
  'KEY_YELLOW',
  'KEY_CYAN',
  'KEY_EMANUAL',
  'KEY_PICTURE_SIZE',
  'KEY_CAPTION',
  'KEY_SUB_TITLE',
  'KEY_STOP',
  'KEY_REWIND',
  'KEY_PLAY',
  'KEY_PAUSE',
  'KEY_FF',
  'KEY_TOOLS',
  'KEY_CONTENTS',
  'KEY_W_LINK',
  'KEY_SLEEP',
  'KEY_ASPECT',
  'KEY_TV',
  'KEY_BT_VOICE',
];

