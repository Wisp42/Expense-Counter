import React, { useEffect, useState } from 'react';
import { Text, TextInput } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';
import { ModalButtonRow } from './ModalButtonRow';
import { OverlayModal } from './OverlayModal';

const IS_NUMERIC = /^-?\d+([.,]\d+)?$/;

interface Props {
  visible: boolean;
  onClose: () => void;
}

/** Long-press on the currency symbol (also reachable from Settings): free-text currency label. */
export function CurrencyInputModal({ visible, onClose }: Props) {
  const { theme: themeName, currencySymbol, setCurrencySymbol } = useSettings();
  const theme = getTheme(themeName);
  const [value, setValue] = useState(currencySymbol);

  useEffect(() => {
    if (visible) setValue(currencySymbol);
  }, [visible, currencySymbol]);

  const trimmed = value.trim();
  const valid = trimmed !== '' && !IS_NUMERIC.test(trimmed);

  const confirm = () => {
    if (!valid) return;
    setCurrencySymbol(trimmed);
    onClose();
  };

  return (
    <OverlayModal visible={visible} onClose={onClose} position="center">
      <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>Символ валюты</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        autoFocus
        placeholder="$"
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
      {!valid && trimmed !== '' && (
        <Text style={{ fontSize: 12, color: theme.red }}>Валюта — это текст, а не число</Text>
      )}
      <ModalButtonRow onCancel={onClose} onConfirm={confirm} confirmEnabled={valid} />
    </OverlayModal>
  );
}
