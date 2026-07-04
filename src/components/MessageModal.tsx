import React from 'react';
import { Text } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';
import { AnimatedPressable } from './AnimatedPressable';
import { OverlayModal } from './OverlayModal';

interface Props {
  visible: boolean;
  message: string;
  onClose: () => void;
}

/** A single centered message with an "Ок" button — used for one-off notices like the
 * balance-overflow joke messages. */
export function MessageModal({ visible, message, onClose }: Props) {
  const { theme: themeName } = useSettings();
  const theme = getTheme(themeName);

  return (
    <OverlayModal visible={visible} onClose={onClose} position="center">
      <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
        {message}
      </Text>
      <AnimatedPressable
        onPress={onClose}
        bg={theme.green}
        style={{ padding: 14, borderRadius: 14, alignItems: 'center' }}
      >
        <Text style={{ color: theme.background, fontWeight: '700', fontSize: 15 }}>Ок</Text>
      </AnimatedPressable>
    </OverlayModal>
  );
}
