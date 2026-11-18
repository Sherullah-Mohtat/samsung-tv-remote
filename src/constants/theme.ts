/**
 * Theme tokens replicating the physical Samsung BN59-01301A remote control.
 */

export const RemoteTheme = {
  colors: {
    // Chassis & Background
    chassisBackground: '#17181d',
    chassisSecondary: '#121316',
    screenBackground: '#0d0e11',
    divider: '#25272e',

    // Standard Buttons
    buttonBackground: '#26282f',
    buttonPressed: '#3a3d47',
    buttonBorder: '#32353e',
    buttonHighlight: '#434752',

    // Typography
    textPrimary: '#ffffff',
    textSecondary: '#9fa3b0',
    textMuted: '#686b77',

    // Functional & Color Keys
    powerRed: '#e5252a',
    powerRedPressed: '#ff4045',

    colorA_Red: '#e83138',
    colorB_Green: '#23a852',
    colorC_Yellow: '#e8b21c',
    colorD_Blue: '#287af0',

    // Status Colors
    statusConnected: '#22c55e',
    statusConnecting: '#eab308',
    statusPairing: '#3b82f6',
    statusDisconnected: '#6b7280',
    statusError: '#ef4444',

    // Brand
    samsungLogo: '#888d9a',
  },

  typography: {
    labelMicro: 9,
    labelSmall: 11,
    labelMedium: 13,
    labelLarge: 15,
    numpadDigit: 20,
    symbolLarge: 22,
  },

  radii: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    round: 999,
  },

  dimensions: {
    minTouchTarget: 44,
    remoteMaxWidth: 390,
  },

  shadows: {
    button: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.45,
      shadowRadius: 2.5,
      elevation: 3,
    },
    rocker: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.55,
      shadowRadius: 3.5,
      elevation: 4,
    },
    dpad: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.6,
      shadowRadius: 5,
      elevation: 6,
    },
  },
};
