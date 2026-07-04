import type { ViewStyle } from 'react-native';

/** Instant press feedback (dim + shrink) for any Pressable's functional `style` prop:
 * style={(state) => [baseStyle, withPressFeedback(state.pressed)]} */
export function withPressFeedback(pressed: boolean, disabled?: boolean): ViewStyle | undefined {
  if (!pressed || disabled) return undefined;
  return { opacity: 0.75, transform: [{ scale: 0.96 }] };
}
