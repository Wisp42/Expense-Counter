import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';
import { AnimatedPressable } from './AnimatedPressable';

interface Props {
  progress: Animated.AnimatedInterpolation<number>;
  settingsOpen: boolean;
  onSelectCounter: () => void;
  onSelectHistory: () => void;
  onOpenSettings: () => void;
}

export function PillHeader({ progress, settingsOpen, onSelectCounter, onSelectHistory, onOpenSettings }: Props) {
  const { theme: themeName } = useSettings();
  const theme = getTheme(themeName);
  const gearRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(gearRotate, {
      toValue: settingsOpen ? 1 : 0,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [settingsOpen, gearRotate]);

  const gearRotateDeg = gearRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

  const counterBgOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0], extrapolate: 'clamp' });
  const historyBgOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' });
  const counterTextColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.text, theme.accent],
  }) as unknown as string;
  const historyTextColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.accent, theme.text],
  }) as unknown as string;
  const pressTint = theme.text + '14';

  return (
    <View style={styles.header}>
      <View style={[styles.pill, { backgroundColor: theme.buttonBg }]}>
        <AnimatedPressable onPress={onSelectCounter} style={styles.segment} bg="transparent" pressedColor={pressTint}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: theme.accent, borderRadius: 999, opacity: counterBgOpacity },
            ]}
          />
          <Animated.Text style={[styles.segmentText, { color: counterTextColor }]}>Счётчик</Animated.Text>
        </AnimatedPressable>
        <AnimatedPressable onPress={onSelectHistory} style={styles.segment} bg="transparent" pressedColor={pressTint}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: theme.accent, borderRadius: 999, opacity: historyBgOpacity },
            ]}
          />
          <Animated.Text style={[styles.segmentText, { color: historyTextColor }]}>История</Animated.Text>
        </AnimatedPressable>
      </View>
      <AnimatedPressable onPress={onOpenSettings} style={styles.gear} bg="transparent" pressedColor={theme.buttonBg}>
        <Animated.View style={{ transform: [{ rotate: gearRotateDeg }] }}>
          <Feather name="settings" size={20} color={theme.text} />
        </Animated.View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  pill: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 4,
    gap: 2,
  },
  segment: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  gear: {
    position: 'absolute',
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
