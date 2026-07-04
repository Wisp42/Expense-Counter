import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { AnimatedTextInput } from '../components/AnimatedTextInput';
import { CurrencyInputModal } from '../components/CurrencyInputModal';
import { ManualBalanceModal } from '../components/ManualBalanceModal';
import { MessageModal } from '../components/MessageModal';
import { Numpad } from '../components/Numpad';
import { subscribeDbChange } from '../db/dbEvents';
import { getBalance, insertDeal, insertManualTotal } from '../db/transactions';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';
import { formatBalance, MAX_DISPLAY_BALANCE } from '../utils/format';

const MAX_INTEGER_DIGITS = 12;
const BASE_BALANCE_FONT_SIZE = 44;
const BLOCK_HORIZONTAL_PADDING = 20;

export function CounterScreen() {
  const { theme: themeName, currencySymbol, roundBalance } = useSettings();
  const theme = getTheme(themeName);

  const [balance, setBalance] = useState(0);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'subtract' | 'add'>('subtract');
  const [txnName, setTxnName] = useState('');
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [overflowMessage, setOverflowMessage] = useState<string | null>(null);
  const warnedForBalanceRef = useRef<number | null>(null);

  const [blockWidth, setBlockWidth] = useState(0);
  const [naturalTextWidth, setNaturalTextWidth] = useState(0);

  const refreshBalance = useCallback(() => {
    getBalance().then(setBalance);
  }, []);

  useEffect(() => {
    refreshBalance();
    return subscribeDbChange(refreshBalance);
  }, [refreshBalance]);

  const isOverflow = Math.abs(balance) > MAX_DISPLAY_BALANCE;

  useEffect(() => {
    if (isOverflow && warnedForBalanceRef.current !== balance) {
      warnedForBalanceRef.current = balance;
      setOverflowMessage(
        balance > 0 ? 'Даже у Илона Маска нету столько' : 'Это больше внешнего долга США'
      );
    }
  }, [isOverflow, balance]);

  const handleBlockLayout = (e: LayoutChangeEvent) => {
    setBlockWidth(e.nativeEvent.layout.width);
  };

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

  const balanceText = isOverflow ? '—' : formatBalance(balance, roundBalance);
  const availableWidth = Math.max(0, blockWidth - BLOCK_HORIZONTAL_PADDING * 2);
  const fontScale =
    availableWidth > 0 && naturalTextWidth > availableWidth ? availableWidth / naturalTextWidth : 1;
  const balanceFontSize = BASE_BALANCE_FONT_SIZE * fontScale;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.counterBlock} onLayout={handleBlockLayout}>
        {/* Invisible twin of the balance+currency text, rendered at the base font size, purely
            to measure how wide it *would* be — that width drives the shrink-to-fit scale below
            (RN's adjustsFontSizeToFit can't span two separately-pressable Text elements). */}
        <Text
          style={[styles.balance, styles.measure, { fontSize: BASE_BALANCE_FONT_SIZE }]}
          onLayout={(e) => setNaturalTextWidth(e.nativeEvent.layout.width)}
          numberOfLines={1}
          pointerEvents="none"
        >
          {balanceText} {currencySymbol}
        </Text>
        <View style={styles.balanceRow}>
          <AnimatedPressable
            onLongPress={() => setManualModalVisible(true)}
            bg="transparent"
            scaleOnPress
            style={styles.balancePressable}
          >
            <Text style={[styles.balance, { color: theme.text, fontSize: balanceFontSize }]}>
              {balanceText}
            </Text>
          </AnimatedPressable>
          <Text style={[styles.balance, { color: theme.text, fontSize: balanceFontSize }]}> </Text>
          <AnimatedPressable
            onLongPress={() => setCurrencyModalVisible(true)}
            bg="transparent"
            scaleOnPress
            style={styles.balancePressable}
          >
            <Text style={[styles.balance, { color: theme.text, fontSize: balanceFontSize }]}>
              {currencySymbol}
            </Text>
          </AnimatedPressable>
        </View>
        <Text style={[styles.inputPreview, { color: inputColor }]}>{inputDisplay}</Text>
      </View>

      <View style={styles.nameFieldWrap}>
        <AnimatedTextInput
          value={txnName}
          onChangeText={setTxnName}
          placeholder="Название операции (необязательно)"
          placeholderTextColor={theme.accent}
          bg={theme.buttonBg}
          style={[styles.nameField, { color: theme.text }]}
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
      <MessageModal
        visible={overflowMessage !== null}
        message={overflowMessage ?? ''}
        onClose={() => setOverflowMessage(null)}
      />
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
  balancePressable: {
    flexDirection: 'row',
  },
  balance: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  measure: {
    position: 'absolute',
    opacity: 0,
    // An absolutely-positioned node with no left/right pair still gets its parent's width
    // used as an AT_MOST measurement constraint on some Yoga/Android builds, which silently
    // wraps this "unbounded" probe text and reports a too-small width (so the shrink logic
    // never kicks in). A generous explicit maxWidth overrides that constraint so this always
    // measures the text's true single-line width.
    maxWidth: 4000,
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
