import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';

interface Props {
  activeScreen: 'counter' | 'history';
  onSelectCounter: () => void;
  onSelectHistory: () => void;
  onOpenSettings: () => void;
}

export function PillHeader({ activeScreen, onSelectCounter, onSelectHistory, onOpenSettings }: Props) {
  const { theme: themeName } = useSettings();
  const theme = getTheme(themeName);
  const isCounter = activeScreen === 'counter';

  return (
    <View style={styles.header}>
      <View style={[styles.pill, { backgroundColor: theme.buttonBg }]}>
        <Pressable
          onPress={onSelectCounter}
          style={[styles.segment, { backgroundColor: isCounter ? theme.accent : 'transparent' }]}
        >
          <Text style={[styles.segmentText, { color: isCounter ? theme.text : theme.accent }]}>
            Счётчик
          </Text>
        </Pressable>
        <Pressable
          onPress={onSelectHistory}
          style={[styles.segment, { backgroundColor: !isCounter ? theme.accent : 'transparent' }]}
        >
          <Text style={[styles.segmentText, { color: !isCounter ? theme.text : theme.accent }]}>
            История
          </Text>
        </Pressable>
      </View>
      <Pressable onPress={onOpenSettings} style={styles.gear}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={3} stroke={theme.text} strokeWidth={1.8} />
          <Path
            d="M19.4 13a7.9 7.9 0 000-2l2-1.5-2-3.4-2.4.6a8 8 0 00-1.7-1L15 3h-4l-.3 2.7a8 8 0 00-1.7 1l-2.4-.6-2 3.4L6.6 11a7.9 7.9 0 000 2l-2 1.5 2 3.4 2.4-.6a8 8 0 001.7 1L11 21h4l.3-2.7a8 8 0 001.7-1l2.4.6 2-3.4-2-1.5z"
            stroke={theme.text}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>
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
