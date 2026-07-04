import React from 'react';
import { Pressable, Text } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';
import { withPressFeedback } from '../utils/pressedFeedback';
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
      <Pressable
        onPress={onEdit}
        style={(state) => [
          { padding: 16, borderRadius: 14, backgroundColor: theme.buttonBg, alignItems: 'center' },
          withPressFeedback(state.pressed),
        ]}
      >
        <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>Изменить</Text>
      </Pressable>
      {!isProtectedStart && (
        <Pressable
          onPress={onDelete}
          style={(state) => [
            { padding: 16, borderRadius: 14, backgroundColor: theme.buttonBg, alignItems: 'center' },
            withPressFeedback(state.pressed),
          ]}
        >
          <Text style={{ color: theme.red, fontWeight: '700', fontSize: 15 }}>Удалить</Text>
        </Pressable>
      )}
    </OverlayModal>
  );
}
