import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ActionSheetModal } from '../components/ActionSheetModal';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { FilterSortModal } from '../components/FilterSortModal';
import { NameTransactionModal } from '../components/NameTransactionModal';
import { TransactionRow } from '../components/TransactionRow';
import { subscribeDbChange } from '../db/dbEvents';
import { deleteTransaction, getGroupedHistory } from '../db/transactions';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';
import type { HistoryFilter, HistoryGroup, HistoryRow } from '../utils/types';

const DEFAULT_FILTER: HistoryFilter = { type: 'all', startDate: null, endDate: null };

export function HistoryScreen() {
  const { theme: themeName } = useSettings();
  const theme = getTheme(themeName);

  const [filter, setFilter] = useState<HistoryFilter>(DEFAULT_FILTER);
  const [groups, setGroups] = useState<HistoryGroup[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [actionRow, setActionRow] = useState<HistoryRow | null>(null);
  const [editRow, setEditRow] = useState<HistoryRow | null>(null);
  const [namingRow, setNamingRow] = useState<HistoryRow | null>(null);

  const refresh = useCallback(() => {
    getGroupedHistory(filter).then(setGroups);
  }, [filter]);

  useEffect(() => {
    refresh();
    return subscribeDbChange(refresh);
  }, [refresh]);

  const noResults = groups.length === 0;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.filterBarWrap}>
        <AnimatedPressable onPress={() => setFilterVisible(true)} bg={theme.buttonBg} style={styles.filterBtn}>
          <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
            <Path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" stroke={theme.text} strokeWidth={1.6} strokeLinejoin="round" />
          </Svg>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>Фильтр и сортировка</Text>
        </AnimatedPressable>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {groups.map((group) => (
          <View key={group.label + group.items[0]?.id} style={styles.group}>
            <Text style={[styles.groupLabel, { color: theme.accent }]}>{group.label}</Text>
            {group.items.map((row) => (
              <TransactionRow
                key={row.id}
                row={row}
                onLongPress={() => setActionRow(row)}
                onAddName={() => setNamingRow(row)}
              />
            ))}
          </View>
        ))}
        {noResults && (
          <Text style={[styles.empty, { color: theme.accent }]}>Нет операций по заданным критериям</Text>
        )}
      </ScrollView>

      <FilterSortModal
        visible={filterVisible}
        filter={filter}
        onChangeFilter={setFilter}
        onClose={() => setFilterVisible(false)}
      />

      <ActionSheetModal
        visible={actionRow !== null}
        isProtectedStart={actionRow?.isProtectedStart ?? false}
        onClose={() => setActionRow(null)}
        onEdit={() => {
          setEditRow(actionRow);
          setActionRow(null);
        }}
        onDelete={() => {
          if (actionRow) deleteTransaction(actionRow.id);
          setActionRow(null);
        }}
      />

      <EditTransactionModal visible={editRow !== null} row={editRow} onClose={() => setEditRow(null)} />

      <NameTransactionModal
        visible={namingRow !== null}
        row={namingRow}
        onClose={() => setNamingRow(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  filterBarWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 14,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  group: {
    marginBottom: 18,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingHorizontal: 20,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    fontSize: 14,
    fontWeight: '600',
  },
});
