import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AnimatedPressable } from './AnimatedPressable';
import { useSettings } from '../settings/SettingsContext';
import { getTheme } from '../theme/theme';

interface Props {
  onDigit: (d: string) => void;
  onDot: () => void;
  onBackspace: () => void;
  onToggleMode: () => void;
  onCommit: () => void;
  mode: 'subtract' | 'add';
  commitEnabled: boolean;
}

const GAP = 12;
const COLS = 4;
const ROWS = 4;

interface Cell {
  col: number;
  row: number;
  colSpan?: number;
  rowSpan?: number;
}

function rect(size: { width: number; height: number }, cell: Cell) {
  const cellW = (size.width - GAP * (COLS - 1)) / COLS;
  const cellH = (size.height - GAP * (ROWS - 1)) / ROWS;
  const colSpan = cell.colSpan ?? 1;
  const rowSpan = cell.rowSpan ?? 1;
  return {
    position: 'absolute' as const,
    left: cell.col * (cellW + GAP),
    top: cell.row * (cellH + GAP),
    width: cellW * colSpan + GAP * (colSpan - 1),
    height: cellH * rowSpan + GAP * (rowSpan - 1),
  };
}

export function Numpad({ onDigit, onDot, onBackspace, onToggleMode, onCommit, mode, commitEnabled }: Props) {
  const { theme: themeName } = useSettings();
  const theme = getTheme(themeName);
  const spin = useRef(new Animated.Value(mode === 'subtract' ? 0 : 1)).current;
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    Animated.timing(spin, {
      toValue: mode === 'subtract' ? 0 : 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [mode, spin]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  if (size.width === 0) {
    return <View style={styles.grid} onLayout={onLayout} />;
  }

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const modeColor = mode === 'subtract' ? theme.red : theme.green;
  const enterBg = commitEnabled ? (mode === 'subtract' ? theme.red : theme.green) : theme.buttonBg;

  return (
    <View style={styles.grid} onLayout={onLayout}>
      <Key style={rect(size, { col: 0, row: 0 })} bg={theme.buttonBg} onPress={() => onDigit('7')}>
        <Text style={[styles.keyText, { color: theme.text }]}>7</Text>
      </Key>
      <Key style={rect(size, { col: 1, row: 0 })} bg={theme.buttonBg} onPress={() => onDigit('8')}>
        <Text style={[styles.keyText, { color: theme.text }]}>8</Text>
      </Key>
      <Key style={rect(size, { col: 2, row: 0 })} bg={theme.buttonBg} onPress={() => onDigit('9')}>
        <Text style={[styles.keyText, { color: theme.text }]}>9</Text>
      </Key>
      <Key style={rect(size, { col: 3, row: 0 })} bg={theme.buttonBg} onPress={onToggleMode}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            {/* Base-up / apex-down at rest (mode=subtract, red); 180° rotation flips it to
                base-down / apex-up for mode=add (green), matching the two-triangle spec.
                Vertices are placed equidistant (r=10) from the view's rotation pivot (12,12)
                so the spin reads as rotating around the triangle's own center, not its apex —
                an off-center pivot made it look like it spun around the bottom vertex. */}
            <Path d="M4 6h16L12 22z" fill={modeColor} />
          </Svg>
        </Animated.View>
      </Key>

      <Key style={rect(size, { col: 0, row: 1 })} bg={theme.buttonBg} onPress={() => onDigit('4')}>
        <Text style={[styles.keyText, { color: theme.text }]}>4</Text>
      </Key>
      <Key style={rect(size, { col: 1, row: 1 })} bg={theme.buttonBg} onPress={() => onDigit('5')}>
        <Text style={[styles.keyText, { color: theme.text }]}>5</Text>
      </Key>
      <Key style={rect(size, { col: 2, row: 1 })} bg={theme.buttonBg} onPress={() => onDigit('6')}>
        <Text style={[styles.keyText, { color: theme.text }]}>6</Text>
      </Key>
      <Key style={rect(size, { col: 3, row: 1 })} bg={theme.buttonBg} onPress={onBackspace}>
        <Svg width={22} height={16} viewBox="0 0 24 18" fill="none">
          <Path
            d="M8 1h14a1 1 0 011 1v14a1 1 0 01-1 1H8L1 9l7-8z"
            stroke={theme.text}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <Path d="M11 6l6 6M17 6l-6 6" stroke={theme.text} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      </Key>

      <Key style={rect(size, { col: 0, row: 2 })} bg={theme.buttonBg} onPress={() => onDigit('1')}>
        <Text style={[styles.keyText, { color: theme.text }]}>1</Text>
      </Key>
      <Key style={rect(size, { col: 1, row: 2 })} bg={theme.buttonBg} onPress={() => onDigit('2')}>
        <Text style={[styles.keyText, { color: theme.text }]}>2</Text>
      </Key>
      <Key style={rect(size, { col: 2, row: 2 })} bg={theme.buttonBg} onPress={() => onDigit('3')}>
        <Text style={[styles.keyText, { color: theme.text }]}>3</Text>
      </Key>
      <Key style={rect(size, { col: 3, row: 2, rowSpan: 2 })} bg={enterBg} onPress={onCommit}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 5v6a3 3 0 01-3 3H6"
            stroke={theme.background}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M9.5 10.5L5 14l4.5 3.5"
            stroke={theme.background}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Key>

      <Key style={rect(size, { col: 0, row: 3, colSpan: 2 })} bg={theme.buttonBg} onPress={() => onDigit('0')}>
        <Text style={[styles.keyText, { color: theme.text }]}>0</Text>
      </Key>
      <Key style={rect(size, { col: 2, row: 3 })} bg={theme.buttonBg} onPress={onDot}>
        <Text style={[styles.keyText, { color: theme.text }]}>.</Text>
      </Key>
    </View>
  );
}

function Key({
  children,
  onPress,
  style,
  bg,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style: object;
  bg: string;
}) {
  return (
    <AnimatedPressable onPress={onPress} style={[style, styles.key]} bg={bg}>
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
  },
  key: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
  },
});
