import React from 'react';
import { Text, View } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';
import { AnimatedPressable } from './AnimatedPressable';

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmEnabled: boolean;
}

export function ModalButtonRow({ onCancel, onConfirm, confirmLabel = 'Сохранить', confirmEnabled }: Props) {
  const { theme: themeName } = useSettings();
  const theme = getTheme(themeName);
  const confirmBg = confirmEnabled ? theme.green : theme.buttonBg;

  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <AnimatedPressable
        onPress={onCancel}
        bg={theme.buttonBg}
        style={{ flex: 1, padding: 12, borderRadius: 14, alignItems: 'center' }}
      >
        <Text style={{ color: theme.accent, fontWeight: '700' }}>Отмена</Text>
      </AnimatedPressable>
      <AnimatedPressable
        onPress={onConfirm}
        disabled={!confirmEnabled}
        bg={confirmBg}
        style={{ flex: 1, padding: 12, borderRadius: 14, alignItems: 'center' }}
      >
        <Text style={{ color: confirmEnabled ? theme.background : theme.accent, fontWeight: '700' }}>
          {confirmLabel}
        </Text>
      </AnimatedPressable>
    </View>
  );
}
