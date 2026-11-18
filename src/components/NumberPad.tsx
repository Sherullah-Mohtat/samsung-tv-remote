import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RemoteButton } from './RemoteButton';
import { REMOTE_KEYS } from '../constants/keys';

export interface NumberPadProps {
  onKeyPress: (keyCode: string) => void;
}

export const NumberPad: React.FC<NumberPadProps> = ({ onKeyPress }) => {
  const rows = [
    [REMOTE_KEYS.KEY_1, REMOTE_KEYS.KEY_2, REMOTE_KEYS.KEY_3],
    [REMOTE_KEYS.KEY_4, REMOTE_KEYS.KEY_5, REMOTE_KEYS.KEY_6],
    [REMOTE_KEYS.KEY_7, REMOTE_KEYS.KEY_8, REMOTE_KEYS.KEY_9],
    [REMOTE_KEYS.HYPHEN, REMOTE_KEYS.KEY_0, REMOTE_KEYS.PRE_CH],
  ];

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((item) => (
            <RemoteButton
              key={item.id}
              label={item.label}
              variant={item.category === 'numpad' ? 'numpad' : 'standard'}
              width={70}
              height={46}
              onPress={() => onKeyPress(item.primaryKey)}
              style={styles.keyButton}
              textStyle={item.id === 'PRE_CH' ? styles.preChText : undefined}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    paddingHorizontal: 20,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keyButton: {
    borderRadius: 14,
  },
  preChText: {
    fontSize: 10,
    fontWeight: '800',
  },
});

