import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { CurrencyInputModal } from '../components/CurrencyInputModal';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';

interface Props {
  onClose: () => void;
}

export function SettingsScreen({ onClose }: Props) {
  const { theme: themeName, setTheme, currencySymbol, roundBalance, setRoundBalance } = useSettings();
  const theme = getTheme(themeName);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const isDark = themeName === 'dark';

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Настройки</Text>
        <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.buttonBg }]}>
          <Text style={{ color: theme.accent, fontWeight: '700', fontSize: 16 }}>×</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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

        <Pressable
          onPress={() => setCurrencyModalVisible(true)}
          style={[styles.card, styles.rowCard, { backgroundColor: theme.buttonBg }]}
        >
          <View>
            <Text style={[styles.cardLabel, { color: theme.accent }]}>Символ валюты</Text>
            <Text style={[styles.rowValue, { color: theme.text }]}>{currencySymbol}</Text>
          </View>
          <Text style={{ color: theme.accent, fontWeight: '700' }}>Изменить</Text>
        </Pressable>

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
    </View>
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
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? theme.accent : 'transparent', borderColor: theme.accent },
      ]}
    >
      <Text style={{ color: active ? theme.text : theme.accent, fontWeight: '700', fontSize: 14 }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
