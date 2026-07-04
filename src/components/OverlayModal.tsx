import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  position?: 'center' | 'bottom';
  children: React.ReactNode;
}

/** Shared overlay chrome for all popups: tap-outside-to-dismiss, themed card, center or bottom-sheet layout. */
export function OverlayModal({ visible, onClose, position = 'center', children }: Props) {
  const { theme: themeName } = useSettings();
  const theme = getTheme(themeName);
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[
          styles.overlay,
          { backgroundColor: theme.overlay },
          position === 'bottom' ? styles.overlayBottom : styles.overlayCenter,
        ]}
        onPress={onClose}
      >
        {/* Absorbs the touch so tapping the card doesn't bubble to the dismiss handler above.
            Needs an explicit width — without it, this wrapper shrink-wraps to content size,
            which starves the card's width:'100%' below (percentage-of-undefined collapses). */}
        <Pressable onPress={() => {}} style={styles.fullWidth}>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.background },
              position === 'bottom'
                ? [styles.cardBottom, { paddingBottom: 20 + insets.bottom }]
                : styles.cardCenter,
            ]}
          >
            {position === 'bottom' ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.bottomContent}
              >
                {children}
              </ScrollView>
            ) : (
              children
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  overlayCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  overlayBottom: {
    justifyContent: 'flex-end',
  },
  fullWidth: {
    width: '100%',
  },
  card: {
    gap: 14,
  },
  bottomContent: {
    gap: 14,
  },
  cardCenter: {
    width: '100%',
    borderRadius: 20,
    padding: 22,
  },
  cardBottom: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
});
