import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CurrencyInputModal } from '../components/CurrencyInputModal';
import { ManualBalanceModal } from '../components/ManualBalanceModal';
import { Numpad } from '../components/Numpad';
import { subscribeDbChange } from '../db/dbEvents';
import { getBalance, insertDeal, insertManualTotal } from '../db/transactions';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';
import { formatBalance } from '../utils/format';

const MAX_INTEGER_DIGITS = 12;

export function CounterScreen() {
  const { theme: themeName, currencySymbol, roundBalance } = useSettings();
  const theme = getTheme(themeName);

  const [balance, setBalance] = useState(0);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'subtract' | 'add'>('subtract');
  const [txnName, setTxnName] = useState('');
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const refreshBalance = useCallback(() => {
    getBalance().then(setBalance);
  }, []);

  useEffect(() => {
    refreshBalance();
    return subscribeDbChange(refreshBalance);
  }, [refreshBalance]);

  const appendDigit = (d: string) => {
    setInput((prev) => {
      if (prev === '0') return d;
      const dotIdx = prev.indexOf('.');
      if (dotIdx !== -1 && prev.length - dotIdx - 1 >= 2) return prev;
      if (dotIdx === -1 && prev.length >= MAX_INTEGER_DIGITS) return prev;
      return prev + d;
    });
  };

  const pressDot = () => {
    setInput((prev) => {
      if (prev.includes('.')) return prev;
      return (prev === '' ? '0' : prev) + '.';
    });
  };

  const backspace = () => setInput((prev) => prev.slice(0, -1));

  const toggleMode = () => setMode((m) => (m === 'subtract' ? 'add' : 'subtract'));

  const parsedInput = parseFloat(input);
  const commitEnabled = input !== '' && !isNaN(parsedInput) && parsedInput !== 0;

  const commit = async () => {
    if (!commitEnabled) return;
    const amount = mode === 'subtract' ? -parsedInput : parsedInput;
    await insertDeal(amount, txnName);
    setInput('');
    setTxnName('');
  };

  const inputColor = input === '' ? theme.accent : mode === 'subtract' ? theme.red : theme.green;
  const inputDisplay = input === '' ? '0' : (mode === 'subtract' ? '-' : '+') + input;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.counterBlock}>
        <View style={styles.balanceRow}>
          <Pressable onLongPress={() => setManualModalVisible(true)}>
            <Text style={[styles.balance, { color: theme.text }]}>
              {formatBalance(balance, roundBalance)}
            </Text>
          </Pressable>
          <Text style={[styles.balance, { color: theme.text }]}> </Text>
          <Pressable onLongPress={() => setCurrencyModalVisible(true)}>
            <Text style={[styles.balance, { color: theme.text }]}>{currencySymbol}</Text>
          </Pressable>
        </View>
        <Text style={[styles.inputPreview, { color: inputColor }]}>{inputDisplay}</Text>
      </View>

      <View style={styles.nameFieldWrap}>
        <TextInput
          value={txnName}
          onChangeText={setTxnName}
          placeholder="Название операции (необязательно)"
          placeholderTextColor={theme.accent}
          style={[styles.nameField, { backgroundColor: theme.buttonBg, color: theme.text }]}
        />
      </View>

      <View style={styles.numpadWrap}>
        <Numpad
          onDigit={appendDigit}
          onDot={pressDot}
          onBackspace={backspace}
          onToggleMode={toggleMode}
          onCommit={commit}
          mode={mode}
          commitEnabled={commitEnabled}
        />
      </View>

      <ManualBalanceModal
        visible={manualModalVisible}
        currentBalance={balance}
        onClose={() => setManualModalVisible(false)}
        onConfirm={(amount) => {
          insertManualTotal(amount);
        }}
      />
      <CurrencyInputModal visible={currencyModalVisible} onClose={() => setCurrencyModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  counterBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  balance: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  inputPreview: {
    fontSize: 22,
    fontWeight: '700',
    minHeight: 28,
  },
  nameFieldWrap: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  nameField: {
    width: '100%',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  numpadWrap: {
    height: '50%',
    paddingHorizontal: 20,
    paddingBottom: 26,
  },
});
