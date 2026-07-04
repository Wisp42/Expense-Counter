import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';
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
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          onPress={onClose}
          style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: theme.buttonBg, alignItems: 'center' }}
        >
          <Text style={{ color: theme.accent, fontWeight: '700' }}>Отмена</Text>
        </Pressable>
        <Pressable
          onPress={confirm}
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
