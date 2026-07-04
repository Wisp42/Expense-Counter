import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { getTheme, Theme } from '../theme/theme';
import { withPressFeedback } from '../utils/pressedFeedback';
import type { HistoryRow } from '../utils/types';

interface Props {
  row: HistoryRow;
  onLongPress: () => void;
  onAddName: () => void;
}

function amountColorFor(row: HistoryRow, theme: Theme): string {
  if (row.amountColor === 'red') return theme.red;
  if (row.amountColor === 'green') return theme.green;
  return theme.text;
}

export function TransactionRow({ row, onLongPress, onAddName }: Props) {
  const { theme: themeName, currencySymbol } = useSettings();
  const theme = getTheme(themeName);

  return (
    <Pressable
      onLongPress={onLongPress}
      style={(state) => [styles.row, { borderBottomColor: theme.text + '1a' }, withPressFeedback(state.pressed)]}
    >
      {row.hasName ? (
        <View style={styles.left}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {row.displayName}
          </Text>
          <Text style={[styles.dateTime, { color: theme.accent }]}>{row.dateTime}</Text>
        </View>
      ) : (
        <View style={[styles.left, { gap: 6 }]}>
          <Text style={[styles.dateTime, { color: theme.accent }]}>{row.dateTime}</Text>
          <Pressable
            onPress={onAddName}
            style={(state) => [styles.addNameBtn, { borderColor: theme.accent }, withPressFeedback(state.pressed)]}
          >
            <Text style={{ color: theme.accent, fontSize: 15, fontWeight: '700', lineHeight: 15 }}>+</Text>
          </Pressable>
        </View>
      )}
      <Text style={[styles.amount, { color: amountColorFor(row, theme) }]}>
        {row.amountDisplay} {currencySymbol}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  left: {
    minWidth: 0,
    flexShrink: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  dateTime: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  addNameBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    flexShrink: 0,
  },
});
