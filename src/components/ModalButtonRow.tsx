import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';
import { withPressFeedback } from '../utils/pressedFeedback';

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmEnabled: boolean;
}

export function ModalButtonRow({ onCancel, onConfirm, confirmLabel = 'Сохранить', confirmEnabled }: Props) {
  const { theme: themeName } = useSettings();
  const theme = getTheme(themeName);

  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Pressable
        onPress={onCancel}
        style={(state) => [
          { flex: 1, padding: 12, borderRadius: 14, backgroundColor: theme.buttonBg, alignItems: 'center' },
          withPressFeedback(state.pressed),
        ]}
      >
        <Text style={{ color: theme.accent, fontWeight: '700' }}>Отмена</Text>
      </Pressable>
      <Pressable
        onPress={onConfirm}
        disabled={!confirmEnabled}
        style={(state) => [
          {
            flex: 1,
            padding: 12,
            borderRadius: 14,
            backgroundColor: confirmEnabled ? theme.green : theme.buttonBg,
            alignItems: 'center',
          },
          withPressFeedback(state.pressed, !confirmEnabled),
        ]}
      >
        <Text style={{ color: confirmEnabled ? theme.background : theme.accent, fontWeight: '700' }}>
          {confirmLabel}
        </Text>
      </Pressable>
    </View>
  );
}
