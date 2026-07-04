import React, { useEffect, useState } from 'react';
import { Text, TextInput } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';
import { ModalButtonRow } from './ModalButtonRow';
import { OverlayModal } from './OverlayModal';

interface Props {
  visible: boolean;
  currentBalance: number;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

/** Long-press on the balance number: set an absolute new balance, creating a `total` row.
 * Unlike a `deal` amount, an absolute balance of exactly 0 is a valid value (matches the
 * seeded Start row), so it isn't blocked the way a zero deal is. */
export function ManualBalanceModal({ visible, currentBalance, onClose, onConfirm }: Props) {
  const { theme: themeName, currencySymbol } = useSettings();
  const theme = getTheme(themeName);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (visible) setValue(String(currentBalance));
  }, [visible, currentBalance]);

  const parsed = parseFloat(value.replace(',', '.'));
  const valid = value.trim() !== '' && !isNaN(parsed);

  const confirm = () => {
    if (!valid) return;
    onConfirm(parsed);
    onClose();
  };

  return (
    <OverlayModal visible={visible} onClose={onClose} position="center">
      <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>
        Новый остаток ({currencySymbol})
      </Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        keyboardType="decimal-pad"
        autoFocus
        placeholder="0"
        placeholderTextColor={theme.accent}
        style={{
          backgroundColor: theme.buttonBg,
          borderRadius: 14,
          padding: 12,
          fontSize: 18,
          fontWeight: '700',
          color: theme.text,
        }}
      />
      <ModalButtonRow onCancel={onClose} onConfirm={confirm} confirmEnabled={valid} />
    </OverlayModal>
  );
}
