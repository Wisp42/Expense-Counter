import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';
import { ymdLocal } from '../utils/format';
import type { FilterType, HistoryFilter } from '../utils/types';
import { AnimatedPressable } from './AnimatedPressable';
import { OverlayModal } from './OverlayModal';

const TYPE_OPTIONS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'income', label: 'Доход' },
  { key: 'expense', label: 'Расход' },
  { key: 'balance_change', label: 'Изменение баланса' },
];

interface Props {
  visible: boolean;
  filter: HistoryFilter;
  onChangeFilter: (f: HistoryFilter) => void;
  onClose: () => void;
}

export function FilterSortModal({ visible, filter, onChangeFilter, onClose }: Props) {
  const { theme: themeName } = useSettings();
  const theme = getTheme(themeName);
  const [pickerFor, setPickerFor] = useState<'start' | 'end' | null>(null);

  const setType = (key: FilterType) => onChangeFilter({ ...filter, type: key });

  const onPickDate = (which: 'start' | 'end', date: Date | undefined) => {
    setPickerFor(null);
    if (!date) return;
    const ymd = ymdLocal(date.getTime());
    onChangeFilter(which === 'start' ? { ...filter, startDate: ymd } : { ...filter, endDate: ymd });
  };

  const DateRow = ({ label, which, value }: { label: string; which: 'start' | 'end'; value: string | null }) => (
    <AnimatedPressable onPress={() => setPickerFor(which)} bg={theme.buttonBg} style={styles.dateRow}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: theme.accent }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>{value ?? '—'}</Text>
    </AnimatedPressable>
  );

  return (
    <OverlayModal visible={visible} onClose={onClose} position="bottom">
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>Фильтр и сортировка</Text>
        <AnimatedPressable onPress={onClose} bg={theme.buttonBg} style={styles.closeBtn}>
          <Text style={{ color: theme.accent, fontWeight: '700' }}>×</Text>
        </AnimatedPressable>
      </View>

      <View>
        <Text style={[styles.sectionLabel, { color: theme.accent }]}>Тип записи</Text>
        {TYPE_OPTIONS.map((opt) => {
          const active = filter.type === opt.key;
          return (
            <AnimatedPressable
              key={opt.key}
              onPress={() => setType(opt.key)}
              bg={theme.background}
              style={styles.typeRow}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>{opt.label}</Text>
              <View style={[styles.radioOuter, { borderColor: active ? theme.green : theme.accent }]}>
                {active && <View style={[styles.radioInner, { backgroundColor: theme.green }]} />}
              </View>
            </AnimatedPressable>
          );
        })}
      </View>

      <View>
        <Text style={[styles.sectionLabel, { color: theme.accent }]}>Дата записи</Text>
        <View style={{ gap: 10 }}>
          <DateRow label="Начало периода" which="start" value={filter.startDate} />
          <DateRow label="Конец периода" which="end" value={filter.endDate} />
        </View>
      </View>

      <AnimatedPressable onPress={onClose} bg={theme.green} style={styles.applyBtn}>
        <Text style={{ color: theme.background, fontWeight: '800', fontSize: 15 }}>Применить</Text>
      </AnimatedPressable>

      {pickerFor && (
        <DateTimePicker
          value={
            (pickerFor === 'start' ? filter.startDate : filter.endDate)
              ? new Date((pickerFor === 'start' ? filter.startDate : filter.endDate) as string)
              : new Date()
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onValueChange={(_e, date) => onPickDate(pickerFor, date)}
          onDismiss={() => setPickerFor(null)}
        />
      )}
    </OverlayModal>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 12,
    paddingHorizontal: 14,
  },
  applyBtn: {
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
});
