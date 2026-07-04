import React, { useRef } from 'react';
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { pressedShade } from '../utils/color';

interface Props extends Omit<PressableProps, 'style'> {
  /** Full visual + layout style, same as you'd pass to a plain Pressable — this component
   * splits it internally (see STRUCTURAL_KEYS below) so the animated background still fills
   * padding/rounded corners correctly instead of just the inside of the padding box. */
  style?: StyleProp<ViewStyle>;
  /** Resting background color to animate from/to. Required so the press color has a base
   * to shade — pass 'transparent' plus an explicit `pressedColor` for icon-only buttons. */
  bg: string;
  /** Override for the pressed-state color; defaults to an auto-computed lighten/darken of `bg`. */
  pressedColor?: string;
  /** Also apply a slight scale-down on press (used sparingly, e.g. the history "+ add name" button). */
  scaleOnPress?: boolean;
  children?: React.ReactNode;
}

// Sizing/positioning props must stay on the outer Pressable — the inner animated view
// always fills it via flex:1, so anything about *placement within the parent* belongs here.
const STRUCTURAL_KEYS = new Set([
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'position',
  'top',
  'left',
  'right',
  'bottom',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'aspectRatio',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
]);

function splitStyle(style: StyleProp<ViewStyle>): { outer: ViewStyle; inner: ViewStyle } {
  const flat = (StyleSheet.flatten(style) || {}) as Record<string, unknown>;
  const outer: Record<string, unknown> = {};
  const inner: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(flat)) {
    (STRUCTURAL_KEYS.has(k) ? outer : inner)[k] = v;
  }
  return { outer: outer as ViewStyle, inner: inner as ViewStyle };
}

export function AnimatedPressable({
  style,
  bg,
  pressedColor,
  scaleOnPress,
  children,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const { outer, inner } = splitStyle(style);
  // flex:1 only makes sense on the inner view when the outer Pressable has a *definite*
  // height of its own (explicit height, or absolute positioning with both edges pinned) —
  // otherwise Pressable's own height is derived FROM its child, and a flex:1 child in that
  // circular situation collapses to zero size (this is what made button/tab text vanish).
  // With no definite outer height, the inner view should just size to its own content,
  // exactly like the Pressable would have without this wrapper.
  const hasDefiniteHeight = 'height' in outer || ('top' in outer && 'bottom' in outer);

  const handlePressIn = (e: GestureResponderEvent) => {
    if (!disabled) {
      Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: false }).start();
    }
    onPressIn?.(e);
  };
  const handlePressOut = (e: GestureResponderEvent) => {
    Animated.timing(anim, { toValue: 0, duration: 150, useNativeDriver: false }).start();
    onPressOut?.(e);
  };

  const toColor = pressedColor ?? (bg === 'transparent' ? bg : pressedShade(bg));
  const backgroundColor = anim.interpolate({ inputRange: [0, 1], outputRange: [bg, toColor] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] });

  return (
    <Pressable disabled={disabled} onPressIn={handlePressIn} onPressOut={handlePressOut} style={outer} {...rest}>
      <Animated.View
        style={[
          inner,
          { alignSelf: 'stretch', backgroundColor },
          hasDefiniteHeight ? { flex: 1 } : null,
          scaleOnPress ? { transform: [{ scale }] } : null,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
