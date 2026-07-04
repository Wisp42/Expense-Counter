import React, { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { updateTransaction } from '../db/transactions';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';
import type { HistoryRow } from '../utils/types';
import { ModalButtonRow } from './ModalButtonRow';
import { OverlayModal } from './OverlayModal';

interface Props {
  visible: boolean;
  row: HistoryRow | null;
  onClose: () => void;
}

/** A `total` row's absolute amount may legitimately be 0 (matches the seeded Start row) —
 * only `deal` amounts are blocked at 0, since a zero-amount deal does nothing. */
export function EditTransactionModal({ visible, row, onClose }: Props) {
  const { theme: themeName } = useSettings();
  const theme = getTheme(themeName);
  const [amountText, setAmountText] = useState('');
  const [nameText, setNameText] = useState('');

  useEffect(() => {
    if (visible && row) {
      setAmountText(String(row.amount));
      setNameText(row.type === 'deal' ? row.displayName ?? '' : '');
    }
  }, [visible, row]);

  if (!row) return null;

  const parsed = parseFloat(amountText.replace(',', '.'));
  const valid =
    amountText.trim() !== '' && !isNaN(parsed) && (row.type === 'total' || parsed !== 0);

  const save = async () => {
    if (!valid) return;
    await updateTransaction(row.id, parsed, row.type === 'deal' ? nameText : null);
    onClose();
  };

  return (
    <OverlayModal visible={visible} onClose={onClose} position="center">
      <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>Изменить операцию</Text>

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.accent }}>Сумма (со знаком)</Text>
        <TextInput
          value={amountText}
          onChangeText={setAmountText}
          keyboardType="default"
          style={{
            backgroundColor: theme.buttonBg,
            borderRadius: 14,
            padding: 12,
            fontSize: 16,
            fontWeight: '700',
            color: theme.text,
          }}
        />
      </View>

      {row.type === 'deal' && (
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: theme.accent }}>Название</Text>
          <TextInput
            value={nameText}
            onChangeText={setNameText}
            placeholder="Название операции"
            placeholderTextColor={theme.accent}
            style={{
              backgroundColor: theme.buttonBg,
              borderRadius: 14,
              padding: 12,
              fontSize: 15,
              color: theme.text,
            }}
          />
        </View>
      )}

      <ModalButtonRow onCancel={onClose} onConfirm={save} confirmEnabled={valid} />
    </OverlayModal>
  );
}
