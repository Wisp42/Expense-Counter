import React from 'react';
import { Text } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';
import { AnimatedPressable } from './AnimatedPressable';
import { OverlayModal } from './OverlayModal';

interface Props {
  visible: boolean;
  isProtectedStart: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ActionSheetModal({ visible, isProtectedStart, onClose, onEdit, onDelete }: Props) {
  const { theme: themeName } = useSettings();
  const theme = getTheme(themeName);

  return (
    <OverlayModal visible={visible} onClose={onClose} position="bottom">
      <AnimatedPressable
        onPress={onEdit}
        bg={theme.buttonBg}
        style={{ padding: 22, borderRadius: 14, alignItems: 'center' }}
      >
        <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>Изменить</Text>
      </AnimatedPressable>
      {!isProtectedStart && (
        <AnimatedPressable
          onPress={onDelete}
          bg={theme.buttonBg}
          style={{ padding: 22, borderRadius: 14, alignItems: 'center' }}
        >
          <Text style={{ color: theme.red, fontWeight: '700', fontSize: 15 }}>Удалить</Text>
        </AnimatedPressable>
      )}
    </OverlayModal>
  );
}
