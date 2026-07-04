import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { setTransactionName } from '../db/transactions';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';
import type { HistoryRow } from '../utils/types';
import { OverlayModal } from './OverlayModal';

interface Props {
  visible: boolean;
  row: HistoryRow | null;
  onClose: () => void;
}

/** Quick "+" button on an unnamed deal row in the history list. */
export function NameTransactionModal({ visible, row, onClose }: Props) {
  const { theme: themeName } = useSettings();
  const theme = getTheme(themeName);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (visible) setValue('');
  }, [visible]);

  if (!row) return null;

  const valid = value.trim() !== '';

  const save = async () => {
    if (!valid) return;
    await setTransactionName(row.id, value);
    onClose();
  };

  return (
    <OverlayModal visible={visible} onClose={onClose} position="center">
      <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>Название операции</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        autoFocus
        placeholder="Например, Кофе"
        placeholderTextColor={theme.accent}
        style={{
          backgroundColor: theme.buttonBg,
          borderRadius: 14,
          padding: 12,
          fontSize: 15,
          color: theme.text,
        }}
      />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          onPress={onClose}
          style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: theme.buttonBg, alignItems: 'center' }}
        >
          <Text style={{ color: theme.accent, fontWeight: '700' }}>Отмена</Text>
        </Pressable>
        <Pressable
          onPress={save}
          disabled={!valid}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 14,
            backgroundColor: valid ? theme.green : theme.buttonBg,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: valid ? theme.background : theme.accent, fontWeight: '700' }}>Сохранить</Text>
        </Pressable>
      </View>
    </OverlayModal>
  );
}
