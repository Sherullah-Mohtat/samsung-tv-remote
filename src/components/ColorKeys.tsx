import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RemoteButton } from './RemoteButton';
import { REMOTE_KEYS } from '../constants/keys';
import { RemoteTheme } from '../constants/theme';

export interface ColorKeysProps {
  onKeyPress: (keyCode: string) => void;
}

export const ColorKeys: React.FC<ColorKeysProps> = ({ onKeyPress }) => {
  const keys = [
    {
      item: REMOTE_KEYS.COLOR_A,
      color: RemoteTheme.colors.colorA_Red,
      pressedColor: '#c91f26',
    },
    {
      item: REMOTE_KEYS.COLOR_B,
      color: RemoteTheme.colors.colorB_Green,
      pressedColor: '#1a823f',
    },
    {
      item: REMOTE_KEYS.COLOR_C,
      color: RemoteTheme.colors.colorC_Yellow,
      pressedColor: '#c29210',
    },
    {
      item: REMOTE_KEYS.COLOR_D,
      color: RemoteTheme.colors.colorD_Blue,
      pressedColor: '#1d5ec4',
    },
  ];

  return (
    <View style={styles.container}>
      {keys.map(({ item, color, pressedColor }) => (
        <RemoteButton
          key={item.id}
          label={item.label}
          color={color}
          pressedColor={pressedColor}
          width={64}
          height={38}
          onPress={() => onKeyPress(item.primaryKey)}
          style={styles.colorPill}
          textStyle={styles.colorText}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 4,
  },
  colorPill: {
    borderRadius: 19,
    borderWidth: 0,
  },
  colorText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});

