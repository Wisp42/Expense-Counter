import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { CurrencyInputModal } from '../components/CurrencyInputModal';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';

const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 1.1;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SettingsScreen({ visible, onClose }: Props) {
  const { theme: themeName, setTheme, currencySymbol, roundBalance, setRoundBalance } = useSettings();
  const theme = getTheme(themeName);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const { height: screenHeight } = useWindowDimensions();

  const translateY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(0);

  useEffect(() => {
    if (visible) translateY.setValue(0);
  }, [visible, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        scrollY.current <= 0 && gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_evt, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dy > CLOSE_DISTANCE || gesture.vy > CLOSE_VELOCITY) {
          Animated.timing(translateY, {
            toValue: screenHeight,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
        }
      },
    })
  ).current;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = e.nativeEvent.contentOffset.y;
  };

  const isDark = themeName === 'dark';

  return (
    <Animated.View style={[styles.screen, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <View style={[styles.grabber, { backgroundColor: theme.accent }]} />
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>Настройки</Text>
            <AnimatedPressable onPress={onClose} bg={theme.buttonBg} style={styles.closeBtn}>
              <Text style={{ color: theme.accent, fontWeight: '700', fontSize: 16 }}>×</Text>
            </AnimatedPressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} onScroll={onScroll} scrollEventThrottle={16}>
          <View style={[styles.card, { backgroundColor: theme.buttonBg }]}>
            <Text style={[styles.cardLabel, { color: theme.accent }]}>Световая тема</Text>
            <View style={styles.themeRow}>
              <ThemeChip
                label="Светлая"
                active={!isDark}
                theme={theme}
                onPress={() => setTheme('light')}
              />
              <ThemeChip label="Тёмная" active={isDark} theme={theme} onPress={() => setTheme('dark')} />
            </View>
          </View>

          <AnimatedPressable
            onPress={() => setCurrencyModalVisible(true)}
            bg={theme.buttonBg}
            style={[styles.card, styles.rowCard]}
          >
            <View>
              <Text style={[styles.cardLabel, { color: theme.accent }]}>Символ валюты</Text>
              <Text style={[styles.rowValue, { color: theme.text }]}>{currencySymbol}</Text>
            </View>
            <Text style={{ color: theme.accent, fontWeight: '700' }}>Изменить</Text>
          </AnimatedPressable>

          <View style={[styles.card, styles.rowCard, { backgroundColor: theme.buttonBg }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardLabel, { color: theme.accent }]}>Округление баланса</Text>
              <Text style={[styles.rowHint, { color: theme.text }]}>
                {roundBalance ? 'До целых' : 'С копейками/центами'}
              </Text>
            </View>
            <Switch
              value={roundBalance}
              onValueChange={setRoundBalance}
              trackColor={{ true: theme.green, false: theme.accent }}
              thumbColor={theme.background}
            />
          </View>

          <View style={[styles.card, { backgroundColor: theme.buttonBg, opacity: 0.6 }]}>
            <Text style={[styles.cardLabel, { color: theme.accent }]}>Уведомления</Text>
            <View style={styles.rowCard}>
              <Text style={[styles.rowHint, { color: theme.text }]}>Напоминания о тратах</Text>
              <Switch value={false} disabled trackColor={{ true: theme.green, false: theme.accent }} />
            </View>
          </View>
        </ScrollView>

        <CurrencyInputModal visible={currencyModalVisible} onClose={() => setCurrencyModalVisible(false)} />
      </SafeAreaView>
    </Animated.View>
  );
}

function ThemeChip({
  label,
  active,
  theme,
  onPress,
}: {
  label: string;
  active: boolean;
  theme: ReturnType<typeof getTheme>;
  onPress: () => void;
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      bg={active ? theme.accent : theme.buttonBg}
      style={[styles.chip, { borderColor: theme.accent }]}
    >
      <Text style={{ color: active ? theme.text : theme.accent, fontWeight: '700', fontSize: 14 }}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 999,
    opacity: 0.5,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  rowHint: {
    fontSize: 15,
    fontWeight: '600',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1.4,
  },
});
