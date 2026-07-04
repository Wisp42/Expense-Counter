import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { getTheme, Theme } from '../theme/theme';
import type { HistoryRow } from '../utils/types';
import { AnimatedPressable } from './AnimatedPressable';

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
    <View>
      {/* Full-bleed press highlight: this row has no horizontal padding of its own container
          (HistoryScreen's list is edge-to-edge) so the color feedback spans the full screen
          width; the row's *content* gets its inset via paddingHorizontal on styles.row below.
          The separator is a separate inset element (not a border) so it can stop short of the
          edges independently of the full-bleed background. */}
      <AnimatedPressable onLongPress={onLongPress} bg={theme.background} style={styles.row}>
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
            <AnimatedPressable
              onPress={onAddName}
              bg={theme.background}
              scaleOnPress
              style={[styles.addNameBtn, { borderColor: theme.accent }]}
            >
              <Text style={{ color: theme.accent, fontSize: 15, fontWeight: '700', lineHeight: 15 }}>+</Text>
            </AnimatedPressable>
          </View>
        )}
        <Text style={[styles.amount, { color: amountColorFor(row, theme) }]}>
          {row.amountDisplay} {currencySymbol}
        </Text>
      </AnimatedPressable>
      <View style={[styles.separator, { backgroundColor: theme.text + '1a' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
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
